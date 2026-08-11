"use client";

import { useEffect, useState } from "react";
import { useInViewOnce } from "./useInViewOnce";
import { useReducedMotion } from "./motion";

type Variant = "calendar" | "workspace" | "business-controls";

const showcaseCopy: Record<Variant, { kicker: string; rule: string }> = {
  calendar: {
    kicker: "Calendar coordination",
    rule: "No conflicts on the shared calendar",
  },
  workspace: {
    kicker: "Workspace boundaries",
    rule: "Write to /team · review protected changes",
  },
  "business-controls": {
    kicker: "Business restrictions",
    rule: "Restricted data + new vendor → human review",
  },
};

function CalendarScene({ phase }: { phase: number }) {
  return (
    <div className="showcase-scene calendar-scene">
      <div className="showcase-requests">
        <article className={phase >= 1 ? "is-visible" : ""}>
          <span>A1 · Recruiting</span><b>Book 10:00</b>
        </article>
        <article className={phase >= 2 ? "is-visible" : ""}>
          <span>A2 · Sales</span><b>Book 10:00</b>
        </article>
      </div>
      <div className="calendar-board">
        <div className="calendar-head"><span>Shared calendar</span><b>Tuesday</b></div>
        <div className="calendar-row"><time>09:00</time></div>
        <div className="calendar-row">
          <time>10:00</time>
          <div className={`calendar-event ${phase >= 1 ? "is-visible" : ""}`}>
            <span>Recruiting interview</span><b>confirmed</b>
          </div>
          <div className={`calendar-conflict ${phase >= 2 ? "is-visible" : ""} ${phase >= 4 ? "is-declined" : ""}`}>
            <span>Sales review</span><b>{phase >= 4 ? "declined" : "checking…"}</b>
          </div>
        </div>
        <div className="calendar-row"><time>11:00</time></div>
      </div>
      <div className={`showcase-rule-check ${phase >= 3 ? "is-visible" : ""}`}>
        <span>SAGE checks current state</span>
        <b>10:00 is occupied</b>
      </div>
      <div className={`showcase-result ${phase >= 4 ? "is-visible" : ""}`}>
        <span>Result</span><b>One event confirmed · conflict declined</b>
      </div>
    </div>
  );
}

function WorkspaceScene({ phase }: { phase: number }) {
  return (
    <div className="showcase-scene workspace-scene">
      <div className="showcase-requests">
        <article className={phase >= 1 ? "is-visible" : ""}>
          <span>A1 · Analyst</span><b>Write /team/report.md</b>
        </article>
        <article className={phase >= 2 ? "is-visible" : ""}>
          <span>A2 · Cleanup</span><b>Delete /protected/config</b>
        </article>
      </div>
      <div className="workspace-board">
        <div className="workspace-head"><span>Shared workspace</span><b>current state</b></div>
        <div className="file-row file-root"><span>▾</span><b>workspace</b></div>
        <div className={`file-row ${phase >= 3 ? "is-updated" : ""}`}>
          <span>├</span><b>/team/report.md</b><small>{phase >= 3 ? "written ✓" : "ready"}</small>
        </div>
        <div className={`file-row ${phase >= 4 ? "is-held" : ""}`}>
          <span>└</span><b>/protected/config</b><small>{phase >= 4 ? "review required" : "protected"}</small>
        </div>
      </div>
      <div className={`showcase-rule-check ${phase >= 3 ? "is-visible" : ""}`}>
        <span>SAGE applies path rules</span>
        <b>/team allowed · /protected held</b>
      </div>
      <div className={`showcase-result ${phase >= 4 ? "is-visible" : ""}`}>
        <span>Result</span><b>One write performed · one delete not sent</b>
      </div>
    </div>
  );
}

function BusinessControlsScene({ phase }: { phase: number }) {
  return (
    <div className="showcase-scene controls-scene">
      <div className={`control-request-card ${phase >= 1 ? "is-visible" : ""}`}>
        <span>A1 · Customer operations</span>
        <strong>Send customer export</strong>
        <small>Destination · New analytics vendor</small>
      </div>
      <div className="control-check-list">
        <div className={phase >= 2 ? "is-visible" : ""}>
          <span>01 · Data classification</span><b>restricted</b>
        </div>
        <div className={phase >= 3 ? "is-visible" : ""}>
          <span>02 · Counterparty</span><b>not approved</b>
        </div>
        <div className={phase >= 4 ? "is-visible" : ""}>
          <span>03 · Required route</span><b>human review</b>
        </div>
      </div>
      <div className={`connector-stop ${phase >= 4 ? "is-visible" : ""}`}>
        <span>Action connector</span><i /><b>not called</b>
      </div>
      <div className={`showcase-result ${phase >= 4 ? "is-visible" : ""}`}>
        <span>Result</span><b>Export held with the applied facts attached</b>
      </div>
    </div>
  );
}

export function UseCaseShowcase({ variant }: { variant: Variant }) {
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(true);
  const reducedMotion = useReducedMotion();
  const { ref, hasEntered } = useInViewOnce<HTMLDivElement>();
  const sequenceComplete = phase >= 4;

  useEffect(() => {
    if (!hasEntered || !playing || reducedMotion) return;
    const timer = window.setTimeout(() => {
      if (phase >= 4) {
        setPlaying(false);
      } else {
        setPhase((current) => current + 1);
      }
    }, phase >= 4 ? 1000 : 1400);
    return () => window.clearTimeout(timer);
  }, [hasEntered, phase, playing, reducedMotion]);

  const copy = showcaseCopy[variant];
  const visiblePhase = reducedMotion ? 4 : phase;

  return (
    <div className={`use-case-showcase showcase-${variant}`} ref={ref}>
      <div className="showcase-toolbar">
        <div>
          <span>{copy.kicker}</span>
          <strong>{copy.rule}</strong>
        </div>
        <div className="showcase-controls">
          <button
            type="button"
            disabled={reducedMotion || sequenceComplete}
            onClick={() => setPlaying((value) => !value)}
          >
            {reducedMotion
              ? "Motion reduced"
              : sequenceComplete
                ? "Complete"
                : playing
                  ? "Pause"
                  : "Play"}
          </button>
          <button
            type="button"
            disabled={reducedMotion}
            onClick={() => {
              setPhase(0);
              setPlaying(true);
            }}
          >
            Replay
          </button>
        </div>
      </div>
      <div className="showcase-progress" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((step) => (
          <span className={visiblePhase >= step ? "is-active" : ""} key={step} />
        ))}
      </div>
      {variant === "calendar" && <CalendarScene phase={visiblePhase} />}
      {variant === "workspace" && <WorkspaceScene phase={visiblePhase} />}
      {variant === "business-controls" && <BusinessControlsScene phase={visiblePhase} />}
    </div>
  );
}
