# ChatGPT and Codex CLI Theme Support Implementation Plan

> **REQUIRED SUB-SKILL:** Use the executing-plans skill to implement this plan task-by-task.

**Goal:** Generate truthful ChatGPT desktop appearance imports and Codex CLI TextMate themes, expose both in the gallery, and make agent-led installation the default documentation path.

**Architecture:** Keep `themes/themes.json` as the terminal-first source. Add two pure adapters in `scripts/theme-pack.mjs`: one emits a portable `codex-theme-v1:` string for ChatGPT desktop, and one emits deterministic `.tmTheme` XML for Codex CLI. Extend generation, catalog data, gallery controls, and README prompts without adding runtime dependencies.

**Tech Stack:** Node.js ESM, static HTML/CSS/JavaScript, JSON, TextMate plist XML, Node test runner.

---

### Task 1: Add ChatGPT and Codex CLI adapters

**Files:**
- Modify: `scripts/theme-pack.mjs`
- Test: `test/theme-pack.test.mjs`

1. Add failing tests for `buildChatGptThemeString(theme)` asserting the `codex-theme-v1:` prefix, exact required schema, matching light/dark variant, portable null fonts, safe `codeThemeId: "codex"`, and deterministic output.
2. Add failing tests for `renderCodexCliTheme(theme)` asserting valid plist structure, theme identity, background/foreground/selection colors, and syntax scopes sourced from the canonical palette.
3. Run `node --test --test-name-pattern='ChatGPT|Codex CLI' test/theme-pack.test.mjs` and confirm missing-export failures.
4. Implement the two pure adapters. Escape XML text and plist values. Keep Codex CLI claims scoped to syntax highlighting.
5. Re-run targeted tests and confirm they pass.

### Task 2: Generate and publish artifacts

**Files:**
- Modify: `scripts/generate.mjs`
- Modify: `scripts/theme-pack.mjs`
- Create: `dist/chatgpt/*.txt`
- Create: `dist/codex-cli/*.tmTheme`
- Modify: `site/themes.json`
- Test: `test/theme-pack.test.mjs`

1. Add failing tests for checked-in ChatGPT strings, Codex CLI files, and catalog delivery fields.
2. Extend `buildSiteCatalog()` with `chatgpt`, `chatgptImport`, `codexCli`, and `codexCliDownload` fields.
3. Add both artifact families to `generatedFiles` and create their directories.
4. Run `npm run generate` and targeted tests.
5. Confirm `node scripts/generate.mjs --check` reports no stale outputs.

### Task 3: Add gallery targets and agent handoffs

**Files:**
- Modify: `site/index.html`
- Modify: `site/app.js`
- Modify: `site/styles.css`
- Test: `test/theme-pack.test.mjs`

1. Add failing shell tests for `data-target="chatgpt"` and `data-target="codex-cli"`, five-target responsive layout, and target-specific prompt/download behavior.
2. Add ChatGPT and Codex CLI target buttons, notes, previews, display names, and prompts.
3. For ChatGPT, the selected action copies the `codex-theme-v1:` import string and the install prompt tells the agent to stop for **Settings → Appearance → Import**.
4. For Codex CLI, download `.tmTheme`; the prompt instructs the agent to back up config, copy it under the collision-safe `agent-paint-<id>.tmTheme` name in `$CODEX_HOME/themes`, and ask before setting the valid dotted TOML key `tui.theme`.
5. Use a wrapping/five-column desktop selector and a 3+2 mobile grid without horizontal overflow.
6. Bump the static asset cache key.

### Task 4: Update all product documentation and visual metadata

**Files:**
- Modify: `README.md`
- Modify: `PRODUCT.md`
- Modify: `DESIGN.md`
- Modify: `scripts/theme-pack.mjs`
- Modify: `site/index.html`
- Modify: `site/agent-paint-open-graph.png`
- Test: `test/theme-pack.test.mjs`

1. Add failing assertions for five targets and ChatGPT/Codex CLI install guidance.
2. Update README header badge, overview, supported-target list, agent prompt, manual/handoff instructions, repository layout, and truthful capability notes.
3. Update product/design target language and generated SVG header.
4. Edit the Open Graph image target line to include ChatGPT and Codex CLI, preserving 1280×640 output.
5. Update Open Graph descriptions and alt text.

### Task 5: Verify, review, deploy

**Files:** all changed files.

1. Run `npm run check` and `git diff --check`.
2. Serve `site/` locally and verify desktop/mobile target controls, all 30 cards, ChatGPT copy content, Codex CLI download link, and no overflow.
3. Run the Impeccable detector once over changed site files.
4. Request a focused code review of adapters, generated formats, claims, and install safety.
5. Commit, push, wait for Pages deployment, and verify the live page and artifacts.
