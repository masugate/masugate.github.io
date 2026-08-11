import type { Evidence, IsoDate } from "./contracts";

export type ArticleHref = `/blog/${string}/`;
export type PublicationType = "article" | "announcement";

export interface ArticleCitation {
  id: string;
  title: string;
  publisher: string;
  href: `https://${string}`;
  note?: string;
}

export interface ArticleRelatedLink {
  label: string;
  title: string;
  description: string;
  href: string;
}

export interface ArticleParagraphBlock {
  kind: "paragraph";
  text: string;
  citationIds?: readonly string[];
}

export interface ArticleListBlock {
  kind: "list";
  ordered?: boolean;
  items: readonly string[];
}

export interface ArticleComparisonBlock {
  kind: "comparison";
  items: readonly Readonly<{
    label: string;
    title: string;
    description: string;
  }>[];
}

export interface ArticleCodeBlock {
  kind: "code";
  label: string;
  language: string;
  code: string;
  note: string;
  contextLink: Readonly<{
    label: string;
    href: string;
  }>;
}

export interface ArticleCalloutBlock {
  kind: "callout";
  label: string;
  text: string;
  tone: "note" | "boundary" | "evidence";
  citationIds?: readonly string[];
}

export interface ArticleDiagramBlock {
  kind: "diagram";
  variant: "policy-separation" | "stale-budget" | "governance-boundary";
  title: string;
  description: string;
  caption: string;
  source?: Readonly<{
    label: string;
    href: `https://${string}`;
  }>;
}

export type ArticleBlock =
  | ArticleParagraphBlock
  | ArticleListBlock
  | ArticleComparisonBlock
  | ArticleCodeBlock
  | ArticleCalloutBlock
  | ArticleDiagramBlock;

export interface ArticleSection {
  id: string;
  eyebrow: string;
  title: string;
  blocks: readonly ArticleBlock[];
}

export interface PublishedArticle {
  status: "published";
  publicationType: PublicationType;
  showInBanner: boolean;
  slug: string;
  href: ArticleHref;
  title: string;
  summary: string;
  audience: string;
  publishedAt: IsoDate;
  updatedAt?: IsoDate;
  labels: readonly string[];
  readingMinutes: number;
  relatedReleaseId?: string;
  relatedPolicyRevision?: string;
  relatedSourceRevision?: string;
  evidence: Evidence;
  limitations: readonly string[];
  citations: readonly ArticleCitation[];
  sections: readonly ArticleSection[];
  relatedLinks: readonly ArticleRelatedLink[];
}
