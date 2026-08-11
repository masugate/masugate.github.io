import {
  type Availability,
  type IsoDate,
  type PolicyArtifactId,
  available,
  isAvailable,
  unavailable,
} from "./contracts";
import {
  adoptionComparison,
  getIntegrationProfile,
  integrationProfiles,
} from "./integrations";
import { getPolicyArtifact, policyArtifacts } from "./policies";
import { masugateRelease, type VersionPin } from "./release";
import { openClawScenario } from "./scenario";

export type SchematicProfileId =
  | "canonical-governance-boundary"
  | "canonical-governed-runtime"
  | "openclaw-governed-route";

export type CanonicalSchematicRole =
  | "governance-boundary"
  | "governed-runtime";

export interface PaperFigureAttribution {
  paperTitle: "Stateful Governance for Concurrent Agentic Systems";
  arxivId: "2608.02764v1";
  paperVersion: "v1";
  figure: "Figure 1" | "Figure 4";
  href:
    | "https://arxiv.org/html/2608.02764v1#S1.F1"
    | "https://arxiv.org/html/2608.02764v1#S4.F4";
  adaptationNote: string;
}

export type SchematicPresentation =
  | Readonly<{
      origin: "adapted";
      label: "Adapted from paper";
    }>
  | Readonly<{
      origin: "simulated";
      label: "Simulated";
    }>
  | Readonly<{
      origin: "recorded";
      label: "Recorded";
    }>;

export type SchematicEvidence =
  | Readonly<{
      status: "reference";
      label: "Reference";
      sourceKind: "paper" | "integration-profile";
      href: Availability<string>;
      note: string;
    }>
  | Readonly<{
      status: "verified";
      label: "Verified";
      sourceKind: "integration-profile";
      href: Availability<string>;
      note: string;
    }>;

export interface SchematicProfileBase {
  id: SchematicProfileId;
  title: string;
  sourceFigures: readonly PaperFigureAttribution[];
  fixedMasuGateArtifacts: readonly string[];
  textEquivalent: string;
  presentation: SchematicPresentation;
  evidence: SchematicEvidence;
  reviewedAt: IsoDate;
  reviewTriggers: readonly string[];
}

export interface CanonicalSchematicProfile extends SchematicProfileBase {
  kind: "canonical";
  role: CanonicalSchematicRole;
  hostBinding: null;
  scenarioBinding: null;
  releaseBinding: null;
}

export interface InstantiatedSchematicProfile extends SchematicProfileBase {
  kind: "instantiated";
  role: "framework-runtime";
  baseProfileId: "canonical-governed-runtime";
  integrationProfileId: "openclaw";
  scenarioBinding: Readonly<{
    scenarioId: typeof openClawScenario.id;
    stageId: "stage-2";
    sequenceId: "stage-2-approved";
    requestId: typeof adoptionComparison.requestId;
    governedRouteId: typeof adoptionComparison.governedRouteId;
    policyArtifactIds: readonly PolicyArtifactId[];
    expectedResult: typeof adoptionComparison.expectedResult;
  }>;
  releaseBinding: Readonly<{
    releaseId: typeof masugateRelease.id;
    version: typeof masugateRelease.version;
    state: typeof masugateRelease.state;
  }>;
  hostBinding: Readonly<{
    name: string;
    hostPins: readonly VersionPin[];
    adapter: ReturnType<typeof getIntegrationProfile>["adapter"];
    trustedPrincipalSource: string;
    stableActionIdentitySource: string;
    nativeResultWrapper: string;
    replacementBoundary: string;
  }>;
  providerBinding: Readonly<{
    scenarioId: typeof adoptionComparison.providerContract.scenarioId;
    releaseBinding: typeof adoptionComparison.providerContract.releaseBinding;
    certifiedViews: readonly string[];
    logicalScopes: readonly string[];
    effectBoundary: string;
  }>;
  comparisonFixedArtifacts: typeof adoptionComparison.unchangedArtifacts;
  canonicalRecordFields: typeof adoptionComparison.canonicalRecordFields;
  exclusions: readonly string[];
}

