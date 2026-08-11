import { ArticleCode, ArticleMeta } from "../../components/ArticleCode";
import { ArrowLink, PageHero, SiteFooter, SiteHeader, StatusPill } from "../../components/SiteChrome";

export default function EvidencePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="Technical article · Evaluation"
          title="How to evaluate a governance claim."
          intro="A practical guide to reading SAGE demonstrations, records, integration labels, and system boundaries without turning a mechanism claim into a promise the deployment cannot support."
          aside={
            <ArticleMeta
              type="Evaluation guide"
              audience="Technical diligence and governance teams"
              readingTime="11 minutes"
            />
          }
        />

        <section className="section">
          <div className="shell article-layout">
            <aside className="article-toc">
              <span>In this article</span>
              <a href="#claim">1 · Anatomy of a claim</a>
              <a href="#record">2 · Read the record</a>
              <a href="#layers">3 · Match evidence to risk</a>
              <a href="#labels">4 · Labels used here</a>
              <a href="#boundary">5 · Deployment boundary</a>
            </aside>

            <article className="technical-article">
              <section id="claim">
                <p className="eyebrow">01 · Claim anatomy</p>
                <h2>A useful claim names the mechanism, the evidence, and the boundary.</h2>
                <p className="article-lead">
                  “The system governs purchases” is too compressed to evaluate.
                  Which purchase tool? What rule and state did it use? Did SAGE
                  own the effect or only return advice? What happens on retry?
                  A precise claim separates those questions.
                </p>
                <div className="article-claim-stack">
                  <article><span>Mechanism</span><b>What SAGE actually controls</b><p>The declared policy views, scopes, pending lifecycle, governed effect, and record path.</p></article>
                  <article><span>Evidence</span><b>What was observed or tested</b><p>A concrete record, concurrency test, adapter contract run, or deployment trace.</p></article>
                  <article><span>Boundary</span><b>What must remain true around it</b><p>Complete mediation, sound provider contracts, trusted identity binding, and synchronized writes to policy state.</p></article>
                </div>
                <blockquote className="article-pullquote">
                  Strong technical evidence is narrow enough that another
                  reader can tell what would falsify it.
                </blockquote>
              </section>

              <section id="record">
                <p className="eyebrow">02 · Concrete record</p>
                <h2>Start with the artifact produced by the protected operation.</h2>
                <ArticleCode label="governance-record.json" language="JSON">
{`{
  "operation_id": "op_1048",
  "request": {
    "principal": "openclaw:buyer-alpha",
    "action": "spend.purchase",
    "amount_cents": 6000
  },
  "policy": {
    "id": "team_budget",
    "version": "f72b…",
    "rule": "needs_approval"
  },
  "view_reads": [{
    "view": "ledger.available_team_budget",
    "value_cents": 10000,
    "scope": "team-budget:research",
    "version": 12
  }],
  "resolution": {
    "decision": "allow",
    "evidence": {"ticket": "FIN-1832"}
  },
  "effect": {
    "receipt": "purchase:1048",
    "status": "succeeded"
  },
  "final_state": {
    "available_cents": 4000,
    "version": 13
  }
}`}
                </ArticleCode>
                <p>
                  This record supports a specific statement: the named
                  principal requested the named action, SAGE evaluated a
                  particular policy version against a certified budget view,
                  review resolved the same operation, and the configured effect
                  returned the recorded receipt before the policy state moved
                  to version 13.
                </p>
                <div className="article-definition-list">
                  <div><code>policy.version</code><p>Lets a reviewer identify the exact compiled rule rather than today&apos;s source file.</p></div>
                  <div><code>view_reads</code><p>Shows the policy-state facts and logical scope that justified the decision.</p></div>
                  <div><code>effect.receipt</code><p>Connects the decision to the result produced through the governed provider path.</p></div>
                </div>
              </section>

              <section id="layers">
                <p className="eyebrow">03 · Evidence layers</p>
                <h2>Different failure modes require different kinds of evidence.</h2>
                <div className="article-evidence-table" role="table" aria-label="Evidence layers and the questions they answer">
                  <div role="row"><span role="columnheader">Layer</span><span role="columnheader">Question answered</span><span role="columnheader">Typical artifact</span></div>
                  <div role="row"><b role="cell">Policy semantics</b><p role="cell">Does the rule produce the intended outcome for typed inputs?</p><code role="cell">policy tests</code></div>
                  <div role="row"><b role="cell">Concurrency</b><p role="cell">Can overlapping operations commit from stale policy state?</p><code role="cell">history + invariant</code></div>
                  <div role="row"><b role="cell">Pending resolution</b><p role="cell">Does approval preserve or revalidate the decision basis?</p><code role="cell">reservation trace</code></div>
                  <div role="row"><b role="cell">Retry and recovery</b><p role="cell">Can a lost response duplicate the governed effect?</p><code role="cell">idempotency replay</code></div>
                  <div role="row"><b role="cell">Adapter boundary</b><p role="cell">Does the framework return SAGE&apos;s result without a second effect path?</p><code role="cell">contract harness</code></div>
                </div>
                <p>
                  A polished demonstration can explain the mechanism, but it
                  does not replace the layer-specific evidence above. Likewise,
                  a unit test for a policy expression does not establish
                  correct concurrency or complete mediation in a deployment.
                </p>
              </section>

              <section id="labels">
                <p className="eyebrow">04 · Labels on this site</p>
                <h2>The label tells you how far the shown material currently reaches.</h2>
                <div className="article-label-list">
                  <article>
                    <StatusPill tone="sage">Reference implementation</StatusPill>
                    <div><b>Concrete mechanism</b><p>An executable SAGE workflow used to demonstrate runtime behavior, not a claim that every surrounding system is governed.</p></div>
                  </article>
                  <article>
                    <StatusPill tone="gold">Reference integration</StatusPill>
                    <div><b>Defined framework connection</b><p>An adapter profile with explicit identity, replay, effect-ownership, and compatibility boundaries.</p></div>
                  </article>
                  <article>
                    <StatusPill tone="coral">Reference pattern</StatusPill>
                    <div><b>Illustrative application</b><p>A practical governance design that still requires a configured provider and complete mediated path.</p></div>
                  </article>
                  <article>
                    <StatusPill tone="slate">Research preview</StatusPill>
                    <div><b>Active system work</b><p>A technically grounded project surface whose APIs, integrations, and evaluated coverage may continue to evolve.</p></div>
                  </article>
                </div>
              </section>

              <section id="boundary">
                <p className="eyebrow">05 · Deployment boundary</p>
                <h2>The guarantee follows the governed path—not the product name.</h2>
                <p>
                  SAGE&apos;s reasoning assumes complete mediation of the
                  effects and policy-state mutations covered by a provider
                  contract. Direct database writes, administrative scripts, or
                  alternate tools that mutate the same state must synchronize
                  through compatible contracts or remain outside the claim.
                </p>
                <ul className="article-check-list">
                  <li>The host binds principal and stable invocation identity from trusted context.</li>
                  <li>Policy views and effects declare sound logical scopes.</li>
                  <li>Every covered effect runs through the SAGE-mediated provider path.</li>
                  <li>Retries reuse the same operation identity instead of redispatching.</li>
                  <li>Organization owners supply and validate the actual business or regulatory restriction.</li>
                </ul>
                <p className="article-callout">
                  SAGE can enforce organization-approved controls. It does not
                  interpret law, choose an organization&apos;s obligations,
                  certify an external data source, or certify compliance.
                </p>
                <div className="article-reading-note is-conclusion">
                  <span>The diligence question</span>
                  <p>
                    Ask “which action path, which policy state, which provider
                    contract, and which evidence?” before asking whether SAGE
                    governs a broad domain.
                  </p>
                </div>
              </section>

              <div className="article-next">
                <span>Put the concepts into one request</span>
                <ArrowLink href="/resources/get-started/">
                  Start with one governed action
                </ArrowLink>
              </div>
            </article>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
