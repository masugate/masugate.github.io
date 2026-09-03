import assert from "node:assert/strict";
import test from "node:test";
import { build } from "esbuild";

async function importDemoData() {
  const result = await build({
    absWorkingDir: process.cwd(),
    bundle: true,
    entryPoints: ["app/data/demo.ts"],
    format: "esm",
    logLevel: "silent",
    platform: "node",
    write: false,
  });
  const output = result.outputFiles[0];
  assert.ok(output, "esbuild did not produce the Demo data module");

  return import(
    `data:text/javascript;base64,${Buffer.from(output.contents).toString("base64")}#${Date.now()}`
  );
}

const demoData = await importDemoData();

test("Demo client projection omits server-only contract detail", () => {
  const fullModel = demoData.selectDemoExperience();
  const clientModel = demoData.selectDemoClientExperience(fullModel);
  const stageTwo = clientModel.stages.find(({ id }) => id === "stage-2");
  const firstEvent = clientModel.stages[0].timelines.primary[0];
  const firstArtifact = clientModel.stages[0].artifacts[0];
  const firstDependency = clientModel.stages[0].policies[0].dependencies[0];

  assert.ok(stageTwo);
  assert.equal(stageTwo.timelines.counterfactual.length, 0);
  assert.equal(
    stageTwo.timelines.alternate[0]?.id,
    "stage-2-review-declined",
  );
  assert.ok(firstEvent);
  assert.equal("stageId" in firstEvent, false);
  assert.equal("branch" in firstEvent, false);
  assert.ok(firstArtifact);
  assert.equal("verification" in firstArtifact, false);
  assert.equal("transformationNote" in firstArtifact, false);
  assert.ok(firstDependency);
  assert.equal("conceptualName" in firstDependency, false);
  assert.equal("releaseBinding" in firstDependency, false);

  const fullBytes = Buffer.byteLength(JSON.stringify(fullModel));
  const clientBytes = Buffer.byteLength(JSON.stringify(clientModel));
  assert.doesNotMatch(
    JSON.stringify(clientModel),
    /What the independent artifact buys/,
  );
  assert.ok(clientBytes < fullBytes * 0.65);
  assert.ok(clientBytes < 64 * 1024);
});

test("Demo client projection retains every interactive value", () => {
  const clientModel = demoData.selectDemoClientExperience();
  const stageThree = clientModel.stages.find(({ id }) => id === "stage-3");

  assert.equal(clientModel.copy.controls.nextStepLabel, "Next step");
  assert.deepEqual(clientModel.copy.stageLadder.additions, {
    "stage-1": "one action",
    "stage-2": "+ concurrency",
    "stage-3": "+ more resource types",
  });
  assert.equal(
    clientModel.copy.flowDiagram.boundaryLabel,
    "MasuGate boundary",
  );
  assert.equal(clientModel.copy.flowDiagram.heldLabel, "held during review");
  assert.deepEqual(clientModel.copy.flowDiagram.steps, {
    request: "01",
    state: "02",
    decision: "03",
    result: "04",
  });
  assert.equal(clientModel.copy.visitor.scenarioActorLabel, "Scenario setup");
  assert.equal(clientModel.copy.visitor.startingStateLabel, "Starting state");
  assert.equal(clientModel.copy.visitor.simulatedStatus, "Simulated walkthrough");
  assert.equal(clientModel.copy.visitor.referenceStatus, "Reference artifacts");
  assert.equal(
    clientModel.integration.adapter.packageName.value,
    "@masugate/openclaw",
  );
  assert.equal(
    clientModel.scenario.calendar.dateAndOffset.value.date,
    "2026-09-15",
  );
  assert.ok(stageThree);
  for (const stage of clientModel.stages.slice(1)) {
    const reset = stage.timelines.primary[0];
    assert.equal(reset.kind, "reset");
    assert.equal(reset.label, "Starting state");
    assert.doesNotMatch(
      `${reset.label} ${reset.description} ${reset.announcement}`,
      /fixture|baseline/i,
    );
  }
  assert.equal(stageThree.policies.length, 3);
  assert.match(stageThree.policies[1].source.body, /calendar\.overlaps/);
  assert.equal(stageThree.routes.length, 3);
  assert.ok(
    stageThree.timelines.primary.every(
      ({ announcement, description, resourceSnapshot }) =>
        announcement && description && resourceSnapshot.kind,
    ),
  );
});
