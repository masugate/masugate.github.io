import assert from "node:assert/strict";
import test from "node:test";
import {
  createThemeBootScript,
  isThemePreference,
  resolveTheme,
  themeForLocalHour,
} from "../app/data/theme.ts";

test("automatic theme follows the local 07:00 and 19:00 boundaries", () => {
  assert.equal(themeForLocalHour(0), "dark");
  assert.equal(themeForLocalHour(6), "dark");
  assert.equal(themeForLocalHour(7), "light");
  assert.equal(themeForLocalHour(18), "light");
  assert.equal(themeForLocalHour(19), "dark");
  assert.equal(themeForLocalHour(23), "dark");
  assert.throws(() => themeForLocalHour(24), /Invalid local hour/);
});

test("manual theme choices override the automatic schedule", () => {
  assert.equal(resolveTheme("auto", 12), "light");
  assert.equal(resolveTheme("auto", 22), "dark");
  assert.equal(resolveTheme("dark", 12), "dark");
  assert.equal(resolveTheme("light", 22), "light");
});

test("theme preferences and the pre-paint script stay bounded", () => {
  assert.equal(isThemePreference("auto"), true);
  assert.equal(isThemePreference("light"), true);
  assert.equal(isThemePreference("dark"), true);
  assert.equal(isThemePreference("system"), false);

  const script = createThemeBootScript();
  assert.match(script, /masugate-theme-preference/);
  assert.match(script, /h>=7&&h<19/);
  assert.doesNotMatch(script, /document\.write|innerHTML/);
});
