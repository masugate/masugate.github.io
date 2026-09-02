import assert from "node:assert/strict";
import test from "node:test";
import {
  advancePlayback,
  replayPlayback,
  startPlayback,
  stepPlayback,
} from "../app/components/sharedBudgetPlayback.mjs";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

function countMatches(value, pattern) {
  return [...value.matchAll(pattern)].length;
}

function escapeHtmlAttribute(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function navigationMarkup(html, label) {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = html.match(
    new RegExp(
      `<nav\\b[^>]*aria-label="${escapedLabel}"[^>]*>([\\s\\S]*?)<\\/nav>`,
      "i",
    ),
  );

  assert.ok(match, `missing ${label}`);
  return match[1];
}

function linksIn(markup) {
  return [...markup.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].map(
    ([, attributes, body]) => {
      const href = attributes.match(/\bhref="([^"]+)"/i)?.[1];
      assert.ok(href, `link is missing an href: ${attributes}`);

      return {
        href,
        label: body
          .replace(/<[^>]+>/g, "")
          .replace(/&amp;/g, "&")
          .replace(/&#x27;|&#39;/g, "'")
          .replace(/&quot;/g, '"')
          .replace(/\s+/g, " ")
          .trim(),
      };
    },
  );
}

function linksWithClassIn(markup, className) {
  const escapedClassName = className.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const matches = [
    ...markup.matchAll(
      new RegExp(
        `<a\\b(?=[^>]*\\bclass="[^"]*\\b${escapedClassName}\\b[^"]*")[^>]*>[\\s\\S]*?<\\/a>`,
        "gi",
      ),
    ),
  ];

  return matches.map(([link]) => linksIn(link)[0]);
}

function textContent(markup) {
  return markup
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#x27;|&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function sectionContaining(html, expectedText) {
  const section = [...html.matchAll(/<section\b[^>]*>[\s\S]*?<\/section>/gi)]
    .map(([markup]) => markup)
    .find((markup) => textContent(markup).includes(expectedText));

  assert.ok(section, `missing section containing: ${expectedText}`);
  return section;
}

function mainMarkup(html) {
  const match = html.match(/<main\b[^>]*>[\s\S]*?<\/main>/i);
  assert.ok(match, "missing main markup");
  return match[0];
}

function headingsIn(markup, level) {
  return [
    ...markup.matchAll(
      new RegExp(`<h${level}\\b[^>]*>([\\s\\S]*?)<\\/h${level}>`, "gi"),
    ),
  ].map(([, heading]) => textContent(heading));
}

const activeNavigation = [
  { href: "/#challenge", label: "Challenge" },
  { href: "/demo/", label: "OpenClaw Demo" },
  { href: "/get-started/", label: "Get Started" },
  { href: "/blog/", label: "Blog & Updates" },
];

function assertGoogleAnalytics(html, path) {
  assert.equal(
    countMatches(
      html,
      /<script\b(?=[^>]*\basync(?:=""|(?=[\s>])))(?=[^>]*\bsrc="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-ZWBT158GJT")[^>]*>/gi,
    ),
    1,
    `${path}: expected one async Google Analytics loader`,
  );
  assert.equal(
    countMatches(
      html,
      /<script\b(?![^>]*\bsrc=)[^>]*>\s*window\.dataLayer=window\.dataLayer\|\|\[\];function gtag\(\)\{dataLayer\.push\(arguments\);\}gtag\('js',new Date\(\)\);gtag\('config','G-ZWBT158GJT'\);\s*<\/script>/gi,
    ),
    1,
    `${path}: expected one executable Google Analytics initializer`,
  );
}

function assertMasuGateChrome(html, path) {
  assert.equal(
    countMatches(html, /<header\b[^>]*class="masugate-header"[^>]*>/gi),
    1,
    `${path}: expected one MasuGate header`,
  );
  assert.equal(
    countMatches(html, /<footer\b[^>]*class="masugate-footer"[^>]*>/gi),
    1,
    `${path}: expected one MasuGate footer`,
  );
  assert.equal(
    countMatches(html, /<a\b[^>]*class="masugate-skip-link"[^>]*>/gi),
    1,
    `${path}: expected one skip link`,
  );
  assert.equal(
    countMatches(
      html,
      /<main\b(?=[^>]*class="masugate-main")(?=[^>]*id="masugate-main")[^>]*>/gi,
    ),
    1,
    `${path}: expected one primary main landmark`,
  );
  assert.doesNotMatch(html, /<header\b[^>]*class="site-header"/i, path);
  assert.doesNotMatch(html, /<footer\b[^>]*class="site-footer"/i, path);

  assert.equal(
    countMatches(
      html,
      /<select\b(?=[^>]*aria-label="Color theme")[^>]*>/gi,
    ),
    1,
    `${path}: expected one time-aware theme control`,
  );
  for (const [value, label] of [
    ["auto", "Auto"],
    ["light", "Light"],
    ["dark", "Dark"],
  ]) {
    assert.match(
      html,
      new RegExp(`<option\\b[^>]*value="${value}"[^>]*>${label}<\\/option>`, "i"),
      `${path}: expected the ${label} theme choice`,
    );
  }
  assert.match(
    html,
    /masugate-theme-preference/,
    `${path}: expected the pre-paint theme initializer`,
  );

  const primaryNavigation = navigationMarkup(html, "Primary navigation");
  const desktopLinks = linksWithClassIn(primaryNavigation, "masugate-nav-link");
  const mobileLinks = linksIn(navigationMarkup(html, "Mobile navigation"));
  const footerLinks = linksIn(navigationMarkup(html, "Footer navigation"));

  assert.deepEqual(desktopLinks, activeNavigation, `${path}: desktop navigation`);
  assert.deepEqual(footerLinks, activeNavigation, `${path}: footer navigation`);
  assert.deepEqual(
    mobileLinks,
    [
      ...activeNavigation,
      { href: "/#contact", label: "Request a customized demo" },
    ],
    `${path}: mobile navigation`,
  );

  for (const href of [
    "https://github.com/masugate/masugate",
    "https://github.com/masugate/masugate/blob/main/REVIEWING.md",
    "https://github.com/masugate/masugate/issues",
    "https://github.com/masugate/masugate/blob/main/SECURITY.md",
    "https://arxiv.org/abs/2608.02764",
  ]) {
    assert.ok(
      linksIn(html).some((link) => link.href === href),
      `${path}: footer is missing project link ${href}`,
    );
  }

  assert.ok(
    !linksIn(html).some(
      ({ href }) => href === "https://github.com/masugate/masugate/discussions",
    ),
    `${path}: Discussions must remain hidden until the repository setting is enabled`,
  );

  assert.ok(
    linksIn(primaryNavigation).some(
      ({ href, label }) =>
        href === "/demo/#interactive-walkthrough" &&
        label.includes("Interactive walkthrough"),
    ),
    `${path}: desktop navigation includes the OpenClaw site map`,
  );

  assert.doesNotMatch(
    html,
    /\bSAGE\b/,
    `${path}: primary routes must not render the legacy SAGE identity`,
  );
}

test("shared-budget playback transitions are bounded and reduced-motion aware", () => {
  assert.deepEqual(startPlayback(-1, 5, false), {
    eventIndex: 0,
    playbackState: "playing",
  });
  assert.deepEqual(startPlayback(2, 5, true), {
    eventIndex: 5,
    playbackState: "complete",
  });
  assert.deepEqual(stepPlayback(-1, 1, 5), {
    eventIndex: 0,
    playbackState: "paused",
  });
  assert.deepEqual(stepPlayback(0, -1, 5), {
    eventIndex: 0,
    playbackState: "paused",
  });
  assert.deepEqual(replayPlayback(5, false), {
    eventIndex: 0,
    playbackState: "playing",
  });
  assert.deepEqual(replayPlayback(5, true), {
    eventIndex: 0,
    playbackState: "paused",
  });
  assert.deepEqual(advancePlayback(4, 5), {
    eventIndex: 5,
    playbackState: "complete",
  });
  assert.deepEqual(advancePlayback(5, 5), {
    eventIndex: 5,
    playbackState: "complete",
  });
  assert.deepEqual(startPlayback(-1, 0, false), {
    eventIndex: 0,
    playbackState: "complete",
  });
});

test("server-renders the MasuGate primary routes through one gated shell", async () => {
  const routes = [
    [
      "/",
      /Many agents\. One changing state\./,
    ],
    [
      "/demo/",
      /See one action stay connected\./,
    ],
    [
      "/demo/openclaw-reference/",
      /Inspect the candidate-backed purchase path\./,
    ],
    [
      "/get-started/",
      /Run the reference demo\./,
    ],
    [
      "/get-started/technical/",
      /Profiles, outcomes, and integration boundaries\./,
    ],
    [
      "/blog/",
      /Technical thinking and project updates, in one place\./,
    ],
  ];

  for (const [path, expected] of routes) {
    const response = await render(path);
    assert.equal(response.status, 200, path);
    assert.match(
      response.headers.get("content-type") ?? "",
      /^text\/html\b/i,
      path,
    );

    const html = await response.text();
    assert.match(html, /<title>[^<]*MasuGate<\/title>/i, path);
    assert.match(html, expected, path);
    assertGoogleAnalytics(html, path);
    assertMasuGateChrome(html, path);
  }
});

test("renders route-specific social and canonical metadata", async () => {
  const routes = [
    [
      "/",
      "Stateful governance for concurrent agents — MasuGate",
      "website",
    ],
    [
      "/demo/",
      "Interactive OpenClaw developer demo — MasuGate",
      "website",
    ],
    ["/get-started/", "Get Started — MasuGate", "website"],
    ["/blog/", "Blog & Updates — MasuGate", "website"],
    [
      "/blog/masugate-public-source-release/",
      "MasuGate Is Now Public: From Research Prototype to Product-Oriented Release — MasuGate",
      "article",
    ],
    [
      "/blog/when-allowed-goes-stale/",
      "When “Allowed” Goes Stale: Why Concurrent Agents Need Stateful Governance — MasuGate",
      "article",
    ],
    [
      "/blog/when-time-becomes-agent-policy/",
      "Approved at 5:05: When Time Becomes Part of an Agent Policy — MasuGate",
      "article",
    ],
  ];

  for (const [path, title, type] of routes) {
    const response = await render(path);
    const html = await response.text();
    const serializedTitle = escapeHtmlAttribute(title);

    assert.equal(response.status, 200, path);
    assert.ok(
      html.includes(
        `<meta property="og:title" content="${serializedTitle}"/>`,
      ),
      `${path}: Open Graph title`,
    );
    assert.ok(
      html.includes(
        `<meta name="twitter:title" content="${serializedTitle}"/>`,
      ),
      `${path}: Twitter title`,
    );
    assert.ok(
      html.includes(`<meta property="og:type" content="${type}"/>`),
      `${path}: Open Graph type`,
    );
    assert.match(html, /<meta property="og:site_name" content="MasuGate"\/>/);
    assert.match(
      html,
      /<meta property="og:image" content="http:\/\/localhost:3000\/og-masugate\.png"\/>/,
    );
    assert.match(html, /<meta property="og:image:width" content="1200"\/>/);
    assert.match(html, /<meta property="og:image:height" content="630"\/>/);
    assert.match(html, /<meta name="twitter:card" content="summary_large_image"\/>/);
    const canonical = `https://masugate.github.io${path}`;
    assert.ok(
      html.includes(`<link rel="canonical" href="${canonical}"/>`),
      `${path}: canonical link`,
    );
    assert.ok(
      html.includes(`<meta property="og:url" content="${canonical}"/>`),
      `${path}: Open Graph URL`,
    );
  }

  const articleResponse = await render("/blog/when-allowed-goes-stale/");
  const articleHtml = await articleResponse.text();
  assert.match(
    articleHtml,
    /<meta property="article:published_time" content="2026-08-08T00:00:00\.000Z"\/>/,
  );
});

test("all MasuGate internal links and fragments resolve", async () => {
  const sourceRoutes = [
    "/",
    "/demo/",
    "/demo/openclaw-reference/",
    "/get-started/",
    "/get-started/technical/",
    "/blog/",
    "/blog/masugate-public-source-release/",
    "/blog/policy-as-code-not-prompt/",
    "/blog/when-allowed-goes-stale/",
    "/blog/when-time-becomes-agent-policy/",
  ];
  const renderedRoutes = new Map();

  async function renderedRoute(path) {
    if (!renderedRoutes.has(path)) {
      const response = await render(path);
      renderedRoutes.set(path, {
        status: response.status,
        html: await response.text(),
      });
    }

    return renderedRoutes.get(path);
  }

  for (const sourcePath of sourceRoutes) {
    const source = await renderedRoute(sourcePath);
    assert.equal(source.status, 200, sourcePath);

    for (const { href } of linksIn(source.html)) {
      if (!href.startsWith("/") && !href.startsWith("#")) continue;

      const destination = new URL(href, `http://localhost${sourcePath}`);
      const targetPath = `${destination.pathname}${destination.search}`;
      const target = await renderedRoute(targetPath);

      assert.equal(
        target.status,
        200,
        `${sourcePath}: ${href} must resolve without an intermediate redirect`,
      );

      if (destination.hash) {
        const fragment = decodeURIComponent(destination.hash.slice(1));
        const escapedFragment = fragment.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&",
        );
        assert.match(
          target.html,
          new RegExp(`\\bid="${escapedFragment}"`, "i"),
          `${sourcePath}: ${href} must resolve to an element id`,
        );
      }
    }
  }
});

