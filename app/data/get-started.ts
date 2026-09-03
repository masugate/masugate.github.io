import {
  type Availability,
  type Evidence,
  type IntegrationProfileId,
  type IsoDate,
  type Maturity,
  type OperationStatus,
  type PathRequirement,
  type ReleaseState,
  available,
} from "./contracts";
import {
  adoptionComparison,
  integrationProfiles,
  type IntegrationProfile,
} from "./integrations";
import { openClawReferenceCandidate } from "./openclaw-reference";
import {
  masugateRelease,
  type ReleaseContract,
  type SourceQuickStart,
  type VersionPin,
} from "./release";

export type GetStartedPathId =
  | "browser-walkthrough"
  | "local-demonstration"
  | "technical-review";

export interface GetStartedPath {
  id: GetStartedPathId;
  title: string;
  audience: string;
  outcome: string;
  currentBoundary: string;
  cta: Readonly<{
    label: string;
    href: string;
    external: boolean;
  }>;
}

export type ReadinessStepId =
  | "get-source"
  | "prerequisites"
  | "prepare-once"
  | "run-demo"
  | "verify-success"
  | "inspect-result"
  | "clean-up";

export interface ReadinessStep {
  id: ReadinessStepId;
  number: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  status: "before-you-run" | "available" | "after-run";
  title: string;
  guidance: string;
  command?: string;
  expected?: string;
  sourceHref?: `https://${string}`;
}

export interface OutcomeMeaning {
  status: OperationStatus;
  terminal: boolean;
  effectOccurred: boolean;
  meaning: string;
  integrationResponse: string;
}

export interface GetStartedIntegrationSummary {
  id: IntegrationProfileId;
  name: string;
  hostPins: readonly VersionPin[];
  maturity: Maturity;
  pathRequirement: PathRequirement;
  publication: IntegrationProfile["publication"];
  evidence: Evidence;
  conceptualBinding: string;
  adapter: IntegrationProfile["adapter"];
  replacementBoundary: string;
  hostBinding: IntegrationProfile["hostBinding"];
  exclusions: readonly string[];
  deploymentOwnedConfiguration: readonly string[];
  profileHref: IntegrationProfile["profileHref"];
  verificationDate: IntegrationProfile["verificationDate"];
  cleanCheckout: IntegrationProfile["cleanCheckout"];
}

export interface GetStartedAvailability {
  publicRepository: Availability<Readonly<{ href: `https://${string}` }>>;
  publicDocumentation: Availability<Readonly<{ href: `https://${string}` }>>;
  primaryInstall: Availability<string>;
  runLocally: Availability<Readonly<{ href: `https://${string}` }>>;
  publicEvidence: Availability<
    readonly Readonly<{ label: string; href: `https://${string}` }>[]
  >;
  verifiedAt: Availability<IsoDate>;
  openClawPublicInstructions: Availability<
    Readonly<{ href: `https://${string}` }>
  >;
  openClawCapturedRun: Availability<never>;
  issueTracker: Availability<Readonly<{ href: `https://${string}` }>>;
  securityReporting: Availability<Readonly<{ href: `https://${string}` }>>;
}

export interface SourceReleaseCheckpoint {
  repository: `https://${string}`;
  defaultBranch: "main";
  currentMainRevision: string;
  provenanceRevision: string;
  observedAt: IsoDate;
  publication: "public-source";
  releaseTag: "not-published";
  registries: "not-published";
  boundary: string;
}

export interface DeclaredPackageSummary {
  id: string;
  channel: "pypi" | "npm";
  name: string;
  version: string;
  publication: "declared-only" | "published";
}

