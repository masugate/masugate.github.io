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

const referenceModule = await importBundled("app/data/openclaw-reference.ts");
const {
  openClawReferenceCandidate,
  openClawReferenceValidationErrors,
  validateOpenClawReferenceCandidate,
} = referenceModule;

test("OpenClaw public-source reference satisfies its bounded contract", () => {
  assert.deepEqual(openClawReferenceValidationErrors, []);
  assert.deepEqual(
    validateOpenClawReferenceCandidate(openClawReferenceCandidate),
    [],
  );
  assert.deepEqual(
    {
      publication: openClawReferenceCandidate.publication,
      releaseState: openClawReferenceCandidate.releaseState,
      maturity: openClawReferenceCandidate.maturity,
      evidence: openClawReferenceCandidate.evidence.status,
    },
    {
      publication: "source-reference",
      releaseState: "source-public",
      maturity: "experimental",
      evidence: "reference",
    },
  );
});

test("0.1.1 pins and the finite purchase route remain exact", () => {
  assert.deepEqual(
    {
      host: openClawReferenceCandidate.integration.host,
      hostVersion: openClawReferenceCandidate.integration.hostVersion,
      adapterPackage: openClawReferenceCandidate.integration.adapterPackage,
      adapterVersion: openClawReferenceCandidate.integration.adapterVersion,
      referenceDistribution:
        openClawReferenceCandidate.integration.referenceDistribution,
      referenceDistributionVersion:
        openClawReferenceCandidate.integration.referenceDistributionVersion,
    },
    {
      host: "OpenClaw",
      hostVersion: "2026.7.1",
      adapterPackage: "@masugate/openclaw",
      adapterVersion: "0.1.1",
      referenceDistribution: "masugate-openclaw-reference",
      referenceDistributionVersion: "0.1.1",
    },
  );

  assert.deepEqual(
    {
      tool: openClawReferenceCandidate.integration.tool,
      route: openClawReferenceCandidate.integration.route,
      action: openClawReferenceCandidate.integration.action,
      providerId: openClawReferenceCandidate.integration.providerId,
      executionPosition:
        openClawReferenceCandidate.integration.executionPosition,
      connectorId: openClawReferenceCandidate.integration.connectorId,
      agentId: openClawReferenceCandidate.integration.agentId,
      principalId: openClawReferenceCandidate.integration.principalId,
      credentialEnvironment:
        openClawReferenceCandidate.integration.credentialEnvironment,
    },
    {
      tool: "masugate_governed_action",
      route: "purchase",
      action: "spend.purchase",
      providerId: "masugate.spend.reference",
      executionPosition: "protected-external",
      connectorId: "reference-purchase-v1",
      agentId: "buyer-alpha",
      principalId: "openclaw:buyer-alpha",
      credentialEnvironment: "MASUGATE_BUYER_ALPHA_TOKEN",
    },
  );
});

test("source reference distinguishes release provenance from observed main", () => {
  assert.deepEqual(
    {
      repository: openClawReferenceCandidate.identity.repository,
      origin:
        openClawReferenceCandidate.identity.originImplementationRevision,
      releaseTree:
        openClawReferenceCandidate.identity.releaseTreeRevision,
      gitTree: openClawReferenceCandidate.identity.releaseTree,
      visibility:
        openClawReferenceCandidate.identity.repositoryVisibility,
      tag: openClawReferenceCandidate.identity.releaseTag,
    },
    {
      repository: "https://github.com/masugate/masugate",
      origin: "1373f5507c1680c60a7700d8a6c26a8b4d3fb025",
      releaseTree: "10f097ced9480ca86c138a9c3d8c92bebdadcefa",
      gitTree: "75ae5448eb7b688895be34260f937a4a51dfdc54",
      visibility: "public",
      tag: "not-published",
    },
  );
  assert.equal(
    openClawReferenceCandidate.promotionGates.filter(
      ({ status }) => status === "complete",
    ).length,
    5,
  );
  assert.ok(
    openClawReferenceCandidate.promotionGates.some(
      ({ id, status }) =>
        id === "retained-evidence" && status === "pending",
    ),
  );
});

test("public support routes are complete without promoting release evidence", () => {
  const supportRoutes = openClawReferenceCandidate.promotionGates.find(
    ({ id }) => id === "support-routes",
  );

  assert.equal(supportRoutes?.status, "complete");
  assert.match(supportRoutes?.detail ?? "", /issue tracker, review path, and SECURITY\.md route/i);
  assert.match(supportRoutes?.detail ?? "", /does not imply a tagged or registry release/i);

  const driftedCandidate = {
    ...openClawReferenceCandidate,
    promotionGates: openClawReferenceCandidate.promotionGates.map((gate) =>
      gate.id === "support-routes" ? { ...gate, status: "pending" } : gate,
    ),
  };
  assert.ok(
    validateOpenClawReferenceCandidate(driftedCandidate).some((error) =>
      error.includes("support gate drifted from the site availability contract"),
    ),
  );
});

