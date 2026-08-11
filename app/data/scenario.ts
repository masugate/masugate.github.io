import {
  type Availability,
  type IsoDate,
  type Money,
  type OperationProjection,
  type PolicyArtifactId,
  type PolicyDecision,
  type ScenarioAgentId,
  type ScenarioStageId,
  available,
  unavailable,
  usd,
} from "./contracts";

type IsoOffsetDateTime = `${IsoDate}T${string}${"+" | "-"}${string}`;

export type ScenarioRouteId = "purchase" | "calendar-create" | "file-change";
export type ScenarioPolicyClauseId =
  | "category_budget_exceeded"
  | "procurement_review"
  | "protected_work_overlap"
  | "outside_agent_workspace"
  | "otherwise";
export type ScenarioPolicyStateRead =
  | "budget.spent"
  | "budget.limit"
  | "budget.available"
  | "calendar.overlaps"
  | "workspace.path_allowed"
  | "workspace.is_protected";
export type ScenarioSequenceId =
  | "stage-1-governed"
  | "stage-2-counterfactual"
  | "stage-2-approved"
  | "stage-2-declined"
  | "stage-3-default"
  | "stage-3-workspace-probe";

export type PurchaseRequest = Readonly<{
  kind: "purchase";
  id:
    | "stage-1-project-planning-subscription"
    | "stage-2-travel-hotel-deposit"
    | "stage-2-hosted-testing-capacity";
  stageId: "stage-1" | "stage-2";
  agentId: ScenarioAgentId;
  label: string;
  amount: Money;
  category: "business";
  businessPurpose: string;
  routeId: "purchase";
}>;

export type CalendarRequest = Readonly<{
  kind: "calendar-create";
  id: "stage-3-travel-block-conflict" | "stage-3-travel-block-alternative";
  stageId: "stage-3";
  agentId: "openclaw:travel-planner";
  label: "Travel block";
  start: "14:30" | "15:15";
  end: "16:00" | "16:45";
  startAt: IsoOffsetDateTime;
  endAt: IsoOffsetDateTime;
  routeId: "calendar-create";
}>;

export type WorkspaceRequest = Readonly<{
  kind: "file-change";
  id: "stage-3-create-itinerary" | "stage-3-replace-protected-brief";
  stageId: "stage-3";
  agentId: "openclaw:travel-planner";
  label: string;
  operation: "create" | "replace";
  path:
    | "/shared/travel/trip-104/itinerary.md"
    | "/shared/work/launch-review/brief.md";
  routeId: "file-change";
}>;

export type ScenarioRequest =
  | PurchaseRequest
  | CalendarRequest
  | WorkspaceRequest;

export type BudgetSnapshot = Readonly<{
  kind: "budget";
  capacity: Money;
  committed: Money;
  protected: Money;
  available: Money;
}>;

export type CalendarSnapshot = Readonly<{
  kind: "calendar";
  timezone: "America/New_York";
  date: IsoDate;
  utcOffset: string;
  entries: readonly Readonly<{
    id: string;
    label: string;
    start: string;
    end: string;
    startAt: IsoOffsetDateTime;
    endAt: IsoOffsetDateTime;
    protected: boolean;
  }>[];
}>;

export type WorkspaceSnapshot = Readonly<{
  kind: "workspace";
  entries: readonly Readonly<{
    path: string;
    kind: "directory" | "file";
    protection: "agent-owned" | "protected-work";
  }>[];
}>;

export type ResourceSnapshot =
  | BudgetSnapshot
  | CalendarSnapshot
  | WorkspaceSnapshot;

export interface ScenarioEvent {
  id: string;
  stageId: ScenarioStageId;
  branch:
    | "shared"
    | "default"
    | "decline"
    | "counterfactual"
    | "calendar-alternative"
    | "workspace-probe";
  actorId:
    | ScenarioAgentId
    | "user"
    | "reviewer"
    | "masugate"
    | "provider"
    | "detached-check"
    | "scenario";
  kind:
    | "reset"
    | "request"
    | "host-context"
    | "route-resolution"
    | "state-read"
    | "decision"
    | "protection"
    | "review"
    | "effect"
    | "record";
  label: string;
  description: string;
  resourceSnapshot: ResourceSnapshot;
  policy?: Readonly<{
    artifactId: PolicyArtifactId;
    decision: PolicyDecision;
  }>;
  policyContext?: Readonly<{
    artifactId: PolicyArtifactId;
    activeClause?: ScenarioPolicyClauseId;
    stateReads: readonly ScenarioPolicyStateRead[];
  }>;
  operation?: Readonly<{ operationId: string }> & OperationProjection;
  artifactRefs: readonly string[];
  announcement: string;
}

export interface ScenarioSequence {
  id: ScenarioSequenceId;
  stageId: ScenarioStageId;
  label: string;
  eventIds: readonly string[];
}

export interface ScenarioStage {
  id: ScenarioStageId;
  productVersion: "1" | "2" | "3";
  title: string;
  requirement: string;
  baselineLabel: string;
  resetsPriorStage: boolean;
  policyArtifactIds: readonly PolicyArtifactId[];
  sequenceIds: readonly ScenarioSequenceId[];
}

export interface ScenarioContract {
  id: "openclaw-personal-operations";
  label: string;
  owner: Readonly<{
    id: "demo-owner";
    label: string;
  }>;
  policyOwner: Readonly<{
    id: "operations-policy-owner";
    label: "Operations policy owner";
  }>;
  agents: readonly Readonly<{
    id: ScenarioAgentId;
    displayName: "Travel Planner" | "Work Project Manager";
    shortName: "Travel Planner" | "Work Manager";
    host: "OpenClaw";
  }>[];
  routes: readonly Readonly<{
    id: ScenarioRouteId;
    label: string;
    releaseBinding: Availability<string>;
    provider: Readonly<{
      owner: "deployment";
      label: string;
      stateViews: readonly ScenarioPolicyStateRead[];
      governedEffectLabel: string;
      releaseBinding: Availability<string>;
    }>;
    connector: Readonly<{
      owner: "deployment";
      label: string;
      credentialBoundary: string;
      releaseBinding: Availability<string>;
    }>;
    execution: Readonly<{
      owner: "deployment";
      boundary: string;
      releasePosition: Availability<string>;
    }>;
  }>[];
  budget: Readonly<{
    category: "business";
    categoryLabel: "Business";
    categories: readonly ["food", "entertainment", "utilities", "business"];
    currency: "USD";
    window: Availability<string>;
    capacity: Money;
    reviewAtOrAbove: Money;
  }>;
  calendar: Readonly<{
    timezone: "America/New_York";
    dateAndOffset: Availability<
      Readonly<{
        date: IsoDate;
        utcOffset: string;
      }>
    >;
    protectedEvent: Readonly<{
      id: "client-launch-review";
      label: "Client launch review";
      start: "14:00";
      end: "15:00";
      startAt: IsoOffsetDateTime;
      endAt: IsoOffsetDateTime;
    }>;
  }>;
  workspace: Readonly<{
    tripId: "trip-104";
    projectId: "launch-review";
    travelRoot: "/shared/travel/trip-104/";
    protectedWorkRoot: "/shared/work/launch-review/";
  }>;
  requests: readonly ScenarioRequest[];
  stages: readonly ScenarioStage[];
  events: readonly ScenarioEvent[];
  sequences: readonly ScenarioSequence[];
}

const budgetBaseline = (): BudgetSnapshot => ({
  kind: "budget",
  capacity: usd(10_000),
  committed: usd(0),
  protected: usd(0),
  available: usd(10_000),
});

const budgetAfterStageOne = (): BudgetSnapshot => ({
  kind: "budget",
  capacity: usd(10_000),
  committed: usd(4_000),
  protected: usd(0),
  available: usd(6_000),
});

const budgetProtectedForTravel = (): BudgetSnapshot => ({
  kind: "budget",
  capacity: usd(10_000),
  committed: usd(0),
  protected: usd(6_000),
  available: usd(4_000),
});

