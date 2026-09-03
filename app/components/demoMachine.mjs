/**
 * The Demo state machine intentionally contains no scenario copy or rendering
 * data. The client boundary supplies the current timeline length and event
 * announcement while this reducer owns every transition and branch.
 */

export const demoStageIds = ["stage-1", "stage-2", "stage-3"];
export const demoInspectorIds = [
  "policy",
  "configuration",
  "trace",
  "record",
];

import {
  demoChoicePoints,
  demoTransitionPoints,
} from "../data/demoTopology.mjs";

export { demoChoicePoints, demoTransitionPoints };

function isOneOf(value, options) {
  return options.includes(value);
}

export function createDemoState(
  selectedStageId = "stage-1",
  selectedInspector = "policy",
  completedStageIds = [],
) {
  if (!isOneOf(selectedStageId, demoStageIds)) {
    throw new Error(`Unknown Demo stage: ${selectedStageId}`);
  }

  if (!isOneOf(selectedInspector, demoInspectorIds)) {
    throw new Error(`Unknown Demo inspector: ${selectedInspector}`);
  }

  const normalizedCompletedStageIds = demoStageIds.filter((stageId) =>
    completedStageIds.includes(stageId),
  );

  return {
    selectedStageId,
    completedStageIds: normalizedCompletedStageIds,
    eventIndex: -1,
    playback: "idle",
    stage2Review: "unresolved",
    stage3Calendar: "conflict",
    stage3Probe: "not-run",
    selectedInspector,
    detailLevel: "summary",
    announcement: "",
    announcementSerial: 0,
  };
}

export const initialDemoState = Object.freeze(createDemoState());

function unresolvedBarrier(state) {
  if (
    state.selectedStageId === "stage-2" &&
    state.stage2Review === "unresolved"
  ) {
    return demoChoicePoints.stage2Review;
  }

  if (
    state.selectedStageId === "stage-3" &&
    state.stage3Calendar === "conflict"
  ) {
    return demoChoicePoints.stage3Alternative;
  }

  return null;
}

function withAnnouncement(state, announcement) {
  if (announcement === undefined) return state;
  return {
    ...state,
    announcement,
    announcementSerial: state.announcementSerial + 1,
  };
}

function boundedIndex(index, lastIndex) {
  if (lastIndex < 0) return -1;
  return Math.min(Math.max(index, -1), lastIndex);
}

function playbackAt(state, eventIndex, lastIndex, advancing) {
  const barrier = unresolvedBarrier(state);

  if (barrier !== null && eventIndex >= barrier) {
    return {
      eventIndex: barrier,
      playback: "awaiting-choice",
    };
  }

  if (eventIndex >= lastIndex && lastIndex >= 0) {
    return {
      eventIndex: lastIndex,
      playback: "complete",
    };
  }

  return {
    eventIndex,
    playback: advancing ? "playing" : "paused",
  };
}

function withStageProgress(state, transition) {
  const next = { ...state, ...transition };

  if (
    transition.playback !== "complete" ||
    next.completedStageIds.includes(next.selectedStageId)
  ) {
    return next;
  }

  return {
    ...next,
    completedStageIds: [...next.completedStageIds, next.selectedStageId],
  };
}

