import { ArticleCode, ArticleMeta } from "../../components/ArticleCode";
import { ArrowLink, PageHero, SiteFooter, SiteHeader } from "../../components/SiteChrome";

export default function GetStartedPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="Get Started · Walkthrough"
          title="Start with one bounded governed action."
          intro="This source-tree walkthrough connects a real SAGE policy, a typed client request, the possible lifecycle results, and the audit record you inspect afterward."
          aside={
            <ArticleMeta
              type="Getting started"
              audience="Builders and technical evaluators"
              readingTime="10 minutes"
            />
          }
        />

        <section className="section">
          <div className="shell article-layout">
            <aside className="article-toc">
              <span>In this walkthrough</span>
              <a href="#boundary">1 · Choose the boundary</a>
              <a href="#policy">2 · Read the policy</a>
              <a href="#request">3 · Submit the action</a>
              <a href="#result">4 · Inspect the result</a>
            </aside>

            <article className="technical-article">
              <section id="boundary">
                <p className="eyebrow">01 · Choose the boundary</p>
                <h2>Name the action SAGE will govern.</h2>
                <p>
                  Begin with a consequential action and the shared fact that
                  determines whether it remains permitted. In this example, a
                  transfer to a merchant consumes a team budget.
                </p>
                <div className="article-fact-grid">
                  <div><span>Principal</span><b>research buyer</b></div>
                  <div><span>Action</span><b>transfer</b></div>
                  <div><span>Shared state</span><b>team budget</b></div>
                  <div><span>Effect</span><b>bounded transfer</b></div>
                </div>
                <p className="article-callout">
                  The governed path must own the named effect. A detached
                  “allow” followed by an unrelated native tool call is not this
                  lifecycle.
                </p>
              </section>

              <section id="policy">
                <p className="eyebrow">02 · Read the policy</p>
                <h2>Keep the rule separate from the agent prompt.</h2>
                <ArticleCode label="team-budget.sage" language="SAGE policy">
{`policy team_transfer_guard on transfer {
  deny insufficient_funds when
    accounts.balance(principal.id) < args.amount_cents;

  deny daily_team_budget when
    args.amount_cents >
    ledger.available_team_budget(principal.team, 24h);

  allow otherwise;
}`}
                </ArticleCode>
                <p>
                  The policy is a bounded, side-effect-free program. The
                  `ledger` call is a registered certified view whose provider
                  also tells SAGE which logical budget scope it represents.
                </p>
              </section>

              <section id="request">
                <p className="eyebrow">03 · Submit the action</p>
                <h2>Use one stable identity for one logical attempt.</h2>
                <ArticleCode label="client.py" language="Python">
{`from sage_client import SageClient

async with SageClient(
    "http://127.0.0.1:8080",
    token="agent-token",
) as sage:
    result = await sage.execute(
        "transfer",
        {"receiver_id": "merchant", "amount_cents": 6000},
        stable_id="order-184:transfer-1",
        trace_id="trace-184",
    )`}
                </ArticleCode>
                <p>
                  In a trusted host adapter, the principal and stable source
                  invocation come from host context rather than model-supplied
                  arguments. Reuse the stable identity only to retry this exact
                  action and arguments.
                </p>
              </section>

              <section id="result">
                <p className="eyebrow">04 · Inspect the result</p>
                <h2>Treat the SAGE lifecycle result as authoritative.</h2>
                <ArticleCode label="result" language="Python">
{`if result.status == "pending":
    # A separately configured operator resolves the exact pending id.
    result = await approvals.resolve_pending(
        result.pending_id,
        approved=True,
        evidence={"ticket": "FIN-1832"},
    )

audit = await sage.get_audit(result.operation_id)
print(result.status, audit.decision, audit.view_reads)`}
                </ArticleCode>
                <ul className="article-check-list">
                  <li><b>committed</b> already contains the governed effect result.</li>
                  <li><b>denied</b> produces no governed effect.</li>
                  <li><b>pending</b> is not an allow and carries an exact operation locator.</li>
                  <li>The audit connects request, policy-state reads, decision, and result.</li>
                </ul>
              </section>

              <div className="article-next">
                <span>Continue learning</span>
                <ArrowLink href="/resources/governed-action-lifecycle/">
                  Inspect the protocol documents
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
