"use client";

// "See what AI has to say about us" on /about-us/.
// Animations start when the section scrolls into view: entrance, a typed prompt that cycles through AI assistants,
// floating robot with glow and sparkles, drifting background orbs, and shimmering buttons. Styles: styles/about.css.
import { useEffect, useRef, useState } from "react";
import { aiLinks } from "@/components/Footer";
import { AI_QUESTION as Q, AI_QUESTION_TEXT as QUESTION } from "@/lib/aiQuestion";

// Logos are shared with the footer (Google AI Mode uses the Gemini mark); Claude's comes from Simple Icons too.
const logoOf = (name: string) => aiLinks.find((a) => a.name === name)?.path || "";
const CLAUDE_LOGO = "m4.7144 15.9555 4.7174-2.6471.079-.2307-.079-.1275h-.2307l-.7893-.0486-2.6956-.0729-2.3375-.0971-2.2646-.1214-.5707-.1215-.5343-.7042.0546-.3522.4797-.3218.686.0608 1.5179.1032 2.2767.1578 1.6514.0972 2.4468.255h.3886l.0546-.1579-.1336-.0971-.1032-.0972L6.973 9.8356l-2.55-1.6879-1.3356-.9714-.7225-.4918-.3643-.4614-.1578-1.0078.6557-.7225.8803.0607.2246.0607.8925.686 1.9064 1.4754 2.4893 1.8336.3643.3035.1457-.1032.0182-.0728-.164-.2733-1.3539-2.4467-1.445-2.4893-.6435-1.032-.17-.6194c-.0607-.255-.1032-.4674-.1032-.7285L6.287.1335 6.6997 0l.9957.1336.419.3642.6192 1.4147 1.0018 2.2282 1.5543 3.0296.4553.8985.2429.8318.091.255h.1579v-.1457l.1275-1.706.2368-2.0947.2307-2.6957.0789-.7589.3764-.9107.7468-.4918.5828.2793.4797.686-.0668.4433-.2853 1.8517-.5586 2.9021-.3643 1.9429h.2125l.2429-.2429.9835-1.3053 1.6514-2.0643.7286-.8196.85-.9046.5464-.4311h1.0321l.759 1.1293-.34 1.1657-1.0625 1.3478-.8804 1.1414-1.2628 1.7-.7893 1.36.0729.1093.1882-.0183 2.8535-.607 1.5421-.2794 1.8396-.3157.8318.3886.091.3946-.3278.8075-1.967.4857-2.3072.4614-3.4364.8136-.0425.0304.0486.0607 1.5482.1457.6618.0364h1.621l3.0175.2247.7892.522.4736.6376-.079.4857-1.2142.6193-1.6393-.3886-3.825-.9107-1.3113-.3279h-.1822v.1093l1.0929 1.0686 2.0035 1.8092 2.5075 2.3314.1275.5768-.3218.4554-.34-.0486-2.2039-1.6575-.85-.7468-1.9246-1.621h-.1275v.17l.4432.6496 2.3436 3.5214.1214 1.0807-.17.3521-.6071.2125-.6679-.1214-1.3721-1.9246L14.38 17.959l-1.1414-1.9428-.1397.079-.674 7.2552-.3156.3703-.7286.2793-.6071-.4614-.3218-.7468.3218-1.4753.3886-1.9246.3157-1.53.2853-1.9004.17-.6314-.0121-.0425-.1397.0182-1.4328 1.9672-2.1796 2.9446-1.7243 1.8456-.4128.164-.7164-.3704.0667-.6618.4008-.5889 2.386-3.0357 1.4389-1.882.929-1.0868-.0062-.1579h-.0546l-6.3385 4.1164-1.1293.1457-.4857-.4554.0608-.7467.2307-.2429 1.9064-1.3114Z";
// From Lobe Icons (the footer's "Microsoft Copilot" icon is the Bing mark).
const COPILOT_LOGO = "M16.295 5.29l-0.242 0.986h-2.32c-1.721 0-3.22 1.197-3.638 2.902l-2.101 8.593H3.798c-2.44 0-4.229-2.342-3.637-4.761l2.106-8.612c0.557-2.274 2.556-3.87 4.85-3.87h5.54c2.44 0 4.23 2.343 3.638 4.761M7.752 18.758l0.242-0.986h2.321c1.72 0 3.22-1.197 3.637-2.903l2.102-8.593h4.196c2.439 0 4.228 2.343 3.637 4.762l-2.107 8.611c-0.556 2.274-2.555 3.87-4.85 3.87h-5.54c-2.44 0-4.229-2.342-3.638-4.761";
const Logo = ({ d }: { d: string }) => (
  <svg className="abt-ai-logo" viewBox="0 0 24 24" fill="currentColor" fillRule="evenodd" aria-hidden="true"><path d={d} /></svg>
);
const assistants = [
  { name: "ChatGPT", logo: logoOf("ChatGPT"), color: "#10a37f", href: `https://chatgpt.com/?q=${Q}` },
  { name: "Claude", logo: CLAUDE_LOGO, color: "#d97757", href: `https://claude.ai/new?q=${Q}` },
  { name: "Google AI", logo: logoOf("Google Gemini"), color: "#4285f4", href: `https://www.google.com/search?udm=50&q=${Q}` },
  { name: "Perplexity", logo: logoOf("Perplexity"), color: "#20b8cd", href: `https://www.perplexity.ai/search?q=${Q}` },
  { name: "Copilot", logo: COPILOT_LOGO, color: "#7b61ff", href: `https://www.bing.com/search?showconv=1&q=${Q}` },
];
const SHORT = "Who is Pack Legacy? What products do they offer?";

