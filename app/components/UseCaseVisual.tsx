export function UseCaseVisual({
  slug,
}: {
  slug: "purchasing" | "calendar" | "workspace" | "business-controls";
}) {
  if (slug === "purchasing") {
    return (
      <div className="use-case-visual use-case-purchasing" aria-hidden="true">
        <div className="use-case-requests">
          <span>A1 <b>$60</b></span>
          <span>A2 <b>$60</b></span>
        </div>
        <div className="mini-budget">
          <span style={{ width: "60%" }} />
          <b>$40 left</b>
        </div>
        <div className="mini-decision">A2 · declined</div>
      </div>
    );
  }

  if (slug === "calendar") {
    return (
      <div className="use-case-visual use-case-calendar" aria-hidden="true">
        <div className="mini-time-labels"><span>09</span><span>10</span><span>11</span></div>
        <div className="mini-calendar-grid">
          <span className="mini-event mini-event-confirmed">A1 · confirmed</span>
          <span className="mini-event mini-event-conflict">A2 · conflict</span>
        </div>
        <div className="mini-rule-badge">one shared calendar</div>
      </div>
    );
  }

  if (slug === "workspace") {
    return (
      <div className="use-case-visual use-case-workspace" aria-hidden="true">
        <div className="mini-file-tree">
          <span>▾ workspace</span>
          <b>└ /team/report.md <i>write ✓</i></b>
          <b>└ /protected/config <i>review</i></b>
        </div>
      </div>
    );
  }

  return (
    <div className="use-case-visual use-case-controls" aria-hidden="true">
      <div className="mini-export">
        <span>Customer export</span>
        <b>→ new vendor</b>
      </div>
      <div className="mini-control-checks">
        <span>restricted data</span>
        <span>vendor unapproved</span>
      </div>
      <div className="mini-hold">Hold for review</div>
    </div>
  );
}

