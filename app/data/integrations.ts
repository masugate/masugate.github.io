import {
  type Availability,
  type Available,
  type ConformanceCheckId,
  type IntegrationProfileId,
  type Maturity,
  type PathRequirement,
  type ReferenceEvidence,
  type Unavailable,
  type VerifiedEvidence,
  available,
  unavailable,
} from "./contracts";
import { masugateRelease, type VersionPin } from "./release";

export const adoptionComparison = {
  id: "shared-budget-travel-purchase",
  scenarioId: "openclaw-personal-operations",
  requestId: "stage-2-travel-hotel-deposit",
  policyArtifactId: "categorized-purchase-v2",
  governedRouteId: "purchase",
  providerContract: {
    scenarioId: "business-budget-reference",
    releaseBinding: unavailable(
      "release-binding-unconfirmed",
      "The exact provider contract must come from the selected public release.",
    ),
  },
  expectedResult: {
    policyDecision: "escalate",
    humanResolution: "allow-once",
    operationStatus: "committed",
  },
  unchangedArtifacts: [
    "Scenario request and expected result",
    "Policy source and exact scenario revision",
    "Governed route",
    "Provider state views and effect contract",
    "Canonical MasuGate outcome contract and record fields",
  ],
  canonicalRecordFields: [
    "operationId",
    "trustedPrincipal",
    "action",
    "arguments",
    "policyRevision",
    "stateReads",
    "policyDecision",
    "humanResolution",
    "operationStatus",
    "effectResult",
  ],
} as const;

export type AdoptionComparisonId = typeof adoptionComparison.id;

export interface IntegrationProfileBase {
  id: IntegrationProfileId;
  name: string;
  logoPath: `/${string}`;
  hostPins: readonly VersionPin[];
  masugateReleaseId: typeof masugateRelease.id;
  masugateVersion: typeof masugateRelease.version;
  maturity: Maturity;
  pathRequirement: PathRequirement;
  adapter: Readonly<{
    packageName: Availability<string>;
    version: Availability<string>;
  }>;
  comparisonId: AdoptionComparisonId;
  conceptualBinding: string;
  governedRoute: Readonly<{
    scenarioRouteId: "purchase";
    releaseBinding: Availability<string>;
  }>;
  replacementBoundary: string;
  hostBinding: Readonly<{
    trustedPrincipalSource: string;
    stableActionIdentitySource: string;
    nativeResultWrapper: string;
  }>;
  exclusions: readonly string[];
  deploymentOwnedConfiguration: readonly string[];
}

export type ReferenceIntegrationProfile = IntegrationProfileBase &
  Readonly<{
    publication: "reference-only";
    evidence: ReferenceEvidence;
    profileHref: Availability<`https://${string}`>;
    verificationDate: Unavailable;
    cleanCheckout: Unavailable;
    conformance: Unavailable;
    homepageRole: "primary-demo-story" | "none";
  }>;

export type PublishableIntegrationProfile = IntegrationProfileBase &
  Readonly<{
    publication: "publishable";
    evidence: VerifiedEvidence;
    profileHref: Available<`https://${string}`>;
    verificationDate: Available<VerifiedEvidence["verifiedAt"]>;
    cleanCheckout: Available<
      Readonly<{
        sourceHref: `https://${string}`;
        command: string;
      }>
    >;
    conformance: Available<
      Readonly<{
        gate: string;
        results: Readonly<Record<ConformanceCheckId, "passed">>;
      }>
    >;
    homepageRole: "verified-selector" | "none";
  }>;

export type IntegrationProfile =
  | ReferenceIntegrationProfile
  | PublishableIntegrationProfile;

const pendingRouteBinding = () =>
  unavailable(
    "release-binding-unconfirmed",
    "The website scenario route is not asserted to match the exact 0.1.1 source-reference route.",
  );

const pendingVerificationDate = () =>
  unavailable(
    "verification-pending",
    "This candidate profile has no public release-verification date.",
  );

const pendingCleanCheckout = () =>
  unavailable(
    "install-command-unavailable",
    "A complete clean-checkout command must pass the public release gate before publication.",
  );

const pendingConformance = () =>
  unavailable(
    "public-evidence-unavailable",
    "Public results for the common adapter-conformance suite are not available.",
  );

function profileEvidence(profileId: IntegrationProfileId): ReferenceEvidence {
  return {
    status: "reference",
    sourceKind: "candidate-manifest",
    locator:
      `masugate/masugate@main:source-integration-profile:${profileId}`,
    note:
      "Public-source profile metadata is Reference material, not registry availability, independently retained runtime evidence, or a broad compatibility claim.",
  };
}

