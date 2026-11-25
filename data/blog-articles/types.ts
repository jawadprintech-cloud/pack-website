// Article body blocks for blog posts (rendered by app/blog/[slug]/page.tsx).
// Text is based on the matching posts on https://packlegacy.com/blog/, mostly rewritten. Inline images (img) live in public/pages/blog/.
// Inline markup in any string: **bold** and [link text](/path/).
export type ArticleBlock =
  | { h2: string }
  | { h3: string }
  | { h4: string }
  | { p: string }
  | { ul: string[] }
  | { ol: string[] }
  | { table: { head: string[]; rows: string[][] } }
  | { tip: string }
  | { calc: "gsm" }
  | { img: { src: string; alt: string; width: number; height: number } };

export type Article = ArticleBlock[];
