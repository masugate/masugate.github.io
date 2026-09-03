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
  unavailable,
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
  type VersionPin,
} from "./release";

export type GetStartedPathId =
  | "reference-demo"
  | "application-integration"
  | "research-artifact";

export type GetStartedCtaHref =
  | "/demo/"
  | "/demo/openclaw-reference/"
  | "/#contact";

export interface GetStartedPath {
  id: GetStartedPathId;
  title: string;
  audience: string;
  outcome: string;
  currentBoundary: string;
  cta: Readonly<{
    label: string;
    href: GetStartedCtaHref;
  }>;
}

export type ReadinessStepId =
  | "prerequisites"
  | "get-release"
  | "prepare-once"
  | "run-demo"
  | "verify-success"
  | "inspect-result"
  | "clean-up";

export interface ReadinessStep {
  id: ReadinessStepId;
  number: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  title: string;
  status: "review-now" | "release-gated";
  guidance: string;
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
  runLocally: Availability<Readonly<{ href: string }>>;
  publicEvidence: Availability<
    readonly Readonly<{ label: string; href: `https://${string}` }>[]
  >;
  verifiedAt: Availability<IsoDate>;
  openClawPublicInstructions: Availability<never>;
  openClawCapturedRun: Availability<never>;
  issueTracker: Availability<Readonly<{ href: `https://${string}` }>>;
  securityReporting: Availability<Readonly<{ href: `https://${string}` }>>;
}

export interface CandidateSourceCheckpoint {
  repository: string;
  defaultBranch: string;
  releaseTreeRevision: string;
  originSourceRevision: string;
  visibility: "private" | "public";
  observedAt: IsoDate;
  releaseTag: "not-published";
  externalReleaseAuthorization: "pending";
  publishingWorkflows: "disabled";
  liveGateContract: "needs-reconciliation";
  sourceChecks: readonly Readonly<{
    label: string;
    status: "passed" | "pending";
  }>[];
  boundary: string;
}

export interface DeclaredPackageSummary {
  id: string;
  channel: "pypi" | "npm" | "release-asset" | "container";
  name: string;
  version: string;
  publication: "declared-only";
}

export interface GetStartedGuide {
  id: "masugate-get-started";
  release: Readonly<{
    id: string;
    version: string;
    state: ReleaseState;
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
          | "/get-started/#evaluation-paths"
          | "/get-started/#technical-readiness"
          | "/get-started/#source-review"
          | "/get-started/technical/";
        detail: string;
      }>[];
    }>;
    hero: Readonly<{
      eyebrow: string;
      title: string;
      intro: string;
      demoActionLabel: string;
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
    readinessSection: Readonly<{
      eyebrow: string;
      title: string;
      intro: string;
      reviewNowLabel: string;
      releaseGatedLabel: string;
    }>;
    sourceSection: Readonly<{
      eyebrow: string;
      title: string;
      intro: string;
      repositoryActionLabel: string;
      documentationActionLabel: string;
      revisionLabel: string;
      boundaryLabel: string;
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
    hero: Readonly<{
      eyebrow: string;
      title: string;
      intro: string;
    }>;
    runtimeSection: Readonly<{
      eyebrow: string;
      title: string;
      intro: string;
    }>;
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
  candidateSource: CandidateSourceCheckpoint;
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
    releaseState: "unreleased";
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
    cta: Readonly<{
      label: string;
      href: "/demo/openclaw-reference/";
    }>;
  }>;
  troubleshooting: readonly Readonly<{
    id: string;
    symptom: string;
    diagnostic: string;
    nextStep: string;
  }>[];
  availability: GetStartedAvailability;
  cta: Readonly<{
    demo: Readonly<{ label: string; href: "/demo/" }>;
    openClaw: Readonly<{
      label: string;
      href: "/demo/openclaw-reference/";
    }>;
    contact: Readonly<{ label: string; href: "/#contact" }>;
  }>;
}

