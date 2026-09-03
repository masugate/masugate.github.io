import type { Metadata } from "next";
import Link from "next/link";
import { DemoExperience } from "../../components/DemoExperience";
import {
  OpenClawBridgeSchematic,
  PolicyRuntimeLifecycleSchematic,
} from "../../components/MasuGateSchematics";
import {
  selectDemoClientExperience,
  selectDemoExperience,
  type DemoExperienceModel,
} from "../../data/demo";
import { createMasuGatePageMetadata } from "../../data/metadata";
import type { ScenarioEvent } from "../../data/scenario";
import styles from "./demo.module.css";

export const metadata: Metadata = createMasuGatePageMetadata({
  title: "Interactive OpenClaw developer demo",
  description:
    "Start with one governed OpenClaw purchase, coordinate a shared budget across agents, then extend the policy model to calendar and workspace actions.",
  path: "/demo/",
});

type DemoStage = DemoExperienceModel["stages"][number];

function transcriptActor(
  model: DemoExperienceModel,
  actorId: ScenarioEvent["actorId"],
): string {
  const agent = model.scenario.agents.find(({ id }) => id === actorId);
  if (agent) return agent.displayName;

  const labels: Partial<Record<ScenarioEvent["actorId"], string>> = {
    reviewer: "Human reviewer",
    masugate: "MasuGate",
    provider: "Configured provider",
    scenario: "Scenario fixture",
    "detached-check": "Detached comparison",
  };

  return labels[actorId] ?? actorId;
}

function operationArgument(
  model: DemoExperienceModel,
  operationId: string,
  label: string,
): string {
  return (
    model.operations
      .find((operation) => operation.operationId === operationId)
      ?.arguments.find((argument) => argument.label === label)?.value ??
    "Fixture value unavailable"
  );
}

function TranscriptBranch({
  label,
  description,
  events,
  model,
}: {
  label: string;
  description: string;
  events: readonly ScenarioEvent[];
  model: DemoExperienceModel;
}) {
  return (
    <section className={styles.branch}>
      <h3>{label}</h3>
      <p>{description}</p>
      <ol>
        {events.map((event) => (
          <li key={event.id}>
            <strong>{transcriptActor(model, event.actorId)}: {event.label}</strong>
            <span>{event.description}</span>
            <code>
              {event.policy
                ? `Policy decision: ${event.policy.decision}`
                : "No policy decision at this event"}
              {event.operation
                ? ` · Operation status: ${event.operation.status}`
                : ""}
            </code>
          </li>
        ))}
      </ol>
    </section>
  );
}

