import { getPolicyArtifact } from "../data/policies";
import { homepageContent } from "../data/homepage";
import {
  type PaperFigureAttribution,
  type SchematicProfile,
  selectHomepageSchematicProfiles,
} from "../data/schematics";
import styles from "./MasuGateSchematics.module.css";

function FigureAttribution({ source }: { source: PaperFigureAttribution }) {
  return (
    <span>
      Adapted from{" "}
      <a href={source.href} rel="noreferrer" target="_blank">
        {source.figure} of {source.paperTitle} (arXiv {source.arxivId})
      </a>
      .
    </span>
  );
}

function TextEquivalent({ profile }: { profile: SchematicProfile }) {
  const statements = profile.textEquivalent.split(/(?<=[.!?])\s+/);

  return (
    <details className={styles.transcript}>
      <summary>Text equivalent</summary>
      {statements.map((statement) => (
        <p key={statement}>{statement}</p>
      ))}
    </details>
  );
}

export function GovernanceBoundarySchematic() {
  const { governanceBoundary: profile } = selectHomepageSchematicProfiles();
  const source = profile.sourceFigures[0];

  return (
    <figure
      aria-labelledby="governance-boundary-schematic-title"
      className={styles.figure}
      data-schematic-profile={profile.id}
      id="governance-boundary-schematic"
    >
      <div className={styles.figureHeader}>
        <h3 className={styles.figureTitle} id="governance-boundary-schematic-title">
          Detached check compared with connected governance
        </h3>
        <div className={styles.legend} aria-label="Schematic status">
          <span className="masugate-status masugate-status-reference">
            Evidence: {profile.evidence.label}
          </span>
        </div>
      </div>

      <div className={styles.pathComparison}>
        <div className={styles.path}>
          <div className={styles.pathLabel}>Detached stateful check</div>
          <ol className={styles.nodeRow}>
            <li className={styles.node}>
              <strong>Request</strong>
              <small>Consequential action.</small>
            </li>
            <li className={styles.node}>
              <strong>Policy + state</strong>
              <small>Reads the current fact.</small>
            </li>
            <li className={`${styles.node} ${styles.detachedDecision}`}>
              <strong>Decision</strong>
              <small>The check returns.</small>
            </li>
            <li className={`${styles.node} ${styles.detachedEffect}`}>
              <span className={styles.gapLabel}>State may change here</span>
              <strong>Effect</strong>
              <small>Runs later.</small>
            </li>
          </ol>
        </div>

        <div className={styles.path}>
          <div className={styles.pathLabel}>Connected MasuGate path</div>
          <ol className={`${styles.nodeRow} ${styles.connectedRow}`}>
            <li className={styles.node}>
              <strong>Governed request</strong>
              <small>Selected route.</small>
            </li>
            <li className={styles.node}>
              <strong>Policy + current state</strong>
              <small>Rule + declared facts.</small>
            </li>
            <li className={styles.node}>
              <strong>Scoped coordination</strong>
              <small>Protects overlap.</small>
            </li>
            <li className={styles.node}>
              <strong>Effect + record</strong>
              <small>Links the result.</small>
            </li>
          </ol>
        </div>
      </div>

      <TextEquivalent profile={profile} />
      <figcaption className={styles.caption}>
        <FigureAttribution source={source} />
      </figcaption>
    </figure>
  );
}

export function GovernedActionExplainer() {
  const { governanceBoundary: profile } = selectHomepageSchematicProfiles();
  const source = profile.sourceFigures[0];

  return (
    <figure
      aria-labelledby="governed-action-explainer-title"
      className={`${styles.figure} ${styles.actionExplainer}`}
      data-schematic-profile={profile.id}
      id="governed-action-path"
    >
      <div className={styles.figureHeader}>
        <div>
          <p className={styles.figureKicker}>One decision needs one protected path</p>
          <h3 className={styles.lifecycleTitle} id="governed-action-explainer-title">
            Keep the rule, changing state, and resulting effect connected.
          </h3>
        </div>
      </div>

      <div className={styles.actionExplainerGrid}>
        <section className={styles.actionExplainerPath} aria-labelledby="detached-check-title">
          <header>
            <span>Detached check</span>
            <h4 id="detached-check-title">A decision can go stale.</h4>
          </header>
          <ol>
            <li>Request</li>
            <li>Check state</li>
            <li>Decision</li>
            <li className={styles.actionExplainerGap}>State changes</li>
            <li>Effect</li>
          </ol>
        </section>

        <section
          className={`${styles.actionExplainerPath} ${styles.actionExplainerConnected}`}
          aria-labelledby="connected-path-title"
        >
          <header>
            <span>Governed action</span>
            <h4 id="connected-path-title">The decision stays connected.</h4>
          </header>
          <ol>
            <li>Request</li>
            <li>Policy + state</li>
            <li>Coordinate</li>
            <li>Effect</li>
            <li>Receipt</li>
          </ol>
        </section>
      </div>

      <p className={styles.actionExplainerNote}>
        MasuGate governs only configured consequential routes. The host still
        owns the surrounding agent, orchestration, and model behavior.
      </p>
      <TextEquivalent profile={profile} />
      <figcaption className={styles.caption}>
        <FigureAttribution source={source} />
      </figcaption>
    </figure>
  );
}

