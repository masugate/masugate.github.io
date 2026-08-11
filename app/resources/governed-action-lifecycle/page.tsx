import { ArticleCode, ArticleMeta } from "../../components/ArticleCode";
import { ArrowLink, PageHero, SiteFooter, SiteHeader } from "../../components/SiteChrome";

export default function GovernedActionLifecyclePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <PageHero
          eyebrow="Technical article · Governed protocol"
          title="Inside the documents of a governed action."
          intro="A concrete walk through request, pending review, resolution, effect commitment, and audit—and why these documents must describe one operation rather than a chain of loosely related calls."
          aside={
            <ArticleMeta
              type="Protocol deep dive"
              audience="Integrators and platform engineers"
              readingTime="15 minutes"
            />
          }
        />

        <section className="section">
          <div className="shell article-layout">
            <aside className="article-toc">
              <span>In this article</span>
              <a href="#one-operation">1 · Why one operation matters</a>
              <a href="#request">2 · Action request</a>
              <a href="#pending">3 · Pending result</a>
              <a href="#resolve">4 · Resolution</a>
              <a href="#committed">5 · Committed result</a>
              <a href="#audit">6 · Audit continuity</a>
            </aside>

            <article className="technical-article">
              <section id="one-operation">
                <p className="eyebrow">01 · The core idea</p>
                <h2>The API call is not asking for advice. It is opening a governed operation.</h2>
                <p className="article-lead">
                  A familiar authorization pattern returns “allowed,” then
                  leaves the caller to perform the action later. That gap is
                  dangerous when shared state can change, approval can wait,
                  or a network retry can repeat the effect.
                </p>
                <div className="article-inline-diagram" aria-label="A governed request remains one operation through decision, review, effect, and record">
                  <span>request</span><i>→</i>
                  <span>decision</span><i>→</i>
                  <span>review</span><i>→</i>
                  <span>effect</span><i>→</i>
                  <span>record</span>
                </div>
                <p>
                  SAGE gives every attempt one operation identity and carries
                  it through the entire lifecycle. A denial ends without an
                  effect. A pending result names durable work. A committed
                  result already contains the outcome of the governed effect.
                </p>
                <blockquote className="article-pullquote">
                  The caller receives a lifecycle result—not an allow token it
                  can spend somewhere else.
                </blockquote>
              </section>

              <section id="request">
                <p className="eyebrow">02 · Request</p>
                <h2>One typed proposal with a stable identity.</h2>
                <ArticleCode label="action-request.json" language="JSON">
{`{
  "action": "transfer",
  "args": {
    "receiver_id": "merchant",
    "amount_cents": 2500
  },
  "idempotency_key": "mcp:req-7:attempt-1",
  "trace_id": "trace-2026-07-12-0007"
}`}
                </ArticleCode>
                <p>
                  Authentication assigns the principal outside this body. A
                  trusted adapter derives it from the host session rather than
                  accepting a model-authored identity field. The action and
                  arguments select a registered policy and effect contract.
                </p>
                <div className="article-definition-list">
                  <div><code>idempotency_key</code><p>Names one logical effect attempt. Retrying the same request replays or resumes it instead of starting a second transfer.</p></div>
                  <div><code>trace_id</code><p>Correlates surrounding workflow activity, but does not itself grant authority or define replay identity.</p></div>
                  <div><code>args</code><p>Must match the admitted action schema. Reusing the key with different arguments is a conflict.</p></div>
                </div>
              </section>

              <section id="pending">
                <p className="eyebrow">03 · Pending</p>
                <h2>Escalation creates durable work—not an optimistic success.</h2>
                <ArticleCode label="pending-response.json" language="JSON">
{`{
  "operation_id": "3333…3333",
  "status": "pending",
  "decision": {
    "effect": "escalate",
    "policy_id": "approval_transfer",
    "rule_id": "needs_approval"
  },
  "pending_id": "4444…4444",
  "resolution_plan": "reservation-proof",
  "audit_ref": "/v1/audit/3333…3333"
}`}
                </ArticleCode>
                <p>
                  The pending identifier, policy decision, resolution plan, and
                  audit reference all point back to the same protected
                  operation. The adapter should surface this state or connect
                  it to an approved review experience; it must not interpret
                  pending as permission to call a native effect tool.
                </p>
                <div className="article-concept-grid">
                  <article>
                    <span>Reservation path</span>
                    <b>Preserve the basis</b>
                    <p>Capacity is held while review waits, so later requests see the remaining amount.</p>
                  </article>
                  <article>
                    <span>Revalidation path</span>
                    <b>Check the basis again</b>
                    <p>The state is re-read at resolution; approval can no longer commit if the rule no longer holds.</p>
                  </article>
                </div>
              </section>

              <section id="resolve">
                <p className="eyebrow">04 · Resolution</p>
                <h2>A separately authorized operator decides this exact pending item.</h2>
                <ArticleCode label="resolve-request.json" language="JSON">
{`{
  "approved": true,
  "evidence": {
    "reviewer": "on-call-finance",
    "ticket": "FIN-1832"
  }
}`}
                </ArticleCode>
                <p>
                  Resolution evidence explains who or what completed the
                  configured review step. It does not float free as a reusable
                  credential. SAGE consumes a valid reservation or revalidates
                  the request&apos;s policy-state basis before committing the
                  effect.
                </p>
                <p className="article-callout">
                  Human approval answers “should this exact operation proceed?”
                  It does not answer whether some later operation with different
                  arguments should proceed.
                </p>
              </section>

              <section id="committed">
                <p className="eyebrow">05 · Committed</p>
                <h2>The terminal response already contains the governed effect result.</h2>
                <ArticleCode label="committed-response.json" language="JSON">
{`{
  "operation_id": "1111…1111",
  "status": "committed",
  "decision": {
    "effect": "allow",
    "policy_id": "team_budget",
    "rule_id": "otherwise"
  },
  "payload": {
    "receiver_id": "merchant",
    "amount_cents": 2500
  },
  "audit_ref": "/v1/audit/1111…1111",
  "replayed": false
}`}
                </ArticleCode>
                <p>
                  “Committed” means the configured provider effect and its
                  policy-state transition have completed through the governed
                  path. If the client loses this response, retrying with the
                  same identity returns the existing operation rather than
                  issuing the transfer again.
                </p>
                <div className="article-reading-note">
                  <span>Adapter rule</span>
                  <p>
                    Return this authoritative result to the framework. Do not
                    see <code>allow</code> and then call the original effect
                    tool independently.
                  </p>
                </div>
              </section>

              <section id="audit">
                <p className="eyebrow">06 · Audit continuity</p>
                <h2>The record is useful because it describes the protected operation—not a reconstructed story.</h2>
                <div className="article-record-map">
                  <span>request identity</span>
                  <span>policy + version</span>
                  <span>view reads + scopes</span>
                  <span>decision + review</span>
                  <span>effect receipt</span>
                  <span>terminal position</span>
                </div>
                <ArticleCode label="audit-excerpt.json" language="JSON">
{`{
  "operation_id": "1111…1111",
  "principal": "openclaw:buyer-alpha",
  "policy_version": "team_budget@f72b…",
  "view_reads": [{
    "view": "ledger.available_team_budget",
    "value": 10000,
    "scope": "team-budget:research",
    "version": 12
  }],
  "effect_receipt": "transfer:1111",
  "final_state_version": 13
}`}
                </ArticleCode>
                <p>
                  This is the audit counterpart of runtime enforcement. It
                  names the certified facts used for the decision, the exact
                  policy version, the effect that became visible, and the state
                  transition later requests must observe.
                </p>
                <ul className="article-check-list">
                  <li>Use the same stable identity only for the same logical request and arguments.</li>
                  <li>Treat pending as durable unresolved work—not allow, deny, or failure.</li>
                  <li>Return SAGE&apos;s committed payload instead of dispatching a second effect.</li>
                  <li>Keep direct writes to governed policy state inside synchronized provider paths.</li>
                </ul>
              </section>

              <div className="article-next">
                <span>See why concurrent actions need coordination</span>
                <ArrowLink href="/resources/technical-foundation/">
                  Read the technical foundation
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