export type SchematicProfile =
  | CanonicalSchematicProfile
  | InstantiatedSchematicProfile;

const paperFigureOne = {
  paperTitle: "Stateful Governance for Concurrent Agentic Systems",
  arxivId: "2608.02764v1",
  paperVersion: "v1",
  figure: "Figure 1",
  href: "https://arxiv.org/html/2608.02764v1#S1.F1",
  adaptationNote:
    "Redrawn as a responsive website-native comparison of request-local and stateful governance boundaries.",
} as const satisfies PaperFigureAttribution;

const paperFigureFour = {
  paperTitle: "Stateful Governance for Concurrent Agentic Systems",
  arxivId: "2608.02764v1",
  paperVersion: "v1",
  figure: "Figure 4",
  href: "https://arxiv.org/html/2608.02764v1#S4.F4",
  adaptationNote:
    "Redrawn as a responsive website-native governed-action runtime path with the host and provider boundaries preserved.",
} as const satisfies PaperFigureAttribution;

const fixedMasuGateArtifacts = [
  "Selected governed request and route",
  "Reviewable policy and exact revision",
  "Provider contract, certified views, and logical scopes",
  "Scoped coordination connected to the provider-owned effect",
  "Canonical outcome and governance-record fields",
] as const;

const releaseReviewTriggers = [
  "A framework or provider example becomes demonstrable",
  "An adapter interface or outcome contract changes",
  "The paper or selected release revision changes",
  "Presentation or evidence status changes",
] as const;

function paperEvidence(
  source: PaperFigureAttribution,
): SchematicEvidence {
  return {
    status: "reference",
    label: "Reference",
    sourceKind: "paper",
    href: available(source.href),
    note: `${source.figure} in paper ${source.arxivId} supports the canonical model; the website redraw is not framework-integration evidence.`,
  };
}

function integrationEvidence(
  profile: ReturnType<typeof getIntegrationProfile>,
): SchematicEvidence {
  if (profile.evidence.status === "verified") {
    return {
      status: "verified",
      label: "Verified",
      sourceKind: "integration-profile",
      href: available(profile.evidence.href),
      note: `Verified by ${profile.evidence.gate} at ${profile.evidence.immutableRevision}.`,
    };
  }

  return {
    status: "reference",
    label: "Reference",
    sourceKind: "integration-profile",
    href: unavailable(
      "public-evidence-unavailable",
      "No public exact-profile evidence destination is available yet.",
    ),
    note: profile.evidence.note,
  };
}

const openClawIntegration = getIntegrationProfile("openclaw");
const sharedBudgetPolicy = getPolicyArtifact("categorized-purchase-v2");

