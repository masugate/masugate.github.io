export function CapabilityVisual({
  kind,
}: {
  kind: "rules" | "coordination" | "actions";
}) {
  if (kind === "rules") {
    return (
      <div className="capability-visual capability-rules" aria-hidden="true">
        <div className="capability-agent-stack">
          <span>A1</span>
          <span>A2</span>
          <span>A3</span>
        </div>
        <div className="capability-arrow">apply</div>
        <div className="capability-rule-sheet">
          <b>Shared rules</b>
          <span>$100 budget</span>
          <span>Review over $50</span>
        </div>
      </div>
    );
  }

  if (kind === "coordination") {
    return (
      <div className="capability-visual capability-coordination" aria-hidden="true">
        <div className="capability-request">
          <span>A1</span>
          <b>− $60</b>
          <small>allowed</small>
        </div>
        <div className="capability-balance">
          <small>available</small>
          <strong>$40</strong>
        </div>
        <div className="capability-request is-declined">
          <span>A2</span>
          <b>− $60</b>
          <small>declined</small>
        </div>
      </div>
    );
  }

  return (
    <div className="capability-visual capability-actions" aria-hidden="true">
      <div className="capability-action-request">
        <small>Agent request</small>
        <b>Create order</b>
      </div>
      <div className="capability-gate">
        <span>SAGE</span>
        <b>allow</b>
      </div>
      <div className="capability-connector">
        <span>Connector</span>
        <b>Order #1482</b>
        <small>result recorded</small>
      </div>
    </div>
  );
}