const pathCtas = {
  demo: { label: "Explore the interactive walkthrough", href: "/demo/" },
  openClaw: {
    label: "Inspect the OpenClaw candidate",
    href: "/demo/openclaw-reference/",
  },
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
            publication: "declared-only" as const,
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
    maturity: masugateRelease.maturity,
    posture: masugateRelease.posture,
    evidence: masugateRelease.candidateEvidence,
  },
  paths: [
    {
      id: "reference-demo",
      title: "Explore the reference walkthrough",
      audience: "A developer evaluating MasuGate for the first time.",
      outcome:
        "Understand one governed procurement flow and the evidence it should retain.",
      currentBoundary:
        "The browser walkthrough is available now. A pinned Git candidate exists; a supported, retained local run remains gated.",
      cta: pathCtas.demo,
    },
    {
      id: "application-integration",
      title: "Inspect an application integration",
      audience: "A developer adding MasuGate to an existing agent system.",
      outcome:
        "Compare the invariant governance contract with one host-specific binding.",
      currentBoundary:
        "Inspect the exact OpenClaw candidate boundary and declared packages; registry install and run instructions are not public yet.",
      cta: pathCtas.openClaw,
    },
    {
      id: "research-artifact",
      title: "Plan research reproduction",
      audience: "A reviewer validating the implementation and its claims.",
      outcome:
        "Use the eventual immutable release, supported environment, and retained verification gates.",
      currentBoundary:
        "The public Git-backed candidate is fixed, but its tag, release authorization, and retained evidence are still pending.",
      cta: pathCtas.contact,
    },
  ],
  quickStartPage: {
    metadataDescription:
      "Explore the browser walkthrough, review the public source candidate, and inspect release readiness while local installation and runtime evidence remain unavailable.",
    navigation: {
      summary: "Evaluate the current research preview",
      links: [
        {
          label: "Evaluation paths",
          href: "/get-started/#evaluation-paths",
          detail: "Choose the browser, source-review, or research path.",
        },
        {
          label: "Technical readiness",
          href: "/get-started/#technical-readiness",
          detail: "Review what is available now and what remains release-gated.",
        },
        {
          label: "Public source candidate",
          href: "/get-started/#source-review",
          detail: "Inspect the repository, documentation, and release boundary.",
        },
        {
          label: "Technical reference",
          href: "/get-started/technical/",
          detail: "Inspect profiles, outcomes, and integration boundaries.",
        },
      ],
    },
    hero: {
      eyebrow: "Get Started",
      title: "Choose the evidence path available today.",
      intro:
        "Explore the browser walkthrough, inspect the public source candidate, and review technical readiness while installation and verified local execution remain release-gated.",
      demoActionLabel: "Explore the browser walkthrough",
      sourceActionLabel: "Review the public source",
    },
    summary: {
      label: "Current evaluation paths",
      eyebrow: "Available now",
      items: [
        "Explore the governed scenario in the browser.",
        "Review the public Git candidate and documentation.",
        "Track the remaining release and runtime gates.",
      ],
      note:
        "Local installation and run instructions stay hidden until the tagged release path and runtime evidence are available.",
    },
    pathsSection: {
      eyebrow: "Evaluation paths",
      title: "Start from the boundary you need to inspect.",
      intro:
        "Each path leads to material that is available now and states what remains gated.",
      audienceLabel: "For",
      outcomeLabel: "What you can learn",
      boundaryLabel: "Current boundary",
    },
    readinessSection: {
      eyebrow: "Technical readiness",
      title: "See the release path without publishing a recipe early.",
      intro:
        "The sequence stays visible for reviewers, while every action that depends on a tagged release or supported runtime evidence remains gated.",
      reviewNowLabel: "Review now",
      releaseGatedLabel: "Release-gated",
    },
    sourceSection: {
      eyebrow: "Public source candidate",
      title: "Review the source without mistaking it for a release.",
      intro:
        "The repository and documentation are public. The pinned candidate is still untagged, and its local-run and verification paths are not available for promotion.",
      repositoryActionLabel: "Open the GitHub repository",
      documentationActionLabel: "Read the repository guide",
      revisionLabel: "Pinned release-tree commit",
      boundaryLabel: "Release boundary",
    },
    nextSection: {
      eyebrow: "Continue",
      title: "Follow the walkthrough or inspect the full contract.",
      intro:
        "Use the browser demo for the product story, or the technical reference for profiles, outcomes, integration boundaries, and readiness detail.",
      demoActionLabel: "Open the browser demo",
      technicalActionLabel: "Open technical reference",
    },
  },
  technicalPage: {
    hero: {
      eyebrow: "Technical reference",
      title: "Profiles, outcomes, and integration boundaries.",
      intro:
        "Use the exact environment profile, operation outcomes, host boundaries, and troubleshooting checks for the research preview.",
    },
    runtimeSection: {
      eyebrow: "Governed runtime anatomy",
      title: "Inspect the complete protected path.",
      intro:
        "The canonical view keeps host, policy, coordination, provider effect, and governance record responsibilities explicit.",
    },
  },
  baseline: {
    target: {
      os: masugateRelease.referenceEnvironment.os,
      architecture: masugateRelease.referenceEnvironment.architecture,
      python: openClawReferenceCandidate.environment.python,
      dockerRequired: openClawReferenceCandidate.environment.dockerRequired,
      composeRequired: openClawReferenceCandidate.environment.composeRequired,
    },
    toolchain: masugateRelease.reviewerToolchain,
    setup: masugateRelease.setupProfile,
    evidence: openClawReferenceCandidate.evidence,
  },
  candidateSource: {
    repository: masugateRelease.candidateSource.repository,
    defaultBranch: masugateRelease.candidateSource.defaultBranch,
    releaseTreeRevision:
      masugateRelease.candidateSource.releaseTreeRevision,
    originSourceRevision:
      masugateRelease.candidateSource.originSourceRevision,
    visibility: masugateRelease.candidateSource.visibility,
    observedAt: masugateRelease.candidateSource.observedAt,
    releaseTag: "not-published",
    externalReleaseAuthorization:
      masugateRelease.sourceAudit.externalReleaseAuthorization,
    publishingWorkflows: masugateRelease.sourceAudit.publishingWorkflows,
    liveGateContract: masugateRelease.sourceAudit.liveGateContract,
    sourceChecks: [
      { label: "Release-control document validation", status: "passed" },
      { label: "Documentation validation", status: "passed" },
      { label: "Supported Linux/amd64 runtime gates", status: "pending" },
      { label: "Retained public evidence bundle", status: "pending" },
    ],
    boundary:
      "A public pinned candidate is not a published release: no v0.1.0 tag or GitHub Release exists, release authorization is pending, and the live gate input contract still needs reconciliation.",
  },
  declaredPackages,
  readinessSteps: [
    {
      id: "prerequisites",
      number: 1,
      title: "Confirm prerequisites",
      status: "review-now",
      guidance:
        "Confirm the Linux/amd64 reference target, CPython and reviewer toolchain pins, Docker and Compose, setup time, disk, and one-time network boundary.",
    },
    {
      id: "get-release",
      number: 2,
      title: "Get the named release",
      status: "release-gated",
      guidance:
        "The public candidate repository and exact release-tree commit are fixed. Wait for the reviewed v0.1.0 tag and GitHub Release, plus attached integrity material, before treating it as the named public release.",
    },
    {
      id: "prepare-once",
      number: 3,
      title: "Prepare once",
      status: "release-gated",
      guidance:
        "Follow the release-owned artifact-review setup only after its missing live-gate inputs are reconciled and the complete path passes the supported clean environment.",
    },
    {
      id: "run-demo",
      number: 4,
      title: "Run the demonstration",
      status: "release-gated",
      guidance:
        "Exercise the fixed procurement workload using the release-owned entry point and declared provider boundary.",
    },
    {
      id: "verify-success",
      number: 5,
      title: "Verify success",
      status: "release-gated",
      guidance:
        "Match the terminal outcome and verifier result to the exact release, environment, and evidence gate.",
    },
    {
      id: "inspect-result",
      number: 6,
      title: "Inspect the result",
      status: "release-gated",
      guidance:
        "Follow the operation identity across the request, state reads, policy decision, governed effect, and retained record.",
    },
    {
      id: "clean-up",
      number: 7,
      title: "Clean up",
      status: "release-gated",
      guidance:
        "Use only the narrowly scoped cleanup procedure verified and published with the selected release.",
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
    executionPosition:
      openClawReferenceCandidate.integration.executionPosition,
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
    cta: pathCtas.openClaw,
  },
  troubleshooting: [
    {
      id: "host-version-rejected",
      symptom: "The host platform or tool version is rejected.",
      diagnostic:
        "Compare every local version with the exact candidate or selected-release profile.",
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
        "Compare the environment, immutable revision, expected result, and named gate with the selected release.",
      nextStep:
        "Treat the mismatch as a failed verification; do not relabel the output or disable validation.",
    },
  ],
  availability: {
    publicRepository: masugateRelease.publicRepository,
    publicDocumentation: masugateRelease.publicDocumentation,
    primaryInstall: masugateRelease.primaryInstall.command,
    runLocally: unavailable(
      "verification-pending",
      "A tagged release-owned local-run path remains pending.",
    ),
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
  cta: pathCtas,
} as const satisfies GetStartedGuide;

const expectedPathCtas = new Map<GetStartedPathId, GetStartedCtaHref>([
  ["reference-demo", "/demo/"],
  ["application-integration", "/demo/openclaw-reference/"],
  ["research-artifact", "/#contact"],
]);

const expectedReadinessStepIds: readonly ReadinessStepId[] = [
  "prerequisites",
  "get-release",
  "prepare-once",
  "run-demo",
  "verify-success",
  "inspect-result",
  "clean-up",
];

const commandShape = /(?:^|\n)\s*(?:\$\s*)?(?:pip3?|npm|npx|pnpm|yarn|uv|git|docker(?:\s+compose)?|python3?|curl|wget)\s+\S/i;

function sameStrings(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

export function validateGetStartedGuide(
  guide: GetStartedGuide = getStartedGuide,
  release: ReleaseContract = masugateRelease,
): readonly string[] {
  const errors: string[] = [];
  const pathIds = new Set<GetStartedPathId>();
  const quickStart = guide.quickStartPage;
  const quickStartCopy = [
    quickStart.metadataDescription,
    quickStart.navigation.summary,
    ...quickStart.navigation.links.flatMap(({ label, detail }) => [label, detail]),
    quickStart.hero.eyebrow,
    quickStart.hero.title,
    quickStart.hero.intro,
    quickStart.hero.demoActionLabel,
    quickStart.hero.sourceActionLabel,
    quickStart.summary.label,
    quickStart.summary.eyebrow,
    ...quickStart.summary.items,
    quickStart.summary.note,
    ...Object.values(quickStart.pathsSection),
    ...Object.values(quickStart.readinessSection),
    ...Object.values(quickStart.sourceSection),
    ...Object.values(quickStart.nextSection),
  ];

  if (quickStartCopy.some((value) => value.trim().length === 0)) {
    errors.push("The Get Started presentation copy is incomplete.");
  }
  if (
    quickStart.summary.items.length !== 3 ||
    quickStartCopy.some((value) => commandShape.test(value))
  ) {
    errors.push("The Get Started evaluation summary must stay three-part and command-free.");
  }
  if (
    !sameStrings(
      quickStart.navigation.links.map(({ href }) => href),
      [
        "/get-started/#evaluation-paths",
        "/get-started/#technical-readiness",
        "/get-started/#source-review",
        "/get-started/technical/",
      ],
    )
  ) {
    errors.push("The Get Started navigation drifted from its current route sections.");
  }

  const unsupportedRunClaim =
    /\b(?:prepare the supported (?:local )?workspace|run and verify|under five minutes|successful run|PSS-valid execution|exits with status zero)\b/i;
  if (
    guide.availability.runLocally.state === "unavailable" &&
    quickStartCopy.some((value) => unsupportedRunClaim.test(value))
  ) {
    errors.push("Unavailable local execution cannot be presented as supported or verified.");
  }

  for (const path of guide.paths) {
    if (pathIds.has(path.id)) {
      errors.push(`Duplicate Get Started path: ${path.id}`);
    }
    pathIds.add(path.id);

    if (path.cta.href !== expectedPathCtas.get(path.id)) {
      errors.push(`Get Started path has the wrong current CTA: ${path.id}`);
    }
  }

  if (pathIds.size !== expectedPathCtas.size) {
    errors.push("Get Started must expose exactly three task-oriented paths.");
  }

  if (
    guide.cta.demo.href !== "/demo/" ||
    guide.cta.openClaw.href !== "/demo/openclaw-reference/" ||
    guide.cta.contact.href !== "/#contact"
  ) {
    errors.push("Get Started CTAs drifted from the three approved internal destinations.");
  }

  if (
    guide.release.id !== release.id ||
    guide.release.version !== release.version ||
    guide.release.state !== release.state ||
    guide.release.maturity !== release.maturity
  ) {
    errors.push("Get Started release identity drifted from the release contract.");
  }

  const candidateEnvironment = openClawReferenceCandidate.environment;
  const baseline = guide.baseline;
  if (
    baseline.target.os !== candidateEnvironment.os ||
    baseline.target.architecture !== candidateEnvironment.architecture ||
    baseline.target.python !== candidateEnvironment.python ||
    baseline.target.dockerRequired !== candidateEnvironment.dockerRequired ||
    baseline.target.composeRequired !== candidateEnvironment.composeRequired
  ) {
    errors.push("Get Started baseline drifted from the exact candidate environment.");
  }

  const expectedToolchain = [
    ...release.reviewerToolchain.map(({ component, version }) => [
      component,
      version,
    ]),
  ];
  if (
    baseline.toolchain.length !== expectedToolchain.length ||
    baseline.toolchain.some(
      (pin, index) =>
        pin.component !== expectedToolchain[index]?.[0] ||
        pin.version !== expectedToolchain[index]?.[1],
    )
  ) {
    errors.push("Get Started reviewer toolchain drifted from the candidate pins.");
  }

  if (
    guide.candidateSource.repository !== release.candidateSource.repository ||
    guide.candidateSource.releaseTreeRevision !==
      release.candidateSource.releaseTreeRevision ||
    guide.candidateSource.originSourceRevision !==
      release.candidateSource.originSourceRevision ||
    guide.candidateSource.visibility !== release.candidateSource.visibility
  ) {
    errors.push("Get Started candidate source drifted from the release contract.");
  }

  const sourceStatusCopy = [
    ...guide.paths.map(({ currentBoundary }) => currentBoundary),
    guide.candidateSource.boundary,
    ...guide.readinessSteps.map(({ guidance }) => guidance),
  ];
  if (
    guide.availability.publicRepository.state === "available" &&
    sourceStatusCopy.some((value) =>
      /(?:wait for anonymous access|anonymous access (?:is )?unavailable|(?:source )?repository (?:is )?private)/i.test(
        value,
      ),
    )
  ) {
    errors.push("Public repository copy contradicts the availability contract.");
  }

  if (
    guide.candidateSource.sourceChecks.filter(({ status }) => status === "passed")
      .length !== 2 ||
    guide.candidateSource.sourceChecks.filter(({ status }) => status === "pending")
      .length !== 2
  ) {
    errors.push("Get Started must distinguish source checks from runtime acceptance.");
  }

  const expectedDeclaredPackages = release.packages.filter(
    ({ packageName }) => packageName.state === "available",
  );
  if (
    guide.declaredPackages.length !== expectedDeclaredPackages.length ||
    guide.declaredPackages.some(
      (packageIdentity) =>
        packageIdentity.publication !== "declared-only" ||
        !expectedDeclaredPackages.some(
          (source) =>
            source.id === packageIdentity.id &&
            source.packageName.state === "available" &&
            source.packageName.value === packageIdentity.name &&
            source.version === packageIdentity.version,
        ),
    )
  ) {
    errors.push("Get Started declared packages drifted from the candidate catalog.");
  }

  const readinessIds = new Set<ReadinessStepId>();
  for (const [index, step] of guide.readinessSteps.entries()) {
    if (readinessIds.has(step.id)) {
      errors.push(`Duplicate Get Started readiness step: ${step.id}`);
    }
    readinessIds.add(step.id);

    if (step.id !== expectedReadinessStepIds[index] || step.number !== index + 1) {
      errors.push(`Get Started readiness order drifted at step ${index + 1}.`);
    }
    if (
      Object.keys(step).some((key) => key.toLowerCase().includes("command")) ||
      commandShape.test(step.guidance)
    ) {
      errors.push(`Release-gated readiness step contains command-shaped content: ${step.id}`);
    }
  }
  if (guide.readinessSteps.length !== 7 || readinessIds.size !== 7) {
    errors.push("Get Started must contain exactly seven command-free readiness steps.");
  }

  const outcomes = new Map(guide.outcomes.map((outcome) => [outcome.status, outcome]));
  const committed = outcomes.get("committed");
  const denied = outcomes.get("denied");
  const pending = outcomes.get("pending");
  if (outcomes.size !== 3 || guide.outcomes.length !== 3) {
    errors.push("Get Started must define committed, denied, and pending exactly once.");
  }
  if (!committed?.terminal || !committed.effectOccurred) {
    errors.push("Committed must be terminal and state that the governed effect occurred.");
  }
  if (!denied?.terminal || denied.effectOccurred) {
    errors.push("Denied must be terminal and state that no governed effect occurred.");
  }
  if (pending?.terminal || pending?.effectOccurred) {
    errors.push("Pending must be nonterminal and state that no final effect occurred.");
  }
  if (!committed?.integrationResponse.includes("do not invoke")) {
    errors.push("Committed handling must forbid invoking the original effect again.");
  }
  if (!pending?.integrationResponse.includes("independently authorized")) {
    errors.push("Pending handling must require independent authorization.");
  }

  if (
    guide.comparison.id !== adoptionComparison.id ||
    guide.comparison.requestId !== adoptionComparison.requestId ||
    guide.comparison.policyArtifactId !== adoptionComparison.policyArtifactId ||
    guide.comparison.governedRouteId !== adoptionComparison.governedRouteId ||
    !sameStrings(
      guide.comparison.fixedArtifacts,
      adoptionComparison.unchangedArtifacts,
    ) ||
    !sameStrings(
      guide.comparison.canonicalRecordFields,
      adoptionComparison.canonicalRecordFields,
    )
  ) {
    errors.push("Get Started fixed comparison drifted from the adoption contract.");
  }

  const integrationIds = new Set<IntegrationProfileId>();
  for (const summary of guide.integrations) {
    if (integrationIds.has(summary.id)) {
      errors.push(`Duplicate Get Started integration: ${summary.id}`);
    }
    integrationIds.add(summary.id);

    const source = integrationProfiles.find(({ id }) => id === summary.id);
    if (!source || !sameStrings(
      summary.hostPins.map(({ component, version }) => `${component}@${version}`),
      source.hostPins.map(({ component, version }) => `${component}@${version}`),
    )) {
      errors.push(`Get Started integration pins drifted from the source profile: ${summary.id}`);
    }
  }
  if (integrationIds.size !== integrationProfiles.length) {
    errors.push("Get Started must summarize every declared integration profile once.");
  }

  const openClaw = guide.openClawContinuation;
  const referenceIntegration = openClawReferenceCandidate.integration;
  if (
    openClaw.releaseId !== openClawReferenceCandidate.identity.releaseId ||
    openClaw.hostVersion !== referenceIntegration.hostVersion ||
    openClaw.adapterPackage !== referenceIntegration.adapterPackage ||
    openClaw.adapterVersion !== referenceIntegration.adapterVersion ||
    openClaw.route !== referenceIntegration.route ||
    openClaw.action !== referenceIntegration.action ||
    openClaw.providerId !== referenceIntegration.providerId ||
    openClaw.executionPosition !== referenceIntegration.executionPosition ||
    openClaw.connectorId !== referenceIntegration.connectorId ||
    openClaw.principalId !== referenceIntegration.principalId
  ) {
    errors.push("Get Started OpenClaw continuation drifted from the candidate contract.");
  }
  if (openClaw.truths.length < 7) {
    errors.push("Get Started must keep the OpenClaw execution and trust boundaries visible.");
  }

  const troubleshootingIds = new Set(
    guide.troubleshooting.map(({ id }) => id),
  );
  if (guide.troubleshooting.length !== 8 || troubleshootingIds.size !== 8) {
    errors.push("Get Started must cover all eight observable troubleshooting symptoms.");
  }
  for (const item of guide.troubleshooting) {
    if (
      commandShape.test(item.diagnostic) ||
      commandShape.test(item.nextStep)
    ) {
      errors.push(`Troubleshooting contains an unverified command: ${item.id}`);
    }
  }

  if (release.state === "unreleased") {
    const releaseOnlyAvailability = {
      primaryInstall: guide.availability.primaryInstall,
      runLocally: guide.availability.runLocally,
      publicEvidence: guide.availability.publicEvidence,
      verifiedAt: guide.availability.verifiedAt,
      openClawPublicInstructions:
        guide.availability.openClawPublicInstructions,
      openClawCapturedRun: guide.availability.openClawCapturedRun,
    };
    for (const [name, value] of Object.entries(releaseOnlyAvailability)) {
      if (value.state === "available") {
        errors.push(`Unreleased Get Started cannot expose available ${name}.`);
      }
    }

    if (guide.release.evidence.status === "verified") {
      errors.push("Unreleased Get Started cannot claim Verified release evidence.");
    }
    if (
      guide.openClawContinuation.releaseState !== "unreleased" ||
      guide.openClawContinuation.evidence.status === "verified"
    ) {
      errors.push("Unreleased Get Started cannot promote the OpenClaw candidate.");
    }

    for (const integration of guide.integrations) {
      if (
        integration.publication !== "reference-only" ||
        integration.evidence.status === "verified" ||
        integration.profileHref.state === "available" ||
        integration.verificationDate.state === "available" ||
        integration.cleanCheckout.state === "available"
      ) {
        errors.push(
          `Unreleased Get Started cannot promote integration evidence: ${integration.id}`,
        );
      }
    }
  }

  return errors;
}

export const getStartedValidationErrors = validateGetStartedGuide();