test("OpenClaw disclosure follows the typed public-visibility boundary", async () => {
  const routeSource = await readFile(
    "app/(masugate)/demo/openclaw-reference/page.tsx",
    "utf8",
  );

  assert.doesNotMatch(routeSource, /Anonymous access returned 404/);
  assert.match(routeSource, /candidate\.presentation\.hero\.sourceBoundary/);
  assert.match(routeSource, /candidate\.identity\.repositoryVisibility/);
  assert.match(routeSource, /candidate\.presentation\.hero\.localRunBoundary/);
});

test("source coverage is related, related, then simulation-only", () => {
  assert.deepEqual(
    openClawReferenceCandidate.stageCoverage.map(
      ({ stageId, alignment, statusLabel }) => ({
        stageId,
        alignment,
        statusLabel,
      }),
    ),
    [
      {
        stageId: "stage-1",
        alignment: "related",
        statusLabel: "Related source path",
      },
      {
        stageId: "stage-2",
        alignment: "related",
        statusLabel: "Related workload",
      },
      {
        stageId: "stage-3",
        alignment: "none",
        statusLabel: "Simulation only",
      },
    ],
  );
  assert.equal(
    openClawReferenceCandidate.stageCoverage.some(
      ({ alignment }) => alignment === "exact",
    ),
    false,
  );
});

test("source policy and provider view remain exact", () => {
  assert.match(
    openClawReferenceCandidate.policySource,
    /deny budget_cap when args\.amount_cents > spend\.available_cents\(principal\.team\)/,
  );
  assert.match(
    openClawReferenceCandidate.policySource,
    /escalate ask_first when args\.amount_cents >= 500/,
  );
  assert.deepEqual(openClawReferenceCandidate.providerView, {
    name: "spend.available_cents",
    signature: "spend.available_cents(String) -> Int",
    owner: "spend",
    consistency: "scoped-policy-state",
    maximumLatencyMs: 100,
    bounded: true,
    scopeTemplate: "spend:team:<team>",
    reservationKind: "unsupported",
  });
  assert.equal(
    openClawReferenceCandidate.integration.configurationDigest,
    "2675d08a41756224ab7fc1b15cdb5f43e724aac1eda4ecd3674ef5da35d914fc",
  );
});

test("the standalone OpenClaw reference explains PSS at first use", () => {
  const assertions = openClawReferenceCandidate.evidenceLanes.flatMap(
    ({ sourceAssertions }) => sourceAssertions,
  );

  assert.ok(
    assertions.some((assertion) =>
      /policy-state serializability \(PSS\).*real-time-respecting serial explanation/i.test(
        assertion,
      ),
    ),
  );
});

test("public source and instructions are available without captured evidence", () => {
  const publicAvailability = [
    openClawReferenceCandidate.publicSource,
    openClawReferenceCandidate.publicInstructions,
    openClawReferenceCandidate.cleanCheckout,
  ];
  const evidenceAvailability = [
    openClawReferenceCandidate.capturedRun,
    openClawReferenceCandidate.verification,
    ...openClawReferenceCandidate.evidenceLanes.map(
      ({ capturedEvidence }) => capturedEvidence,
    ),
  ];

  assert.ok(publicAvailability.length > 0);
  for (const availability of publicAvailability) {
    assert.equal(availability.state, "available");
    assert.match(availability.value.href, /^https:\/\/github\.com\/masugate\/masugate/);
  }
  for (const availability of evidenceAvailability) {
    assert.equal(availability.state, "unavailable");
    assert.ok(availability.reason);
    assert.ok(availability.note);
  }
});

test("source-reference validation rejects invented captured evidence", () => {
  const promotedLaneCandidate = {
    ...openClawReferenceCandidate,
    evidenceLanes: openClawReferenceCandidate.evidenceLanes.map((lane, index) =>
      index === 0
        ? { ...lane, capturedEvidence: { state: "available", value: {} } }
        : lane,
    ),
  };

  assert.ok(
    validateOpenClawReferenceCandidate(promotedLaneCandidate).some((error) =>
      error.includes("source and retained-evidence boundary is inconsistent"),
    ),
  );
});