export interface GetStartedGuide {
  id: "masugate-get-started";
  release: Readonly<{
    id: string;
    version: string;
    state: ReleaseState;
    sourcePublication: "public";
    distributionPublication: "source-only";
    maturity: Maturity;
    posture: "research-preview";
    evidence: Evidence;
  }>;
  paths: readonly GetStartedPath[];
  quickStartPage: Readonly<{
    metadataDescription: string;
    navigation: Readonly<{
      summary: string;
      links: readonly Readonly<{
        label: string;
        href:
          | "/get-started/#choose-a-path"
          | "/get-started/#run-locally"
          | "/get-started/#success-contract"
          | "/get-started/#source-and-support"
          | "/get-started/technical/";
        detail: string;
      }>[];
    }>;
    hero: Readonly<{
      eyebrow: string;
      releaseLabel: string;
      title: string;
      intro: string;
      primaryActionLabel: string;
      browserActionLabel: string;
      sourceActionLabel: string;
    }>;
    summary: Readonly<{
      label: string;
      eyebrow: string;
      items: readonly string[];
      note: string;
    }>;
    pathsSection: Readonly<{
      eyebrow: string;
      title: string;
      intro: string;
      audienceLabel: string;
      outcomeLabel: string;
      boundaryLabel: string;
    }>;
    workflowSection: Readonly<{
      eyebrow: string;
      title: string;
      intro: string;
      beforeLabel: string;
      availableLabel: string;
      afterLabel: string;
      commandLabel: string;
      expectedLabel: string;
      sourceLabel: string;
      pssActionLabel: string;
      pssHref: "/blog/when-allowed-goes-stale/#serial-explanation";
    }>;
    successSection: Readonly<{
      eyebrow: string;
      title: string;
      intro: string;
      confirmsLabel: string;
      confirms: readonly string[];
      caveatLabel: string;
      caveat: string;
    }>;
    sourceSection: Readonly<{
      eyebrow: string;
      title: string;
      intro: string;
      repositoryActionLabel: string;
      documentationActionLabel: string;
      versionLabel: string;
      channelLabel: string;
      distributionLabel: string;
    }>;
    nextSection: Readonly<{
      eyebrow: string;
      title: string;
      intro: string;
      demoActionLabel: string;
      technicalActionLabel: string;
    }>;
  }>;
  technicalPage: Readonly<{
    hero: Readonly<{ eyebrow: string; title: string; intro: string }>;
    runtimeSection: Readonly<{ eyebrow: string; title: string; intro: string }>;
  }>;
  baseline: Readonly<{
    target: Readonly<{
      os: string;
      architecture: string;
      python: string;
      dockerRequired: boolean;
      composeRequired: boolean;
    }>;
    toolchain: readonly VersionPin[];
    setup: Readonly<{
      maximumColdSetupMinutes: number;
      approximateFreeDiskGiB: number;
      setupMayUseNetwork: boolean;
      measuredRunCredentialFree: boolean;
      measuredRunOfflineAfterSetup: boolean;
    }>;
    evidence: Evidence;
  }>;
  sourceRelease: SourceReleaseCheckpoint;
  sourceQuickStart: SourceQuickStart;
  declaredPackages: readonly DeclaredPackageSummary[];
  readinessSteps: readonly ReadinessStep[];
  outcomes: readonly OutcomeMeaning[];
  comparison: Readonly<{
    id: string;
    scenarioId: string;
    requestId: string;
    policyArtifactId: string;
    governedRouteId: string;
    expectedResult: Readonly<{
      policyDecision: string;
      humanResolution: string;
      operationStatus: OperationStatus;
    }>;
    fixedArtifacts: readonly string[];
    canonicalRecordFields: readonly string[];
    hostSpecificFields: readonly string[];
  }>;
  integrations: readonly GetStartedIntegrationSummary[];
  openClawContinuation: Readonly<{
    releaseId: string;
    releaseState: ReleaseState;
    evidence: Evidence;
    host: "OpenClaw";
    hostVersion: string;
    adapterPackage: string;
    adapterVersion: string;
    tool: string;
    route: string;
    action: string;
    providerId: string;
    executionPosition: string;
    connectorId: string;
    agentId: string;
    principalId: string;
    credentialEnvironment: string;
    identityBoundary: string;
    replacementBoundary: string;
    truths: readonly string[];
    cta: Readonly<{ label: string; href: "/demo/openclaw-reference/" }>;
  }>;
  troubleshooting: readonly Readonly<{
    id: string;
    symptom: string;
    diagnostic: string;
    nextStep: string;
  }>[];
  availability: GetStartedAvailability;
  documentationLinks: readonly Readonly<{
    label: string;
    detail: string;
    href: `https://${string}`;
  }>[];
  cta: Readonly<{
    demo: Readonly<{ label: string; href: "/demo/" }>;
    run: Readonly<{ label: string; href: `https://${string}` }>;
    openClaw: Readonly<{
      label: string;
      href: "/demo/openclaw-reference/";
    }>;
    review: Readonly<{ label: string; href: `https://${string}` }>;
    contact: Readonly<{ label: string; href: "/#contact" }>;
  }>;
}

