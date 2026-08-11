import {
  available,
  type Availability,
  type Evidence,
  type IsoDate,
  type PolicyArtifactId,
  type PresentationOrigin,
  type ScenarioStageId,
  unavailable,
} from "./contracts";
import {
  demoChoicePoints,
  demoTransitionPoints,
} from "./demoTopology.mjs";
import { getIntegrationProfile } from "./integrations";
import { getPolicyArtifact, type PolicyArtifact } from "./policies";
import {
  isPublishedRelease,
  masugateRelease,
  type ReleaseContract,
} from "./release";
import {
  openClawScenario,
  selectScenarioSequence,
  type ScenarioEvent,
  type ScenarioRequest,
  type ScenarioRouteId,
} from "./scenario";

export type DemoArtifactKind =
  | "policy"
  | "configuration"
  | "runtime-trace"
  | "decision-record";

export interface DemoArtifact {
  id: string;
  stageId: ScenarioStageId;
  kind: DemoArtifactKind;
  label: string;
  policyArtifactId?: PolicyArtifactId;
  release: Readonly<{
    releaseId: string;
    immutableRevision: Availability<string>;
  }>;
  source: Availability<
    Readonly<{
      sourceKind: "authored-fixture";
      locator: string;
    }>
  >;
  presentationOrigin: PresentationOrigin;
  evidence: Evidence;
  verification: Availability<
    Readonly<{
      gate: string;
      verifiedAt: IsoDate;
    }>
  >;
  integrationProfile: Readonly<{
    id: "openclaw";
    publication: "reference-only" | "publishable";
    hostPins: readonly Readonly<{ component: string; version: string }>[];
    masugateReleaseId: string;
    evidence: Evidence;
  }>;
  transformationNote: string;
}

export interface DemoOperationDefinition {
  operationId: string;
  stageId: ScenarioStageId;
  agentId: "openclaw:travel-planner" | "openclaw:work-manager";
  actionLabel: string;
  routeId: ScenarioRouteId;
  requestId: string;
  arguments: readonly Readonly<{ label: string; value: string }>[];
  policyArtifactId: PolicyArtifactId;
  relevantRule: string;
  stateReads: readonly string[];
  relatedScenarioIds: readonly string[];
}

function referenceEvidence(locator: string, note: string): Evidence {
  return {
    status: "reference",
    sourceKind: "authored-fixture",
    locator,
    note,
  };
}

function pendingImmutableRevision(): Availability<string> {
  return unavailable(
    "release-binding-unconfirmed",
    "The immutable public-release revision remains release-gated.",
  );
}

function pendingVerification(): DemoArtifact["verification"] {
  return unavailable(
    "verification-pending",
    "No public release gate and verification date are available for this artifact.",
  );
}

const demoOpenClawProfile = getIntegrationProfile("openclaw");

function artifact(
  stageId: ScenarioStageId,
  kind: DemoArtifactKind,
  label: string,
  locator: string,
  transformationNote: string,
  policyArtifactId?: PolicyArtifactId,
): DemoArtifact {
  return {
    id: `${stageId}-${kind}${policyArtifactId ? `-${policyArtifactId}` : ""}`,
    stageId,
    kind,
    label,
    policyArtifactId,
    release: {
      releaseId: masugateRelease.id,
      immutableRevision: pendingImmutableRevision(),
    },
    source: available({
      sourceKind: "authored-fixture",
      locator,
    }),
    presentationOrigin: "simulated",
    evidence: referenceEvidence(
      locator,
      "Authored deterministic scenario material; public-release alignment remains pending.",
    ),
    verification: pendingVerification(),
    integrationProfile: {
      id: "openclaw",
      publication: demoOpenClawProfile.publication,
      hostPins: demoOpenClawProfile.hostPins,
      masugateReleaseId: demoOpenClawProfile.masugateReleaseId,
      evidence: demoOpenClawProfile.evidence,
    },
    transformationNote,
  };
}

