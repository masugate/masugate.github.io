import type { Metadata } from "next";
import Link from "next/link";
import { ConcurrentStateHero } from "../components/ConcurrentStateHero";
import { CustomizedDemoRequestForm } from "../components/CustomizedDemoRequestForm";
import { GovernedRuntimeSchematic } from "../components/MasuGateSchematics";
import { SharedBudgetComparison } from "../components/SharedBudgetComparison";
import { SharedStateStrip } from "../components/SharedStateStrip";
import { contactContract } from "../data/contact";
import { selectHomepageArticles } from "../data/articles";
import { isAvailable } from "../data/contracts";
import { homepageContent } from "../data/homepage";
import { createMasuGatePageMetadata } from "../data/metadata";
import { masugateSite } from "../data/masugate-site";
import {
  openClawScenario,
  selectHomepageBudgetComparison,
} from "../data/scenario";
import styles from "./home.module.css";

export const metadata: Metadata = createMasuGatePageMetadata({
  title: "Stateful governance for concurrent agents",
  description:
    "MasuGate connects stateful policies, shared mutable state, and governed effects so concurrent agent actions retain a valid policy explanation.",
  path: "/",
});

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function formatMinorUnits(minorUnits: number) {
  return usd.format(minorUnits / 100);
}

function formatArticleDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function shortAgentName(agentId: (typeof openClawScenario.agents)[number]["id"]) {
  const agent = openClawScenario.agents.find(({ id }) => id === agentId);

  if (!agent) {
    throw new Error(`Unknown homepage scenario agent: ${agentId}`);
  }

  return agent.shortName;
}

