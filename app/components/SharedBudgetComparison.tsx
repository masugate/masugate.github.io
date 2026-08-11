"use client";

import {
  type UIEvent as ReactUIEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import type { Money } from "../data/contracts";
import {
  advancePlayback,
  replayPlayback,
  startPlayback,
  stepPlayback,
} from "./sharedBudgetPlayback.mjs";
import { useReducedMotion } from "./motion";
import styles from "./SharedBudgetComparison.module.css";

export type SharedBudgetPathId = "independent" | "governed";

export interface SharedBudgetRequest {
  id: string;
  agentLabel: string;
  actionLabel: string;
  amount: Money;
}

export interface SharedBudgetEvent {
  id: string;
  label: string;
  description: string;
  announcement: string;
}

export interface SharedBudgetPath {
  id: SharedBudgetPathId;
  label: string;
  title: string;
  description: string;
  events: readonly SharedBudgetEvent[];
  outcome: Readonly<{
    label: string;
    detail: string;
  }>;
}

export interface SharedBudgetComparisonProps {
  categoryLabel: string;
  capacity: Money;
  reviewAtOrAbove: Money;
  requests: readonly SharedBudgetRequest[];
  paths: readonly [SharedBudgetPath, SharedBudgetPath];
}

type PlaybackState = "idle" | "playing" | "paused" | "complete";

const playbackIntervalMs = 1_600;

function formatMoney(money: Money): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: money.currency,
    maximumFractionDigits: 0,
  }).format(money.minorUnits / 100);
}

function eventAnnouncement(path: SharedBudgetPath, eventIndex: number): string {
  const event = path.events[eventIndex];

  if (!event) {
    return `${path.label}. The complete static path is visible.`;
  }

  const eventText = event.announcement || `${event.label}. ${event.description}`;
  const isFinalEvent = eventIndex === path.events.length - 1;

  if (!isFinalEvent) {
    return `${path.label}. Step ${eventIndex + 1} of ${path.events.length}. ${eventText}`;
  }

  return `${path.label}. Step ${eventIndex + 1} of ${path.events.length}. ${eventText} ${path.outcome.label}. ${path.outcome.detail}`;
}

function initialProgress(
  paths: SharedBudgetComparisonProps["paths"],
): Record<SharedBudgetPathId, number> {
  return paths.reduce<Record<SharedBudgetPathId, number>>(
    (progress, path) => {
      progress[path.id] = -1;
      return progress;
    },
    { independent: -1, governed: -1 },
  );
}

