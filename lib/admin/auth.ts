// Dashboard login. The account lives in .admin-auth.json (this computer only; never committed or deployed).
// Forgotten password: delete .admin-auth.json, then open /admin/ to set a new one.
import { createHash, createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { AdminError, ROOT } from "./store";

const FILE = path.join(ROOT, ".admin-auth.json");
export const COOKIE = "pl_admin_session";
const SHORT = 12 * 60 * 60; // seconds
const LONG = 30 * 24 * 60 * 60;
const MAX_TRIES = 5;
const LOCK_MS = 5 * 60 * 1000;
const remote = () => process.env.NODE_ENV === "production" && process.env.PL_ADMIN === "1";

type Auth = { username: string; salt: string; hash: string; sessions: { id: string; expires: number }[] };

const derive = (password: string, salt: string) =>
  new Promise<Buffer>((ok, bad) => scrypt(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }, (e, k) => (e ? bad(e) : ok(k))));
const digest = (token: string) => createHash("sha256").update(token).digest("hex");

async function load(): Promise<Auth | null> {
  let text: string;
  try {
    text = await fs.readFile(FILE, "utf8");
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw e;
  }
  return JSON.parse(text); // a damaged file is an error, never a fresh setup
}
async function store(a: Auth) {
  a.sessions = a.sessions.filter((s) => s.expires > Date.now()).slice(-20);
  const tmp = FILE + ".tmp";
  await fs.writeFile(tmp, JSON.stringify(a, null, 2), { mode: 0o600 });
  await fs.rename(tmp, FILE);
}

// Kept across hot reloads.
const g = globalThis as unknown as { plAdminTries?: { n: number; until: number } };
const tries = (g.plAdminTries ??= { n: 0, until: 0 });
function checkLock() {
  if (tries.until > Date.now()) throw new AdminError(`Too many attempts. Try again in ${Math.ceil((tries.until - Date.now()) / 60000)} min.`, 429);
}
function failed() {
  tries.n++;
  if (tries.n >= MAX_TRIES) Object.assign(tries, { n: 0, until: Date.now() + LOCK_MS });
}
async function verify(a: Auth, password: unknown) {
  if (typeof password !== "string" || password.length > 200) return false;
  return timingSafeEqual(await derive(password, a.salt), Buffer.from(a.hash, "hex"));
}
function checkNew(password: unknown): asserts password is string {
  if (typeof password !== "string" || password.length < 10) throw new AdminError("Use a password of at least 10 characters");
  if (password.length > 200) throw new AdminError("The password is too long");
}

const tokenOf = (req: Request) => {
  const m = new RegExp(`(?:^|;\\s*)${COOKIE}=([A-Za-z0-9_.-]+)`).exec(req.headers.get("cookie") || "");
  return m ? m[1] : "";
};
const cookie = (value: string, age: number | null) => `${COOKIE}=${value}; Path=/admin; HttpOnly; SameSite=Strict${process.env.NODE_ENV === "production" ? "; Secure" : ""}${age === null ? "" : `; Max-Age=${age}`}`;

function remoteCredentials() {
  const username = process.env.PL_ADMIN_USERNAME;
  const password = process.env.PL_ADMIN_PASSWORD;
  const secret = process.env.PL_ADMIN_SESSION_SECRET;
  if (!username || !password || !secret || password.length < 12 || secret.length < 32) {
    throw new AdminError("Admin login is not configured. Set PL_ADMIN_USERNAME, PL_ADMIN_PASSWORD (12+ characters), and PL_ADMIN_SESSION_SECRET (32+ characters) in Vercel.", 503);
  }
  return { username, password, secret };
}

