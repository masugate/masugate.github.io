/** @typedef {"idle" | "playing" | "paused" | "complete"} PlaybackState */

/**
 * @param {number} eventIndex
 * @param {PlaybackState} playbackState
 */
function transition(eventIndex, playbackState) {
  return { eventIndex, playbackState };
}

/**
 * Starts timed emphasis, or selects the completed path without timing when
 * reduced motion is active.
 *
 * @param {number} currentEventIndex
 * @param {number} finalEventIndex
 * @param {boolean} reducedMotion
 */
export function startPlayback(
  currentEventIndex,
  finalEventIndex,
  reducedMotion,
) {
  if (finalEventIndex < 0) {
    return transition(-1, "idle");
  }

  if (reducedMotion) {
    return transition(finalEventIndex, "complete");
  }

  const eventIndex =
    currentEventIndex < 0 || currentEventIndex >= finalEventIndex
      ? 0
      : currentEventIndex;

  return transition(
    eventIndex,
    eventIndex >= finalEventIndex ? "complete" : "playing",
  );
}

/**
 * @param {number} currentEventIndex
 * @param {-1 | 1} delta
 * @param {number} finalEventIndex
 */
export function stepPlayback(currentEventIndex, delta, finalEventIndex) {
  if (finalEventIndex < 0) {
    return transition(-1, "idle");
  }

  const eventIndex = Math.min(
    Math.max(currentEventIndex + delta, 0),
    finalEventIndex,
  );

  return transition(
    eventIndex,
    eventIndex === finalEventIndex ? "complete" : "paused",
  );
}

/**
 * @param {number} finalEventIndex
 * @param {boolean} reducedMotion
 */
export function replayPlayback(finalEventIndex, reducedMotion) {
  if (finalEventIndex < 0) {
    return transition(-1, "idle");
  }

  return transition(
    0,
    finalEventIndex === 0
      ? "complete"
      : reducedMotion
        ? "paused"
        : "playing",
  );
}

/**
 * Advances once and stops at completion. Calling it again cannot loop.
 *
 * @param {number} currentEventIndex
 * @param {number} finalEventIndex
 */
export function advancePlayback(currentEventIndex, finalEventIndex) {
  if (finalEventIndex < 0) {
    return transition(-1, "idle");
  }

  const eventIndex = Math.min(
    Math.max(currentEventIndex + 1, 0),
    finalEventIndex,
  );

  return transition(
    eventIndex,
    eventIndex >= finalEventIndex ? "complete" : "playing",
  );
}