const profileHrefs: Readonly<Record<IntegrationProfileId, `https://${string}`>> = {
  openclaw:
    "https://github.com/masugate/masugate/blob/main/integrations/openclaw/README.md",
  "langchain-langgraph":
    "https://github.com/masugate/masugate/blob/main/adapters/langchain/README.md",
  "microsoft-agent-framework":
    "https://github.com/masugate/masugate/blob/main/adapters/agent-framework/README.md",
  crewai:
    "https://github.com/masugate/masugate/blob/main/adapters/crewai/README.md",
};

const commonReplacementBoundary =
  "The MasuGate-backed tool replaces the original consequential purchase tool on the declared route. Unrelated host tools remain host-owned and are not mediated automatically.";

export const integrationProfiles: readonly IntegrationProfile[] = [
  {
    id: "openclaw",
    name: "OpenClaw",
    logoPath: "/logos/openclaw.svg",
    hostPins: [{ component: "OpenClaw", version: "2026.7.1" }],
    masugateReleaseId: masugateRelease.id,
    masugateVersion: masugateRelease.version,
    maturity: "experimental",
    pathRequirement: "required",
    adapter: {
      packageName: available("@masugate/openclaw"),
      version: available("0.1.1"),
    },
    comparisonId: adoptionComparison.id,
    conceptualBinding:
      "OpenClaw keeps orchestration while declared consequential tool calls cross the MasuGate boundary.",
    governedRoute: {
      scenarioRouteId: "purchase",
      releaseBinding: pendingRouteBinding(),
    },
    replacementBoundary: commonReplacementBoundary,
    hostBinding: {
      trustedPrincipalSource:
        "Deployment-owned OpenClaw agent and credential mapping",
      stableActionIdentitySource:
        "Trusted session, replay, and tool-call context from the gateway or plugin",
      nativeResultWrapper:
        "The governed tool returns the authoritative MasuGate operation result",
    },
    exclusions: [
      "Installing the adapter does not govern unrelated native OpenClaw tools.",
      "Native approval presentation does not replace MasuGate pending state.",
    ],
    deploymentOwnedConfiguration: [
      "Service base URL",
      "Agent-to-credential mapping",
      "Finite governed-route catalog",
      "Provider, execution position, and connector binding",
    ],
    publication: "reference-only",
    evidence: profileEvidence("openclaw"),
    profileHref: available(profileHrefs.openclaw),
    verificationDate: pendingVerificationDate(),
    cleanCheckout: pendingCleanCheckout(),
    conformance: pendingConformance(),
    homepageRole: "primary-demo-story",
  },
  {
    id: "langchain-langgraph",
    name: "LangChain / LangGraph",
    logoPath: "/logos/langchain.svg",
    hostPins: [
      { component: "LangChain", version: "1.3.14" },
      { component: "LangGraph", version: "1.2.9" },
    ],
    masugateReleaseId: masugateRelease.id,
    masugateVersion: masugateRelease.version,
    maturity: "experimental",
    pathRequirement: "optional",
    adapter: {
      packageName: available("masugate-langchain"),
      version: available("0.1.1"),
    },
    comparisonId: adoptionComparison.id,
    conceptualBinding:
      "A configured replacement tool binds graph invocation context to one MasuGate operation.",
    governedRoute: {
      scenarioRouteId: "purchase",
      releaseBinding: pendingRouteBinding(),
    },
    replacementBoundary: commonReplacementBoundary,
    hostBinding: {
      trustedPrincipalSource:
        "Deployment-owned principal binding for the graph tool",
      stableActionIdentitySource:
        "Graph run and source tool-call identity supplied by trusted host code",
      nativeResultWrapper:
        "The canonical operation result is converted into the graph's tool-message form",
    },
    exclusions: [
      "The profile does not intercept arbitrary LangChain or LangGraph tools.",
      "Host-native workflow state is not itself the MasuGate policy-state contract.",
    ],
    deploymentOwnedConfiguration: [
      "Replacement tool registration",
      "Trusted graph-context binding",
      "Host-native result conversion",
    ],
    publication: "reference-only",
    evidence: profileEvidence("langchain-langgraph"),
    profileHref: available(profileHrefs["langchain-langgraph"]),
    verificationDate: pendingVerificationDate(),
    cleanCheckout: pendingCleanCheckout(),
    conformance: pendingConformance(),
    homepageRole: "none",
  },
  {
    id: "microsoft-agent-framework",
    name: "Microsoft Agent Framework",
    logoPath: "/logos/microsoft-agent-framework-icon.png",
    hostPins: [
      { component: "Microsoft Agent Framework Core", version: "1.12.0" },
    ],
    masugateReleaseId: masugateRelease.id,
    masugateVersion: masugateRelease.version,
    maturity: "experimental",
    pathRequirement: "optional",
    adapter: {
      packageName: available("masugate-agent-framework"),
      version: available("0.1.1"),
    },
    comparisonId: adoptionComparison.id,
    conceptualBinding:
      "A typed replacement function returns the authoritative MasuGate result to the agent workflow.",
    governedRoute: {
      scenarioRouteId: "purchase",
      releaseBinding: pendingRouteBinding(),
    },
    replacementBoundary: commonReplacementBoundary,
    hostBinding: {
      trustedPrincipalSource:
        "Deployment-owned identity associated with the typed function",
      stableActionIdentitySource:
        "Trusted function invocation and workflow trace identity",
      nativeResultWrapper:
        "The canonical operation result is returned through the framework's typed function outcome",
    },
    exclusions: [
      "The profile covers configured replacement functions, not every framework capability.",
      "Workflow checkpoints do not replace MasuGate operation and policy-state semantics.",
    ],
    deploymentOwnedConfiguration: [
      "Typed function registration",
      "Trusted invocation-context binding",
      "Framework result conversion",
    ],
    publication: "reference-only",
    evidence: profileEvidence("microsoft-agent-framework"),
    profileHref: available(profileHrefs["microsoft-agent-framework"]),
    verificationDate: pendingVerificationDate(),
    cleanCheckout: pendingCleanCheckout(),
    conformance: pendingConformance(),
    homepageRole: "none",
  },
  {
    id: "crewai",
    name: "CrewAI",
    logoPath: "/logos/crewai.png",
    hostPins: [
      { component: "CrewAI", version: "1.15.6" },
      { component: "CrewAI Core", version: "1.15.6" },
    ],
    masugateReleaseId: masugateRelease.id,
    masugateVersion: masugateRelease.version,
    maturity: "experimental",
    pathRequirement: "optional",
    adapter: {
      packageName: available("masugate-crewai"),
      version: available("0.1.1"),
    },
    comparisonId: adoptionComparison.id,
    conceptualBinding:
      "A governed task tool binds task and tool-call context to one replay-safe MasuGate operation.",
    governedRoute: {
      scenarioRouteId: "purchase",
      releaseBinding: pendingRouteBinding(),
    },
    replacementBoundary: commonReplacementBoundary,
    hostBinding: {
      trustedPrincipalSource:
        "Deployment-owned principal binding for the configured task tool",
      stableActionIdentitySource:
        "Trusted task and tool-call identity used for retry and resume",
      nativeResultWrapper:
        "The crew receives the existing authoritative operation result",
    },
    exclusions: [
      "Crew orchestration and unrelated tools remain CrewAI-owned.",
      "A task retry must not create an unbound second effect.",
    ],
    deploymentOwnedConfiguration: [
      "Governed task-tool registration",
      "Trusted task-context binding",
      "Retry and resume handling",
    ],
    publication: "reference-only",
    evidence: profileEvidence("crewai"),
    profileHref: available(profileHrefs.crewai),
    verificationDate: pendingVerificationDate(),
    cleanCheckout: pendingCleanCheckout(),
    conformance: pendingConformance(),
    homepageRole: "none",
  },
];

