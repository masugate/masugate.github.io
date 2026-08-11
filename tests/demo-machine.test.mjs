import assert from "node:assert/strict";
import test from "node:test";
import {
  createDemoState,
  demoChoicePoints,
  demoReducer,
  demoTransitionPoints,
} from "../app/components/demoMachine.mjs";

const stageOneLastIndex = demoTransitionPoints.stage1Complete;
const stageTwoApprovedLastIndex = demoTransitionPoints.stage2ApprovedComplete;
const stageTwoDeclinedLastIndex = demoTransitionPoints.stage2DeclinedComplete;
const stageThreeLastIndex = demoTransitionPoints.stage3ProbeComplete;

function reduce(state, action) {
  return demoReducer(state, action);
}

function tickToStop(state, lastIndex) {
  let current = state;
  let remaining = 30;

  while (current.playback === "playing" && remaining > 0) {
    current = reduce(current, { type: "tick", lastIndex });
    remaining -= 1;
  }

  assert.ok(remaining > 0, "playback must be bounded and never loop");
  return current;
}

test("Demo machine runs, pauses, steps, resets, and selects stages deterministically", () => {
  let state = createDemoState();
  assert.equal(state.selectedStageId, "stage-1");
  assert.equal(state.eventIndex, -1);
  assert.equal(state.playback, "idle");

  state = reduce(state, {
    type: "run",
    lastIndex: stageOneLastIndex,
    reducedMotion: false,
  });
  assert.equal(state.eventIndex, 0);
  assert.equal(state.playback, "playing");

  state = reduce(state, { type: "pause" });
  assert.equal(state.eventIndex, 0);
  assert.equal(state.playback, "paused");

  state = reduce(state, {
    type: "step",
    direction: 1,
    lastIndex: stageOneLastIndex,
  });
  assert.equal(state.eventIndex, 1);
  assert.equal(state.playback, "paused");

  state = reduce(state, {
    type: "step",
    direction: -1,
    lastIndex: stageOneLastIndex,
  });
  assert.equal(state.eventIndex, 0);
  assert.equal(state.playback, "paused");

  state = reduce(state, {
    type: "step",
    direction: -1,
    lastIndex: stageOneLastIndex,
  });
  assert.equal(state.eventIndex, -1);
  assert.equal(state.playback, "paused");

  state = reduce(state, {
    type: "select-inspector",
    inspectorId: "record",
  });
  state = reduce(state, { type: "toggle-detail" });
  assert.equal(state.selectedInspector, "record");
  assert.equal(state.detailLevel, "technical");

  state = reduce(state, { type: "reset" });
  assert.equal(state.eventIndex, -1);
  assert.equal(state.playback, "idle");
  assert.equal(state.selectedInspector, "record");
  assert.equal(state.detailLevel, "summary");

  state = reduce(state, { type: "select-stage", stageId: "stage-2" });
  assert.equal(state.selectedStageId, "stage-2");
  assert.equal(state.selectedInspector, "policy");
  assert.equal(state.stage2Review, "unresolved");
});

test("Stage 1 completes once and cannot loop", () => {
  let state = reduce(createDemoState(), {
    type: "run",
    lastIndex: stageOneLastIndex,
    reducedMotion: false,
  });

  state = tickToStop(state, stageOneLastIndex);
  assert.equal(state.eventIndex, stageOneLastIndex);
  assert.equal(state.playback, "complete");
  assert.deepEqual(state.completedStageIds, ["stage-1"]);

  const afterExtraTick = reduce(state, {
    type: "tick",
    lastIndex: stageOneLastIndex,
  });
  const afterExtraRun = reduce(state, {
    type: "run",
    lastIndex: stageOneLastIndex,
    reducedMotion: false,
  });
  assert.deepEqual(afterExtraTick, state);
  assert.deepEqual(afterExtraRun, state);
});

test("Completed presentation states survive predictable stage fixture resets", () => {
  let state = reduce(createDemoState(), {
    type: "run",
    lastIndex: stageOneLastIndex,
    reducedMotion: false,
  });
  state = tickToStop(state, stageOneLastIndex);

  state = reduce(state, { type: "select-stage", stageId: "stage-2" });
  assert.equal(state.selectedStageId, "stage-2");
  assert.equal(state.eventIndex, -1);
  assert.equal(state.playback, "idle");
  assert.deepEqual(state.completedStageIds, ["stage-1"]);

  state = reduce(state, { type: "select-stage", stageId: "stage-1" });
  assert.equal(state.eventIndex, -1);
  assert.equal(state.playback, "idle");
  assert.deepEqual(state.completedStageIds, ["stage-1"]);

  state = reduce(state, { type: "reset" });
  assert.deepEqual(state.completedStageIds, ["stage-1"]);
});