export const demoArtifacts = [
  artifact(
    "stage-1",
    "policy",
    "Initial purchase policy",
    "approved-scenario:categorized-purchase-v1",
    "The full authored scenario policy is displayed as a Reference shape.",
    "categorized-purchase-v1",
  ),
  artifact(
    "stage-1",
    "configuration",
    "OpenClaw purchase-route reference shape",
    "candidate-integration-profile:openclaw",
    "Configuration is projected into human-readable ownership and binding facts; exact keys are omitted.",
  ),
  artifact(
    "stage-1",
    "runtime-trace",
    "Single governed-purchase trace",
    "scenario-sequence:stage-1-governed",
    "The ordered authored events are rendered in plain language; no protocol fields are inferred.",
  ),
  artifact(
    "stage-1",
    "decision-record",
    "Committed purchase record projection",
    "scenario-record:scenario-op-stage-1-purchase",
    "A human-readable projection is built only from the selected scenario event.",
  ),
  artifact(
    "stage-2",
    "policy",
    "Shared-budget policy diff",
    "approved-scenario:categorized-purchase-v2",
    "The focused authored diff is displayed as a Reference shape, not an immutable release artifact.",
    "categorized-purchase-v2",
  ),
  artifact(
    "stage-2",
    "configuration",
    "OpenClaw shared-agent reference shape",
    "candidate-integration-profile:openclaw",
    "The added agent mapping and unchanged purchase boundary are shown without invented config keys.",
  ),
  artifact(
    "stage-2",
    "runtime-trace",
    "Concurrent shared-budget trace",
    "scenario-sequence:stage-2-approved-or-declined",
    "The selected deterministic review branch controls the ordered trace.",
  ),
  artifact(
    "stage-2",
    "decision-record",
    "Separate travel and work record projections",
    "scenario-record:stage-2-shared-budget",
    "Committed and denied operation histories remain separate.",
  ),
  artifact(
    "stage-3",
    "policy",
    "Calendar policy addition",
    "approved-scenario:governed-calendar-v1",
    "The authored calendar policy is shown beside an unchanged purchase-policy marker.",
    "governed-calendar-v1",
  ),
  artifact(
    "stage-3",
    "policy",
    "Workspace policy addition",
    "approved-scenario:governed-workspace-v1",
    "The authored workspace policy is shown beside an unchanged purchase-policy marker.",
    "governed-workspace-v1",
  ),
  artifact(
    "stage-3",
    "configuration",
    "OpenClaw calendar and workspace reference shape",
    "candidate-integration-profile:openclaw-stage-3",
    "The new finite routes and provider-owned effects are shown without release-specific keys.",
  ),
  artifact(
    "stage-3",
    "runtime-trace",
    "Separate calendar and workspace traces",
    "scenario-sequence:stage-3-default-and-probe",
    "Calendar and workspace operations are displayed separately and never as one transaction.",
  ),
  artifact(
    "stage-3",
    "decision-record",
    "Separate calendar and workspace record projections",
    "scenario-record:stage-3-operations",
    "Only committed effects receive an effect result; denied operations remain receipt-free.",
  ),
] as const satisfies readonly DemoArtifact[];