if (masugateRelease.sourceQuickStart.state !== "available") {
  throw new Error("The public-source release must expose its quickstart.");
}

const sourceQuickStart = masugateRelease.sourceQuickStart.value;

const cta = {
  demo: { label: "Explore the browser walkthrough", href: "/demo/" },
  run: { label: "Run the public-source demo", href: sourceQuickStart.guideHref },
  openClaw: {
    label: "Inspect the OpenClaw reference",
    href: "/demo/openclaw-reference/",
  },
  review: { label: "Choose a review path", href: sourceQuickStart.reviewHref },
  contact: { label: "Request a customized demo", href: "/#contact" },
} as const;

const integrationSummaries: readonly GetStartedIntegrationSummary[] =
  integrationProfiles.map((profile) => ({
    id: profile.id,
    name: profile.name,
    hostPins: profile.hostPins,
    maturity: profile.maturity,
    pathRequirement: profile.pathRequirement,
    publication: profile.publication,
    evidence: profile.evidence,
    conceptualBinding: profile.conceptualBinding,
    adapter: profile.adapter,
    replacementBoundary: profile.replacementBoundary,
    hostBinding: profile.hostBinding,
    exclusions: profile.exclusions,
    deploymentOwnedConfiguration: profile.deploymentOwnedConfiguration,
    profileHref: profile.profileHref,
    verificationDate: profile.verificationDate,
    cleanCheckout: profile.cleanCheckout,
  }));

const declaredPackages: readonly DeclaredPackageSummary[] =
  masugateRelease.packages.flatMap((packageIdentity) =>
    packageIdentity.packageName.state === "available"
      ? [
          {
            id: packageIdentity.id,
            channel: packageIdentity.channel,
            name: packageIdentity.packageName.value,
            version: packageIdentity.version,
            publication: packageIdentity.publication,
          },
        ]
      : [],
  );