function StageTranscript({
  stage,
  model,
}: {
  stage: DemoStage;
  model: DemoExperienceModel;
}) {
  return (
    <details
      className={styles.transcriptGroup}
      id={`demo-transcript-${stage.id}`}
    >
      <summary>
        <span>Stage {stage.productVersion}</span>
        {stage.title}
      </summary>
      <div className={styles.transcriptBody}>
        <p>
          <strong>Policy revisions:</strong>{" "}
          {stage.policies.map(({ scenarioRevision }) => scenarioRevision).join(" · ")}
        </p>
        {stage.id === "stage-3" ? (
          <p>
            <strong>Named fixtures:</strong>{" "}
            {model.scenario.calendar.protectedEvent.label}{" "}
            {model.scenario.calendar.protectedEvent.start}–
            {model.scenario.calendar.protectedEvent.end}; conflicting request{" "}
            {operationArgument(
              model,
              "scenario-op-stage-3-calendar-conflict",
              "Start",
            )}
            –
            {operationArgument(
              model,
              "scenario-op-stage-3-calendar-conflict",
              "End",
            )}
            ; fixed alternative{" "}
            {operationArgument(
              model,
              "scenario-op-stage-3-calendar-alternative",
              "Start",
            )}
            –
            {operationArgument(
              model,
              "scenario-op-stage-3-calendar-alternative",
              "End",
            )}
            ; travel path{" "}
            <code>
              {operationArgument(
                model,
                "scenario-op-stage-3-itinerary",
                "Path",
              )}
            </code>
            ; protected path{" "}
            <code>
              {operationArgument(
                model,
                "scenario-op-stage-3-protected-brief",
                "Path",
              )}
            </code>
            .
          </p>
        ) : null}
        {stage.id === "stage-1" ? (
          <TranscriptBranch
            description="One governed purchase runs from request to a committed effect and retained record."
            events={stage.timelines.primary}
            label="One governed-purchase path"
            model={model}
          />
        ) : null}

        {stage.id === "stage-2" ? (
          <>
            <TranscriptBranch
              description="The exact pending travel operation is approved once; the work operation remains denied."
              events={stage.timelines.primary}
              label="Approve branch"
              model={model}
            />
            <TranscriptBranch
              description="The travel operation is declined without an effect or receipt; protected capacity is released."
              events={stage.timelines.alternate}
              label="Decline branch"
              model={model}
            />
            <TranscriptBranch
              description="A non-interactive teaching comparison shows why two detached checks over the same old observation can break the combined rule."
              events={stage.timelines.counterfactual}
              label="Coordination counterfactual"
              model={model}
            />
          </>
        ) : null}

        {stage.id === "stage-3" ? (
          <>
            <TranscriptBranch
              description="The conflict is denied, OpenClaw presents the fixed alternative, and separate calendar and itinerary effects commit."
              events={stage.timelines.primary}
              label="Calendar alternative and workspace path"
              model={model}
            />
            <TranscriptBranch
              description="These three request, state-read, and denial events append after the default path; the itinerary effect is not replayed."
              events={stage.timelines.probe}
              label="Optional protected-file probe"
              model={model}
            />
          </>
        ) : null}
      </div>
    </details>
  );
}

