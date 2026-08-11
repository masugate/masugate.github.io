/**
 * Stable event positions shared by the authored Demo fixture, its reducer,
 * and deterministic tests. Changing the scenario sequence must therefore
 * update one explicit topology contract rather than silently shifting gates.
 */
export const demoChoicePoints = Object.freeze({
  stage2Review: 8,
  stage3Alternative: 3,
});

export const demoTransitionPoints = Object.freeze({
  stage1Complete: 6,
  stage2BranchStart: 9,
  stage2ApprovedComplete: 11,
  stage2DeclinedComplete: 10,
  stage3AlternativeStart: 4,
  stage3PrimaryComplete: 12,
  stage3ProbeStart: 13,
  stage3ProbeComplete: 15,
});
