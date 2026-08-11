import type { ReactNode } from "react";

const tokenPattern =
  /(\/\/[^\n]*|#[^\n]*)|("(?:\\.|[^"\\])*"(?=\s*:)|[A-Za-z_$][\w$-]*(?=\s*:))|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\b\d+(?:\.\d+)?h?\b)|(\b(?:policy|on|deny|when|allow|otherwise|escalate|view|scope|scopes|role|effect|reads|writes|idempotency|enforcement|transaction|reservation|DENY|ESCALATE|ALLOW|from|import|async|with|as|await|if|elif|else|return|for|in|True|False|None|true|false|null)\b)|(\b[A-Za-z_$][\w$]*(?=\s*\())|(=>|==|!=|>=|<=|>|<|=|\+|-|\*|\/|[{}[\]();,.:])/g;

function tokenClass(match: RegExpExecArray) {
  if (match[1]) return "comment";
  if (match[2]) return "key";
  if (match[3]) return "string";
  if (match[4]) return "number";
  if (match[5]) return "keyword";
  if (match[6]) return "function";
  return "operator";
}

function highlight(code: string) {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let tokenIndex = 0;

  for (const match of code.matchAll(tokenPattern)) {
    const index = match.index ?? 0;
    if (index > cursor) nodes.push(code.slice(cursor, index));

    nodes.push(
      <span
        className={`syntax-token syntax-${tokenClass(match)}`}
        key={`${index}-${tokenIndex}`}
      >
        {match[0]}
      </span>,
    );
    cursor = index + match[0].length;
    tokenIndex += 1;
  }

  if (cursor < code.length) nodes.push(code.slice(cursor));
  return nodes;
}

export function HighlightedCode({
  code,
  language,
}: {
  code: string;
  language: string;
}) {
  const languageClass = language.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <code
      className={`syntax-code language-${languageClass}`}
      data-language={language}
    >
      {highlight(code)}
    </code>
  );
}
