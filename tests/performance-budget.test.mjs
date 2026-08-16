import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { gzipSync } from "node:zlib";

const MASUGATE_ROUTES = [
  "/",
  "/demo/",
  "/demo/openclaw-reference/",
  "/get-started/",
  "/blog/",
  "/blog/masugate-public-source-release/",
  "/blog/policy-as-code-not-prompt/",
  "/blog/when-allowed-goes-stale/",
];

// The public project/footer links and route-specific canonical metadata are a
// deliberate part of every primary route. Keep the resulting ceiling tight.
const MAX_HTML_GZIP_BYTES = 31 * 1024;
const MAX_REFERENCED_ASSETS_GZIP_BYTES = 150 * 1024;
const MAX_SOCIAL_IMAGE_BYTES = 1024 * 1024;

async function render(path) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("budget", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("MasuGate routes stay within the public-site transfer-size budget", async () => {
  for (const path of MASUGATE_ROUTES) {
    const response = await render(path);
    const html = Buffer.from(await response.arrayBuffer());
    const markup = html.toString("utf8");
    const assets = [
      ...new Set(
        [...markup.matchAll(/(?:href|src)="(\/assets\/[^"]+\.(?:js|css))"/g)]
          .map(([, asset]) => asset),
      ),
    ];

    let referencedAssetsGzipBytes = 0;
    for (const asset of assets) {
      const contents = await readFile(`dist/client${asset}`);
      referencedAssetsGzipBytes += gzipSync(contents).byteLength;
    }

    assert.ok(
      gzipSync(html).byteLength <= MAX_HTML_GZIP_BYTES,
      `${path} HTML exceeds ${MAX_HTML_GZIP_BYTES} gzip bytes`,
    );
    assert.ok(
      referencedAssetsGzipBytes <= MAX_REFERENCED_ASSETS_GZIP_BYTES,
      `${path} referenced JS/CSS exceeds ${MAX_REFERENCED_ASSETS_GZIP_BYTES} gzip bytes`,
    );
  }
});

test("the MasuGate social card stays below one binary megabyte", async () => {
  const socialImage = await readFile("public/og-masugate.png");
  assert.ok(socialImage.byteLength <= MAX_SOCIAL_IMAGE_BYTES);
});