const budgetAfterTravelCommit = (): BudgetSnapshot => ({
  kind: "budget",
  capacity: usd(10_000),
  committed: usd(6_000),
  protected: usd(0),
  available: usd(4_000),
});

const budgetAfterCounterfactualOverrun = (): BudgetSnapshot => ({
  kind: "budget",
  capacity: usd(10_000),
  committed: usd(12_000),
  protected: usd(0),
  available: usd(-2_000),
});

/**
 * Authored Stage 3 calendar fixture. September 15, 2026 is a Tuesday and
 * America/New_York observes EDT (UTC-04:00) on this date.
 */
const authoredCalendarFixture = {
  timezone: "America/New_York",
  date: "2026-09-15",
  utcOffset: "-04:00",
} as const;

function calendarTimestamp<const WallClock extends string>(
  wallClock: WallClock,
): `${typeof authoredCalendarFixture.date}T${WallClock}:00${typeof authoredCalendarFixture.utcOffset}` {
  return `${authoredCalendarFixture.date}T${wallClock}:00${authoredCalendarFixture.utcOffset}`;
}

const protectedCalendar = (): CalendarSnapshot => ({
  kind: "calendar",
  timezone: authoredCalendarFixture.timezone,
  date: authoredCalendarFixture.date,
  utcOffset: authoredCalendarFixture.utcOffset,
  entries: [
    {
      id: "client-launch-review",
      label: "Client launch review",
      start: "14:00",
      end: "15:00",
      startAt: calendarTimestamp("14:00"),
      endAt: calendarTimestamp("15:00"),
      protected: true,
    },
  ],
});

const calendarWithAlternative = (): CalendarSnapshot => ({
  kind: "calendar",
  timezone: authoredCalendarFixture.timezone,
  date: authoredCalendarFixture.date,
  utcOffset: authoredCalendarFixture.utcOffset,
  entries: [
    {
      id: "client-launch-review",
      label: "Client launch review",
      start: "14:00",
      end: "15:00",
      startAt: calendarTimestamp("14:00"),
      endAt: calendarTimestamp("15:00"),
      protected: true,
    },
    {
      id: "travel-block-alternative",
      label: "Travel block",
      start: "15:15",
      end: "16:45",
      startAt: calendarTimestamp("15:15"),
      endAt: calendarTimestamp("16:45"),
      protected: false,
    },
  ],
});

const workspaceBaseline = (): WorkspaceSnapshot => ({
  kind: "workspace",
  entries: [
    {
      path: "/shared/travel/trip-104/",
      kind: "directory",
      protection: "agent-owned",
    },
    {
      path: "/shared/work/launch-review/",
      kind: "directory",
      protection: "protected-work",
    },
    {
      path: "/shared/work/launch-review/brief.md",
      kind: "file",
      protection: "protected-work",
    },
  ],
});

const workspaceWithItinerary = (): WorkspaceSnapshot => ({
  kind: "workspace",
  entries: [
    ...workspaceBaseline().entries,
    {
      path: "/shared/travel/trip-104/itinerary.md",
      kind: "file",
      protection: "agent-owned",
    },
  ],
});

const requests = [
  {
    kind: "purchase",
    id: "stage-1-project-planning-subscription",
    stageId: "stage-1",
    agentId: "openclaw:work-manager",
    label: "Project-planning subscription",
    amount: usd(4_000),
    category: "business",
    businessPurpose: "Project planning",
    routeId: "purchase",
  },
  {
    kind: "purchase",
    id: "stage-2-travel-hotel-deposit",
    stageId: "stage-2",
    agentId: "openclaw:travel-planner",
    label: "Refundable hotel deposit",
    amount: usd(6_000),
    category: "business",
    businessPurpose: "Refundable hotel deposit for a work trip",
    routeId: "purchase",
  },
  {
    kind: "purchase",
    id: "stage-2-hosted-testing-capacity",
    stageId: "stage-2",
    agentId: "openclaw:work-manager",
    label: "Hosted testing capacity",
    amount: usd(6_000),
    category: "business",
    businessPurpose: "Hosted testing capacity",
    routeId: "purchase",
  },
  {
    kind: "calendar-create",
    id: "stage-3-travel-block-conflict",
    stageId: "stage-3",
    agentId: "openclaw:travel-planner",
    label: "Travel block",
    start: "14:30",
    end: "16:00",
    startAt: calendarTimestamp("14:30"),
    endAt: calendarTimestamp("16:00"),
    routeId: "calendar-create",
  },
  {
    kind: "calendar-create",
    id: "stage-3-travel-block-alternative",
    stageId: "stage-3",
    agentId: "openclaw:travel-planner",
    label: "Travel block",
    start: "15:15",
    end: "16:45",
    startAt: calendarTimestamp("15:15"),
    endAt: calendarTimestamp("16:45"),
    routeId: "calendar-create",
  },
  {
    kind: "file-change",
    id: "stage-3-create-itinerary",
    stageId: "stage-3",
    agentId: "openclaw:travel-planner",
    label: "Create the trip itinerary",
    operation: "create",
    path: "/shared/travel/trip-104/itinerary.md",
    routeId: "file-change",
  },
  {
    kind: "file-change",
    id: "stage-3-replace-protected-brief",
    stageId: "stage-3",
    agentId: "openclaw:travel-planner",
    label: "Replace the protected project brief",
    operation: "replace",
    path: "/shared/work/launch-review/brief.md",
    routeId: "file-change",
  },
] as const satisfies readonly ScenarioRequest[];

