import { HighlightedCode } from "./HighlightedCode";

const agents = [
  ["A1", "Purchasing", "Buy supplies"],
  ["A2", "Scheduling", "Book 10:00"],
  ["A3", "Workspace", "Write /team"],
];

export function FleetVisual() {
  return (
    <div
      className="fleet-visual"
      aria-label="Three agents send requests through one shared SAGE rule set, producing bounded actions"
    >
      <div className="fleet-visual-heading">
        <span>Fleet governance · live</span>
        <b>One policy set</b>
      </div>

      <div className="fleet-pipeline">
        <section className="fleet-column fleet-agents">
          <small>Agent fleet</small>
          {agents.map(([id, name, request]) => (
            <div className="fleet-agent-row" key={id}>
              <span>{id}</span>
              <div>
                <b>{name}</b>
                <small>{request}</small>
              </div>
            </div>
          ))}
        </section>

        <div className="fleet-connector" aria-hidden="true">
          <span>requests</span>
          <i>→</i>
        </div>

        <section className="fleet-column fleet-rules">
          <small>System enforcement</small>
          <div className="fleet-sage-mark">SAGE</div>
          <div className="fleet-rule-intent">
            <span>Business intent</span>
            <b>Stay inside the shared budget</b>
          </div>
          <div className="fleet-rule-program">
            <span>Versioned policy logic</span>
            <HighlightedCode
              code={`DENY requested > available
ESCALATE requested > $50
ALLOW otherwise`}
              language="SAGE policy"
            />
          </div>
        </section>

        <div className="fleet-connector" aria-hidden="true">
          <span>decisions</span>
          <i>→</i>
        </div>

        <section className="fleet-column fleet-outcomes">
          <small>Bounded actions</small>
          <div className="fleet-outcome is-allowed">
            <span>Purchase · $60</span>
            <b>review</b>
          </div>
          <div className="fleet-outcome is-declined">
            <span>Purchase · $60</span>
            <b>decline</b>
          </div>
          <div className="fleet-outcome is-allowed">
            <span>Write · /team</span>
            <b>allow</b>
          </div>
        </section>
      </div>

      <div className="fleet-visual-footer">
        <span>Policy is outside the agent prompt</span>
        <b>Request → runtime → effect</b>
      </div>
    </div>
  );
}
