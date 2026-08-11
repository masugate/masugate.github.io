"use client";

import { useEffect, useState } from "react";
import { useInViewOnce } from "./useInViewOnce";
import { useReducedMotion } from "./motion";

const runtimeSteps = [
  {
    label: "Request admitted",
    detail: "Route and arguments match the deployment catalog.",
  },
  {
    label: "Identity normalized",
    detail: "Trusted host context binds the fleet principal and replay identity.",
  },
  {
    label: "Scope resolved",
    detail: "Policy and effect both name team-budget:research.",
  },
  {
    label: "Policy state read",
    detail: "Certified view returns $100 available at version 12.",
  },
  {
    label: "Policy evaluated",
    detail: "$60 is affordable but crosses the $50 review threshold.",
  },
  {
    label: "Capacity reserved",
    detail: "$60 is held; later requests now see only $40 available.",
  },
  {
    label: "Review resolved",
    detail: "Finance selects allow once for this exact pending operation.",
  },
  {
    label: "Effect committed",
    detail: "The bounded connector returns receipt purchase:1048.",
  },
  {
    label: "Record finalized",
    detail: "Request, policy, review, effect, and final state remain linked.",
  },
];

function visibility(phase: number, threshold: number) {
  return phase >= threshold ? " is-visible" : "";
}

export function GovernedActionDemo() {
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(true);
  const reducedMotion = useReducedMotion();
  const { ref, hasEntered } = useInViewOnce<HTMLDivElement>();
  const visiblePhase = reducedMotion ? runtimeSteps.length - 1 : phase;
  const sequenceComplete = phase >= runtimeSteps.length - 1;

  useEffect(() => {
    if (!hasEntered || !playing || reducedMotion) return;
    const delay = sequenceComplete ? 1200 : 1250;
    const timer = window.setTimeout(() => {
      if (sequenceComplete) {
        setPlaying(false);
      } else {
        setPhase((current) => current + 1);
      }
    }, delay);
    return () => window.clearTimeout(timer);
  }, [hasEntered, playing, reducedMotion, sequenceComplete]);

  return (
    <div className="governed-action-demo" ref={ref}>
      <div className="governed-demo-toolbar">
        <div>
          <span>Live governed-operation trace</span>
          <strong>$60 purchase · research team</strong>
        </div>
        <div className="governed-demo-controls">
          <button
            disabled={reducedMotion || sequenceComplete}
            onClick={() => setPlaying((value) => !value)}
            type="button"
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
            disabled={reducedMotion}
            onClick={() => {
              setPhase(0);
              setPlaying(true);
            }}
            type="button"
          >
            Replay
          </button>
        </div>
      </div>

      <div className="governed-demo-scenario">
        <span>Available · $100</span>
        <span>Review above · $50</span>
        <span>Request · $60</span>
        <b>Current stage · {runtimeSteps[visiblePhase].label}</b>
      </div>

      <div className="governed-demo-grid">
        <section className="governed-request-panel">
          <div className="governed-panel-heading">
            <span>01</span>
            <b>Agent request</b>
          </div>
          <dl>
            <div><dt>principal</dt><dd>openclaw:buyer-alpha</dd></div>
            <div><dt>action</dt><dd>spend.purchase</dd></div>
            <div><dt>amount</dt><dd>6,000 cents</dd></div>
            <div><dt>merchant</dt><dd>office-supply-co</dd></div>
            <div><dt>stable call</dt><dd>call:7f3a</dd></div>
          </dl>
          <div className={`trusted-context-note${visibility(visiblePhase, 1)}`}>
            <span>Host-bound context</span>
            <b>Identity was not supplied by the model</b>
          </div>
        </section>

        <section className="governed-runtime-panel">
          <div className="governed-runtime-heading">
            <div>
              <span>SAGE runtime</span>
              <b>protected operation · op_1048</b>
            </div>
            <i className={visiblePhase >= 1 ? "is-live" : ""}>
              {visiblePhase >= 8 ? "terminal" : "processing"}
            </i>
          </div>
          <ol className="governed-runtime-steps">
            {runtimeSteps.map((step, index) => (
              <li
                className={`${index < visiblePhase ? "is-complete" : ""}${
                  index === visiblePhase ? " is-active" : ""
                }`}
                key={step.label}
              >
                <button
                  aria-label={`Show stage ${index + 1}: ${step.label}`}
                  onClick={() => {
                    setPhase(index);
                    setPlaying(false);
                  }}
                  type="button"
                >
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <b>{step.label}</b>
                    <small>{step.detail}</small>
                  </div>
                  <i aria-hidden="true">
                    {index < visiblePhase ? "✓" : index === visiblePhase ? "●" : "·"}
                  </i>
                </button>
              </li>
            ))}
          </ol>
        </section>

        <section className="governed-inspector-panel">
          <div className="governed-panel-heading">
            <span>02</span>
            <b>Decision inspector</b>
          </div>

          <article className={`inspector-card${visibility(visiblePhase, 2)}`}>
            <span>Resolved dependency</span>
            <code>team-budget:research</code>
            <small>policy read + effect write</small>
          </article>

          <article className={`inspector-card${visibility(visiblePhase, 3)}`}>
            <span>Certified view read</span>
            <div className="inspector-value">
              <strong>$100</strong>
              <small>version 12</small>
            </div>
            <code>ledger.available_team_budget</code>
          </article>

          <article className={`inspector-card decision-card${visibility(visiblePhase, 4)}`}>
            <span>Policy decision</span>
            <strong>{visiblePhase >= 6 ? "allow" : "escalate"}</strong>
            <small>
              {visiblePhase >= 6
                ? "review evidence bound to op_1048"
                : "amount exceeds the review threshold"}
            </small>
          </article>

          <article className={`inspector-card reservation-card${visibility(visiblePhase, 5)}`}>
            <span>Shared capacity</span>
            <div className="reservation-meter">
              <i />
              <b>$60 reserved · $40 available</b>
            </div>
          </article>
        </section>
      </div>

      <div className="governed-effect-row">
        <article className={`human-review-card${visibility(visiblePhase, 5)}`}>
          <span>Pending review</span>
          <b>Finance · allow once</b>
          <small>Bound to op_1048 and its $60 reservation</small>
        </article>
        <div className={`effect-path-line${visibility(visiblePhase, 6)}`}>
          <span>SAGE entitlement</span>
          <i />
          <b>one bounded dispatch</b>
        </div>
        <article className={`connector-receipt-card${visibility(visiblePhase, 7)}`}>
          <span>Connector receipt</span>
          <b>purchase:1048 · succeeded</b>
          <small>External result returned to the same operation</small>
        </article>
      </div>

      <div className={`governed-record-row${visibility(visiblePhase, 8)}`}>
        <div>
          <span>Governance record</span>
          <b>op_1048 · committed</b>
        </div>
        <dl>
          <div><dt>policy</dt><dd>team_budget@f72b…</dd></div>
          <div><dt>rule</dt><dd>needs_approval</dd></div>
          <div><dt>scope</dt><dd>team-budget:research@v12</dd></div>
          <div><dt>effect</dt><dd>purchase:1048</dd></div>
          <div><dt>final state</dt><dd>$40 available · v13</dd></div>
        </dl>
      </div>
    </div>
  );
}
