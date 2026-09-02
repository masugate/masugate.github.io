"use client";

import {
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import type {
  BudgetSnapshot,
  CalendarSnapshot,
  ResourceSnapshot,
  WorkspaceSnapshot,
} from "../data/scenario";
import type {
  DemoClientArtifact,
  DemoClientEvent,
  DemoClientModel,
  DemoClientPolicy,
  DemoOperationDefinition,
} from "../data/demo";
import type { Money, PolicyDecision } from "../data/contracts";
import {
  createDemoState,
  demoChoicePoints,
  demoInspectorIds,
  demoReducer,
  initialDemoState,
} from "./demoMachine.mjs";
import { HighlightedCode } from "./HighlightedCode";
import { useReducedMotion } from "./motion";
import styles from "./DemoExperience.module.css";

type DemoStage = DemoClientModel["stages"][number];
type DemoInspectorId = (typeof demoInspectorIds)[number];
type DemoMachineState = ReturnType<typeof createDemoState>;

const inspectorLabels: Record<DemoInspectorId, string> = {
  policy: "Policy",
  configuration: "OpenClaw configuration",
  trace: "Runtime trace",
  record: "Decision record",
};

const playbackDelayMs = 1_550;

function inspectorArtifactKind(inspectorId: DemoInspectorId) {
  if (inspectorId === "configuration") return "configuration";
  if (inspectorId === "trace") return "runtime-trace";
  if (inspectorId === "record") return "decision-record";
  return "policy";
}

function formatMoney(money: Money): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: money.currency,
    maximumFractionDigits: 0,
  }).format(money.minorUnits / 100);
}

