import assert from "node:assert/strict";
import test from "node:test";
import { homepageContent } from "../app/data/homepage.ts";

function wordCount(value) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

test("homepage hero keeps one concise thesis and two focused actions", () => {
  const { hero } = homepageContent;

  assert.ok(wordCount(hero.title) <= 8, "hero title must stay within 8 words");
  assert.ok(wordCount(hero.lede) <= 22, "hero lede must stay within 22 words");
  assert.deepEqual(hero.primaryAction, {
    label: "See it happen",
    href: "#shared-budget",
  });
  assert.equal(hero.sourceActionLabel, "GitHub");
});

test("homepage hero diagram explains the changing-state outcome", () => {
  const { diagram } = homepageContent.hero;

  assert.match(diagram.description, /same available budget/i);
  assert.match(diagram.description, /protects capacity/i);
  assert.match(diagram.description, /denies the overlapping request/i);
  assert.equal(diagram.timelineLabels.length, 3);
  assert.equal(diagram.motionControlLabel, "Pause motion");
});

test("homepage problem and shared-state copy stays scan-friendly", () => {
  const { problem, sharedState } = homepageContent;

  assert.ok(wordCount(problem.title) <= 10);
  assert.deepEqual(problem.outcomeLabels, {
    independent: "Rule broken",
    governed: "Rule preserved",
  });
  assert.equal(sharedState.items.length, 3);

  for (const item of sharedState.items) {
    assert.ok(
      wordCount(item.caption) <= 8,
      `${item.id} caption must stay within 8 words`,
    );
  }
});

test("homepage mechanism is one bounded three-step flow", () => {
  const { mechanism } = homepageContent;

  assert.ok(wordCount(mechanism.title) <= 10);
  assert.ok(wordCount(mechanism.intro) <= 25);
  assert.match(mechanism.intro, /versioned policy code/i);
  assert.match(mechanism.intro, /not prompt guidance/i);
  assert.deepEqual(
    mechanism.steps.map(({ label }) => label),
    ["Request", "Policy decision", "Governed effect"],
  );
  assert.deepEqual(mechanism.outcomes, ["Committed", "Denied", "Pending"]);
  assert.match(mechanism.boundaryLabel, /protected path/i);
});

test("homepage proof stays bounded to three inspectable paths", () => {
  const { proof } = homepageContent;

  assert.ok(wordCount(proof.title) <= 10);
  assert.ok(wordCount(proof.intro) <= 25);
  assert.deepEqual(
    proof.items.map(({ id }) => id),
    ["demo", "source", "paper"],
  );

  for (const item of proof.items) {
    assert.ok(wordCount(item.description) <= 14);
    assert.equal(item.details.length, 2);
    for (const detail of item.details) {
      assert.ok(
        wordCount(detail) <= 20,
        `${item.id} proof detail must stay within 20 words`,
      );
    }
  }
});

test("homepage ending combines writing and contact without another narrative section", () => {
  const { closing } = homepageContent;

  assert.ok(wordCount(closing.title) <= 10);
  assert.ok(wordCount(closing.contactCopy) <= 20);
  assert.equal(closing.writingActionLabel, "All posts");
  assert.match(closing.contactTitle, /customized demo/i);
});