export const getStartedGuide = {
  id: "masugate-get-started",
  release: {
    id: masugateRelease.id,
    version: masugateRelease.version,
    state: masugateRelease.state,
    sourcePublication: "public",
    distributionPublication: "source-only",
    maturity: masugateRelease.maturity,
    posture: masugateRelease.posture,
    evidence: masugateRelease.candidateEvidence,
  },
  paths: [
    {
      id: "browser-walkthrough",
      title: "See the governed flow",
      audience: "Anyone meeting MasuGate for the first time.",
      outcome:
        "Understand how one request stays connected to policy code, live shared state, the governed effect, and its record.",
      currentBoundary:
        "An interactive, deterministic product walkthrough—not captured runtime evidence.",
      cta: { ...cta.demo, external: false },
    },
    {
      id: "local-demonstration",
      title: "Run the procurement demo",
      audience: "Developers with the exact Linux/amd64 reference environment.",
      outcome:
        "Build the 0.1.1 release artifacts from source, run the credential-free scenario, and verify its retained result.",
      currentBoundary:
        "Source-based only. Setup may use the network; the measured demo needs no credential or network.",
      cta: { ...cta.run, external: true },
    },
    {
      id: "technical-review",
      title: "Review or extend the artifact",
      audience: "Researchers and application developers inspecting exact contracts.",
      outcome:
        "Follow a bounded review path, inspect integrations, or trace the implementation and its limitations.",
      currentBoundary:
        "Exact research profiles, not a general compatibility or production-assurance claim.",
      cta: { ...cta.review, external: true },
    },
  ],
  quickStartPage: {
    metadataDescription:
      "Run the MasuGate 0.1.1 public-source research preview, verify the credential-free procurement demo, and inspect its exact support boundary.",
    navigation: {
      summary: "Start with the public-source 0.1.1 path",
      links: [
        {
          label: "Choose a path",
          href: "/get-started/#choose-a-path",
          detail: "Browser, local run, or review.",
        },
        {
          label: "Run locally",
          href: "/get-started/#run-locally",
          detail: "Set up, run, and verify.",
        },
        {
          label: "Success contract",
          href: "/get-started/#success-contract",
          detail: "What a passing run establishes.",
        },
        {
          label: "Source and support",
          href: "/get-started/#source-and-support",
          detail: "Repository, docs, and support.",
        },
        {
          label: "Technical reference",
          href: "/get-started/technical/",
          detail: "Runtime, outcomes, and integrations.",
        },
      ],
    },
    hero: {
      eyebrow: "Get Started",
      releaseLabel: "MasuGate 0.1.1 · Public source · Research preview",
      title: "Run one governed action from the public source.",
      intro:
        "Start with the browser story or use the documented Linux/amd64 workflow to build, run, and verify the credential-free procurement demonstration.",
      primaryActionLabel: "Run the public-source demo",
      browserActionLabel: "Explore in the browser",
      sourceActionLabel: "Browse the source",
    },
    summary: {
      label: "Quickstart facts",
      eyebrow: "Before you begin",
      items: [
        "Linux/amd64 with CPython 3.12, Docker, and Compose.",
        "Allow up to 15 minutes and 8 GiB for one-time setup.",
        "The measured demo is credential-free and offline after setup.",
      ],
      note:
        "This is a source-based 0.1.1 research preview. No v0.1.1 Git tag, GitHub Release, PyPI package, or npm package is published.",
    },
    pathsSection: {
      eyebrow: "Three ways in",
      title: "Choose the shortest path to your question.",
      intro:
        "Each path names both the useful outcome and the boundary you should keep in view.",
      audienceLabel: "Best for",
      outcomeLabel: "You will",
      boundaryLabel: "Boundary",
    },
    workflowSection: {
      eyebrow: "Public-source workflow",
      title: "Build once. Run in five minutes. Verify the result.",
      intro:
        "Start in a clean checkout of the public source. Use the exact commands below; the linked repository guide remains canonical if this workflow changes. Policy-state serializability (PSS) asks whether completed decisions and effects retain a valid, real-time-respecting serial explanation over the declared policy state.",
      beforeLabel: "Before you run",
      availableLabel: "Run this step",
      afterLabel: "After the run",
      commandLabel: "Command",
      expectedLabel: "Expected",
      sourceLabel: "Open canonical instructions",
      pssActionLabel: "Read the full PSS explanation",
      pssHref: "/blog/when-allowed-goes-stale/#serial-explanation",
    },
    successSection: {
      eyebrow: "Success contract",
      title: "A pass connects the unsafe baseline to the governed result.",
      intro:
        "The supplied verifier reads the generated evidence instead of asking you to infer success from a screenshot or log excerpt.",
      confirmsLabel: "A passing verifier confirms",
      confirms: [
        "the deliberately unsafe stale concurrent baseline is retained",
        "the governed execution is PSS-valid",
        "one successful committed receipt connects decision and effect",
        "both the unsafe and governed PSS verdicts are present",
      ],
      caveatLabel: "What it does not establish",
      caveat:
        "A passing local run is evidence for this exact 0.1.1 research profile. It is not a production, compliance, arbitrary-host, or arbitrary-policy assurance claim, and it is not an independently retained public verification.",
    },
    sourceSection: {
      eyebrow: "Source and support",
      title: "Public to inspect, precise about distribution.",
      intro:
        "The repository, runbook, expected results, review paths, issue tracker, and security policy are public. Package-registry installation and a tagged GitHub Release remain unavailable.",
      repositoryActionLabel: "Open the GitHub repository",
      documentationActionLabel: "Read the repository guide",
      versionLabel: "Current release identity",
      channelLabel: "Available channel",
      distributionLabel: "Distribution boundary",
    },
    nextSection: {
      eyebrow: "Continue",
      title: "Inspect the product story or the complete technical boundary.",
      intro:
        "Use the interactive demo for the concept, or the technical reference for runtime anatomy, outcomes, profiles, and troubleshooting.",
      demoActionLabel: "Open the browser demo",
      technicalActionLabel: "Open technical reference",
    },
  },
  technicalPage: {
    hero: {
      eyebrow: "Technical reference · 0.1.1",
      title: "Profiles, outcomes, and integration boundaries.",
      intro:
        "Use the exact public-source environment, operation outcomes, host boundaries, and troubleshooting checks for the 0.1.1 research preview.",
    },
    runtimeSection: {
      eyebrow: "Governed runtime anatomy",
      title: "Inspect the complete protected path.",
      intro:
        "The canonical view keeps host, policy, coordination, provider effect, and governance record responsibilities explicit.",
    },
  },
  baseline: {
    target: masugateRelease.referenceEnvironment,
    toolchain: masugateRelease.reviewerToolchain,
    setup: masugateRelease.setupProfile,
    evidence: masugateRelease.candidateEvidence,
  },
  sourceRelease: {
    repository: masugateRelease.candidateSource.repository,
    defaultBranch: masugateRelease.candidateSource.defaultBranch,
    currentMainRevision: masugateRelease.candidateSource.releaseTreeRevision,
    provenanceRevision: masugateRelease.candidateSource.originSourceRevision,
    observedAt: masugateRelease.candidateSource.observedAt,
    publication: "public-source",
    releaseTag: "not-published",
    registries: "not-published",
    boundary:
      "Version 0.1.1 is public and runnable from source. The main branch is mutable; it is not a v0.1.1 tag, GitHub Release, or package-registry publication.",
  },
  sourceQuickStart,
  declaredPackages,
  readinessSteps: [
    {
      id: "get-source",
      number: 1,
      status: "before-you-run",
      title: "Start from a clean source checkout",
      guidance:
        "Open the public repository and use a clean Git checkout. The main branch is the current source channel, not an immutable tagged release.",
      sourceHref: masugateRelease.candidateSource.repository,
    },
    {
      id: "prerequisites",
      number: 2,
      status: "before-you-run",
      title: "Confirm the exact reference profile",
      guidance:
        "Use Linux/amd64, CPython 3.12, Node.js 24.16.0, npm 11.13.0, uv 0.11.26, and Docker with Compose. Allow 15 minutes and 8 GiB for a cold setup.",
      sourceHref: sourceQuickStart.setupHref,
    },
    {
      id: "prepare-once",
      number: 3,
      status: "available",
      title: "Prepare the reviewer inputs once",
      guidance:
        "This setup step uses anonymous network access to retrieve lock- or digest-bound public inputs. The demo itself is offline afterward.",
      command: sourceQuickStart.setupCommand,
      expected: sourceQuickStart.expectedSetupOutput,
      sourceHref: sourceQuickStart.setupHref,
    },
    {
      id: "run-demo",
      number: 4,
      status: "available",
      title: "Run the procurement demonstration",
      guidance:
        "The measured command starts a disposable local Compose stack, retains JSON evidence, and should finish in under 300 seconds.",
      command: sourceQuickStart.runCommand,
      expected: sourceQuickStart.expectedRunOutput,
      sourceHref: sourceQuickStart.guideHref,
    },
    {
      id: "verify-success",
      number: 5,
      status: "available",
      title: "Verify the generated evidence",
      guidance:
        "Run the supplied verifier against the same output directory. Treat any non-pass result as a failed gate.",
      command: sourceQuickStart.verifyCommand,
      expected: sourceQuickStart.expectedVerificationResult,
      sourceHref: sourceQuickStart.expectedResultsHref,
    },
    {
      id: "inspect-result",
      number: 6,
      status: "available",
      title: "Inspect the decision-and-effect record",
      guidance:
        "Follow the request, policy state, decision, governed effect, receipt, and both PSS results in procurement.json and run-metadata.json.",
      sourceHref: sourceQuickStart.expectedResultsHref,
    },
    {
      id: "clean-up",
      number: 7,
      status: "after-run",
      title: "Remove only the disposable demo output",
      guidance:
        "After inspection, remove the exact demo output directory. The separate reviewer setup can be retained for another run or removed with the repository's documented cleanup.",
      command: sourceQuickStart.cleanupCommand,
      sourceHref: sourceQuickStart.setupHref,
    },
  ],
  outcomes: [
    {
      status: "committed",
      terminal: true,
      effectOccurred: true,
      meaning: "The governed effect occurred and its authoritative result is available.",
      integrationResponse:
        "Return or inspect that result; do not invoke the original consequential effect again.",
    },
    {
      status: "denied",
      terminal: true,
      effectOccurred: false,
      meaning: "The action was not permitted and the governed effect did not occur.",
      integrationResponse:
        "Return the denial as the final operation outcome without calling the original effect.",
    },
    {
      status: "pending",
      terminal: false,
      effectOccurred: false,
      meaning: "No final governed effect has occurred and the operation remains durable.",
      integrationResponse:
        "Resolve it through an independently authorized MasuGate path, then read the authoritative operation state.",
    },
  ],
  comparison: {
    id: adoptionComparison.id,
    scenarioId: adoptionComparison.scenarioId,
    requestId: adoptionComparison.requestId,
    policyArtifactId: adoptionComparison.policyArtifactId,
    governedRouteId: adoptionComparison.governedRouteId,
    expectedResult: adoptionComparison.expectedResult,
    fixedArtifacts: adoptionComparison.unchangedArtifacts,
    canonicalRecordFields: adoptionComparison.canonicalRecordFields,
    hostSpecificFields: [
      "Adapter package and import",
      "Tool or function registration",
      "Trusted host-context binding",
      "Framework result conversion",
      "Host configuration and native result wrapper",
    ],
  },
  integrations: integrationSummaries,
  openClawContinuation: {
    releaseId: openClawReferenceCandidate.identity.releaseId,
    releaseState: openClawReferenceCandidate.releaseState,
    evidence: openClawReferenceCandidate.evidence,
    host: openClawReferenceCandidate.integration.host,
    hostVersion: openClawReferenceCandidate.integration.hostVersion,
    adapterPackage: openClawReferenceCandidate.integration.adapterPackage,
    adapterVersion: openClawReferenceCandidate.integration.adapterVersion,
    tool: openClawReferenceCandidate.integration.tool,
    route: openClawReferenceCandidate.integration.route,
    action: openClawReferenceCandidate.integration.action,
    providerId: openClawReferenceCandidate.integration.providerId,
    executionPosition: openClawReferenceCandidate.integration.executionPosition,
    connectorId: openClawReferenceCandidate.integration.connectorId,
    agentId: openClawReferenceCandidate.integration.agentId,
    principalId: openClawReferenceCandidate.integration.principalId,
    credentialEnvironment:
      openClawReferenceCandidate.integration.credentialEnvironment,
    identityBoundary: openClawReferenceCandidate.identityBoundary,
    replacementBoundary: openClawReferenceCandidate.replacementBoundary,
    truths: [
      "MasuGate is the execute boundary for the declared purchase route, not a detached policy-check endpoint.",
      "The adapter governs only declared routes; it does not intercept unrelated OpenClaw tools.",
      "Trusted agent, session, replay, credential, provider, and route context do not come from model-controlled arguments.",
      "Stable action identity from trusted host context is required for safe retry and replay behavior.",
      "A committed result is authoritative; the caller must not invoke a second native purchase effect.",
      "Pending work requires a distinct, independently authorized resolution path.",
      "Providers remain responsible for their declared state views and governed effects.",
    ],
    cta: cta.openClaw,
  },
  troubleshooting: [
    {
      id: "host-version-rejected",
      symptom: "The host platform or tool version is rejected.",
      diagnostic: "Compare every local version with the exact 0.1.1 reference profile.",
      nextStep:
        "Use the declared profile; do not substitute an unverified package combination.",
    },
    {
      id: "pinned-input-unavailable",
      symptom: "One-time setup cannot retrieve or verify a pinned input.",
      diagnostic:
        "Check that setup has network access and that the retrieved input matches its declared lock or digest.",
      nextStep:
        "Preserve the integrity failure and retry only with the release-declared input.",
    },
    {
      id: "containers-unavailable",
      symptom: "Docker or Compose is unavailable.",
      diagnostic:
        "Confirm both required container capabilities before entering the reference workflow.",
      nextStep:
        "Use the documented Linux/amd64 reference environment or request a guided demonstration.",
    },
    {
      id: "service-unreachable",
      symptom: "masugated cannot be reached.",
      diagnostic:
        "Check the deployment-owned service location and the reference stack's service health.",
      nextStep:
        "Restore the declared service boundary before retrying the same logical action.",
    },
    {
      id: "principal-mismatch",
      symptom: "A credential and expected principal do not match.",
      diagnostic:
        "Compare the deployment-owned credential mapping with the trusted principal recorded for the operation.",
      nextStep:
        "Correct the trusted deployment mapping; never move principal selection into model-visible arguments.",
    },
    {
      id: "route-assertion-rejected",
      symptom:
        "A route, provider, execution position, or connector assertion is rejected.",
      diagnostic:
        "Inspect the finite route catalog and its provider, position, and connector binding as one contract.",
      nextStep:
        "Correct the deployment-owned binding instead of bypassing the governed route.",
    },
    {
      id: "operation-pending",
      symptom: "An operation remains pending.",
      diagnostic:
        "Read the authoritative operation state and identify the independently authorized resolution path.",
      nextStep:
        "Resolve or decline through that path, then read the same operation identity again.",
    },
    {
      id: "evidence-verification-failed",
      symptom: "Generated evidence does not pass verification.",
      diagnostic:
        "Compare the environment, source provenance, expected result, and named gate with the 0.1.1 profile.",
      nextStep:
        "Treat the mismatch as a failed verification; do not relabel the output or disable validation.",
    },
  ],
  availability: {
    publicRepository: masugateRelease.publicRepository,
    publicDocumentation: masugateRelease.publicDocumentation,
    primaryInstall: masugateRelease.primaryInstall.command,
    runLocally: available({ href: sourceQuickStart.guideHref }),
    publicEvidence: masugateRelease.publicEvidenceLinks,
    verifiedAt: masugateRelease.verifiedAt,
    openClawPublicInstructions: openClawReferenceCandidate.publicInstructions,
    openClawCapturedRun: openClawReferenceCandidate.capturedRun,
    issueTracker: available({
      href: "https://github.com/masugate/masugate/issues",
    }),
    securityReporting: available({
      href: "https://github.com/masugate/masugate/blob/main/SECURITY.md",
    }),
  },
  documentationLinks: [
    {
      label: "Exact setup",
      detail: "Prerequisites, setup command, network boundary, and cleanup.",
      href: sourceQuickStart.setupHref,
    },
    {
      label: "Reproduction",
      detail: "Required local tier, optional checks, and failure interpretation.",
      href: sourceQuickStart.reproductionHref,
    },
    {
      label: "Expected results",
      detail: "Observable pass conditions and nondeterministic fields.",
      href: sourceQuickStart.expectedResultsHref,
    },
    {
      label: "Review paths",
      detail: "Bounded 15-, 30-, and 60-minute review routes.",
      href: sourceQuickStart.reviewHref,
    },
    {
      label: "Claims and limitations",
      detail: "The exact claim ledger and explicit exclusions.",
      href: sourceQuickStart.claimsHref,
    },
  ],
  cta,
} as const satisfies GetStartedGuide;

