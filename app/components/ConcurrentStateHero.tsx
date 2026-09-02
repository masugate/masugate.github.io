import { homepageContent } from "../data/homepage";
import styles from "./ConcurrentStateHero.module.css";

export interface ConcurrentStateHeroRequest {
  agentLabel: string;
  actionLabel: string;
  amountLabel: string;
}

export interface ConcurrentStateHeroProps {
  categoryLabel: string;
  initialCapacityLabel: string;
  remainingCapacityLabel: string;
  requests: readonly [ConcurrentStateHeroRequest, ConcurrentStateHeroRequest];
}

export function ConcurrentStateHero({
  categoryLabel,
  initialCapacityLabel,
  remainingCapacityLabel,
  requests,
}: ConcurrentStateHeroProps) {
  const copy = homepageContent.hero.diagram;
  const [firstRequest, secondRequest] = requests;

  return (
    <figure className={styles.figure}>
      <input
        aria-label={copy.motionControlLabel}
        className={styles.motionToggle}
        id="concurrent-state-motion"
        type="checkbox"
      />
      <div className={styles.figureHeader}>
        <span className={styles.liveLabel}>
          <span aria-hidden="true" className={styles.liveDot} />
          <span>{copy.liveLabel}</span>
        </span>
        <label
          className={styles.motionControl}
          htmlFor="concurrent-state-motion"
        >
          {copy.motionControlLabel}
        </label>
      </div>
      <div
        aria-label={copy.scrollLabel}
        className={styles.viewport}
        role="region"
        tabIndex={0}
      >
        <svg
          aria-describedby="concurrent-state-hero-description"
          aria-labelledby="concurrent-state-hero-title"
          className={styles.diagram}
          role="img"
          viewBox="0 0 760 500"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title id="concurrent-state-hero-title">{copy.title}</title>
          <desc id="concurrent-state-hero-description">{copy.description}</desc>
          <defs>
            <pattern
              height="28"
              id="concurrent-state-grid"
              patternUnits="userSpaceOnUse"
              width="28"
            >
              <path className={styles.gridLine} d="M 28 0 L 0 0 0 28" />
            </pattern>
            <marker
              id="concurrent-state-arrow"
              markerHeight="7"
              markerWidth="7"
              orient="auto-start-reverse"
              refX="6"
              refY="3.5"
            >
              <path className={styles.arrowHead} d="M0,0 L7,3.5 L0,7 Z" />
            </marker>
          </defs>

          <rect
            className={styles.grid}
            fill="url(#concurrent-state-grid)"
            height="500"
            width="760"
          />

          <path
            className={`${styles.flowLine} ${styles.readLine}`}
            d="M214 104 C276 104 272 200 318 200"
            markerEnd="url(#concurrent-state-arrow)"
          />
          <path
            className={`${styles.flowLine} ${styles.readLine} ${styles.readLineSecond}`}
            d="M214 346 C276 346 272 250 318 250"
            markerEnd="url(#concurrent-state-arrow)"
          />
          <path
            className={`${styles.flowLine} ${styles.commitLine}`}
            d="M486 200 C530 200 525 104 558 104"
            markerEnd="url(#concurrent-state-arrow)"
          />
          <path
            className={`${styles.flowLine} ${styles.denyLine}`}
            d="M486 250 C530 250 525 346 558 346"
            markerEnd="url(#concurrent-state-arrow)"
          />

          <g className={styles.agentNode}>
            <rect height="116" rx="16" width="184" x="30" y="46" />
            <text className={styles.microText} x="50" y="72">
              01 / {copy.agentLabel}
            </text>
            <text className={styles.nodeTitle} x="50" y="101">
              {firstRequest.agentLabel}
            </text>
            <text className={styles.nodeDetail} x="50" y="125">
              {firstRequest.actionLabel}
            </text>
            <text className={styles.amountText} x="50" y="148">
              {firstRequest.amountLabel} {copy.requestLabel.toLowerCase()}
            </text>
          </g>

          <g className={styles.agentNode}>
            <rect height="116" rx="16" width="184" x="30" y="288" />
            <text className={styles.microText} x="50" y="314">
              02 / {copy.agentLabel}
            </text>
            <text className={styles.nodeTitle} x="50" y="343">
              {secondRequest.agentLabel}
            </text>
            <text className={styles.nodeDetail} x="50" y="367">
              {secondRequest.actionLabel}
            </text>
            <text className={styles.amountText} x="50" y="390">
              {secondRequest.amountLabel} {copy.requestLabel.toLowerCase()}
            </text>
          </g>

          <g className={styles.stateNode}>
            <rect height="164" rx="20" width="168" x="318" y="143" />
            <text className={styles.microText} x="338" y="172">
              {copy.sharedStateLabel}
            </text>
            <text className={styles.stateTitle} x="338" y="202">
              {categoryLabel} {copy.budgetLabel}
            </text>
            <text className={styles.initialAmount} x="338" y="246">
              {initialCapacityLabel}
            </text>
            <text className={styles.stateCaption} x="338" y="268">
              {copy.initialStateLabel}
            </text>
            <line className={styles.stateDivider} x1="338" x2="466" y1="282" y2="282" />
            <text className={styles.protectedAmount} x="338" y="299">
              → {remainingCapacityLabel} · {copy.protectedStateLabel}
            </text>
          </g>

          <g className={`${styles.outcomeNode} ${styles.committedNode}`}>
            <rect height="116" rx="16" width="172" x="558" y="46" />
            <text className={styles.microText} x="578" y="73">
              {copy.firstOutcomeLabel}
            </text>
            <text className={styles.outcomeTitle} x="578" y="106">
              {copy.committedStateLabel}
            </text>
            <text className={styles.outcomeDetail} x="578" y="132">
              {copy.firstOutcomeDetail}
            </text>
          </g>

          <g className={`${styles.outcomeNode} ${styles.deniedNode}`}>
            <rect height="116" rx="16" width="172" x="558" y="288" />
            <text className={styles.microText} x="578" y="315">
              {copy.secondOutcomeLabel}
            </text>
            <text className={styles.outcomeTitle} x="578" y="348">
              {copy.caughtStateLabel}
            </text>
            <text className={styles.outcomeDetail} x="578" y="374">
              {remainingCapacityLabel} {copy.insufficientLabel} {secondRequest.amountLabel}
            </text>
          </g>

          <g className={styles.timeline}>
            <line x1="112" x2="648" y1="450" y2="450" />
            <circle cx="112" cy="450" r="6" />
            <circle cx="380" cy="450" r="6" />
            <circle cx="648" cy="450" r="6" />
            <text x="112" y="478">{copy.timelineLabels[0]}</text>
            <text textAnchor="middle" x="380" y="478">{copy.timelineLabels[1]}</text>
            <text textAnchor="end" x="648" y="478">{copy.timelineLabels[2]}</text>
          </g>
        </svg>
      </div>
      <figcaption>{copy.caption}</figcaption>
    </figure>
  );
}
