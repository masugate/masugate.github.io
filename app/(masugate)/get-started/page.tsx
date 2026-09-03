import type { Metadata } from "next";
import Link from "next/link";
import { isAvailable } from "../../data/contracts";
import { getStartedGuide } from "../../data/get-started";
import { createMasuGatePageMetadata } from "../../data/metadata";
import styles from "./get-started.module.css";

const page = getStartedGuide.quickStartPage;

export const metadata: Metadata = createMasuGatePageMetadata({
  title: "Get Started",
  description: page.metadataDescription,
  path: "/get-started/",
});

export default function GetStartedPage() {
  const repository = getStartedGuide.availability.publicRepository;
  const documentation = getStartedGuide.availability.publicDocumentation;
  const localRun = getStartedGuide.availability.runLocally;

  return (
    <main className="masugate-main" id="masugate-main">
      <section className={styles.hero}>
        <div className={`masugate-shell ${styles.heroGrid}`}>
          <div>
            <p className="masugate-eyebrow">{page.hero.eyebrow}</p>
            <h1>{page.hero.title}</h1>
            <p className={styles.intro}>{page.hero.intro}</p>
            <div className={styles.heroActions}>
              <Link
                className="masugate-button masugate-button-primary"
                href={getStartedGuide.cta.demo.href}
              >
                {page.hero.demoActionLabel}
              </Link>
              {isAvailable(repository) ? (
                <a
                  className="masugate-button"
                  href={repository.value.href}
                  rel="noreferrer"
                  target="_blank"
                >
                  {page.hero.sourceActionLabel}
                </a>
              ) : null}
            </div>
          </div>
          <aside className={styles.summary} aria-label={page.summary.label}>
            <span>{page.summary.eyebrow}</span>
            <ol>
              {page.summary.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
            <p>{page.summary.note}</p>
          </aside>
        </div>
      </section>

      <section className={styles.section} id="evaluation-paths">
        <div className="masugate-shell">
          <div className={styles.sectionHeading}>
            <p className="masugate-eyebrow">{page.pathsSection.eyebrow}</p>
            <h2>{page.pathsSection.title}</h2>
            <p>{page.pathsSection.intro}</p>
          </div>
          <div className={styles.requirementGrid}>
            {getStartedGuide.paths.map((path) => (
              <article key={path.id}>
                <span>{page.pathsSection.audienceLabel}</span>
                <h3>{path.title}</h3>
                <p>{path.audience}</p>
                <dl className={styles.pathDetails}>
                  <div>
                    <dt>{page.pathsSection.outcomeLabel}</dt>
                    <dd>{path.outcome}</dd>
                  </div>
                  <div>
                    <dt>{page.pathsSection.boundaryLabel}</dt>
                    <dd>{path.currentBoundary}</dd>
                  </div>
                </dl>
                <Link className={styles.pathAction} href={path.cta.href}>
                  {path.cta.label} <span aria-hidden="true">→</span>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.demoSection} id="technical-readiness">
        <div className="masugate-shell">
          <div className={styles.sectionHeading}>
            <p className="masugate-eyebrow">{page.readinessSection.eyebrow}</p>
            <h2>{page.readinessSection.title}</h2>
            <p>{page.readinessSection.intro}</p>
          </div>
          <ol className={styles.readinessList}>
            {getStartedGuide.readinessSteps.map((step) => (
              <li data-status={step.status} key={step.id}>
                <span className={styles.stepNumber}>
                  {String(step.number).padStart(2, "0")}
                </span>
                <div>
                  <span className={styles.readinessStatus}>
                    {step.status === "review-now"
                      ? page.readinessSection.reviewNowLabel
                      : page.readinessSection.releaseGatedLabel}
                  </span>
                  <h3>{step.title}</h3>
                  <p>{step.guidance}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.verifySection} id="source-review">
        <div className={`masugate-shell ${styles.verifyGrid}`}>
          <div>
            <p className="masugate-eyebrow">{page.sourceSection.eyebrow}</p>
            <h2>{page.sourceSection.title}</h2>
            <p>{page.sourceSection.intro}</p>
            <div className={styles.sourceLinks}>
              {isAvailable(repository) ? (
                <a href={repository.value.href} rel="noreferrer" target="_blank">
                  {page.sourceSection.repositoryActionLabel}
                </a>
              ) : null}
              {isAvailable(documentation) ? (
                <a
                  href={documentation.value.href}
                  rel="noreferrer"
                  target="_blank"
                >
                  {page.sourceSection.documentationActionLabel}
                </a>
              ) : null}
            </div>
          </div>
          <aside className={styles.sourceCard}>
            <dl>
              <div>
                <dt>{page.sourceSection.revisionLabel}</dt>
                <dd>
                  <code>{getStartedGuide.candidateSource.releaseTreeRevision}</code>
                </dd>
              </div>
              <div>
                <dt>{page.sourceSection.boundaryLabel}</dt>
                <dd>{getStartedGuide.candidateSource.boundary}</dd>
              </div>
            </dl>
            {!isAvailable(localRun) ? (
              <p className={styles.availabilityNote}>{localRun.note}</p>
            ) : null}
          </aside>
        </div>
      </section>

      <section className={styles.nextSection}>
        <div className={`masugate-shell ${styles.nextGrid}`}>
          <div>
            <p className="masugate-eyebrow">{page.nextSection.eyebrow}</p>
            <h2>{page.nextSection.title}</h2>
            <p>{page.nextSection.intro}</p>
          </div>
          <div className={styles.nextActions}>
            <Link
              className="masugate-button masugate-button-primary"
              href={getStartedGuide.cta.demo.href}
            >
              {page.nextSection.demoActionLabel}
            </Link>
            <Link className="masugate-button" href="/get-started/technical/">
              {page.nextSection.technicalActionLabel}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
