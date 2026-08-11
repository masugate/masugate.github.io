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

const legacyRoutesModule = await importBundled("app/data/legacy-routes.ts");
const {
  activeLegacyRedirects,
  findLegacyRedirect,
  legacyRouteDispositions,
  retainedLegacyRoutes,
} = legacyRoutesModule;

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
