import assert from "node:assert/strict";
import test from "node:test";
import { build } from "esbuild";

async function importBundled(entryPoint) {
  const result = await build({
    absWorkingDir: process.cwd(),
    bundle: true,
    entryPoints: [entryPoint],
    format: "esm",
    logLevel: "silent",
    platform: "node",
    write: false,
  });
  const output = result.outputFiles[0];
  assert.ok(output, `esbuild did not produce output for ${entryPoint}`);

  const encoded = Buffer.from(output.contents).toString("base64");
  return import(`data:text/javascript;base64,${encoded}#${Date.now()}-${entryPoint}`);
}

const articleModule = await importBundled("app/data/articles.ts");
const {
  articleValidationErrors,
  blogPresentation,
  getPublishedArticle,
  hasPublishedArticles,
  publishedArticles,
  selectBlogIndexPublications,
  selectBlogNavigationArticles,
  selectHomepageArticles,
  selectLatestAnnouncement,
  validatePublishedArticles,
} = articleModule;

test("blog presentation labels live with the typed publication contract", () => {
  assert.deepEqual(blogPresentation.index, {
    ledgerLabel: "Publication ledger",
    entriesLabel: "Current entries",
    updatedLabel: "Updated",
    publishedLabel: "Published",
  });
  assert.equal(blogPresentation.article.backLabel, "Blog & Updates");
  assert.equal(blogPresentation.article.recordLabel, "Article record");
});

test("the publication manifest contains the release announcement and editorial series", () => {
  assert.equal(hasPublishedArticles, true);
  assert.deepEqual(articleValidationErrors, []);
  assert.deepEqual(validatePublishedArticles(publishedArticles), []);
  assert.deepEqual(
    publishedArticles.map(({ slug, publicationType, showInBanner, evidence }) => ({
      slug,
      publicationType,
      showInBanner,
      evidence: evidence.status,
    })),
    [
      {
        slug: "masugate-public-source-release",
        publicationType: "announcement",
        showInBanner: true,
        evidence: "reference",
      },
      {
        slug: "policy-as-code-not-prompt",
        publicationType: "article",
        showInBanner: false,
        evidence: "reference",
      },
      {
        slug: "when-allowed-goes-stale",
        publicationType: "article",
        showInBanner: false,
        evidence: "reference",
      },
      {
        slug: "when-time-becomes-agent-policy",
        publicationType: "article",
        showInBanner: false,
        evidence: "reference",
      },
    ],
  );

  for (const article of publishedArticles) {
    assert.ok(article.sections.length >= 5, `${article.slug} needs a substantive body`);
    assert.ok(article.citations.length > 0, `${article.slug} needs sources`);
    assert.ok(article.limitations.length > 0, `${article.slug} needs limitations`);
    assert.ok(article.relatedLinks.length > 0, `${article.slug} needs related links`);
  }
});