test("server-renders the complete Milestone 3 OpenClaw Demo contract", async () => {
  const response = await render("/demo/");
  const html = await response.text();
  const text = textContent(html);

  assert.equal(response.status, 200);
  assert.equal(countMatches(html, /<h1\b/gi), 1);

  for (const requiredCopy of [
    "Interactive OpenClaw developer demo",
    "Back to MasuGate overview",
    "See one action stay connected.",
    "Follow a selected OpenClaw action from request to governed effect, then see the same pattern extend across the product.",
    "Interactive simulation using a fixed OpenClaw and MasuGate scenario. This page performs no external purchase, calendar, or file action.",
    "Policy maintenance stays outside the policy engine. A reviewed revision becomes an input to each governed action.",
    "Policy maintenance feeds the runtime",
    "Reviewed revision → runtime",
    "State + effect",
    "Outcome:",
    "One governed purchase",
    "One budget across agents",
    "More governed operations",
    "Policy",
    "OpenClaw configuration",
    "Runtime trace",
    "Decision record",
    "Current · ready",
    "Choose stage",
    "Selectable Reference excerpt",
    "Static transcript for every deterministic branch.",
    "Approve branch",
    "Decline branch",
    "Calendar alternative and workspace path",
    "Optional protected-file probe",
    "Keep the governance contract fixed. Change the host binding.",
    "Host-native edge · changes",
    "Review Reference adapter profiles",
    "View release-candidate documentation",
    "Request a customized demo",
  ]) {
    assert.ok(text.includes(requiredCopy), `Demo is missing: ${requiredCopy}`);
  }

  for (const fixtureCopy of [
    "demo-owner",
    "Operations policy owner",
    "Travel Planner",
    "Work Project Manager",
    "categorized-purchase@v1",
    "categorized-purchase@v2",
    "governed-calendar@v1",
    "governed-workspace@v1",
    "$40",
    "$60",
    "$100",
    "14:00",
    "14:30",
    "15:15",
    "/shared/travel/trip-104/itinerary.md",
    "/shared/work/launch-review/brief.md",
  ]) {
    assert.ok(text.includes(fixtureCopy), `Demo is missing fixture text: ${fixtureCopy}`);
  }

  for (const timestamp of [
    "2026-09-15T14:00:00-04:00",
    "2026-09-15T15:00:00-04:00",
    "2026-09-15T14:30:00-04:00",
    "2026-09-15T16:00:00-04:00",
    "2026-09-15T15:15:00-04:00",
    "2026-09-15T16:45:00-04:00",
  ]) {
    assert.ok(
      html.includes(timestamp),
      `Demo is missing an unambiguous calendar timestamp: ${timestamp}`,
    );
  }

  const disclosureIndex = text.indexOf(
    "Interactive simulation using a fixed OpenClaw and MasuGate scenario.",
  );
  const firstButtonIndex = html.search(/<button\b/i);
  const disclosureMarkupIndex = html.indexOf(
    "Interactive simulation using a fixed OpenClaw and MasuGate",
  );
  assert.ok(disclosureIndex >= 0);
  assert.ok(disclosureMarkupIndex >= 0 && disclosureMarkupIndex < firstButtonIndex);

  for (const controlLabel of [
    "Start walkthrough",
    "Run governed purchase",
    "Previous",
    "Next step",
    "Reset stage",
    "Open static transcript",
    "Expand technical detail",
    "Copy Reference excerpt",
  ]) {
    assert.ok(text.includes(controlLabel), `Demo is missing control: ${controlLabel}`);
  }

  for (const usabilityCopy of [
    "Try the walkthrough",
    "The simple flow",
    "Choose a stage, then move one action from request to receipt.",
    "Next: Start Stage 1; the walkthrough will advance automatically.",
    "Stage setup and provenance",
    "Optional: inspect how policy maintenance reaches runtime",
    "Optional developer evidence",
    "Inspect policy, configuration, trace, and records",
  ]) {
    assert.ok(text.includes(usabilityCopy), `Demo is missing guidance: ${usabilityCopy}`);
  }

  assert.ok(
    text.indexOf("The simple flow") <
      text.indexOf("Conversation and agent lanes"),
    "Demo guidance and its primary control must precede the interactive scene",
  );

  assert.match(
    html,
    /<div\b(?=[^>]*role="tablist")(?=[^>]*aria-label="Developer artifacts")[^>]*>/i,
  );
  assert.match(
    html,
    /<div\b(?=[^>]*role="tablist")(?=[^>]*aria-label="Demo stages")[^>]*>/i,
  );
  assert.equal(countMatches(html, /role="tab"/gi), 7);
  assert.match(html, /id="demo-stage-panel"[^>]*role="tabpanel"/i);
  assert.match(text, /Walkthrough stages/);
  assert.match(text, /Selected-stage details/);
  assert.doesNotMatch(html, /id="demo-transcript-stage-1"[^>]*\bopen/i);
  assert.equal(
    countMatches(html, /aria-live="polite"/gi),
    1,
    "Demo must use one polite live region to avoid duplicate announcements",
  );
  assert.match(html, /id="demo-required-choice"[^>]*tabindex="-1"/i);
  assert.match(html, /href="#demo-static-transcript"/i);
  assert.match(
    html,
    /href="\/get-started\/"[^>]*>[^<]*View release-candidate documentation/i,
  );
  assert.match(
    html,
    /href="\/#contact"[^>]*>[^<]*Request a customized demo/i,
  );
  assert.match(
    html,
    /href="\/demo\/openclaw-reference\/"/i,
    "Demo must link to the separate OpenClaw reference candidate",
  );

  const boundary = sectionContaining(
    html,
    "Keep OpenClaw orchestration and MasuGate governance distinct.",
  );
  assert.match(textContent(boundary), /OpenClaw owns/);
  assert.match(textContent(boundary), /MasuGate owns/);
  assert.match(textContent(boundary), /Provider owns/);
  assert.match(textContent(boundary), /Unrelated tools remain outside/);
  assert.match(textContent(boundary), /OpenClaw 2026\.7\.1/);

  const portability = sectionContaining(
    html,
    "Keep the governance contract fixed. Change the host binding.",
  );
  for (const framework of [
    "OpenClaw",
    "LangChain / LangGraph",
    "Microsoft Agent Framework",
    "CrewAI",
  ]) {
    assert.ok(
      textContent(portability).includes(framework),
      `Demo portability bridge is missing: ${framework}`,
    );
  }
  assert.match(textContent(portability), /Reference candidate bindings/i);
  for (const logo of [
    "/logos/openclaw.svg",
    "/logos/langchain.svg",
    "/logos/microsoft-agent-framework-icon.png",
    "/logos/crewai.png",
  ]) {
    assert.match(portability, new RegExp(`src="${logo.replace(".", "\\.")}"`, "i"));
  }
  assert.match(
    portability,
    /href="\/demo\/#framework-portability"/i,
  );

  assert.match(text, /Simulated policy shape · Evidence: Reference/);
  assert.match(text, /Presentation: Simulated/);
  assert.match(text, /Evidence: Reference/);
  assert.doesNotMatch(text, /Two realistic ways governance can grow\./);
  assert.doesNotMatch(text, /Evidence: Verified/);
  assert.doesNotMatch(text, /Presentation: Recorded/);
  assert.doesNotMatch(text, /\bop_1048\b|team-budget:research|purchase:1048|version 12/i);
  assert.doesNotMatch(
    text,
    /\b(?:pip|npm|pnpm|yarn)\s+(?:install|add)\b|\buv\s+sync\b|\bdocker\s+compose\b/i,
  );
  assert.doesNotMatch(html, /\bSAGE\b/);
});