test("Stage 2 halts for review and supports replaceable approve and decline branches", () => {
  let state = reduce(createDemoState(), {
    type: "select-stage",
    stageId: "stage-2",
  });
  state = reduce(state, {
    type: "run",
    lastIndex: demoChoicePoints.stage2Review,
    reducedMotion: false,
  });
  state = tickToStop(state, demoChoicePoints.stage2Review);

  assert.equal(state.eventIndex, demoChoicePoints.stage2Review);
  assert.equal(state.playback, "awaiting-choice");
  assert.equal(state.stage2Review, "unresolved");

  const blocked = reduce(state, {
    type: "step",
    direction: 1,
    lastIndex: demoChoicePoints.stage2Review,
  });
  assert.equal(blocked.eventIndex, demoChoicePoints.stage2Review);
  assert.equal(blocked.playback, "awaiting-choice");

  state = reduce(state, {
    type: "stage2-choice",
    choice: "approved",
  });
  assert.equal(state.stage2Review, "approved");
  assert.equal(state.eventIndex, demoTransitionPoints.stage2BranchStart);
  assert.equal(state.playback, "paused");

  state = reduce(state, {
    type: "run",
    lastIndex: stageTwoApprovedLastIndex,
    reducedMotion: false,
  });
  state = tickToStop(state, stageTwoApprovedLastIndex);
  assert.equal(state.eventIndex, stageTwoApprovedLastIndex);
  assert.equal(state.playback, "complete");

  state = reduce(state, {
    type: "stage2-choice",
    choice: "declined",
  });
  assert.equal(state.stage2Review, "declined");
  assert.equal(state.eventIndex, demoTransitionPoints.stage2BranchStart);
  assert.equal(state.playback, "paused");

  state = reduce(state, {
    type: "run",
    lastIndex: stageTwoDeclinedLastIndex,
    reducedMotion: false,
  });
  state = tickToStop(state, stageTwoDeclinedLastIndex);
  assert.equal(state.eventIndex, stageTwoDeclinedLastIndex);
  assert.equal(state.playback, "complete");
});

test("Stage 3 halts after the conflict, then appends one optional probe", () => {
  let state = reduce(createDemoState(), {
    type: "select-stage",
    stageId: "stage-3",
  });
  state = reduce(state, {
    type: "run",
    lastIndex: demoChoicePoints.stage3Alternative,
    reducedMotion: false,
  });
  state = tickToStop(state, demoChoicePoints.stage3Alternative);

  assert.equal(state.eventIndex, demoChoicePoints.stage3Alternative);
  assert.equal(state.playback, "awaiting-choice");
  assert.equal(state.stage3Calendar, "conflict");

  state = reduce(state, {
    type: "stage3-alternative",
  });
  assert.equal(state.stage3Calendar, "alternative");
  assert.equal(state.eventIndex, demoTransitionPoints.stage3AlternativeStart);
  assert.equal(state.playback, "paused");

  state = reduce(state, {
    type: "run",
    lastIndex: demoTransitionPoints.stage3PrimaryComplete,
    reducedMotion: false,
  });
  state = tickToStop(state, demoTransitionPoints.stage3PrimaryComplete);
  assert.equal(state.eventIndex, demoTransitionPoints.stage3PrimaryComplete);
  assert.equal(state.playback, "complete");

  state = reduce(state, { type: "stage3-probe" });
  assert.equal(state.stage3Probe, "denied");
  assert.equal(state.eventIndex, demoTransitionPoints.stage3ProbeStart);
  assert.equal(state.playback, "paused");

  state = reduce(state, {
    type: "run",
    lastIndex: stageThreeLastIndex,
    reducedMotion: false,
  });
  state = tickToStop(state, stageThreeLastIndex);
  assert.equal(state.eventIndex, stageThreeLastIndex);
  assert.equal(state.playback, "complete");
});

test("Reviewer and optional Demo transitions reject premature or repeated actions", () => {
  const stageTwoBaseline = reduce(createDemoState(), {
    type: "select-stage",
    stageId: "stage-2",
  });
  assert.deepEqual(
    reduce(stageTwoBaseline, {
      type: "stage2-choice",
      choice: "approved",
    }),
    stageTwoBaseline,
  );

  const approvedComplete = {
    ...stageTwoBaseline,
    stage2Review: "approved",
    eventIndex: demoTransitionPoints.stage2ApprovedComplete,
    playback: "complete",
  };
  assert.deepEqual(
    reduce(approvedComplete, {
      type: "stage2-choice",
      choice: "approved",
    }),
    approvedComplete,
  );

  const stageThreeBaseline = reduce(createDemoState(), {
    type: "select-stage",
    stageId: "stage-3",
  });
  assert.deepEqual(
    reduce(stageThreeBaseline, { type: "stage3-alternative" }),
    stageThreeBaseline,
  );
  assert.deepEqual(
    reduce(stageThreeBaseline, { type: "stage3-probe" }),
    stageThreeBaseline,
  );

  let stageThreeReady = {
    ...stageThreeBaseline,
    eventIndex: demoChoicePoints.stage3Alternative,
    playback: "awaiting-choice",
  };
  stageThreeReady = reduce(stageThreeReady, { type: "stage3-alternative" });

  assert.deepEqual(
    reduce(stageThreeReady, { type: "stage3-probe" }),
    stageThreeReady,
  );

  const primaryComplete = {
    ...stageThreeReady,
    eventIndex: demoTransitionPoints.stage3PrimaryComplete,
    playback: "complete",
  };
  const probeSelected = reduce(primaryComplete, { type: "stage3-probe" });
  assert.equal(probeSelected.stage3Probe, "denied");
  assert.deepEqual(
    reduce(probeSelected, { type: "stage3-probe" }),
    probeSelected,
  );
});

test("Reduced motion starts at the first event and waits for deliberate steps", () => {
  const state = reduce(createDemoState(), {
    type: "run",
    lastIndex: stageOneLastIndex,
    reducedMotion: true,
  });

  assert.equal(state.eventIndex, 0);
  assert.equal(state.playback, "paused");
  assert.notEqual(state.eventIndex, stageOneLastIndex);
});
