import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { isAvailable } from "../../data/contracts";
import {
  getStartedGuide,
  type ReadinessStep,
} from "../../data/get-started";
import { createMasuGatePageMetadata } from "../../data/metadata";
import styles from "./get-started.module.css";

const page = getStartedGuide.quickStartPage;
const readinessSteps: readonly ReadinessStep[] = getStartedGuide.readinessSteps;

export const metadata: Metadata = createMasuGatePageMetadata({
  title: "Get Started",
  description: page.metadataDescription,
  path: "/get-started/",
});

function ExternalAction({
  className,
  href,
  children,
}: {
  className: string;
  href: string;
  children: ReactNode;
}) {
  return (
    <a className={className} href={href} rel="noreferrer" target="_blank">
      {children}
    </a>
  );
}

export default function GetStartedPage() {
  const repository = getStartedGuide.availability.publicRepository;
  const documentation = getStartedGuide.availability.publicDocumentation;
  const localRun = getStartedGuide.availability.runLocally;
  const issueTracker = getStartedGuide.availability.issueTracker;
  const securityReporting = getStartedGuide.availability.securityReporting;

  return (
    <main className="masugate-main" id="masugate-main">
      <section className={styles.hero}>
        <div className={`masugate-shell ${styles.heroGrid}`}>
          <div>
            <p className="masugate-eyebrow">{page.hero.eyebrow}</p>
            <p
              className={`masugate-status masugate-status-public ${styles.releaseLabel}`}
            >
              {page.hero.releaseLabel}
            </p>
            <h1>{page.hero.title}</h1>
            <p className={styles.intro}>{page.hero.intro}</p>
            <div className={styles.heroActions}>
              {isAvailable(localRun) ? (
                <ExternalAction
                  className="masugate-button masugate-button-primary"
                  href={localRun.value.href}
                >
                  {page.hero.primaryActionLabel}
                </ExternalAction>
              ) : null}
              <Link className="masugate-button" href={getStartedGuide.cta.demo.href}>
                {page.hero.browserActionLabel}
              </Link>
              {isAvailable(repository) ? (
                <ExternalAction
                  className={styles.pathAction}
                  href={repository.value.href}
                >
                  {page.hero.sourceActionLabel} ↗
                </ExternalAction>
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

      <section className={styles.section} id="choose-a-path">
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
                {path.cta.external ? (
                  <ExternalAction className={styles.pathAction} href={path.cta.href}>
                    {path.cta.label} <span aria-hidden="true">↗</span>
                  </ExternalAction>
                ) : (
                  <Link className={styles.pathAction} href={path.cta.href}>
                    {path.cta.label} <span aria-hidden="true">→</span>
                  </Link>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.demoSection} id="run-locally">
        <div className="masugate-shell">
          <div className={styles.sectionHeading}>
            <p className="masugate-eyebrow">{page.workflowSection.eyebrow}</p>
            <h2>{page.workflowSection.title}</h2>
            <p>
              {page.workflowSection.intro}{" "}
              <Link className={styles.pathAction} href={page.workflowSection.pssHref}>
                {page.workflowSection.pssActionLabel} →
              </Link>
            </p>
          </div>
          <ol className={styles.readinessList}>
            {readinessSteps.map((step) => (
              <li data-status={step.status} key={step.id}>
                <span className={styles.stepNumber}>
                  {String(step.number).padStart(2, "0")}
                </span>
                <div className={styles.stepBody}>
                  <span className={styles.readinessStatus}>
                    {step.status === "before-you-run"
                      ? page.workflowSection.beforeLabel
                      : step.status === "after-run"
                        ? page.workflowSection.afterLabel
                        : page.workflowSection.availableLabel}
                  </span>
                  <h3>{step.title}</h3>
                  <p>{step.guidance}</p>
                  {step.command ? (
                    <div className={styles.commandBlock}>
                      <span>{page.workflowSection.commandLabel}</span>
                      <pre tabIndex={0}>
                        <code>{step.command}</code>
                      </pre>
                    </div>
                  ) : null}
                  {step.expected ? (
                    <p className={styles.expectedOutput}>
                      <strong>{page.workflowSection.expectedLabel}</strong>
                      <code>{step.expected}</code>
                    </p>
                  ) : null}
                  {step.sourceHref ? (
                    <ExternalAction
                      className={styles.canonicalLink}
                      href={step.sourceHref}
                    >
                      {page.workflowSection.sourceLabel} ↗
                    </ExternalAction>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.successSection} id="success-contract">
        <div className={`masugate-shell ${styles.verifyGrid} ${styles.successGrid}`}>
          <div>
            <p className="masugate-eyebrow">{page.successSection.eyebrow}</p>
            <h2>{page.successSection.title}</h2>
            <p>{page.successSection.intro}</p>
          </div>
          <div className={styles.successCard}>
            <strong>{page.successSection.confirmsLabel}</strong>
            <ul>
              {page.successSection.confirms.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div>
              <strong>{page.successSection.caveatLabel}</strong>
              <p>{page.successSection.caveat}</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.verifySection} id="source-and-support">
        <div className={`masugate-shell ${styles.verifyGrid}`}>
          <div>
            <p className="masugate-eyebrow">{page.sourceSection.eyebrow}</p>
            <h2>{page.sourceSection.title}</h2>
            <p>{page.sourceSection.intro}</p>
            <div className={styles.sourceLinks}>
              {isAvailable(repository) ? (
                <ExternalAction className="" href={repository.value.href}>
                  {page.sourceSection.repositoryActionLabel}
                </ExternalAction>
              ) : null}
              {isAvailable(documentation) ? (
                <ExternalAction className="" href={documentation.value.href}>
                  {page.sourceSection.documentationActionLabel}
                </ExternalAction>
              ) : null}
            </div>
          </div>
          <aside className={styles.sourceCard}>
            <dl>
              <div>
                <dt>{page.sourceSection.versionLabel}</dt>
                <dd><code>{getStartedGuide.release.id}</code></dd>
              </div>
              <div>
                <dt>{page.sourceSection.channelLabel}</dt>
                <dd>Public source on <code>main</code></dd>
              </div>
              <div>
                <dt>{page.sourceSection.distributionLabel}</dt>
                <dd>{getStartedGuide.sourceRelease.boundary}</dd>
              </div>
            </dl>
          </aside>
        </div>
        <div className={`masugate-shell ${styles.documentationGrid}`}>
          {getStartedGuide.documentationLinks.map((item) => (
            <ExternalAction className={styles.documentationCard} href={item.href} key={item.href}>
              <strong>{item.label}</strong>
              <span>{item.detail}</span>
              <span aria-hidden="true">Open ↗</span>
            </ExternalAction>
          ))}
          {isAvailable(issueTracker) ? (
            <ExternalAction className={styles.documentationCard} href={issueTracker.value.href}>
              <strong>Issue tracker</strong>
              <span>Report a reproducible defect or propose a bounded change.</span>
              <span aria-hidden="true">Open ↗</span>
            </ExternalAction>
          ) : null}
          {isAvailable(securityReporting) ? (
            <ExternalAction className={styles.documentationCard} href={securityReporting.value.href}>
              <strong>Security policy</strong>
              <span>Use the private reporting route for sensitive findings.</span>
              <span aria-hidden="true">Open ↗</span>
            </ExternalAction>
          ) : null}
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