const events = [
  {
    id: "stage-1-request",
    stageId: "stage-1",
    branch: "default",
    actorId: "openclaw:work-manager",
    kind: "request",
    label: "Work Manager requests the project-planning subscription",
    description: "The governed business purchase is submitted for $40.",
    resourceSnapshot: budgetBaseline(),
    policyContext: {
      artifactId: "categorized-purchase-v1",
      stateReads: [],
    },
    artifactRefs: ["request:stage-1-project-planning-subscription"],
    announcement: "The Work Manager submitted a $40 business purchase.",
  },
  {
    id: "stage-1-host-context",
    stageId: "stage-1",
    branch: "default",
    actorId: "openclaw:work-manager",
    kind: "host-context",
    label: "Trusted OpenClaw context bound",
    description:
      "The host supplies the Work Manager identity and stable invocation context; neither comes from model arguments.",
    resourceSnapshot: budgetBaseline(),
    policyContext: {
      artifactId: "categorized-purchase-v1",
      stateReads: [],
    },
    artifactRefs: ["integration-profile:openclaw"],
    announcement: "Trusted OpenClaw identity and invocation context are bound.",
  },
  {
    id: "stage-1-route-resolved",
    stageId: "stage-1",
    branch: "default",
    actorId: "masugate",
    kind: "route-resolution",
    label: "Governed purchase route resolved",
    description:
      "MasuGate resolves the declared purchase route and its registered budget dependencies.",
    resourceSnapshot: budgetBaseline(),
    policyContext: {
      artifactId: "categorized-purchase-v1",
      stateReads: [],
    },
    artifactRefs: ["route:purchase", "policy:categorized-purchase-v1"],
    announcement: "The governed purchase route and registered budget state are resolved.",
  },
  {
    id: "stage-1-state-read",
    stageId: "stage-1",
    branch: "default",
    actorId: "masugate",
    kind: "state-read",
    label: "Read the business-category budget",
    description: "The registered view reports $100 available.",
    resourceSnapshot: budgetBaseline(),
    policyContext: {
      artifactId: "categorized-purchase-v1",
      activeClause: "category_budget_exceeded",
      stateReads: ["budget.spent", "budget.limit"],
    },
    artifactRefs: ["policy:categorized-purchase-v1"],
    announcement: "The policy read $100 of available business capacity.",
  },
  {
    id: "stage-1-policy-allow",
    stageId: "stage-1",
    branch: "default",
    actorId: "masugate",
    kind: "decision",
    label: "Policy decision: allow",
    description: "The $40 request remains below the $50 review threshold and within capacity.",
    resourceSnapshot: budgetBaseline(),
    policy: {
      artifactId: "categorized-purchase-v1",
      decision: "allow",
    },
    policyContext: {
      artifactId: "categorized-purchase-v1",
      activeClause: "otherwise",
      stateReads: ["budget.spent", "budget.limit"],
    },
    artifactRefs: ["policy:categorized-purchase-v1"],
    announcement: "The policy decision is allow.",
  },
  {
    id: "stage-1-effect-committed",
    stageId: "stage-1",
    branch: "default",
    actorId: "provider",
    kind: "effect",
    label: "Governed purchase committed",
    description: "The configured purchase effect completes and $60 remains.",
    resourceSnapshot: budgetAfterStageOne(),
    policy: {
      artifactId: "categorized-purchase-v1",
      decision: "allow",
    },
    policyContext: {
      artifactId: "categorized-purchase-v1",
      activeClause: "otherwise",
      stateReads: ["budget.spent", "budget.limit"],
    },
    operation: {
      operationId: "scenario-op-stage-1-purchase",
      status: "committed",
      effectResult: "Reference purchase committed",
    },
    artifactRefs: ["record:scenario-op-stage-1-purchase"],
    announcement: "The governed purchase committed and $60 remains.",
  },
  {
    id: "stage-1-record-finalized",
    stageId: "stage-1",
    branch: "default",
    actorId: "masugate",
    kind: "record",
    label: "Decision record retained",
    description: "The request, policy decision, governed effect, and result remain linked.",
    resourceSnapshot: budgetAfterStageOne(),
    policy: {
      artifactId: "categorized-purchase-v1",
      decision: "allow",
    },
    policyContext: {
      artifactId: "categorized-purchase-v1",
      activeClause: "otherwise",
      stateReads: ["budget.spent", "budget.limit"],
    },
    operation: {
      operationId: "scenario-op-stage-1-purchase",
      status: "committed",
      effectResult: "Reference purchase committed",
    },
    artifactRefs: ["record:scenario-op-stage-1-purchase"],
    announcement: "The committed operation record is ready to inspect.",
  },
  {
    id: "stage-2-reset",
    stageId: "stage-2",
    branch: "shared",
    actorId: "scenario",
    kind: "reset",
    label: "Version fixture reset",
    description: "Stage 2 begins from its own $100 shared-budget baseline.",
    resourceSnapshot: budgetBaseline(),
    artifactRefs: ["scenario:stage-2"],
    announcement: "The Stage 2 version fixture reset to $100 available.",
  },
  {
    id: "stage-2-travel-request",
    stageId: "stage-2",
    branch: "shared",
    actorId: "openclaw:travel-planner",
    kind: "request",
    label: "Travel Planner requests a refundable hotel deposit",
    description: "The first overlapping business purchase requests $60.",
    resourceSnapshot: budgetBaseline(),
    policyContext: {
      artifactId: "categorized-purchase-v2",
      stateReads: [],
    },
    artifactRefs: ["request:stage-2-travel-hotel-deposit"],
    announcement: "The Travel Planner submitted a $60 refundable hotel deposit.",
  },
  {
    id: "stage-2-travel-state-read",
    stageId: "stage-2",
    branch: "shared",
    actorId: "masugate",
    kind: "state-read",
    label: "Read shared business capacity",
    description: "The owner-and-category view reports $100 available.",
    resourceSnapshot: budgetBaseline(),
    policyContext: {
      artifactId: "categorized-purchase-v2",
      activeClause: "category_budget_exceeded",
      stateReads: ["budget.available"],
    },
    artifactRefs: ["policy:categorized-purchase-v2"],
    announcement: "The shared budget view reports $100 available.",
  },
  {
    id: "stage-2-travel-escalated",
    stageId: "stage-2",
    branch: "shared",
    actorId: "masugate",
    kind: "decision",
    label: "Travel request enters review",
    description: "The policy decision is escalate because $60 meets the $50 threshold.",
    resourceSnapshot: budgetBaseline(),
    policy: {
      artifactId: "categorized-purchase-v2",
      decision: "escalate",
    },
    policyContext: {
      artifactId: "categorized-purchase-v2",
      activeClause: "procurement_review",
      stateReads: ["budget.available"],
    },
    operation: {
      operationId: "scenario-op-stage-2-travel",
      status: "pending",
    },
    artifactRefs: ["policy:categorized-purchase-v2"],
    announcement: "The travel policy decision is escalate and the operation is pending.",
  },
  {
    id: "stage-2-capacity-protected",
    stageId: "stage-2",
    branch: "shared",
    actorId: "masugate",
    kind: "protection",
    label: "$60 of capacity is protected",
    description: "Later requests now see $40 available while review is pending.",
    resourceSnapshot: budgetProtectedForTravel(),
    policy: {
      artifactId: "categorized-purchase-v2",
      decision: "escalate",
    },
    policyContext: {
      artifactId: "categorized-purchase-v2",
      activeClause: "procurement_review",
      stateReads: ["budget.available"],
    },
    operation: {
      operationId: "scenario-op-stage-2-travel",
      status: "pending",
    },
    artifactRefs: ["record:scenario-op-stage-2-travel"],
    announcement: "$60 is protected and $40 remains available.",
  },
  {
    id: "stage-2-work-request",
    stageId: "stage-2",
    branch: "shared",
    actorId: "openclaw:work-manager",
    kind: "request",
    label: "Work Manager requests hosted testing capacity",
    description: "The second overlapping business purchase also requests $60.",
    resourceSnapshot: budgetProtectedForTravel(),
    policyContext: {
      artifactId: "categorized-purchase-v2",
      stateReads: [],
    },
    artifactRefs: ["request:stage-2-hosted-testing-capacity"],
    announcement: "The Work Manager submitted a second $60 purchase.",
  },
  {
    id: "stage-2-work-state-read",
    stageId: "stage-2",
    branch: "shared",
    actorId: "masugate",
    kind: "state-read",
    label: "The second request reads current capacity",
    description: "The shared view includes protected work and reports only $40 available.",
    resourceSnapshot: budgetProtectedForTravel(),
    policyContext: {
      artifactId: "categorized-purchase-v2",
      activeClause: "category_budget_exceeded",
      stateReads: ["budget.available"],
    },
    artifactRefs: ["policy:categorized-purchase-v2"],
    announcement: "The second policy evaluation sees $40 available.",
  },
  {
    id: "stage-2-work-denied",
    stageId: "stage-2",
    branch: "shared",
    actorId: "masugate",
    kind: "decision",
    label: "Second request denied",
    description: "$60 exceeds the $40 that remains available.",
    resourceSnapshot: budgetProtectedForTravel(),
    policy: {
      artifactId: "categorized-purchase-v2",
      decision: "deny",
    },
    policyContext: {
      artifactId: "categorized-purchase-v2",
      activeClause: "category_budget_exceeded",
      stateReads: ["budget.available"],
    },
    operation: {
      operationId: "scenario-op-stage-2-work",
      status: "denied",
    },
    artifactRefs: ["record:scenario-op-stage-2-work"],
    announcement: "The work request is denied and no effect occurs.",
  },
  {
    id: "stage-2-review-awaiting-choice",
    stageId: "stage-2",
    branch: "shared",
    actorId: "reviewer",
    kind: "review",
    label: "Travel request awaits review",
    description: "The visitor chooses whether to approve or decline the exact pending operation.",
    resourceSnapshot: budgetProtectedForTravel(),
    policy: {
      artifactId: "categorized-purchase-v2",
      decision: "escalate",
    },
    policyContext: {
      artifactId: "categorized-purchase-v2",
      activeClause: "procurement_review",
      stateReads: ["budget.available"],
    },
    operation: {
      operationId: "scenario-op-stage-2-travel",
      status: "pending",
    },
    artifactRefs: ["record:scenario-op-stage-2-travel"],
    announcement: "Review is required before the travel operation can continue.",
  },
  {
    id: "stage-2-review-approved",
    stageId: "stage-2",
    branch: "default",
    actorId: "reviewer",
    kind: "review",
    label: "Reviewer allows this operation once",
    description: "The resolution remains bound to the pending travel operation.",
    resourceSnapshot: budgetProtectedForTravel(),
    policy: {
      artifactId: "categorized-purchase-v2",
      decision: "escalate",
    },
    policyContext: {
      artifactId: "categorized-purchase-v2",
      activeClause: "procurement_review",
      stateReads: ["budget.available"],
    },
    operation: {
      operationId: "scenario-op-stage-2-travel",
      status: "pending",
      humanResolution: "allow-once",
    },
    artifactRefs: ["record:scenario-op-stage-2-travel"],
    announcement: "The reviewer allowed the exact pending travel operation once.",
  },
  {
    id: "stage-2-travel-committed",
    stageId: "stage-2",
    branch: "default",
    actorId: "provider",
    kind: "effect",
    label: "Travel purchase committed",
    description: "The protected $60 effect completes and $40 remains.",
    resourceSnapshot: budgetAfterTravelCommit(),
    policy: {
      artifactId: "categorized-purchase-v2",
      decision: "escalate",
    },
    policyContext: {
      artifactId: "categorized-purchase-v2",
      activeClause: "procurement_review",
      stateReads: ["budget.available"],
    },
    operation: {
      operationId: "scenario-op-stage-2-travel",
      status: "committed",
      humanResolution: "allow-once",
      effectResult: "Reference refundable hotel deposit committed",
    },
    artifactRefs: ["record:scenario-op-stage-2-travel"],
    announcement: "The travel purchase committed and $40 remains available.",
  },
  {
    id: "stage-2-approved-records",
    stageId: "stage-2",
    branch: "default",
    actorId: "masugate",
    kind: "record",
    label: "Separate operation records finalized",
    description: "One record is committed after review; the other remains denied.",
    resourceSnapshot: budgetAfterTravelCommit(),
    policy: {
      artifactId: "categorized-purchase-v2",
      decision: "escalate",
    },
    policyContext: {
      artifactId: "categorized-purchase-v2",
      activeClause: "procurement_review",
      stateReads: ["budget.available"],
    },
    operation: {
      operationId: "scenario-op-stage-2-travel",
      status: "committed",
      humanResolution: "allow-once",
      effectResult: "Reference refundable hotel deposit committed",
    },
    artifactRefs: [
      "record:scenario-op-stage-2-travel",
      "record:scenario-op-stage-2-work",
    ],
    announcement: "The committed travel and denied work records are ready to inspect.",
  },
  {
    id: "stage-2-review-declined",
    stageId: "stage-2",
    branch: "decline",
    actorId: "reviewer",
    kind: "review",
    label: "Reviewer declines the travel operation",
    description: "No travel effect occurs and the protected capacity is released.",
    resourceSnapshot: budgetBaseline(),
    policy: {
      artifactId: "categorized-purchase-v2",
      decision: "escalate",
    },
    policyContext: {
      artifactId: "categorized-purchase-v2",
      activeClause: "procurement_review",
      stateReads: ["budget.available"],
    },
    operation: {
      operationId: "scenario-op-stage-2-travel",
      status: "denied",
      humanResolution: "decline",
    },
    artifactRefs: ["record:scenario-op-stage-2-travel"],
    announcement: "The travel operation is denied and $100 is available again.",
  },
  {
    id: "stage-2-declined-record",
    stageId: "stage-2",
    branch: "decline",
    actorId: "masugate",
    kind: "record",
    label: "Declined branch record finalized",
    description: "The record contains no connector receipt or purchase effect.",
    resourceSnapshot: budgetBaseline(),
    policy: {
      artifactId: "categorized-purchase-v2",
      decision: "escalate",
    },
    policyContext: {
      artifactId: "categorized-purchase-v2",
      activeClause: "procurement_review",
      stateReads: ["budget.available"],
    },
    operation: {
      operationId: "scenario-op-stage-2-travel",
      status: "denied",
      humanResolution: "decline",
    },
    artifactRefs: ["record:scenario-op-stage-2-travel"],
    announcement: "The declined operation record contains no effect receipt.",
  },
  {
    id: "counterfactual-travel-check",
    stageId: "stage-2",
    branch: "counterfactual",
    actorId: "detached-check",
    kind: "decision",
    label: "Travel request checks the original capacity",
    description: "The detached stateful check sees $100 and escalates the $60 request.",
    resourceSnapshot: budgetBaseline(),
    policy: {
      artifactId: "categorized-purchase-v2",
      decision: "escalate",
    },
    policyContext: {
      artifactId: "categorized-purchase-v2",
      activeClause: "procurement_review",
      stateReads: ["budget.available"],
    },
    operation: {
      operationId: "counterfactual-travel",
      status: "pending",
    },
    artifactRefs: ["counterfactual:travel-check"],
    announcement: "The travel check sees the original $100 capacity.",
  },
  {
    id: "counterfactual-work-check",
    stageId: "stage-2",
    branch: "counterfactual",
    actorId: "detached-check",
    kind: "decision",
    label: "Work request checks the same original capacity",
    description: "The overlapping check also sees $100 and escalates its $60 request.",
    resourceSnapshot: budgetBaseline(),
    policy: {
      artifactId: "categorized-purchase-v2",
      decision: "escalate",
    },
    policyContext: {
      artifactId: "categorized-purchase-v2",
      activeClause: "procurement_review",
      stateReads: ["budget.available"],
    },
    operation: {
      operationId: "counterfactual-work",
      status: "pending",
    },
    artifactRefs: ["counterfactual:work-check"],
    announcement: "The work check also sees the original $100 capacity.",
  },
  {
    id: "counterfactual-reviews-approved",
    stageId: "stage-2",
    branch: "counterfactual",
    actorId: "reviewer",
    kind: "review",
    label: "Both detached reviews approve",
    description: "Both approvals were based on the same original capacity.",
    resourceSnapshot: budgetBaseline(),
    artifactRefs: ["counterfactual:detached-approvals"],
    announcement: "Both requests were approved against the original state.",
  },
  {
    id: "counterfactual-travel-committed",
    stageId: "stage-2",
    branch: "counterfactual",
    actorId: "provider",
    kind: "effect",
    label: "First detached effect commits",
    description: "The travel purchase consumes $60 and leaves $40.",
    resourceSnapshot: budgetAfterTravelCommit(),
    operation: {
      operationId: "counterfactual-travel",
      status: "committed",
      humanResolution: "allow-once",
      effectResult: "Counterfactual travel effect",
    },
    artifactRefs: ["counterfactual:travel-effect"],
    announcement: "The first detached effect commits and leaves $40.",
  },
  {
    id: "counterfactual-work-stale-effect",
    stageId: "stage-2",
    branch: "counterfactual",
    actorId: "provider",
    kind: "effect",
    label: "The stale second effect also commits",
    description: "The combined spend reaches $120 against $100 of capacity.",
    resourceSnapshot: budgetAfterCounterfactualOverrun(),
    operation: {
      operationId: "counterfactual-work",
      status: "committed",
      humanResolution: "allow-once",
      effectResult: "Counterfactual stale work effect",
    },
    artifactRefs: ["counterfactual:work-effect"],
    announcement: "The stale second effect commits, producing $120 of combined spend.",
  },
  {
    id: "counterfactual-rule-broken",
    stageId: "stage-2",
    branch: "counterfactual",
    actorId: "scenario",
    kind: "record",
    label: "Combined outcome violates the budget rule",
    description: "Each check looked valid when made, but the second decision became stale.",
    resourceSnapshot: budgetAfterCounterfactualOverrun(),
    artifactRefs: ["counterfactual:combined-outcome"],
    announcement: "The counterfactual path spends $120 against a $100 budget.",
  },
  {
    id: "stage-3-reset",
    stageId: "stage-3",
    branch: "shared",
    actorId: "scenario",
    kind: "reset",
    label: "Version fixture reset",
    description: "Stage 3 begins from named calendar and workspace fixtures.",
    resourceSnapshot: protectedCalendar(),
    artifactRefs: ["scenario:stage-3"],
    announcement: "The Stage 3 calendar and workspace version fixtures are ready.",
  },
  {
    id: "stage-3-calendar-conflict-request",
    stageId: "stage-3",
    branch: "default",
    actorId: "openclaw:travel-planner",
    kind: "request",
    label: "Travel Planner requests an overlapping travel block",
    description: "The requested 14:30–16:00 block overlaps the protected review.",
    resourceSnapshot: protectedCalendar(),
    policyContext: {
      artifactId: "governed-calendar-v1",
      stateReads: [],
    },
    artifactRefs: ["request:stage-3-travel-block-conflict"],
    announcement: "The Travel Planner requested a conflicting 14:30 travel block.",
  },
  {
    id: "stage-3-calendar-conflict-state-read",
    stageId: "stage-3",
    branch: "default",
    actorId: "masugate",
    kind: "state-read",
    label: "Read protected calendar state",
    description:
      "The registered overlap view finds the protected 14:00–15:00 Client launch review.",
    resourceSnapshot: protectedCalendar(),
    policyContext: {
      artifactId: "governed-calendar-v1",
      activeClause: "protected_work_overlap",
      stateReads: ["calendar.overlaps"],
    },
    artifactRefs: ["policy:governed-calendar-v1"],
    announcement: "The calendar view reports a protected overlap.",
  },
  {
    id: "stage-3-calendar-conflict-denied",
    stageId: "stage-3",
    branch: "default",
    actorId: "masugate",
    kind: "decision",
    label: "Conflicting calendar request denied",
    description: "The protected Client launch review remains unchanged.",
    resourceSnapshot: protectedCalendar(),
    policy: {
      artifactId: "governed-calendar-v1",
      decision: "deny",
    },
    policyContext: {
      artifactId: "governed-calendar-v1",
      activeClause: "protected_work_overlap",
      stateReads: ["calendar.overlaps"],
    },
    operation: {
      operationId: "scenario-op-stage-3-calendar-conflict",
      status: "denied",
    },
    artifactRefs: ["record:scenario-op-stage-3-calendar-conflict"],
    announcement:
      "The conflicting calendar operation is denied. A fixed non-conflicting alternative is ready to choose.",
  },
  {
    id: "stage-3-calendar-alternative-request",
    stageId: "stage-3",
    branch: "calendar-alternative",
    actorId: "openclaw:travel-planner",
    kind: "request",
    label: "Try the non-conflicting alternative",
    description: "The Travel Planner requests 15:15–16:45 instead.",
    resourceSnapshot: protectedCalendar(),
    policyContext: {
      artifactId: "governed-calendar-v1",
      stateReads: [],
    },
    artifactRefs: ["request:stage-3-travel-block-alternative"],
    announcement: "The Travel Planner requested the 15:15 alternative.",
  },
  {
    id: "stage-3-calendar-alternative-state-read",
    stageId: "stage-3",
    branch: "calendar-alternative",
    actorId: "masugate",
    kind: "state-read",
    label: "Read calendar state for the alternative",
    description:
      "The protected event is unchanged and the 15:15–16:45 request does not overlap it.",
    resourceSnapshot: protectedCalendar(),
    policyContext: {
      artifactId: "governed-calendar-v1",
      activeClause: "protected_work_overlap",
      stateReads: ["calendar.overlaps"],
    },
    artifactRefs: ["policy:governed-calendar-v1"],
    announcement: "The calendar view reports no overlap for the alternative.",
  },
  {
    id: "stage-3-calendar-alternative-allowed",
    stageId: "stage-3",
    branch: "calendar-alternative",
    actorId: "masugate",
    kind: "decision",
    label: "Alternative calendar request allowed",
    description: "The later block does not overlap the protected event.",
    resourceSnapshot: protectedCalendar(),
    policy: {
      artifactId: "governed-calendar-v1",
      decision: "allow",
    },
    policyContext: {
      artifactId: "governed-calendar-v1",
      activeClause: "otherwise",
      stateReads: ["calendar.overlaps"],
    },
    artifactRefs: ["policy:governed-calendar-v1"],
    announcement: "The policy decision for the alternative is allow.",
  },
  {
    id: "stage-3-calendar-alternative-committed",
    stageId: "stage-3",
    branch: "calendar-alternative",
    actorId: "provider",
    kind: "effect",
    label: "Alternative calendar effect committed",
    description: "The travel block is added as a separate governed operation.",
    resourceSnapshot: calendarWithAlternative(),
    policy: {
      artifactId: "governed-calendar-v1",
      decision: "allow",
    },
    policyContext: {
      artifactId: "governed-calendar-v1",
      activeClause: "otherwise",
      stateReads: ["calendar.overlaps"],
    },
    operation: {
      operationId: "scenario-op-stage-3-calendar-alternative",
      status: "committed",
      effectResult: "Reference travel block created",
    },
    artifactRefs: ["record:scenario-op-stage-3-calendar-alternative"],
    announcement: "The 15:15 travel block committed.",
  },
  {
    id: "stage-3-workspace-baseline",
    stageId: "stage-3",
    branch: "default",
    actorId: "scenario",
    kind: "state-read",
    label: "Inspect the governed workspace",
    description: "Travel and protected work paths are separate.",
    resourceSnapshot: workspaceBaseline(),
    artifactRefs: ["scenario:workspace-baseline"],
    announcement: "The workspace shows separate travel and protected work paths.",
  },
  {
    id: "stage-3-itinerary-request",
    stageId: "stage-3",
    branch: "default",
    actorId: "openclaw:travel-planner",
    kind: "request",
    label: "Travel Planner creates an itinerary",
    description: "The new file is inside the declared travel workspace.",
    resourceSnapshot: workspaceBaseline(),
    policyContext: {
      artifactId: "governed-workspace-v1",
      stateReads: [],
    },
    artifactRefs: ["request:stage-3-create-itinerary"],
    announcement: "The Travel Planner requested a new itinerary file.",
  },
  {
    id: "stage-3-itinerary-state-read",
    stageId: "stage-3",
    branch: "default",
    actorId: "masugate",
    kind: "state-read",
    label: "Read the declared workspace boundary",
    description:
      "The workspace views confirm that the itinerary path is inside the Travel Planner's declared workspace.",
    resourceSnapshot: workspaceBaseline(),
    policyContext: {
      artifactId: "governed-workspace-v1",
      activeClause: "outside_agent_workspace",
      stateReads: ["workspace.path_allowed", "workspace.is_protected"],
    },
    artifactRefs: ["policy:governed-workspace-v1"],
    announcement: "The workspace views report that the itinerary path is allowed.",
  },
  {
    id: "stage-3-itinerary-allowed",
    stageId: "stage-3",
    branch: "default",
    actorId: "masugate",
    kind: "decision",
    label: "Itinerary creation allowed",
    description: "The requested path is inside the agent's declared workspace.",
    resourceSnapshot: workspaceBaseline(),
    policy: {
      artifactId: "governed-workspace-v1",
      decision: "allow",
    },
    policyContext: {
      artifactId: "governed-workspace-v1",
      activeClause: "otherwise",
      stateReads: ["workspace.path_allowed", "workspace.is_protected"],
    },
    artifactRefs: ["policy:governed-workspace-v1"],
    announcement: "The itinerary policy decision is allow.",
  },
  {
    id: "stage-3-itinerary-committed",
    stageId: "stage-3",
    branch: "default",
    actorId: "provider",
    kind: "effect",
    label: "Itinerary file committed",
    description: "The file effect completes as a separate governed operation.",
    resourceSnapshot: workspaceWithItinerary(),
    policy: {
      artifactId: "governed-workspace-v1",
      decision: "allow",
    },
    policyContext: {
      artifactId: "governed-workspace-v1",
      activeClause: "otherwise",
      stateReads: ["workspace.path_allowed", "workspace.is_protected"],
    },
    operation: {
      operationId: "scenario-op-stage-3-itinerary",
      status: "committed",
      effectResult: "Reference itinerary file created",
    },
    artifactRefs: ["record:scenario-op-stage-3-itinerary"],
    announcement: "The itinerary file committed in the travel workspace.",
  },
  {
    id: "stage-3-protected-brief-request",
    stageId: "stage-3",
    branch: "workspace-probe",
    actorId: "openclaw:travel-planner",
    kind: "request",
    label: "Travel Planner probes a protected work file",
    description: "The agent attempts to replace the protected project brief.",
    resourceSnapshot: workspaceWithItinerary(),
    policyContext: {
      artifactId: "governed-workspace-v1",
      stateReads: [],
    },
    artifactRefs: ["request:stage-3-replace-protected-brief"],
    announcement: "The Travel Planner attempted to replace a protected work file.",
  },
  {
    id: "stage-3-protected-brief-state-read",
    stageId: "stage-3",
    branch: "workspace-probe",
    actorId: "masugate",
    kind: "state-read",
    label: "Read the protected workspace boundary",
    description:
      "The workspace views report that the work brief is outside the Travel Planner's declared workspace and protected.",
    resourceSnapshot: workspaceWithItinerary(),
    policyContext: {
      artifactId: "governed-workspace-v1",
      activeClause: "outside_agent_workspace",
      stateReads: ["workspace.path_allowed", "workspace.is_protected"],
    },
    artifactRefs: ["policy:governed-workspace-v1"],
    announcement: "The workspace views report a protected cross-workspace path.",
  },
  {
    id: "stage-3-protected-brief-denied",
    stageId: "stage-3",
    branch: "workspace-probe",
    actorId: "masugate",
    kind: "decision",
    label: "Protected-file replacement denied",
    description: "No file effect occurs and the workspace remains unchanged.",
    resourceSnapshot: workspaceWithItinerary(),
    policy: {
      artifactId: "governed-workspace-v1",
      decision: "deny",
    },
    policyContext: {
      artifactId: "governed-workspace-v1",
      activeClause: "outside_agent_workspace",
      stateReads: ["workspace.path_allowed", "workspace.is_protected"],
    },
    operation: {
      operationId: "scenario-op-stage-3-protected-brief",
      status: "denied",
    },
    artifactRefs: ["record:scenario-op-stage-3-protected-brief"],
    announcement: "The protected-file operation is denied and no effect occurs.",
  },
] as const satisfies readonly ScenarioEvent[];

