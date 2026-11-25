import { AsyncLocalStorage } from "node:async_hooks";
import { PDFContext, decodePDFRawStream } from "pdf-lib";
import DecodeStreamImport from "pdf-lib/cjs/core/streams/DecodeStream.js";

export const MAX_PDF_DECODED_STREAM_BYTES = 16 * 1024 * 1024;
export const MAX_PDF_DECODED_ALLOCATION_BYTES = 32 * 1024 * 1024;

export class PdfDecodeLimitError extends Error {
  constructor(readonly code: "PDF_DECOMPRESSION_LIMIT" | "PDF_RUNTIME_INCOMPATIBLE", message: string) {
    super(message);
    this.name = "PdfDecodeLimitError";
  }
}

interface Budget { allocatedBytes: number; exceeded: boolean; }
interface Decoder {
  buffer: Uint8Array;
  minBufferLength: number;
  ensureBuffer(requested: number): Uint8Array;
}
interface GuardState { storage: AsyncLocalStorage<Budget>; }

// pdf-lib 1.17.1 exposes an internal CJS default export. Node ESM and an esbuild
// CJS bundle wrap that export differently; normalize those two supported forms.
const imported = DecodeStreamImport as unknown as { default?: unknown } | Function;
const DecoderClass = (typeof imported === "function" ? imported : imported?.default) as
  (Function & { prototype: Decoder }) | undefined;
const guardKey = Symbol.for("packlegacy.pdf-lib.1.17.1.decode-budget.v1");
let verified = false;

function incompatible(): never {
  throw new PdfDecodeLimitError("PDF_RUNTIME_INCOMPATIBLE", "The installed PDF parser does not match the bounded decoder. Rebuild with the pinned dependencies.");
}

function guardState(): GuardState {
  if (typeof DecoderClass !== "function" || typeof DecoderClass.prototype.ensureBuffer !== "function") incompatible();
  const prototype = DecoderClass.prototype as Decoder & { [guardKey]?: GuardState };
  if (!prototype[guardKey]) {
    const original = prototype.ensureBuffer;
    const state: GuardState = { storage: new AsyncLocalStorage<Budget>() };
    prototype.ensureBuffer = function (requested: number): Uint8Array {
      const budget = state.storage.getStore();
      if (budget && requested > this.buffer.byteLength) {
        const fail = (): never => {
          budget.exceeded = true;
          throw new PdfDecodeLimitError("PDF_DECOMPRESSION_LIMIT", "The PDF exceeds the decoded-stream inspection limits (16 MiB per stream and 32 MiB of cumulative buffer allocations).");
        };
        if (!Number.isSafeInteger(requested) || requested > MAX_PDF_DECODED_STREAM_BYTES
          || !Number.isSafeInteger(this.minBufferLength) || this.minBufferLength < 1) fail();
        // Match the pinned decoder's power-of-two allocation, not just the
        // requested length. Count replacement buffers too, before allocation.
        let allocation = this.minBufferLength;
        while (allocation < requested && allocation <= MAX_PDF_DECODED_STREAM_BYTES) allocation *= 2;
        if (allocation > MAX_PDF_DECODED_STREAM_BYTES || budget.allocatedBytes + allocation > MAX_PDF_DECODED_ALLOCATION_BYTES) fail();
        budget.allocatedBytes += allocation;
      }
      return original.call(this, requested);
    };
    Object.defineProperty(prototype, guardKey, { value: state });
  }
  if (!verified) {
    // Fail closed if a bundler selected a second, unguarded ESM decoder copy.
    // This uses generated empty data, never customer bytes.
    const probe = decodePDFRawStream(PDFContext.create().flateStream(new Uint8Array()));
    if (!(probe instanceof (DecoderClass as unknown as new (...args: never[]) => object))) incompatible();
    verified = true;
  }
  return prototype[guardKey]!;
}

/**
 * Worker V8 heap limits exclude ArrayBuffer memory. Apply a decoder allocation
 * budget before PDF loading, including compressed object and xref streams.
 * AsyncLocalStorage keeps concurrent direct calls independent.
 */
export async function withBoundedPdfDecoding<T>(operation: () => Promise<T>): Promise<T> {
  const state = guardState();
  const budget: Budget = { allocatedBytes: 0, exceeded: false };
  return state.storage.run(budget, async () => {
    try {
      const value = await operation();
      if (budget.exceeded) throw new PdfDecodeLimitError("PDF_DECOMPRESSION_LIMIT", "The PDF exceeds the decoded-stream inspection limits (16 MiB per stream and 32 MiB of cumulative buffer allocations).");
      return value;
    } catch (error) {
      // pdf-lib may wrap decoder errors as invalid-object errors. Preserve the
      // bounded-decoder outcome even when its parser replaces the exception.
      if (budget.exceeded) throw new PdfDecodeLimitError("PDF_DECOMPRESSION_LIMIT", "The PDF exceeds the decoded-stream inspection limits (16 MiB per stream and 32 MiB of cumulative buffer allocations).");
      throw error;
    }
  });
}
