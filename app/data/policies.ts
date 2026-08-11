import {
  type Availability,
  type Evidence,
  type PolicyArtifactId,
  type PolicyDecision,
  type PresentationOrigin,
  type ReferenceEvidence,
  unavailable,
} from "./contracts";

export type PolicyScenarioRevision =
  | "categorized-purchase@v1"
  | "categorized-purchase@v2"
  | "governed-calendar@v1"
  | "governed-workspace@v1";

export interface PolicyArtifact {
  id: PolicyArtifactId;
  policyId:
    | "categorized-purchase"
    | "governed-calendar"
    | "governed-workspace";
  ownerId: "operations-policy-owner";
  scenarioRevision: PolicyScenarioRevision;
  releaseRevision: Availability<
    Readonly<{
      releaseId: string;
      immutablePolicyId: string;
      semanticDigest: string;
    }>
  >;
  source:
    | Readonly<{
        form: "full";
        languageLabel: "MasuGate policy";
        body: string;
      }>
    | Readonly<{
        form: "diff";
        languageLabel: "MasuGate policy diff";
        baseArtifactId: PolicyArtifactId;
        body: string;
      }>;
  dependencies: readonly Readonly<{
    conceptualName: string;
    referenceView: string;
    access: "read" | "read-write";
    logicalScope: string;
    releaseBinding: Availability<string>;
  }>[];
  validation: Readonly<{
    result: "passed" | "failed" | "not-run";
    origin: "authored-scenario-check" | "release-validator";
    displayLabel: string;
    evidence: Evidence;
  }>;
  tests: Readonly<{
    origin: "authored-scenario-cases" | "release-test-suite";
    cases: readonly Readonly<{
      id: string;
      label: string;
      expectedDecision: PolicyDecision;
    }>[];
    evidence: Evidence;
  }>;
  review: Readonly<{
    status: "draft" | "reviewed" | "published";
    scope: "scenario-reference" | "release";
  }>;
  provenance: Readonly<{
    presentationOrigin: PresentationOrigin;
    evidence: Evidence;
    transformationNote?: string;
  }>;
}

function referenceEvidence(locator: string, note: string): ReferenceEvidence {
  return {
    status: "reference",
    sourceKind: "authored-fixture",
    locator,
    note,
  };
}

function pendingReleaseRevision(): ReturnType<typeof unavailable> {
  return unavailable(
    "release-binding-unconfirmed",
    "The immutable release policy identifier and semantic digest remain release-gated.",
  );
}

function pendingViewBinding(): ReturnType<typeof unavailable> {
  return unavailable(
    "release-binding-unconfirmed",
    "The exact provider-view identifier must come from the selected public release.",
  );
}

const categorizedPurchaseV1Evidence = referenceEvidence(
  "approved-scenario:categorized-purchase-v1",
  "Illustrative policy source and authored decision cases; release alignment remains pending.",
);

const categorizedPurchaseV2Evidence = referenceEvidence(
  "approved-scenario:categorized-purchase-v2",
  "Illustrative shared-state dependency diff; release alignment remains pending.",
);

const governedCalendarEvidence = referenceEvidence(
  "approved-scenario:governed-calendar-v1",
  "Illustrative calendar policy source; release alignment remains pending.",
);

const governedWorkspaceEvidence = referenceEvidence(
  "approved-scenario:governed-workspace-v1",
  "Illustrative workspace policy source; release alignment remains pending.",
);