export function GovernedRuntimeSchematic({
  presentation = "standard",
}: {
  presentation?: "standard" | "compact";
} = {}) {
  const { governedRuntime: profile } = selectHomepageSchematicProfiles();
  const source = profile.sourceFigures[0];

  if (presentation === "compact") {
    const content = homepageContent.mechanism;

    return (
      <figure
        aria-labelledby="governed-runtime-schematic-compact-title"
        className={`${styles.figure} ${styles.compactFigure}`}
        data-schematic-profile={profile.id}
        id="governed-runtime-schematic-compact"
      >
        <div className={styles.figureHeader}>
          <div>
            <p className={styles.figureKicker}>{content.figureKicker}</p>
            <h3
              className={styles.lifecycleTitle}
              id="governed-runtime-schematic-compact-title"
            >
              {content.figureTitle}
            </h3>
          </div>
        </div>

        <div className={styles.compactFlow}>
          <article
            aria-labelledby="governed-runtime-compact-step-1"
            className={`${styles.compactStep} ${styles.compactRequestStep}`}
          >
            <span className={styles.compactStepNumber}>01</span>
            <h4 id="governed-runtime-compact-step-1">
              {content.steps[0].label}
            </h4>
            <p>{content.steps[0].detail}</p>
          </article>

          <div
            aria-labelledby="governed-runtime-compact-boundary"
            className={styles.compactBoundary}
            role="group"
          >
            <span
              className={styles.compactBoundaryLabel}
              id="governed-runtime-compact-boundary"
            >
              {content.boundaryLabel}
            </span>
            <div className={styles.compactProtectedSteps}>
              {content.steps.slice(1).map((step, index) => (
                <article
                  aria-labelledby={`governed-runtime-compact-step-${index + 2}`}
                  className={styles.compactStep}
                  key={step.label}
                >
                  <span className={styles.compactStepNumber}>
                    {String(index + 2).padStart(2, "0")}
                  </span>
                  <h4 id={`governed-runtime-compact-step-${index + 2}`}>
                    {step.label}
                  </h4>
                  <p>{step.detail}</p>
                  {index === 1 ? (
                    <div className={styles.compactOutcomeSet}>
                      <span>{content.outcomesLabel}</span>
                      <ul>
                        {content.outcomes.map((outcome) => (
                          <li data-outcome={outcome.toLowerCase()} key={outcome}>
                            {outcome}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.compactNotes}>
          <p>{content.scopeNote}</p>
          <p>{content.recordNote}</p>
        </div>
        <TextEquivalent profile={profile} />
        <figcaption className={styles.caption}>
          <FigureAttribution source={source} />
        </figcaption>
      </figure>
    );
  }

  return (
    <figure
      aria-labelledby="governed-runtime-schematic-title"
      className={styles.figure}
      data-schematic-profile={profile.id}
      id="governed-runtime-schematic"
    >
      <div className={styles.figureHeader}>
        <h3 className={styles.figureTitle} id="governed-runtime-schematic-title">
          Canonical governed-action path
        </h3>
        <div className={styles.legend} aria-label="Schematic status">
          <span className="masugate-status masugate-status-reference">
            Evidence: {profile.evidence.label}
          </span>
        </div>
      </div>

      <div className={styles.environmentStrip} aria-label="Environment around the governed action">
        <article data-environment="host">
          <span>Agent environment</span>
          <strong>OpenClaw orchestration</strong>
          <small>Agents, models, sessions, and declared routes stay host-owned.</small>
        </article>
        <article data-environment="policy">
          <span>Policy environment</span>
          <strong>Reviewed policy program</strong>
          <small>Owners maintain the rule outside prompts and runtime code.</small>
        </article>
        <article data-environment="provider">
          <span>Provider environment</span>
          <strong>State views and effect</strong>
          <small>The provider owns its facts and configured consequential action.</small>
        </article>
      </div>

      <div className={styles.runtimeShell}>
        <div className={styles.hostNode}>
          <span className={styles.ownerLabel}>Host-owned</span>
          <strong>Agent request</strong>
          <small>A selected action enters the governed route.</small>
        </div>

        <div className={styles.boundary}>
          <span className={styles.boundaryLabel}>MasuGate boundary</span>
          <ol className={`${styles.runtimeFlow} ${styles.runtimeFlowThree}`}>
            <li className={styles.runtimeNode}>
              <strong>Reviewable stateful policy</strong>
              <span>A structured program holds the rule outside prompts.</span>
            </li>
            <li className={styles.runtimeNode}>
              <strong>Certified policy-state views</strong>
              <span>Registered views supply the rule&apos;s mutable facts.</span>
            </li>
            <li className={styles.runtimeNode}>
              <strong>Scoped coordination</strong>
              <span>The selected mechanism protects overlapping scopes.</span>
            </li>
          </ol>
          <p className={styles.runtimeRecord}>
            Receipt: revision, state facts, decision, and outcome stay linked.
          </p>
        </div>

        <div className={styles.providerNode}>
          <span className={styles.ownerLabel}>Provider-owned</span>
          <strong>Governed effect</strong>
          <small>The provider executes the configured effect.</small>
        </div>
      </div>

      <p className={styles.boundaryNote}>
        The surrounding agent framework still owns orchestration and model
        behavior. MasuGate governs only the selected action paths configured
        to cross its boundary.
      </p>
      <TextEquivalent profile={profile} />
      <figcaption className={styles.caption}>
        <FigureAttribution source={source} />
      </figcaption>
    </figure>
  );
}

export function PolicyRuntimeLifecycleSchematic() {
  const { openClawRuntime: profile } = selectHomepageSchematicProfiles();

  if (profile.kind !== "instantiated") {
    throw new Error("The policy/runtime lifecycle requires an instantiated profile.");
  }

  const policy = getPolicyArtifact(profile.scenarioBinding.policyArtifactIds[0]);
  const source = profile.sourceFigures[0];

  return (
    <figure
      aria-labelledby="policy-runtime-lifecycle-title"
      className={`${styles.figure} ${styles.lifecycleFigure}`}
      id="policy-runtime-lifecycle"
    >
      <div className={styles.figureHeader}>
        <div>
          <p className={styles.figureKicker}>Policy maintenance feeds the runtime</p>
          <h3 className={styles.lifecycleTitle} id="policy-runtime-lifecycle-title">
            A policy program is maintained outside the policy engine, then used by each governed action.
          </h3>
        </div>
        <div className={styles.legend} aria-label="Lifecycle schematic status">
          <span className="masugate-status masugate-status-simulated">
            Presentation: {profile.presentation.label}
          </span>
          <span className="masugate-status masugate-status-reference">
            Evidence: {profile.evidence.label}
          </span>
        </div>
      </div>

      <section
        aria-labelledby="policy-management-lane-title"
        className={styles.lifecycleLane}
      >
        <header className={styles.laneHeader}>
          <span>Outside the policy engine</span>
          <h4 id="policy-management-lane-title">Policy maintenance</h4>
          <p>People and delivery tools own this lane.</p>
        </header>
        <ol className={styles.managementFlow}>
          <li className={styles.lifecycleNode}>
            <span className={styles.stepNumber}>1</span>
            <strong>Author</strong>
            <small>Write the policy program.</small>
          </li>
          <li className={styles.lifecycleNode}>
            <span className={styles.stepNumber}>2</span>
            <strong>Review</strong>
            <small>Inspect the proposed rule.</small>
          </li>
          <li className={styles.lifecycleNode}>
            <span className={styles.stepNumber}>3</span>
            <strong>Test</strong>
            <small>Validate expected outcomes.</small>
          </li>
          <li className={styles.lifecycleNode}>
            <span className={styles.stepNumber}>4</span>
            <strong>Deploy</strong>
            <small>Publish one reviewed revision.</small>
          </li>
        </ol>
      </section>

      <div className={styles.revisionHandoff}>
        <strong>Reviewed revision → runtime</strong>
        <span>
          The runtime reads {policy.scenarioRevision}; it does not rewrite,
          approve, or deploy policy.
        </span>
      </div>

      <section
        aria-labelledby="governed-runtime-lane-title"
        className={`${styles.lifecycleLane} ${styles.runtimeLane}`}
      >
        <header className={styles.laneHeader}>
          <span>Inside each governed action</span>
          <h4 id="governed-runtime-lane-title">Governed runtime</h4>
          <p>One operation connects the inputs to its outcome.</p>
        </header>

        <div className={styles.runtimeInputs} aria-label="Runtime inputs">
          <article className={styles.runtimeInput} data-owner="host">
            <span>Host input</span>
            <strong>Request</strong>
            <small>Trusted actor and action.</small>
          </article>
          <article className={styles.runtimeInput} data-owner="masugate">
            <span>Policy input</span>
            <strong>Revision</strong>
            <small>{policy.scenarioRevision}</small>
          </article>
          <article className={styles.runtimeInput} data-owner="provider">
            <span>Provider input</span>
            <strong>State + effect</strong>
            <small>Declared views and scopes.</small>
          </article>
        </div>

        <p className={styles.runtimeJoin}>
          Bound to one operation ↓
        </p>

        <ol className={styles.runtimeSequence}>
          <li className={styles.lifecycleNode}>
            <strong>Route</strong>
            <small>Use the declared action.</small>
          </li>
          <li className={styles.lifecycleNode}>
            <strong>Coordinate</strong>
            <small>Protect scopes, read state.</small>
          </li>
          <li className={styles.lifecycleNode}>
            <strong>Decide</strong>
            <small>Apply that exact revision.</small>
          </li>
          <li className={styles.lifecycleNode}>
            <strong>Effect</strong>
            <small>Run only when permitted.</small>
          </li>
          <li className={styles.lifecycleNode}>
            <strong>Receipt</strong>
            <small>Keep the linked outcome.</small>
          </li>
        </ol>

        <p className={styles.runtimeCondition}>
          <strong>Outcome:</strong> deny stops the effect; pending waits for a
          decision; committed retains the effect and its receipt together.
        </p>
      </section>

      <figcaption className={styles.caption}>
        OpenClaw orchestration and provider implementation remain outside policy
        maintenance. This is a Reference scenario, not a release binding.{" "}
        <FigureAttribution source={source} />
      </figcaption>
    </figure>
  );
}

export function OpenClawBridgeSchematic() {
  const { openClawRuntime: profile } = selectHomepageSchematicProfiles();

  if (profile.kind !== "instantiated") {
    throw new Error("The OpenClaw homepage schematic must be instantiated.");
  }

  const policy = getPolicyArtifact(profile.scenarioBinding.policyArtifactIds[0]);
  const source = profile.sourceFigures[0];
  const hostPin = profile.hostBinding.hostPins[0];

  if (!hostPin) {
    throw new Error("The OpenClaw homepage schematic requires an exact host pin.");
  }

  return (
    <figure
      aria-labelledby="openclaw-governed-route-schematic-title"
      className={`${styles.figure} ${styles.bridgeFigure}`}
      data-schematic-profile={profile.id}
      id="openclaw-governed-route-schematic"
    >
      <div className={styles.figureHeader}>
        <h3 className={styles.figureTitle} id="openclaw-governed-route-schematic-title">
          {profile.hostBinding.name} governed purchase route
        </h3>
        <div className={styles.legend} aria-label="OpenClaw schematic status">
          <span className="masugate-status masugate-status-simulated">
            Presentation: {profile.presentation.label}
          </span>
          <span className="masugate-status masugate-status-reference">
            Evidence: {profile.evidence.label}
          </span>
        </div>
      </div>

      <ol className={`${styles.bridgeFlow} ${styles.bridgeFlowFive}`}>
        <li className={`${styles.bridgeNode} ${styles.hostBridgeNode}`}>
          <span className={styles.ownerLabel}>Host-owned</span>
          <strong>{profile.hostBinding.name} governed tool call</strong>
          <span>Orchestrates agents and selects the registered purchase tool.</span>
        </li>
        <li className={`${styles.bridgeNode} ${styles.bridgeBoundary}`}>
          <span className={styles.ownerLabel}>Deployment-owned adapter edge</span>
          <strong>Bind trusted request context</strong>
          <span>
            Principal and stable action identity come from host context—not
            model arguments.
          </span>
        </li>
        <li className={`${styles.bridgeNode} ${styles.bridgeBoundary}`}>
          <span className={styles.ownerLabel}>MasuGate-owned runtime</span>
          <strong>Resolve route + {policy.scenarioRevision}</strong>
          <span>
            Runtime protects the {profile.providerBinding.logicalScopes.join(" · ")} scope;
            produces allow, deny, or pending.
          </span>
        </li>
        <li className={`${styles.bridgeNode} ${styles.providerBridgeNode}`}>
          <span className={styles.ownerLabel}>Provider-owned</span>
          <strong>Certified state → Configured provider effect</strong>
          <ul className={styles.providerParts}>
            <li>Certified view: {profile.providerBinding.certifiedViews.join(" · ")}</li>
            <li>Execute: configured purchase effect only after allow or approval</li>
          </ul>
        </li>
        <li className={`${styles.bridgeNode} ${styles.bridgeBoundary}`}>
          <span className={styles.ownerLabel}>MasuGate outcome → host</span>
          <strong>Canonical record + authoritative result</strong>
          <span>{profile.hostBinding.nativeResultWrapper}.</span>
        </li>
      </ol>

      <TextEquivalent profile={profile} />
      <figcaption className={styles.caption}>
        Reference profile: {hostPin.component} {hostPin.version}. Unrelated
        OpenClaw tools remain outside the declared MasuGate route.{" "}
        <FigureAttribution source={source} />
      </figcaption>
    </figure>
  );
}