const expectedStepIds: readonly ReadinessStepId[] = [
  "get-source",
  "prerequisites",
  "prepare-once",
  "run-demo",
  "verify-success",
  "inspect-result",
  "clean-up",
];

function sameStrings(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

export function validateGetStartedGuide(
  guide: GetStartedGuide = getStartedGuide,
  release: ReleaseContract = masugateRelease,
): readonly string[] {
  const errors: string[] = [];
  const quickStart = guide.quickStartPage;

  if (
    guide.release.id !== release.id ||
    guide.release.version !== release.version ||
    guide.release.state !== release.state ||
    guide.release.maturity !== release.maturity
  ) {
    errors.push("Get Started release identity drifted from the release contract.");
  }

  if (
    guide.release.state !== "source-public" ||
    guide.release.sourcePublication !== "public" ||
    guide.release.distributionPublication !== "source-only" ||
    guide.release.evidence.status !== "reference"
  ) {
    errors.push("Get Started must preserve the public-source research-preview boundary.");
  }

  const navigationHrefs = quickStart.navigation.links.map(({ href }) => href);
  if (
    !sameStrings(navigationHrefs, [
      "/get-started/#choose-a-path",
      "/get-started/#run-locally",
      "/get-started/#success-contract",
      "/get-started/#source-and-support",
      "/get-started/technical/",
    ])
  ) {
    errors.push("Get Started navigation drifted from its rendered sections.");
  }

  if (
    !/policy-state serializability \(PSS\)/i.test(
      quickStart.workflowSection.intro,
    ) ||
    quickStart.workflowSection.pssHref !==
      "/blog/when-allowed-goes-stale/#serial-explanation"
  ) {
    errors.push("Get Started must define PSS before first use and link its explainer.");
  }

  if (guide.paths.length !== 3 || new Set(guide.paths.map(({ id }) => id)).size !== 3) {
    errors.push("Get Started must expose three distinct entry paths.");
  }

  const steps = guide.readinessSteps;
  if (
    steps.length !== expectedStepIds.length ||
    steps.some(
      (step, index) =>
        step.id !== expectedStepIds[index] || step.number !== index + 1,
    )
  ) {
    errors.push("Get Started public-source workflow order drifted.");
  }

  const commandById = new Map(steps.map((step) => [step.id, step.command]));
  if (
    commandById.get("prepare-once") !== guide.sourceQuickStart.setupCommand ||
    commandById.get("run-demo") !== guide.sourceQuickStart.runCommand ||
    commandById.get("verify-success") !== guide.sourceQuickStart.verifyCommand ||
    commandById.get("clean-up") !== guide.sourceQuickStart.cleanupCommand
  ) {
    errors.push("Get Started commands drifted from the canonical source quickstart.");
  }

  const serializedCommands = steps.map(({ command }) => command ?? "").join("\n");
  if (
    /\b(?:pip3?|uv)\s+install\b|\bnpm\s+(?:install|add)\b|\bnpx\b/i.test(
      serializedCommands,
    )
  ) {
    errors.push("Get Started cannot imply an unpublished registry installation.");
  }

  if (
    guide.availability.publicRepository.state !== "available" ||
    guide.availability.publicDocumentation.state !== "available" ||
    guide.availability.runLocally.state !== "available" ||
    guide.availability.primaryInstall.state !== "unavailable"
  ) {
    errors.push("Get Started source and distribution availability contradict each other.");
  }

  if (
    guide.sourceRelease.releaseTag !== "not-published" ||
    guide.sourceRelease.registries !== "not-published" ||
    !/not a v0\.1\.1 tag|not.*tag/i.test(guide.sourceRelease.boundary)
  ) {
    errors.push("Get Started must keep the tag and registry boundary visible.");
  }

  if (
    guide.declaredPackages.length !== release.packages.length ||
    guide.declaredPackages.some(
      (item) => item.version !== release.version || item.publication !== "declared-only",
    )
  ) {
    errors.push("Get Started package declarations drifted from the 0.1.1 catalog.");
  }

  const outcomes = new Map(guide.outcomes.map((outcome) => [outcome.status, outcome]));
  if (
    outcomes.size !== 3 ||
    !outcomes.get("committed")?.effectOccurred ||
    outcomes.get("denied")?.effectOccurred ||
    outcomes.get("pending")?.effectOccurred ||
    outcomes.get("pending")?.terminal
  ) {
    errors.push("Get Started operation outcomes are incomplete or inconsistent.");
  }

  if (
    guide.comparison.id !== adoptionComparison.id ||
    !sameStrings(guide.comparison.fixedArtifacts, adoptionComparison.unchangedArtifacts) ||
    !sameStrings(
      guide.comparison.canonicalRecordFields,
      adoptionComparison.canonicalRecordFields,
    )
  ) {
    errors.push("Get Started fixed comparison drifted from the adoption contract.");
  }

  if (
    guide.integrations.length !== integrationProfiles.length ||
    guide.integrations.some((summary) => {
      const source = integrationProfiles.find(({ id }) => id === summary.id);
      return (
        !source ||
        !sameStrings(
          summary.hostPins.map(({ component, version }) => `${component}@${version}`),
          source.hostPins.map(({ component, version }) => `${component}@${version}`),
        )
      );
    })
  ) {
    errors.push("Get Started integration profiles drifted from their source contract.");
  }

  if (
    guide.openClawContinuation.releaseId !==
      openClawReferenceCandidate.identity.releaseId ||
    guide.openClawContinuation.adapterVersion !==
      openClawReferenceCandidate.integration.adapterVersion ||
    guide.openClawContinuation.truths.length < 7
  ) {
    errors.push("Get Started OpenClaw continuation drifted from the public reference.");
  }

  if (
    guide.troubleshooting.length !== 8 ||
    new Set(guide.troubleshooting.map(({ id }) => id)).size !== 8
  ) {
    errors.push("Get Started must cover all eight troubleshooting symptoms.");
  }

  return errors;
}

export const getStartedValidationErrors = validateGetStartedGuide();
