import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import test from "node:test";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

const require = createRequire(import.meta.url);
const actualReactPath = require.resolve("react");
const actualReactUrl = pathToFileURL(actualReactPath).href;
const reactDomServerUrl = pathToFileURL(
  require.resolve("react-dom/server"),
).href;
const reactJsxRuntimeUrl = pathToFileURL(
  require.resolve("react/jsx-runtime"),
).href;

async function importFlowHarness() {
  const result = await build({
    absWorkingDir: process.cwd(),
    bundle: true,
    format: "esm",
    logLevel: "silent",
    platform: "node",
    plugins: [
      {
        name: "demo-flow-test-runtime",
        setup(buildApi) {
          buildApi.onResolve({ filter: /^react$/ }, (args) => {
            if (
              args.importer.endsWith("DemoExperience.tsx") ||
              args.importer.endsWith("motion.tsx")
            ) {
              return { namespace: "demo-test-react", path: "hooks" };
            }
            return { external: true, path: actualReactUrl };
          });
          buildApi.onResolve({ filter: /^actual-react$/ }, () => ({
            external: true,
            path: actualReactUrl,
          }));
          buildApi.onResolve({ filter: /^react-dom\/server$/ }, () => ({
            external: true,
            path: reactDomServerUrl,
          }));
          buildApi.onResolve({ filter: /^react\/jsx-runtime$/ }, () => ({
            external: true,
            path: reactJsxRuntimeUrl,
          }));
          buildApi.onLoad(
            { filter: /^hooks$/, namespace: "demo-test-react" },
            () => ({
              contents: `
                export * from "actual-react";
                export function useReducer() {
                  return [globalThis.__MASUGATE_DEMO_TEST_STATE__, () => {}];
                }
                export function useSyncExternalStore() {
                  return Boolean(globalThis.__MASUGATE_DEMO_TEST_REDUCED_MOTION__);
                }
              `,
              loader: "js",
              resolveDir: process.cwd(),
            }),
          );
          buildApi.onResolve({ filter: /^next\/navigation$/ }, () => ({
            namespace: "demo-test-next",
            path: "navigation",
          }));
          buildApi.onLoad(
            { filter: /^navigation$/, namespace: "demo-test-next" },
            () => ({
              contents: 'export function usePathname() { return "/demo/"; }',
              loader: "js",
            }),
          );
          buildApi.onResolve({ filter: /\.module\.css$/ }, () => ({
            namespace: "demo-test-css",
            path: "styles",
          }));
          buildApi.onLoad(
            { filter: /^styles$/, namespace: "demo-test-css" },
            () => ({
              contents:
                "export default new Proxy({}, { get: (_, key) => String(key) });",
              loader: "js",
            }),
          );
        },
      },
    ],
    stdin: {
      contents: `
        import React from "react";
        import { renderToStaticMarkup } from "react-dom/server";
        import { DemoExperience } from "./app/components/DemoExperience.tsx";
        import { selectDemoClientExperience } from "./app/data/demo.ts";
        import { createDemoState } from "./app/components/demoMachine.mjs";

        export const model = selectDemoClientExperience();
        export { createDemoState };

        export function renderDemo(state, reducedMotion = false) {
          globalThis.__MASUGATE_DEMO_TEST_STATE__ = state;
          globalThis.__MASUGATE_DEMO_TEST_REDUCED_MOTION__ = reducedMotion;
          try {
            return renderToStaticMarkup(
              React.createElement(DemoExperience, { model }),
            );
          } finally {
            delete globalThis.__MASUGATE_DEMO_TEST_STATE__;
            delete globalThis.__MASUGATE_DEMO_TEST_REDUCED_MOTION__;
          }
        }
      `,
      loader: "tsx",
      resolveDir: process.cwd(),
      sourcefile: "demo-flow-harness.tsx",
    },
    write: false,
  });
  const output = result.outputFiles[0];
  assert.ok(output, "esbuild did not produce the Demo flow harness");

  try {
    return await import(
      `data:text/javascript;base64,${Buffer.from(output.contents).toString("base64")}#${Date.now()}`
    );
  } catch (error) {
    throw new Error(`could not import Demo flow harness: ${error.message}`);
  }
}

