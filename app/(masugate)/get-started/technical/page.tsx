import type { Metadata } from "next";
import Link from "next/link";
import { getStartedGuide } from "../../../data/get-started";
import { createMasuGatePageMetadata } from "../../../data/metadata";
import styles from "./technical.module.css";

export const metadata: Metadata = createMasuGatePageMetadata({
  title: "Technical Reference",
  description:
    "Inspect the MasuGate reference environment, operation outcomes, integration boundaries, and troubleshooting guidance.",
});

function titleCase(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function TechnicalReferencePage() {
  const guide = getStartedGuide;
  const openClaw = guide.openClawContinuation;

  return (
    <main className="masugate-main" id="masugate-main">
      <section className={styles.hero}>
        <div className={`masugate-shell ${styles.heroGrid}`}>
          <div>
            <Link className={styles.backLink} href="/get-started/">
              ← Back to Get Started
            </Link>
            <p className="masugate-eyebrow">Technical reference</p>
            <h1>Profiles, outcomes, and integration boundaries.</h1>
            <p className={styles.intro}>
              This page keeps the detailed research-preview material out of the
              quick-start path while preserving it for implementation and review.
            </p>
          </div>
          <aside className={styles.statusCard} aria-label="Reference status">
            <div className="masugate-status-stack">
              <span className="masugate-status masugate-status-unreleased">
                Release: {titleCase(guide.release.state)}
              </span>
              <span className="masugate-status masugate-status-reference">
                Evidence: {titleCase(guide.release.evidence.status)}
              </span>
              <span className="masugate-status masugate-status-pending">
                Maturity: {titleCase(guide.release.maturity)}
              </span>
            </div>
            <p>
              The reference profile is specific: inspect the named environment,
              integration boundary, and evidence status before adapting it.
            </p>
          </aside>
        </div>
      </section>

      <section className={styles.section} id="environment">
        <div className="masugate-shell">
          <div className={styles.heading}>
            <p className="masugate-eyebrow">Reference environment</p>
            <h2>Use the supported profile as a whole.</h2>
            <p>
              The candidate targets {guide.baseline.target.os}/
              {guide.baseline.target.architecture} with CPython {guide.baseline.target.python},
              Docker, and Compose. One-time setup may use the network; the
              measured demonstration is credential-free and offline after setup.
            </p>
          </div>
          <div className={styles.factGrid}>
            {guide.baseline.toolchain.map((tool) => (
              <article key={tool.component}>
                <span>{tool.component}</span>
                <strong>{tool.version}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.sectionSoft} id="outcomes">
        <div className="masugate-shell">
          <div className={styles.heading}>
            <p className="masugate-eyebrow">Operation outcomes</p>
            <h2>Read the operation result before calling anything again.</h2>
          </div>
          <div className={styles.outcomeGrid}>
            {guide.outcomes.map((outcome) => (
              <article data-status={outcome.status} key={outcome.status}>
                <span>{titleCase(outcome.status)}</span>
                <h3>{outcome.effectOccurred ? "Effect retained" : "Effect not run"}</h3>
                <p>{outcome.meaning}</p>
                <p><strong>Integration response:</strong> {outcome.integrationResponse}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section} id="integrations">
        <div className="masugate-shell">
          <div className={styles.heading}>
            <p className="masugate-eyebrow">Reference integration profiles</p>
            <h2>Keep the contract fixed; vary the host edge.</h2>
            <p>
              These profiles describe exact reference bindings, not a broad
              compatibility promise. Open one only when you need the host-level
              detail.
            </p>
          </div>
          <div className={styles.integrationList}>
            {guide.integrations.map((integration) => (
              <details key={integration.id}>
                <summary>
                  <span>{integration.evidence.status} · {integration.maturity}</span>
                  <strong>{integration.name}</strong>
                </summary>
                <div>
                  <p>{integration.conceptualBinding}</p>
                  <dl>
                    <div>
                      <dt>Host pins</dt>
                      <dd>{integration.hostPins.map(({ component, version }) => `${component} ${version}`).join(" · ")}</dd>
                    </div>
                    <div>
                      <dt>Adapter boundary</dt>
                      <dd>{integration.replacementBoundary}</dd>
                    </div>
                    <div>
                      <dt>Deployment-owned configuration</dt>
                      <dd>{integration.deploymentOwnedConfiguration.join(" · ")}</dd>
                    </div>
                  </dl>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.openClawSection} id="openclaw-reference">
        <div className={`masugate-shell ${styles.openClawGrid}`}>
          <div>
            <p className="masugate-eyebrow">OpenClaw boundary</p>
            <h2>One declared route crosses the governance boundary.</h2>
            <p>
              {openClaw.host} {openClaw.hostVersion} retains orchestration. The
              configured {openClaw.tool} route connects the selected action to
              the MasuGate execution boundary.
            </p>
          </div>
          <ul>
            {openClaw.truths.map((truth) => <li key={truth}>{truth}</li>)}
          </ul>
          <Link className="masugate-button masugate-button-primary" href={openClaw.cta.href}>
            Inspect the OpenClaw reference
          </Link>
        </div>
      </section>

      <section className={styles.sectionSoft} id="troubleshooting">
        <div className="masugate-shell">
          <div className={styles.heading}>
            <p className="masugate-eyebrow">Troubleshooting</p>
            <h2>Diagnose the observed boundary.</h2>
          </div>
          <div className={styles.troubleshootingGrid}>
            {guide.troubleshooting.map((item) => (
              <details key={item.id}>
                <summary>{item.symptom}</summary>
                <p><strong>Check:</strong> {item.diagnostic}</p>
                <p><strong>Next:</strong> {item.nextStep}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