export const policyArtifacts = [
  {
    id: "categorized-purchase-v1",
    policyId: "categorized-purchase",
    ownerId: "operations-policy-owner",
    scenarioRevision: "categorized-purchase@v1",
    releaseRevision: pendingReleaseRevision(),
    source: {
      form: "full",
      languageLabel: "MasuGate policy",
      body: `policy categorized_purchase on purchase {
  deny missing_business_purpose when
    args.category == "business" and args.purpose == "";

  deny category_budget_exceeded when
    budget.spent(principal.agent_id, args.category, 30 d) + args.amount_cents
      > budget.limit(principal.agent_id, args.category);

  escalate procurement_review when
    args.category == "business" and args.amount_cents >= 5000;

  allow otherwise;
}`,
    },
    dependencies: [
      {
        conceptualName: "Category spend",
        referenceView: "budget.spent",
        access: "read",
        logicalScope: "agent-and-category",
        releaseBinding: pendingViewBinding(),
      },
      {
        conceptualName: "Category limit",
        referenceView: "budget.limit",
        access: "read",
        logicalScope: "agent-and-category",
        releaseBinding: pendingViewBinding(),
      },
    ],
    validation: {
      result: "passed",
      origin: "authored-scenario-check",
      displayLabel: "Reference scenario check",
      evidence: categorizedPurchaseV1Evidence,
    },
    tests: {
      origin: "authored-scenario-cases",
      cases: [
        {
          id: "below-budget",
          label: "Below budget and review threshold",
          expectedDecision: "allow",
        },
        {
          id: "over-budget",
          label: "Category budget exceeded",
          expectedDecision: "deny",
        },
        {
          id: "missing-purpose",
          label: "Business purpose missing",
          expectedDecision: "deny",
        },
        {
          id: "review-threshold",
          label: "Business purchase meets the review threshold",
          expectedDecision: "escalate",
        },
      ],
      evidence: categorizedPurchaseV1Evidence,
    },
    review: {
      status: "reviewed",
      scope: "scenario-reference",
    },
    provenance: {
      presentationOrigin: "simulated",
      evidence: categorizedPurchaseV1Evidence,
      transformationNote:
        "The website may annotate this reference shape but must preserve its Reference label.",
    },
  },
  {
    id: "categorized-purchase-v2",
    policyId: "categorized-purchase",
    ownerId: "operations-policy-owner",
    scenarioRevision: "categorized-purchase@v2",
    releaseRevision: pendingReleaseRevision(),
    source: {
      form: "diff",
      languageLabel: "MasuGate policy diff",
      baseArtifactId: "categorized-purchase-v1",
      body: `- budget.spent(principal.agent_id, args.category, 30 d)
-   + args.amount_cents > budget.limit(principal.agent_id, args.category)
+ budget.available(owner.id, args.category, 30 d)
+   < args.amount_cents`,
    },
    dependencies: [
      {
        conceptualName: "Available shared capacity, including protected pending work",
        referenceView: "budget.available",
        access: "read",
        logicalScope: "owner-and-category",
        releaseBinding: pendingViewBinding(),
      },
    ],
    validation: {
      result: "passed",
      origin: "authored-scenario-check",
      displayLabel: "Reference scenario check",
      evidence: categorizedPurchaseV2Evidence,
    },
    tests: {
      origin: "authored-scenario-cases",
      cases: [
        {
          id: "shared-capacity-available",
          label: "Request fits current shared capacity",
          expectedDecision: "escalate",
        },
        {
          id: "pending-capacity-counted",
          label: "Protected pending capacity leaves too little for the next request",
          expectedDecision: "deny",
        },
        {
          id: "missing-purpose",
          label: "Business purpose missing",
          expectedDecision: "deny",
        },
      ],
      evidence: categorizedPurchaseV2Evidence,
    },
    review: {
      status: "reviewed",
      scope: "scenario-reference",
    },
    provenance: {
      presentationOrigin: "simulated",
      evidence: categorizedPurchaseV2Evidence,
      transformationNote:
        "This focused scenario diff is not an immutable release artifact.",
    },
  },
  {
    id: "governed-calendar-v1",
    policyId: "governed-calendar",
    ownerId: "operations-policy-owner",
    scenarioRevision: "governed-calendar@v1",
    releaseRevision: pendingReleaseRevision(),
    source: {
      form: "full",
      languageLabel: "MasuGate policy",
      body: `policy governed_calendar on calendar.create {
  deny protected_work_overlap when
    calendar.overlaps(owner.id, args.start, args.end, "protected-work");

  allow otherwise;
}`,
    },
    dependencies: [
      {
        conceptualName: "Protected calendar overlap",
        referenceView: "calendar.overlaps",
        access: "read",
        logicalScope: "owner-and-calendar-window",
        releaseBinding: pendingViewBinding(),
      },
    ],
    validation: {
      result: "passed",
      origin: "authored-scenario-check",
      displayLabel: "Reference scenario check",
      evidence: governedCalendarEvidence,
    },
    tests: {
      origin: "authored-scenario-cases",
      cases: [
        {
          id: "protected-overlap",
          label: "Travel block overlaps protected work",
          expectedDecision: "deny",
        },
        {
          id: "non-conflicting-alternative",
          label: "Travel block begins after protected work",
          expectedDecision: "allow",
        },
      ],
      evidence: governedCalendarEvidence,
    },
    review: {
      status: "reviewed",
      scope: "scenario-reference",
    },
    provenance: {
      presentationOrigin: "simulated",
      evidence: governedCalendarEvidence,
    },
  },
  {
    id: "governed-workspace-v1",
    policyId: "governed-workspace",
    ownerId: "operations-policy-owner",
    scenarioRevision: "governed-workspace@v1",
    releaseRevision: pendingReleaseRevision(),
    source: {
      form: "full",
      languageLabel: "MasuGate policy",
      body: `policy governed_workspace on file.change {
  deny outside_agent_workspace when
    not workspace.path_allowed(principal.role, args.path);

  escalate replace_protected_file when
    args.operation in ["replace", "delete"]
    and workspace.is_protected(args.path);

  allow otherwise;
}`,
    },
    dependencies: [
      {
        conceptualName: "Agent workspace boundary",
        referenceView: "workspace.path_allowed",
        access: "read",
        logicalScope: "owner-agent-and-path",
        releaseBinding: pendingViewBinding(),
      },
      {
        conceptualName: "Protected path status",
        referenceView: "workspace.is_protected",
        access: "read",
        logicalScope: "owner-and-path",
        releaseBinding: pendingViewBinding(),
      },
    ],
    validation: {
      result: "passed",
      origin: "authored-scenario-check",
      displayLabel: "Reference scenario check",
      evidence: governedWorkspaceEvidence,
    },
    tests: {
      origin: "authored-scenario-cases",
      cases: [
        {
          id: "create-in-agent-workspace",
          label: "Create an itinerary in the declared travel workspace",
          expectedDecision: "allow",
        },
        {
          id: "replace-outside-agent-workspace",
          label: "Travel Planner replaces a protected work file",
          expectedDecision: "deny",
        },
      ],
      evidence: governedWorkspaceEvidence,
    },
    review: {
      status: "reviewed",
      scope: "scenario-reference",
    },
    provenance: {
      presentationOrigin: "simulated",
      evidence: governedWorkspaceEvidence,
    },
  },
] as const satisfies readonly PolicyArtifact[];