export const demoOperationDefinitions = [
  {
    operationId: "scenario-op-stage-1-purchase",
    stageId: "stage-1",
    agentId: "openclaw:work-manager",
    actionLabel: "Purchase the project-planning subscription",
    routeId: "purchase",
    requestId: "stage-1-project-planning-subscription",
    arguments: [
      { label: "Category", value: "Business" },
      { label: "Amount", value: "$40" },
      { label: "Purpose", value: "Project planning" },
    ],
    policyArtifactId: "categorized-purchase-v1",
    relevantRule: "category capacity and otherwise allow",
    stateReads: ["budget.spent", "budget.limit"],
    relatedScenarioIds: ["openclaw-personal-operations"],
  },
  {
    operationId: "scenario-op-stage-2-travel",
    stageId: "stage-2",
    agentId: "openclaw:travel-planner",
    actionLabel: "Purchase the refundable hotel deposit",
    routeId: "purchase",
    requestId: "stage-2-travel-hotel-deposit",
    arguments: [
      { label: "Category", value: "Business" },
      { label: "Amount", value: "$60" },
      { label: "Purpose", value: "Refundable hotel deposit for a work trip" },
    ],
    policyArtifactId: "categorized-purchase-v2",
    relevantRule: "procurement_review",
    stateReads: ["budget.available"],
    relatedScenarioIds: ["openclaw-personal-operations", "demo-owner"],
  },
  {
    operationId: "scenario-op-stage-2-work",
    stageId: "stage-2",
    agentId: "openclaw:work-manager",
    actionLabel: "Purchase hosted testing capacity",
    routeId: "purchase",
    requestId: "stage-2-hosted-testing-capacity",
    arguments: [
      { label: "Category", value: "Business" },
      { label: "Amount", value: "$60" },
      { label: "Purpose", value: "Hosted testing capacity" },
    ],
    policyArtifactId: "categorized-purchase-v2",
    relevantRule: "category_budget_exceeded",
    stateReads: ["budget.available"],
    relatedScenarioIds: ["openclaw-personal-operations", "demo-owner"],
  },
  {
    operationId: "scenario-op-stage-3-calendar-conflict",
    stageId: "stage-3",
    agentId: "openclaw:travel-planner",
    actionLabel: "Create the conflicting travel block",
    routeId: "calendar-create",
    requestId: "stage-3-travel-block-conflict",
    arguments: [
      { label: "Date", value: "2026-09-15" },
      { label: "Start", value: "14:30" },
      { label: "End", value: "16:00" },
      { label: "Timezone", value: "America/New_York" },
      { label: "UTC offset", value: "-04:00" },
      { label: "Start timestamp", value: "2026-09-15T14:30:00-04:00" },
      { label: "End timestamp", value: "2026-09-15T16:00:00-04:00" },
    ],
    policyArtifactId: "governed-calendar-v1",
    relevantRule: "protected_work_overlap",
    stateReads: ["calendar.overlaps"],
    relatedScenarioIds: ["openclaw-personal-operations", "trip-104"],
  },
  {
    operationId: "scenario-op-stage-3-calendar-alternative",
    stageId: "stage-3",
    agentId: "openclaw:travel-planner",
    actionLabel: "Create the non-conflicting travel block",
    routeId: "calendar-create",
    requestId: "stage-3-travel-block-alternative",
    arguments: [
      { label: "Date", value: "2026-09-15" },
      { label: "Start", value: "15:15" },
      { label: "End", value: "16:45" },
      { label: "Timezone", value: "America/New_York" },
      { label: "UTC offset", value: "-04:00" },
      { label: "Start timestamp", value: "2026-09-15T15:15:00-04:00" },
      { label: "End timestamp", value: "2026-09-15T16:45:00-04:00" },
    ],
    policyArtifactId: "governed-calendar-v1",
    relevantRule: "otherwise allow",
    stateReads: ["calendar.overlaps"],
    relatedScenarioIds: ["openclaw-personal-operations", "trip-104"],
  },
  {
    operationId: "scenario-op-stage-3-itinerary",
    stageId: "stage-3",
    agentId: "openclaw:travel-planner",
    actionLabel: "Create the trip itinerary",
    routeId: "file-change",
    requestId: "stage-3-create-itinerary",
    arguments: [
      { label: "Operation", value: "Create" },
      { label: "Path", value: "/shared/travel/trip-104/itinerary.md" },
    ],
    policyArtifactId: "governed-workspace-v1",
    relevantRule: "workspace boundary and otherwise allow",
    stateReads: ["workspace.path_allowed", "workspace.is_protected"],
    relatedScenarioIds: ["openclaw-personal-operations", "trip-104"],
  },
  {
    operationId: "scenario-op-stage-3-protected-brief",
    stageId: "stage-3",
    agentId: "openclaw:travel-planner",
    actionLabel: "Replace the protected project brief",
    routeId: "file-change",
    requestId: "stage-3-replace-protected-brief",
    arguments: [
      { label: "Operation", value: "Replace" },
      { label: "Path", value: "/shared/work/launch-review/brief.md" },
    ],
    policyArtifactId: "governed-workspace-v1",
    relevantRule: "outside_agent_workspace",
    stateReads: ["workspace.path_allowed", "workspace.is_protected"],
    relatedScenarioIds: ["openclaw-personal-operations", "launch-review"],
  },
] as const satisfies readonly DemoOperationDefinition[];

