import type { Metadata } from "next";
import Link from "next/link";
import { createMasuGatePageMetadata } from "../../../data/metadata";
import { openClawReferenceCandidate } from "../../../data/openclaw-reference";
import styles from "./reference.module.css";

export const metadata: Metadata = createMasuGatePageMetadata({
  title: "OpenClaw reference candidate",
  description:
    "Inspect the pinned Git-backed OpenClaw purchase candidate, its relationship to the interactive Demo, and the gates that remain before a public runnable release.",
  path: "/demo/openclaw-reference/",
});

function titleCase(value: string): string {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function OpenClawReferenceCandidatePage() {
  const candidate = openClawReferenceCandidate;

  return (
    <main className="masugate-main" id="masugate-main">
      <section className={styles.hero}>
        <div className={`masugate-shell ${styles.heroGrid}`}>
          <div>
            <Link className={styles.backLink} href="/demo/">
              ← Back to the interactive walkthrough
            </Link>
            <p className="masugate-eyebrow">Milestone 3B · OpenClaw reference candidate</p>
            <h1>Inspect the candidate-backed purchase path.</h1>
            <p className={styles.intro}>{candidate.presentation.hero.intro}</p>
          </div>
          <aside className={styles.disclosure} aria-label="Candidate evidence boundary">
            <div className="masugate-status-stack">
              <span className="masugate-status masugate-status-unreleased">
                Release: {titleCase(candidate.releaseState)}
              </span>
              <span className="masugate-status masugate-status-pending">
                Maturity: {titleCase(candidate.maturity)}
              </span>
              <span className="masugate-status masugate-status-reference">
                Evidence: Reference
              </span>
            </div>
            <p>
              The source now has an exact public Git identity. It remains unreleased,
              untagged, and externally unauthorized for publication, with no
              retained supported-runtime output or verification date.
            </p>
            <small>
              Anonymous access returned 404 on {candidate.identity.visibilityObservedAt}.
              No install or “Run locally” claim is published from this state.
            </small>
          </aside>
        </div>
      </section>

      <section className={styles.identitySection}>
        <div className="masugate-shell">
          <div className={styles.sectionHeading}>
            <p className="masugate-eyebrow">Exact candidate identity</p>
            <h2>The source is pinned. The release is not yet published.</h2>
            <p>
              These values come from the candidate Git tree and release
              descriptor. The origin implementation snapshot and the later
              release-tree realization are deliberately shown separately.
            </p>
          </div>
          <dl className={styles.primaryIdentityGrid}>
            <div><dt>Candidate release</dt><dd><code>{candidate.identity.releaseId}</code></dd></div>
            <div><dt>Candidate repository</dt><dd><code>{candidate.identity.repository.replace("https://", "")}</code></dd></div>
            <div><dt>Release-tree commit</dt><dd><code>{candidate.identity.releaseTreeRevision}</code></dd></div>
            <div><dt>Host pin</dt><dd>{candidate.integration.host} {candidate.integration.hostVersion}</dd></div>
            <div><dt>Adapter pin</dt><dd><code>{candidate.integration.adapterPackage}@{candidate.integration.adapterVersion}</code></dd></div>
            <div>
              <dt>Governed route</dt>
              <dd><code>{candidate.integration.tool}</code> → {candidate.integration.route} → {candidate.integration.action}</dd>
            </div>
          </dl>
          <details className={styles.identityDisclosure}>
            <summary>
              <span>{candidate.presentation.identityDisclosure.eyebrow}</span>
              <strong>{candidate.presentation.identityDisclosure.title}</strong>
            </summary>
            <dl className={styles.identityGrid}>
              <div><dt>Channel</dt><dd>{candidate.identity.releaseChannel}</dd></div>
              <div><dt>Visibility</dt><dd>{titleCase(candidate.identity.repositoryVisibility)} as observed {candidate.identity.visibilityObservedAt}</dd></div>
              <div><dt>Origin implementation snapshot</dt><dd><code>{candidate.identity.originImplementationRevision}</code></dd></div>
              <div><dt>Release-tree object</dt><dd><code>{candidate.identity.releaseTree}</code></dd></div>
              <div><dt>Release tag</dt><dd>{titleCase(candidate.identity.releaseTag)}</dd></div>
              <div><dt>Target</dt><dd>{candidate.environment.os}/{candidate.environment.architecture} · CPython {candidate.environment.python} (tested {candidate.environment.testedPython})</dd></div>
              <div><dt>JavaScript toolchain</dt><dd>Node {candidate.environment.node} · npm {candidate.environment.npm}</dd></div>
              <div><dt>Source toolchain</dt><dd>Git {candidate.environment.git} · uv {candidate.environment.uv}</dd></div>
              <div><dt>Container toolchain</dt><dd>Docker {candidate.environment.docker} · Compose {candidate.environment.compose}</dd></div>
              <div><dt>Reference deployment</dt><dd>{candidate.integration.referenceDistribution} {candidate.integration.referenceDistributionVersion}</dd></div>
            </dl>
          </details>
          <div className={styles.auditCallout}>
            <div>
              <span>Source intake · {candidate.sourceAudit.checkedAt}</span>
              <strong>Two document validators passed; runtime acceptance did not run.</strong>
            </div>
            <p>{candidate.sourceAudit.note}</p>
          </div>
        </div>
      </section>

      <section className={styles.routeSection}>
        <div className="masugate-shell">
          <div className={styles.sectionHeading}>
            <p className="masugate-eyebrow">Finite governed route</p>
            <h2>One exact purchase boundary—not a general OpenClaw plugin claim.</h2>
          </div>
          <div className={styles.routeGrid}>
            <article className={styles.codeCard}>
              <header>
                <span>Source-reviewed configuration excerpt</span>
                <strong>Not a public install recipe</strong>
              </header>
              <pre tabIndex={0}><code>{candidate.configurationExcerpt}</code></pre>
            </article>
            <div className={styles.boundaryCards}>
              <article>
                <span>Trusted identity</span>
                <h3>{candidate.integration.principalId}</h3>
                <p>{candidate.identityBoundary}</p>
              </article>
              <article>
                <span>Provider ownership</span>
                <h3>{candidate.integration.providerId}</h3>
                <p>
                  {candidate.integration.action} · {candidate.integration.executionPosition} · {candidate.integration.connectorId}
                </p>
              </article>
              <article>
                <span>Replacement boundary</span>
                <h3>{candidate.integration.tool}</h3>
                <p>{candidate.replacementBoundary}</p>
              </article>
            </div>
          </div>
          <div className={styles.policyContractGrid}>
            <article className={styles.codeCard}>
              <header>
                <span>Source-reviewed policy</span>
                <strong>{candidate.integration.policyId}@{candidate.integration.policyVersion}</strong>
              </header>
              <pre tabIndex={0}><code>{candidate.policySource}</code></pre>
              <p className={styles.codeBoundary}>{candidate.policyBoundary}</p>
            </article>
            <article className={styles.providerCard}>
              <span>Provider-owned state view</span>
              <h3><code>{candidate.providerView.signature}</code></h3>
              <dl>
                <div><dt>Consistency</dt><dd>{candidate.providerView.consistency}</dd></div>
                <div><dt>Bound</dt><dd>{candidate.providerView.maximumLatencyMs} ms declared maximum</dd></div>
                <div><dt>Scope</dt><dd><code>{candidate.providerView.scopeTemplate}</code></dd></div>
                <div><dt>Reservation view</dt><dd>{candidate.providerView.reservationKind}</dd></div>
              </dl>
              <p>
                The policy reads provider-owned remaining capacity. Admission
                must still reserve that budget atomically at the protected
                execution boundary.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.evidenceSection}>
        <div className="masugate-shell">
          <div className={styles.sectionHeading}>
            <p className="masugate-eyebrow">Two related evidence lanes</p>
            <h2>Keep the OpenClaw host path separate from the procurement workload.</h2>
            <p>
              Both are useful candidate surfaces. They are not interchangeable,
              and neither ships captured gate output in the Git candidate.
            </p>
          </div>
          <div className={styles.evidenceGrid}>
            {candidate.evidenceLanes.map((lane) => (
              <article key={lane.id}>
                <header>
                  <span>Candidate source · Reference evidence</span>
                  <h3>{lane.label}</h3>
                  <p>{lane.driver}</p>
                </header>
                <strong className={styles.assertionLabel}>
                  The source gate is designed to assert:
                </strong>
                <ul>
                  {lane.sourceAssertions.map((item) => <li key={item}>{item}</li>)}
                </ul>
                <div className={styles.laneBoundary}>
                  <strong>Boundary</strong>
                  <p>{lane.boundary}</p>
                  <small>Promotion gate: {lane.gateLabel}</small>
                </div>
              </article>
            ))}
          </div>
          <details className={styles.coverageDisclosure}>
            <summary>
              <span>{candidate.presentation.coverageDisclosure.eyebrow}</span>
              <strong>{candidate.presentation.coverageDisclosure.title}</strong>
            </summary>
            <div className={styles.coverageBody}>
              <p className={styles.coverageIntro}>
                Candidate overlap is shown as related—not exact—until identifiers,
                driver, policy, outcome, and retained evidence all match.
              </p>
              <div className={styles.coverageGrid}>
                {candidate.stageCoverage.map((stage) => (
                  <article data-alignment={stage.alignment} key={stage.stageId}>
                    <span>{stage.stageId.replace("stage-", "Stage ")} · {stage.statusLabel}</span>
                    <h3>{stage.stageLabel}</h3>
                    <p>{stage.relationship}</p>
                    <div>
                      <strong>Why this is not exact</strong>
                      <p>{stage.mismatch}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </details>
        </div>
      </section>

      <section className={styles.gatesSection}>
        <div className={`masugate-shell ${styles.gatesGrid}`}>
          <div>
            <p className="masugate-eyebrow">Promotion boundary</p>
            <h2>What must happen before “Run locally” appears.</h2>
            <p>
              Source presence is not execution evidence. Recorded or Verified
              labels require the named supported environment, retained output,
              immutable public source, and dated evidence destination.
            </p>
          </div>
          <ol>
            {candidate.promotionGates.map((gate) => (
              <li data-status={gate.status} key={gate.id}>
                <div>
                  <span className={styles.gateStatus}>
                    {gate.status === "complete" ? "Intake complete" : "Still required"}
                  </span>
                  <strong>{gate.label}</strong>
                  <p>{gate.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={`masugate-shell ${styles.ctaGrid}`}>
          <div>
            <p className="masugate-eyebrow">Candidate boundary recorded</p>
            <h2>Return to the simulation or discuss the exact release path.</h2>
          </div>
          <div className={styles.ctaActions}>
            <Link className="masugate-button" href={candidate.cta.primary.href}>
              {candidate.cta.primary.label}
            </Link>
            <Link className="masugate-button" href={candidate.cta.secondary.href}>
              {candidate.cta.secondary.label}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
