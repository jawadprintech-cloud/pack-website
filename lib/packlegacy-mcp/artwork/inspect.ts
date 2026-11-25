import { createHash } from "node:crypto";
import { inflateSync } from "node:zlib";
import { PDFArray, PDFDict, PDFDocument, PDFName, PDFNumber, PDFObject, PDFRef, PDFStream } from "pdf-lib";
import sharp from "sharp";
import { z } from "zod";
import { PdfDecodeLimitError, withBoundedPdfDecoding } from "./pdf-limits";

export const MAX_ARTWORK_BYTES = 2 * 1024 * 1024;
export const MAX_ARTWORK_PIXELS = 10_000_000;
export const MAX_PDF_PAGES = 100;
export const MAX_REPORTED_PDF_PAGES = 20;
const MAX_PDF_OBJECTS = 20_000;
const MAX_RESOURCE_RECORDS = 300;
const MAX_RESOURCE_DEPTH = 12;
const MAX_PNG_CHUNKS = 4096;
const MAX_PNG_EXPANDED_METADATA_BYTES = 1024 * 1024;

export class ArtworkInspectionError extends Error {
  constructor(readonly code: string, message: string) {
    super(message);
    this.name = "ArtworkInspectionError";
  }
}

export const artworkInspectionOptionsSchema = z.object({
  filename: z.string().trim().min(1).max(160).refine(value => !/[\\/\u0000-\u001f\u007f]/.test(value), "Use a filename, not a path.").optional(),
  print_width_mm: z.number().finite().min(0.001).max(10_000).optional(),
  print_height_mm: z.number().finite().min(0.001).max(10_000).optional(),
  min_effective_dpi: z.number().finite().positive().max(9600).optional(),
  min_bleed_mm: z.number().finite().min(0).max(100).optional(),
}).strict().superRefine((value, context) => {
  if ((value.print_width_mm === undefined) !== (value.print_height_mm === undefined)) {
    context.addIssue({ code: "custom", path: ["print_width_mm"], message: "Supply both print dimensions together, or omit both." });
  }
});
export type ArtworkInspectionOptions = z.infer<typeof artworkInspectionOptionsSchema>;

type Format = "pdf" | "png" | "jpeg";
type BoxSource = "explicit" | "inherited" | "default_media_box" | "default_crop_box";
interface Box {
  x_mm: number;
  y_mm: number;
  width_mm: number;
  height_mm: number;
  source: BoxSource;
}
interface Finding { code: string; message: string; page?: number; }
const round = (value: number) => Math.round(value * 10000) / 10000;
const label = (value: string) => value.replace(/[\u0000-\u001f\u007f]/g, " ").slice(0, 160);
const name = (object: PDFObject | undefined) => object instanceof PDFName ? label(object.decodeText()) : null;

