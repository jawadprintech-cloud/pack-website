// npm run admin: the site plus its dashboard at http://localhost:3000/admin/ (reachable from this computer only).
import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const next = createRequire(import.meta.url).resolve("next/dist/bin/next");
spawn(process.execPath, [next, "dev", "-H", "127.0.0.1", "-p", process.env.PORT || "3000"], { stdio: "inherit", env: { ...process.env, PL_ADMIN: "1" } })
  .on("exit", (code) => process.exit(code ?? 0));
