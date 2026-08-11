import type { Metadata } from "next";
import Link from "next/link";
import { CustomizedDemoRequestForm } from "../components/CustomizedDemoRequestForm";
import {
  GovernedActionExplainer,
  GovernedRuntimeSchematic,
  OpenClawBridgeSchematic,
} from "../components/MasuGateSchematics";
import { SharedBudgetComparison } from "../components/SharedBudgetComparison";
import { contactContract } from "../data/contact";
import { selectHomepageArticles } from "../data/articles";
import { isAvailable } from "../data/contracts";
import { selectHomepageIntegrationBridge } from "../data/integrations";
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
  const integrationBridge = selectHomepageIntegrationBridge();
  const homepageArticles = selectHomepageArticles();
  const [travelRequest, workRequest] = comparison.requests;
  const [independentPath, governedPath] = comparison.paths;
  const paper = masugateSite.researchPaper;

  return (
    <main className="masugate-main" id="masugate-main">
      <section className={styles.hero} id="challenge">
        <div className={`masugate-shell ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <p className="masugate-eyebrow">
              Stateful governance for concurrent agents
            </p>
            <h1>Many agents, governed by shared rules.</h1>
            <p className={styles.heroLede}>
              MasuGate keeps policy, changing state, and consequential effects
              on one protected path—even when agents act at the same time.
            </p>
            <div className={styles.heroActions}>
              <Link
                className="masugate-button masugate-button-primary"
                href="#shared-budget"
              >
                See the shared-budget problem
              </Link>
              <Link className={styles.quietLink} href="/demo/">
                Open the demo
              </Link>
            </div>
          </div>

          <figure className={styles.heroFigure}>
            <p className={styles.figureLabel}>One shared fact</p>
            <div className={styles.heroAgents}>
              <div className={styles.agentCard}>
                <span className={styles.agentSequence}>Decision</span>
                <strong>{shortAgentName(travelRequest.agentId)}</strong>
                <small>{travelRequest.label}</small>
              </div>
              <div className={styles.agentCard}>
                <span className={styles.agentSequence}>Decision</span>
                <strong>{shortAgentName(workRequest.agentId)}</strong>
                <small>{workRequest.label}</small>
              </div>
            </div>
            <div className={styles.stateConnector} aria-hidden="true">
              <span>both depend on</span>
            </div>
            <div className={styles.sharedState}>
              <span>Shared mutable state</span>
              <strong>
                {comparison.category} budget ·{" "}
                {formatMinorUnits(comparison.capacity.minorUnits)}
              </strong>
              <ol className={styles.ordering}>
                <li>Both decisions read {formatMinorUnits(comparison.capacity.minorUnits)}.</li>
                <li>
                  The first effect leaves{" "}
                  {formatMinorUnits(
                    comparison.capacity.minorUnits -
                      travelRequest.amount.minorUnits,
                  )}
                  {" "}before the second decision is used.
                </li>
              </ol>
            </div>
            <figcaption>
              Two agents depend on one changing business fact.
            </figcaption>
          </figure>
        </div>
      </section>

      <section
        className="masugate-section masugate-section-soft"
        id="shared-budget"
      >
        <div className="masugate-shell">
          <div className="masugate-section-heading">
            <p className="masugate-eyebrow">One shared rule</p>
            <h2>Both requests fit. Together, they do not.</h2>
            <p>
              The {comparison.category.toLowerCase()} budget has{" "}
              {formatMinorUnits(comparison.capacity.minorUnits)} available. Both
              agents submit {formatMinorUnits(travelRequest.amount.minorUnits)}
              {" "}requests at nearly the same time.
            </p>
          </div>

          <SharedBudgetComparison
            capacity={comparison.capacity}
            categoryLabel={comparison.category}
            paths={[
              {
                id: independentPath.id,
                label: independentPath.label,
                title: independentPath.heading,
                description:
                  "Both reviews use the original capacity without protecting it.",
                events: independentPath.events.map(
                  ({ id, label, description, announcement }) => ({
                    id,
                    label,
                    description,
                    announcement,
                  }),
                ),
                outcome: {
                  label: "Rule broken",
                  detail: independentPath.outcome,
                },
              },
              {
                id: governedPath.id,
                label: governedPath.label,
                title: governedPath.heading,
                description:
                  "Escalate makes the first operation pending; deny stops the overlap before the approved effect is committed.",
                events: governedPath.events.map(
                  ({ id, label, description, announcement }) => ({
                    id,
                    label,
                    description,
                    announcement,
                  }),
                ),
                outcome: {
                  label: "Rule preserved",
                  detail: `${governedPath.outcome} Separate records retain the committed and denied operations.`,
                },
              },
            ]}
            requests={comparison.requests.map((request) => ({
              id: request.id,
              agentLabel: shortAgentName(request.agentId),
              actionLabel: request.label,
              amount: request.amount,
            }))}
            reviewAtOrAbove={comparison.reviewAtOrAbove}
          />

          <div className="masugate-actions">
            <Link
              className="masugate-button masugate-button-primary"
              href="/demo/"
            >
              Follow the full OpenClaw demo
            </Link>
          </div>
        </div>
      </section>

      <section className={`masugate-section ${styles.sectionMuted}`}>
        <div className="masugate-shell">
          <div className="masugate-section-heading">
            <p className="masugate-eyebrow">The same shape appears elsewhere</p>
            <h2>Shared state is more than a budget.</h2>
          </div>
          <dl className={styles.generalizationGrid}>
            <div className={styles.generalizationItem}>
              <dt>Capacity</dt>
              <dd>
                Several agents consume the same inventory, quota, or service
                limit.
              </dd>
            </div>
            <div className={styles.generalizationItem}>
              <dt>Time</dt>
              <dd>
                Multiple assistants schedule against protected calendar
                commitments.
              </dd>
            </div>
            <div className={styles.generalizationItem}>
              <dt>Work</dt>
              <dd>
                Agents create or replace files under shared workspace rules.
              </dd>
            </div>
          </dl>
          <p className={styles.generalizationClose}>
            In each case, an action changes a fact that a concurrent decision
            may depend on.
          </p>
        </div>
      </section>

      <section
        className={`masugate-section ${styles.sectionWhite}`}
        id="governed-action-explainer"
      >
        <div className="masugate-shell">
          <div className="masugate-section-heading">
            <p className="masugate-eyebrow">Why stateful checks are not enough</p>
            <h2>Keep the decision connected to the effect.</h2>
          </div>
          <p className={styles.definition}>
            <strong>Stale authorization</strong> occurs when the state that
            justified a decision changes before the associated effect happens.
          </p>
          <p className={styles.distinction}>
            Reading mutable state determines what appears permissible now.
            Coordination determines whether that decision remains valid through
            the governed effect.
          </p>
          <GovernedActionExplainer />
          <div className={styles.boundaryDiagram}>
            <div>
              <p className="masugate-eyebrow">The MasuGate boundary</p>
              <h3>One complete path, from selected request to governed result.</h3>
              <p>
                The detailed view shows which responsibilities stay with the
                host and provider, and which travel through MasuGate together.
              </p>
            </div>
            <GovernedRuntimeSchematic />
          </div>
        </div>
      </section>

      <section className={`masugate-section ${styles.sectionWhite}`}>
        <div className="masugate-shell">
          <div className="masugate-section-heading">
            <p className="masugate-eyebrow">What MasuGate contributes</p>
            <h2>From stateful policy to governed concurrent execution.</h2>
          </div>
          <div className={styles.differentiatorGrid}>
            <article className={styles.differentiator}>
              <span className={styles.cardIndex}>01</span>
              <h3>Policy over shared mutable state</h3>
              <p>Express rules over the shared state that changes as agents act.</p>
              <details className={styles.differentiatorDetail}>
                <summary>How it works</summary>
                <p className={styles.secondaryDetail}>
                  Bounded policy programs can use registered views such as
                  accumulated spend, remaining capacity, approval state, or risk
                  context.
                </p>
              </details>
            </article>
            <article className={styles.differentiator}>
              <span className={styles.cardIndex}>02</span>
              <h3>Coordination for overlapping actions</h3>
              <p>
                Preserve the meaning of stateful policy decisions when governed
                actions run concurrently.
              </p>
              <details className={styles.differentiatorDetail}>
                <summary>Technical premise</summary>
                <p className={styles.secondaryDetail}>
                  The technical model is policy-state serializability under
                  explicit policy, provider, and enforcement assumptions.
                </p>
              </details>
            </article>
            <article className={styles.differentiator}>
              <span className={styles.cardIndex}>03</span>
              <h3>Independently managed, interpretable policy</h3>
              <p>
                Manage governance as structured policy, independently of agent
                prompts and tool implementations.
              </p>
              <details className={styles.differentiatorDetail}>
                <summary>What reviewers can inspect</summary>
                <p className={styles.secondaryDetail}>
                  Policy owners can inspect, validate, test, review, version,
                  and evolve one shared rule. Records identify the applicable
                  rule, revision, and state facts used.
                </p>
              </details>
              <p className={styles.proofLine}>
                <span className={styles.proofLabel}>Policy lifecycle</span>
                {openClawScenario.policyOwner.label} → reviewed revision →
                governed agent routes → versioned records
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="masugate-section masugate-section-dark">
        <div className={`masugate-shell ${styles.bridgeGrid}`}>
          <div className={styles.bridgeCopy}>
            <p className="masugate-eyebrow">OpenClaw integration</p>
            <h2>Keep {integrationBridge.primary.name} in control. Protect the consequential action.</h2>
            <p>
              Selected calls cross the MasuGate boundary; orchestration stays
              in {integrationBridge.primary.name}.
            </p>
            <Link
              className={`masugate-button masugate-button-primary ${styles.bridgeAction}`}
              href="/demo/"
            >
              Open the OpenClaw developer demo
            </Link>
          </div>
          <OpenClawBridgeSchematic />
        </div>
      </section>

      <section
        aria-labelledby="home-blog-title"
        className={`masugate-section ${styles.sectionWhite}`}
      >
        <div className="masugate-shell">
          <div className={styles.blogHeading}>
            <div className="masugate-section-heading">
              <p className="masugate-eyebrow">Blog &amp; announcements</p>
              <h2 id="home-blog-title">Technical thinking and project updates.</h2>
              <p>
                Read the current explainers. Future MasuGate releases,
                studies, and announcements will appear here too.
              </p>
            </div>
            <Link className={styles.blogIndexLink} href="/blog/">
              View all posts
            </Link>
          </div>
          <div className={styles.blogGrid}>
            {homepageArticles.map((article) => (
              <article className={styles.blogCard} key={article.slug}>
                <p className={styles.blogMeta}>
                  <span>
                    {article.publicationType === "announcement"
                      ? "Announcement"
                      : "Technical article"}
                  </span>
                  <span aria-hidden="true">·</span>
                  <time dateTime={article.updatedAt ?? article.publishedAt}>
                    {formatArticleDate(article.updatedAt ?? article.publishedAt)}
                  </time>
                  <span aria-hidden="true">·</span>
                  <span>{article.readingMinutes} min read</span>
                </p>
                <h3>
                  <Link href={article.href}>{article.title}</Link>
                </h3>
                <p>{article.summary}</p>
                <Link className={styles.blogCardLink} href={article.href}>
                  {article.publicationType === "announcement"
                    ? "Read announcement"
                    : "Read article"}{" "}
                  →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`masugate-section ${styles.sectionMuted}`}>
        <div className="masugate-shell">
          <div className={styles.evidenceStrip}>
            <div>
              <h2>Inspect the assumptions and evidence.</h2>
              <p>
                MasuGate&apos;s formal and empirical claims have explicit premises,
                controlled evaluation boundaries, and named evidence paths.
              </p>
            </div>
            {isAvailable(paper) ? (
              <a
                className={styles.evidenceLink}
                href={paper.value.href}
                rel="noreferrer"
                target="_blank"
              >
                Open the paper
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <section
        className={`masugate-section ${styles.sectionWhite}`}
        id={contactContract.sectionId}
      >
        <div className="masugate-shell">
          <div className={`masugate-section-heading ${styles.contactIntro}`}>
            <p className="masugate-eyebrow">Continue the conversation</p>
            <h2>Want to see the scenario applied to your agent system?</h2>
            <p>
              Request a customized demo or ask a bounded integration question
              through the MasuGate project inbox.
            </p>
          </div>
          <div className={styles.contactLayout}>
            <CustomizedDemoRequestForm
              actionLabel={contactContract.requestDemoAction.value.label}
              recipientEmail={contactContract.sharedInbox.email}
              recipientMailtoHref={contactContract.sharedInbox.mailtoHref}
            />
            <aside className={styles.teamPanel} aria-labelledby="team-title">
              <p className="masugate-eyebrow">Current team</p>
              <h3 id="team-title">People behind the project</h3>
              <div className={styles.contactGrid}>
                {contactContract.people.map((person) => (
                  <article className={styles.contactCard} key={person.id}>
                    <h4>{person.name}</h4>
                    <p>{person.affiliation}</p>
                    <a
                      href={person.profileHref}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {person.profileLabel} ↗
                    </a>
                  </article>
                ))}
              </div>
              <p className={styles.sharedInbox}>
                Project contact: {" "}
                <a href={contactContract.sharedInbox.mailtoHref}>
                  {contactContract.sharedInbox.email}
                </a>
              </p>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