const sequences = [
  {
    id: "stage-1-governed",
    stageId: "stage-1",
    label: "One governed purchase",
    eventIds: [
      "stage-1-request",
      "stage-1-host-context",
      "stage-1-route-resolved",
      "stage-1-state-read",
      "stage-1-policy-allow",
      "stage-1-effect-committed",
      "stage-1-record-finalized",
    ],
  },
  {
    id: "stage-2-counterfactual",
    stageId: "stage-2",
    label: "Stateful checks without coordination",
    eventIds: [
      "stage-2-reset",
      "counterfactual-travel-check",
      "counterfactual-work-check",
      "counterfactual-reviews-approved",
      "counterfactual-travel-committed",
      "counterfactual-work-stale-effect",
      "counterfactual-rule-broken",
    ],
  },
  {
    id: "stage-2-approved",
    stageId: "stage-2",
    label: "Coordinated shared budget — approve",
    eventIds: [
      "stage-2-reset",
      "stage-2-travel-request",
      "stage-2-travel-state-read",
      "stage-2-travel-escalated",
      "stage-2-capacity-protected",
      "stage-2-work-request",
      "stage-2-work-state-read",
      "stage-2-work-denied",
      "stage-2-review-awaiting-choice",
      "stage-2-review-approved",
      "stage-2-travel-committed",
      "stage-2-approved-records",
    ],
  },
  {
    id: "stage-2-declined",
    stageId: "stage-2",
    label: "Coordinated shared budget — decline",
    eventIds: [
      "stage-2-reset",
      "stage-2-travel-request",
      "stage-2-travel-state-read",
      "stage-2-travel-escalated",
      "stage-2-capacity-protected",
      "stage-2-work-request",
      "stage-2-work-state-read",
      "stage-2-work-denied",
      "stage-2-review-awaiting-choice",
      "stage-2-review-declined",
      "stage-2-declined-record",
    ],
  },
  {
    id: "stage-3-default",
    stageId: "stage-3",
    label: "Calendar and workspace operations",
    eventIds: [
      "stage-3-reset",
      "stage-3-calendar-conflict-request",
      "stage-3-calendar-conflict-state-read",
      "stage-3-calendar-conflict-denied",
      "stage-3-calendar-alternative-request",
      "stage-3-calendar-alternative-state-read",
      "stage-3-calendar-alternative-allowed",
      "stage-3-calendar-alternative-committed",
      "stage-3-workspace-baseline",
      "stage-3-itinerary-request",
      "stage-3-itinerary-state-read",
      "stage-3-itinerary-allowed",
      "stage-3-itinerary-committed",
    ],
  },
  {
    id: "stage-3-workspace-probe",
    stageId: "stage-3",
    label: "Optional protected-file probe",
    eventIds: [
      "stage-3-workspace-baseline",
      "stage-3-itinerary-request",
      "stage-3-itinerary-state-read",
      "stage-3-itinerary-allowed",
      "stage-3-itinerary-committed",
      "stage-3-protected-brief-request",
      "stage-3-protected-brief-state-read",
      "stage-3-protected-brief-denied",
    ],
  },
] as const satisfies readonly ScenarioSequence[];