export function getPolicyArtifact(
  artifactId: PolicyArtifactId,
): PolicyArtifact {
  const artifact = policyArtifacts.find(({ id }) => id === artifactId);

  if (!artifact) {
    throw new Error(`Unknown policy artifact: ${artifactId}`);
  }

  return artifact;
}

export function validatePolicyArtifacts(
  artifacts: readonly PolicyArtifact[] = policyArtifacts,
): readonly string[] {
  const errors: string[] = [];
  const artifactIds = new Set<PolicyArtifactId>();

  for (const artifact of artifacts) {
    if (artifactIds.has(artifact.id)) {
      errors.push(`Duplicate policy artifact id: ${artifact.id}`);
    }
    artifactIds.add(artifact.id);

    if (
      artifact.validation.origin === "authored-scenario-check" &&
      artifact.validation.evidence.status !== "reference"
    ) {
      errors.push(
        `Authored scenario validation must remain Reference: ${artifact.id}`,
      );
    }

    if (
      artifact.tests.origin === "authored-scenario-cases" &&
      artifact.tests.evidence.status !== "reference"
    ) {
      errors.push(`Authored scenario tests must remain Reference: ${artifact.id}`);
    }

    const source = artifact.source;
    if (
      source.form === "diff" &&
      !artifacts.some(({ id }) => id === source.baseArtifactId)
    ) {
      errors.push(
        `Policy diff ${artifact.id} references missing base ${source.baseArtifactId}`,
      );
    }
  }

  return errors;
}

export const policyValidationErrors = validatePolicyArtifacts();
