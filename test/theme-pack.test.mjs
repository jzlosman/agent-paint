import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

import {
  buildPiTheme,
  buildSiteCatalog,
  buildSupersetTheme,
  contrastRatio,
  deriveUiColors,
  loadThemes,
  parseGhosttyTheme,
  renderPlugin,
  renderPreview,
  validateTheme,
} from "../scripts/theme-pack.mjs";

const validTheme = {
  id: "example-dark",
  name: "Example Dark",
  appearance: "dark",
  accent: "#80a0ff",
  terminal: {
    background: "#101010",
    foreground: "#f0f0f0",
    cursor: "#80a0ff",
    cursorText: "#101010",
    selectionBackground: "#303030",
    selectionForeground: "#f0f0f0",
    ansi: [
      "#101010", "#ff6060", "#80c080", "#e0c060",
      "#80a0ff", "#c080d0", "#70c0c0", "#d0d0d0",
      "#606060", "#ff8080", "#a0d0a0", "#f0d080",
      "#a0b8ff", "#d8a0e0", "#90d0d0", "#ffffff"
    ],
  },
  terminalSource: {
    repository: "https://github.com/example/terminal-themes",
    commit: "fedcba9876543210fedcba9876543210fedcba98",
    file: "ghostty/Example Dark",
    theme: "Example Dark",
    license: "MIT",
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

test("rejects malformed colors, terminal palettes, and provenance", () => {
  const invalid = structuredClone(validTheme);
  invalid.accent = "blue";
  invalid.terminal.ansi.pop();
  invalid.source.commit = "main";

  assert.throws(
    () => validateTheme(invalid, "invalid.json"),
    /accent must be a hex color.*terminal ANSI palette must contain 16 hex colors.*commit must be a full Git SHA/s,
  );
});

test("computes WCAG contrast", () => {
  assert.equal(contrastRatio("#000000", "#ffffff"), 21);
  assert.ok(contrastRatio("#101010", "#f0f0f0") >= 4.5);
});

test("derives readable, visibly separated UI semantics", () => {
  const colors = deriveUiColors(validTheme);

  assert.ok(contrastRatio(colors.background, colors.foreground) >= 7);
  assert.ok(contrastRatio(colors.background, colors.mutedForeground) >= 4.5);
  assert.ok(contrastRatio(colors.background, colors.raised) >= 1.1);
  assert.ok(contrastRatio(colors.background, colors.control) >= 1.25);
  assert.notEqual(colors.raised, colors.control);
  assert.equal(colors.accent, "#80a0ff");
});

test("parses a Ghostty terminal palette", () => {
  const terminal = parseGhosttyTheme(`
    palette = 0=#101010
    palette = 1=#ff0000
    palette = 2=#00ff00
    palette = 3=#ffff00
    palette = 4=#0000ff
    palette = 5=#ff00ff
    palette = 6=#00ffff
    palette = 7=#dddddd
    palette = 8=#555555
    palette = 9=#ff5555
    palette = 10=#55ff55
    palette = 11=#ffff55
    palette = 12=#5555ff
    palette = 13=#ff55ff
    palette = 14=#55ffff
    palette = 15=#ffffff
    background = #111111
    foreground = #eeeeee
    cursor-color = #ffffff
    cursor-text = #111111
    selection-background = #333333
    selection-foreground = #ffffff
  `);

  assert.equal(terminal.background, "#111111");
  assert.equal(terminal.foreground, "#eeeeee");
  assert.equal(terminal.ansi.length, 16);
  assert.equal(terminal.ansi[4], "#0000ff");
  assert.equal(terminal.cursor, "#ffffff");
  assert.equal(terminal.selectionBackground, "#333333");
});

test("builds a complete Pi theme", () => {
  const output = buildPiTheme(validTheme);
  const required = [
    "accent", "border", "borderAccent", "borderMuted", "success", "error", "warning",
    "muted", "dim", "text", "thinkingText", "selectedBg", "userMessageBg",
    "userMessageText", "customMessageBg", "customMessageText", "customMessageLabel",
    "toolPendingBg", "toolSuccessBg", "toolErrorBg", "toolTitle", "toolOutput",
    "mdHeading", "mdLink", "mdLinkUrl", "mdCode", "mdCodeBlock", "mdCodeBlockBorder",
    "mdQuote", "mdQuoteBorder", "mdHr", "mdListBullet", "toolDiffAdded",
    "toolDiffRemoved", "toolDiffContext", "syntaxComment", "syntaxKeyword",
    "syntaxFunction", "syntaxVariable", "syntaxString", "syntaxNumber", "syntaxType",
    "syntaxOperator", "syntaxPunctuation", "thinkingOff", "thinkingMinimal",
    "thinkingLow", "thinkingMedium", "thinkingHigh", "thinkingXhigh", "thinkingMax",
    "bashMode",
  ];

  assert.equal(output.name, "example-dark");
  assert.deepEqual(Object.keys(output.colors).sort(), required.sort());
  assert.equal(output.colors.text, deriveUiColors(validTheme).foreground);
  assert.equal(output.colors.syntaxString, validTheme.terminal.ansi[2]);
});

test("builds a complete Superset UI and terminal theme", () => {
  const output = buildSupersetTheme(validTheme);

  assert.equal(output.id, "theme-pack-example-dark");
  assert.equal(output.type, "dark");
  assert.equal(output.ui.background, deriveUiColors(validTheme).background);
  assert.equal(output.ui.mutedForeground, deriveUiColors(validTheme).mutedForeground);
  assert.equal(output.terminal.background, validTheme.terminal.background);
  assert.equal(output.terminal.brightWhite, validTheme.terminal.ansi[15]);
  assert.equal(Object.keys(output.terminal).length, 21);
});

test("renders deterministic Paseo theme contributions", () => {
  const output = renderPlugin([validTheme]);

  assert.match(output, /import type \{ PluginContext, PluginThemeContribution \}/);
  assert.match(output, /id: "example-dark"/);
  assert.match(output, new RegExp(`raised: "${deriveUiColors(validTheme).raised}"`));
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

  const piTextTokens = [
    "success", "error", "warning", "muted", "dim", "text", "thinkingText",
    "userMessageText", "customMessageText", "customMessageLabel", "toolTitle", "toolOutput",
    "mdHeading", "mdLink", "mdLinkUrl", "mdCode", "mdCodeBlock", "mdQuote",
    "mdListBullet", "toolDiffAdded", "toolDiffRemoved", "toolDiffContext",
    "syntaxComment", "syntaxKeyword", "syntaxFunction", "syntaxVariable", "syntaxString",
    "syntaxNumber", "syntaxType", "syntaxOperator", "syntaxPunctuation",
  ];

  for (const theme of themes) {
    assert.doesNotThrow(() => validateTheme(theme, `${theme.id}.json`));
    assert.equal(theme.terminal.ansi.length, 16);
    const colors = deriveUiColors(theme);
    assert.ok(
      contrastRatio(colors.background, colors.foreground) >= 7,
      `${theme.name} primary text must meet enhanced contrast`,
    );
    assert.ok(
      contrastRatio(colors.background, colors.mutedForeground) >= 4.5,
      `${theme.name} secondary text must meet WCAG AA contrast`,
    );

    const pi = buildPiTheme(theme);
    for (const token of piTextTokens) {
      assert.ok(
        contrastRatio(theme.terminal.background, pi.colors[token]) >= 4.5,
        `${theme.name} Pi ${token} must meet WCAG AA contrast`,
      );
    }
  }
});

test("checked-in plugin matches the JSON source", async () => {
  const themes = await loadThemes(new URL("../themes/", import.meta.url));
  const checkedIn = await readFile(new URL("../index.ts", import.meta.url), "utf8");

  assert.equal(checkedIn, renderPlugin(themes));
});

test("builds gallery records from generated target truth", () => {
  const [record] = buildSiteCatalog([validTheme]);

  assert.equal(record.id, validTheme.id);
  assert.deepEqual(record.paseo, deriveUiColors(validTheme));
  assert.equal(record.piDownload, `dist/pi/${validTheme.id}.json`);
  assert.equal(record.supersetDownload, `dist/superset/${validTheme.id}.json`);
  assert.equal(record.terminal.ansi.length, 16);
});

test("checked-in Pi and Superset themes match the JSON source", async () => {
  const themes = await loadThemes(new URL("../themes/", import.meta.url));

  for (const theme of themes) {
    const pi = JSON.parse(await readFile(new URL(`../dist/pi/${theme.id}.json`, import.meta.url), "utf8"));
    const superset = JSON.parse(await readFile(new URL(`../dist/superset/${theme.id}.json`, import.meta.url), "utf8"));
    assert.deepEqual(pi, buildPiTheme(theme));
    assert.deepEqual(superset, buildSupersetTheme(theme));
  }

  const bundle = JSON.parse(await readFile(new URL("../dist/superset/all-themes.json", import.meta.url), "utf8"));
  assert.equal(bundle.length, themes.length);
});

test("checked-in gallery data and shell expose every theme and target", async () => {
  const themes = await loadThemes(new URL("../themes/", import.meta.url));
  const catalog = JSON.parse(await readFile(new URL("../site/themes.json", import.meta.url), "utf8"));
  const html = await readFile(new URL("../site/index.html", import.meta.url), "utf8");

  assert.deepEqual(catalog, buildSiteCatalog(themes));
  assert.match(html, /data-target="paseo"/);
  assert.match(html, /data-target="pi"/);
  assert.match(html, /data-target="superset"/);
  assert.match(html, /id="theme-gallery"/);
  assert.match(html, /Agent Paint/);
  assert.match(html, /Let your agent install it/);
  assert.match(html, /agent-paint-logo\.png/);
  assert.doesNotMatch(html, /signal-strip|contrast-badge|AA[\s\S]*secondary text/);
});

test("mobile gallery keeps selected actions and agent install reachable", async () => {
  const css = await readFile(new URL("../site/styles.css", import.meta.url), "utf8");
  const app = await readFile(new URL("../site/app.js", import.meta.url), "utf8");

  assert.match(css, /@media \(max-width: 590px\)[\s\S]*\.selection-panel \{[\s\S]*position: fixed/);
  assert.doesNotMatch(css, /nav a:not\(:last-child\)/);
  assert.match(app, /button\.setAttribute\("aria-pressed", "false"\)/);
});

test("release site publishes downloadable target files and safe undo instructions", async () => {
  const workflow = await readFile(new URL("../.github/workflows/pages.yml", import.meta.url), "utf8");
  const app = await readFile(new URL("../site/app.js", import.meta.url), "utf8");
  const readme = await readFile(new URL("../README.md", import.meta.url), "utf8");

  assert.match(workflow, /cp -R dist _site\/dist/);
  assert.match(app, /setAttribute\("download"/);
  assert.match(app, /github\.com\/jzlosman\/paseo-theme-pack\/blob\/main\/README\.md/);
  assert.doesNotMatch(app, /jzlosman\.github\.io\/paseo-theme-pack/);
  assert.match(readme, /^# Agent Paint/m);
  assert.match(readme, /before-theme-pack/);
  assert.match(readme, /superset settings theme remove theme-pack-nord/);
  assert.match(readme, /paseo plugin remove paseo-theme-pack/);
});

test("renders a shareable palette preview", () => {
  const output = renderPreview([validTheme]);

  assert.match(output, /^<svg/);
  assert.match(output, /Example Dark/);
  assert.match(output, /#101010/);
  assert.match(output, new RegExp(deriveUiColors(validTheme).raised));
  assert.match(output, /#80a0ff/);
});

test("checked-in preview matches the JSON source", async () => {
  const themes = await loadThemes(new URL("../themes/", import.meta.url));
  const checkedIn = await readFile(new URL("../docs/theme-grid.svg", import.meta.url), "utf8");

  assert.equal(checkedIn, renderPreview(themes));
});