test("server-renders the bounded Milestone 3B OpenClaw reference candidate", async () => {
  const response = await render("/demo/openclaw-reference/");
  const html = await response.text();
  const text = textContent(html);

  assert.equal(response.status, 200);
  assert.equal(countMatches(html, /<h1\b/gi), 1);
  assertMasuGateChrome(html, "/demo/openclaw-reference");

  for (const requiredCopy of [
    "Milestone 3B · OpenClaw reference candidate",
    "Inspect the candidate-backed purchase path.",
    "Release: Unreleased",
    "Maturity: Experimental",
    "Evidence: Reference",
    "masugate-openclaw-reference/0.1.0",
    "OpenClaw 2026.7.1",
    "@masugate/openclaw@0.1.0",
    "masugate_governed_action",
    "spend.purchase",
    "masugate.spend.reference",
    "protected-external",
    "reference-purchase-v1",
    "openclaw:buyer-alpha",
    "Source-reviewed policy",
    "deny budget_cap when args.amount_cents > spend.available_cents(principal.team);",
    "spend.available_cents(String) -> Int",
    "scoped-policy-state",
    "100 ms declared maximum",
    "Pinned OpenClaw host round trip",
    "Clean-artifact concurrent procurement workload",
    "The source gate is designed to assert:",
    "PostgreSQL MasuGate state; SQLite effect fixture",
    "masugate/masugate",
    "6b3852ecb70bd55cb22bf78769028b9b52af9735",
    "Two document validators passed; runtime acceptance did not run.",
    "Reconcile the live release gate",
    "Intake complete",
    "Still required",
    "No website stage is release-backed yet.",
    "Stage 1 · Related candidate path",
    "Stage 2 · Related workload",
    "Stage 3 · Simulation only",
    "Return to the interactive walkthrough",
    "Request a customized demo",
  ]) {
    assert.ok(
      text.includes(requiredCopy),
      `OpenClaw reference is missing: ${requiredCopy}`,
    );
  }

  assert.match(
    html,
    /href="\/demo\/"[^>]*>[\s\S]*?Return to the interactive walkthrough/i,
  );
  assert.match(
    html,
    /href="\/#contact"[^>]*>[\s\S]*?Request a customized demo/i,
  );

  assert.doesNotMatch(text, /Evidence:\s*Verified/i);
  assert.doesNotMatch(text, /Presentation:\s*Recorded/i);
  assert.equal(
    linksIn(html).some(({ label }) => /\bRun locally\b/i.test(label)),
    false,
    "Candidate page must not offer a Run locally link",
  );
  assert.doesNotMatch(
    text,
    /\b(?:pip|npm|pnpm|yarn)\s+(?:install|add)\b|\buv\s+sync\b|\bdocker\s+compose\b/i,
  );
  assert.doesNotMatch(mainMarkup(html), /href="https?:\/\//i);
  assert.doesNotMatch(text, /\/Users\//);
});

test("server-renders the complete Milestone 2 homepage contract", async () => {
  const response = await render("/");
  const html = await response.text();
  const text = textContent(html);

  assert.equal(response.status, 200);

  for (const requiredCopy of [
    "Many agents. One changing state.",
    "Both requests fit. Together, they do not.",
    "Shared state is more than a budget.",
    "Keep the decision connected to the effect.",
    "Request → live decision → governed effect",
    "MasuGate protected path",
    "Policy decision",
    "Governed effect",
    "Committed",
    "Denied",
    "Pending",
    "Try it. Read it. Check the evidence.",
    "Interactive demo",
    "Public source",
    "Research paper",
    "Simulated · Reference",
    "Open source",
    "Paper · v1",
    "Read the latest. Test your own scenario.",
    "Latest writing",
    "Request a customized demo",
    "Open email draft",
    "Prefer webmail? Copy masugate.governance@gmail.com into a new message.",
    "See it happen",
    "Run the complete demo",
    "Run the demo",
    "Browse GitHub",
    "Open the paper",
    "All posts",
  ]) {
    assert.ok(text.includes(requiredCopy), `Home is missing: ${requiredCopy}`);
  }

  const hero = sectionContaining(html, "Many agents. One changing state.");
  assert.deepEqual(headingsIn(hero, 1), ["Many agents. One changing state."]);
  assert.deepEqual(linksIn(hero), [
    { href: "#shared-budget", label: "See it happen" },
    { href: "https://github.com/masugate/masugate", label: "GitHub" },
  ]);
  assert.match(
    hero,
    /<svg\b(?=[^>]*role="img")(?=[^>]*aria-labelledby="concurrent-state-hero-title")(?=[^>]*aria-describedby="concurrent-state-hero-description")[^>]*>/i,
  );
  assert.match(
    hero,
    /<title\b[^>]*id="concurrent-state-hero-title"[^>]*>Two concurrent agents act on one changing budget<\/title>/i,
  );
  assert.match(
    hero,
    /<desc\b[^>]*id="concurrent-state-hero-description"[^>]*>[^<]*later decision sees the lower balance[^<]*<\/desc>/i,
  );
  assert.match(
    hero,
    /<input\b(?=[^>]*aria-label="Pause motion")(?=[^>]*type="checkbox")[^>]*>/i,
  );
  assert.doesNotMatch(hero, /Open the demo|Review MasuGate/i);

  for (const comparisonCopy of [
    "Without coordination",
    "With MasuGate",
    "Rule broken",
    "Rule preserved",
  ]) {
    assert.ok(
      text.includes(comparisonCopy),
      `Home comparison is missing: ${comparisonCopy}`,
    );
  }

  const sharedStateStrip = sectionContaining(
    html,
    "Shared state is more than a budget.",
  );
  assert.deepEqual(headingsIn(sharedStateStrip, 3), [
    "Capacity",
    "Time",
    "Work",
  ]);
  for (const kind of ["capacity", "time", "work"]) {
    assert.match(sharedStateStrip, new RegExp(`data-state-kind="${kind}"`, "i"));
  }

  for (const controlLabel of ["Play", "Pause", "Previous", "Next", "Replay"]) {
    assert.match(
      html,
      new RegExp(`<(?:button|span)\\b[^>]*>[\\s\\S]*?\\b${controlLabel}\\b`, "i"),
      `Home SSR is missing the ${controlLabel} control text`,
    );
  }

  for (const fixtureText of [
    "Business",
    "$100",
    "$50",
    "Travel Planner",
    "Work Manager",
    "Refundable hotel deposit",
    "Hosted testing capacity",
  ]) {
    assert.ok(text.includes(fixtureText), `Home is missing fixture text: ${fixtureText}`);
  }
  assert.ok(
    countMatches(text, /\$60/g) >= 2,
    "Home must show both $60 requests",
  );

  const proof = sectionContaining(html, "Try it. Read it. Check the evidence.");
  assert.deepEqual(headingsIn(proof, 3), [
    "Interactive demo",
    "Public source",
    "Research paper",
  ]);
  assert.equal(
    countMatches(proof, /data-proof-resource="(?:demo|source|paper)"/g),
    3,
    "Home proof must stay bounded to three resource cards",
  );

  assert.match(
    html,
    /<a\b[^>]*href="https:\/\/arxiv\.org\/abs\/2608\.02764"[^>]*>/i,
    "Home must link to the latest MasuGate paper",
  );

  const staleAuthorization = sectionContaining(
    html,
    "Keep the decision connected to the effect.",
  );
  assert.match(staleAuthorization, /Figure 4/i);
  assert.match(staleAuthorization, /2608\.02764v1/i);
  assert.match(staleAuthorization, /Text equivalent/i);
  assert.match(textContent(staleAuthorization), /Request/);
  assert.match(textContent(staleAuthorization), /Policy decision/);
  assert.match(textContent(staleAuthorization), /Governed effect/);
  assert.match(textContent(staleAuthorization), /Committed/);
  assert.match(textContent(staleAuthorization), /Denied/);
  assert.match(textContent(staleAuthorization), /Pending/);

  assert.match(text, /categorized-purchase@v2/);

  assert.match(
    text,
    /Separate records retain the committed and denied operations\./,
  );

  const blogSection = sectionContaining(
    html,
    "Read the latest. Test your own scenario.",
  );
  assert.match(
    blogSection,
    /href="\/blog\/masugate-public-source-release\/"/i,
  );
  assert.match(
    blogSection,
    /href="\/blog\/when-time-becomes-agent-policy\/"/i,
  );
  assert.match(blogSection, /href="\/blog\/"[^>]*>[\s\S]*?All posts/i);

  const homepageMain = mainMarkup(html);
  assert.equal(
    countMatches(homepageMain, /<section\b/gi),
    6,
    "Home must keep the six-part narrative",
  );
  const homepageWordCount = textContent(homepageMain)
    .split(/\s+/)
    .filter(Boolean).length;
  assert.ok(
    homepageWordCount <= 818,
    `Home must retain the promised 50% copy reduction; found ${homepageWordCount} words`,
  );

  assert.match(html, /Yuxiang Peng/);
  assert.match(
    html,
    /<section\b(?=[^>]*\bid="contact")[^>]*>/i,
    "Home must expose the request-demo contact anchor",
  );
  assert.match(html, /Purdue University Computer Science/);
  assert.match(
    html,
    /href="https:\/\/www\.cs\.purdue\.edu\/people\/faculty\/yxpeng\.html"/,
  );
  assert.match(html, /Xiaodi Wu/);
  assert.match(html, /University of Maryland Computer Science/);
  assert.match(
    html,
    /href="https:\/\/www\.cs\.umd\.edu\/people\/xiaodiwu"/,
  );
  assert.match(html, /href="mailto:masugate\.governance@gmail\.com"/);
  assert.match(text, /What should the customized demo cover\?/);
  assert.match(
    text,
    /this website does not transmit or store the form/i,
  );
  assert.match(
    text,
    /This draft composer requires JavaScript\./i,
  );
  assert.doesNotMatch(html, /yxpeng@purdue\.edu|xwu@cs\.umd\.edu/i);
  assert.deepEqual(
    [
      ...new Set(
        [...html.matchAll(/href="(mailto:[^"]+)"/gi)].map(([, href]) => href),
      ),
    ],
    ["mailto:masugate.governance@gmail.com"],
    "Home may expose only the shared MasuGate inbox",
  );

  assert.doesNotMatch(html, /\bSAGE\b/);
  assert.doesNotMatch(
    text,
    /\b(?:pip|npm|pnpm|yarn)\s+(?:install|add)\b|\buv\s+sync\b|\bdocker\s+compose\b/i,
  );
  assert.doesNotMatch(
    text,
    /\b(?:LangChain|LangGraph|CrewAI|Omnigent)\b|Microsoft Agent Framework/,
  );
  assert.doesNotMatch(text, /\bVerified\b/);
  assert.doesNotMatch(
    text,
    /\b(?:TODO|TBD|placeholder|unavailable)\b|https?:\/\/(?:example\.com|localhost)\b/i,
  );
});

test("renders explicit evidence, presentation, release, and maturity status", async () => {
  const demoResponse = await render("/demo/");
  const demoHtml = await demoResponse.text();
  const demoTextMarkup = demoHtml.replace(/<!-- -->/g, "");

  assert.equal(demoResponse.status, 200);
  assert.match(demoTextMarkup, /Evidence: Reference/);
  assert.match(demoTextMarkup, /Presentation: Simulated/);
  assert.doesNotMatch(demoTextMarkup, /Evidence: Verified/);
  assert.doesNotMatch(demoTextMarkup, /Presentation: Recorded/);

  const getStartedResponse = await render("/get-started/");
  const getStartedHtml = await getStartedResponse.text();
  const getStartedTextMarkup = getStartedHtml.replace(/<!-- -->/g, "");

  assert.equal(getStartedResponse.status, 200);
  assert.match(getStartedTextMarkup, /Run the reference demo\./);
  assert.match(getStartedTextMarkup, /Five-minute demonstration/);
  assert.doesNotMatch(getStartedTextMarkup, /Evidence: Verified/);
});

test("server-renders the focused installation and five-minute demo guide", async () => {
  const response = await render("/get-started/");
  const html = await response.text();
  const text = textContent(html);

  assert.equal(response.status, 200);
  assert.equal(countMatches(html, /<h1\b/gi), 1);
  assertMasuGateChrome(html, "/get-started");

  for (const requiredCopy of [
    "Get Started",
    "Run the reference demo.",
    "Two steps",
    "Prepare the local release workspace.",
    "Run and verify the procurement scenario.",
    "Prepare once",
    "Set up the local workspace.",
    "Linux/amd64",
    "CPython 3.12",
    "Docker and Compose",
    "About 8 GiB free",
    "scripts/prepare-reference-demo.py",
    "Five-minute demonstration",
    "Run one governed procurement action.",
    "Run the scenario",
    "scripts/run_reference_demos.py procurement",
    "Expected result",
    "A governed receipt and PSS-valid execution.",
    "Verify the result",
    "scripts/verify-flagship-demo.py",
    "Open the OpenClaw demo",
    "Open technical reference",
  ]) {
    assert.ok(text.includes(requiredCopy), `Get Started is missing: ${requiredCopy}`);
  }

  for (const href of ["#run-demo", "/demo/"]) {
    assert.ok(
      linksIn(html).some((link) => link.href === href),
      `Get Started is missing its action: ${href}`,
    );
  }

  for (const href of [
    "https://github.com/masugate/masugate",
    "https://github.com/masugate/masugate/archive/refs/heads/main.zip",
    "https://github.com/masugate/masugate/blob/main/README.md",
  ]) {
    assert.ok(
      linksIn(html).some((link) => link.href === href),
      `Get Started is missing its public source link: ${href}`,
    );
  }

  assert.equal(countMatches(mainMarkup(html), /<pre\b/gi), 3);
  assert.match(html, /id="requirements"/i);
  assert.match(html, /id="run-demo"/i);
  assert.match(html, /id="verify-demo"/i);
  assert.doesNotMatch(text, /Milestone 4/i);
});

test("keeps detailed technical material on the Get Started subpage", async () => {
  const response = await render("/get-started/technical/");
  const html = await response.text();
  const text = textContent(html);

  assert.equal(response.status, 200);
  assertMasuGateChrome(html, "/get-started/technical");
  for (const requiredCopy of [
    "Technical reference",
    "Profiles, outcomes, and integration boundaries.",
    "Governed runtime anatomy",
    "Inspect the complete protected path.",
    "One decision needs one protected path",
    "Canonical governed-action path",
    "Agent environment",
    "Policy environment",
    "Provider environment",
    "Reference environment",
    "Operation outcomes",
    "Reference integration profiles",
    "OpenClaw boundary",
    "Troubleshooting",
    "Inspect the OpenClaw reference",
  ]) {
    assert.ok(text.includes(requiredCopy), `Technical reference is missing: ${requiredCopy}`);
  }
  assert.match(html, /Figure 1/i);
  assert.match(html, /Figure 4/i);
  assert.match(html, /2608\.02764v1/i);
  assert.match(html, /href="\/get-started\/"/i);
  assert.match(html, /href="\/demo\/openclaw-reference\/"/i);
});

test("returns 404 for an unpublished Blog slug", async () => {
  const response = await render("/blog/not-published/");

  assert.equal(response.status, 404);
  assert.match(response.headers.get("content-type") ?? "", /^text\/plain\b/i);
  assert.equal(await response.text(), "Not Found");
});

test("server-renders the release announcement and complete editorial series", async () => {
  const indexResponse = await render("/blog/");
  const indexHtml = await indexResponse.text();
  const indexText = textContent(indexHtml);

  assert.equal(indexResponse.status, 200);
  assertMasuGateChrome(indexHtml, "/blog");
  assert.match(indexText, /Blog & Updates/);
  assert.match(
    indexText,
    /Technical thinking and project updates, in one place\./,
  );
  assert.match(indexText, /Policy as Code, Not Prompt: A Practical Introduction/);
  assert.match(
    indexText,
    /MasuGate Is Now Public: From Research Prototype to Product-Oriented Release/,
  );
  assert.match(
    indexText,
    /When “Allowed” Goes Stale: Why Concurrent Agents Need Stateful Governance/,
  );
  assert.match(
    indexText,
    /Approved at 5:05: When Time Becomes Part of an Agent Policy/,
  );
  assert.equal(countMatches(indexText, /Technical article/g), 3);
  assert.equal(countMatches(indexText, /Announcement · Evidence · Reference/g), 1);
  assert.doesNotMatch(indexText, /No articles or updates are published/);
  assert.match(
    indexHtml,
    /aria-label="Latest announcement"/i,
    "The public-source announcement should render in the global banner",
  );
  assert.equal(
    linksIn(indexHtml).filter(({ label }) => label === "Read article →").length,
    3,
  );
  assert.equal(
    linksIn(indexHtml).filter(({ label }) => label === "Read announcement →").length,
    1,
    "The announcement index card exposes its dedicated reading link",
  );

  const routes = [
    {
      path: "/blog/masugate-public-source-release/",
      required: [
        "The gate is open.",
        "Update · current review target",
        "Reviewers should use 0.1.1",
        "The paper explains the technique. The repository engineers the path.",
        "Closer to a product-level engineering shape—without overclaiming maturity.",
        "Governance should meet agents where they already run.",
        "LangChain 1.3.14",
        "Microsoft Agent Framework Core 1.12.0",
        "CrewAI 1.15.6",
        "OpenClaw 2026.7.1",
        "Choose your entry point—and tell us where the boundary bends.",
        "Reading time 4 minutes",
        "Evidence and limitations",
        "Sources and further reading",
      ],
      hrefs: [
        "/",
        "/get-started/",
        "https://github.com/masugate/masugate",
        "https://arxiv.org/abs/2608.02764",
        "https://arxiv.org/abs/2608.02764v2",
        "https://github.com/masugate/masugate/blob/main/docs/pss-v0.1.1-correction.md",
        "https://github.com/masugate/masugate/blob/main/docs/framework-adapters.md",
      ],
    },
    {
      path: "/blog/policy-as-code-not-prompt/",
      required: [
        "The same sentence behaves differently in a prompt, in application code, and in a policy program.",
        "Conceptual policy — explanatory pseudocode",
        "Copy conceptual policy",
        "Read why language alone is not the runtime boundary",
        "Policy as code creates a lifecycle around the rule.",
        "Cedar is an important precedent",
        "No guarantee transfer",
        "Language makes the rule manageable. It does not keep changing state still.",
        "When “Allowed” Goes Stale",
        "Evidence and limitations",
        "Sources and further reading",
      ],
      hrefs: [
        "/blog/when-allowed-goes-stale/",
        "/demo/",
        "#language-boundary",
        "https://docs.cedarpolicy.com/",
      ],
    },
    {
      path: "/blog/when-allowed-goes-stale/",
      required: [
        "Nine units are gone. Two agents each ask for the last one.",
        "9 of 10 units consumed",
        "Both commit → 11 of 10",
        "Policy-state serializability",
        "Pending review is not an allow",
        "Decision is not effect",
        "Approval can also go stale",
        "Evidence status · Reference",
        "The guarantee is only as sound as the boundary around it.",
        "arXiv:2608.02764v1 · 3 August 2026",
      ],
      hrefs: [
        "/blog/policy-as-code-not-prompt/",
        "/demo/",
        "https://arxiv.org/abs/2608.02764v1",
      ],
    },
    {
      path: "/blog/when-time-becomes-agent-policy/",
      required: [
        "A $50 transfer is approved at 5:05. Should it run?",
        "The request can be on time while authorization is too late.",
        "Admission time and live authorization time",
        "The last 24 hours",
        "Human review forces a choice: revalidate current truth or reserve capacity.",
        "Current reference boundary",
        "Freshness, cooldowns, and request-bound approval",
        "Provider-owned event history",
        "experimental, opt-in event-history provider",
        "history.recent_bound_approval",
        "history.transfer_attempt_count",
        "history.distinct_transfer_receivers",
        "disabled by default",
        "A fact observed before closing is not proof",
        "Policy-State Serializability",
        "Reading time 11 minutes",
        "Evidence and limitations",
        "Sources and further reading",
      ],
      hrefs: [
        "/blog/when-allowed-goes-stale/",
        "/demo/",
        "https://github.com/masugate/masugate",
        "https://github.com/masugate/masugate/blob/main/docs/time-aware-policies.md",
        "https://github.com/masugate/masugate/blob/main/docs/event-history-provider.md",
        "https://arxiv.org/abs/2608.02764",
      ],
    },
  ];

  for (const route of routes) {
    const response = await render(route.path);
    const html = await response.text();
    const text = textContent(html);

    assert.equal(response.status, 200, route.path);
    assertMasuGateChrome(html, route.path);
    assert.equal(countMatches(html, /<h1\b/gi), 1, route.path);
    assert.match(html, /aria-label="In this article"/i, route.path);

    for (const required of route.required) {
      assert.ok(text.includes(required), `${route.path} is missing: ${required}`);
    }
    for (const href of route.hrefs) {
      assert.ok(
        linksIn(html).some((link) => link.href === href),
        `${route.path} is missing link: ${href}`,
      );
    }

    assert.doesNotMatch(text, /Evidence:\s*Verified|Presentation:\s*Recorded/i);
    assert.doesNotMatch(
      text,
      /\b(?:pip3?|npm|npx|pnpm|yarn)\s+(?:install|add|run)\b|\buv\s+sync\b|\bgit\s+clone\b|\bdocker\s+compose\b/i,
    );
    assert.doesNotMatch(text, /\bOmnigent\b/);
    if (route.path !== "/blog/masugate-public-source-release/") {
      assert.doesNotMatch(text, /Microsoft Agent Framework/);
    }
    assert.doesNotMatch(html, /\bSAGE\b/);
  }
});

test("permanently redirects legacy routes with complete successors", async () => {
  const routes = [
    ["/team/", "/#contact"],
    ["/project/", "/#contact"],
    ["/resources/", "/blog/"],
    [
      "/resources/policy-as-program/",
      "/blog/policy-as-code-not-prompt/",
    ],
    [
      "/resources/technical-foundation/",
      "/blog/when-allowed-goes-stale/",
    ],
    [
      "/how-it-works/",
      "/blog/when-allowed-goes-stale/#the-governed-boundary",
    ],
    ["/integrations/", "/demo/#framework-portability"],
    ["/use-cases/purchasing/", "/#shared-budget"],
    ["/use-cases/calendar/", "/demo/#demo-transcript-stage-3"],
    ["/use-cases/workspace/", "/demo/#demo-transcript-stage-3"],
  ];

  for (const [path, destination] of routes) {
    const response = await render(path);
    assert.equal(response.status, 308, path);
    assert.equal(
      new URL(response.headers.get("location")).pathname +
        new URL(response.headers.get("location")).hash,
      destination,
      path,
    );
  }

  const alternateSlashResponse = await render("/team?source=legacy");
  assert.equal(alternateSlashResponse.status, 308);
  assert.equal(
    alternateSlashResponse.headers.get("location"),
    "http://localhost/?source=legacy#contact",
  );
});

test("server-renders retained legacy detail routes", async () => {
  const routes = [
    ["/use-cases/", /Govern the outcome agents share\./],
    ["/use-cases/business-controls/", /Restricted data \+ new vendor/],
    ["/resources/get-started/", /Start with one bounded governed action\./],
    [
      "/resources/governed-action-lifecycle/",
      /Inside the documents of a governed action\./,
    ],
    ["/resources/evidence/", /How to evaluate a governance claim\./],
  ];

  for (const [path, expected] of routes) {
    const response = await render(path);
    assert.equal(response.status, 200, path);
    assert.match(await response.text(), expected, path);
  }
});

test("renders highlighted technical code samples on the retained guide", async () => {
  const response = await render("/resources/get-started/");
  const html = await response.text();

  assert.match(html, /data-language="SAGE policy"/);
  assert.match(html, /data-language="Python"/);
  assert.match(html, /syntax-token syntax-keyword/);
  assert.match(html, /syntax-token syntax-string/);
  assert.match(html, /syntax-token syntax-number/);
});