export function SharedBudgetComparison({
  categoryLabel,
  capacity,
  reviewAtOrAbove,
  requests,
  paths,
}: SharedBudgetComparisonProps) {
  const comparisonId = useId();
  const pathsRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const [selectedPathId, setSelectedPathId] =
    useState<SharedBudgetPathId>(paths[0].id);
  const [progress, setProgress] = useState(() => initialProgress(paths));
  const [playbackState, setPlaybackState] =
    useState<PlaybackState>("idle");
  const [announcement, setAnnouncement] = useState("");

  const selectedPath =
    paths.find((path) => path.id === selectedPathId) ?? paths[0];
  const currentEventIndex = progress[selectedPath.id];
  const finalEventIndex = Math.max(selectedPath.events.length - 1, 0);
  const isPlaying = playbackState === "playing" && !reducedMotion;

  useEffect(() => {
    if (
      !isPlaying ||
      selectedPath.events.length === 0 ||
      currentEventIndex >= finalEventIndex
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      const next = advancePlayback(currentEventIndex, finalEventIndex);

      setProgress((current) => ({
        ...current,
        [selectedPath.id]: next.eventIndex,
      }));
      setPlaybackState(next.playbackState);
      setAnnouncement(eventAnnouncement(selectedPath, next.eventIndex));
    }, playbackIntervalMs);

    return () => window.clearTimeout(timer);
  }, [
    currentEventIndex,
    finalEventIndex,
    isPlaying,
    selectedPath,
  ]);

  function selectPath(path: SharedBudgetPath) {
    setSelectedPathId(path.id);
    setPlaybackState("idle");
    setAnnouncement(eventAnnouncement(path, progress[path.id]));

    const pathIndex = paths.findIndex(({ id }) => id === path.id);
    const pathsElement = pathsRef.current;

    if (pathIndex >= 0 && pathsElement) {
      pathsElement.scrollTo({
        left: pathIndex * pathsElement.clientWidth,
        behavior: reducedMotion ? "auto" : "smooth",
      });
    }
  }

  function syncPathFromScroll(event: ReactUIEvent<HTMLDivElement>) {
    const pathsElement = event.currentTarget;

    if (pathsElement.clientWidth === 0) {
      return;
    }

    const pathIndex = Math.round(
      pathsElement.scrollLeft / pathsElement.clientWidth,
    );
    const path = paths[pathIndex];

    if (!path || path.id === selectedPathId) {
      return;
    }

    setSelectedPathId(path.id);
    setPlaybackState("idle");
    setAnnouncement(eventAnnouncement(path, progress[path.id]));
  }

  function togglePlayback() {
    if (selectedPath.events.length === 0) {
      return;
    }

    if (isPlaying) {
      setPlaybackState("paused");
      setAnnouncement(
        `${selectedPath.label}. Playback paused at step ${currentEventIndex + 1} of ${selectedPath.events.length}.`,
      );
      return;
    }

    const next = startPlayback(
      currentEventIndex,
      finalEventIndex,
      reducedMotion,
    );
    setProgress((current) => ({
      ...current,
      [selectedPath.id]: next.eventIndex,
    }));
    setPlaybackState(next.playbackState);
    setAnnouncement(eventAnnouncement(selectedPath, next.eventIndex));
  }

  function stepBy(delta: -1 | 1) {
    if (selectedPath.events.length === 0) {
      return;
    }

    const next = stepPlayback(currentEventIndex, delta, finalEventIndex);

    setProgress((current) => ({
      ...current,
      [selectedPath.id]: next.eventIndex,
    }));
    setPlaybackState(next.playbackState);
    setAnnouncement(eventAnnouncement(selectedPath, next.eventIndex));
  }

  function replay() {
    if (selectedPath.events.length === 0) {
      return;
    }

    const next = replayPlayback(finalEventIndex, reducedMotion);

    setProgress((current) => ({
      ...current,
      [selectedPath.id]: next.eventIndex,
    }));
    setPlaybackState(next.playbackState);
    setAnnouncement(eventAnnouncement(selectedPath, next.eventIndex));
  }

  return (
    <div className={styles.comparison}>
      <div className={styles.fixture}>
        <div>
          <span className={styles.fixtureLabel}>Shared scenario fixture</span>
          <strong>
            {categoryLabel} budget: {formatMoney(capacity)}
          </strong>
          <small>
            Review at or above {formatMoney(reviewAtOrAbove)}
          </small>
        </div>
        <ul className={styles.requests} aria-label="Concurrent purchase requests">
          {requests.map((request) => (
            <li key={request.id}>
              <span>{request.agentLabel}</span>
              <strong>{request.actionLabel}</strong>
              <b>{formatMoney(request.amount)}</b>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.controls}>
        <div
          className={styles.pathSelector}
          role="group"
          aria-label="Select comparison path"
        >
          {paths.map((path) => {
            const panelId = `${comparisonId}-${path.id}`;

            return (
              <button
                aria-controls={panelId}
                aria-pressed={selectedPath.id === path.id}
                className={styles.pathButton}
                key={path.id}
                onClick={() => selectPath(path)}
                type="button"
              >
                {path.label}
              </button>
            );
          })}
        </div>

        <div
          className={styles.playbackControls}
          role="group"
          aria-label={`Playback controls for ${selectedPath.label}`}
        >
          <span className={styles.stepCount} aria-hidden="true">
            {currentEventIndex < 0
              ? "Static overview"
              : `Step ${Math.min(currentEventIndex + 1, selectedPath.events.length)} of ${selectedPath.events.length}`}
          </span>
          <button
            aria-label={
              reducedMotion
                ? `Show the complete ${selectedPath.label} path without timed playback`
                : isPlaying
                  ? `Pause ${selectedPath.label} playback`
                  : `Play ${selectedPath.label} playback`
            }
            aria-pressed={isPlaying}
            disabled={selectedPath.events.length === 0}
            onClick={togglePlayback}
            type="button"
          >
            <span
              aria-hidden="true"
              className={
                !reducedMotion && !isPlaying
                  ? styles.toggleLabel
                  : styles.toggleLabelHidden
              }
            >
              Play
            </span>
            <span
              aria-hidden="true"
              className={
                !reducedMotion && isPlaying
                  ? styles.toggleLabel
                  : styles.toggleLabelHidden
              }
            >
              Pause
            </span>
            <span
              aria-hidden="true"
              className={
                reducedMotion
                  ? styles.toggleLabel
                  : styles.toggleLabelHidden
              }
            >
              Show complete path
            </span>
          </button>
          <button
            disabled={currentEventIndex <= 0 || selectedPath.events.length === 0}
            onClick={() => stepBy(-1)}
            type="button"
          >
            Previous
          </button>
          <button
            disabled={
              currentEventIndex >= finalEventIndex ||
              selectedPath.events.length === 0
            }
            onClick={() => stepBy(1)}
            type="button"
          >
            Next
          </button>
          <button
            disabled={selectedPath.events.length === 0}
            onClick={replay}
            type="button"
          >
            Replay
          </button>
        </div>
      </div>

      <noscript>
        <p className={styles.noScriptNote}>
          Interactive emphasis is off, but both complete paths and outcomes
          are shown below.
        </p>
      </noscript>

      <div className={styles.progressSummary} aria-hidden="true">
        <span>Current emphasis</span>
        <strong>
          {currentEventIndex < 0
            ? "Complete static overview"
            : selectedPath.events[currentEventIndex]?.label}
        </strong>
      </div>

      <div
        aria-label="Comparison paths"
        className={styles.paths}
        onScrollEnd={syncPathFromScroll}
        ref={pathsRef}
        tabIndex={0}
      >
        {paths.map((path) => {
          const isSelected = selectedPath.id === path.id;
          const pathProgress = progress[path.id];
          const panelId = `${comparisonId}-${path.id}`;

          return (
            <article
              className={`${styles.path} ${
                path.id === "independent" ? styles.independent : styles.governed
              } ${isSelected ? styles.selected : ""}`}
              data-selected={isSelected ? "true" : "false"}
              id={panelId}
              key={path.id}
            >
              <header className={styles.pathHeader}>
                <span>{path.label}</span>
                <h3>{path.title}</h3>
                <p>{path.description}</p>
              </header>

              <ol className={styles.events}>
                {path.events.map((event, eventIndex) => {
                  const isCurrent =
                    isSelected && eventIndex === pathProgress;

                  return (
                    <li
                      aria-current={isCurrent ? "step" : undefined}
                      className={`${styles.event} ${
                        isCurrent ? styles.currentEvent : ""
                      }`}
                      key={event.id}
                    >
                      <div className={styles.eventMeta}>
                        <span>Step {String(eventIndex + 1).padStart(2, "0")}</span>
                      </div>
                      <strong>{event.label}</strong>
                    </li>
                  );
                })}
              </ol>

              <details className={styles.eventTranscript}>
                <summary>Full transcript</summary>
                <ol>
                  {path.events.map((event) => (
                    <li key={`${event.id}-transcript`}>
                      <strong>{event.label}:</strong> {event.description}
                    </li>
                  ))}
                </ol>
              </details>

              <div className={styles.outcome}>
                <span>Outcome</span>
                <strong>{path.outcome.label}</strong>
                <p>{path.outcome.detail}</p>
              </div>
            </article>
          );
        })}
      </div>

      <div aria-hidden="true" className={styles.outcomeSummary}>
        {paths.map((path) => (
          <div
            className={`${styles.outcomeSummaryItem} ${
              path.id === "independent"
                ? styles.outcomeSummaryIndependent
                : styles.outcomeSummaryGoverned
            }`}
            key={path.id}
          >
            <span>{path.label}</span>
            <strong>{path.outcome.label}</strong>
            <p>{path.outcome.detail}</p>
          </div>
        ))}
      </div>

      <p
        aria-atomic="true"
        aria-live="polite"
        className={styles.liveRegion}
        role="status"
      >
        {announcement}
      </p>
    </div>
  );
}
