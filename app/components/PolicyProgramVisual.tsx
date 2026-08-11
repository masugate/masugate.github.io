import { HighlightedCode } from "./HighlightedCode";

export function PolicyProgramVisual() {
  return (
    <div
      className="policy-program-visual"
      aria-label="A plain-language budget rule is represented as a SAGE policy program and evaluated before an action connector runs"
    >
      <section className="policy-intent-panel">
        <span>01 · Business intent</span>
        <strong>“Keep the fleet inside its shared team budget.”</strong>
        <small>Readable by policy owners</small>
      </section>

      <div className="policy-program-connector" aria-hidden="true">
        <span>represented as</span>
        <b>→</b>
      </div>

      <section className="policy-code-window">
        <header>
          <span>team-budget.sage</span>
          <b>versioned policy</b>
        </header>
        <pre>
          <HighlightedCode
            code={`policy team_budget on transfer {
  deny over_budget when
    args.amount_cents >
    ledger.available_team_budget(
      principal.team, 24h);
  allow otherwise;
}`}
            language="SAGE policy"
          />
        </pre>
      </section>

      <div className="policy-program-connector" aria-hidden="true">
        <span>evaluated before</span>
        <b>→</b>
      </div>

      <section className="policy-runtime-panel">
        <span>03 · Runtime gate</span>
        <strong>Allow · deny · review</strong>
        <div className="runtime-path">
          <i />
          <b>SAGE</b>
          <i />
        </div>
        <small>Only the governed result reaches the configured connector</small>
      </section>
    </div>
  );
}
