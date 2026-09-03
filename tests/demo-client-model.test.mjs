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
  assert.ok(clientBytes < fullBytes * 0.65);
  assert.ok(clientBytes < 64 * 1024);
});

test("Demo client projection retains every interactive value", () => {
  const clientModel = demoData.selectDemoClientExperience();
  const stageThree = clientModel.stages.find(({ id }) => id === "stage-3");

  assert.equal(clientModel.copy.controls.startOneStepLabel, "Start one step");
  assert.equal(clientModel.copy.stageCues["stage-1"], "Start here · one purchase");
  assert.equal(
    clientModel.integration.adapter.packageName.value,
    "@masugate/openclaw",
  );
  assert.equal(
    clientModel.scenario.calendar.dateAndOffset.value.date,
    "2026-09-15",
  );
  assert.ok(stageThree);
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