export function demoReducer(state, action) {
  switch (action.type) {
    case "select-stage": {
      if (!isOneOf(action.stageId, demoStageIds)) return state;

      return {
        ...createDemoState(action.stageId, "policy", state.completedStageIds),
        announcement:
          action.announcement ?? `${action.stageId} selected and reset.`,
        announcementSerial: state.announcementSerial + 1,
      };
    }

    case "run": {
      if (action.lastIndex < 0 || state.playback === "complete") return state;

      const barrier = unresolvedBarrier(state);
      if (barrier !== null && state.eventIndex >= barrier) {
        return withAnnouncement(
          { ...state, eventIndex: barrier, playback: "awaiting-choice" },
          action.announcement,
        );
      }

      const eventIndex = state.eventIndex < 0 ? 0 : state.eventIndex;
      const transition = playbackAt(
        state,
        eventIndex,
        action.lastIndex,
        !action.reducedMotion,
      );

      if (action.reducedMotion && transition.playback === "playing") {
        transition.playback = "paused";
      }

      return withAnnouncement(
        withStageProgress(state, transition),
        action.announcement,
      );
    }

    case "pause": {
      if (state.playback !== "playing") return state;
      return withAnnouncement(
        { ...state, playback: "paused" },
        action.announcement,
      );
    }

    case "tick": {
      if (state.playback !== "playing") return state;
      const eventIndex = boundedIndex(state.eventIndex + 1, action.lastIndex);
      const transition = playbackAt(state, eventIndex, action.lastIndex, true);
      return withAnnouncement(
        withStageProgress(state, transition),
        action.announcement,
      );
    }

    case "step": {
      if (action.lastIndex < 0) return state;
      const barrier = unresolvedBarrier(state);

      if (
        action.direction === 1 &&
        barrier !== null &&
        state.eventIndex >= barrier
      ) {
        return withAnnouncement(
          { ...state, eventIndex: barrier, playback: "awaiting-choice" },
          action.announcement,
        );
      }

      const eventIndex = boundedIndex(
        state.eventIndex + action.direction,
        action.lastIndex,
      );
      const transition = playbackAt(
        state,
        eventIndex,
        action.lastIndex,
        false,
      );

      return withAnnouncement(
        withStageProgress(state, transition),
        action.announcement,
      );
    }

    case "reset": {
      const next = {
        ...createDemoState(
          state.selectedStageId,
          state.selectedInspector,
          state.completedStageIds,
        ),
        announcement: action.announcement ?? "Stage reset to its named fixture.",
        announcementSerial: state.announcementSerial + 1,
      };
      return next;
    }

    case "stage2-choice": {
      if (
        state.selectedStageId !== "stage-2" ||
        !isOneOf(action.choice, ["approved", "declined"]) ||
        state.stage2Review === action.choice ||
        state.eventIndex < demoChoicePoints.stage2Review
      ) {
        return state;
      }

      return withAnnouncement(
        {
          ...state,
          stage2Review: action.choice,
          eventIndex: demoTransitionPoints.stage2BranchStart,
          playback: action.resumePlayback === true ? "playing" : "paused",
          detailLevel: "summary",
        },
        action.announcement,
      );
    }

    case "stage3-alternative": {
      if (
        state.selectedStageId !== "stage-3" ||
        state.stage3Calendar !== "conflict" ||
        state.eventIndex < demoChoicePoints.stage3Alternative
      ) {
        return state;
      }

      return withAnnouncement(
        {
          ...state,
          stage3Calendar: "alternative",
          stage3Probe: "not-run",
          eventIndex: demoTransitionPoints.stage3AlternativeStart,
          playback: action.resumePlayback === true ? "playing" : "paused",
          detailLevel: "summary",
        },
        action.announcement,
      );
    }

    case "stage3-probe": {
      if (
        state.selectedStageId !== "stage-3" ||
        state.stage3Calendar !== "alternative" ||
        state.stage3Probe !== "not-run" ||
        state.eventIndex < demoTransitionPoints.stage3PrimaryComplete
      ) {
        return state;
      }

      return withAnnouncement(
        {
          ...state,
          stage3Probe: "denied",
          eventIndex: demoTransitionPoints.stage3ProbeStart,
          playback: action.resumePlayback === true ? "playing" : "paused",
          detailLevel: "summary",
        },
        action.announcement,
      );
    }

    case "select-inspector": {
      if (!isOneOf(action.inspectorId, demoInspectorIds)) return state;
      return {
        ...state,
        selectedInspector: action.inspectorId,
        detailLevel: "summary",
      };
    }

    case "toggle-detail":
      return {
        ...state,
        detailLevel:
          state.detailLevel === "summary" ? "technical" : "summary",
      };

    case "announce":
      return withAnnouncement(state, action.announcement);

    default:
      return state;
  }
}
