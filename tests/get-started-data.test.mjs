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

const {
  getStartedGuide,
  getStartedValidationErrors,
  validateGetStartedGuide,
} = await importBundled("app/data/get-started.ts");

test("Get Started exposes the 0.1.1 public-source release boundary", () => {
  assert.deepEqual(getStartedValidationErrors, []);
  assert.deepEqual(validateGetStartedGuide(getStartedGuide), []);
  assert.deepEqual(
    {
      id: getStartedGuide.release.id,
      version: getStartedGuide.release.version,
      state: getStartedGuide.release.state,
      source: getStartedGuide.release.sourcePublication,
      distribution: getStartedGuide.release.distributionPublication,
      maturity: getStartedGuide.release.maturity,
      evidence: getStartedGuide.release.evidence.status,
    },
    {
      id: "masugate-openclaw-reference/0.1.1",
      version: "0.1.1",
      state: "source-public",
      source: "public",
      distribution: "source-only",
      maturity: "experimental",
      evidence: "reference",
    },
  );
});

test("Get Started hero and menu describe the rendered public workflow", () => {
  assert.equal(
    getStartedGuide.quickStartPage.hero.title,
    "Run one governed action from the public source.",
  );
  assert.match(getStartedGuide.quickStartPage.hero.releaseLabel, /0\.1\.1/i);
  assert.match(getStartedGuide.quickStartPage.hero.releaseLabel, /public source/i);
  assert.deepEqual(
    getStartedGuide.quickStartPage.navigation.links.map(({ label, href }) => ({
      label,
      href,
    })),
    [
      { label: "Choose a path", href: "/get-started/#choose-a-path" },
      { label: "Run locally", href: "/get-started/#run-locally" },
      { label: "Success contract", href: "/get-started/#success-contract" },
      {
        label: "Source and support",
        href: "/get-started/#source-and-support",
      },
      { label: "Technical reference", href: "/get-started/technical/" },
    ],
  );

  assert.match(
    getStartedGuide.quickStartPage.workflowSection.intro,
    /Policy-state serializability \(PSS\).*real-time-respecting serial explanation/i,
  );
  assert.deepEqual(
    {
      label: getStartedGuide.quickStartPage.workflowSection.pssActionLabel,
      href: getStartedGuide.quickStartPage.workflowSection.pssHref,
    },
    {
      label: "Read the full PSS explanation",
      href: "/blog/when-allowed-goes-stale/#serial-explanation",
    },
  );
});

test("three entry paths lead to the browser, source runbook, and review guide", () => {
  assert.deepEqual(
    getStartedGuide.paths.map(({ id, cta }) => ({
      id,
      href: cta.href,
      external: cta.external,
    })),
    [
      { id: "browser-walkthrough", href: "/demo/", external: false },
      {
        id: "local-demonstration",
        href: "https://github.com/masugate/masugate#five-minute-local-demonstration",
        external: true,
      },
      {
        id: "technical-review",
        href: "https://github.com/masugate/masugate/blob/main/REVIEWING.md",
        external: true,
      },
    ],
  );
});