export default function MasuGateHomePage() {
  const comparison = selectHomepageBudgetComparison();
  const homepageArticles = selectHomepageArticles();
  const [travelRequest, workRequest] = comparison.requests;
  const [independentPath, governedPath] = comparison.paths;
  const paper = masugateSite.researchPaper;
  const source = masugateSite.sourceRepository;
  const hero = homepageContent.hero;
  const proof = homepageContent.proof;
  const closing = homepageContent.closing;
  const proofItems = [
    {
      ...proof.items[0],
      external: false,
      href: "/demo/",
    },
    ...(isAvailable(source)
      ? [
          {
            ...proof.items[1],
            external: true,
            href: source.value.href,
          },
        ]
      : []),
    ...(isAvailable(paper)
      ? [
          {
            ...proof.items[2],
            external: true,
            href: paper.value.href,
          },
        ]
      : []),
  ];
  const remainingCapacity = {
    ...comparison.capacity,
    minorUnits:
      comparison.capacity.minorUnits - travelRequest.amount.minorUnits,
  };

  return (
    <main className="masugate-main" id="masugate-main">
      <section className={styles.hero} id="challenge">
        <div className={`masugate-shell ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <p className="masugate-eyebrow">
              {hero.eyebrow}
            </p>
            <h1>{hero.title}</h1>
            <p className={styles.heroLede}>{hero.lede}</p>
            <div className={styles.heroActions}>
              <Link
                className="masugate-button masugate-button-primary"
                href={hero.primaryAction.href}
              >
                {hero.primaryAction.label}
              </Link>
              {isAvailable(masugateSite.sourceRepository) ? (
                <a
                  className={styles.quietLink}
                  href={masugateSite.sourceRepository.value.href}
                  rel="noreferrer"
                  target="_blank"
                >
                  {hero.sourceActionLabel}
                </a>
              ) : null}
            </div>
          </div>

          <ConcurrentStateHero
            categoryLabel={comparison.category}
            initialCapacityLabel={formatMinorUnits(
              comparison.capacity.minorUnits,
            )}
            remainingCapacityLabel={formatMinorUnits(
              remainingCapacity.minorUnits,
            )}
            requests={[
              {
                agentLabel: shortAgentName(travelRequest.agentId),
                actionLabel: travelRequest.label,
                amountLabel: formatMinorUnits(travelRequest.amount.minorUnits),
              },
              {
                agentLabel: shortAgentName(workRequest.agentId),
                actionLabel: workRequest.label,
                amountLabel: formatMinorUnits(workRequest.amount.minorUnits),
              },
            ]}
          />
        </div>
      </section>

      <section
        className="masugate-section masugate-section-soft"
        id="shared-budget"
      >
        <div className="masugate-shell">
          <div className="masugate-section-heading">
            <p className="masugate-eyebrow">{homepageContent.problem.eyebrow}</p>
            <h2>{homepageContent.problem.title}</h2>
          </div>

          <SharedBudgetComparison
            capacity={comparison.capacity}
            categoryLabel={comparison.category}
            paths={[
              {
                id: independentPath.id,
                label: independentPath.label,
                title: independentPath.heading,
                description: homepageContent.problem.independentDescription,
                events: independentPath.events.map(
                  ({ id, label, description, announcement }) => ({
                    id,
                    label,
                    description,
                    announcement,
                  }),
                ),
                outcome: {
                  label: homepageContent.problem.outcomeLabels.independent,
                  detail: independentPath.outcome,
                },
              },
              {
                id: governedPath.id,
                label: governedPath.label,
                title: governedPath.heading,
                description: homepageContent.problem.governedDescription,
                events: governedPath.events.map(
                  ({ id, label, description, announcement }) => ({
                    id,
                    label,
                    description,
                    announcement,
                  }),
                ),
                outcome: {
                  label: homepageContent.problem.outcomeLabels.governed,
                  detail: governedPath.outcome,
                },
              },
            ]}
            requests={comparison.requests.map((request) => ({
              id: request.id,
              agentLabel: shortAgentName(request.agentId),
              actionLabel: request.label,
              amount: request.amount,
            }))}
            presentation="compact"
            reviewAtOrAbove={comparison.reviewAtOrAbove}
          />

          <p className={styles.problemRecordNote}>
            {homepageContent.problem.recordNote}
          </p>

          <div className="masugate-actions">
            <Link
              className="masugate-button masugate-button-primary"
              href={homepageContent.problem.action.href}
            >
              {homepageContent.problem.action.label}
            </Link>
          </div>
        </div>
      </section>

      <section className={`masugate-section ${styles.sectionMuted}`}>
        <div className="masugate-shell">
          <div className="masugate-section-heading">
            <p className="masugate-eyebrow">
              {homepageContent.sharedState.eyebrow}
            </p>
            <h2>{homepageContent.sharedState.title}</h2>
          </div>
          <SharedStateStrip />
        </div>
      </section>

      <section
        className={`masugate-section ${styles.sectionWhite}`}
        id="governed-action-path"
      >
        <div className="masugate-shell">
          <div className="masugate-section-heading">
            <p className="masugate-eyebrow">
              {homepageContent.mechanism.eyebrow}
            </p>
            <h2>{homepageContent.mechanism.title}</h2>
            <p>{homepageContent.mechanism.intro}</p>
          </div>
          <GovernedRuntimeSchematic presentation="compact" />
        </div>
      </section>

      <section className={`masugate-section ${styles.proofSection}`}>
        <div className="masugate-shell">
          <div className={styles.proofHeading}>
            <div className="masugate-section-heading">
              <p className="masugate-eyebrow">{proof.eyebrow}</p>
              <h2>{proof.title}</h2>
              <p>{proof.intro}</p>
            </div>
            <span aria-hidden="true" className={styles.proofRule} />
          </div>

          <div className={styles.proofGrid}>
            {proofItems.map((item, index) => (
              <article
                className={styles.proofCard}
                data-proof-resource={item.id}
                key={item.id}
              >
                <div className={styles.proofCardTopline}>
                  <span>0{index + 1}</span>
                  <span>{item.status}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <details className={styles.proofDetails}>
                  <summary>{item.detailsLabel}</summary>
                  <ul>
                    {item.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                </details>
                {item.external ? (
                  <a
                    className={styles.proofAction}
                    href={item.href}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {item.actionLabel} ↗
                  </a>
                ) : (
                  <Link className={styles.proofAction} href={item.href}>
                    {item.actionLabel} →
                  </Link>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        aria-labelledby="home-closing-title"
        className={`masugate-section ${styles.closingSection}`}
        id={contactContract.sectionId}
      >
        <div className="masugate-shell">
          <div className={`masugate-section-heading ${styles.closingHeading}`}>
            <p className="masugate-eyebrow">{closing.eyebrow}</p>
            <h2 id="home-closing-title">{closing.title}</h2>
          </div>

          <div className={styles.closingGrid}>
            <div className={styles.writingBlock}>
              <div className={styles.blockHeading}>
                <h3>{closing.writingLabel}</h3>
                <Link href="/blog/">{closing.writingActionLabel} →</Link>
              </div>
              <div className={styles.writingList}>
                {homepageArticles.map((article) => (
                  <article key={article.slug}>
                    <p>
                      <span>
                        {article.publicationType === "announcement"
                          ? "Announcement"
                          : "Article"}
                      </span>
                      <time dateTime={article.updatedAt ?? article.publishedAt}>
                        {formatArticleDate(
                          article.updatedAt ?? article.publishedAt,
                        )}
                      </time>
                    </p>
                    <h4>
                      <Link href={article.href}>{article.title}</Link>
                    </h4>
                  </article>
                ))}
              </div>
            </div>

            <div className={styles.contactBlock}>
              <p className="masugate-eyebrow">{closing.contactLabel}</p>
              <h3>{closing.contactTitle}</h3>
              <p>{closing.contactCopy}</p>
              <details className={styles.contactDisclosure}>
                <summary>
                  <span>{contactContract.requestDemoAction.value.label}</span>
                  <small>{closing.disclosureHint}</small>
                </summary>
                <div className={styles.formWrap}>
                  <CustomizedDemoRequestForm
                    actionLabel={contactContract.requestDemoAction.value.label}
                    recipientEmail={contactContract.sharedInbox.email}
                    recipientMailtoHref={contactContract.sharedInbox.mailtoHref}
                  />
                </div>
              </details>

              <div className={styles.teamLinks}>
                <span>{closing.teamLabel}</span>
                {contactContract.people.map((person) => (
                  <a
                    href={person.profileHref}
                    key={person.id}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {person.name}
                    <small>{person.affiliation}</small>
                  </a>
                ))}
              </div>
              <a
                className={styles.inboxLink}
                href={contactContract.sharedInbox.mailtoHref}
              >
                {contactContract.sharedInbox.email}
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
