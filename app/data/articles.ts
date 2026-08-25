import { masugatePublicSourceRelease } from "../content/articles/masugate-public-source-release";
import { policyAsCodeNotPromptArticle } from "../content/articles/policy-as-code-not-prompt";
import { whenTimeBecomesAgentPolicyArticle } from "../content/articles/when-time-becomes-agent-policy";
import { whenAllowedGoesStaleArticle } from "../content/articles/when-allowed-goes-stale";
import type {
  ArticleBlock,
  PublishedArticle,
} from "./article-types";

export type {
  ArticleBlock,
  ArticleCodeBlock,
  ArticleCitation,
  ArticleHref,
  ArticleRelatedLink,
  ArticleSection,
  PublicationType,
  PublishedArticle,
} from "./article-types";

// Planned topics stay in planning/README.md. An entry belongs here only after
// its complete body, evidence boundary, limitations, sources, and related
// links are ready for publication.
export const publishedArticles: readonly PublishedArticle[] = [
  masugatePublicSourceRelease,
  policyAsCodeNotPromptArticle,
  whenAllowedGoesStaleArticle,
  whenTimeBecomesAgentPolicyArticle,
];

export const hasPublishedArticles: boolean = publishedArticles.length > 0;

function publicationDate(article: PublishedArticle): string {
  return article.updatedAt ?? article.publishedAt;
}

function sortByMostRecent(
  articles: readonly PublishedArticle[],
): readonly PublishedArticle[] {
  return articles
    .map((article, manifestIndex) => ({ article, manifestIndex }))
    .sort(
      (left, right) =>
        publicationDate(right.article).localeCompare(
          publicationDate(left.article),
        ) || left.manifestIndex - right.manifestIndex,
    )
    .map(({ article }) => article);
}

function sortByNewestPublication(
  articles: readonly PublishedArticle[],
): readonly PublishedArticle[] {
  return articles
    .map((article, manifestIndex) => ({ article, manifestIndex }))
    .sort(
      (left, right) =>
        right.article.publishedAt.localeCompare(left.article.publishedAt) ||
        left.manifestIndex - right.manifestIndex,
    )
    .map(({ article }) => article);
}

export function selectHomepageArticles(
  limit = 2,
): readonly PublishedArticle[] {
  const safeLimit = Number.isFinite(limit)
    ? Math.max(0, Math.trunc(limit))
    : 0;

  return sortByMostRecent(publishedArticles).slice(0, safeLimit);
}

export function selectLatestAnnouncement(
  articles: readonly PublishedArticle[] = publishedArticles,
): PublishedArticle | undefined {
  return sortByNewestPublication(
    articles.filter(
      ({ publicationType, showInBanner }) =>
        publicationType === "announcement" && showInBanner,
    ),
  )[0];
}

export function selectBlogIndexPublications(
  articles: readonly PublishedArticle[] = publishedArticles,
): readonly PublishedArticle[] {
  const recent = sortByMostRecent(articles);
  return [
    ...recent.filter(({ publicationType }) => publicationType === "announcement"),
    ...recent.filter(({ publicationType }) => publicationType === "article"),
  ];
}

export function getPublishedArticle(
  slug: string,
): PublishedArticle | undefined {
  return publishedArticles.find((article) => article.slug === slug);
}

function referencedCitationIds(block: ArticleBlock): readonly string[] {
  if (block.kind === "paragraph" || block.kind === "callout") {
    return block.citationIds ?? [];
  }

  return [];
}

function isValidIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().startsWith(value);
}

function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
}

function isNavigableHref(value: string, allowFragment = false): boolean {
  return (
    value.startsWith("/") ||
    value.startsWith("https://") ||
    (allowFragment && value.startsWith("#"))
  );
}