export const schematicProfiles = [
  {
    id: "canonical-governance-boundary",
    kind: "canonical",
    role: "governance-boundary",
    title: "Request-local and stateful governance boundaries",
    sourceFigures: [paperFigureOne],
    fixedMasuGateArtifacts,
    textEquivalent:
      "A request-local check can decide from one state observation and end before the effect, allowing the decision to become stale. In the stateful MasuGate path, the selected request, policy-relevant state, scoped coordination, provider-owned effect, and governance record remain connected while the surrounding agent host stays outside the boundary.",
    presentation: {
      origin: "adapted",
      label: "Adapted from paper",
    },
    evidence: paperEvidence(paperFigureOne),
    hostBinding: null,
    scenarioBinding: null,
    releaseBinding: null,
    reviewedAt: "2026-08-07",
    reviewTriggers: releaseReviewTriggers,
  },
  {
    id: "canonical-governed-runtime",
    kind: "canonical",
    role: "governed-runtime",
    title: "Canonical governed-action runtime path",
    sourceFigures: [paperFigureFour],
    fixedMasuGateArtifacts,
    textEquivalent:
      "A selected consequential request enters a governed route. MasuGate binds trusted context, evaluates a reviewable policy over certified provider views, coordinates overlapping logical scopes, dispatches the provider-owned effect, and retains the authoritative committed, denied, or pending outcome with its governance record.",
    presentation: {
      origin: "adapted",
      label: "Adapted from paper",
    },
    evidence: paperEvidence(paperFigureFour),
    hostBinding: null,
    scenarioBinding: null,
    releaseBinding: null,
    reviewedAt: "2026-08-07",
    reviewTriggers: releaseReviewTriggers,
  },
  {
    id: "openclaw-governed-route",
    kind: "instantiated",
    role: "framework-runtime",
    title: "OpenClaw shared-budget governed runtime",
    baseProfileId: "canonical-governed-runtime",
    sourceFigures: [paperFigureFour],
    fixedMasuGateArtifacts,
    textEquivalent:
      "OpenClaw continues to orchestrate the Travel Planner and Work Manager. Their declared purchase tool sends the shared-budget request through the selected MasuGate route. MasuGate applies categorized-purchase version 2 to certified budget state, coordinates the owner-and-category scope, returns the authoritative operation result, and retains the canonical record. Unrelated OpenClaw tools remain outside this boundary.",
    presentation: {
      origin: "simulated",
      label: "Simulated",
    },
    evidence: integrationEvidence(openClawIntegration),
    integrationProfileId: "openclaw",
    scenarioBinding: {
      scenarioId: openClawScenario.id,
      stageId: "stage-2",
      sequenceId: "stage-2-approved",
      requestId: adoptionComparison.requestId,
      governedRouteId: adoptionComparison.governedRouteId,
      policyArtifactIds: [sharedBudgetPolicy.id],
      expectedResult: adoptionComparison.expectedResult,
    },
    releaseBinding: {
      releaseId: masugateRelease.id,
      version: masugateRelease.version,
      state: masugateRelease.state,
    },
    hostBinding: {
      name: openClawIntegration.name,
      hostPins: openClawIntegration.hostPins,
      adapter: openClawIntegration.adapter,
      trustedPrincipalSource:
        openClawIntegration.hostBinding.trustedPrincipalSource,
      stableActionIdentitySource:
        openClawIntegration.hostBinding.stableActionIdentitySource,
      nativeResultWrapper:
        openClawIntegration.hostBinding.nativeResultWrapper,
      replacementBoundary: openClawIntegration.replacementBoundary,
    },
    providerBinding: {
      scenarioId: adoptionComparison.providerContract.scenarioId,
      releaseBinding: adoptionComparison.providerContract.releaseBinding,
      certifiedViews: sharedBudgetPolicy.dependencies.map(
        ({ referenceView }) => referenceView,
      ),
      logicalScopes: sharedBudgetPolicy.dependencies.map(
        ({ logicalScope }) => logicalScope,
      ),
      effectBoundary:
        "The configured business-budget provider owns the governed purchase effect and returns its result to the same operation.",
    },
    comparisonFixedArtifacts: adoptionComparison.unchangedArtifacts,
    canonicalRecordFields: adoptionComparison.canonicalRecordFields,
    exclusions: openClawIntegration.exclusions,
    reviewedAt: "2026-08-07",
    reviewTriggers: releaseReviewTriggers,
  },
] as const satisfies readonly SchematicProfile[];

export function getSchematicProfile(
  profileId: SchematicProfileId,
): SchematicProfile {
  const profile = schematicProfiles.find(({ id }) => id === profileId);

  if (!profile) {
    throw new Error(`Unknown schematic profile: ${profileId}`);
  }

  return profile;
}

export function selectHomepageSchematicProfiles() {
  return {
    governanceBoundary: getSchematicProfile(
      "canonical-governance-boundary",
    ),
    governedRuntime: getSchematicProfile("canonical-governed-runtime"),
    openClawRuntime: getSchematicProfile("openclaw-governed-route"),
  } as const;
}

