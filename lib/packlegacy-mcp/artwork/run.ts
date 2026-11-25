import { Worker } from "node:worker_threads";
import path from "node:path";
import { ArtworkInspectionError, MAX_ARTWORK_BYTES, artworkInspectionOptionsSchema, type ArtworkInspectionOptions } from "./inspect";
import { ARTWORK_WORKER_SOURCE } from "./generated-worker";

/** Resolves a package with Node's own resolver from the app root. Fetched at runtime so the Next.js
 *  bundler (webpack) leaves it alone; `createRequire(import.meta.url)` is not supported there. */
function resolveNative(id: string): string {
  const { createRequire } = (process as unknown as { getBuiltinModule(name: "module"): typeof import("node:module") }).getBuiltinModule("module");
  return createRequire(path.join(process.cwd(), "package.json")).resolve(id);
}
let activeInspections = 0;
const MAX_ACTIVE_INSPECTIONS = 2;

/** Limits CPU lifetime and JS heap; decoded image pixels have their own parser bound. */
export async function runArtworkInspection(bytes: Uint8Array, options: ArtworkInspectionOptions = {}, limits: { timeoutMs?: number; signal?: AbortSignal } = {}): Promise<Record<string, any>> {
  if (bytes.byteLength === 0 || bytes.byteLength > MAX_ARTWORK_BYTES) {
    throw new ArtworkInspectionError("FILE_SIZE_LIMIT", "Upload a non-empty file no larger than 2 MiB.");
  }
  const parsed = artworkInspectionOptionsSchema.parse(options);
  const timeoutMs = limits.timeoutMs ?? 15_000;
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 15_000) throw new Error("Invalid internal artwork deadline.");
  if (limits.signal?.aborted) throw new ArtworkInspectionError("INSPECTION_CANCELLED", "Inspection was cancelled.");
  if (activeInspections >= MAX_ACTIVE_INSPECTIONS) throw new ArtworkInspectionError("ARTWORK_BUSY", "Two files are being inspected. Please retry shortly.");
  activeInspections += 1;
  let worker: Worker | undefined;
  try {
    worker = new Worker(ARTWORK_WORKER_SOURCE, {
      eval: true,
      execArgv: [],
      // Keep this as a native runtime resolution. A direct .resolve("sharp")
      // is rewritten to a numeric module ID by Next.js.
      workerData: { bytes, options: parsed, sharpModulePath: resolveNative("sharp") },
      resourceLimits: { maxOldGenerationSizeMb: 128, maxYoungGenerationSizeMb: 16, stackSizeMb: 4 },
      stdout: true, stderr: true,
    });
    // Suppress parser diagnostics that could contain customer file content.
    worker.stdout?.resume();
    worker.stderr?.resume();
    const running = worker;
    return await new Promise<Record<string, any>>((resolve, reject) => {
      let settled = false;
      const finish = (error?: Error, report?: Record<string, any>) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        limits.signal?.removeEventListener("abort", cancelled);
        if (error) reject(error); else resolve(report!);
      };
      const cancelled = () => finish(new ArtworkInspectionError("INSPECTION_CANCELLED", "Inspection was cancelled."));
      const timer = setTimeout(() => finish(new ArtworkInspectionError("INSPECTION_TIMEOUT", "Inspection exceeded the 15-second processing limit. Try a smaller or simpler file.")), timeoutMs);
      limits.signal?.addEventListener("abort", cancelled, { once: true });
      if (limits.signal?.aborted) cancelled();
      running.once("message", message => {
        if (message?.ok && message.report && typeof message.report === "object") finish(undefined, message.report);
        else finish(new ArtworkInspectionError(message?.error?.code ?? "INSPECTION_FAILED", message?.error?.message ?? "The file could not be inspected."));
      });
      running.once("error", () => finish(new ArtworkInspectionError("INSPECTION_FAILED", "Inspection stopped because the file could not be processed within the supported limits.")));
      running.once("exit", () => finish(new ArtworkInspectionError("INSPECTION_FAILED", "Inspection ended before a report was produced.")));
    });
  } finally {
    try { await worker?.terminate(); } finally { activeInspections -= 1; }
  }
}