export const demoStagePresentation = {
  "stage-1": {
    runLabel: "Run governed purchase",
    resourceLabel: "Business purchase budget",
    userIntent:
      "Buy the project-planning subscription for $40 and charge it to business.",
    agentResponse:
      "I found the requested plan. I am submitting the purchase through the governed business-purchase tool.",
    policyChange:
      "Publish the reviewed categorized-purchase@v1 scenario revision with its registered budget dependency.",
    takeaway:
      "A governance requirement becomes a validated, reviewed policy revision, registered state dependency, governed route, and inspectable result.",
    managementTakeaway:
      "The rule is reviewed and tested outside the agent prompt and provider implementation.",
    activeAgentIds: ["openclaw:work-manager"],
    configuredAgentIds: ["openclaw:work-manager"],
    activeRouteIds: ["purchase"],
  },
  "stage-2": {
    runLabel: "Run concurrent purchase requests",
    resourceLabel: "Shared demo-owner business budget",
    userIntent:
      "Coordinate the travel and work purchases against one $100 business budget.",
    agentResponse:
      "Travel Planner and Work Manager submit overlapping $60 requests through the same governed purchase shape.",
    policyChange:
      "Review categorized-purchase@v1 → @v2 so available capacity is shared by owner and category and includes protected pending work.",
    takeaway:
      "The arithmetic did not become harder. Multiple governed actions began to depend on and change the same state.",
    managementTakeaway:
      "One reviewed policy revision changes governance for both agents without duplicating the rule in either agent.",
    activeAgentIds: [
      "openclaw:travel-planner",
      "openclaw:work-manager",
    ],
    configuredAgentIds: [
      "openclaw:travel-planner",
      "openclaw:work-manager",
    ],
    activeRouteIds: ["purchase"],
  },
  "stage-3": {
    runLabel: "Run calendar and workspace operations",
    resourceLabel: "Protected calendar and workspace fixtures",
    userIntent:
      "Reserve travel time and maintain trip files without disturbing protected work.",
    agentResponse:
      "Travel Planner proposes a travel block and itinerary through separate governed operations.",
    policyChange:
      "Add governed-calendar@v1 and governed-workspace@v1 while categorized-purchase@v2 remains unchanged.",
    takeaway:
      "A new governed resource requires a declared route, policy-state views, provider-owned effects, and policy. The rule remains separate from the agent prompt.",
    managementTakeaway:
      "New policy modules extend governance without rewriting the purchase rule or agent prompts.",
    activeAgentIds: ["openclaw:travel-planner"],
    configuredAgentIds: [
      "openclaw:travel-planner",
      "openclaw:work-manager",
    ],
    activeRouteIds: ["purchase", "calendar-create", "file-change"],
  },
} as const satisfies Record<
  ScenarioStageId,
  Readonly<{
    runLabel: string;
    resourceLabel: string;
    userIntent: string;
    agentResponse: string;
    policyChange: string;
    takeaway: string;
    managementTakeaway: string;
    activeAgentIds: readonly (
      | "openclaw:travel-planner"
      | "openclaw:work-manager"
    )[];
    configuredAgentIds: readonly (
      | "openclaw:travel-planner"
      | "openclaw:work-manager"
    )[];
    activeRouteIds: readonly ScenarioRouteId[];
  }>
>;

function policyViews(ids: readonly PolicyArtifactId[]): readonly PolicyArtifact[] {
  return ids.map(getPolicyArtifact);
}

function artifactsForStage(stageId: ScenarioStageId): readonly DemoArtifact[] {
  return demoArtifacts.filter((item) => item.stageId === stageId);
}

function selectDemoCta(release: ReleaseContract = masugateRelease) {
  if (isPublishedRelease(release)) {
    return {
      primary: {
        label: "Try MasuGate locally",
        href: release.publicDocumentation.value.href,
      },
      secondary: {
        label: "Request a customized demo",
        href: "/#contact",
      },
    } as const;
  }

  return {
    primary: {
      label: "View release-candidate documentation",
      href: "/get-started/",
    },
    secondary: {
      label: "Request a customized demo",
      href: "/#contact",
    },
  } as const;
}

function routeViews(ids: readonly ScenarioRouteId[]) {
  return ids.map((routeId) => {
    const route = openClawScenario.routes.find(({ id }) => id === routeId);
    if (!route) throw new Error(`Unknown Demo route: ${routeId}`);
    return route;
  });
}