export default function AiVisibility({ robot }: { robot: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false); // entrance styles only apply once JS is running
  const [inView, setInView] = useState(false);
  const [typed, setTyped] = useState(SHORT); // full text by default (no JS / reduced motion)
  const [who, setWho] = useState(0);

  // Start everything once the section is on screen.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) { setInView(true); return; }
    setReady(true);
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); io.disconnect(); } }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Type the question, pause, then move to the next assistant and type again.
  useEffect(() => {
    if (!inView || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let i = 0;
    let timer: ReturnType<typeof setTimeout>;
    setTyped("");
    const step = () => {
      i += 1;
      setTyped(SHORT.slice(0, i));
      if (i < SHORT.length) timer = setTimeout(step, 38);
      else timer = setTimeout(() => setWho((w) => (w + 1) % assistants.length), 2600);
    };
    timer = setTimeout(step, 400);
    return () => clearTimeout(timer);
  }, [inView, who]);

  const current = assistants[who];
  return (
    <div ref={ref} className={`abt-ai ${ready ? "is-ready" : ""} ${inView ? "is-in" : ""}`} style={{ "--ai-accent": current.color } as React.CSSProperties}>
      {/* Background */}
      <span className="abt-ai-orb abt-ai-orb-a" aria-hidden="true" />
      <span className="abt-ai-orb abt-ai-orb-b" aria-hidden="true" />
      <span className="abt-ai-grid" aria-hidden="true" />

      {/* Robot */}
      <div className="abt-ai-bot" aria-hidden="true">
        <span className="abt-ai-ring" />
        <span className="abt-ai-ring abt-ai-ring-2" />
        <img src={robot} alt="" width={220} height={220} />
        <span className="abt-ai-spark abt-ai-spark-1">✦</span>
        <span className="abt-ai-spark abt-ai-spark-2">✦</span>
        <span className="abt-ai-spark abt-ai-spark-3">✧</span>
        <span className="abt-ai-typing"><i /><i /><i /></span>
      </div>

      <div className="abt-ai-copy">
        <p className="ip-eyebrow abt-eyebrow-light"><span className="abt-ai-live" aria-hidden="true" />AI visibility</p>
        <h2 id="abt-ai-h">See what <span className="abt-ai-grad">AI</span> has to say about us.</h2>
        <p>Ask your favorite AI assistant about Pack Legacy. Each button opens it with the question ready to go.</p>

        {/* Fake prompt bar */}
        <a className="abt-ai-prompt" href={current.href} target="_blank" rel="noopener nofollow" aria-label={`Ask ${current.name}: ${QUESTION}`}>
          <span className="abt-ai-who" key={current.name}>
            <Logo d={current.logo} />
            {current.name}
          </span>
          <span className="abt-ai-text">{typed}<span className="abt-ai-caret" aria-hidden="true" /></span>
          <span className="abt-ai-send" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5" /><path d="m5 12 7-7 7 7" /></svg>
          </span>
        </a>

        <div className="abt-ai-links">
          {assistants.map((a, i) => (
            <a
              key={a.name}
              href={a.href}
              target="_blank"
              rel="noopener nofollow"
              className={i === who ? "is-current" : ""}
              style={{ "--i": i, "--c": a.color } as React.CSSProperties}
            >
              <Logo d={a.logo} />
              Ask {a.name}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></svg>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
