"use client";

import { useState } from "react";
import { AI_QUESTION, AI_QUESTION_TEXT } from "@/lib/aiQuestion";

// Footer copied from https://packlegacy.com/

// Links stay on this site (no links out to packlegacy.com).
const SITE = "";

const cols = [
  {
    title: "Company",
    links: [
      ["About Us", "/about-us/"],
      ["Contact Us", "/contact-us/"],
      ["Reviews", "/reviews/"],
      ["Materials", "/materials/"],
      ["Sample Kits", "/sample-kits/"],
      ["Free Dieline Templates", "/free-dieline-templates/"],
    ],
  },
  {
    title: "Help",
    links: [
      ["Blogs", "/blog/"],
      ["How To Order", "/how-to-order/"],
      ["FAQs", "/faqs/"],
      ["Track Your Order", "/track-your-order/"],
      ["For AI Agents", "/for-ai-agents/"],
    ],
  },
  {
    title: "Policies",
    links: [
      ["Terms & Conditions", "/terms-and-conditions/"],
      ["Returns & Refunds", "/refund-and-return-policy/"],
      ["Privacy Policy", "/privacy-policy/"],
      ["Shipping Policy", "/shipping-policy/"],
    ],
  },
];

// "What AI says about us": each icon opens that assistant with a ready question about Pack Legacy.
// Logo paths come from Simple Icons (DeepSeek from Lobe Icons).
export const aiLinks = [
  {
    name: "ChatGPT",
    href: `https://chatgpt.com/?q=${AI_QUESTION}`,
    path: "M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z",
  },
  {
    name: "Perplexity",
    href: `https://www.perplexity.ai/search?q=${AI_QUESTION}`,
    path: "M22.3977 7.0896h-2.3106V.0676l-7.5094 6.3542V.1577h-1.1554v6.1966L4.4904 0v7.0896H1.6023v10.3976h2.8882V24l6.932-6.3591v6.2005h1.1554v-6.0469l6.9318 6.1807v-6.4879h2.8882V7.0896zm-3.4657-4.531v4.531h-5.355l5.355-4.531zm-13.2862.0676 4.8691 4.4634H5.6458V2.6262zM2.7576 16.332V8.245h7.8476l-6.1149 6.1147v1.9723H2.7576zm2.8882 5.0404v-3.8852h.0001v-2.6488l5.7763-5.7764v7.0111l-5.7764 5.2993zm12.7086.0248-5.7766-5.1509V9.0618l5.7766 5.7766v6.5588zm2.8882-5.0652h-1.733v-1.9723L13.3948 8.245h7.8478v8.087z",
  },
  {
    // Gemini has no public "ask" link, so this opens Google's AI Mode (powered by Gemini) with the question.
    name: "Google Gemini",
    href: `https://www.google.com/search?udm=50&q=${AI_QUESTION}`,
    path: "M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81",
  },
  {
    name: "Brave",
    href: `https://search.brave.com/search?summary=1&q=${AI_QUESTION}`,
    path: "M15.68 0l2.096 2.38s1.84-.512 2.709.358c.868.87 1.584 1.638 1.584 1.638l-.562 1.381.715 2.047s-2.104 7.98-2.35 8.955c-.486 1.919-.818 2.66-2.198 3.633-1.38.972-3.884 2.66-4.293 2.916-.409.256-.92.692-1.38.692-.46 0-.97-.436-1.38-.692a185.796 185.796 0 01-4.293-2.916c-1.38-.973-1.712-1.714-2.197-3.633-.247-.975-2.351-8.955-2.351-8.955l.715-2.047-.562-1.381s.716-.768 1.585-1.638c.868-.87 2.708-.358 2.708-.358L8.321 0h7.36zm-3.679 14.936c-.14 0-1.038.317-1.758.69-.72.373-1.242.637-1.409.742-.167.104-.065.301.087.409.152.107 2.194 1.69 2.393 1.866.198.175.489.464.687.464.198 0 .49-.29.688-.464.198-.175 2.24-1.759 2.392-1.866.152-.108.254-.305.087-.41-.167-.104-.689-.368-1.41-.741-.72-.373-1.617-.69-1.757-.69zm0-11.278s-.409.001-1.022.206-1.278.46-1.584.46c-.307 0-2.581-.434-2.581-.434S4.119 7.152 4.119 7.849c0 .697.339.881.68 1.243l2.02 2.149c.192.203.59.511.356 1.066-.235.555-.58 1.26-.196 1.977.384.716 1.042 1.194 1.464 1.115.421-.08 1.412-.598 1.776-.834.364-.237 1.518-1.19 1.518-1.554 0-.365-1.193-1.02-1.413-1.168-.22-.15-1.226-.725-1.247-.95-.02-.227-.012-.293.284-.851.297-.559.831-1.304.742-1.8-.089-.495-.95-.753-1.565-.986-.615-.232-1.799-.671-1.947-.74-.148-.068-.11-.133.339-.175.448-.043 1.719-.212 2.292-.052.573.16 1.552.403 1.632.532.079.13.149.134.067.579-.081.445-.5 2.581-.541 2.96-.04.38-.12.63.288.724.409.094 1.097.256 1.333.256s.924-.162 1.333-.256c.408-.093.329-.344.288-.723-.04-.38-.46-2.516-.541-2.961-.082-.445-.012-.45.067-.579.08-.129 1.059-.372 1.632-.532.573-.16 1.845.009 2.292.052.449.042.487.107.339.175-.148.069-1.332.508-1.947.74-.615.233-1.476.49-1.565.986-.09.496.445 1.241.742 1.8.297.558.304.624.284.85-.02.226-1.026.802-1.247.95-.22.15-1.413.804-1.413 1.169 0 .364 1.154 1.317 1.518 1.554.364.236 1.355.755 1.776.834.422.079 1.08-.4 1.464-1.115.384-.716.039-1.422-.195-1.977-.235-.555.163-.863.355-1.066l2.02-2.149c.341-.362.68-.546.68-1.243 0-.697-2.695-3.96-2.695-3.96s-2.274.436-2.58.436c-.307 0-.972-.256-1.585-.461-.613-.205-1.022-.206-1.022-.206z",
  },
  {
    // Opens Bing with Copilot chat for the question.
    name: "Microsoft Copilot",
    href: `https://www.bing.com/search?showconv=1&q=${AI_QUESTION}`,
    path: "M20.176 15.406a6.48 6.48 0 01-1.736 4.414c1.338-1.47.803-3.869-1.003-4.635-.862-.305-2.488-.85-3.367-1.158a1.834 1.834 0 01-.932-.818c-.381-.975-1.163-2.968-1.548-3.948-.095-.285-.31-.625-.265-.938.046-.598.724-1.003 1.276-.754l3.682 1.888c.621.292 1.305.692 1.796 1.172a6.486 6.486 0 012.097 4.777zm-1.44 1.888c-.264-1.194-1.135-1.744-2.216-2.028-1.527.902-4.853 2.878-6.952 4.13-1.103.68-2.13 1.35-2.919 1.242a2.866 2.866 0 01-2.77-2.325c-.012-.048-.008-.03-.001.01a6.4 6.4 0 00.947 2.653 6.498 6.498 0 005.486 3.022c1.908.062 3.536-1.153 5.099-2.096.292-.188.804-.496 1.332-.831l1.423-1.51c.553-.577.764-1.426.571-2.267zm-12.04 2.97c.422 0 .822-.1 1.173-.29.355-.215.964-.579 1.7-1.018L9.57 4.502c0-.99-.497-1.864-1.257-2.382-.08-.059-2.91-1.901-2.99-1.956-.605-.432-1.523.045-1.5.797v14.887l.417 2.36a2.488 2.488 0 002.455 2.056z",
  },
  {
    // DeepSeek has no official "ask" link. The question is passed in the URL and also copied
    // to the clipboard on click, so the visitor can paste it if DeepSeek opens an empty chat.
    name: "DeepSeek",
    href: `https://chat.deepseek.com/?q=${AI_QUESTION}`,
    copy: true,
    path: "M23.748 4.482c-.254-.124-.364.113-.512.234-.051.039-.094.09-.137.136-.372.397-.806.657-1.373.626-.829-.046-1.537.214-2.163.848-.133-.782-.575-1.248-1.247-1.548-.352-.156-.708-.311-.955-.65-.172-.241-.219-.51-.305-.774-.055-.16-.11-.323-.293-.35-.2-.031-.278.136-.356.276-.313.572-.434 1.202-.422 1.84.027 1.436.633 2.58 1.838 3.393.137.093.172.187.129.323-.082.28-.18.552-.266.833-.055.179-.137.217-.329.14a5.526 5.526 0 01-1.736-1.18c-.857-.828-1.631-1.742-2.597-2.458a11.365 11.365 0 00-.689-.471c-.985-.957.13-1.743.388-1.836.27-.098.093-.432-.779-.428-.872.004-1.67.295-2.687.684a3.055 3.055 0 01-.465.137 9.597 9.597 0 00-2.883-.102c-1.885.21-3.39 1.102-4.497 2.623C.082 8.606-.231 10.684.152 12.85c.403 2.284 1.569 4.175 3.36 5.653 1.858 1.533 3.997 2.284 6.438 2.14 1.482-.085 3.133-.284 4.994-1.860.47.234.962.327 1.78.397.63.059 1.236-.03 1.705-.128.735-.156.684-.837.419-.961-2.155-1.004-1.682-.595-2.113-.926 1.096-1.296 2.746-2.642 3.392-7.003.05-.347.007-.565 0-.845-.004-.17.035-.237.23-.256a4.173 4.173 0 001.545-.475c1.396-.763 1.960-2.015 2.093-3.517.02-.23-.004-.467-.247-.588zM11.581 18c-2.089-1.642-3.102-2.183-3.52-2.16-.392.024-.321.471-.235.763.09.288.207.486.371.739.114.167.192.416-.113.603-.673.416-1.842-.14-1.897-.167-1.361-.802-2.5-1.86-3.301-3.307-.774-1.393-1.224-2.887-1.298-4.482-.02-.386.093-.522.477-.592a4.696 4.696 0 011.529-.039c2.132.312 3.946 1.265 5.468 2.774.868.86 1.525 1.887 2.202 2.891.72 1.066 1.494 2.082 2.48 2.914.348.292.625.514.891.677-.802.09-2.140.11-3.054-.614zm1-6.44a.306.306 0 01.415-.287.302.302 0 01.2.288.306.306 0 01-.31.307.303.303 0 01-.304-.308zm3.11 1.596c-.2.081-.399.151-.59.16a1.245 1.245 0 01-.798-.254c-.274-.23-.47-.358-.552-.758a1.73 1.73 0 01.016-.588c.07-.327-.008-.537-.239-.727-.187-.156-.426-.199-.688-.199a.559.559 0 01-.254-.078c-.11-.054-.2-.19-.114-.358.028-.054.16-.186.192-.21.356-.202.767-.136 1.146.016.352.144.618.408 1.001.782.391.451.462.576.685.914.176.265.336.537.445.848.067.195-.019.354-.25.452z",
  },
];


