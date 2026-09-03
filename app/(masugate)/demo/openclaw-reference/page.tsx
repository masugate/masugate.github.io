import type { Metadata } from "next";
import Link from "next/link";
import { isAvailable } from "../../../data/contracts";
import { createMasuGatePageMetadata } from "../../../data/metadata";
import { openClawReferenceCandidate } from "../../../data/openclaw-reference";
import styles from "./reference.module.css";

export const metadata: Metadata = createMasuGatePageMetadata({
  title: "OpenClaw Reference",
  description:
    "Inspect the OpenClaw 2026.7.1 boundary in the MasuGate 0.1.1 public-source research preview, its runnable source path, and its evidence limits.",
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
            <p className="masugate-eyebrow">MasuGate 0.1.1 · OpenClaw reference</p>
            <h1>Inspect the public-source purchase boundary.</h1>
            <p className={styles.intro}>{candidate.presentation.hero.intro}</p>
          </div>
          <aside className={styles.disclosure} aria-label="OpenClaw reference boundary">
            <div className="masugate-status-stack">
              <span className="masugate-status masugate-status-public">
                Version: 0.1.1
              </span>
              <span className="masugate-status masugate-status-public">
                Channel: Public source
              </span>
              <span className="masugate-status masugate-status-pending">
                Maturity: {titleCase(candidate.maturity)}
              </span>
              <span className="masugate-status masugate-status-reference">
                Evidence: Reference
              </span>
            </div>
            <p>{candidate.presentation.hero.sourceBoundary}</p>
            <small>
              {candidate.presentation.hero.visibilityLabel}{" "}
              {candidate.identity.visibilityObservedAt}:{" "}
              {titleCase(candidate.identity.repositoryVisibility)}. {" "}
              {candidate.presentation.hero.localRunBoundary}
            </small>
          </aside>
        </div>
      </section>

      <section className={styles.identitySection}>
        <div className="masugate-shell">
          <div className={styles.sectionHeading}>
            <p className="masugate-eyebrow">Exact source identity</p>
            <h2>The source and runbook are public. Distribution remains source-only.</h2>
            <p>
              These values come from the public Git tree and 0.1.1 descriptor.
              The observed mutable main revision and the release provenance
              identity are deliberately shown separately.
            </p>
          </div>
          <dl className={styles.primaryIdentityGrid}>
            <div><dt>Reference identity</dt><dd><code>{candidate.identity.releaseId}</code></dd></div>
            <div><dt>Public repository</dt><dd><code>{candidate.identity.repository.replace("https://", "")}</code></dd></div>
            <div><dt>Observed main commit</dt><dd><code>{candidate.identity.releaseTreeRevision}</code></dd></div>
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
              <div><dt>Release provenance revision</dt><dd><code>{candidate.identity.originImplementationRevision}</code></dd></div>
              <div><dt>Observed main tree</dt><dd><code>{candidate.identity.releaseTree}</code></dd></div>
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
              <strong>Public source and local runbook available; tag and registries unpublished.</strong>
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
                <strong>Reference configuration · not a registry install</strong>
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
              Both are useful public-source surfaces. They are not interchangeable,
              and this website does not present either as an independently retained run.
            </p>
          </div>
          <div className={styles.evidenceGrid}>
            {candidate.evidenceLanes.map((lane) => (
              <article key={lane.id}>
                <header>
                  <span>Public source · Reference evidence</span>
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
                Source overlap is shown as related—not exact—until identifiers,
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
            <p className="masugate-eyebrow">Availability boundary</p>
            <h2>What is public now—and what remains unpublished.</h2>
            <p>
              The source workflow is runnable now. Recorded or Verified labels
              still require retained output, an exact environment, and a dated
              evidence destination; a tag or registry package is a separate step.
            </p>
          </div>
          <ol>
            {candidate.promotionGates.map((gate) => (
              <li data-status={gate.status} key={gate.id}>
                <div>
                  <span className={styles.gateStatus}>
                    {gate.status === "complete" ? "Public now" : "Still unpublished"}
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
            <p className="masugate-eyebrow">Continue with the exact boundary</p>
            <h2>Run the source reference or return to the simulation.</h2>
          </div>
          <div className={styles.ctaActions}>
            {isAvailable(candidate.publicInstructions) ? (
              <a
                className="masugate-button masugate-button-primary"
                href={candidate.publicInstructions.value.href}
                rel="noreferrer"
                target="_blank"
              >
                Run from public source
              </a>
            ) : null}
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