test("the announcement connects the website, repository, and pinned paper", () => {
  const announcement = getPublishedArticle("masugate-public-source-release");
  const policyArticle = getPublishedArticle("policy-as-code-not-prompt");
  const statefulArticle = getPublishedArticle("when-allowed-goes-stale");
  const timeArticle = getPublishedArticle("when-time-becomes-agent-policy");
  assert.ok(announcement);
  assert.ok(policyArticle);
  assert.ok(statefulArticle);
  assert.ok(timeArticle);

  assert.equal(announcement.readingMinutes, 4);
  assert.equal(announcement.publicationType, "announcement");
  assert.equal(announcement.publishedAt, "2026-08-16");
  assert.equal(announcement.updatedAt, "2026-08-25");
  assert.equal(
    announcement.relatedReleaseId,
    "MasuGate 0.1.1 · public-source research preview",
  );
  assert.match(announcement.summary, /MasuGate 0\.1\.1/);
  assert.match(announcement.evidence.locator, /0\.1\.1/);
  assert.ok(
    announcement.sections.some(({ blocks }) =>
      blocks.some(
        (block) =>
          block.kind === "paragraph" &&
          block.text.includes("opening the MasuGate 0.1.0"),
      ),
    ),
    "the dated announcement must preserve the initial 0.1.0 opening",
  );
  assert.ok(
    announcement.sections.some(({ blocks }) =>
      blocks.some(
        (block) =>
          block.kind === "callout" &&
          block.label === "Update · current review target" &&
          block.text.includes("Reviewers should use 0.1.1"),
      ),
    ),
    "the announcement must identify 0.1.1 as the current review target",
  );
  assert.ok(
    announcement.citations.some(
      ({ id, href }) =>
        id === "masugate-paper" &&
        href === "https://arxiv.org/abs/2608.02764v2",
    ),
    "the announcement's v2 paper citation must be version-pinned",
  );
  assert.equal(timeArticle.readingMinutes, 11);
  assert.equal(timeArticle.publicationType, "article");
  assert.equal(timeArticle.showInBanner, false);
  assert.ok(
    timeArticle.citations.some(
      ({ id, href }) =>
        id === "event-history-provider" &&
        href ===
          "https://github.com/masugate/masugate/blob/main/docs/event-history-provider.md",
    ),
    "the time-aware article must cite the implemented event-history boundary",
  );
  assert.ok(
    timeArticle.relatedLinks.some(
      ({ href }) =>
        href ===
        "https://github.com/masugate/masugate/blob/main/docs/event-history-provider.md",
    ),
    "the time-aware article must link to the event-history provider guide",
  );
  assert.match(
    JSON.stringify(timeArticle),
    /experimental, opt-in event-history provider/,
  );
  assert.match(JSON.stringify(timeArticle), /outside (?:the )?0\.1\.1/);
  assert.match(JSON.stringify(timeArticle), /disabled by default/);
  for (const href of [
    "/",
    "https://github.com/masugate/masugate",
    "https://arxiv.org/abs/2608.02764",
  ]) {
    assert.ok(
      announcement.relatedLinks.some((link) => link.href === href),
      `release announcement must link to ${href}`,
    );
  }
  assert.match(JSON.stringify(announcement), /LangChain/);
  assert.match(JSON.stringify(announcement), /Microsoft Agent Framework/);
  assert.match(JSON.stringify(announcement), /CrewAI/);
  assert.match(JSON.stringify(announcement), /OpenClaw/);

  assert.ok(
    policyArticle.relatedLinks.some(
      ({ href }) => href === "/blog/when-allowed-goes-stale/",
    ),
  );
  assert.ok(
    statefulArticle.relatedLinks.some(
      ({ href }) => href === "/blog/policy-as-code-not-prompt/",
    ),
  );
  assert.ok(statefulArticle.relatedLinks.some(({ href }) => href === "/demo/"));
  assert.ok(
    statefulArticle.relatedLinks.some(
      ({ href }) => href === "https://arxiv.org/abs/2608.02764v1",
    ),
  );
  assert.equal(
    statefulArticle.relatedSourceRevision,
    "arXiv:2608.02764v1 · 3 August 2026",
  );
  assert.deepEqual(
    statefulArticle.citations.map(({ id, href }) => ({ id, href })),
    [
      {
        id: "masugate-paper",
        href: "https://arxiv.org/abs/2608.02764v1",
      },
    ],
    "the arXiv abstract and HTML renderings are one bibliographic source",
  );
});

test("the homepage selector returns the latest bounded set without mutating the manifest", () => {
  const originalOrder = publishedArticles.map(({ slug }) => slug);

  assert.deepEqual(
    selectHomepageArticles().map(({ slug }) => slug),
    ["masugate-public-source-release", "when-time-becomes-agent-policy"],
    "the latest publication or update leads the bounded homepage selection",
  );
  assert.deepEqual(
    selectHomepageArticles(1).map(({ slug }) => slug),
    ["masugate-public-source-release"],
  );
  assert.deepEqual(selectHomepageArticles(0), []);
  assert.deepEqual(selectHomepageArticles(Number.NaN), []);
  assert.deepEqual(
    publishedArticles.map(({ slug }) => slug),
    originalOrder,
    "homepage selection must not reorder the publication manifest",
  );
});

test("the global banner selects only the newest eligible announcement", () => {
  const base = getPublishedArticle("policy-as-code-not-prompt");
  assert.ok(base);
  assert.equal(
    selectLatestAnnouncement()?.slug,
    "masugate-public-source-release",
  );

  const olderButRecentlyEdited = {
    ...base,
    publicationType: "announcement",
    showInBanner: true,
    slug: "older-announcement",
    href: "/blog/older-announcement/",
    publishedAt: "2026-08-09",
    updatedAt: "2026-12-01",
  };
  const newest = {
    ...base,
    publicationType: "announcement",
    showInBanner: true,
    slug: "newest-announcement",
    href: "/blog/newest-announcement/",
    publishedAt: "2026-08-10",
    updatedAt: undefined,
  };
  const hidden = {
    ...base,
    publicationType: "announcement",
    showInBanner: false,
    slug: "hidden-announcement",
    href: "/blog/hidden-announcement/",
    publishedAt: "2026-08-11",
    updatedAt: undefined,
  };
  const flaggedArticle = { ...base, showInBanner: true };
  const candidates = [olderButRecentlyEdited, newest, hidden, flaggedArticle];
  const originalOrder = candidates.map(({ slug }) => slug);

  assert.equal(selectLatestAnnouncement(candidates)?.slug, "newest-announcement");
  assert.equal(selectLatestAnnouncement([hidden, flaggedArticle]), undefined);
  assert.equal(
    selectLatestAnnouncement([
      newest,
      { ...newest, slug: "same-day-second", href: "/blog/same-day-second/" },
    ])?.slug,
    "newest-announcement",
    "same-day announcements preserve manifest order",
  );
  assert.deepEqual(
    candidates.map(({ slug }) => slug),
    originalOrder,
    "banner selection must not mutate the manifest",
  );
  assert.equal(
    selectBlogIndexPublications([base, olderButRecentlyEdited])[0]?.slug,
    "older-announcement",
    "announcements lead the Blog & Updates index",
  );
});

