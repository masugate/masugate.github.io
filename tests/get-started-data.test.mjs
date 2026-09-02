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

const getStartedModule = await importBundled("app/data/get-started.ts");
const {
  getStartedGuide,
  getStartedValidationErrors,
  validateGetStartedGuide,
} = getStartedModule;

test("Get Started satisfies its release-safe data contract", () => {
  assert.deepEqual(getStartedValidationErrors, []);
  assert.deepEqual(validateGetStartedGuide(getStartedGuide), []);
  assert.deepEqual(
    {
      release: getStartedGuide.release.state,
      maturity: getStartedGuide.release.maturity,
      evidence: getStartedGuide.release.evidence.status,
    },
    {
      release: "unreleased",
      maturity: "experimental",
      evidence: "reference",
    },
  );
});

test("Get Started route heroes live in the typed guide", () => {
  assert.equal(getStartedGuide.quickStartPage.hero.title, "Run the reference demo.");
  assert.equal(
    getStartedGuide.technicalPage.hero.title,
    "Profiles, outcomes, and integration boundaries.",
  );
  assert.match(getStartedGuide.quickStartPage.hero.intro, /under five minutes/i);
  assert.match(getStartedGuide.technicalPage.hero.intro, /research preview/i);
});

test("three current paths lead only to approved internal destinations", () => {
  assert.deepEqual(
    getStartedGuide.paths.map(({ id, cta }) => ({ id, href: cta.href })),
    [
      { id: "reference-demo", href: "/demo/" },
      {
        id: "application-integration",
        href: "/demo/openclaw-reference/",
      },
      { id: "research-artifact", href: "/#contact" },
    ],
  );
  assert.deepEqual(
    Object.values(getStartedGuide.cta).map(({ href }) => href),
    ["/demo/", "/demo/openclaw-reference/", "/#contact"],
  );
});

test("candidate environment and reviewer toolchain remain exact", () => {
  assert.deepEqual(getStartedGuide.baseline.target, {
    os: "Linux",
    architecture: "amd64",
    python: "3.12",
    dockerRequired: true,
    composeRequired: true,
  });
  assert.deepEqual(getStartedGuide.baseline.toolchain, [
    { component: "CPython", version: "3.12.3" },
    { component: "Git", version: "2.43.0" },
    { component: "Node.js", version: "24.16.0" },
    { component: "npm", version: "11.13.0" },
    { component: "uv", version: "0.11.26" },
    { component: "Docker Engine", version: "29.6.1" },
    { component: "Docker Compose", version: "5.3.0" },
  ]);
  assert.deepEqual(getStartedGuide.baseline.setup, {
    maximumColdSetupMinutes: 15,
    approximateFreeDiskGiB: 8,
    setupMayUseNetwork: true,
    measuredRunCredentialFree: true,
    measuredRunOfflineAfterSetup: true,
  });
});

test("Git candidate progress is explicit without release promotion", () => {
  assert.deepEqual(
    {
      repository: getStartedGuide.candidateSource.repository,
      releaseTreeRevision:
        getStartedGuide.candidateSource.releaseTreeRevision,
      originSourceRevision:
        getStartedGuide.candidateSource.originSourceRevision,
      visibility: getStartedGuide.candidateSource.visibility,
      releaseTag: getStartedGuide.candidateSource.releaseTag,
      authorization:
        getStartedGuide.candidateSource.externalReleaseAuthorization,
      liveGate: getStartedGuide.candidateSource.liveGateContract,
    },
    {
      repository: "https://github.com/masugate/masugate",
      releaseTreeRevision: "6b3852ecb70bd55cb22bf78769028b9b52af9735",
      originSourceRevision: "d56701ad9dddd8bd3136880bce619387f277f71c",
      visibility: "public",
      releaseTag: "not-published",
      authorization: "pending",
      liveGate: "needs-reconciliation",
    },
  );
  assert.equal(
    getStartedGuide.candidateSource.sourceChecks.filter(
      ({ status }) => status === "passed",
    ).length,
    2,
  );
  assert.equal(
    getStartedGuide.candidateSource.sourceChecks.filter(
      ({ status }) => status === "pending",
    ).length,
    2,
  );
  assert.ok(getStartedGuide.declaredPackages.length >= 9);
  assert.ok(
    getStartedGuide.declaredPackages.every(
      ({ publication }) => publication === "declared-only",
    ),
  );
});

