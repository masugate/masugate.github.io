import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

function relativeLuminance(hex) {
  const channels = [1, 3, 5].map((start) =>
    Number.parseInt(hex.slice(start, start + 2), 16) / 255,
  );
  const linear = channels.map((channel) =>
    channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4,
  );

  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrastRatio(foreground, background) {
  const luminances = [
    relativeLuminance(foreground),
    relativeLuminance(background),
  ].sort((left, right) => right - left);

  return (luminances[0] + 0.05) / (luminances[1] + 0.05);
}

function colorVariable(css, name) {
  const match = css.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`, "i"));
  assert.ok(match, `missing --${name}`);
  return match[1];
}

function darkThemeBlock(css) {
  const match = css.match(
    /:root\[data-masugate-theme="dark"\] \.masugate-site\s*\{([\s\S]*?)\}/,
  );
  assert.ok(match, "missing dark theme token override");
  return match[1];
}

function cssRuleBodies(css, selector) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  return [
    ...css.matchAll(new RegExp(`${escapedSelector}\\s*\\{([^{}]*)\\}`, "g")),
  ].map(([, body]) => body);
}

test("MasuGate chrome retains visible focus, skip-link, and reduced-motion rules", async () => {
  const css = await readFile("app/(masugate)/primary.css", "utf8");

  assert.match(css, /:where\(a, button, summary\):focus-visible/);
  assert.match(css, /outline:\s*3px solid var\(--p-info\)/);
  assert.match(css, /\.masugate-skip-link:focus\s*\{[\s\S]*?translate:\s*0/);
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /@media \(max-width:\s*900px\)/);
  assert.match(css, /@media \(max-width:\s*640px\)/);
});

test("externally embedded logo assets contain no ungoverned motion", async () => {
  const openClawLogo = await readFile("public/logos/openclaw.svg", "utf8");

  assert.match(openClawLogo, /viewBox="0 0 120 120"/);
  assert.match(openClawLogo, /lobster-gradient/);
  assert.doesNotMatch(
    openClawLogo,
    /<(?:animate|animateMotion|animateTransform|set)\b/i,
  );
  assert.doesNotMatch(
    openClawLogo,
    /@keyframes|\b(?:animation|transition)(?:-[a-z-]+)?\s*:/i,
  );
});

test("policy comparison is responsive and keeps optional motion accessible", async () => {
  const css = await readFile(
    "app/components/MasuGateSchematics.module.css",
    "utf8",
  );

  assert.match(
    css,
    /\.policyCaseViewport\s*\{[\s\S]*?max-width:\s*100%[\s\S]*?overflow-x:\s*auto[\s\S]*?scroll-snap-type:\s*inline mandatory/,
  );
  assert.match(
    css,
    /\.policyCase\s*\{[\s\S]*?min-width:\s*0[\s\S]*?flex:\s*0 0 calc\([\s\S]*?scroll-snap-align:\s*start/,
  );
  assert.match(css, /\.policyCaseNav a\s*\{[\s\S]*?min-height:\s*44px/);
  assert.match(
    css,
    /@media \(max-width:\s*680px\)[\s\S]*?\.policyCaseFlow[\s\S]*?grid-template-columns:\s*1fr/,
  );
  assert.match(
    css,
    /@media \(prefers-reduced-motion:\s*no-preference\)[\s\S]*?:global\(\[data-motion-visible="true"\]\)[\s\S]*?animation:\s*lifecycle-arrive/,
  );
  assert.match(
    css,
    /@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*?animation:\s*none/,
  );
  assert.equal(
    [...css.matchAll(/@keyframes\s+/g)].length,
    2,
    "policy visuals must reuse the existing schematic keyframes",
  );
});

test("homepage hero keeps the complete outcome diagram in its viewport", async () => {
  const [diagramCss, homepageCss] = await Promise.all([
    readFile("app/components/ConcurrentStateHero.module.css", "utf8"),
    readFile("app/(masugate)/home.module.css", "utf8"),
  ]);
  const diagramRules = cssRuleBodies(diagramCss, ".diagram");
  const diagramMinimums = diagramRules.flatMap((rule) =>
    [...rule.matchAll(/\bmin-width:\s*([^;]+);/g)].map(([, value]) =>
      value.trim(),
    ),
  );

  assert.ok(diagramRules.length > 0, "missing hero diagram rule");
  assert.ok(
    diagramMinimums.length > 0,
    "hero diagram must declare its minimum width",
  );
  for (const value of diagramMinimums) {
    const length = value.match(/^(-?\d*\.?\d+)([a-z%]*)$/i);
    assert.ok(length, `unsupported hero diagram minimum width: ${value}`);
    assert.equal(
      Number(length[1]),
      0,
      `hero diagram forces horizontal overflow: ${value}`,
    );
  }

  const heroGridRule = cssRuleBodies(homepageCss, ".heroGrid")[0];
  assert.ok(heroGridRule, "missing homepage hero grid rule");
  const tracks = heroGridRule.match(
    /grid-template-columns:\s*minmax\(\s*([^,]+),\s*([\d.]+)fr\s*\)\s*minmax\(\s*([^,]+),\s*([\d.]+)fr\s*\)/,
  );
  assert.ok(tracks, "homepage hero must use two flexible minmax tracks");
  assert.equal(tracks[1].trim(), "0", "hero copy track must be shrinkable");
  assert.equal(tracks[3].trim(), "0", "hero diagram track must be shrinkable");
  assert.ok(
    Number(tracks[4]) >= Number(tracks[2]),
    "hero diagram track must be at least as wide as the copy track",
  );
});

test("core semantic color pairs retain WCAG AA text contrast", async () => {
  const css = await readFile("app/(masugate)/primary.css", "utf8");
  const colors = Object.fromEntries(
    [
      "p-ink",
      "p-ink-soft",
      "p-paper",
      "p-surface",
      "p-decision-allow",
      "p-decision-deny",
      "p-decision-escalate",
      "p-deny-soft",
      "p-pending-soft",
      "p-info",
      "p-info-soft",
      "p-footer-bg",
      "p-footer-ink",
      "p-footer-ink-soft",
      "p-footer-accent",
    ].map((name) => [name, colorVariable(css, name)]),
  );
  const pairs = [
    ["p-ink", "p-paper"],
    ["p-ink-soft", "p-paper"],
    ["p-decision-allow", "p-paper"],
    ["p-decision-deny", "p-deny-soft"],
    ["p-decision-escalate", "p-pending-soft"],
    ["p-info", "p-info-soft"],
    ["p-surface", "p-ink"],
    ["p-footer-ink", "p-footer-bg"],
    ["p-footer-ink-soft", "p-footer-bg"],
    ["p-footer-accent", "p-footer-bg"],
  ];

  for (const [foreground, background] of pairs) {
    assert.ok(
      contrastRatio(colors[foreground], colors[background]) >= 4.5,
      `${foreground} on ${background} must meet 4.5:1`,
    );
  }
});

test("dark semantic colors retain text and control-boundary contrast", async () => {
  const css = darkThemeBlock(
    await readFile("app/(masugate)/primary.css", "utf8"),
  );
  const colors = Object.fromEntries(
    [
      "p-ink",
      "p-ink-soft",
      "p-paper",
      "p-surface",
      "p-decision-allow",
      "p-decision-deny",
      "p-decision-escalate",
      "p-deny-soft",
      "p-pending-soft",
      "p-info",
      "p-info-soft",
      "p-accent-violet",
      "p-accent-violet-soft",
      "p-line-strong",
      "p-footer-bg",
      "p-footer-ink",
      "p-footer-ink-soft",
      "p-footer-accent",
    ].map((name) => [name, colorVariable(css, name)]),
  );
  const textPairs = [
    ["p-ink", "p-paper"],
    ["p-ink-soft", "p-paper"],
    ["p-decision-allow", "p-paper"],
    ["p-decision-deny", "p-deny-soft"],
    ["p-decision-escalate", "p-pending-soft"],
    ["p-info", "p-info-soft"],
    ["p-accent-violet", "p-accent-violet-soft"],
    ["p-footer-ink", "p-footer-bg"],
    ["p-footer-ink-soft", "p-footer-bg"],
    ["p-footer-accent", "p-footer-bg"],
  ];

  for (const [foreground, background] of textPairs) {
    assert.ok(
      contrastRatio(colors[foreground], colors[background]) >= 4.5,
      `dark ${foreground} on ${background} must meet 4.5:1`,
    );
  }

  assert.ok(
    contrastRatio(colors["p-line-strong"], colors["p-surface"]) >= 3,
    "dark control boundaries must meet 3:1",
  );
});