test("the Blog navigation lists every technical article and excludes announcements", () => {
  const navigationArticles = selectBlogNavigationArticles();

  assert.deepEqual(
    navigationArticles.map(({ slug }) => slug),
    [
      "when-time-becomes-agent-policy",
      "policy-as-code-not-prompt",
      "when-allowed-goes-stale",
    ],
  );
  assert.ok(
    navigationArticles.every(
      ({ publicationType }) => publicationType === "article",
    ),
  );
  assert.equal(
    navigationArticles.some(
      ({ slug }) => slug === "masugate-public-source-release",
    ),
    false,
  );
});

test("published articles do not publish release-gated commands or evidence labels", () => {
  const serialized = JSON.stringify(publishedArticles);

  assert.doesNotMatch(serialized, /"status":"verified"|"status":"recorded"/i);
  assert.doesNotMatch(
    serialized,
    /\b(?:pip3?|npm|npx|pnpm|yarn)\s+(?:install|add|run)\b|\buv\s+sync\b|\bgit\s+clone\b|\bdocker\s+compose\b/i,
  );
  assert.doesNotMatch(serialized, /\bOmnigent\b/);
});

test("article validation rejects broken publication metadata and links", () => {
  const first = getPublishedArticle("policy-as-code-not-prompt");
  assert.ok(first);

  const errors = validatePublishedArticles([
    {
      ...first,
      href: "/blog/wrong/",
      citations: [],
      limitations: [],
    },
  ]).join("\n");

  assert.match(errors, /href must be \/blog\/policy-as-code-not-prompt\//);
  assert.match(errors, /must cite at least one named source/);
  assert.match(errors, /must state at least one non-empty limitation/);
  assert.match(errors, /unpublished Blog destination/);
});

test("article validation rejects unsafe banner metadata", () => {
  const first = getPublishedArticle("policy-as-code-not-prompt");
  assert.ok(first);

  assert.match(
    validatePublishedArticles([{ ...first, showInBanner: true }]).join("\n"),
    /cannot place a non-announcement in the banner/,
  );
  assert.match(
    validatePublishedArticles([{ ...first, showInBanner: "yes" }]).join("\n"),
    /invalid banner setting/,
  );
  assert.match(
    validatePublishedArticles([{ ...first, publicationType: "notice" }]).join("\n"),
    /invalid publication type/,
  );
});

test("article validation rejects incomplete body blocks", () => {
  const [first] = publishedArticles;
  assert.ok(first);

  const cases = [
    [{ kind: "paragraph", text: " " }, /empty paragraph/],
    [{ kind: "list", items: [""] }, /incomplete list/],
    [
      {
        kind: "comparison",
        items: [
          { label: "A", title: "", description: "First" },
          { label: "B", title: "Second", description: "Second" },
        ],
      },
      /incomplete comparison/,
    ],
    [
      {
        kind: "code",
        label: "Example",
        language: "Pseudocode",
        code: "allow",
        note: "Conceptual only",
        contextLink: { label: "", href: "ftp://invalid" },
      },
      /incomplete code block/,
    ],
    [
      { kind: "callout", label: "", text: "Boundary", tone: "note" },
      /incomplete callout/,
    ],
    [
      {
        kind: "diagram",
        variant: "policy-separation",
        title: "Diagram",
        description: "",
        caption: "Caption",
      },
      /incomplete diagram/,
    ],
  ];

  for (const [block, expected] of cases) {
    const invalidArticles = publishedArticles.map((article, articleIndex) =>
      articleIndex === 0
        ? {
            ...article,
            sections: article.sections.map((section, sectionIndex) =>
              sectionIndex === 0 ? { ...section, blocks: [block] } : section,
            ),
          }
        : article,
    );

    assert.match(validatePublishedArticles(invalidArticles).join("\n"), expected);
  }
});