function titleCase(value: string): string {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function artifactStatus(artifact?: DemoClientArtifact) {
  return {
    presentation: titleCase(artifact?.presentationOrigin ?? "simulated"),
    evidence: titleCase(artifact?.evidence.status ?? "reference"),
  };
}

function artifactReleaseRevision(artifact?: DemoClientArtifact): string {
  return artifact?.release.immutableRevision.state === "available"
    ? artifact.release.immutableRevision.value
    : "Pending release alignment";
}

function policyReleaseRevision(policy: DemoClientPolicy): string {
  if (policy.releaseRevision.state !== "available") {
    return "Pending release alignment";
  }

  return `${policy.releaseRevision.value.releaseId} · ${policy.releaseRevision.value.immutablePolicyId}`;
}

function actorLabel(model: DemoClientModel, actorId: DemoClientEvent["actorId"]) {
  const agent = model.scenario.agents.find(({ id }) => id === actorId);
  if (agent) return agent.shortName;

  const labels: Partial<Record<DemoClientEvent["actorId"], string>> = {
    user: "User",
    reviewer: "Human reviewer",
    masugate: "MasuGate",
    provider: "Configured provider",
    scenario: "Scenario fixture",
    "detached-check": "Detached comparison",
  };

  return labels[actorId] ?? titleCase(actorId);
}

function credentialEnvironmentLabel(
  agentId: DemoClientModel["scenario"]["agents"][number]["id"],
): string {
  return agentId === "openclaw:travel-planner"
    ? "MASUGATE_OPENCLAW_TRAVEL_PLANNER_CREDENTIAL"
    : "MASUGATE_OPENCLAW_WORK_MANAGER_CREDENTIAL";
}

function activeTimeline(
  stage: DemoStage,
  state: DemoMachineState,
): readonly DemoClientEvent[] {
  if (stage.id === "stage-1") return stage.timelines.primary;

  if (stage.id === "stage-2") {
    if (state.stage2Review === "declined") {
      return [
        ...stage.timelines.primary.slice(0, demoChoicePoints.stage2Review + 1),
        ...stage.timelines.alternate,
      ];
    }
    if (state.stage2Review === "approved") return stage.timelines.primary;
    return stage.timelines.primary.slice(0, demoChoicePoints.stage2Review + 1);
  }

  const primary =
    state.stage3Calendar === "alternative"
      ? stage.timelines.primary
      : stage.timelines.primary.slice(0, demoChoicePoints.stage3Alternative + 1);

  return state.stage3Probe === "denied"
    ? [...primary, ...stage.timelines.probe]
    : primary;
}

function eventAnnouncement(
  stage: DemoStage,
  events: readonly DemoClientEvent[],
  index: number,
): string {
  const event = events[index];
  if (!event) return `${stage.title}. Named version fixture selected.`;

  return `${stage.title}. Step ${index + 1} of ${events.length}. ${event.announcement}`;
}

interface ResourceLedger {
  budget?: BudgetSnapshot;
  calendar?: CalendarSnapshot;
  workspace?: WorkspaceSnapshot;
}

function setResource(ledger: ResourceLedger, snapshot: ResourceSnapshot) {
  if (snapshot.kind === "budget") ledger.budget = snapshot;
  if (snapshot.kind === "calendar") ledger.calendar = snapshot;
  if (snapshot.kind === "workspace") ledger.workspace = snapshot;
}

function resourceLedger(
  stage: DemoStage,
  events: readonly DemoClientEvent[],
  eventIndex: number,
): ResourceLedger {
  const ledger: ResourceLedger = {};

  // Establish one named baseline for every resource family in the stage. This
  // keeps Stage 3's calendar visible after the workspace sequence begins.
  for (const event of stage.timelines.primary) {
    if (event.resourceSnapshot.kind === "budget" && !ledger.budget) {
      ledger.budget = event.resourceSnapshot;
    }
    if (event.resourceSnapshot.kind === "calendar" && !ledger.calendar) {
      ledger.calendar = event.resourceSnapshot;
    }
    if (event.resourceSnapshot.kind === "workspace" && !ledger.workspace) {
      ledger.workspace = event.resourceSnapshot;
    }
  }

  for (const event of events.slice(0, eventIndex + 1)) {
    setResource(ledger, event.resourceSnapshot);
  }

  return ledger;
}

interface OperationHistory {
  operation: NonNullable<DemoClientEvent["operation"]>;
  event: DemoClientEvent;
  policyDecision?: PolicyDecision;
}

function operationHistories(events: readonly DemoClientEvent[]): OperationHistory[] {
  const histories = new Map<string, OperationHistory>();

  for (const event of events) {
    if (!event.operation) continue;
    const prior = histories.get(event.operation.operationId);
    histories.set(event.operation.operationId, {
      operation: event.operation,
      event,
      policyDecision: event.policy?.decision ?? prior?.policyDecision,
    });
  }

  return [...histories.values()];
}

function operationDefinition(
  model: DemoClientModel,
  operationId: string,
): DemoOperationDefinition | undefined {
  return model.operations.find((operation) => operation.operationId === operationId);
}

function policyForOperation(
  stage: DemoStage,
  definition: DemoOperationDefinition | undefined,
): DemoClientPolicy | undefined {
  return definition
    ? stage.policies.find(({ id }) => id === definition.policyArtifactId)
    : undefined;
}

function policyRevisionLabel(policy: DemoClientPolicy): string {
  if (policy.source.form !== "diff") return policy.scenarioRevision;
  const base = policy.source.baseArtifactId.replace(/-v(\d+)$/, "@v$1");
  const next = policy.scenarioRevision.split("@")[1];
  return `${base} → ${next ? `@${next}` : policy.scenarioRevision}`;
}

function BudgetResource({ snapshot }: { snapshot: BudgetSnapshot }) {
  const capacity = Math.max(snapshot.capacity.minorUnits, 1);
  const segments = [
    {
      id: "committed",
      label: "Committed spend",
      value: snapshot.committed,
      className: styles.budgetCommitted,
    },
    {
      id: "protected",
      label: "Protected pending capacity",
      value: snapshot.protected,
      className: styles.budgetProtected,
    },
    {
      id: "available",
      label: "Available capacity",
      value: snapshot.available,
      className: styles.budgetAvailable,
    },
  ] as const;

  return (
    <article className={styles.resourceCard}>
      <header className={styles.resourceHeader}>
        <div>
          <span>Governed resource</span>
          <h4>Business budget</h4>
        </div>
        <strong>{formatMoney(snapshot.available)} available</strong>
      </header>
      <div
        aria-label={`${formatMoney(snapshot.committed)} committed, ${formatMoney(snapshot.protected)} protected pending, and ${formatMoney(snapshot.available)} available out of ${formatMoney(snapshot.capacity)}`}
        className={styles.budgetBar}
        role="img"
      >
        {segments.map((segment) => (
          <span
            className={segment.className}
            key={segment.id}
            style={{ width: `${(segment.value.minorUnits / capacity) * 100}%` }}
          />
        ))}
      </div>
      <dl className={styles.resourceFacts}>
        {segments.map((segment) => (
          <div key={segment.id}>
            <dt>
              <i className={segment.className} aria-hidden="true" />
              {segment.label}
            </dt>
            <dd>{formatMoney(segment.value)}</dd>
          </div>
        ))}
        <div>
          <dt>Fixture capacity</dt>
          <dd>{formatMoney(snapshot.capacity)}</dd>
        </div>
      </dl>
    </article>
  );
}

function CalendarResource({
  snapshot,
  model,
  currentEvent,
}: {
  snapshot: CalendarSnapshot;
  model: DemoClientModel;
  currentEvent?: DemoClientEvent;
}) {
  const calendarDate = model.scenario.calendar.dateAndOffset;
  const conflictVisible =
    currentEvent?.id === "stage-3-calendar-conflict-request" ||
    currentEvent?.id === "stage-3-calendar-conflict-state-read" ||
    currentEvent?.id === "stage-3-calendar-conflict-denied";
  const alternativeVisible =
    currentEvent?.id === "stage-3-calendar-alternative-request" ||
    currentEvent?.id === "stage-3-calendar-alternative-state-read" ||
    currentEvent?.id === "stage-3-calendar-alternative-allowed";
  const proposal = conflictVisible
    ? operationDefinition(model, "scenario-op-stage-3-calendar-conflict")
    : alternativeVisible
      ? operationDefinition(model, "scenario-op-stage-3-calendar-alternative")
      : undefined;
  const proposalStart = proposal?.arguments.find(
    ({ label }) => label === "Start",
  )?.value;
  const proposalEnd = proposal?.arguments.find(
    ({ label }) => label === "End",
  )?.value;

  return (
    <article className={styles.resourceCard}>
      <header className={styles.resourceHeader}>
        <div>
          <span>Governed resource</span>
          <h4>Calendar fixture</h4>
        </div>
        <strong>{snapshot.timezone}</strong>
      </header>
      <p className={styles.fixtureNote}>
        {calendarDate.state === "available"
          ? `${calendarDate.value.date} · ${calendarDate.value.utcOffset}`
          : "Wall-clock fixture; fixed date and UTC offset remain release-alignment inputs."}
      </p>
      <ol className={styles.calendarList} role="list">
        {snapshot.entries.map((entry) => (
          <li key={entry.id}>
            <span>{entry.start}–{entry.end}</span>
            <div>
              <strong>{entry.label}</strong>
              <small>{entry.protected ? "Protected work" : "Committed travel block"}</small>
            </div>
          </li>
        ))}
      </ol>
      {proposal ? (
        <div className={styles.calendarProposal}>
          <span>
            {currentEvent?.operation?.status === "denied"
              ? "Denied proposed block · not added"
              : currentEvent?.policy?.decision === "allow"
                ? "Allowed proposed block · effect not yet committed"
                : "Proposed calendar block"}
          </span>
          <strong>{proposalStart}–{proposalEnd}</strong>
          <small>{proposal.actionLabel}</small>
        </div>
      ) : null}
    </article>
  );
}

function WorkspaceResource({ snapshot }: { snapshot: WorkspaceSnapshot }) {
  return (
    <article className={styles.resourceCard}>
      <header className={styles.resourceHeader}>
        <div>
          <span>Governed resource</span>
          <h4>Workspace fixture</h4>
        </div>
        <strong>{snapshot.entries.length} entries</strong>
      </header>
      <ul className={styles.workspaceList} role="list">
        {snapshot.entries.map((entry) => (
          <li key={entry.path}>
            <span>{entry.kind === "directory" ? "Directory" : "File"}</span>
            <code>{entry.path}</code>
            <small>
              {entry.protection === "agent-owned"
                ? "Travel Planner workspace"
                : "Protected work path"}
            </small>
          </li>
        ))}
      </ul>
    </article>
  );
}

function ResourceRegion({
  ledger,
  model,
  currentEvent,
}: {
  ledger: ResourceLedger;
  model: DemoClientModel;
  currentEvent?: DemoClientEvent;
}) {
  return (
    <section className={styles.resourceRegion} aria-labelledby="demo-resource-title">
      <div className={styles.regionHeading}>
        <span>02</span>
        <h3 id="demo-resource-title">Governed resource</h3>
      </div>
      <div className={styles.resourceStack}>
        {ledger.budget ? <BudgetResource snapshot={ledger.budget} /> : null}
        {ledger.calendar ? (
          <CalendarResource
            currentEvent={currentEvent}
            model={model}
            snapshot={ledger.calendar}
          />
        ) : null}
        {ledger.workspace ? <WorkspaceResource snapshot={ledger.workspace} /> : null}
      </div>
    </section>
  );
}

function ConversationRegion({
  stage,
  events,
  eventIndex,
  model,
}: {
  stage: DemoStage;
  events: readonly DemoClientEvent[];
  eventIndex: number;
  model: DemoClientModel;
}) {
  const visibleEvents = events.slice(0, eventIndex + 1);
  const visibleWindowStart = Math.max(visibleEvents.length - 3, 0);
  const recentEvents = visibleEvents.slice(visibleWindowStart);
  const stageAgents = model.scenario.agents.filter(({ id }) =>
    new Set<string>(stage.presentation.configuredAgentIds).has(id),
  );

  return (
    <section
      className={styles.conversationRegion}
      aria-labelledby="demo-conversation-title"
    >
      <div className={styles.regionHeading}>
        <span>01</span>
        <h3 id="demo-conversation-title">Conversation and agent lanes</h3>
      </div>

      <div
        className={styles.agentLanes}
        aria-label="OpenClaw agent lanes"
        role="group"
      >
        {stageAgents.map((agent) => {
          const active = new Set<string>(stage.presentation.activeAgentIds).has(agent.id);
          return (
            <article className={active ? styles.agentActive : styles.agentIdle} key={agent.id}>
              <span>{active ? "Active in this stage" : "Available in OpenClaw"}</span>
              <strong>{agent.displayName}</strong>
              <code>{agent.id}</code>
            </article>
          );
        })}
      </div>

      <ol className={styles.conversationList} role="list">
        <li className={styles.userMessage}>
          <span>User requirement</span>
          <p>{stage.presentation.userIntent}</p>
        </li>
        <li className={styles.agentMessage}>
          <span>OpenClaw agent</span>
          <p>{stage.presentation.agentResponse}</p>
        </li>
        {visibleWindowStart > 0 ? (
          <li className={styles.collapsedMessage}>
            <span>Earlier deterministic events</span>
            <strong>{visibleWindowStart} prior events remain in the static transcript.</strong>
          </li>
        ) : null}
        {recentEvents.map((event, offset) => {
          const index = visibleWindowStart + offset;
          return (
          <li
            aria-current={index === eventIndex ? "step" : undefined}
            className={index === eventIndex ? styles.eventCurrent : styles.eventComplete}
            key={event.id}
          >
            <span>{actorLabel(model, event.actorId)} · {titleCase(event.kind)}</span>
            <strong>{event.label}</strong>
            <p>{event.description}</p>
          </li>
          );
        })}
        {visibleEvents.length === 0 ? (
          <li className={styles.baselineMessage}>
            <span>Named version fixture</span>
            <strong>{stage.baselineLabel}</strong>
            <p>Select Start walkthrough to begin the deterministic sequence.</p>
          </li>
        ) : null}
      </ol>
    </section>
  );
}

function ChoiceRegion({
  stage,
  state,
  eventIndex,
  primaryLength,
  model,
  dispatch,
}: {
  stage: DemoStage;
  state: DemoMachineState;
  eventIndex: number;
  primaryLength: number;
  model: DemoClientModel;
  dispatch: (action: Record<string, unknown>) => void;
}) {
  const travelOperation = operationDefinition(
    model,
    "scenario-op-stage-2-travel",
  );
  const alternativeOperation = operationDefinition(
    model,
    "scenario-op-stage-3-calendar-alternative",
  );
  const protectedFileOperation = operationDefinition(
    model,
    "scenario-op-stage-3-protected-brief",
  );
  const travelAmount = travelOperation?.arguments.find(
    ({ label }) => label === "Amount",
  )?.value;
  const alternativeStart = alternativeOperation?.arguments.find(
    ({ label }) => label === "Start",
  )?.value;
  const alternativeEnd = alternativeOperation?.arguments.find(
    ({ label }) => label === "End",
  )?.value;
  const protectedPath = protectedFileOperation?.arguments.find(
    ({ label }) => label === "Path",
  )?.value;

  if (stage.id === "stage-2" && eventIndex >= demoChoicePoints.stage2Review) {
    const reviewUnresolved = state.stage2Review === "unresolved";
    const reviewSummary = reviewUnresolved
      ? `The ${travelAmount} capacity remains protected. The original policy decision is Escalate; your choice resolves this operation only.`
      : state.stage2Review === "approved"
        ? "Approve is the selected branch. The event and resource views show whether the exact travel operation is still pending or has committed. Choose Decline to replace its downstream snapshots."
        : "Decline is the selected branch. No travel effect or receipt exists, and the resource view shows released capacity. Choose Approve to replace its downstream snapshots.";

    return (
      <fieldset className={styles.choiceCard}>
        <legend>
          {reviewUnresolved
            ? "Resolve the exact pending travel operation"
            : "Explore the human-review branch"}
        </legend>
        <p>{reviewSummary}</p>
        <div className={styles.choiceActions}>
          <button
            aria-pressed={state.stage2Review === "approved"}
            className={styles.choiceApprove}
            onClick={() => {
              if (state.stage2Review === "approved") {
                dispatch({
                  type: "announce",
                  announcement: "Approve is already the selected review branch.",
                });
                return;
              }
              dispatch({
                type: "stage2-choice",
                choice: "approved",
                announcement:
                  "The reviewer approved the exact pending travel operation once. Playback remains paused.",
              });
            }}
            type="button"
          >
            Approve
            <small>Allow this operation once</small>
          </button>
          <button
            aria-pressed={state.stage2Review === "declined"}
            className={styles.choiceDecline}
            onClick={() => {
              if (state.stage2Review === "declined") {
                dispatch({
                  type: "announce",
                  announcement: "Decline is already the selected review branch.",
                });
                return;
              }
              dispatch({
                type: "stage2-choice",
                choice: "declined",
                announcement:
                  "The reviewer declined the travel operation. Playback remains paused and no effect has run.",
              });
            }}
            type="button"
          >
            Decline
            <small>Release protected capacity</small>
          </button>
        </div>
      </fieldset>
    );
  }

  if (stage.id === "stage-3" && eventIndex >= demoChoicePoints.stage3Alternative) {
    const alternativeSelected = state.stage3Calendar === "alternative";
    const probeAvailable = alternativeSelected && eventIndex >= primaryLength - 1;

    return (
      <div className={styles.choiceStack}>
        <fieldset className={styles.choiceCard}>
          <legend>OpenClaw presents a fixed non-conflicting option</legend>
          <p>
            {alternativeSelected
              ? `The ${alternativeStart}–${alternativeEnd} alternative is selected. Its evaluation, effect, and record advance as separate deterministic events.`
              : `The fixture proposes ${alternativeStart}–${alternativeEnd}. MasuGate has not optimized the schedule; it will govern the selected create request.`}
          </p>
          <button
            aria-disabled={alternativeSelected}
            aria-pressed={alternativeSelected}
            className={styles.choiceApprove}
            onClick={() => {
              if (alternativeSelected) {
                dispatch({
                  type: "announce",
                  announcement: "The fixed calendar alternative is already selected.",
                });
                return;
              }
              dispatch({
                type: "stage3-alternative",
                announcement: `The ${alternativeStart} calendar alternative is selected. Playback remains paused before evaluation.`,
              });
            }}
            type="button"
          >
            {alternativeSelected ? "Alternative selected" : "Try the alternative"}
            <small>{alternativeStart}–{alternativeEnd} · {model.scenario.calendar.timezone}</small>
          </button>
        </fieldset>

        {probeAvailable ? (
          <fieldset className={styles.choiceCard}>
            <legend>Optional deterministic probe</legend>
            <p>
              {state.stage3Probe === "not-run"
                ? "The itinerary is committed. Test the protected work boundary as a separate file operation."
                : "The protected work-file probe is selected. Its request and denial remain separate deterministic events; no file effect occurs."}
            </p>
            <button
              aria-disabled={state.stage3Probe === "denied"}
              aria-pressed={state.stage3Probe === "denied"}
              className={styles.choiceDecline}
              onClick={() => {
                if (state.stage3Probe === "denied") {
                  dispatch({
                    type: "announce",
                    announcement: "The protected work-file probe is already selected.",
                  });
                  return;
                }
                dispatch({
                  type: "stage3-probe",
                  announcement:
                    "The protected work-file replacement was submitted. Playback remains paused before the denial.",
                });
              }}
              type="button"
            >
              {state.stage3Probe === "denied"
                ? "Protected-file probe selected"
                : "Try a protected work-file replacement"}
              <small>{protectedPath}</small>
            </button>
          </fieldset>
        ) : null}
      </div>
    );
  }

  return null;
}

function OutcomeRegion({
  stage,
  histories,
  latestDecision,
  model,
  choice,
  choiceRef,
}: {
  stage: DemoStage;
  histories: OperationHistory[];
  latestDecision?: DemoClientEvent;
  model: DemoClientModel;
  choice: ReactNode;
  choiceRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <section className={styles.outcomeRegion} aria-labelledby="demo-outcome-title">
      <div className={styles.regionHeading}>
        <span>03</span>
        <h3 id="demo-outcome-title">Outcome and next action</h3>
      </div>
      <div className={styles.outcomeCards}>
        <article className={styles.outcomeEmpty}>
          <strong>
            {latestDecision?.policy
              ? `Current policy decision: ${titleCase(latestDecision.policy.decision)}`
              : "No policy decision yet"}
          </strong>
          <p>
            {latestDecision?.policy
              ? `${latestDecision.label}. Policy decision and operation lifecycle remain separate.`
              : "The named fixture is ready. Decision and operation lifecycle will remain separate as the sequence advances."}
          </p>
        </article>
        {histories.map((history) => {
            const definition = operationDefinition(
              model,
              history.operation.operationId,
            );
            return (
              <article className={styles.outcomeCard} key={history.operation.operationId}>
                <span>{definition?.actionLabel ?? history.event.label}</span>
                <dl>
                  <div>
                    <dt>Policy decision</dt>
                    <dd>{history.policyDecision ? titleCase(history.policyDecision) : "Not shown"}</dd>
                  </div>
                  {history.operation.humanResolution ? (
                    <div>
                      <dt>Human resolution</dt>
                      <dd>{titleCase(history.operation.humanResolution)}</dd>
                    </div>
                  ) : null}
                  <div>
                    <dt>Operation status</dt>
                    <dd>{titleCase(history.operation.status)}</dd>
                  </div>
                  {history.operation.status === "committed" ? (
                    <div>
                      <dt>Effect result</dt>
                      <dd>{history.operation.effectResult}</dd>
                    </div>
                  ) : null}
                </dl>
              </article>
            );
          })}
      </div>
      <div
        className={styles.choiceTarget}
        id="demo-required-choice"
        ref={choiceRef}
        tabIndex={-1}
      >
        {choice}
      </div>
      <blockquote className={styles.takeaway}>
        <p>{stage.presentation.takeaway}</p>
        <footer>{stage.presentation.managementTakeaway}</footer>
      </blockquote>
    </section>
  );
}

function PolicyInspector({
  stage,
  technical,
  currentEvent,
}: {
  stage: DemoStage;
  technical: boolean;
  currentEvent?: DemoClientEvent;
}) {
  const evidence = stage.policies.every(
    (policy) => policy.provenance.evidence.status === "verified",
  )
    ? "Verified"
    : "Reference";
  const presentation = stage.policies.every(
    (policy) => policy.provenance.presentationOrigin === "recorded",
  )
    ? "Recorded"
    : "Simulated";

  return (
    <div className={styles.inspectorContent}>
      <p className={styles.referenceNotice}>
        <strong>{presentation} policy shape · Evidence: {evidence}.</strong>{" "}
        Readable scenario revisions are distinct from immutable release
        identifiers and digests.
      </p>
      {stage.id === "stage-2" ? (
        <div
          aria-label="Unchanged Stage 2 artifacts"
          className={styles.unchangedRow}
          role="group"
        >
          <span>Agent prompts · unchanged</span>
          <span>Purchase-tool shape · unchanged</span>
          <span>Purchase connector · unchanged</span>
        </div>
      ) : null}
      {stage.id === "stage-3" ? (
        <div
          aria-label="Unchanged Stage 3 artifacts"
          className={styles.unchangedRow}
          role="group"
        >
          <span>categorized-purchase@v2 · unchanged</span>
          <span>Purchase route · unchanged</span>
        </div>
      ) : null}

      <div className={styles.policyList}>
        {stage.policies.map((policy) => {
          const unchanged =
            stage.id === "stage-3" && policy.id === "categorized-purchase-v2";
          const activePolicy =
            currentEvent?.policyContext?.artifactId === policy.id ||
            currentEvent?.policy?.artifactId === policy.id ||
            currentEvent?.artifactRefs.includes(`policy:${policy.id}`);
          const activeRule =
            activePolicy && currentEvent?.policyContext?.artifactId === policy.id
              ? currentEvent.policyContext.activeClause
              : undefined;
          const activeStateReads =
            activePolicy && currentEvent?.policyContext?.artifactId === policy.id
              ? currentEvent.policyContext.stateReads
              : [];
          return (
            <article className={styles.policyCard} key={policy.id}>
              <header>
                <div>
                  <span>{unchanged ? "Unchanged policy" : policy.source.languageLabel}</span>
                  <h4>{policyRevisionLabel(policy)}</h4>
                </div>
                <div className={styles.policyStatus}>
                  <span
                    className={`masugate-status masugate-status-${policy.provenance.evidence.status}`}
                  >
                    Evidence: {titleCase(policy.provenance.evidence.status)}
                  </span>
                  {activePolicy ? <strong>Active in current event</strong> : null}
                </div>
              </header>
              {activePolicy ? (
                <p className={styles.runtimeLink}>
                  Runtime link: {currentEvent?.label}.{" "}
                  {activeStateReads.length > 0
                    ? "The highlighted registered dependencies supply this state read."
                    : "This exact policy revision supplies the current decision or record fact."}
                </p>
              ) : null}
              {activeRule ? (
                <p className={styles.activeClause}>
                  <span>Active policy clause</span>
                  <code>{activeRule}</code>
                </p>
              ) : null}
              {!unchanged ? (
                <pre tabIndex={0}>
                  <HighlightedCode
                    code={policy.source.body}
                    language={policy.source.languageLabel}
                  />
                </pre>
              ) : (
                <p>
                  The purchase policy and route continue unchanged while the
                  calendar and workspace modules are added.
                </p>
              )}
              <dl className={styles.artifactFacts}>
                <div><dt>Policy owner</dt><dd>Operations policy owner</dd></div>
                <div><dt>Scenario revision</dt><dd>{policy.scenarioRevision}</dd></div>
                <div><dt>Validation</dt><dd>{titleCase(policy.validation.result)} · {policy.validation.displayLabel}</dd></div>
                <div><dt>Fixed cases</dt><dd>{policy.tests.cases.length} authored scenario cases</dd></div>
                <div><dt>Review</dt><dd>{titleCase(policy.review.status)} · scenario reference</dd></div>
                <div><dt>Release revision</dt><dd>{policyReleaseRevision(policy)}</dd></div>
              </dl>
              {technical ? (
                <div className={styles.technicalBlock}>
                  <h5>Declared state dependencies</h5>
                  <ul>
                    {policy.dependencies.map((dependency) => (
                      <li
                        className={
                          new Set<string>(activeStateReads).has(dependency.referenceView)
                            ? styles.activeDependency
                            : undefined
                        }
                        key={dependency.referenceView}
                      >
                        <code>{dependency.referenceView}</code> · {dependency.logicalScope} · {dependency.access}
                      </li>
                    ))}
                  </ul>
                  <h5>Authored scenario cases</h5>
                  <ul>
                    {policy.tests.cases.map((testCase) => (
                      <li key={testCase.id}>
                        {testCase.label} → {titleCase(testCase.expectedDecision)}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function ConfigurationInspector({
  stage,
  model,
  technical,
}: {
  stage: DemoStage;
  model: DemoClientModel;
  technical: boolean;
}) {
  const hostPin = model.integration.hostPins[0];
  const artifact = stage.artifacts.find(
    ({ kind }) => kind === "configuration",
  );
  const status = artifactStatus(artifact);
  const stageOperations = model.operations.filter(
    (operation) => operation.stageId === stage.id,
  );

  return (
    <div className={styles.inspectorContent}>
      <p className={styles.referenceNotice}>
        <strong>
          {status.presentation} configuration shape · Evidence: {status.evidence}.
        </strong>{" "}
        This is an ownership and binding view, not copy-ready configuration
        syntax.
      </p>
      <dl className={styles.configurationGrid}>
        <div>
          <dt>Host</dt>
          <dd>{hostPin ? `${hostPin.component} ${hostPin.version}` : model.integration.name}</dd>
        </div>
        <div>
          <dt>Adapter candidate</dt>
          <dd>
            {model.integration.adapter.packageName.state === "available"
              ? model.integration.adapter.packageName.value
              : "Public package identity pending"}
          </dd>
        </div>
        <div>
          <dt>Trusted principal</dt>
          <dd>Deployment-owned agent and credential-environment mapping</dd>
        </div>
        <div>
          <dt>Execution boundary</dt>
          <dd>Only the declared consequential route crosses MasuGate</dd>
        </div>
      </dl>

      <section className={styles.configSection}>
        <h4>Agent mappings</h4>
        <ul role="list">
          {model.scenario.agents
            .filter(({ id }) => new Set<string>(stage.presentation.configuredAgentIds).has(id))
            .map((agent) => (
            <li key={agent.id}>
              <code>{agent.id}</code>
              <span>
                Reference credential environment: <code>{credentialEnvironmentLabel(agent.id)}</code>.
                Secret values never enter model arguments; the exact release key remains pending.
              </span>
            </li>
            ))}
        </ul>
      </section>

      <section className={styles.configSection}>
        <h4>Finite governed-route catalog</h4>
        <ul role="list">
          {stage.routes.map((route) => {
            const stageChange =
              stage.id === "stage-3"
                ? route.id === "purchase"
                  ? "Unchanged in Stage 3"
                  : "New in Stage 3"
                : "Active route";
            const bindingsAvailable = [
              route.releaseBinding,
              route.provider.releaseBinding,
              route.connector.releaseBinding,
              route.execution.releasePosition,
            ].every(({ state }) => state === "available");

            return (
              <li className={styles.routeOwnershipCard} key={route.id}>
                <header>
                  <code>{route.id}</code>
                  <strong>{stageChange}</strong>
                </header>
                <span>{route.label}</span>
                <dl className={styles.routeOwnershipFacts}>
                  <div>
                    <dt>OpenClaw owns</dt>
                    <dd>Action proposal, orchestration, and trusted host context</dd>
                  </div>
                  <div>
                    <dt>MasuGate owns</dt>
                    <dd>Policy evaluation, operation lifecycle, and the governed effect boundary</dd>
                  </div>
                  <div>
                    <dt>Provider owns</dt>
                    <dd>
                      {route.provider.label} · views {route.provider.stateViews.join(" · ")} ·{" "}
                      {route.provider.governedEffectLabel}
                    </dd>
                  </div>
                  <div>
                    <dt>Connector owner</dt>
                    <dd>{titleCase(route.connector.owner)} · {route.connector.label}</dd>
                  </div>
                  <div>
                    <dt>Credential boundary</dt>
                    <dd>{route.connector.credentialBoundary}</dd>
                  </div>
                  <div>
                    <dt>Execution position</dt>
                    <dd>{route.execution.boundary}</dd>
                  </div>
                </dl>
                <strong className={styles.routeBindingStatus}>
                  {bindingsAvailable
                    ? "Exact release bindings available"
                    : "Reference ownership · exact release bindings pending"}
                </strong>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={styles.configSection}>
        <h4>Declared scalar argument shape</h4>
        <ul role="list">
          {stageOperations.map((operation) => (
            <li key={operation.operationId}>
              <strong>{operation.actionLabel}</strong>
              <span>{operation.arguments.map(({ label }) => label).join(" · ")}</span>
            </li>
          ))}
        </ul>
      </section>

      {stage.id === "stage-2" ? (
        <p className={styles.pendingPresentation}>
          OpenClaw may present the native review surface; MasuGate retains the
          authoritative pending operation and protected capacity.
        </p>
      ) : null}

      {technical ? (
        <div className={styles.technicalBlock}>
          <h5>Deployment-owned assertions</h5>
          <ul>
            {model.integration.deploymentOwnedConfiguration.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h5>Replacement boundary</h5>
          <p>{model.integration.replacementBoundary}</p>
          <ul>
            {model.integration.exclusions.map((exclusion) => (
              <li key={exclusion}>{exclusion}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function TraceInspector({
  events,
  eventIndex,
  model,
  stage,
  technical,
}: {
  events: readonly DemoClientEvent[];
  eventIndex: number;
  model: DemoClientModel;
  stage: DemoStage;
  technical: boolean;
}) {
  const status = artifactStatus(
    stage.artifacts.find(({ kind }) => kind === "runtime-trace"),
  );
  const groups = events.reduce<
    { kind: ResourceSnapshot["kind"]; events: DemoClientEvent[] }[]
  >((result, event) => {
    const kind = event.resourceSnapshot.kind;
    const current = result.at(-1);
    if (current?.kind === kind) {
      current.events.push(event);
    } else {
      result.push({ kind, events: [event] });
    }
    return result;
  }, []);

  return (
    <div className={styles.inspectorContent}>
      <p className={styles.referenceNotice}>
        <strong>
          {status.presentation} ordered trace · Evidence: {status.evidence}.
        </strong>{" "}
        Plain-language authored events are shown without invented protocol fields
        or state versions.
      </p>
      {groups.map((group) => {
        const groupStart = events.findIndex(({ id }) => id === group.events[0]?.id);
        return (
          <section className={styles.traceGroup} key={`${group.kind}-${groupStart}`}>
            <h4>{titleCase(group.kind)} operation trace</h4>
            <ol className={styles.traceList} role="list" start={groupStart + 1}>
              {group.events.map((event, groupIndex) => {
                const index = groupStart + groupIndex;
                const eventState =
                  index < eventIndex
                    ? "Completed"
                    : index === eventIndex
                      ? "Current"
                      : "Upcoming";
                return (
                  <li className={index === eventIndex ? styles.traceCurrent : undefined} key={event.id}>
                    <span>{String(index + 1).padStart(2, "0")} · {eventState}</span>
                    <strong>{event.label}</strong>
                    <p>{event.description}</p>
                    <small>{actorLabel(model, event.actorId)} · {titleCase(event.kind)}</small>
                    {technical && index <= eventIndex ? (
                      <dl>
                        <div><dt>Scenario event</dt><dd><code>{event.id}</code></dd></div>
                        {event.policy ? (
                          <div><dt>Policy result</dt><dd>{event.policy.artifactId} · {titleCase(event.policy.decision)}</dd></div>
                        ) : null}
                        {event.operation ? (
                          <div><dt>Operation locator</dt><dd><code>{event.operation.operationId}</code> · {titleCase(event.operation.status)}</dd></div>
                        ) : null}
                        <div><dt>Artifact references</dt><dd>{event.artifactRefs.join(" · ")}</dd></div>
                      </dl>
                    ) : null}
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}

function RecordInspector({
  stage,
  histories,
  model,
  technical,
}: {
  stage: DemoStage;
  histories: OperationHistory[];
  model: DemoClientModel;
  technical: boolean;
}) {
  const artifact = stage.artifacts.find(
    ({ kind }) => kind === "decision-record",
  );
  const status = artifactStatus(artifact);

  if (histories.length === 0) {
    return (
      <div className={styles.inspectorContent}>
        <p className={styles.referenceNotice}>
          Decision records appear when a deterministic operation identity enters
          the fixture. No record or effect receipt is fabricated at baseline.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.inspectorContent}>
      <p className={styles.referenceNotice}>
        <strong>
          {status.presentation} record projection · Evidence: {status.evidence}.
        </strong>{" "}
        Only committed operations include an effect result.
      </p>
      <div className={styles.recordList}>
        {histories.map((history) => {
          const definition = operationDefinition(model, history.operation.operationId);
          const policy = policyForOperation(stage, definition);

          return (
            <article className={styles.recordCard} key={history.operation.operationId}>
              <header>
                <div>
                  <span>{definition?.routeId ?? "Governed operation"}</span>
                  <h4>{definition?.actionLabel ?? history.event.label}</h4>
                </div>
                <strong data-operation-status={history.operation.status}>
                  {titleCase(history.operation.status)}
                </strong>
              </header>
              <dl className={styles.recordFacts}>
                <div><dt>Agent</dt><dd>{definition ? actorLabel(model, definition.agentId) : actorLabel(model, history.event.actorId)}</dd></div>
                <div><dt>Action</dt><dd>{definition?.actionLabel ?? history.event.label}</dd></div>
                <div><dt>Arguments</dt><dd>{definition?.arguments.map(({ label, value }) => `${label}: ${value}`).join("; ") ?? "Fixture event arguments"}</dd></div>
                <div><dt>Policy</dt><dd>{policy?.scenarioRevision ?? history.event.policy?.artifactId ?? "Not shown"}</dd></div>
                <div><dt>Relevant rule</dt><dd>{definition?.relevantRule ?? "Fixture result"}</dd></div>
                <div><dt>State reads</dt><dd>{definition?.stateReads.join(" · ") ?? "Not shown"}</dd></div>
                <div><dt>Policy decision</dt><dd>{history.policyDecision ? titleCase(history.policyDecision) : "Not shown"}</dd></div>
                {history.operation.humanResolution ? (
                  <div><dt>Human resolution</dt><dd>{titleCase(history.operation.humanResolution)}</dd></div>
                ) : null}
                <div><dt>Operation status</dt><dd>{titleCase(history.operation.status)}</dd></div>
                <div><dt>Operation locator</dt><dd><code>{history.operation.operationId}</code></dd></div>
                <div><dt>Related scenario IDs</dt><dd>{definition?.relatedScenarioIds.join(" · ") ?? model.scenario.id}</dd></div>
                {history.operation.status === "committed" ? (
                  <div><dt>Effect result</dt><dd>{history.operation.effectResult}</dd></div>
                ) : null}
              </dl>
              {technical ? (
                <div className={styles.technicalBlock}>
                  <dl>
                    <div><dt>Request fixture</dt><dd><code>{definition?.requestId ?? history.event.id}</code></dd></div>
                    <div><dt>Release artifact</dt><dd>{artifactReleaseRevision(artifact)}</dd></div>
                  </dl>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}

function copyExcerpt(
  stage: DemoStage,
  inspector: DemoInspectorId,
  events: readonly DemoClientEvent[],
  eventIndex: number,
  histories: OperationHistory[],
  model: DemoClientModel,
): string {
  const artifact = stage.artifacts.find(
    ({ kind }) => kind === inspectorArtifactKind(inspector),
  );
  const status = artifactStatus(artifact);

  if (inspector === "policy") {
    return stage.policies
      .map((policy) => `${policy.scenarioRevision}\n${policy.source.body}`)
      .join("\n\n");
  }

  if (inspector === "configuration") {
    return [
      `${status.presentation} shape · Evidence: ${status.evidence}`,
      `Host: ${model.integration.hostPins.map(({ component, version }) => `${component} ${version}`).join(", ")}`,
      `Agents: ${model.scenario.agents
        .filter(({ id }) => new Set<string>(stage.presentation.configuredAgentIds).has(id))
        .map(({ id }) => id)
        .join(", ")}`,
      `Governed scenario routes: ${stage.routes.map(({ id }) => id).join(", ")}`,
      "Credentials: deployment-owned environment mapping; secret values omitted",
      "Original consequential tool: replaced only on each declared route",
    ].join("\n");
  }

  if (inspector === "trace") {
    return events
      .slice(0, Math.max(eventIndex + 1, 0))
      .map((event, index) => `${index + 1}. ${event.label} — ${event.description}`)
      .join("\n");
  }

  return histories
    .map((history) => {
      const definition = operationDefinition(model, history.operation.operationId);
      return [
        definition?.actionLabel ?? history.event.label,
        `Policy decision: ${history.policyDecision ?? "not shown"}`,
        `Operation status: ${history.operation.status}`,
        history.operation.humanResolution
          ? `Human resolution: ${history.operation.humanResolution}`
          : null,
        history.operation.status === "committed"
          ? `Effect result: ${history.operation.effectResult}`
          : null,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");
}

export function DemoExperience({ model }: { model: DemoClientModel }) {
  const reducedMotion = useReducedMotion();
  const [state, dispatch] = useReducer(demoReducer, initialDemoState);
  const inspectorRef = useRef<HTMLDivElement>(null);
  const choiceRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const stageTabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const stage =
    model.stages.find(({ id }) => id === state.selectedStageId) ?? model.stages[0];
  const stageIndex = model.stages.findIndex(({ id }) => id === stage.id);
  const nextStage = model.stages[stageIndex + 1];
  const events = useMemo(() => activeTimeline(stage, state), [stage, state]);
  const lastIndex = events.length - 1;
  const visibleEvents = events.slice(0, state.eventIndex + 1);
  const ledger = resourceLedger(stage, events, state.eventIndex);
  const histories = operationHistories(visibleEvents);
  const latestDecision = [...visibleEvents]
    .reverse()
    .find((event) => event.policy);
  const currentPolicyContext = events[state.eventIndex]?.policyContext;
  const activePolicy = currentPolicyContext
    ? stage.policies.find(
        ({ id }) => id === currentPolicyContext.artifactId,
      )
    : undefined;
  const policyRevisionSummary = stage.policies
    .map(({ scenarioRevision }) => scenarioRevision)
    .join(" · ");
  const policyCaseCount = stage.policies.reduce(
    (total, policy) => total + policy.tests.cases.length,
    0,
  );
  const policyChecksPassed = stage.policies.every(
    (policy) => policy.validation.result === "passed",
  );
  const technical = state.detailLevel === "technical";
  const selectedArtifacts = stage.artifacts.filter(
    ({ kind }) =>
      kind === inspectorArtifactKind(state.selectedInspector as DemoInspectorId),
  );
  const stageEvidence = stage.artifacts.every(
    ({ evidence }) => evidence.status === "verified",
  )
    ? "Verified"
    : "Reference";
  const stagePresentation = stage.artifacts.every(
    ({ presentationOrigin }) => presentationOrigin === "recorded",
  )
    ? "Recorded"
    : "Simulated";
  const selectedEvidence = selectedArtifacts.every(
    ({ evidence }) => evidence.status === "verified",
  )
    ? "Verified"
    : "Reference";
  const currentExcerpt = useMemo(
    () =>
      copyExcerpt(
        stage,
        state.selectedInspector as DemoInspectorId,
        events,
        state.eventIndex,
        histories,
        model,
      ),
    [events, histories, model, stage, state.eventIndex, state.selectedInspector],
  );
  const previousBlocked = state.eventIndex < 0;
  const nextBlocked =
    state.playback === "complete" || state.playback === "awaiting-choice";
  const primaryLabel =
    state.playback === "idle"
      ? `Start walkthrough · ${stage.presentation.runLabel}`
      : state.playback === "playing"
        ? "Pause walkthrough"
        : state.playback === "awaiting-choice"
          ? "Go to required choice"
          : state.playback === "complete"
            ? nextStage
              ? `Continue to Stage ${nextStage.productVersion}`
              : "Walkthrough complete"
            : reducedMotion
              ? "Next step"
              : "Continue walkthrough";
  const nextAction =
    state.playback === "idle"
      ? `Start Stage ${stage.productVersion}; the walkthrough will advance automatically.`
      : state.playback === "playing"
        ? "Watch the request, current state, and outcome update—or pause to inspect a step."
        : state.playback === "awaiting-choice"
          ? "Your choice is required before the governed action can continue."
          : state.playback === "complete"
            ? nextStage
              ? `Stage ${stage.productVersion} is complete. Continue to Stage ${nextStage.productVersion}.`
              : "All three stages are complete. Optional developer evidence and transcripts remain available below."
            : reducedMotion
              ? "Continue one step at a time."
              : "Continue the walkthrough, or use Previous and Next for manual review.";

  useEffect(() => {
    if (state.playback !== "playing" || reducedMotion) return;

    const timer = window.setTimeout(() => {
      if (document.hidden) {
        dispatch({
          type: "pause",
          announcement: "Playback paused because the document is hidden.",
        });
        return;
      }

      if (inspectorRef.current?.contains(document.activeElement)) {
        dispatch({
          type: "pause",
          announcement:
            "Playback paused while a developer-inspector control has focus.",
        });
        return;
      }

      const nextIndex = Math.min(state.eventIndex + 1, lastIndex);
      dispatch({
        type: "tick",
        lastIndex,
        announcement: eventAnnouncement(stage, events, nextIndex),
      });
    }, playbackDelayMs);

    return () => window.clearTimeout(timer);
  }, [events, lastIndex, reducedMotion, stage, state.eventIndex, state.playback]);

  useEffect(() => {
    function pauseWhenHidden() {
      if (!document.hidden) return;
      dispatch({
        type: "pause",
        announcement: "Playback paused because the document is hidden.",
      });
    }

    document.addEventListener("visibilitychange", pauseWhenHidden);
    return () => document.removeEventListener("visibilitychange", pauseWhenHidden);
  }, []);

  useEffect(() => {
    if (!reducedMotion || state.playback !== "playing") return;
    dispatch({
      type: "pause",
      announcement:
        "Playback paused because reduced motion is active. Use Previous and Next for deliberate stepping.",
    });
  }, [reducedMotion, state.playback]);

  function runOrResume() {
    const nextIndex = state.eventIndex < 0 ? 0 : state.eventIndex;
    dispatch({
      type: "run",
      lastIndex,
      reducedMotion,
      announcement: reducedMotion
        ? `${eventAnnouncement(stage, events, nextIndex)} Reduced motion is active, so playback is paused for manual stepping.`
        : eventAnnouncement(stage, events, nextIndex),
    });
  }

  function step(direction: -1 | 1) {
    const target = Math.min(Math.max(state.eventIndex + direction, -1), lastIndex);
    dispatch({
      type: "step",
      direction,
      lastIndex,
      announcement:
        target < 0
          ? `${stage.title}. Returned to the named version fixture.`
          : eventAnnouncement(stage, events, target),
    });
  }

  function selectStage(stageId: string, title: string) {
    dispatch({
      type: "select-stage",
      stageId,
      announcement: `${title} selected. Version fixture reset to its named baseline.`,
    });
  }

  function selectInspector(inspectorId: DemoInspectorId) {
    dispatch({ type: "select-inspector", inspectorId });
  }

  function focusRequiredChoice() {
    choiceRef.current?.focus();
    dispatch({
      type: "announce",
      announcement:
        "Required choice focused. Select one deterministic branch to continue.",
    });
  }

  function handleTabKey(
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) {
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % demoInspectorIds.length;
    }
    if (event.key === "ArrowLeft") {
      nextIndex =
        (currentIndex - 1 + demoInspectorIds.length) % demoInspectorIds.length;
    }
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = demoInspectorIds.length - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    const inspectorId = demoInspectorIds[nextIndex] as DemoInspectorId;
    selectInspector(inspectorId);
    tabRefs.current[inspectorId]?.focus();
  }

  function handleStageTabKey(
    event: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) {
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (currentIndex + 1) % model.stages.length;
    }
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (currentIndex - 1 + model.stages.length) % model.stages.length;
    }
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = model.stages.length - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    const nextStage = model.stages[nextIndex];
    if (!nextStage) return;
    selectStage(nextStage.id, nextStage.title);
    stageTabRefs.current[nextStage.id]?.focus();
  }

  async function copyCurrentExcerpt() {
    if (!currentExcerpt) {
      dispatch({
        type: "announce",
        announcement:
          "There is no current excerpt to copy. Advance the stage; visible text remains selectable.",
      });
      return;
    }

    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(currentExcerpt);
      dispatch({
        type: "announce",
        announcement: `${inspectorLabels[state.selectedInspector as DemoInspectorId]} ${selectedEvidence} excerpt copied.`,
      });
    } catch {
      dispatch({
        type: "announce",
        announcement:
          "The excerpt was not copied. Open the selectable excerpt below for manual copying.",
      });
    }
  }

  const choice = (
    <ChoiceRegion
      dispatch={dispatch}
      eventIndex={state.eventIndex}
      model={model}
      primaryLength={stage.timelines.primary.length}
      stage={stage}
      state={state}
    />
  );

  return (
    <section className={styles.experience} aria-labelledby="demo-experience-title">
      <div className={styles.experienceHeader}>
        <div>
          <p className="masugate-eyebrow">Deterministic product walkthrough</p>
          <h2 id="demo-experience-title">Watch one governed action move.</h2>
        </div>
        <div
          aria-label="Demo status"
          className="masugate-status-stack"
          role="group"
        >
          <span
            className={`masugate-status masugate-status-${stagePresentation.toLowerCase()}`}
          >
            Presentation: {stagePresentation}
          </span>
          <span
            className={`masugate-status masugate-status-${stageEvidence.toLowerCase()}`}
          >
            Evidence: {stageEvidence}
          </span>
        </div>
      </div>

      <div className={styles.stageBrowser}>
        <div className={styles.stageBrowserHeader}>
          <div>
            <span>Walkthrough stages</span>
            <strong>Choose one bounded scenario</strong>
          </div>
          <p>Each tab resets to its own versioned fixture.</p>
        </div>
        <div
          aria-label="Demo stages"
          className={styles.stageNavigation}
          role="tablist"
        >
          <ol>
            {model.stages.map((item) => {
              const selected = item.id === stage.id;
              const completed = state.completedStageIds.includes(item.id);
              const stageState = selected
                ? "current"
                : completed
                  ? "completed"
                  : "not-started";
              return (
                <li key={item.id}>
                  <button
                    aria-controls="demo-stage-panel"
                    aria-selected={selected}
                    data-stage-state={stageState}
                    id={`demo-stage-tab-${item.id}`}
                    onClick={() => selectStage(item.id, item.title)}
                    onKeyDown={(event) => handleStageTabKey(event, model.stages.indexOf(item))}
                    ref={(node) => {
                      stageTabRefs.current[item.id] = node;
                    }}
                    role="tab"
                    tabIndex={selected ? 0 : -1}
                    type="button"
                  >
                    <span>Stage {item.productVersion}</span>
                    <strong>{item.title}</strong>
                    <em>
                      {selected
                        ? state.eventIndex < 0
                          ? completed
                            ? "Current · reset"
                            : "Current · ready"
                          : state.playback === "complete"
                            ? "Current · done"
                            : "Current · running"
                        : completed
                          ? "Done · revisit"
                          : "Choose stage"}
                    </em>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <div
        aria-labelledby={`demo-stage-tab-${stage.id}`}
        className={styles.stagePanel}
        id="demo-stage-panel"
        role="tabpanel"
        tabIndex={0}
      >
      <div className={styles.stagePanelHeader}>
        <div>
          <span>Selected-stage details</span>
          <strong>Stage {stage.productVersion} · {stage.title}</strong>
        </div>
        <p>Controls, state, and evidence for this scenario.</p>
      </div>
      <div className={styles.stageContext}>
        <div className={styles.requirementBlock}>
          <span>Current governance need</span>
          <h3>{stage.requirement}</h3>
          <p>{stage.presentation.policyChange}</p>
        </div>
        <div className={styles.contextOverview}>
          <dl className={styles.coreFacts}>
            <div>
              <dt>Active agents</dt>
              <dd>
                {model.scenario.agents
                  .filter(({ id }) => new Set<string>(stage.presentation.activeAgentIds).has(id))
                  .map(({ shortName }) => shortName)
                  .join(" · ")}
              </dd>
            </div>
            <div>
              <dt>Governed resource</dt>
              <dd>{stage.presentation.resourceLabel}</dd>
            </div>
          </dl>
          <details className={styles.scenarioDetails}>
            <summary>Stage setup and provenance</summary>
            <dl className={styles.scenarioFacts}>
              <div><dt>Product version</dt><dd>Stage {stage.productVersion}</dd></div>
              <div><dt>Policy revision</dt><dd>{stage.policies.map(({ scenarioRevision }) => scenarioRevision).join(" · ")}</dd></div>
              <div><dt>Policy owner</dt><dd>{model.scenario.policyOwner.label}</dd></div>
              <div><dt>Scenario owner</dt><dd>{model.scenario.owner.id}</dd></div>
              <div><dt>Version fixture reset</dt><dd>{stage.baselineLabel}</dd></div>
              <div><dt>Browser mode</dt><dd>Simulation · no external effects</dd></div>
            </dl>
          </details>
        </div>
      </div>

      <details className={styles.managementDisclosure}>
        <summary>Optional: inspect how policy maintenance reaches runtime</summary>
        <div className={styles.managementPlane}>
          <div>
            <span>Policy management</span>
            <ol role="list">
            <li data-management-state="complete">
              <span>Requirement</span>
              <small>{stage.requirement}</small>
            </li>
            <li data-management-state="complete">
              <span>Policy edit</span>
              <small>{policyRevisionSummary}</small>
            </li>
            <li data-management-state="complete">
              <span>Validate and test</span>
              <small>
                {policyChecksPassed ? "Passed" : "Review required"} · {policyCaseCount}{" "}
                authored cases
              </small>
            </li>
            <li
              aria-current={activePolicy ? "step" : undefined}
              data-management-state={activePolicy ? "active" : "complete"}
            >
              <span>Reviewed revision</span>
              <small>
                {activePolicy
                  ? `${activePolicy.scenarioRevision} · active runtime input`
                  : `${policyRevisionSummary} · ready for runtime`}
              </small>
            </li>
            </ol>
          </div>
          <p>
            Prompts, OpenClaw orchestration, and provider code remain outside this
            policy-management plane.
            <strong>
              Current runtime evidence: {events[state.eventIndex]?.label ?? "named version fixture"}.
              <span className={styles.activePolicyLink}>
                {activePolicy && currentPolicyContext
                  ? `Active policy link: ${activePolicy.scenarioRevision}${
                      currentPolicyContext.activeClause
                        ? ` · ${currentPolicyContext.activeClause}`
                        : " · policy selected; clause resolves during evaluation"
                    }`
                  : "Start or step through the stage to connect a request to its active policy clause."}
              </span>
            </strong>
          </p>
        </div>
      </details>

      <div className={styles.workspace}>
        <div className={styles.mainColumn}>
          <div className={styles.quickStart}>
            <div>
              <span>The simple flow</span>
              <strong>Choose a stage, then move one action from request to receipt.</strong>
            </div>
            <p>Technical evidence and full transcripts stay optional.</p>
          </div>

          <ol className={styles.flowStrip} aria-label="Governed action flow">
            <li data-active={state.eventIndex >= 0 ? "true" : undefined}>
              <span>01</span>
              <strong>Request</strong>
            </li>
            <li data-active={state.eventIndex >= 1 ? "true" : undefined}>
              <span>02</span>
              <strong>State + policy</strong>
            </li>
            <li data-active={state.eventIndex >= 2 ? "true" : undefined}>
              <span>03</span>
              <strong>Decision</strong>
            </li>
            <li data-active={state.eventIndex >= 3 ? "true" : undefined}>
              <span>04</span>
              <strong>Effect + receipt</strong>
            </li>
          </ol>

          <div
            className={styles.controls}
            aria-label="Demo walkthrough controls"
            role="group"
          >
            <button
              className={styles.runButton}
              disabled={state.playback === "complete" && !nextStage}
              onClick={() => {
                if (state.playback === "complete") {
                  if (nextStage) selectStage(nextStage.id, nextStage.title);
                  return;
                }
                if (state.playback === "awaiting-choice") {
                  focusRequiredChoice();
                  return;
                }
                if (state.playback === "playing") {
                  dispatch({
                    type: "pause",
                    announcement: `${stage.title}. Playback paused at step ${state.eventIndex + 1}.`,
                  });
                  return;
                }
                if (reducedMotion && state.playback !== "idle") {
                  step(1);
                  return;
                }
                runOrResume();
              }}
              type="button"
            >
              {primaryLabel}
            </button>
            <button
              disabled={previousBlocked}
              onClick={() => step(-1)}
              type="button"
            >
              Previous
            </button>
            <button
              disabled={nextBlocked}
              onClick={() => step(1)}
              type="button"
            >
              Next step
            </button>
            <details className={styles.playbackOptions}>
              <summary>More options</summary>
              <div>
                <button
                  onClick={() =>
                    dispatch({
                      type: "reset",
                      announcement: `${stage.title}. Version fixture reset to ${stage.baselineLabel}.`,
                    })
                  }
                  type="button"
                >
                  Reset stage
                </button>
                <a href="#demo-static-transcript">Open static transcript</a>
              </div>
            </details>
            <div className={styles.playbackGuide}>
              <span>
                {titleCase(state.playback)} · {state.eventIndex < 0
                  ? "Baseline"
                  : `Step ${state.eventIndex + 1} of ${events.length}`}
              </span>
              <strong>Next: {nextAction}</strong>
            </div>
          </div>

          <div className={styles.scene}>
            <ConversationRegion
              eventIndex={state.eventIndex}
              events={events}
              model={model}
              stage={stage}
            />
            <ResourceRegion
              currentEvent={events[state.eventIndex]}
              ledger={ledger}
              model={model}
            />
            <OutcomeRegion
              choice={choice}
              choiceRef={choiceRef}
              histories={histories}
              latestDecision={latestDecision}
              model={model}
              stage={stage}
            />
          </div>

        </div>

        <details
          className={styles.inspectorDisclosure}
          onToggle={(event) => {
            if (event.currentTarget.open && state.playback === "playing") {
              dispatch({
                type: "pause",
                announcement:
                  "Playback paused while optional developer evidence is open.",
              });
            }
          }}
        >
          <summary>
            <span>Optional developer evidence</span>
            <strong>Inspect policy, configuration, trace, and records</strong>
          </summary>
          <div className={styles.inspector} ref={inspectorRef}>
        <header className={styles.inspectorHeader}>
          <div>
            <span>Developer inspector</span>
            <h3>Separate configuration, policy, trace, and record.</h3>
          </div>
          <div className={styles.inspectorActions}>
            <button
              aria-pressed={technical}
              onClick={() => dispatch({ type: "toggle-detail" })}
              type="button"
            >
              {technical ? "Show summary" : "Expand technical detail"}
            </button>
            <button onClick={copyCurrentExcerpt} type="button">
              Copy {selectedEvidence} excerpt
            </button>
          </div>
        </header>

        <div
          aria-label="Developer artifacts"
          aria-orientation="horizontal"
          className={styles.tabList}
          role="tablist"
        >
          {demoInspectorIds.map((inspectorId, index) => {
            const selected = state.selectedInspector === inspectorId;
            return (
              <button
                aria-controls="demo-inspector-panel"
                aria-selected={selected}
                id={`demo-tab-${inspectorId}`}
                key={inspectorId}
                onClick={() => selectInspector(inspectorId as DemoInspectorId)}
                onKeyDown={(event) => handleTabKey(event, index)}
                ref={(node) => {
                  tabRefs.current[inspectorId] = node;
                }}
                role="tab"
                tabIndex={selected ? 0 : -1}
                type="button"
              >
                {inspectorLabels[inspectorId as DemoInspectorId]}
              </button>
            );
          })}
        </div>

        <div
          aria-labelledby={`demo-tab-${state.selectedInspector}`}
          className={styles.tabPanel}
          id="demo-inspector-panel"
          role="tabpanel"
          tabIndex={0}
        >
          <div className={styles.artifactBanner}>
            {selectedArtifacts.map((artifact) => (
              <article key={artifact.id}>
                <div>
                  <span>{artifact.label}</span>
                  <strong>
                    Presentation: {titleCase(artifact.presentationOrigin)} · Evidence:{" "}
                    {titleCase(artifact.evidence.status)}
                  </strong>
                </div>
                {technical ? (
                  <dl>
                    <div>
                      <dt>Authored source</dt>
                      <dd>
                        {artifact.source.state === "available"
                          ? artifact.source.value.locator
                          : "Source unavailable"}
                      </dd>
                    </div>
                    <div>
                      <dt>Release revision</dt>
                      <dd>{artifactReleaseRevision(artifact)}</dd>
                    </div>
                    <div>
                      <dt>Compatibility profile</dt>
                      <dd>
                        {artifact.integrationProfile.id} ·{" "}
                        {artifact.integrationProfile.hostPins
                          .map(({ component, version }) => `${component} ${version}`)
                          .join(" · ")} · {artifact.integrationProfile.publication}
                      </dd>
                    </div>
                  </dl>
                ) : null}
              </article>
            ))}
          </div>
          {state.selectedInspector === "policy" ? (
            <PolicyInspector
              currentEvent={events[state.eventIndex]}
              stage={stage}
              technical={technical}
            />
          ) : null}
          {state.selectedInspector === "configuration" ? (
            <ConfigurationInspector model={model} stage={stage} technical={technical} />
          ) : null}
          {state.selectedInspector === "trace" ? (
            <TraceInspector
              eventIndex={state.eventIndex}
              events={events}
              model={model}
              stage={stage}
              technical={technical}
            />
          ) : null}
          {state.selectedInspector === "record" ? (
            <RecordInspector
              histories={histories}
              model={model}
              stage={stage}
              technical={technical}
            />
          ) : null}
        </div>
        <details className={styles.copyFallback}>
          <summary>Selectable {selectedEvidence} excerpt</summary>
          {currentExcerpt ? (
            <pre tabIndex={0}>{currentExcerpt}</pre>
          ) : (
            <p>Advance the stage to produce this inspector excerpt.</p>
          )}
        </details>
          </div>
        </details>
      </div>
      </div>

      <p aria-atomic="true" aria-live="polite" className={styles.liveRegion}>
        <span key={state.announcementSerial}>{state.announcement}</span>
      </p>
    </section>
  );
}
