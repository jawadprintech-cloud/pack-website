import { parentPort, workerData } from "node:worker_threads";
import { inspectArtwork, ArtworkInspectionError } from "./inspect";

// Bundled at build time. No customer paths, URLs, PDF scripts or attachments run.
void (async () => {
  try {
    const report = await inspectArtwork(new Uint8Array(workerData.bytes), workerData.options);
    parentPort!.postMessage({ ok: true, report });
  } catch (error) {
    parentPort!.postMessage({ ok: false, error: error instanceof ArtworkInspectionError
      ? { code: error.code, message: error.message }
      : { code: "INSPECTION_FAILED", message: "The file could not be inspected. Check its format and try a valid file." } });
  }
})();
