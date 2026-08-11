import { HighlightedCode } from "./HighlightedCode";

export function ArticleCode({
  label,
  language,
  children,
}: {
  label: string;
  language: string;
  children: string;
}) {
  return (
    <div className="article-code">
      <header>
        <span>{label}</span>
        <b>{language}</b>
      </header>
      <pre><HighlightedCode code={children} language={language} /></pre>
    </div>
  );
}

export function ArticleMeta({
  type,
  audience,
  readingTime,
  byline = "SAGE Project",
  updated = "July 2026",
}: {
  type: string;
  audience: string;
  readingTime: string;
  byline?: string;
  updated?: string;
}) {
  return (
    <div className="article-meta-card">
      <span>{type}</span>
      <dl>
        <div><dt>By</dt><dd>{byline}</dd></div>
        <div><dt>For</dt><dd>{audience}</dd></div>
        <div><dt>Reading time</dt><dd>{readingTime}</dd></div>
        <div><dt>Updated</dt><dd>{updated}</dd></div>
      </dl>
    </div>
  );
}