test("the public quickstart preserves the exact supported environment", () => {
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

test("source publication is public without inventing a tag or registry release", () => {
  assert.deepEqual(
    {
      repository: getStartedGuide.sourceRelease.repository,
      branch: getStartedGuide.sourceRelease.defaultBranch,
      observedAt: getStartedGuide.sourceRelease.observedAt,
      publication: getStartedGuide.sourceRelease.publication,
      tag: getStartedGuide.sourceRelease.releaseTag,
      registries: getStartedGuide.sourceRelease.registries,
    },
    {
      repository: "https://github.com/masugate/masugate",
      branch: "main",
      observedAt: "2026-09-03",
      publication: "public-source",
      tag: "not-published",
      registries: "not-published",
    },
  );
  assert.match(getStartedGuide.sourceRelease.currentMainRevision, /^[0-9a-f]{40}$/);
  assert.match(getStartedGuide.sourceRelease.provenanceRevision, /^[0-9a-f]{40}$/);
  assert.match(getStartedGuide.sourceRelease.boundary, /main branch is mutable/i);

  assert.equal(getStartedGuide.declaredPackages.length, 18);
  assert.ok(
    getStartedGuide.declaredPackages.every(
      ({ version, publication }) =>
        version === "0.1.1" && publication === "declared-only",
    ),
  );
});

test("the local workflow publishes only the canonical source-based commands", () => {
  assert.deepEqual(
    getStartedGuide.readinessSteps.map(({ id, number, status }) => ({
      id,
      number,
      status,
    })),
    [
      { id: "get-source", number: 1, status: "before-you-run" },
      { id: "prerequisites", number: 2, status: "before-you-run" },
      { id: "prepare-once", number: 3, status: "available" },
      { id: "run-demo", number: 4, status: "available" },
      { id: "verify-success", number: 5, status: "available" },
      { id: "inspect-result", number: 6, status: "available" },
      { id: "clean-up", number: 7, status: "after-run" },
    ],
  );

  const byId = new Map(getStartedGuide.readinessSteps.map((step) => [step.id, step]));
  assert.equal(byId.get("prepare-once")?.command, getStartedGuide.sourceQuickStart.setupCommand);
  assert.equal(byId.get("run-demo")?.command, getStartedGuide.sourceQuickStart.runCommand);
  assert.equal(byId.get("verify-success")?.command, getStartedGuide.sourceQuickStart.verifyCommand);
  assert.equal(byId.get("clean-up")?.command, getStartedGuide.sourceQuickStart.cleanupCommand);
  assert.match(byId.get("run-demo")?.expected ?? "", /procurement\.json/);
  assert.match(byId.get("verify-success")?.expected ?? "", /PASS/);

  const commands = getStartedGuide.readinessSteps
    .map(({ command }) => command ?? "")
    .join("\n");
  assert.match(commands, /prepare-reference-demo\.py/);
  assert.match(commands, /run_reference_demos\.py procurement/);
  assert.match(commands, /verify-flagship-demo\.py/);
  assert.doesNotMatch(commands, /\bpip3?\s+install\b|\bnpm\s+(?:install|add)\b/i);
});

test("operation semantics distinguish effect and finality", () => {
  assert.deepEqual(
    getStartedGuide.outcomes.map(({ status, terminal, effectOccurred }) => ({
      status,
      terminal,
      effectOccurred,
    })),
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

test("integration summaries point to public 0.1.1 reference profiles", () => {
  assert.deepEqual(
    getStartedGuide.integrations.map(({ id, publication, evidence, adapter }) => ({
      id,
      publication,
      evidence: evidence.status,
      adapterVersion: adapter.version.state === "available" ? adapter.version.value : null,
    })),
    [
      { id: "openclaw", publication: "reference-only", evidence: "reference", adapterVersion: "0.1.1" },
      { id: "langchain-langgraph", publication: "reference-only", evidence: "reference", adapterVersion: "0.1.1" },
      { id: "microsoft-agent-framework", publication: "reference-only", evidence: "reference", adapterVersion: "0.1.1" },
      { id: "crewai", publication: "reference-only", evidence: "reference", adapterVersion: "0.1.1" },
    ],
  );
  assert.ok(
    getStartedGuide.integrations.every(
      ({ profileHref, verificationDate, cleanCheckout }) =>
        profileHref.state === "available" &&
        verificationDate.state === "unavailable" &&
        cleanCheckout.state === "unavailable",
    ),
  );
});

test("OpenClaw continuation keeps its exact 0.1.1 boundary", () => {
  assert.deepEqual(
    {
      release: getStartedGuide.openClawContinuation.releaseId,
      state: getStartedGuide.openClawContinuation.releaseState,
      host: getStartedGuide.openClawContinuation.host,
      hostVersion: getStartedGuide.openClawContinuation.hostVersion,
      adapterPackage: getStartedGuide.openClawContinuation.adapterPackage,
      adapterVersion: getStartedGuide.openClawContinuation.adapterVersion,
      route: getStartedGuide.openClawContinuation.route,
      action: getStartedGuide.openClawContinuation.action,
      providerId: getStartedGuide.openClawContinuation.providerId,
    },
    {
      release: "masugate-openclaw-reference/0.1.1",
      state: "source-public",
      host: "OpenClaw",
      hostVersion: "2026.7.1",
      adapterPackage: "@masugate/openclaw",
      adapterVersion: "0.1.1",
      route: "purchase",
      action: "spend.purchase",
      providerId: "masugate.spend.reference",
    },
  );
  assert.equal(getStartedGuide.openClawContinuation.evidence.status, "reference");
  assert.ok(getStartedGuide.openClawContinuation.truths.length >= 7);
});

test("public source, runbook, and support are available while distribution evidence is not", () => {
  assert.equal(getStartedGuide.availability.publicRepository.state, "available");
  assert.equal(getStartedGuide.availability.publicDocumentation.state, "available");
  assert.equal(getStartedGuide.availability.runLocally.state, "available");
  assert.equal(getStartedGuide.availability.openClawPublicInstructions.state, "available");
  assert.equal(getStartedGuide.availability.issueTracker.state, "available");
  assert.equal(getStartedGuide.availability.securityReporting.state, "available");
  assert.equal(getStartedGuide.availability.primaryInstall.state, "unavailable");
  assert.equal(getStartedGuide.availability.publicEvidence.state, "unavailable");
  assert.equal(getStartedGuide.availability.verifiedAt.state, "unavailable");
  assert.equal(getStartedGuide.availability.openClawCapturedRun.state, "unavailable");
});

test("documentation links cover setup, reproduction, results, review, and limits", () => {
  assert.deepEqual(
    getStartedGuide.documentationLinks.map(({ label }) => label),
    [
      "Exact setup",
      "Reproduction",
      "Expected results",
      "Review paths",
      "Claims and limitations",
    ],
  );
  assert.ok(
    getStartedGuide.documentationLinks.every(({ href }) =>
      href.startsWith("https://github.com/masugate/masugate"),
    ),
  );
});

test("validator rejects source/distribution contradictions and command drift", () => {
  const registryInstall = {
    ...getStartedGuide,
    readinessSteps: getStartedGuide.readinessSteps.map((step) =>
      step.id === "prepare-once"
        ? { ...step, command: "pip install masugate==0.1.1" }
        : step,
    ),
  };
  assert.ok(
    validateGetStartedGuide(registryInstall).some((error) =>
      /commands drifted|registry installation/i.test(error),
    ),
  );

  const hiddenRunbook = {
    ...getStartedGuide,
    availability: {
      ...getStartedGuide.availability,
      runLocally: {
        state: "unavailable",
        reason: "verification-pending",
        note: "hidden",
      },
    },
  };
  assert.ok(
    validateGetStartedGuide(hiddenRunbook).some((error) =>
      /availability contradict/i.test(error),
    ),
  );

  const falseVerification = {
    ...getStartedGuide,
    release: {
      ...getStartedGuide.release,
      evidence: {
        status: "verified",
        sourceKind: "release",
        href: "https://example.test/evidence",
        immutableRevision: "invented",
        gate: "invented",
        verifiedAt: "2026-09-03",
      },
    },
  };
  assert.ok(
    validateGetStartedGuide(falseVerification).some((error) =>
      /public-source research-preview boundary/i.test(error),
    ),
  );
});

test("Get Started route renders the workflow from typed data", async () => {
  const routeSource = await readFile("app/(masugate)/get-started/page.tsx", "utf8");
  const styleSource = await readFile(
    "app/(masugate)/get-started/get-started.module.css",
    "utf8",
  );

  assert.match(routeSource, /getStartedGuide\.readinessSteps/);
  assert.match(routeSource, /step\.command/);
  assert.match(routeSource, /id="run-locally"/);
  assert.match(routeSource, /id="success-contract"/);
  assert.match(routeSource, /id="source-and-support"/);
  assert.doesNotMatch(routeSource, /pip install|npm install/);
  assert.match(styleSource, /\.commandBlock pre/);
  assert.match(styleSource, /overflow-x:\s*auto/);
});