export function validatePublishedArticles(
  articles: readonly PublishedArticle[] = publishedArticles,
): readonly string[] {
  const errors: string[] = [];
  const slugs = new Set<string>();
  const hrefs = new Set<string>();

  if (articles.length === 0) {
    return errors;
  }

  for (const article of articles) {
    const prefix = `Article ${article.slug}`;

    if (!["article", "announcement"].includes(article.publicationType)) {
      errors.push(`${prefix} has an invalid publication type.`);
    }
    if (typeof article.showInBanner !== "boolean") {
      errors.push(`${prefix} has an invalid banner setting.`);
    }
    if (article.publicationType !== "announcement" && article.showInBanner) {
      errors.push(`${prefix} cannot place a non-announcement in the banner.`);
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug)) {
      errors.push(`${prefix} has an invalid slug.`);
    }
    if (slugs.has(article.slug)) {
      errors.push(`${prefix} duplicates a published slug.`);
    }
    slugs.add(article.slug);

    const expectedHref = `/blog/${article.slug}/`;
    if (article.href !== expectedHref) {
      errors.push(`${prefix} href must be ${expectedHref}.`);
    }
    if (hrefs.has(article.href)) {
      errors.push(`${prefix} duplicates a published href.`);
    }
    hrefs.add(article.href);

    for (const [field, value] of [
      ["title", article.title],
      ["summary", article.summary],
      ["audience", article.audience],
    ] as const) {
      if (!isNonEmpty(value)) {
        errors.push(`${prefix} has an empty ${field}.`);
      }
    }

    if (!isValidIsoDate(article.publishedAt)) {
      errors.push(`${prefix} has an invalid publication date.`);
    }
    if (article.updatedAt && !isValidIsoDate(article.updatedAt)) {
      errors.push(`${prefix} has an invalid updated date.`);
    }
    if (article.updatedAt && article.updatedAt < article.publishedAt) {
      errors.push(`${prefix} is updated before it was published.`);
    }
    if (!Number.isInteger(article.readingMinutes) || article.readingMinutes <= 0) {
      errors.push(`${prefix} must have a positive integer reading time.`);
    }

    if (article.labels.length === 0 || article.labels.some((label) => !isNonEmpty(label))) {
      errors.push(`${prefix} must have non-empty topic labels.`);
    }
    if (new Set(article.labels).size !== article.labels.length) {
      errors.push(`${prefix} has duplicate topic labels.`);
    }
    if (article.limitations.length === 0 || article.limitations.some((item) => !isNonEmpty(item))) {
      errors.push(`${prefix} must state at least one non-empty limitation.`);
    }
    if (
      article.relatedReleaseId !== undefined &&
      !isNonEmpty(article.relatedReleaseId)
    ) {
      errors.push(`${prefix} has an empty related release.`);
    }
    if (
      article.relatedPolicyRevision !== undefined &&
      !isNonEmpty(article.relatedPolicyRevision)
    ) {
      errors.push(`${prefix} has an empty related policy revision.`);
    }
    if (
      article.relatedSourceRevision !== undefined &&
      !isNonEmpty(article.relatedSourceRevision)
    ) {
      errors.push(`${prefix} has an empty related source revision.`);
    }

    if (article.evidence.status === "reference") {
      if (!isNonEmpty(article.evidence.locator)) {
        errors.push(`${prefix} must name its evidence locator.`);
      }
      if (!isNonEmpty(article.evidence.note)) {
        errors.push(`${prefix} must explain its Reference evidence boundary.`);
      }
      if (
        article.evidence.sourceKind === "research-paper" &&
        !article.relatedSourceRevision
      ) {
        errors.push(`${prefix} must pin its related research source revision.`);
      }
    } else {
      if (!article.evidence.href.startsWith("https://")) {
        errors.push(`${prefix} verified evidence must use HTTPS.`);
      }
      if (
        !isNonEmpty(article.evidence.immutableRevision) ||
        !isNonEmpty(article.evidence.gate) ||
        !isValidIsoDate(article.evidence.verifiedAt)
      ) {
        errors.push(`${prefix} has incomplete verified evidence metadata.`);
      }
    }

    const citationIds = new Set<string>();
    if (article.citations.length === 0) {
      errors.push(`${prefix} must cite at least one named source.`);
    }
    for (const citation of article.citations) {
      if (!isNonEmpty(citation.id) || !isNonEmpty(citation.title) || !isNonEmpty(citation.publisher)) {
        errors.push(`${prefix} has an incomplete citation.`);
      }
      if (citationIds.has(citation.id)) {
        errors.push(`${prefix} duplicates citation ${citation.id}.`);
      }
      citationIds.add(citation.id);
      if (!citation.href.startsWith("https://")) {
        errors.push(`${prefix} citation ${citation.id} must use HTTPS.`);
      }
    }

    const sectionIds = new Set<string>();
    if (article.sections.length === 0) {
      errors.push(`${prefix} must have a real article body.`);
    }
    for (const section of article.sections) {
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(section.id)) {
        errors.push(`${prefix} has invalid section id ${section.id}.`);
      }
      if (sectionIds.has(section.id)) {
        errors.push(`${prefix} duplicates section id ${section.id}.`);
      }
      sectionIds.add(section.id);
      if (!isNonEmpty(section.eyebrow) || !isNonEmpty(section.title) || section.blocks.length === 0) {
        errors.push(`${prefix} section ${section.id} is incomplete.`);
      }

      for (const block of section.blocks) {
        for (const citationId of referencedCitationIds(block)) {
          if (!citationIds.has(citationId)) {
            errors.push(
              `${prefix} section ${section.id} references missing citation ${citationId}.`,
            );
          }
        }

        if (block.kind === "paragraph" && !isNonEmpty(block.text)) {
          errors.push(`${prefix} section ${section.id} has an empty paragraph.`);
        }
        if (
          block.kind === "list" &&
          (block.items.length === 0 ||
            block.items.some((item) => !isNonEmpty(item)))
        ) {
          errors.push(`${prefix} section ${section.id} has an incomplete list.`);
        }
        if (
          block.kind === "comparison" &&
          (block.items.length < 2 ||
            block.items.some(
              (item) =>
                !isNonEmpty(item.label) ||
                !isNonEmpty(item.title) ||
                !isNonEmpty(item.description),
            ))
        ) {
          errors.push(`${prefix} section ${section.id} has an incomplete comparison.`);
        }
        if (
          block.kind === "code" &&
          (!isNonEmpty(block.label) ||
            !isNonEmpty(block.language) ||
            !isNonEmpty(block.code) ||
            !isNonEmpty(block.note) ||
            !block.contextLink ||
            !isNonEmpty(block.contextLink.label) ||
            !isNavigableHref(block.contextLink.href, true))
        ) {
          errors.push(`${prefix} section ${section.id} has an incomplete code block.`);
        }
        if (
          block.kind === "callout" &&
          (!isNonEmpty(block.label) || !isNonEmpty(block.text))
        ) {
          errors.push(`${prefix} section ${section.id} has an incomplete callout.`);
        }
        if (
          block.kind === "diagram" &&
          (!isNonEmpty(block.title) ||
            !isNonEmpty(block.description) ||
            !isNonEmpty(block.caption) ||
            (block.source !== undefined &&
              (!isNonEmpty(block.source.label) ||
                !block.source.href.startsWith("https://"))))
        ) {
          errors.push(`${prefix} section ${section.id} has an incomplete diagram.`);
        }
      }
    }

    if (article.relatedLinks.length === 0) {
      errors.push(`${prefix} must include at least one related link.`);
    }
    for (const link of article.relatedLinks) {
      if (!isNonEmpty(link.label) || !isNonEmpty(link.title) || !isNonEmpty(link.description)) {
        errors.push(`${prefix} has an incomplete related link.`);
      }
      if (!isNavigableHref(link.href)) {
        errors.push(`${prefix} related link ${link.title} has an invalid destination.`);
      }
    }
  }

  for (const article of articles) {
    for (const link of article.relatedLinks) {
      if (link.href.startsWith("/blog/") && !hrefs.has(link.href)) {
        errors.push(
          `Article ${article.slug} links to unpublished Blog destination ${link.href}.`,
        );
      }
    }
  }

  return errors;
}

export const articleValidationErrors = validatePublishedArticles();