test("readiness describes seven ordered steps without publishing commands", () => {
  assert.deepEqual(
    getStartedGuide.readinessSteps.map(({ id, number, status }) => ({
      id,
      number,
      status,
    })),
    [
      { id: "prerequisites", number: 1, status: "review-now" },
      { id: "get-release", number: 2, status: "release-gated" },
      { id: "prepare-once", number: 3, status: "release-gated" },
      { id: "run-demo", number: 4, status: "release-gated" },
      { id: "verify-success", number: 5, status: "release-gated" },
      { id: "inspect-result", number: 6, status: "release-gated" },
      { id: "clean-up", number: 7, status: "release-gated" },
    ],
  );

  for (const step of getStartedGuide.readinessSteps) {
    assert.equal(
      Object.keys(step).some((key) => key.toLowerCase().includes("command")),
      false,
    );
    assert.doesNotMatch(
      step.guidance,
      /(?:^|\n)\s*(?:\$\s*)?(?:pip3?|npm|npx|pnpm|yarn|uv|git|docker|python3?|curl|wget)\s+\S/i,
    );
  }
});

test("operation semantics distinguish effect and finality", () => {
  assert.deepEqual(
    getStartedGuide.outcomes.map(
      ({ status, terminal, effectOccurred }) => ({
        status,
        terminal,
        effectOccurred,
      }),
    ),
    [
      { status: "committed", terminal: true, effectOccurred: true },
      { status: "denied", terminal: true, effectOccurred: false },
      { status: "pending", terminal: false, effectOccurred: false },
    ],
  );
  assert.match(
    getStartedGuide.outcomes[0].integrationResponse,
    /do not invoke the original consequential effect again/i,
  );
  assert.match(
    getStartedGuide.outcomes[2].integrationResponse,
    /independently authorized MasuGate path/i,
  );
});

test("comparison fixes governance artifacts while isolating host-specific fields", () => {
  assert.equal(getStartedGuide.comparison.id, "shared-budget-travel-purchase");
  assert.equal(
    getStartedGuide.comparison.requestId,
    "stage-2-travel-hotel-deposit",
  );
  assert.deepEqual(getStartedGuide.comparison.expectedResult, {
    policyDecision: "escalate",
    humanResolution: "allow-once",
    operationStatus: "committed",
  });
  assert.deepEqual(getStartedGuide.comparison.fixedArtifacts, [
    "Scenario request and expected result",
    "Policy source and exact scenario revision",
    "Governed route",
    "Provider state views and effect contract",
    "Canonical MasuGate outcome contract and record fields",
  ]);
  assert.equal(getStartedGuide.comparison.hostSpecificFields.length, 5);
  assert.ok(getStartedGuide.comparison.canonicalRecordFields.includes("operationId"));
  assert.ok(getStartedGuide.comparison.canonicalRecordFields.includes("effectResult"));
});

test("all integration summaries remain exact Reference-only profiles", () => {
  assert.deepEqual(
    getStartedGuide.integrations.map(
      ({ id, publication, evidence, hostPins }) => ({
        id,
        publication,
        evidence: evidence.status,
        hostPins,
      }),
    ),
    [
      {
        id: "openclaw",
        publication: "reference-only",
        evidence: "reference",
        hostPins: [{ component: "OpenClaw", version: "2026.7.1" }],
      },
      {
        id: "langchain-langgraph",
        publication: "reference-only",
        evidence: "reference",
        hostPins: [
          { component: "LangChain", version: "1.3.14" },
          { component: "LangGraph", version: "1.2.9" },
        ],
      },
      {
        id: "microsoft-agent-framework",
        publication: "reference-only",
        evidence: "reference",
        hostPins: [
          { component: "Microsoft Agent Framework Core", version: "1.12.0" },
        ],
      },
      {
        id: "crewai",
        publication: "reference-only",
        evidence: "reference",
        hostPins: [
          { component: "CrewAI", version: "1.15.6" },
          { component: "CrewAI Core", version: "1.15.6" },
        ],
      },
    ],
  );

  for (const integration of getStartedGuide.integrations) {
    assert.equal(integration.profileHref.state, "unavailable");
    assert.equal(integration.verificationDate.state, "unavailable");
    assert.equal(integration.cleanCheckout.state, "unavailable");
  }
});

