import assert from "node:assert/strict";
import test from "node:test";
import { build } from "esbuild";

async function importBundled(entryPoint) {
  const result = await build({
    absWorkingDir: process.cwd(),
    bundle: true,
    entryPoints: [entryPoint],
    format: "esm",
    logLevel: "silent",
    platform: "node",
    write: false,
  });
  const output = result.outputFiles[0];
  assert.ok(output, `esbuild did not produce output for ${entryPoint}`);

  const encoded = Buffer.from(output.contents).toString("base64");
  return import(`data:text/javascript;base64,${encoded}#${Date.now()}-${entryPoint}`);
}

const scenarioModule = await importBundled("app/data/scenario.ts");
const validationModule = await importBundled("app/data/validation.ts");
const { openClawScenario, validateScenario } = scenarioModule;
const { contentValidationErrors, validateScenarioPolicyReferences } =
  validationModule;

function event(eventId) {
  const value = openClawScenario.events.find(({ id }) => id === eventId);
  assert.ok(value, `missing scenario event ${eventId}`);
  return value;
}

test("scenario and cross-contract policy validation pass", () => {
  assert.deepEqual(validateScenario(openClawScenario), []);
  assert.deepEqual(validateScenarioPolicyReferences(openClawScenario), []);
  assert.deepEqual(contentValidationErrors, []);
});

test("policy context distinguishes clauses and state reads across one evolving scenario", () => {
  assert.deepEqual(event("stage-1-state-read").policyContext, {
    artifactId: "categorized-purchase-v1",
    activeClause: "category_budget_exceeded",
    stateReads: ["budget.spent", "budget.limit"],
  });
  assert.equal(
    event("stage-1-policy-allow").policyContext.activeClause,
    "otherwise",
  );

  assert.deepEqual(event("stage-2-travel-escalated").policyContext, {
    artifactId: "categorized-purchase-v2",
    activeClause: "procurement_review",
    stateReads: ["budget.available"],
  });
  assert.deepEqual(event("stage-2-work-denied").policyContext, {
    artifactId: "categorized-purchase-v2",
    activeClause: "category_budget_exceeded",
    stateReads: ["budget.available"],
  });

  assert.deepEqual(event("stage-3-calendar-conflict-denied").policyContext, {
    artifactId: "governed-calendar-v1",
    activeClause: "protected_work_overlap",
    stateReads: ["calendar.overlaps"],
  });
  assert.deepEqual(event("stage-3-calendar-alternative-allowed").policyContext, {
    artifactId: "governed-calendar-v1",
    activeClause: "otherwise",
    stateReads: ["calendar.overlaps"],
  });
  assert.deepEqual(event("stage-3-protected-brief-denied").policyContext, {
    artifactId: "governed-workspace-v1",
    activeClause: "outside_agent_workspace",
    stateReads: ["workspace.path_allowed", "workspace.is_protected"],
  });
});

test("each governed route states provider, connector, and execution ownership without inventing release bindings", () => {
  const expectedViews = new Map([
    ["purchase", ["budget.spent", "budget.limit", "budget.available"]],
    ["calendar-create", ["calendar.overlaps"]],
    ["file-change", ["workspace.path_allowed", "workspace.is_protected"]],
  ]);

  for (const route of openClawScenario.routes) {
    assert.equal(route.provider.owner, "deployment");
    assert.equal(route.connector.owner, "deployment");
    assert.equal(route.execution.owner, "deployment");
    assert.deepEqual(route.provider.stateViews, expectedViews.get(route.id));
    assert.equal(route.releaseBinding.state, "unavailable");
    assert.equal(route.provider.releaseBinding.state, "unavailable");
    assert.equal(route.connector.releaseBinding.state, "unavailable");
    assert.equal(route.execution.releasePosition.state, "unavailable");
    assert.match(route.connector.credentialBoundary, /deployment-owned/);
  }
});

test("validators reject undeclared policy reads and incomplete event linkage", () => {
  const invalidReadScenario = {
    ...openClawScenario,
    events: openClawScenario.events.map((item) =>
      item.id === "stage-1-state-read"
        ? {
            ...item,
            policyContext: {
              ...item.policyContext,
              stateReads: ["calendar.overlaps"],
            },
          }
        : item,
    ),
  };
  assert.match(
    validateScenarioPolicyReferences(invalidReadScenario).join("\n"),
    /not declared by categorized-purchase-v1/,
  );

  const missingContextScenario = {
    ...openClawScenario,
    events: openClawScenario.events.map((item) =>
      item.id === "stage-2-work-denied"
        ? { ...item, policyContext: undefined }
        : item,
    ),
  };
  assert.match(
    validateScenario(missingContextScenario).join("\n"),
    /policy result is missing policy context/,
  );
});
