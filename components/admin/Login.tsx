"use client";
// Sign-in screen, first-time account setup and the Account screen of the dashboard.
import { useState, type FormEvent } from "react";
import { Head, api, msg, useApp } from "./Dashboard";

function Password({ label, value, onChange, auto }: { label: string; value: string; onChange: (v: string) => void; auto: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="ad-pass">
      <label>{label}<input type={show ? "text" : "password"} required autoComplete={auto} maxLength={200} value={value} onChange={(e) => onChange(e.target.value)} /></label>
      <button type="button" className="ad-link" aria-pressed={show} onClick={() => setShow(!show)}>{show ? "Hide" : "Show"}</button>
    </div>
  );
}

export default function Login({ needsSetup, expired, onDone }: { needsSetup: boolean; expired?: boolean; onDone: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [again, setAgain] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (needsSetup && password !== again) { setError("The two passwords do not match"); return; }
    setBusy(true);
    setError("");
    try { await api(needsSetup ? "setup" : "login", { username, password, remember }); onDone(); } catch (x) { setError(msg(x)); setPassword(""); setAgain(""); }
    setBusy(false);
  };
  return (
    <div className="ad ad-login">
      <form className="ad-login-card" onSubmit={submit}>
        <img src="/images/pack-legacy-logo.webp" alt="Pack Legacy" />
        <h1>{needsSetup ? "Create your account" : "Log in"}</h1>
        <p className="ad-muted">{needsSetup ? "Choose the username and password for this dashboard." : expired ? "You have been logged out. Log in to continue; your unsaved changes are kept." : "Log in to manage your website."}</p>
        {error && <p className="ad-login-error" role="alert">{error}</p>}
        <label>Username<input required autoFocus autoComplete="username" maxLength={80} value={username} onChange={(e) => setUsername(e.target.value)} /></label>
        <Password label={needsSetup ? "Password (10 characters or more)" : "Password"} value={password} onChange={setPassword} auto={needsSetup ? "new-password" : "current-password"} />
        {needsSetup && <Password label="Repeat password" value={again} onChange={setAgain} auto="new-password" />}
        {!needsSetup && <label className="ad-check"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Keep me logged in for 30 days</label>}
        <button className="ad-btn primary" disabled={busy}>{busy ? "Please wait…" : needsSetup ? "Create account" : "Log in"}</button>
        <a className="ad-link" href="/">← Back to the website</a>
      </form>
    </div>
  );
}

export function Account({ user, passwordManaged, onLogout }: { user: string; passwordManaged: boolean; onLogout: (everywhere: boolean) => void }) {
  const { toast } = useApp();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [again, setAgain] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (next !== again) { toast("The two new passwords do not match", true); return; }
    setBusy(true);
    try { await api("changePassword", { current, next }); toast("Password changed. Other devices and browsers are logged out."); setCurrent(""); setNext(""); setAgain(""); } catch (x) { toast(msg(x), true); }
    setBusy(false);
  };
  return (
    <>
      <Head title="Account"><button className="ad-btn" onClick={() => onLogout(false)}>Log out</button></Head>
      <section className="ad-card"><h2>Logged in as {user}</h2><p className="ad-muted">{passwordManaged ? "To revoke every session, rotate PL_ADMIN_SESSION_SECRET in Vercel." : "To end every session, including other browsers:"}</p>{!passwordManaged && <button className="ad-btn danger" onClick={() => onLogout(true)}>Log out everywhere</button>}</section>
      <section className="ad-card">
        <h2>Change password</h2>
        {passwordManaged
          ? <p className="ad-muted">Admin credentials are managed in the Vercel project environment variables.</p>
          : <form className="ad-form ad-account" onSubmit={submit}>
            <Password label="Current password" value={current} onChange={setCurrent} auto="current-password" />
            <Password label="New password (10 characters or more)" value={next} onChange={setNext} auto="new-password" />
            <Password label="Repeat new password" value={again} onChange={setAgain} auto="new-password" />
            <div><button className="ad-btn primary" disabled={busy}>Change password</button></div>
          </form>}
      </section>
    </>
  );
}