const harness = await importFlowHarness();

function activeEvents(stageId, state) {
  const stage = harness.model.stages.find(({ id }) => id === stageId);
  assert.ok(stage, `missing ${stageId}`);

  if (stageId === "stage-2" && state.stage2Review === "declined") {
    const reviewIndex = stage.timelines.primary.findIndex(
      ({ id }) => id === "stage-2-review-awaiting-choice",
    );
    return [
      ...stage.timelines.primary.slice(0, reviewIndex + 1),
      ...stage.timelines.alternate,
    ];
  }

  return stage.timelines.primary;
}

function renderAt(stageId, eventId, stateOverrides = {}) {
  const state = {
    ...harness.createDemoState(stageId),
    playback: "paused",
    ...stateOverrides,
  };
  const events = activeEvents(stageId, state);
  const eventIndex = events.findIndex(({ id }) => id === eventId);
  assert.notEqual(eventIndex, -1, `${eventId} is not active for ${stageId}`);

  return harness.renderDemo({ ...state, eventIndex });
}

function escapePattern(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function svgMarkup(html) {
  const match = html.match(
    /<svg\b(?=[^>]*\bclass="flowDiagram")[^>]*>[\s\S]*?<\/svg>/i,
  );
  assert.ok(match, "missing governed-action flow SVG");
  return match[0];
}

function openingTagByClass(markup, tagName, className) {
  const match = markup.match(
    new RegExp(
      `<${tagName}\\b(?=[^>]*\\bclass="[^"]*\\b${escapePattern(className)}\\b[^"]*")[^>]*>`,
      "i",
    ),
  );
  assert.ok(match, `missing ${tagName}.${className}`);
  return match[0];
}

function groupMarkup(markup, className) {
  const match = markup.match(
    new RegExp(
      `<g\\b(?=[^>]*\\bclass="[^"]*\\b${escapePattern(className)}\\b[^"]*")[^>]*>([\\s\\S]*?)<\\/g>`,
      "i",
    ),
  );
  assert.ok(match, `missing g.${className}`);
  return match[0];
}

function groupsMarkup(markup, className) {
  return [
    ...markup.matchAll(
      new RegExp(
        `<g\\b(?=[^>]*\\bclass="[^"]*\\b${escapePattern(className)}\\b[^"]*")[^>]*>([\\s\\S]*?)<\\/g>`,
        "gi",
      ),
    ),
  ].map(([group]) => group);
}

function agentMarkup(svg, agentId) {
  const agent = groupsMarkup(svg, "flowAgent").find((group) =>
    group.includes(`data-agent-id="${agentId}"`),
  );
  assert.ok(agent, `missing flow agent ${agentId}`);
  return agent;
}

function cssBlock(css, headerPattern) {
  const header = headerPattern.exec(css);
  assert.ok(header, `missing CSS block: ${headerPattern}`);
  const start = header.index;
  const openingBrace = css.indexOf("{", start);
  assert.notEqual(openingBrace, -1, `missing opening brace: ${headerPattern}`);

  let depth = 0;
  for (let index = openingBrace; index < css.length; index += 1) {
    if (css[index] === "{") depth += 1;
    if (css[index] !== "}") continue;
    depth -= 1;
    if (depth === 0) {
      return {
        body: css.slice(openingBrace + 1, index),
        end: index + 1,
        start,
      };
    }
  }

  assert.fail(`missing closing brace: ${headerPattern}`);
}

test("Stage 2 keeps both agents visible and selects the current request lane", () => {
  const svg = svgMarkup(renderAt("stage-2", "stage-2-work-request"));
  const agents = groupsMarkup(svg, "flowAgent");
  const travel = agentMarkup(svg, "openclaw:travel-planner");
  const work = agentMarkup(svg, "openclaw:work-manager");
  const gate = openingTagByClass(svg, "g", "flowGate");
  const record = openingTagByClass(svg, "g", "flowRecord");

  assert.equal(agents.length, 2);
  assert.match(travel, /data-agent-current="false"/);
  assert.match(travel, /data-agent-state="held"/);
  assert.match(travel, />Travel Planner<\/text>/);
  assert.match(travel, />Capacity held<\/text>/);
  assert.match(work, /data-agent-current="true"/);
  assert.match(work, /data-agent-state="request"/);
  assert.match(work, />Work Manager<\/text>/);
  assert.match(work, />Request sent<\/text>/);
  assert.match(
    svg,
    /Agent request states: Travel Planner: Capacity held; Work Manager: Request sent\./,
  );
  assert.match(svg, /data-operation-status="not-started"/);
  assert.match(gate, /data-decision="ready"/);
  assert.match(record, /data-record-visible="false"/);
  assert.doesNotMatch(gate, /data-decision="escalate"/);
});

test("single-agent stages keep one lane while Stage 2 preserves both outcomes", () => {
  const stageOne = svgMarkup(renderAt("stage-1", "stage-1-request"));
  const stageOneAllowed = svgMarkup(
    renderAt("stage-1", "stage-1-policy-allow"),
  );
  const stageThree = svgMarkup(renderAt("stage-3", "stage-3-reset"));
  const approved = svgMarkup(
    renderAt("stage-2", "stage-2-approved-records", {
      playback: "complete",
      stage2Review: "approved",
    }),
  );
  const declined = svgMarkup(
    renderAt("stage-2", "stage-2-declined-record", {
      playback: "complete",
      stage2Review: "declined",
    }),
  );

  assert.equal(groupsMarkup(stageOne, "flowAgent").length, 1);
  assert.equal(groupsMarkup(stageThree, "flowAgent").length, 1);
  assert.match(
    agentMarkup(stageOneAllowed, "openclaw:work-manager"),
    /data-agent-state="allowed"[\s\S]*?>Policy allowed<\/text>/,
  );
  assert.match(
    agentMarkup(approved, "openclaw:travel-planner"),
    /data-agent-state="committed"[\s\S]*?>Committed<\/text>/,
  );
  assert.match(
    agentMarkup(approved, "openclaw:work-manager"),
    /data-agent-state="denied"[\s\S]*?>Request denied<\/text>/,
  );
  for (const agentId of [
    "openclaw:travel-planner",
    "openclaw:work-manager",
  ]) {
    assert.match(agentMarkup(declined, agentId), /data-agent-state="denied"/);
  }
});

test("each overlapping request keeps an independently legible state", () => {
  const reading = svgMarkup(
    renderAt("stage-2", "stage-2-work-state-read"),
  );
  const denied = svgMarkup(renderAt("stage-2", "stage-2-work-denied"));
  const review = svgMarkup(
    renderAt("stage-2", "stage-2-review-awaiting-choice", {
      playback: "awaiting-choice",
    }),
  );

  assert.match(
    agentMarkup(reading, "openclaw:travel-planner"),
    />Capacity held<\/text>/,
  );
  assert.match(
    agentMarkup(reading, "openclaw:work-manager"),
    /data-agent-current="true"[\s\S]*?>Reading shared state<\/text>/,
  );
  assert.match(
    agentMarkup(denied, "openclaw:work-manager"),
    />Request denied<\/text>/,
  );
  assert.match(
    agentMarkup(review, "openclaw:travel-planner"),
    /data-agent-current="true"[\s\S]*?>Awaiting review<\/text>/,
  );
});

test("a terminal denial materializes its inspectable record without an effect", () => {
  const svg = svgMarkup(
    renderAt("stage-3", "stage-3-calendar-conflict-denied", {
      playback: "awaiting-choice",
    }),
  );
  const gate = openingTagByClass(svg, "g", "flowGate");
  const record = openingTagByClass(svg, "g", "flowRecord");

  assert.match(svg, /data-operation-status="denied"/);
  assert.match(gate, /data-decision="deny"/);
  assert.match(record, /data-record-visible="true"/);
  assert.match(record, /data-record-tone="denied"/);
  assert.match(svg, />No effect<\/text>/);
});

test("the Stage 2 terminal summary renders committed and denied records together", () => {
  const svg = svgMarkup(
    renderAt("stage-2", "stage-2-approved-records", {
      playback: "complete",
      stage2Review: "approved",
    }),
  );
  const record = openingTagByClass(svg, "g", "flowRecord");

  assert.match(record, /data-record-visible="true"/);
  assert.match(record, /data-record-tone="mixed"/);
  assert.match(svg, />2 records<\/text>/);
});

test("the live budget separates committed, protected, and available capacity", () => {
  const svg = svgMarkup(
    renderAt("stage-2", "stage-2-capacity-protected"),
  );
  const budget = openingTagByClass(svg, "g", "flowBudget");
  const committed = openingTagByClass(svg, "rect", "flowBudgetCommitted");
  const protectedCapacity = openingTagByClass(
    svg,
    "rect",
    "flowBudgetProtected",
  );
  const available = openingTagByClass(svg, "rect", "flowBudgetAvailable");

  assert.match(budget, /data-budget-protected="true"/);
  assert.match(committed, /\bwidth="0"/);
  assert.match(protectedCapacity, /\bwidth="129\.6"/);
  assert.match(available, /\bwidth="86\.4"/);
  assert.match(svg, />\$100 total<\/text>/);
  assert.match(svg, />\$40 available<\/text>/);
  assert.match(svg, />\$0 committed<\/text>/);
  assert.match(svg, />\$60 held<\/text>/);
  assert.match(
    svg,
    /Shared budget: \$0 committed, \$60 held during review, and \$40 available out of \$100 total\./,
  );
});

test("flow and budget motion is opt-in and remains static for reduced motion", async () => {
  const css = await readFile(
    "app/components/DemoExperience.module.css",
    "utf8",
  );
  const enhancedMotion = cssBlock(
    css,
    /@media\s*\(prefers-reduced-motion:\s*no-preference\)/,
  );
  const outsideEnhancedMotion =
    css.slice(0, enhancedMotion.start) + css.slice(enhancedMotion.end);
  const unguardedFlowMotion = [
    ...outsideEnhancedMotion.matchAll(/([^{}]+)\{([^{}]*)\}/g),
  ]
    .filter(([, selector, body]) =>
      selector.includes(".flow") &&
      /\b(?:animation|transition)(?:-[a-z-]+)?\s*:/.test(body),
    )
    .map(([, selector]) => selector.trim());

  assert.deepEqual(
    unguardedFlowMotion,
    [],
    `flow motion escaped the no-preference media query: ${unguardedFlowMotion.join(", ")}`,
  );
  assert.match(
    enhancedMotion.body,
    /\.flowPacket\s*\{[\s\S]*?transition:\s*transform 800ms/,
  );
  assert.match(
    enhancedMotion.body,
    /\.flowAgent rect,[\s\S]*?\.flowAgentPath\s*\{[\s\S]*?transition:/,
  );
  assert.match(
    enhancedMotion.body,
    /\.flowBudgetSegment\s*\{[\s\S]*?transition:[\s\S]*?width 520ms/,
  );
  assert.match(
    enhancedMotion.body,
    /\.flowBudget\[data-budget-protected="true"\][\s\S]*?animation:\s*flowBudgetReserve/,
  );
});

test("Stage 3 keeps calendar and workspace in the shared visual system", () => {
  const calendar = groupMarkup(
    svgMarkup(renderAt("stage-3", "stage-3-calendar-conflict-state-read")),
    "flowBudgetPlaceholder",
  );
  const workspace = groupMarkup(
    svgMarkup(
      renderAt("stage-3", "stage-3-workspace-baseline", {
        stage3Calendar: "alternative",
      }),
    ),
    "flowBudgetPlaceholder",
  );

  assert.match(calendar, /data-active-resource="calendar"/);
  assert.match(workspace, /data-active-resource="workspace"/);
  for (const label of [
    "Governed resources",
    "Calendar",
    "Time blocks",
    "Workspace",
    "Paths + files",
  ]) {
    assert.match(calendar, new RegExp(`>${escapePattern(label)}<`));
  }
});

test("a completed Stage 1 leaves its entire timeline marked complete", () => {
  const html = renderAt("stage-1", "stage-1-record-finalized", {
    playback: "complete",
  });

  assert.equal(
    [...html.matchAll(/data-timeline-state="complete"/g)].length,
    7,
  );
  assert.doesNotMatch(html, /data-timeline-state="current"/);
});

test("the narrow flow keeps readable scale and follows playback without hiding its payoff", async () => {
  const [css, source] = await Promise.all([
    readFile("app/components/DemoExperience.module.css", "utf8"),
    readFile("app/components/DemoExperience.tsx", "utf8"),
  ]);
  const html = renderAt("stage-1", "stage-1-request");
  const viewport = openingTagByClass(html, "div", "flowViewport");
  const diagramRule = cssBlock(css, /\.flowDiagram\s*\{/).body;
  const viewportRule = cssBlock(css, /\.flowViewport\s*\{/).body;
  const figureRule = cssBlock(css, /\.flowFigure\s*\{/).body;
  const captionRule = cssBlock(css, /\.flowFigure figcaption\s*\{/).body;
  const responsiveFlowRule = cssBlock(
    cssBlock(css, /@media \(max-width: 1000px\)\s*\{/).body,
    /\.flowDiagram\s*\{/,
  ).body;
  const svg = svgMarkup(html);

  assert.match(viewport, /aria-label="Scrollable governed-action diagram"/);
  assert.match(viewport, /aria-describedby="demo-flow-scroll-instruction"/);
  assert.match(html, /Outcome shown first\. Scroll sideways to inspect the full path/);
  assert.match(diagramRule, /min-width:\s*0/);
  assert.match(responsiveFlowRule, /min-width:\s*820px/);
  assert.match(figureRule, /min-width:\s*0/);
  assert.match(figureRule, /max-width:\s*100%/);
  assert.match(viewportRule, /overflow-x:\s*auto/);
  assert.match(viewportRule, /max-width:\s*100%/);
  assert.match(viewportRule, /direction:\s*rtl/);
  assert.match(captionRule, /flex-wrap:\s*wrap/);
  assert.match(
    svg,
    /<tspan x="42" y="69">OpenClaw<\/tspan><tspan x="42" y="84">orchestration<\/tspan>/,
  );
  assert.match(
    svg,
    /<tspan x="460" y="203">Registered<\/tspan><tspan x="460" y="218">dependency<\/tspan>/,
  );
  assert.match(
    svg,
    /class="flowOperationText" text-anchor="end" x="942" y="230">Not Started<\/text>/,
  );
  assert.doesNotMatch(source, /scrollIntoView/);
  assert.match(source, /viewport\.scrollBy\(\{/);
  assert.match(source, /left:\s*horizontalDelta/);
  assert.match(source, /behavior:\s*reducedMotion \? "auto" : "smooth"/);
  assert.match(source, /flowFollowSuspendedRef\.current = true/);
});

test("a resolved human choice returns focus to the flow and resumes when motion is allowed", async () => {
  const source = await readFile("app/components/DemoExperience.tsx", "utf8");

  assert.match(source, /resumePlayback:\s*!reducedMotion/);
  assert.match(source, /window\.requestAnimationFrame\(\(\) => \{/);
  assert.match(source, /flowViewportRef\.current\?\.focus\(\)/);
  assert.match(source, /continueAfterChoice\(\{[\s\S]*?type:\s*"stage2-choice"/);
  assert.match(source, /continueAfterChoice\(\{[\s\S]*?type:\s*"stage3-alternative"/);
  assert.match(source, /continueAfterChoice\(\{[\s\S]*?type:\s*"stage3-probe"/);
  assert.doesNotMatch(source, /Playback remains paused/);
});