function detectedFormat(bytes: Uint8Array): Format {
  if (bytes.length >= 8 && Buffer.from(bytes.subarray(0, 8)).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return "png";
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpeg";
  // Require the supported PDF header at byte zero; do not accept a prefix/polyglot.
  if (bytes.length >= 8 && Buffer.from(bytes.subarray(0, 5)).toString("ascii") === "%PDF-") return "pdf";
  throw new ArtworkInspectionError("UNSUPPORTED_FILE_TYPE", "Upload a PDF, PNG or JPEG file with a supported file signature.");
}

function validateFilename(filename: string | undefined, format: Format) {
  if (!filename) return;
  const ext = filename.split(".").pop()?.toLowerCase();
  const expected = ext === "jpg" || ext === "jpeg" ? "jpeg" : ext;
  if (filename.includes(".") && expected !== format) {
    throw new ArtworkInspectionError("FILE_TYPE_MISMATCH", "The filename extension does not match the detected file type.");
  }
}

function inspectFileBase(bytes: Uint8Array, options: ArtworkInspectionOptions, format: Format) {
  return {
    status: "inspected" as const,
    format,
    file: {
      filename: options.filename ?? null,
      size_bytes: bytes.byteLength,
      sha256: createHash("sha256").update(bytes).digest("hex"),
      mime_type: format === "pdf" ? "application/pdf" : "image/" + format,
    },
    profile: {
      source: "caller_supplied_thresholds_only",
      print_width_mm: options.print_width_mm ?? null,
      print_height_mm: options.print_height_mm ?? null,
      min_effective_dpi: options.min_effective_dpi ?? null,
      min_bleed_mm: options.min_bleed_mm ?? null,
      is_packlegacy_approved_profile: false,
    },
    production_approved: false,
    print_ready: null,
    stored: false,
  };
}

const crcTable = Uint32Array.from({ length: 256 }, (_, index) => {
  let crc = index;
  for (let bit = 0; bit < 8; bit++) crc = (crc & 1) ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  return crc >>> 0;
});
function pngCrc(bytes: Uint8Array) {
  let crc = 0xffffffff;
  for (const value of bytes) crc = crcTable[(crc ^ value) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

/**
 * libpng may ignore corrupt ancillary chunks. Check the complete PNG container
 * before allowing its metadata into a report. Pixel decoding still uses sharp.
 * Chunk layout/CRC: https://www.w3.org/TR/png-3/#5Chunk-layout
 */
function validatePngContainer(bytes: Buffer) {
  let offset = 8;
  let count = 0;
  let imageDataSeen = false;
  let imageDataEnded = false;
  let expandedMetadataBytes = 0;
  const invalid = () => new ArtworkInspectionError("INVALID_IMAGE", "The PNG has a damaged or unsupported chunk structure or checksum.");
  function checkCompressedMetadata(data: Buffer) {
    try {
      const expanded = inflateSync(data, { maxOutputLength: MAX_PNG_EXPANDED_METADATA_BYTES - expandedMetadataBytes + 1 });
      expandedMetadataBytes += expanded.length;
      if (expandedMetadataBytes > MAX_PNG_EXPANDED_METADATA_BYTES) throw new ArtworkInspectionError("IMAGE_METADATA_LIMIT", "The PNG compressed metadata exceeds the 1 MiB inspection limit.");
    } catch (error) {
      if (error instanceof ArtworkInspectionError) throw error;
      if (error instanceof Error && "code" in error && error.code === "ERR_BUFFER_TOO_LARGE") throw new ArtworkInspectionError("IMAGE_METADATA_LIMIT", "The PNG compressed metadata exceeds the 1 MiB inspection limit.");
      throw invalid();
    }
  }
  while (offset < bytes.length) {
    if (++count > MAX_PNG_CHUNKS) throw new ArtworkInspectionError("IMAGE_COMPLEXITY_LIMIT", "The PNG exceeds the 4096 chunk inspection limit.");
    if (offset + 12 > bytes.length) throw invalid();
    const length = bytes.readUInt32BE(offset);
    const end = offset + length + 12;
    if (end > bytes.length) throw invalid();
    const type = bytes.toString("ascii", offset + 4, offset + 8);
    const rawType = bytes.subarray(offset + 4, offset + 8);
    if (rawType.some(value => !((value >= 65 && value <= 90) || (value >= 97 && value <= 122))) || (rawType[2] & 32)) throw invalid();
    if (pngCrc(bytes.subarray(offset + 4, end - 4)) !== bytes.readUInt32BE(end - 4)) throw invalid();
    if (count === 1 && (type !== "IHDR" || length !== 13)) throw invalid();
    if (type === "IHDR" && count !== 1) throw invalid();
    if ((rawType[0] & 32) === 0 && !["IHDR", "PLTE", "IDAT", "IEND"].includes(type)) throw invalid();
    if (["acTL", "fcTL", "fdAT"].includes(type)) throw new ArtworkInspectionError("UNSUPPORTED_ANIMATION", "Animated PNG is not supported. Upload a single static artwork image.");
    if (type === "IDAT") {
      if (imageDataEnded) throw invalid();
      imageDataSeen = true;
    } else if (imageDataSeen) imageDataEnded = true;
    if (type === "iCCP" || type === "zTXt") {
      const data = bytes.subarray(offset + 8, end - 4);
      const separator = data.indexOf(0);
      if (separator < 1 || separator > 79 || data[separator + 1] !== 0 || separator + 2 >= data.length) throw invalid();
      checkCompressedMetadata(data.subarray(separator + 2));
    } else if (type === "iTXt") {
      const data = bytes.subarray(offset + 8, end - 4);
      const separator = data.indexOf(0);
      if (separator < 1 || separator > 79 || ![0, 1].includes(data[separator + 1]) || data[separator + 2] !== 0) throw invalid();
      const languageEnd = data.indexOf(0, separator + 3);
      const translatedEnd = languageEnd < 0 ? -1 : data.indexOf(0, languageEnd + 1);
      if (translatedEnd < 0) throw invalid();
      if (data[separator + 1] === 1) checkCompressedMetadata(data.subarray(translatedEnd + 1));
    }
    if (type === "IEND") {
      if (length !== 0 || !imageDataSeen || end !== bytes.length) throw invalid();
      return { crc_status: "checked_all_chunks", chunk_count: count };
    }
    offset = end;
  }
  throw invalid();
}

async function inspectRaster(bytes: Uint8Array, options: ArtworkInspectionOptions, format: "png" | "jpeg") {
  try {
    const buffer = Buffer.from(bytes);
    const pngIntegrity = format === "png" ? validatePngContainer(buffer) : null;
    const decoder = sharp(buffer, { failOn: "warning", limitInputPixels: MAX_ARTWORK_PIXELS, sequentialRead: true });
    const metadata = await decoder.metadata();
    if (metadata.format !== format || !metadata.width || !metadata.height) throw new Error("Invalid decoded type or dimensions.");
    if ((metadata.pages ?? 1) !== 1) throw new ArtworkInspectionError("UNSUPPORTED_ANIMATION", "Only a single static image is supported.");
    if (metadata.width * metadata.height > MAX_ARTWORK_PIXELS) throw new ArtworkInspectionError("PIXEL_LIMIT_EXCEEDED", "The image exceeds the 10 megapixel inspection limit.");
    // Metadata alone is not validation. Fully decode every bounded pixel to detect
    // truncated/corrupted image data, but do not return or save decoded pixels.
    await decoder.raw().toBuffer();
    const swap = [5, 6, 7, 8].includes(metadata.orientation ?? 1);
    const width = swap ? metadata.height : metadata.width;
    const height = swap ? metadata.width : metadata.height;
    const dpi = options.print_width_mm !== undefined && options.print_height_mm !== undefined ? {
      x: round(width * 25.4 / options.print_width_mm),
      y: round(height * 25.4 / options.print_height_mm),
      basis: "oriented_pixel_dimensions_divided_by_entered_print_size",
    } : null;
    const measuredMinimum = dpi ? Math.min(width * 25.4 / options.print_width_mm!, height * 25.4 / options.print_height_mm!) : null;
    const requestedAspect = options.print_width_mm !== undefined ? options.print_width_mm / options.print_height_mm! : null;
    const imageAspect = width / height;
    return {
      ...inspectFileBase(bytes, options, format),
      inspection_scope: "single_raster_image_full_decode_and_metadata",
      coverage: { page_count: 1, inspected_pages: 1, truncated: false },
      raster: {
        width_px: metadata.width,
        height_px: metadata.height,
        exif_orientation: metadata.orientation ?? null,
        oriented_width_px: width,
        oriented_height_px: height,
        channels: metadata.channels,
        colour_space: metadata.space,
        has_alpha_channel: metadata.hasAlpha,
        embedded_icc_profile_present: metadata.hasProfile,
        metadata_density_dpi: metadata.density ?? null,
        decoded_successfully: true,
        png_container_integrity: pngIntegrity,
        effective_dpi: dpi,
      },
      checks: {
        effective_dpi: {
          status: options.min_effective_dpi === undefined ? "not_checked_no_threshold" : measuredMinimum === null ? "not_checked_no_print_size"
            : measuredMinimum >= options.min_effective_dpi ? "meets_entered_threshold" : "below_entered_threshold",
          entered_minimum_dpi: options.min_effective_dpi ?? null,
          measured_minimum_dpi: measuredMinimum === null ? null : round(measuredMinimum),
        },
        aspect_ratio: {
          status: requestedAspect === null ? "not_checked_no_print_size" : Math.abs(requestedAspect / imageAspect - 1) <= 0.001 ? "matches_entered_print_ratio" : "different_from_entered_print_ratio",
          note: "Different ratios require cropping, borders or distortion; this inspection does not choose a placement method.",
        },
        bleed: { status: "not_checked", reason: "A raster image has no PDF TrimBox/BleedBox or approved dieline mapping." },
        fonts: { status: "not_applicable", reason: "Text in a raster image is pixels; font embedding cannot be inferred." },
      },
      limitations: [
        "Density metadata is not the effective resolution at a chosen print size.",
        "Effective DPI uses the complete EXIF-oriented image at the entered dimensions; a crop or another placement changes the result.",
        "No approval of spelling, claims, barcode readability, dieline alignment, physical colours or manufacturing suitability is performed.",
        "Thresholds are supplied by the caller and are not an approved Pack Legacy print profile.",
      ],
    };
  } catch (error) {
    if (error instanceof ArtworkInspectionError) throw error;
    if (error instanceof Error && /pixel limit/i.test(error.message)) throw new ArtworkInspectionError("PIXEL_LIMIT_EXCEEDED", "The image exceeds the 10 megapixel inspection limit.");
    throw new ArtworkInspectionError("INVALID_IMAGE", "The image could not be completely decoded as a supported static PNG or JPEG.");
  }
}

function resolve(document: PDFDocument, value: PDFObject | undefined): PDFObject | undefined {
  return value instanceof PDFRef ? document.context.lookup(value) : value;
}
function dictValue(document: PDFDocument, dict: PDFDict, key: string) {
  return resolve(document, dict.get(PDFName.of(key)));
}
function numeric(document: PDFDocument, dict: PDFDict, key: string): number | null {
  const value = dictValue(document, dict, key);
  return value instanceof PDFNumber && Number.isFinite(value.asNumber()) ? value.asNumber() : null;
}

function inherited(document: PDFDocument, start: PDFDict, key: string): { value?: PDFObject; source: "explicit" | "inherited" } {
  const visited = new Set<PDFDict>();
  let current: PDFDict | undefined = start;
  for (let depth = 0; current && depth < 40; depth++) {
    if (visited.has(current)) throw new ArtworkInspectionError("INVALID_PDF", "The PDF page hierarchy contains a cycle.");
    visited.add(current);
    const value = dictValue(document, current, key);
    if (value !== undefined) return { value, source: current === start ? "explicit" : "inherited" };
    const parent = dictValue(document, current, "Parent");
    current = parent instanceof PDFDict ? parent : undefined;
  }
  if (current) throw new ArtworkInspectionError("PDF_COMPLEXITY_LIMIT", "The PDF page hierarchy exceeds the inspection depth limit.");
  return { source: "explicit" };
}

function boxFrom(document: PDFDocument, value: PDFObject | undefined, factor: number, source: BoxSource): Box {
  if (!(value instanceof PDFArray) || value.size() !== 4) throw new ArtworkInspectionError("INVALID_PDF", "The PDF contains an invalid page box.");
  const coordinates = value.asArray().map(entry => resolve(document, entry));
  if (coordinates.some(entry => !(entry instanceof PDFNumber) || !Number.isFinite(entry.asNumber()))) throw new ArtworkInspectionError("INVALID_PDF", "The PDF contains invalid page dimensions.");
  const [x1, y1, x2, y2] = coordinates.map(entry => (entry as PDFNumber).asNumber());
  if (x2 <= x1 || y2 <= y1 || coordinates.some(entry => Math.abs((entry as PDFNumber).asNumber()) > 1e8)) throw new ArtworkInspectionError("INVALID_PDF", "The PDF contains unsupported page dimensions.");
  return { x_mm: x1 * factor, y_mm: y1 * factor, width_mm: (x2 - x1) * factor, height_mm: (y2 - y1) * factor, source };
}
function reportedBox(box: Box): Box {
  return { x_mm: round(box.x_mm), y_mm: round(box.y_mm), width_mm: round(box.width_mm), height_mm: round(box.height_mm), source: box.source };
}
function inside(outer: Box, inner: Box) {
  const tolerance = 1e-7;
  return inner.x_mm >= outer.x_mm - tolerance && inner.y_mm >= outer.y_mm - tolerance
    && inner.x_mm + inner.width_mm <= outer.x_mm + outer.width_mm + tolerance
    && inner.y_mm + inner.height_mm <= outer.y_mm + outer.height_mm + tolerance;
}

async function inspectPdf(bytes: Uint8Array, options: ArtworkInspectionOptions) {
  let document: PDFDocument;
  try {
    document = await withBoundedPdfDecoding(() => PDFDocument.load(bytes, { ignoreEncryption: false, updateMetadata: false, throwOnInvalidObject: true }));
  } catch (error) {
    if (error instanceof PdfDecodeLimitError) throw new ArtworkInspectionError(error.code, error.message);
    if (error instanceof Error && /encrypted/i.test(error.message)) throw new ArtworkInspectionError("ENCRYPTED_PDF", "Encrypted PDFs are not supported. Upload an unencrypted review copy.");
    throw new ArtworkInspectionError("INVALID_PDF", "The PDF could not be parsed as a supported document.");
  }
  if (document.isEncrypted) throw new ArtworkInspectionError("ENCRYPTED_PDF", "Encrypted PDFs are not supported.");
  const objectCount = document.context.enumerateIndirectObjects().length;
  if (objectCount > MAX_PDF_OBJECTS) throw new ArtworkInspectionError("PDF_COMPLEXITY_LIMIT", "The PDF exceeds the indirect-object inspection limit.");
  const pageCount = document.getPageCount();
  if (pageCount < 1 || pageCount > MAX_PDF_PAGES) throw new ArtworkInspectionError("PDF_PAGE_LIMIT", "Upload a PDF containing between one and 100 pages.");
  const pdfPages = document.getPages().slice(0, MAX_REPORTED_PDF_PAGES);
  const findings: Finding[] = [];
  const fonts: Array<{ resource_name: string; page: number; subtype: string | null; base_font: string | null; embedding: string }> = [];
  const images: Array<{ resource_name: string; page: number; width_px: number | null; height_px: number | null; declared_colour_space: string | null; effective_dpi: null }> = [];
  const colourSpaces = new Set<string>();
  let resourceEntries = 0;
  let resourcesIncomplete = false;

  function addFinding(code: string, message: string, page?: number) {
    if (findings.length < 60) findings.push({ code, message, ...(page === undefined ? {} : { page }) });
  }
  function colour(value: PDFObject | undefined, resources: PDFDict, depth = 0): string | null {
    if (depth > 4) return "Unresolved";
    value = resolve(document, value);
    if (value instanceof PDFName) {
      const decoded = name(value)!;
      if (["DeviceRGB", "DeviceCMYK", "DeviceGray", "Pattern"].includes(decoded)) return decoded;
      const spaces = dictValue(document, resources, "ColorSpace");
      if (spaces instanceof PDFDict) {
        const named = dictValue(document, spaces, decoded);
        if (named !== undefined) return colour(named, resources, depth + 1);
      }
      return decoded;
    }
    if (value instanceof PDFArray && value.size()) {
      const kind = name(resolve(document, value.get(0)));
      if (kind === "ICCBased" && value.size() >= 2) {
        const profile = resolve(document, value.get(1));
        const count = profile instanceof PDFStream ? numeric(document, profile.dict, "N") : null;
        return "ICCBased" + (count === null ? " (unresolved components)" : " (" + count + " components)");
      }
      return kind;
    }
    return null;
  }
  function fontEmbedding(font: PDFDict): string {
    const subtype = name(dictValue(document, font, "Subtype"));
    if (subtype === "Type3") return "type3_glyph_programs_not_validated";
    let target = font;
    if (subtype === "Type0") {
      const descendants = dictValue(document, font, "DescendantFonts");
      if (!(descendants instanceof PDFArray) || descendants.size() !== 1) return "unknown";
      const descendant = resolve(document, descendants.get(0));
      if (!(descendant instanceof PDFDict)) return "unknown";
      target = descendant;
    }
    const descriptor = dictValue(document, target, "FontDescriptor");
    if (!(descriptor instanceof PDFDict)) return subtype ? "not_embedded" : "unknown";
    for (const key of ["FontFile", "FontFile2", "FontFile3"]) {
      const program = dictValue(document, descriptor, key);
      if (program instanceof PDFStream && program.getContentsSize() > 0) return "embedded_program_present";
    }
    return "not_embedded";
  }
  function inspectResources(resources: PDFDict, pageNumber: number, depth: number, visited: Set<PDFDict>) {
    if (visited.has(resources)) return;
    if (depth > MAX_RESOURCE_DEPTH || resourceEntries >= MAX_RESOURCE_RECORDS) { resourcesIncomplete = true; return; }
    visited.add(resources);
    const fontDict = dictValue(document, resources, "Font");
    if (fontDict instanceof PDFDict) for (const [key, raw] of fontDict.entries()) {
      if (++resourceEntries > MAX_RESOURCE_RECORDS) { resourcesIncomplete = true; return; }
      const font = resolve(document, raw);
      if (!(font instanceof PDFDict)) { addFinding("UNREADABLE_FONT_RESOURCE", "A declared font resource could not be inspected.", pageNumber); continue; }
      const embedding = fontEmbedding(font);
      fonts.push({ resource_name: label(key.decodeText()), page: pageNumber, subtype: name(dictValue(document, font, "Subtype")), base_font: name(dictValue(document, font, "BaseFont")), embedding });
      if (embedding === "not_embedded") addFinding("FONT_NOT_EMBEDDED", "A declared font resource has no embedded font program; confirm the intended font handling with prepress.", pageNumber);
    }
    const spaces = dictValue(document, resources, "ColorSpace");
    if (spaces instanceof PDFDict) for (const [, value] of spaces.entries()) {
      if (++resourceEntries > MAX_RESOURCE_RECORDS) { resourcesIncomplete = true; return; }
      const declared = colour(value, resources);
      if (declared) colourSpaces.add(declared);
    }
    const xobjects = dictValue(document, resources, "XObject");
    if (!(xobjects instanceof PDFDict)) return;
    for (const [key, raw] of xobjects.entries()) {
      if (++resourceEntries > MAX_RESOURCE_RECORDS) { resourcesIncomplete = true; return; }
      const object = resolve(document, raw);
      if (!(object instanceof PDFStream)) continue;
      const subtype = name(dictValue(document, object.dict, "Subtype"));
      if (subtype === "Image") {
        const declared = colour(dictValue(document, object.dict, "ColorSpace"), resources);
        if (declared) colourSpaces.add(declared);
        images.push({ resource_name: label(key.decodeText()), page: pageNumber, width_px: numeric(document, object.dict, "Width"), height_px: numeric(document, object.dict, "Height"), declared_colour_space: declared, effective_dpi: null });
      } else if (subtype === "Form") {
        const nested = dictValue(document, object.dict, "Resources");
        if (nested instanceof PDFDict) inspectResources(nested, pageNumber, depth + 1, visited);
        else addFinding("FORM_RESOURCES_UNRESOLVED", "A form XObject has no explicit resources; its contents were not inspected.", pageNumber);
      }
    }
  }

  const pages = pdfPages.map((page, index) => {
    const pageNumber = index + 1;
    const unitValue = dictValue(document, page.node, "UserUnit");
    if (unitValue !== undefined && !(unitValue instanceof PDFNumber)) throw new ArtworkInspectionError("INVALID_PDF", "The PDF has a nonnumeric UserUnit value.");
    const unit = unitValue instanceof PDFNumber ? unitValue.asNumber() : 1;
    if (!(unit > 0 && unit <= 75000)) throw new ArtworkInspectionError("INVALID_PDF", "The PDF has an invalid UserUnit value.");
    const factor = unit * 25.4 / 72;
    const mediaValue = inherited(document, page.node, "MediaBox");
    const media = boxFrom(document, mediaValue.value, factor, mediaValue.source);
    const cropValue = inherited(document, page.node, "CropBox");
    const crop = cropValue.value ? boxFrom(document, cropValue.value, factor, cropValue.source) : { ...media, source: "default_media_box" as const };
    const trimValue = dictValue(document, page.node, "TrimBox");
    const bleedValue = dictValue(document, page.node, "BleedBox");
    const trim = trimValue ? boxFrom(document, trimValue, factor, "explicit") : { ...crop, source: "default_crop_box" as const };
    const bleed = bleedValue ? boxFrom(document, bleedValue, factor, "explicit") : { ...crop, source: "default_crop_box" as const };
    const rotationValue = inherited(document, page.node, "Rotate").value;
    if (rotationValue !== undefined && !(rotationValue instanceof PDFNumber)) throw new ArtworkInspectionError("INVALID_PDF", "The PDF page has a nonnumeric rotation value.");
    const rotation = rotationValue instanceof PDFNumber ? rotationValue.asNumber() : 0;
    if (!Number.isFinite(rotation) || rotation % 90 !== 0) throw new ArtworkInspectionError("INVALID_PDF", "The PDF page has an unsupported rotation value.");
    const normalizedRotation = ((rotation % 360) + 360) % 360;
    const explicit = trim.source === "explicit" && bleed.source === "explicit";
    const geometryValid = inside(media, crop) && inside(media, bleed) && inside(bleed, trim);
    if (!geometryValid) addFinding("PAGE_BOX_GEOMETRY", "Some page boxes extend beyond their expected enclosing box; confirm the intended trim and bleed geometry.", pageNumber);
    const margins = explicit ? {
      left: trim.x_mm - bleed.x_mm,
      bottom: trim.y_mm - bleed.y_mm,
      right: bleed.x_mm + bleed.width_mm - trim.x_mm - trim.width_mm,
      top: bleed.y_mm + bleed.height_mm - trim.y_mm - trim.height_mm,
    } : null;
    const measuredBleed = margins ? Math.min(...Object.values(margins)) : null;
    const resources = inherited(document, page.node, "Resources").value;
    if (resources instanceof PDFDict) inspectResources(resources, pageNumber, 0, new Set());
    else if (resources !== undefined) addFinding("UNREADABLE_RESOURCES", "The page resources were not a readable dictionary.", pageNumber);
    return {
      page_number: pageNumber,
      rotation_degrees: normalizedRotation,
      user_unit: unit,
      media_box: reportedBox(media),
      crop_box: reportedBox(crop),
      trim_box: reportedBox(trim),
      bleed_box: reportedBox(bleed),
      oriented_trim_width_mm: round(normalizedRotation === 90 || normalizedRotation === 270 ? trim.height_mm : trim.width_mm),
      oriented_trim_height_mm: round(normalizedRotation === 90 || normalizedRotation === 270 ? trim.width_mm : trim.height_mm),
      bleed_margins_mm: margins ? Object.fromEntries(Object.entries(margins).map(([key, value]) => [key, round(value)])) : null,
      bleed_check: {
        status: options.min_bleed_mm === undefined ? "not_checked_no_threshold" : !explicit ? "not_checked_missing_explicit_boxes" : !geometryValid ? "invalid_box_geometry"
          : measuredBleed! + 1e-7 >= options.min_bleed_mm ? "meets_entered_threshold" : "below_entered_threshold",
        entered_minimum_mm: options.min_bleed_mm ?? null,
        measured_minimum_mm: measuredBleed === null ? null : round(measuredBleed),
        scope: "explicit_box_metadata_only; artwork coverage in the bleed area is not checked",
      },
    };
  });
  if (resourcesIncomplete) addFinding("RESOURCE_REPORT_LIMIT", "The declared-resource report reached its complexity limit; some resources are not listed.");
  if (pageCount > pages.length) addFinding("PAGE_REPORT_LIMIT", "Only the first 20 pages are inspected and reported.");
  return {
    ...inspectFileBase(bytes, options, "pdf"),
    inspection_scope: "PDF_page_box_metadata_and_declared_page_form_resources",
    coverage: { page_count: pageCount, inspected_pages: pages.length, truncated: pageCount > pages.length || resourcesIncomplete, declared_resource_entries_examined: Math.min(resourceEntries, MAX_RESOURCE_RECORDS) },
    pages,
    fonts,
    images,
    declared_colour_spaces: [...colourSpaces].sort(),
    findings,
    checks: {
      effective_dpi: { status: "not_checked", reason: "Image placement transforms and clipping are not interpreted, so embedded-image effective DPI is unknown." },
      bleed: { status: "reported_per_page", reason: "Only explicit PDF TrimBox/BleedBox metadata supports margin measurement; default boxes are labelled." },
      fonts: { status: resourcesIncomplete ? "partially_inspected" : "declared_resources_inspected", note: "Embedded program presence is recorded, not font-program validity or actual font usage." },
      print_size: { status: "reported_as_document_dimensions", note: "Entered print dimensions do not resize the PDF or establish artwork placement." },
    },
    limitations: [
      "This is a structural metadata inspection, not a PDF renderer, complete PDF conformance check or production approval.",
      "PDF content streams, inline images, annotation appearances, pattern resources, spot-colour coverage, overprint, clipping and image placement are not interpreted.",
      "Declared fonts, images and colour spaces may be unused; their presence does not establish the colours or objects actually printed.",
      "PDF image and font stream contents are not rendered or validated. Embedded-image DPI remains unknown.",
      "Explicit bleed margins describe page-box geometry only; they do not prove that artwork extends through the bleed area.",
      "Only the first 20 pages and bounded declared resources are inspected. No document text or embedded actions are executed or returned.",
      "Decoded PDF streams are limited to 16 MiB each and 32 MiB of cumulative decoder buffer allocations per inspection.",
      "Thresholds are supplied by the caller and are not an approved Pack Legacy print profile.",
    ],
  };
}

/**
 * Inspects supplied bytes only. Run in the server's bounded worker for untrusted
 * uploads; the parser itself cannot terminate a blocked JavaScript event loop.
 */
export async function inspectArtwork(bytes: Uint8Array, rawOptions: ArtworkInspectionOptions = {}) {
  const parsedOptions = artworkInspectionOptionsSchema.safeParse(rawOptions);
  if (!parsedOptions.success) throw new ArtworkInspectionError("INVALID_INSPECTION_OPTIONS", parsedOptions.error.issues.map(issue => issue.message).join(" "));
  if (!(bytes instanceof Uint8Array) || bytes.byteLength === 0) throw new ArtworkInspectionError("EMPTY_FILE", "Upload a nonempty file.");
  if (bytes.byteLength > MAX_ARTWORK_BYTES) throw new ArtworkInspectionError("FILE_TOO_LARGE", "The artwork inspection limit is 2 MiB per file.");
  const format = detectedFormat(bytes);
  const options = parsedOptions.data;
  validateFilename(options.filename, format);
  try {
    return format === "pdf" ? await inspectPdf(bytes, options) : await inspectRaster(bytes, options, format);
  } catch (error) {
    if (error instanceof ArtworkInspectionError) throw error;
    throw new ArtworkInspectionError("INVALID_PDF", "The PDF contains unsupported or malformed structures and could not be inspected.");
  }
}
export type ArtworkInspectionResult = Awaited<ReturnType<typeof inspectArtwork>>;