export function selectDemoExperience() {
  const openClaw = getIntegrationProfile("openclaw");
  const stageOneEvents = selectScenarioSequence("stage-1-governed");
  const stageTwoApprovedEvents = selectScenarioSequence("stage-2-approved");
  const stageTwoDeclinedEvents = selectScenarioSequence("stage-2-declined");
  const stageTwoCounterfactualEvents = selectScenarioSequence(
    "stage-2-counterfactual",
  );
  const stageThreeEvents = selectScenarioSequence("stage-3-default");
  const stageThreeProbeEvents = selectScenarioSequence(
    "stage-3-workspace-probe",
  ).filter(({ branch }) => branch === "workspace-probe");

  return {
    scenario: {
      id: openClawScenario.id,
      label: openClawScenario.label,
      owner: openClawScenario.owner,
      policyOwner: openClawScenario.policyOwner,
      agents: openClawScenario.agents,
      budget: openClawScenario.budget,
      calendar: openClawScenario.calendar,
      workspace: openClawScenario.workspace,
    },
    integration: {
      name: openClaw.name,
      hostPins: openClaw.hostPins,
      publication: openClaw.publication,
      adapter: openClaw.adapter,
      conceptualBinding: openClaw.conceptualBinding,
      replacementBoundary: openClaw.replacementBoundary,
      hostBinding: openClaw.hostBinding,
      exclusions: openClaw.exclusions,
      deploymentOwnedConfiguration: openClaw.deploymentOwnedConfiguration,
    },
    operations: demoOperationDefinitions,
    stages: openClawScenario.stages.map((stage) => ({
      ...stage,
      presentation: demoStagePresentation[stage.id],
      policies: policyViews(stage.policyArtifactIds),
      artifacts: artifactsForStage(stage.id),
      routes: routeViews(demoStagePresentation[stage.id].activeRouteIds),
      timelines:
        stage.id === "stage-1"
          ? {
              primary: stageOneEvents,
              alternate: [] as readonly ScenarioEvent[],
              counterfactual: [] as readonly ScenarioEvent[],
              probe: [] as readonly ScenarioEvent[],
            }
          : stage.id === "stage-2"
            ? {
                primary: stageTwoApprovedEvents,
                alternate: stageTwoDeclinedEvents,
                counterfactual: stageTwoCounterfactualEvents,
                probe: [] as readonly ScenarioEvent[],
              }
            : {
                primary: stageThreeEvents,
                alternate: [] as readonly ScenarioEvent[],
                counterfactual: [] as readonly ScenarioEvent[],
                probe: stageThreeProbeEvents,
              },
    })),
    release: {
      id: masugateRelease.id,
      version: masugateRelease.version,
      state: masugateRelease.state,
      maturity: masugateRelease.maturity,
    },
    status: {
      presentation: demoArtifacts.every(
        ({ presentationOrigin }) => presentationOrigin === "recorded",
      )
        ? "recorded"
        : "simulated",
      evidence: demoArtifacts.every(({ evidence }) => evidence.status === "verified")
        ? "verified"
        : "reference",
    },
    cta: selectDemoCta(),
  } as const;
}

export type DemoExperienceModel = ReturnType<typeof selectDemoExperience>;

/**
 * The counterfactual is review material rendered by the server transcript. It
 * is intentionally excluded from the interactive client payload because the
 * Milestone 3 state machine never enters that branch.
 */
export type DemoClientModel = Pick<
  DemoExperienceModel,
  "scenario" | "integration" | "operations" | "stages"
>;

export function selectDemoClientExperience(
  model: DemoExperienceModel = selectDemoExperience(),
): DemoClientModel {
  return {
    scenario: model.scenario,
    integration: model.integration,
    operations: model.operations,
    stages: model.stages.map((stage) => ({
      ...stage,
      timelines: {
        ...stage.timelines,
        alternate:
          stage.id === "stage-2"
            ? stage.timelines.alternate.slice(
                demoTransitionPoints.stage2BranchStart,
              )
            : stage.timelines.alternate,
        counterfactual: [] as readonly ScenarioEvent[],
      },
    })),
  };
}

const requiredDemoArtifactKinds = [
  "policy",
  "configuration",
  "runtime-trace",
  "decision-record",
] as const satisfies readonly DemoArtifactKind[];

