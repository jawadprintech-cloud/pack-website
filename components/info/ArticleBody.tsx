// Renders a blog article from data/blog-articles (headings, paragraphs, lists, tables, tips).
// Styles come from .ip-prose in styles/info-pages.css.
import type { ReactNode } from "react";
import type { Article } from "@/data/blog-articles/types";
import GsmCalculator from "./GsmCalculator";

/** Turns **bold** and [text](href) into elements. */
function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] !== undefined) out.push(<strong key={k++}>{m[1]}</strong>);
    else out.push(<a key={k++} href={m[3]}>{m[2]}</a>);
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const slug = (s: string) => s.toLowerCase().replace(/<[^>]+>|\*\*/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Articles with few main headings (h2) also list their subheadings (h3) in the table of contents. */
const tocHasH3 = (article: Article) => article.filter((b) => "h2" in b).length <= 3;

/** Id and title per block (undefined if not in the table of contents). Repeated headings get -2, -3… */
function headings(article: Article) {
  const withH3 = tocHasH3(article);
  const seen = new Map<string, number>();
  return article.map((b) => {
    const title = "h2" in b ? b.h2 : withH3 && "h3" in b ? b.h3 : undefined;
    if (title === undefined) return undefined;
    const base = slug(title);
    const n = (seen.get(base) || 0) + 1;
    seen.set(base, n);
    return { id: n > 1 ? `${base}-${n}` : base, title };
  });
}

/** Section headings, for the table of contents. */
export function articleToc(article: Article) {
  return headings(article).filter((h) => h !== undefined);
}

export default function ArticleBody({ article }: { article: Article }) {
  const heads = headings(article);
  return (
    <>
      {article.map((b, i) => {
        if ("h2" in b) return <h2 key={i} id={heads[i]?.id}>{inline(b.h2)}</h2>;
        if ("h3" in b) return <h3 key={i} id={heads[i]?.id}>{inline(b.h3)}</h3>;
        if ("h4" in b) return <h4 key={i}>{inline(b.h4)}</h4>;
        if ("p" in b) return <p key={i}>{inline(b.p)}</p>;
        if ("ul" in b) return <ul key={i}>{b.ul.map((li, j) => <li key={j}>{inline(li)}</li>)}</ul>;
        if ("ol" in b) return <ol key={i}>{b.ol.map((li, j) => <li key={j}>{inline(li)}</li>)}</ol>;
        if ("tip" in b) return <p key={i} className="ip-note">{inline(b.tip)}</p>;
        if ("calc" in b) return <GsmCalculator key={i} />;
        if ("img" in b) return <figure key={i} className="ba-img"><img {...b.img} loading="lazy" /></figure>;
        return (
          <div key={i} className="ip-table-wrap">
            <table className="ip-table">
              <thead>
                <tr>{b.table.head.map((h, j) => <th key={j} scope="col">{inline(h)}</th>)}</tr>
              </thead>
              <tbody>
                {b.table.rows.map((r, j) => (
                  <tr key={j}>{r.map((c, n) => <td key={n}>{inline(c)}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </>
  );
}