function sameOrderedValues(
  left: readonly string[],
  right: readonly string[],
): boolean {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

export function validateSchematicProfiles(
  profiles: readonly SchematicProfile[] = schematicProfiles,
): readonly string[] {
  const errors: string[] = [];
  const knownProfileIds = new Set(profiles.map(({ id }) => id));
  const seenProfileIds = new Set<SchematicProfileId>();
  const integrationIds = new Set(integrationProfiles.map(({ id }) => id));
  const policyIds = new Set(policyArtifacts.map(({ id }) => id));

  for (const profile of profiles) {
    if (seenProfileIds.has(profile.id)) {
      errors.push(`Duplicate schematic profile id: ${profile.id}`);
    }
    seenProfileIds.add(profile.id);

    if (profile.textEquivalent.trim().length === 0) {
      errors.push(`Schematic profile has no text equivalent: ${profile.id}`);
    }

    if (profile.sourceFigures.length === 0) {
      errors.push(`Schematic profile has no paper attribution: ${profile.id}`);
    }

    const expectedPresentationLabels: Record<
      SchematicPresentation["origin"],
      string
    > = {
      adapted: "Adapted from paper",
      simulated: "Simulated",
      recorded: "Recorded",
    };
    const expectedEvidenceLabels: Record<SchematicEvidence["status"], string> = {
      reference: "Reference",
      verified: "Verified",
    };

    if (
      profile.presentation.label !==
      expectedPresentationLabels[profile.presentation.origin]
    ) {
      errors.push(`Schematic presentation label mismatch: ${profile.id}`);
    }

    if (profile.evidence.label !== expectedEvidenceLabels[profile.evidence.status]) {
      errors.push(`Schematic evidence label mismatch: ${profile.id}`);
    }

    if (profile.evidence.status === "verified" && !isAvailable(profile.evidence.href)) {
      errors.push(`Verified schematic has no evidence link: ${profile.id}`);
    }

    for (const source of profile.sourceFigures) {
      if (
        source.arxivId !== "2608.02764v1" ||
        source.paperVersion !== "v1"
      ) {
        errors.push(`Schematic profile is not pinned to paper v1: ${profile.id}`);
      }

      if (!source.href.includes("2608.02764v1#")) {
        errors.push(`Schematic profile has an imprecise figure URL: ${profile.id}`);
      }
    }

    if (profile.kind === "canonical") {
      if (
        profile.presentation.origin !== "adapted" ||
        profile.evidence.sourceKind !== "paper" ||
        profile.evidence.status !== "reference"
      ) {
        errors.push(
          `Canonical schematic must remain an attributed Reference adaptation: ${profile.id}`,
        );
      }
      continue;
    }

    if (!knownProfileIds.has(profile.baseProfileId)) {
      errors.push(
        `Instantiated schematic references a missing base profile: ${profile.id}`,
      );
    }

    if (!integrationIds.has(profile.integrationProfileId)) {
      errors.push(
        `Instantiated schematic references a missing integration profile: ${profile.id}`,
      );
    }

    for (const policyId of profile.scenarioBinding.policyArtifactIds) {
      if (!policyIds.has(policyId)) {
        errors.push(
          `Instantiated schematic references a missing policy artifact: ${profile.id}:${policyId}`,
        );
      }
    }

    if (profile.scenarioBinding.scenarioId !== openClawScenario.id) {
      errors.push(`OpenClaw schematic has the wrong scenario: ${profile.id}`);
    }

    if (profile.releaseBinding.releaseId !== masugateRelease.id) {
      errors.push(`Schematic profile has the wrong release id: ${profile.id}`);
    }

    if (profile.evidence.status !== openClawIntegration.evidence.status) {
      errors.push(
        `Schematic evidence disagrees with its integration profile: ${profile.id}`,
      );
    }

    if (
      openClawIntegration.publication === "reference-only" &&
      (profile.presentation.origin !== "simulated" ||
        profile.evidence.status !== "reference")
    ) {
      errors.push(
        `Reference-only OpenClaw schematic must be Simulated and Reference: ${profile.id}`,
      );
    }

    if (
      !sameOrderedValues(
        profile.comparisonFixedArtifacts,
        adoptionComparison.unchangedArtifacts,
      )
    ) {
      errors.push(
        `Schematic changed the fixed adoption-comparison artifacts: ${profile.id}`,
      );
    }

    if (
      !sameOrderedValues(
        profile.canonicalRecordFields,
        adoptionComparison.canonicalRecordFields,
      )
    ) {
      errors.push(
        `Schematic changed the canonical record fields: ${profile.id}`,
      );
    }
  }

  return errors;
}

export const schematicValidationErrors = validateSchematicProfiles();