export const openClawScenario: ScenarioContract = {
  id: "openclaw-personal-operations",
  label: "Personal operations assistant",
  owner: {
    id: "demo-owner",
    label: "One individual or small project team",
  },
  policyOwner: {
    id: "operations-policy-owner",
    label: "Operations policy owner",
  },
  agents: [
    {
      id: "openclaw:travel-planner",
      displayName: "Travel Planner",
      shortName: "Travel Planner",
      host: "OpenClaw",
    },
    {
      id: "openclaw:work-manager",
      displayName: "Work Project Manager",
      shortName: "Work Manager",
      host: "OpenClaw",
    },
  ],
  routes: [
    {
      id: "purchase",
      label: "Governed purchase",
      releaseBinding: unavailable(
        "release-binding-unconfirmed",
        "The exact public-release route identifier remains release-gated.",
      ),
      provider: {
        owner: "deployment",
        label: "Business-budget provider",
        stateViews: ["budget.spent", "budget.limit", "budget.available"],
        governedEffectLabel: "Bounded purchase effect",
        releaseBinding: unavailable(
          "release-binding-unconfirmed",
          "The exact public-release purchase-provider contract remains release-gated.",
        ),
      },
      connector: {
        owner: "deployment",
        label: "Purchase connector",
        credentialBoundary:
          "Connector credentials and destination remain deployment-owned and outside model arguments.",
        releaseBinding: unavailable(
          "release-binding-unconfirmed",
          "The exact public-release purchase connector remains release-gated.",
        ),
      },
      execution: {
        owner: "deployment",
        boundary:
          "The configured purchase effect runs only through the declared governed route after an executable MasuGate result.",
        releasePosition: unavailable(
          "release-binding-unconfirmed",
          "The exact public-release purchase execution position remains release-gated.",
        ),
      },
    },
    {
      id: "calendar-create",
      label: "Governed calendar creation",
      releaseBinding: unavailable(
        "release-binding-unconfirmed",
        "The exact public-release route identifier remains release-gated.",
      ),
      provider: {
        owner: "deployment",
        label: "Calendar provider",
        stateViews: ["calendar.overlaps"],
        governedEffectLabel: "Bounded calendar-create effect",
        releaseBinding: unavailable(
          "release-binding-unconfirmed",
          "The exact public-release calendar-provider contract remains release-gated.",
        ),
      },
      connector: {
        owner: "deployment",
        label: "Calendar connector",
        credentialBoundary:
          "Connector credentials and calendar destination remain deployment-owned and outside model arguments.",
        releaseBinding: unavailable(
          "release-binding-unconfirmed",
          "The exact public-release calendar connector remains release-gated.",
        ),
      },
      execution: {
        owner: "deployment",
        boundary:
          "The configured calendar-create effect runs only through the declared governed route after an allow decision.",
        releasePosition: unavailable(
          "release-binding-unconfirmed",
          "The exact public-release calendar execution position remains release-gated.",
        ),
      },
    },
    {
      id: "file-change",
      label: "Governed workspace change",
      releaseBinding: unavailable(
        "release-binding-unconfirmed",
        "The exact public-release route identifier remains release-gated.",
      ),
      provider: {
        owner: "deployment",
        label: "Workspace provider",
        stateViews: ["workspace.path_allowed", "workspace.is_protected"],
        governedEffectLabel: "Bounded file-change effect",
        releaseBinding: unavailable(
          "release-binding-unconfirmed",
          "The exact public-release workspace-provider contract remains release-gated.",
        ),
      },
      connector: {
        owner: "deployment",
        label: "Workspace connector",
        credentialBoundary:
          "Connector authority and workspace root remain deployment-owned and outside model arguments.",
        releaseBinding: unavailable(
          "release-binding-unconfirmed",
          "The exact public-release workspace connector remains release-gated.",
        ),
      },
      execution: {
        owner: "deployment",
        boundary:
          "The configured file-change effect runs only through the declared governed route after an allow decision.",
        releasePosition: unavailable(
          "release-binding-unconfirmed",
          "The exact public-release workspace execution position remains release-gated.",
        ),
      },
    },
  ],
  budget: {
    category: "business",
    categoryLabel: "Business",
    categories: ["food", "entertainment", "utilities", "business"],
    currency: "USD",
    window: unavailable(
      "release-binding-unconfirmed",
      "Display the budget window only after the selected release confirms it.",
    ),
    capacity: usd(10_000),
    reviewAtOrAbove: usd(5_000),
  },
  calendar: {
    timezone: authoredCalendarFixture.timezone,
    dateAndOffset: available({
      date: authoredCalendarFixture.date,
      utcOffset: authoredCalendarFixture.utcOffset,
    }),
    protectedEvent: {
      id: "client-launch-review",
      label: "Client launch review",
      start: "14:00",
      end: "15:00",
      startAt: calendarTimestamp("14:00"),
      endAt: calendarTimestamp("15:00"),
    },
  },
  workspace: {
    tripId: "trip-104",
    projectId: "launch-review",
    travelRoot: "/shared/travel/trip-104/",
    protectedWorkRoot: "/shared/work/launch-review/",
  },
  requests,
  stages: [
    {
      id: "stage-1",
      productVersion: "1",
      title: "One governed purchase",
      requirement: "Apply a category budget, business purpose, review threshold, and retained record to one purchase.",
      baselineLabel: "$100 available in the Stage 1 version fixture",
      resetsPriorStage: false,
      policyArtifactIds: ["categorized-purchase-v1"],
      sequenceIds: ["stage-1-governed"],
    },
    {
      id: "stage-2",
      productVersion: "2",
      title: "One budget across agents",
      requirement: "Coordinate overlapping purchases against one owner-and-category budget and review process.",
      baselineLabel: "$100 available after a visible version fixture reset",
      resetsPriorStage: true,
      policyArtifactIds: ["categorized-purchase-v2"],
      sequenceIds: [
        "stage-2-counterfactual",
        "stage-2-approved",
        "stage-2-declined",
      ],
    },
    {
      id: "stage-3",
      productVersion: "3",
      title: "More governed operations",
      requirement: "Add calendar and workspace rules without rewriting the purchase policy.",
      baselineLabel: "Named calendar and workspace version fixtures",
      resetsPriorStage: true,
      policyArtifactIds: [
        "categorized-purchase-v2",
        "governed-calendar-v1",
        "governed-workspace-v1",
      ],
      sequenceIds: ["stage-3-default", "stage-3-workspace-probe"],
    },
  ],
  events,
  sequences,
};