function requestArguments(
  request: ScenarioRequest,
): DemoOperationDefinition["arguments"] {
  if (request.kind === "purchase") {
    const amount = request.amount.minorUnits / 100;
    return [
      {
        label: "Category",
        value:
          request.category.charAt(0).toUpperCase() + request.category.slice(1),
      },
      {
        label: "Amount",
        value: `$${Number.isInteger(amount) ? amount.toFixed(0) : amount.toFixed(2)}`,
      },
      { label: "Purpose", value: request.businessPurpose },
    ];
  }

  if (request.kind === "calendar-create") {
    const dateAndOffset = openClawScenario.calendar.dateAndOffset;

    if (dateAndOffset.state !== "available") {
      throw new Error(
        `Calendar request ${request.id} is missing its authored date and UTC offset.`,
      );
    }

    return [
      { label: "Date", value: dateAndOffset.value.date },
      { label: "Start", value: request.start },
      { label: "End", value: request.end },
      { label: "Timezone", value: openClawScenario.calendar.timezone },
      { label: "UTC offset", value: dateAndOffset.value.utcOffset },
      { label: "Start timestamp", value: request.startAt },
      { label: "End timestamp", value: request.endAt },
    ];
  }

  return [
    {
      label: "Operation",
      value:
        request.operation.charAt(0).toUpperCase() + request.operation.slice(1),
    },
    { label: "Path", value: request.path },
  ];
}

export function validateDemoArtifacts(
  artifacts: readonly DemoArtifact[] = demoArtifacts,
): readonly string[] {
  const errors: string[] = [];
  const ids = new Set<string>();

  for (const item of artifacts) {
    if (ids.has(item.id)) errors.push(`Duplicate Demo artifact id: ${item.id}`);
    ids.add(item.id);

    if (item.presentationOrigin === "recorded" && item.source.state !== "available") {
      errors.push(`Recorded Demo artifact requires an available source: ${item.id}`);
    }

    if (
      item.evidence.status === "verified" &&
      (item.verification.state !== "available" ||
        item.release.immutableRevision.state !== "available" ||
        item.source.state !== "available" ||
        item.integrationProfile.evidence.status !== "verified")
    ) {
      errors.push(`Verified Demo artifact is missing release evidence: ${item.id}`);
    }

    if (
      item.evidence.status === "reference" &&
      item.verification.state === "available"
    ) {
      errors.push(`Reference Demo artifact cannot expose a verification gate: ${item.id}`);
    }

    if (
      item.kind === "policy" &&
      (!item.policyArtifactId ||
        !openClawScenario.stages.some(
          (stage) =>
            stage.id === item.stageId &&
            stage.policyArtifactIds.includes(item.policyArtifactId as PolicyArtifactId),
        ))
    ) {
      errors.push(`Demo policy artifact is not active in its stage: ${item.id}`);
    }

    if (
      item.integrationProfile.id !== "openclaw" ||
      item.release.releaseId !== masugateRelease.id ||
      item.integrationProfile.masugateReleaseId !== item.release.releaseId ||
      item.integrationProfile.publication !== demoOpenClawProfile.publication ||
      item.integrationProfile.hostPins.length === 0 ||
      JSON.stringify(item.integrationProfile.hostPins) !==
        JSON.stringify(demoOpenClawProfile.hostPins)
    ) {
      errors.push(`Demo artifact has an invalid OpenClaw profile: ${item.id}`);
    }
  }

  return errors;
}