export function getIntegrationProfile(
  profileId: IntegrationProfileId,
): IntegrationProfile {
  const profile = integrationProfiles.find(({ id }) => id === profileId);

  if (!profile) {
    throw new Error(`Unknown integration profile: ${profileId}`);
  }

  return profile;
}

export function isPublishableIntegration(
  profile: IntegrationProfile,
): profile is PublishableIntegrationProfile {
  return profile.publication === "publishable";
}

export function selectHomepageIntegrationBridge() {
  const primary = integrationProfiles.find(
    ({ homepageRole }) => homepageRole === "primary-demo-story",
  );
  const verifiedAlternates = integrationProfiles.filter(
    (profile): profile is PublishableIntegrationProfile =>
      isPublishableIntegration(profile) &&
      profile.homepageRole === "verified-selector",
  );

  if (!primary) {
    throw new Error("The approved OpenClaw demo profile is missing.");
  }

  return {
    primary,
    verifiedAlternates,
    showMultiHostSelector: verifiedAlternates.length > 0,
  } as const;
}

export function validateIntegrationProfiles(
  profiles: readonly IntegrationProfile[] = integrationProfiles,
): readonly string[] {
  const errors: string[] = [];
  const profileIds = new Set<IntegrationProfileId>();

  for (const profile of profiles) {
    if (profileIds.has(profile.id)) {
      errors.push(`Duplicate integration profile id: ${profile.id}`);
    }
    profileIds.add(profile.id);

    if (profile.hostPins.length === 0) {
      errors.push(`Integration profile has no exact host pin: ${profile.id}`);
    }

    if (
      profile.publication === "reference-only" &&
      profile.evidence.status !== "reference"
    ) {
      errors.push(`Reference-only profile has non-Reference evidence: ${profile.id}`);
    }

    if (profile.masugateReleaseId !== masugateRelease.id) {
      errors.push(`Integration profile has the wrong release id: ${profile.id}`);
    }
  }

  return errors;
}

export const integrationValidationErrors = validateIntegrationProfiles();