/* Phone-only icons (outline style) for the contact rows; hidden above 767px, where the original icons show. */
const mIcon = (d: React.ReactNode) => (
  <svg className="pl-footer__m-ico" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{d}</svg>
);
const M_MAIL = mIcon(<><rect x="2.5" y="5" width="19" height="14" rx="2" /><path d="m3 6.5 9 6.5 9-6.5" /></>);
const M_PHONE = mIcon(<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />);
const M_PIN = mIcon(<><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>);
const M_ARROW = (
  <svg className="pl-footer__m-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M7 17 17 7" /><path d="M8 7h9v9" /></svg>
);

export default function Footer() {
  const [copiedFor, setCopiedFor] = useState("");

  // Copy the question before the new tab opens; the link itself still opens normally.
  const copyQuestion = (name: string) => {
    navigator.clipboard?.writeText(AI_QUESTION_TEXT).then(
      () => {
        setCopiedFor(name);
        window.setTimeout(() => setCopiedFor(""), 6000);
      },
      () => {}
    );
  };

  return (
    <footer className="site-footer-wrap">
      <div className="pl-footer">
        <div className="pl-footer__inner">
          {/* TOP: logo left / signup right */}
          <div className="pl-footer__top">
            <div className="pl-footer__logo">
              <a href="/">
                <img src="/images/pack-legacy-logo.webp" alt="Pack Legacy" width={210} height={40} style={{ width: 210, height: "auto" }} />
              </a>
            </div>

            <div className="pl-footer__signup pl-footer__ai">
              <div className="pl-footer__signup-heading pl-footer__ai-heading">
                What <span>AI</span> says about us
              </div>
              <ul className="pl-footer__ai-list">
                {aiLinks.map((a) => (
                  <li key={a.name}>
                    <a
                      href={a.href}
                      target="_blank"
                      rel="noopener nofollow"
                      aria-label={`Ask ${a.name} about Pack Legacy`}
                      title={`Ask ${a.name}`}
                      onClick={"copy" in a && a.copy ? () => copyQuestion(a.name) : undefined}
                    >
                      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" fillRule="evenodd" aria-hidden="true">
                        <path d={a.path} />
                      </svg>
                    </a>
                  </li>
                ))}
              </ul>
              <p className="pl-footer__ai-note" role="status" aria-live="polite">
                {copiedFor && `Question copied. If ${copiedFor} opens an empty chat, paste it (Ctrl+V) and press Enter.`}
              </p>
            </div>
          </div>

          {/* MAIN: contact + link columns */}
          <div className="pl-footer__cols">
            <div className="pl-footer__col pl-footer__col--contact">
              <ul className="pl-footer__contact">
                <li>
                  <i className="fas fa-envelope" aria-hidden="true"></i>
                  {M_MAIL}
                  <a href="mailto:sales@packlegacy.com">sales@packlegacy.com</a>
                  {M_ARROW}
                </li>
                <li>
                  <span className="pl-footer__d-ico">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#2E8B43" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M6.62 10.79a15.46 15.46 0 0 0 6.59 6.59l2.2-2.2a1.5 1.5 0 0 1 1.53-.36c.99.33 2.04.5 3.06.5a1.5 1.5 0 0 1 1.5 1.5v3.49a1.5 1.5 0 0 1-1.5 1.5C10.61 21.41 2.59 13.39 2.59 3.5A1.5 1.5 0 0 1 4.09 2h3.5a1.5 1.5 0 0 1 1.5 1.5c0 1.03.17 2.07.5 3.06a1.5 1.5 0 0 1-.36 1.53l-2.61 2.7z" />
                    </svg>
                  </span>
                  {M_PHONE}
                  <a href="tel:+14243216460">+1 (424) 321-6460</a>
                  {M_ARROW}
                </li>
                <li>
                  <i className="fas fa-map-marker-alt" aria-hidden="true"></i>
                  {M_PIN}
                  <span className="pl-footer__addr">520 Vetterlein Ave Hamilton Township, NJ 08619, USA</span>
                </li>
              </ul>

              <div className="pl-footer__follow">
                <span className="pl-footer__follow-label">Follow us:</span>
                <span className="pl-footer__follow-m">Let’s stay connected</span>
                <div className="pl-footer__social">
                  <a href="https://www.facebook.com/people/Pack-Legacy/61577888315684/" rel="nofollow" aria-label="Facebook"><i className="fab fa-facebook-f" aria-hidden="true"></i></a>
                  <a href="https://www.pinterest.com/PackLegacy/" rel="nofollow" aria-label="Pinterest"><i className="fab fa-pinterest-p" aria-hidden="true"></i></a>
                  <a href="https://www.linkedin.com/company/packlegacy/" rel="nofollow" aria-label="LinkedIn"><i className="fab fa-linkedin-in" aria-hidden="true"></i></a>
                  <a href="https://www.instagram.com/pack_legacy/" rel="nofollow" aria-label="Instagram"><i className="fab fa-instagram" aria-hidden="true"></i></a>
                </div>
              </div>
            </div>

            {cols.map((c) => (
              <div className="pl-footer__col" key={c.title}>
                <div className="pl-footer__col-title">{c.title}</div>
                <ul>
                  {c.links.map(([name, href]) => (
                    <li key={name}>
                      <a href={`${SITE}${href}`}>{name}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Phone only: the same three link lists as tap-to-open sections (<details>, works without JavaScript). */}
            <div className="pl-footer__acc">
              {cols.map((c) => (
                <details key={c.title}>
                  <summary>
                    {c.title}
                    <svg className="pl-footer__plus" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14" /><path d="M5 12h14" /></svg>
                  </summary>
                  <ul>
                    {c.links.map(([name, href]) => (
                      <li key={name}><a href={`${SITE}${href}`}>{name}</a></li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM WHITE BAR */}
        <div className="pl-footer__bar">
          <div className="pl-footer__bar-inner">
            <p className="pl-footer__copy">
              ©2026, <strong>Pack Legacy.</strong> All Rights Reserved.
            </p>
            <div className="pl-footer__payment">
              <span className="pl-footer__pay-label">Accepted payments</span>
              <img src="/images/payments.png" alt="Accepted payment methods" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