export function validateDemoExperience(): readonly string[] {
  const errors = [...validateDemoArtifacts()];
  const model = selectDemoExperience();
  const clientModel = selectDemoClientExperience(model);
  const stageOne = model.stages.find(({ id }) => id === "stage-1");
  const stageTwo = model.stages.find(({ id }) => id === "stage-2");
  const stageThree = model.stages.find(({ id }) => id === "stage-3");
  const clientStageTwo = clientModel.stages.find(({ id }) => id === "stage-2");

  if (
    clientModel.stages.some((stage) => stage.timelines.counterfactual.length > 0) ||
    clientStageTwo?.timelines.alternate[0]?.id !== "stage-2-review-declined"
  ) {
    errors.push("Demo client payload must omit review-only and duplicated branch events.");
  }

  const interactiveEvents = model.stages.flatMap((stage) => [
    ...stage.timelines.primary,
    ...stage.timelines.alternate,
    ...stage.timelines.probe,
  ]);
  const definedOperationIds = new Set<string>(
    demoOperationDefinitions.map(({ operationId }) => operationId),
  );
  const operationDefinitions = new Map<string, DemoOperationDefinition>(
    demoOperationDefinitions.map((definition) => [
      definition.operationId,
      definition,
    ]),
  );
  const fixtureRequests = new Map<string, ScenarioRequest>(
    openClawScenario.requests.map((request) => [request.id, request]),
  );

  for (const stage of model.stages) {
    for (const kind of requiredDemoArtifactKinds) {
      if (!stage.artifacts.some((artifact) => artifact.kind === kind)) {
        errors.push(`Demo stage ${stage.id} is missing its ${kind} artifact.`);
      }
    }

    for (const event of [
      ...stage.timelines.primary,
      ...stage.timelines.alternate,
      ...stage.timelines.probe,
    ]) {
      if (event.stageId !== stage.id) {
        errors.push(`Demo event is attached to the wrong stage: ${event.id}`);
      }

      if (event.operation && !definedOperationIds.has(event.operation.operationId)) {
        errors.push(`Demo operation has no typed record definition: ${event.operation.operationId}`);
      }

      const definition = event.operation
        ? operationDefinitions.get(event.operation.operationId)
        : undefined;
      if (definition && definition.stageId !== event.stageId) {
        errors.push(`Demo operation is attached to the wrong stage: ${event.id}`);
      }

      if (
        event.policy &&
        !stage.policyArtifactIds.includes(event.policy.artifactId)
      ) {
        errors.push(`Demo event uses an inactive policy: ${event.id}`);
      }

      if (
        event.operation &&
        event.operation.status !== "committed" &&
        "effectResult" in event.operation &&
        event.operation.effectResult
      ) {
        errors.push(`Non-committed Demo operation has an effect result: ${event.id}`);
      }
    }
  }

  for (const definition of demoOperationDefinitions) {
    const request = fixtureRequests.get(definition.requestId);

    if (!request) {
      errors.push(`Demo operation references a missing request: ${definition.operationId}`);
    } else {
      if (
        request.stageId !== definition.stageId ||
        request.agentId !== definition.agentId ||
        request.routeId !== definition.routeId
      ) {
        errors.push(`Demo operation does not match its scenario request: ${definition.operationId}`);
      }

      if (
        JSON.stringify(definition.arguments) !==
        JSON.stringify(requestArguments(request))
      ) {
        errors.push(`Demo operation arguments drifted from its request: ${definition.operationId}`);
      }

      const requestEvents = interactiveEvents.filter(
        (event) =>
          event.kind === "request" &&
          event.artifactRefs.includes(`request:${definition.requestId}`),
      );
      if (
        requestEvents.length === 0 ||
        requestEvents.some(
          (event) =>
            event.stageId !== definition.stageId ||
            event.actorId !== definition.agentId,
        )
      ) {
        errors.push(`Demo operation request event is missing or mismatched: ${definition.operationId}`);
      }
    }

    if (
      !interactiveEvents.some(
        (event) => event.operation?.operationId === definition.operationId,
      )
    ) {
      errors.push(`Typed Demo operation is absent from its timeline: ${definition.operationId}`);
    }

    if (
      !model.stages.some(
        (stage) =>
          stage.id === definition.stageId &&
          stage.policyArtifactIds.includes(definition.policyArtifactId),
      )
    ) {
      errors.push(`Demo operation policy is inactive in its stage: ${definition.operationId}`);
    }

    const policy = getPolicyArtifact(definition.policyArtifactId);
    const declaredViews = new Set(
      policy.dependencies.map(({ referenceView }) => referenceView),
    );
    if (
      definition.stateReads.some((view) => !declaredViews.has(view))
    ) {
      errors.push(`Demo operation state reads drifted from its policy: ${definition.operationId}`);
    }
  }

  if (
    stageOne?.timelines.primary
      .slice(0, 4)
      .map(({ id }) => id)
      .join(",") !==
    "stage-1-request,stage-1-host-context,stage-1-route-resolved,stage-1-state-read"
  ) {
    errors.push("Stage 1 Demo must bind host context and route before its state read.");
  }

  const stageOneFinal = stageOne?.timelines.primary.at(-1);
  if (
    stageOneFinal?.operation?.status !== "committed" ||
    stageOneFinal.resourceSnapshot.kind !== "budget" ||
    stageOneFinal.resourceSnapshot.available.minorUnits !== 6_000
  ) {
    errors.push("Stage 1 Demo must finish committed with $60 available.");
  }

  if (
    stageTwo?.timelines.primary[demoChoicePoints.stage2Review]?.id !==
    "stage-2-review-awaiting-choice"
  ) {
    errors.push("Stage 2 Demo review barrier no longer matches the scenario fixture.");
  }

  const stageTwoProtectionIndex = stageTwo?.timelines.primary.findIndex(
    ({ id }) => id === "stage-2-capacity-protected",
  );
  const stageTwoWorkDenialIndex = stageTwo?.timelines.primary.findIndex(
    ({ id }) => id === "stage-2-work-denied",
  );
  const stageTwoApprovedFinal = stageTwo?.timelines.primary.at(-1);
  const stageTwoDeclinedFinal = stageTwo?.timelines.alternate.at(-1);

  if (
    stageTwoProtectionIndex === undefined ||
    stageTwoWorkDenialIndex === undefined ||
    stageTwoProtectionIndex < 0 ||
    stageTwoWorkDenialIndex <= stageTwoProtectionIndex ||
    stageTwoWorkDenialIndex >= demoChoicePoints.stage2Review
  ) {
    errors.push("Stage 2 Demo must protect capacity and deny work before review.");
  }

  if (
    stageTwoApprovedFinal?.operation?.status !== "committed" ||
    stageTwoApprovedFinal.resourceSnapshot.kind !== "budget" ||
    stageTwoApprovedFinal.resourceSnapshot.available.minorUnits !== 4_000
  ) {
    errors.push("Stage 2 approve branch must finish committed with $40 available.");
  }

  if (
    stageTwoDeclinedFinal?.operation?.status !== "denied" ||
    stageTwoDeclinedFinal.resourceSnapshot.kind !== "budget" ||
    stageTwoDeclinedFinal.resourceSnapshot.available.minorUnits !== 10_000
  ) {
    errors.push("Stage 2 decline branch must finish denied with $100 available.");
  }

  if (
    stageThree?.timelines.primary[demoChoicePoints.stage3Alternative]?.id !==
    "stage-3-calendar-conflict-denied"
  ) {
    errors.push("Stage 3 Demo alternative barrier no longer matches the scenario fixture.");
  }

  if (
    stageThree?.timelines.probe.map(({ id }) => id).join(",") !==
    "stage-3-protected-brief-request,stage-3-protected-brief-state-read,stage-3-protected-brief-denied"
  ) {
    errors.push("Stage 3 Demo probe must append only the three probe events.");
  }

  if (
    stageThree?.timelines.primary.length !==
      demoTransitionPoints.stage3PrimaryComplete + 1 ||
    stageThree.timelines.primary.at(-1)?.id !== "stage-3-itinerary-committed"
  ) {
    errors.push("Stage 3 Demo primary completion point no longer matches the fixture.");
  }

  if (
    (stageOne?.timelines.primary.length ?? 0) - 1 !==
      demoTransitionPoints.stage1Complete ||
    (stageTwo?.timelines.primary.length ?? 0) - 1 !==
      demoTransitionPoints.stage2ApprovedComplete ||
    (stageTwo?.timelines.alternate.length ?? 0) - 1 !==
      demoTransitionPoints.stage2DeclinedComplete ||
    demoTransitionPoints.stage2BranchStart !==
      demoChoicePoints.stage2Review + 1 ||
    demoTransitionPoints.stage3AlternativeStart !==
      demoChoicePoints.stage3Alternative + 1 ||
    demoTransitionPoints.stage3ProbeStart !==
      demoTransitionPoints.stage3PrimaryComplete + 1 ||
    demoTransitionPoints.stage3ProbeComplete !==
      demoTransitionPoints.stage3ProbeStart +
        (stageThree?.timelines.probe.length ?? 0) -
        1
  ) {
    errors.push("Demo state-machine topology no longer matches the scenario timelines.");
  }

  const requiredStageThreeOutcomes = [
    ["stage-3-calendar-conflict-denied", "denied"],
    ["stage-3-calendar-alternative-committed", "committed"],
    ["stage-3-itinerary-committed", "committed"],
    ["stage-3-protected-brief-denied", "denied"],
  ] as const;

  for (const [eventId, expectedStatus] of requiredStageThreeOutcomes) {
    const event = [...(stageThree?.timelines.primary ?? []), ...(stageThree?.timelines.probe ?? [])].find(
      ({ id }) => id === eventId,
    );
    if (event?.operation?.status !== expectedStatus) {
      errors.push(`Stage 3 Demo has the wrong outcome at ${eventId}.`);
    }
  }

  return errors;
}

export const demoValidationErrors = validateDemoExperience();
