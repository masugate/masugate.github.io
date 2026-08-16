import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
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

const metadataModule = await importBundled("app/data/metadata.ts");
const {
  createMasuGateArticleMetadata,
  createMasuGatePageMetadata,
  createMasuGateSiteMetadata,
} = metadataModule;

test("MasuGate page metadata carries the shared social identity", () => {
  const metadata = createMasuGatePageMetadata({
    title: "Route title",
    description: "Route description",
    path: "/route/",
  });

  assert.equal(metadata.title, "Route title");
  assert.equal(metadata.description, "Route description");
  assert.deepEqual(metadata.openGraph, {
    title: "Route title — MasuGate",
    description: "Route description",
    siteName: "MasuGate",
    type: "website",
    url: "https://masugate.github.io/route/",
    images: [
      {
        url: "/og-masugate.png",
        width: 1200,
        height: 630,
        alt: "MasuGate — Stateful governance for concurrent agents",
      },
    ],
  });
  assert.deepEqual(metadata.twitter, {
    card: "summary_large_image",
    title: "Route title — MasuGate",
    description: "Route description",
    images: [
      {
        url: "/og-masugate.png",
        width: 1200,
        height: 630,
        alt: "MasuGate — Stateful governance for concurrent agents",
      },
    ],
  });
  assert.deepEqual(metadata.alternates, {
    canonical: "https://masugate.github.io/route/",
  });
});

test("site metadata keeps the title template while sharing the social card", () => {
  const metadata = createMasuGateSiteMetadata();

  assert.deepEqual(metadata.title, {
    default: "MasuGate — Stateful governance for concurrent agents",
    template: "%s — MasuGate",
  });
  assert.equal(metadata.openGraph.siteName, "MasuGate");
  assert.equal(metadata.openGraph.url, "https://masugate.github.io/");
  assert.deepEqual(metadata.alternates, {
    canonical: "https://masugate.github.io/",
  });
  assert.equal(metadata.twitter.card, "summary_large_image");
});

test("article metadata publishes article dates, topic tags, and its canonical URL", () => {
  const metadata = createMasuGateArticleMetadata({
    href: "/blog/concurrent-decisions/",
    title: "Concurrent decisions",
    summary: "Why allowed decisions can go stale.",
    publishedAt: "2026-08-03",
    updatedAt: "2026-08-08",
    labels: ["Stateful governance", "Concurrency"],
  });

  assert.equal(metadata.openGraph.type, "article");
  assert.equal(metadata.openGraph.publishedTime, "2026-08-03T00:00:00.000Z");
  assert.equal(metadata.openGraph.modifiedTime, "2026-08-08T00:00:00.000Z");
  assert.deepEqual(metadata.openGraph.tags, [
    "Stateful governance",
    "Concurrency",
  ]);
  assert.equal(metadata.twitter.title, "Concurrent decisions — MasuGate");
  assert.equal(
    metadata.openGraph.url,
    "https://masugate.github.io/blog/concurrent-decisions/",
  );
});

test("the public social image matches its declared PNG dimensions", async () => {
  const image = await readFile("public/og-masugate.png");

  assert.deepEqual(
    [...image.subarray(0, 8)],
    [137, 80, 78, 71, 13, 10, 26, 10],
  );
  assert.equal(image.readUInt32BE(16), 1200);
  assert.equal(image.readUInt32BE(20), 630);
});
