import { INDEXABLE } from "@/lib/site";

// /robots.txt, served word for word as Pack Legacy's policy below. (Next's MetadataRoute.Robots
// cannot output comments or Content-Signal lines, so this is a plain-text route.)
// Crawlers are blocked until the live site sets ALLOW_INDEXING=true (see lib/site.ts).
export const dynamic = "force-static";

const POLICY = `# PACK LEGACY - ROBOTS.TXT
# Website: https://packlegacy.com
# Policy: Search, AI Discovery and Agentic Commerce

# 1. DEFAULT CRAWLING POLICY

User-agent: *
Content-Signal: search=yes, ai-input=yes, ai-train=yes

Allow: /
Allow: /_next/static/
Allow: /_next/image
Allow: /.well-known/
Allow: /llms.txt
Allow: /llms-full.txt
Allow: /pricing.md
Allow: /agents.md
Allow: /a2a.md
Allow: /openapi.json

Disallow: /admin/
Disallow: /dashboard/
Disallow: /preview/
Disallow: /api/auth/
Disallow: /api/admin/
Disallow: /api/internal/
Disallow: /api/preview/
Disallow: /cart/
Disallow: /checkout/
Disallow: /my-account/
Disallow: /search/
Disallow: /*?s=
Disallow: /*?add-to-cart=
Disallow: /*?utm_
Disallow: /*&utm_
Disallow: /*?gclid=
Disallow: /*&gclid=
Disallow: /*?fbclid=
Disallow: /*&fbclid=
Disallow: /*?msclkid=
Disallow: /*&msclkid=
Disallow: /*?ttclid=
Disallow: /*&ttclid=
Disallow: /*?_rsc=
Disallow: /*&_rsc=
Disallow: /*/feed/

# 2. SEARCH ENGINES, AI SEARCH, MEDIA AND COMMERCE

User-agent: Googlebot
User-agent: Googlebot-Image
User-agent: Googlebot-Video
User-agent: Googlebot-News
User-agent: Storebot-Google
User-agent: AdsBot-Google
User-agent: AdsBot-Google-Mobile
User-agent: Mediapartners-Google
User-agent: Bingbot
User-agent: MicrosoftPreview
User-agent: Applebot
User-agent: DuckDuckBot
User-agent: DuckAssistBot
User-agent: YandexBot
User-agent: Baiduspider
User-agent: Amazonbot
User-agent: OAI-SearchBot
User-agent: OAI-AdsBot
User-agent: ChatGPT-User
User-agent: Claude-SearchBot
User-agent: Claude-User
User-agent: PerplexityBot
User-agent: Perplexity-User
User-agent: meta-externalfetcher
User-agent: FacebookExternalHit
User-agent: Twitterbot
User-agent: LinkedInBot
User-agent: Pinterestbot
Content-Signal: search=yes, ai-input=yes, ai-train=yes

Allow: /
Allow: /_next/static/
Allow: /_next/image
Allow: /.well-known/
Allow: /llms.txt
Allow: /llms-full.txt
Allow: /pricing.md
Allow: /agents.md
Allow: /a2a.md
Allow: /openapi.json

Disallow: /admin/
Disallow: /dashboard/
Disallow: /preview/
Disallow: /api/auth/
Disallow: /api/admin/
Disallow: /api/internal/
Disallow: /api/preview/
Disallow: /cart/
Disallow: /checkout/
Disallow: /my-account/
Disallow: /search/
Disallow: /*?s=
Disallow: /*?add-to-cart=
Disallow: /*?_rsc=
Disallow: /*&_rsc=
Disallow: /*/feed/

# 3. AI MODEL TRAINING CRAWLERS

User-agent: GPTBot
User-agent: ClaudeBot
User-agent: Google-Extended
User-agent: Applebot-Extended
User-agent: meta-externalagent
User-agent: CCBot
Content-Signal: search=yes, ai-input=yes, ai-train=yes

Allow: /
Allow: /_next/static/
Allow: /_next/image
Allow: /.well-known/
Allow: /llms.txt
Allow: /llms-full.txt
Allow: /pricing.md
Allow: /agents.md
Allow: /a2a.md
Allow: /openapi.json

Disallow: /admin/
Disallow: /dashboard/
Disallow: /preview/
Disallow: /api/auth/
Disallow: /api/admin/
Disallow: /api/internal/
Disallow: /api/preview/
Disallow: /cart/
Disallow: /checkout/
Disallow: /my-account/
Disallow: /search/
Disallow: /*?s=
Disallow: /*?add-to-cart=
Disallow: /*?utm_
Disallow: /*&utm_
Disallow: /*?gclid=
Disallow: /*&gclid=
Disallow: /*?fbclid=
Disallow: /*&fbclid=
Disallow: /*?msclkid=
Disallow: /*&msclkid=
Disallow: /*?ttclid=
Disallow: /*&ttclid=
Disallow: /*?_rsc=
Disallow: /*&_rsc=
Disallow: /*/feed/

# 4. UNWANTED AND LOW-PRIORITY CRAWLERS

User-agent: Bytespider
User-agent: PetalBot
User-agent: SeekportBot
User-agent: DotBot

Disallow: /

# 5. XML SITEMAP

Sitemap: https://packlegacy.com/sitemap_index.xml
`;

const BLOCK_ALL = "User-agent: *\nDisallow: /\n";

export function GET() {
  return new Response(INDEXABLE ? POLICY : BLOCK_ALL, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
