export type IsoDate = `${number}-${number}-${number}`;

export type UnavailableReason =
  | "canonical-source-unconfirmed"
  | "public-release-unavailable"
  | "release-binding-unconfirmed"
  | "verification-pending"
  | "public-evidence-unavailable"
  | "install-command-unavailable"
  | "discussions-disabled"
  | "social-image-unavailable";

export type Available<T> = Readonly<{
  state: "available";
  value: T;
}>;

export type Unavailable = Readonly<{
  state: "unavailable";
  reason: UnavailableReason;
  note: string;
}>;

export type Availability<T> = Available<T> | Unavailable;

export function available<const T>(value: T): Available<T> {
  return { state: "available", value };
}

export function unavailable(
  reason: UnavailableReason,
  note: string,
): Unavailable {
  return { state: "unavailable", reason, note };
}

export function isAvailable<T>(
  availability: Availability<T>,
): availability is Available<T> {
  return availability.state === "available";
}

export type ReleaseState = "released" | "source-public" | "unreleased";
export type EvidenceStatus = "reference" | "verified";
export type Maturity = "experimental" | "planned";
export type PathRequirement = "required" | "optional";
export type PresentationOrigin = "simulated" | "recorded";

export type PolicyDecision = "allow" | "deny" | "escalate";
export type OperationStatus = "pending" | "committed" | "denied";
export type HumanResolution = "allow-once" | "decline";

export type Money = Readonly<{
  currency: "USD";
  minorUnits: number;
}>;

export function usd(minorUnits: number): Money {
  return { currency: "USD", minorUnits };
}

export type ReferenceEvidence = Readonly<{
  status: "reference";
  sourceKind:
    | "planning"
    | "authored-fixture"
    | "candidate-manifest"
    | "research-paper";
  locator: string;
  note: string;
}>;

export type VerifiedEvidence = Readonly<{
  status: "verified";
  sourceKind: "release";
  href: string;
  immutableRevision: string;
  gate: string;
  verifiedAt: IsoDate;
}>;

export type Evidence = ReferenceEvidence | VerifiedEvidence;

export type OperationProjection =
  | Readonly<{
      status: "pending";
      humanResolution?: "allow-once";
      effectResult?: never;
    }>
  | Readonly<{
      status: "denied";
      humanResolution?: "decline";
      effectResult?: never;
    }>
  | Readonly<{
      status: "committed";
      humanResolution?: "allow-once";
      effectResult: string;
    }>;

export type ScenarioStageId = "stage-1" | "stage-2" | "stage-3";
export type ScenarioAgentId =
  | "openclaw:travel-planner"
  | "openclaw:work-manager";

export type PolicyArtifactId =
  | "categorized-purchase-v1"
  | "categorized-purchase-v2"
  | "governed-calendar-v1"
  | "governed-workspace-v1";

export type IntegrationProfileId =
  | "openclaw"
  | "langchain-langgraph"
  | "microsoft-agent-framework"
  | "crewai";

export type ConformanceCheckId =
  | "trusted-host-context"
  | "stable-retry-identity"
  | "committed-handling"
  | "denied-handling"
  | "pending-handling"
  | "original-tool-bypass-prevention"
  | "policy-revision-linkage"
  | "canonical-record-fields";