export default function MasuGateDemoPage() {
  const model = selectDemoExperience();
  const clientModel = selectDemoClientExperience(model);
  const evidenceLabel =
    model.status.evidence === "verified" ? "Verified" : "Reference";

  return (
    <main className="masugate-main" id="masugate-main">
      <section className={styles.hero}>
        <div className={`masugate-shell ${styles.heroGrid}`}>
          <div>
            <Link className={styles.backLink} href="/">
              ← Back to MasuGate overview
            </Link>
            <p className="masugate-eyebrow">Interactive OpenClaw developer demo</p>
            <h1>See one action stay connected.</h1>
            <p className={styles.intro}>
              Follow a selected OpenClaw action from request to governed effect,
              then see the same pattern extend across the product.
            </p>
            <a className={styles.heroAction} href="#interactive-walkthrough">
              Try the walkthrough ↓
            </a>
          </div>
          <aside className={styles.disclosure} aria-label="Simulation disclosure">
            <div className="masugate-status-stack">
              <span className="masugate-status masugate-status-simulated">
                Simulation
              </span>
              <span
                className={`masugate-status masugate-status-${model.status.evidence}`}
              >
                Evidence: {evidenceLabel}
              </span>
            </div>
            <p>
              Interactive simulation using a fixed OpenClaw and MasuGate
              scenario. This page performs no external purchase, calendar, or
              file action.
            </p>
            <small>
              Browser presentation: Simulated · release artifacts: {evidenceLabel}
            </small>
          </aside>
        </div>
      </section>

      <section className={styles.demoSection} id="interactive-walkthrough">
        <div className="masugate-shell">
          <DemoExperience model={clientModel} />
        </div>
      </section>

      <section className={styles.policySection}>
        <div className="masugate-shell">
          <div className={styles.sectionHeading}>
            <p className="masugate-eyebrow">Policy as an independent program</p>
            <h2>Maintain policy here. Use it there.</h2>
          </div>
          <p className={styles.policyDefinition}>
            Policy maintenance stays outside the policy engine. A reviewed
            revision becomes an input to each governed action.
          </p>
          <PolicyRuntimeLifecycleSchematic />
        </div>
      </section>

      <section className={styles.boundarySection}>
        <div className="masugate-shell">
          <div className={styles.sectionHeading}>
            <p className="masugate-eyebrow">Ownership boundary</p>
            <h2>Keep OpenClaw orchestration and MasuGate governance distinct.</h2>
            <p>
              The host, governance runtime, and provider each keep one clear job.
            </p>
          </div>
          <div aria-label="Action ownership map" className={styles.ownershipGrid}>
            <article className={styles.ownershipCard} data-owner="host">
              <div className={styles.ownershipHeading}>
                <span aria-hidden="true" className={styles.ownerGlyph}>A</span>
                <div>
                  <p>OpenClaw owns</p>
                  <h3>Orchestration</h3>
                </div>
              </div>
              <div aria-label="Agent to declared route" className={styles.ownerFlow}>
                <span>Agent</span>
                <i aria-hidden="true" />
                <span>Declared route</span>
              </div>
              <small>Agents · sessions · models · routes</small>
            </article>
            <article className={styles.ownershipCard} data-owner="masugate">
              <div className={styles.ownershipHeading}>
                <span aria-hidden="true" className={styles.ownerGlyph}>P</span>
                <div>
                  <p>MasuGate owns</p>
                  <h3>Governed action</h3>
                </div>
              </div>
              <div aria-label="Policy path to record" className={styles.ownerFlow}>
                <span>Request</span>
                <i aria-hidden="true" />
                <span>Policy + state</span>
                <i aria-hidden="true" />
                <span>Record</span>
              </div>
              <small>Selected request · coordination · lifecycle</small>
            </article>
            <article className={styles.ownershipCard} data-owner="provider">
              <div className={styles.ownershipHeading}>
                <span aria-hidden="true" className={styles.ownerGlyph}>E</span>
                <div>
                  <p>Provider owns</p>
                  <h3>Facts and effect</h3>
                </div>
              </div>
              <div aria-label="State view to effect" className={styles.ownerFlow}>
                <span>State view</span>
                <i aria-hidden="true" />
                <span>Configured effect</span>
              </div>
              <small>Certified views · configured consequential action</small>
            </article>
          </div>
          <p className={styles.ownershipNote}>
            Only declared consequential routes cross the boundary. Unrelated tools remain outside.
          </p>
          <OpenClawBridgeSchematic />
        </div>
      </section>

      <section className={styles.frameworkSection} id="framework-portability">
        <div className="masugate-shell">
          <div className={styles.sectionHeading}>
            <p className="masugate-eyebrow">Framework portability</p>
            <h2>Keep the governance contract fixed. Change the host binding.</h2>
            <p>
              OpenClaw is the concrete walkthrough; other hosts change the
              adapter edge, not the governed-action contract.
            </p>
          </div>

          <div className={styles.frameworkProfiles}>
            <div>
              <span>Reference profiles</span>
              <p>One governed-action contract, expressed at each host edge.</p>
            </div>
            <ul aria-label="Reference framework profiles" className={styles.profileMarks}>
              <li data-profile="openclaw">
                {/* eslint-disable-next-line @next/next/no-img-element -- Small local project mark; direct rendering preserves the demo bundle budget. */}
                <img alt="OpenClaw logo" src="/logos/openclaw.svg" />
                <span>OpenClaw</span>
              </li>
              <li data-profile="langchain">
                {/* eslint-disable-next-line @next/next/no-img-element -- Small local project mark; direct rendering preserves the demo bundle budget. */}
                <img alt="LangChain logo" src="/logos/langchain.svg" />
                <span>LangChain / LangGraph</span>
              </li>
              <li data-profile="microsoft-agent-framework">
                {/* eslint-disable-next-line @next/next/no-img-element -- Small local project mark; direct rendering preserves the demo bundle budget. */}
                <img alt="Microsoft Agent Framework logo" src="/logos/microsoft-agent-framework-icon.png" />
                <span>Microsoft Agent Framework</span>
              </li>
              <li data-profile="crewai">
                {/* eslint-disable-next-line @next/next/no-img-element -- Small local project mark; direct rendering preserves the demo bundle budget. */}
                <img alt="CrewAI logo" src="/logos/crewai.png" />
                <span>CrewAI</span>
              </li>
            </ul>
          </div>

          <div className={styles.portabilityGrid}>
            <article className={styles.portabilityCard}>
              <span>Host-native edge · changes</span>
              <h3>Adapter responsibilities</h3>
              <ul>
                <li>Tool or function registration</li>
                <li>Trusted principal and stable retry identity</li>
                <li>Request normalization and native result conversion</li>
              </ul>
            </article>
            <article className={`${styles.portabilityCard} ${styles.portableCore}`}>
              <span>Governed-action contract · held fixed</span>
              <h3>Comparable MasuGate core</h3>
              <ul>
                <li>Request, policy revision, route, and expected lifecycle</li>
                <li>Provider views, scopes, and effect contract</li>
                <li>Canonical outcome and operation-record fields</li>
              </ul>
            </article>
          </div>

          <div className={styles.frameworkBoundary}>
            <p>
              <strong>Evidence boundary:</strong> Reference candidate bindings,
              not Verified or drop-in integrations.
            </p>
            <Link href="/demo/#framework-portability">
              Review Reference adapter profiles →
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.transcriptSection} id="demo-static-transcript">
        <div className="masugate-shell">
          <div className={styles.sectionHeading}>
            <p className="masugate-eyebrow">No-JavaScript and review path</p>
            <h2>Static transcript for every deterministic branch.</h2>
          </div>
          <p className={styles.transcriptIntro}>
            Every event remains available as ordered text independently of
            playback. Open each stage to review the approve, decline, calendar
            alternative, and protected-file paths.
          </p>
          <div className={styles.transcriptList}>
            {model.stages.map((stage) => (
              <StageTranscript key={stage.id} model={model} stage={stage} />
            ))}
          </div>
          <div className={styles.transcriptBoundary}>
            <p>
              Stage fixtures reset between product versions. Calendar and
              workspace calls are separate governed operations; this transcript
              does not imply one atomic purchase, scheduling, and filesystem
              transaction.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.candidateSection}>
        <div className={`masugate-shell ${styles.candidateBridge}`}>
          <div>
            <p className="masugate-eyebrow">
              Milestone 3B · separate candidate path
            </p>
            <h2>Inspect the bounded OpenClaw purchase candidate.</h2>
            <p>
              Review the exact OpenClaw 2026.7.1 and adapter 0.1.0 purchase
              surface, its related concurrency workload, and the publication
              gates still ahead. This companion view does not relabel any of
              the three simulated stages as recorded execution.
            </p>
          </div>
          <div className={styles.candidateAction}>
            <span>Unreleased · Reference</span>
            <Link
              className="masugate-button"
              href="/demo/openclaw-reference/"
            >
              Inspect OpenClaw reference candidate
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={`masugate-shell ${styles.ctaGrid}`}>
          <div>
            <p className="masugate-eyebrow">
              Continue from the {evidenceLabel} demo
            </p>
            <h2>Inspect the release path or bring your own agent scenario.</h2>
            <p>
              MasuGate is currently an unreleased, experimental research project. Installation commands and Verified integration claims remain gated until public release artifacts pass their named checks.
            </p>
          </div>
          <div className={styles.ctaActions}>
            <Link className="masugate-button" href={model.cta.primary.href}>
              {model.cta.primary.label}
            </Link>
            <Link className="masugate-button" href={model.cta.secondary.href}>
              {model.cta.secondary.label}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