export function getScenarioEvent(eventId: string): ScenarioEvent {
  const event = openClawScenario.events.find(({ id }) => id === eventId);

  if (!event) {
    throw new Error(`Unknown scenario event: ${eventId}`);
  }

  return event;
}

export function selectScenarioSequence(
  sequenceId: ScenarioSequenceId,
): readonly ScenarioEvent[] {
  const sequence = openClawScenario.sequences.find(({ id }) => id === sequenceId);

  if (!sequence) {
    throw new Error(`Unknown scenario sequence: ${sequenceId}`);
  }

  return sequence.eventIds.map(getScenarioEvent);
}

function isPurchaseRequest(request: ScenarioRequest): request is PurchaseRequest {
  return request.kind === "purchase";
}

function isCalendarRequest(request: ScenarioRequest): request is CalendarRequest {
  return request.kind === "calendar-create";
}

function isValidIsoDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;

  const parsed = new Date(`${date}T00:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === date;
}

function actualUtcOffset(
  timestamp: string,
  timezone: "America/New_York",
): string | undefined {
  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.valueOf())) return undefined;

  const offsetName = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    timeZoneName: "longOffset",
    hour: "2-digit",
  })
    .formatToParts(parsed)
    .find(({ type }) => type === "timeZoneName")?.value;

  if (offsetName === "GMT") return "+00:00";
  return offsetName?.replace(/^GMT/, "");
}

export function selectStageTwoBudgetComparison() {
  const stageTwoRequests = openClawScenario.requests.filter(
    (request): request is PurchaseRequest =>
      isPurchaseRequest(request) && request.stageId === "stage-2",
  );

  return {
    owner: openClawScenario.owner,
    category: openClawScenario.budget.categoryLabel,
    capacity: openClawScenario.budget.capacity,
    reviewAtOrAbove: openClawScenario.budget.reviewAtOrAbove,
    requests: stageTwoRequests,
    counterfactualEvents: selectScenarioSequence("stage-2-counterfactual"),
    governedEvents: selectScenarioSequence("stage-2-approved"),
    declineEvents: selectScenarioSequence("stage-2-declined"),
  } as const;
}

const homepageBudgetEventIds = {
  independent: [
    "counterfactual-travel-check",
    "counterfactual-work-check",
    "counterfactual-reviews-approved",
    "counterfactual-travel-committed",
    "counterfactual-work-stale-effect",
    "counterfactual-rule-broken",
  ],
  governed: [
    "stage-2-travel-request",
    "stage-2-travel-escalated",
    "stage-2-capacity-protected",
    "stage-2-work-request",
    "stage-2-work-denied",
    "stage-2-review-approved",
    "stage-2-travel-committed",
  ],
} as const;

/**
 * A deliberately compact Home projection of the Stage 2 fixture. The full
 * sequence remains available to Demo; Home keeps only the events needed to
 * explain the concurrency failure and the coordinated governed path.
 */
export function selectHomepageBudgetComparison() {
  const comparison = selectStageTwoBudgetComparison();

  return {
    ...comparison,
    paths: [
      {
        id: "independent",
        label: "Without coordination",
        heading: "Two approvals use one old observation.",
        outcome:
          "Each decision looked reasonable alone. Their combined result broke the rule.",
        events: homepageBudgetEventIds.independent.map(getScenarioEvent),
      },
      {
        id: "governed",
        label: "With MasuGate",
        heading: "The later decision sees protected capacity.",
        outcome:
          "The later decision reflects the state protected by the earlier operation.",
        events: homepageBudgetEventIds.governed.map(getScenarioEvent),
      },
    ],
  } as const;
}

export function validateScenario(
  scenario: ScenarioContract = openClawScenario,
): readonly string[] {
  const errors: string[] = [];
  const eventIds = new Set<string>();
  const requestIds = new Set<string>();
  const routeIds = new Set<ScenarioRouteId>();
  const sequenceIds = new Set<string>();

  for (const route of scenario.routes) {
    if (routeIds.has(route.id)) {
      errors.push(`Duplicate scenario route id: ${route.id}`);
    }
    routeIds.add(route.id);

    if (
      route.provider.owner !== "deployment" ||
      route.connector.owner !== "deployment" ||
      route.execution.owner !== "deployment"
    ) {
      errors.push(`Scenario route ownership must remain deployment-owned: ${route.id}`);
    }

    if (
      !route.provider.label.trim() ||
      route.provider.stateViews.length === 0 ||
      !route.provider.governedEffectLabel.trim() ||
      !route.connector.label.trim() ||
      !route.connector.credentialBoundary.trim() ||
      !route.execution.boundary.trim()
    ) {
      errors.push(`Scenario route ownership metadata is incomplete: ${route.id}`);
    }

    if (
      new Set(route.provider.stateViews).size !==
      route.provider.stateViews.length
    ) {
      errors.push(`Scenario route repeats a provider state view: ${route.id}`);
    }
  }

  for (const request of scenario.requests) {
    if (requestIds.has(request.id)) {
      errors.push(`Duplicate scenario request id: ${request.id}`);
    }
    requestIds.add(request.id);

    if (!routeIds.has(request.routeId)) {
      errors.push(`Scenario request ${request.id} references a missing route: ${request.routeId}`);
    }
  }

  for (const event of scenario.events) {
    if (eventIds.has(event.id)) {
      errors.push(`Duplicate scenario event id: ${event.id}`);
    }
    eventIds.add(event.id);

    const stage = scenario.stages.find(({ id }) => id === event.stageId);
    const policyRef = event.artifactRefs
      .find((reference) => reference.startsWith("policy:"))
      ?.slice("policy:".length) as PolicyArtifactId | undefined;

    if (
      event.policyContext &&
      !stage?.policyArtifactIds.includes(event.policyContext.artifactId)
    ) {
      errors.push(
        `Scenario event ${event.id} links a policy that is not active in ${event.stageId}: ${event.policyContext.artifactId}`,
      );
    }

    if (event.policy && !event.policyContext) {
      errors.push(`Scenario policy result is missing policy context: ${event.id}`);
    }

    if (
      event.policy &&
      event.policyContext &&
      event.policy.artifactId !== event.policyContext.artifactId
    ) {
      errors.push(`Scenario policy result and context disagree: ${event.id}`);
    }

    if (policyRef && event.policyContext?.artifactId !== policyRef) {
      errors.push(`Scenario policy artifact reference and context disagree: ${event.id}`);
    }

    if (
      event.kind === "state-read" &&
      policyRef &&
      (!event.policyContext?.activeClause ||
        event.policyContext.stateReads.length === 0)
    ) {
      errors.push(`Scenario policy state read lacks a clause or registered view: ${event.id}`);
    }

    if (event.policy && !event.policyContext?.activeClause) {
      errors.push(`Scenario policy result lacks an active clause: ${event.id}`);
    }

    if (
      event.policyContext &&
      new Set(event.policyContext.stateReads).size !==
        event.policyContext.stateReads.length
    ) {
      errors.push(`Scenario policy context repeats a state read: ${event.id}`);
    }

    if (event.resourceSnapshot.kind === "budget") {
      const snapshot = event.resourceSnapshot;
      const representedTotal =
        snapshot.committed.minorUnits +
        snapshot.protected.minorUnits +
        snapshot.available.minorUnits;

      if (representedTotal !== snapshot.capacity.minorUnits) {
        errors.push(`Budget snapshot does not balance at event: ${event.id}`);
      }
    }
  }

  for (const sequence of scenario.sequences) {
    if (sequenceIds.has(sequence.id)) {
      errors.push(`Duplicate scenario sequence id: ${sequence.id}`);
    }
    sequenceIds.add(sequence.id);

    for (const eventId of sequence.eventIds) {
      if (!eventIds.has(eventId)) {
        errors.push(`Sequence ${sequence.id} references missing event: ${eventId}`);
      }
    }
  }

  for (const stage of scenario.stages) {
    for (const sequenceId of stage.sequenceIds) {
      if (!sequenceIds.has(sequenceId)) {
        errors.push(`Stage ${stage.id} references missing sequence: ${sequenceId}`);
      }
    }
  }

  const stageTwoPurchases = scenario.requests.filter(
    (request): request is PurchaseRequest =>
      isPurchaseRequest(request) && request.stageId === "stage-2",
  );
  const expectedStageTwoRequestIds = new Set([
    "stage-2-travel-hotel-deposit",
    "stage-2-hosted-testing-capacity",
  ]);

  if (
    stageTwoPurchases.length !== 2 ||
    stageTwoPurchases.some(
      (request) =>
        !expectedStageTwoRequestIds.has(request.id) ||
        request.amount.minorUnits !== 6_000,
    )
  ) {
    errors.push(
      "Stage 2 must contain the named travel and work requests at $60 each.",
    );
  }

  if (
    stageTwoPurchases.some(
      (request) =>
        request.amount.minorUnits < scenario.budget.reviewAtOrAbove.minorUnits,
    )
  ) {
    errors.push("Every Stage 2 purchase must cross the review threshold.");
  }

  const calendarDateAndOffset = scenario.calendar.dateAndOffset;

  if (calendarDateAndOffset.state !== "available") {
    errors.push("Stage 3 must provide one authored calendar date and UTC offset.");
    return errors;
  }

  const { date, utcOffset } = calendarDateAndOffset.value;
  const validOffset = /^[+-](?:0\d|1[0-4]):[0-5]\d$/.test(utcOffset);

  if (!isValidIsoDate(date)) {
    errors.push(`Stage 3 calendar date is not a valid ISO date: ${date}`);
  }

  if (!validOffset) {
    errors.push(`Stage 3 calendar UTC offset is invalid: ${utcOffset}`);
  } else {
    const referenceTimestamp = `${date}T12:00:00${utcOffset}`;
    const expectedOffset = actualUtcOffset(
      referenceTimestamp,
      scenario.calendar.timezone,
    );

    if (expectedOffset !== utcOffset) {
      errors.push(
        `Stage 3 calendar UTC offset ${utcOffset} does not match ${scenario.calendar.timezone} on ${date}; expected ${expectedOffset ?? "a valid IANA offset"}.`,
      );
    }
  }

  const protectedEvent = scenario.calendar.protectedEvent;
  const expectedProtectedStart = `${date}T${protectedEvent.start}:00${utcOffset}`;
  const expectedProtectedEnd = `${date}T${protectedEvent.end}:00${utcOffset}`;

  if (
    protectedEvent.startAt !== expectedProtectedStart ||
    protectedEvent.endAt !== expectedProtectedEnd
  ) {
    errors.push("The protected Stage 3 event must use the authored date and UTC offset.");
  }

  const calendarRequests = scenario.requests.filter(isCalendarRequest);
  if (calendarRequests.length !== 2) {
    errors.push("Stage 3 must contain the conflicting and alternative calendar requests.");
  }

  for (const request of calendarRequests) {
    const expectedStart = `${date}T${request.start}:00${utcOffset}`;
    const expectedEnd = `${date}T${request.end}:00${utcOffset}`;

    if (request.startAt !== expectedStart || request.endAt !== expectedEnd) {
      errors.push(
        `Calendar request ${request.id} must use the authored date and UTC offset.`,
      );
    }
  }

  for (const event of scenario.events) {
    const snapshot = event.resourceSnapshot;
    if (snapshot.kind !== "calendar") continue;

    if (
      snapshot.timezone !== scenario.calendar.timezone ||
      snapshot.date !== date ||
      snapshot.utcOffset !== utcOffset
    ) {
      errors.push(`Calendar snapshot does not match the fixture at event: ${event.id}`);
    }

    for (const entry of snapshot.entries) {
      const expectedStart = `${date}T${entry.start}:00${utcOffset}`;
      const expectedEnd = `${date}T${entry.end}:00${utcOffset}`;

      if (entry.startAt !== expectedStart || entry.endAt !== expectedEnd) {
        errors.push(
          `Calendar snapshot entry ${entry.id} is ambiguous at event: ${event.id}`,
        );
      }
    }
  }

  return errors;
}

export const scenarioValidationErrors = validateScenario();
