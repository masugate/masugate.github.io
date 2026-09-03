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
