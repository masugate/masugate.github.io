import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import { build } from "esbuild";
import { renderToStaticMarkup } from "react-dom/server";

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

const legacyRoutesModule = await importBundled("app/data/legacy-routes.ts");
const {
  activeLegacyRedirects,
  findLegacyRedirect,
  findLegacyRedirectBySegments,
  getLegacyRedirectStaticParams,
  legacyRouteDispositions,
  retainedLegacyRoutes,
} = legacyRoutesModule;
const {
  createLegacyRedirectClientScript,
  LegacyRedirectNotice,
} = await importBundled("app/components/LegacyRedirectNotice.tsx");
const { createLegacyRedirectMetadata } = await importBundled(
  "app/data/legacy-redirect-metadata.ts",
);

test("legacy migration map is complete, unique, and explicit", () => {
  assert.equal(legacyRouteDispositions.length, 15);
  assert.equal(activeLegacyRedirects.length, 10);
  assert.equal(retainedLegacyRoutes.length, 5);

  assert.equal(
    new Set(legacyRouteDispositions.map(({ source }) => source)).size,
    legacyRouteDispositions.length,
  );

  for (const route of activeLegacyRedirects) {
    assert.match(route.source, /^\/[a-z0-9/-]+$/);
    assert.match(route.destination, /^\/(?!\/)/);
    assert.ok(route.reason.trim().length > 0);
  }

  for (const route of retainedLegacyRoutes) {
    assert.ok(route.gate.trim().length > 0);
  }
});

test("legacy redirect lookup accepts canonical and alternate slash forms", () => {
  assert.equal(findLegacyRedirect("/team")?.destination, "/#contact");
  assert.equal(findLegacyRedirect("/team/")?.destination, "/#contact");
  assert.equal(findLegacyRedirect("/team/member"), undefined);
  assert.equal(findLegacyRedirect("/resources/evidence/"), undefined);
});

test("static redirect params enumerate every active redirect from the shared map", () => {
  const params = getLegacyRedirectStaticParams();

  assert.deepEqual(
    params.map(({ legacyPath }) => `/${legacyPath.join("/")}`),
    activeLegacyRedirects.map(({ source }) => source),
  );

  for (const { legacyPath } of params) {
    assert.ok(findLegacyRedirectBySegments(legacyPath));
  }
});

test("static redirect notice preserves search parameters and has a no-script fallback", () => {
  const destination = "/demo/#demo-static-transcript";
  const replacements = [];
  const script = createLegacyRedirectClientScript(destination);

  vm.runInNewContext(script, {
    URL,
    window: {
      location: {
        origin: "https://masugate.github.io",
        search: "?campaign=release&ref=legacy",
        replace(value) {
          replacements.push(value);
        },
      },
    },
  });

  assert.deepEqual(replacements, [
    "/demo/?campaign=release&ref=legacy#demo-static-transcript",
  ]);

  const markup = renderToStaticMarkup(
    LegacyRedirectNotice({
      destination,
      reason: "The current page preserves this material.",
    }),
  );
  assert.match(
    markup,
    /<meta http-equiv="refresh" content="1;url=\/demo\/#demo-static-transcript"\/>/,
  );
  assert.match(markup, /href="\/demo\/#demo-static-transcript"/);
  assert.match(markup, />Continue to the current page<\/a>/);
});

test("static redirect metadata keeps canonical and social URLs on the successor", async () => {
  const redirect = findLegacyRedirect("/resources/policy-as-program");
  assert.ok(redirect);
  const metadata = createLegacyRedirectMetadata(redirect);
  const destination =
    "https://masugate.github.io/blog/policy-as-code-not-prompt/";

  assert.equal(metadata.alternates?.canonical, destination);
  assert.equal(metadata.openGraph?.url, destination);
  assert.equal(metadata.openGraph?.title, "Page moved — MasuGate");
  assert.equal(metadata.twitter?.title, "Page moved — MasuGate");
  assert.deepEqual(metadata.robots, { index: false, follow: true });
});

test("retained-page chrome uses current MasuGate navigation rather than legacy paths", async () => {
  const source = await readFile("app/components/SiteChrome.tsx", "utf8");

  assert.match(source, /selectPrimaryNavigation\(\)/);
  assert.match(source, /masugateSite\.name/);
  assert.doesNotMatch(source, />SAGE</);

  for (const { source: legacyPath } of activeLegacyRedirects) {
    assert.equal(
      source.includes(`href=\"${legacyPath}`),
      false,
      `retained-page chrome still links to ${legacyPath}`,
    );
  }
});

test("release- and evidence-gated legacy routes remain available", () => {
  assert.deepEqual(
    retainedLegacyRoutes.map(({ source }) => source),
    [
      "/use-cases",
      "/use-cases/business-controls",
      "/resources/get-started",
      "/resources/governed-action-lifecycle",
      "/resources/evidence",
    ],
  );
});