const remoteSignature = (payload: string, secret: string) => createHmac("sha256", secret).update(payload).digest("base64url");
function safeEqual(a: string, b: string) {
  return timingSafeEqual(createHash("sha256").update(a).digest(), createHash("sha256").update(b).digest());
}
async function openRemote(username: string, remember: boolean) {
  const { secret } = remoteCredentials();
  const seconds = remember ? LONG : SHORT;
  const payload = Buffer.from(JSON.stringify({ username, expires: Date.now() + seconds * 1000 })).toString("base64url");
  return cookie(`${payload}.${remoteSignature(payload, secret)}`, seconds);
}
function remoteUser(req: Request) {
  const { secret } = remoteCredentials();
  const [payload, signature, ...rest] = tokenOf(req).split(".");
  if (!payload || !signature || rest.length || !safeEqual(signature, remoteSignature(payload, secret))) return null;
  try {
    const value = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { username: string; expires: number };
    return value.username && value.expires > Date.now() ? value.username : null;
  } catch { return null; }
}

async function open(a: Auth, remember: boolean) {
  const token = randomBytes(32).toString("base64url");
  a.sessions.push({ id: digest(token), expires: Date.now() + (remember ? LONG : SHORT) * 1000 });
  await store(a);
  return cookie(token, remember ? LONG : null);
}

/** The signed-in username, or null. */
export async function currentUser(req: Request) {
  if (remote()) return remoteUser(req);
  const a = await load();
  const token = tokenOf(req);
  if (!a || !token) return null;
  const id = digest(token);
  return a.sessions.some((s) => s.id === id && s.expires > Date.now()) ? a.username : null;
}
export async function status(req: Request) {
  if (remote()) return { needsSetup: false, user: remoteUser(req), passwordManaged: true };
  return { needsSetup: !(await load()), user: await currentUser(req) };
}
export async function setup(username: unknown, password: unknown) {
  if (remote()) throw new AdminError("Set the admin login in the Vercel environment variables.", 403);
  if (await load()) throw new AdminError("An account already exists", 403);
  const name = String(username || "").trim();
  if (!/^[\w.@+-]{3,80}$/.test(name)) throw new AdminError("The username needs 3 to 80 letters or numbers, without spaces");
  checkNew(password);
  const salt = randomBytes(16).toString("hex");
  const a: Auth = { username: name, salt, hash: (await derive(password, salt)).toString("hex"), sessions: [] };
  return open(a, false);
}
export async function login(username: unknown, password: unknown, remember: boolean) {
  checkLock();
  if (remote()) {
    const configured = remoteCredentials();
    const good = typeof password === "string" && password.length <= 200 && safeEqual(password, configured.password);
    if (!good || String(username || "").trim().toLowerCase() !== configured.username.trim().toLowerCase()) {
      failed();
      throw new AdminError("The username or password is wrong", 401);
    }
    Object.assign(tries, { n: 0, until: 0 });
    return openRemote(configured.username, remember);
  }
  const a = await load();
  if (!a) throw new AdminError("Create your account first", 403);
  const good = await verify(a, password); // always runs, so a wrong username takes just as long
  if (!good || String(username || "").trim().toLowerCase() !== a.username.toLowerCase()) {
    failed();
    throw new AdminError("The username or password is wrong", 401);
  }
  Object.assign(tries, { n: 0, until: 0 });
  return open(a, remember);
}
export async function logout(req: Request, everywhere: boolean) {
  if (remote()) return cookie("", 0);
  const a = await load();
  if (a) {
    const id = digest(tokenOf(req));
    a.sessions = everywhere ? [] : a.sessions.filter((s) => s.id !== id);
    await store(a);
  }
  return cookie("", 0);
}
/** Changes the password and signs out every other session. */
export async function changePassword(current: unknown, next: unknown) {
  checkLock();
  if (remote()) throw new AdminError("Change the admin password in the Vercel environment variables.", 403);
  const a = await load();
  if (!a) throw new AdminError("Not found", 404);
  if (!(await verify(a, current))) {
    failed();
    throw new AdminError("The current password is wrong");
  }
  checkNew(next);
  a.salt = randomBytes(16).toString("hex");
  a.hash = (await derive(next, a.salt)).toString("hex");
  a.sessions = [];
  return open(a, false);
}