test("OpenClaw continuation preserves its exact route and trust boundaries", () => {
  assert.deepEqual(
    {
      release: getStartedGuide.openClawContinuation.releaseId,
      host: getStartedGuide.openClawContinuation.host,
      hostVersion: getStartedGuide.openClawContinuation.hostVersion,
      adapterPackage: getStartedGuide.openClawContinuation.adapterPackage,
      adapterVersion: getStartedGuide.openClawContinuation.adapterVersion,
      tool: getStartedGuide.openClawContinuation.tool,
      route: getStartedGuide.openClawContinuation.route,
      action: getStartedGuide.openClawContinuation.action,
      providerId: getStartedGuide.openClawContinuation.providerId,
      executionPosition:
        getStartedGuide.openClawContinuation.executionPosition,
      connectorId: getStartedGuide.openClawContinuation.connectorId,
      principalId: getStartedGuide.openClawContinuation.principalId,
    },
    {
      release: "masugate-openclaw-reference/0.1.0",
      host: "OpenClaw",
      hostVersion: "2026.7.1",
      adapterPackage: "@masugate/openclaw",
      adapterVersion: "0.1.0",
      tool: "masugate_governed_action",
      route: "purchase",
      action: "spend.purchase",
      providerId: "masugate.spend.reference",
      executionPosition: "protected-external",
      connectorId: "reference-purchase-v1",
      principalId: "openclaw:buyer-alpha",
    },
  );
  assert.equal(getStartedGuide.openClawContinuation.evidence.status, "reference");
  assert.ok(getStartedGuide.openClawContinuation.truths.length >= 7);
});

test("unreleased guide exposes public source and support links without release promotion", () => {
  assert.deepEqual(getStartedGuide.availability.publicRepository, {
    state: "available",
    value: { href: "https://github.com/masugate/masugate" },
  });
  assert.deepEqual(getStartedGuide.availability.publicDocumentation, {
    state: "available",
    value: {
      href: "https://github.com/masugate/masugate/blob/main/README.md",
    },
  });
  assert.deepEqual(getStartedGuide.availability.issueTracker, {
    state: "available",
    value: { href: "https://github.com/masugate/masugate/issues" },
  });
  assert.deepEqual(getStartedGuide.availability.securityReporting, {
    state: "available",
    value: {
      href: "https://github.com/masugate/masugate/blob/main/SECURITY.md",
    },
  });

  for (const availability of [
    getStartedGuide.availability.primaryInstall,
    getStartedGuide.availability.runLocally,
    getStartedGuide.availability.publicEvidence,
    getStartedGuide.availability.verifiedAt,
    getStartedGuide.availability.openClawPublicInstructions,
    getStartedGuide.availability.openClawCapturedRun,
  ]) {
    assert.equal(availability.state, "unavailable");
    assert.ok(availability.reason);
    assert.ok(availability.note);
  }
  assert.equal(getStartedGuide.troubleshooting.length, 8);
});

test("validator rejects premature install, run, evidence, and Verified promotion", () => {
  const promotedAvailability = {
    ...getStartedGuide,
    availability: {
      ...getStartedGuide.availability,
      primaryInstall: { state: "available", value: "pip install invented" },
      runLocally: { state: "available", value: { href: "/run/" } },
      publicEvidence: {
        state: "available",
        value: [{ label: "Evidence", href: "https://example.invalid/evidence" }],
      },
    },
  };
  const availabilityErrors = validateGetStartedGuide(promotedAvailability);
  assert.ok(availabilityErrors.some((error) => error.includes("primaryInstall")));
  assert.ok(availabilityErrors.some((error) => error.includes("runLocally")));
  assert.ok(availabilityErrors.some((error) => error.includes("publicEvidence")));

  const verifiedGuide = {
    ...getStartedGuide,
    release: {
      ...getStartedGuide.release,
      evidence: { status: "verified" },
    },
    integrations: getStartedGuide.integrations.map((integration, index) =>
      index === 0
        ? {
            ...integration,
            publication: "publishable",
            evidence: { status: "verified" },
          }
        : integration,
    ),
  };
  const verifiedErrors = validateGetStartedGuide(verifiedGuide);
  assert.ok(
    verifiedErrors.some((error) => error.includes("Verified release evidence")),
  );
  assert.ok(
    verifiedErrors.some((error) => error.includes("openclaw")),
  );
});

test("validator rejects a command-shaped readiness placeholder", () => {
  const commandGuide = {
    ...getStartedGuide,
    readinessSteps: getStartedGuide.readinessSteps.map((step, index) =>
      index === 1 ? { ...step, command: "git clone placeholder" } : step,
    ),
  };

  assert.ok(
    validateGetStartedGuide(commandGuide).some((error) =>
      error.includes("command-shaped content"),
    ),
  );
});
