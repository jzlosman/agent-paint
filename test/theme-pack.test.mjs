import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

import {
  contrastRatio,
  loadThemes,
  renderPlugin,
  renderPreview,
  validateTheme,
} from "../scripts/theme-pack.mjs";

const validTheme = {
  id: "example-dark",
  name: "Example Dark",
  appearance: "dark",
  colors: {
    background: "#101010",
    foreground: "#f0f0f0",
    raised: "#181818",
    control: "#202020",
    border: "#303030",
    accent: "#80a0ff",
    mutedForeground: "#a0a0a0",
    ring: "#80a0ff",
  },
  source: {
    repository: "https://github.com/example/theme",
    commit: "0123456789abcdef0123456789abcdef01234567",
    files: ["palette.json"],
    license: "MIT",
    licenseUrl: "https://github.com/example/theme/blob/0123456789abcdef0123456789abcdef01234567/LICENSE",
  },
};

test("validates a complete theme record", () => {
  assert.doesNotThrow(() => validateTheme(validTheme, "example-dark.json"));
});

test("rejects malformed colors and incomplete provenance", () => {
  const invalid = structuredClone(validTheme);
  invalid.colors.accent = "blue";
  invalid.source.commit = "main";

  assert.throws(
    () => validateTheme(invalid, "invalid.json"),
    /accent must be a hex color.*commit must be a full Git SHA/s,
  );
});

test("computes WCAG contrast", () => {
  assert.equal(contrastRatio("#000000", "#ffffff"), 21);
  assert.ok(contrastRatio("#101010", "#f0f0f0") >= 4.5);
});

test("renders deterministic Paseo theme contributions", () => {
  const output = renderPlugin([validTheme]);

  assert.match(output, /import type \{ PluginContext, PluginThemeContribution \}/);
  assert.match(output, /id: "example-dark"/);
  assert.match(output, /plugin\.addTheme\(theme\)/);
  assert.doesNotMatch(output, /source|repository|commit/);
  assert.equal(output, renderPlugin([structuredClone(validTheme)]));
});

test("loads the curated 30-theme collection", async () => {
  const themes = await loadThemes(new URL("../themes/", import.meta.url));
  const ids = themes.map((theme) => theme.id);

  assert.equal(themes.length, 30);
  assert.equal(new Set(ids).size, themes.length);
  assert.ok(themes.some((theme) => theme.appearance === "light"));
  assert.ok(themes.some((theme) => theme.appearance === "dark"));

  for (const theme of themes) {
    assert.doesNotThrow(() => validateTheme(theme, `${theme.id}.json`));
    assert.ok(
      contrastRatio(theme.colors.background, theme.colors.foreground) >= 4.5,
      `${theme.name} primary text must meet WCAG AA contrast`,
    );
  }
});

test("checked-in plugin matches the JSON source", async () => {
  const themes = await loadThemes(new URL("../themes/", import.meta.url));
  const checkedIn = await readFile(new URL("../index.ts", import.meta.url), "utf8");

  assert.equal(checkedIn, renderPlugin(themes));
});

test("renders a shareable palette preview", () => {
  const output = renderPreview([validTheme]);

  assert.match(output, /^<svg/);
  assert.match(output, /Example Dark/);
  assert.match(output, /#101010/);
  assert.match(output, /#80a0ff/);
});

test("checked-in preview matches the JSON source", async () => {
  const themes = await loadThemes(new URL("../themes/", import.meta.url));
  const checkedIn = await readFile(new URL("../docs/theme-grid.svg", import.meta.url), "utf8");

  assert.equal(checkedIn, renderPreview(themes));
});
