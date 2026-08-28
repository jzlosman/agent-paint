<p align="center">
  <a href="https://jzlosman.github.io/agent-paint/">
    <img src="site/agent-paint-logo.png" alt="Agent Paint logo" width="112">
  </a>
</p>

<h1 align="center">Agent Paint</h1>

<p align="center"><strong>Popular color schemes for coding agents.</strong></p>

<p align="center">
  <a href="https://jzlosman.github.io/agent-paint/">Browse themes</a>
  ·
  <a href="#let-your-agent-install-a-theme">Install with your agent</a>
  ·
  <a href="#install-manually">Install manually</a>
</p>

<p align="center">
  <a href="https://github.com/jzlosman/agent-paint/actions/workflows/pages.yml"><img alt="Pages deployment" src="https://github.com/jzlosman/agent-paint/actions/workflows/pages.yml/badge.svg"></a>
  <a href="LICENSE"><img alt="MIT license" src="https://img.shields.io/badge/license-MIT-8cc8ff"></a>
  <a href="#themes"><img alt="30 themes" src="https://img.shields.io/badge/themes-30-f2f5f7"></a>
  <a href="#install-manually"><img alt="5 targets" src="https://img.shields.io/badge/targets-5-aab3bf"></a>
</p>

Agent Paint turns 30 popular terminal palettes into native themes for Paseo, Pi, Superset, ChatGPT, and Codex CLI. Preview a theme, then let your coding agent install it from this README.

- **Paseo:** one static plugin using the official `plugin.addTheme()` API.
- **Pi:** one complete native TUI theme JSON per color scheme.
- **Superset:** one importable UI + terminal theme JSON per color scheme, plus an all-themes bundle.
- **ChatGPT:** one portable `codex-theme-v1:` desktop appearance string per color scheme.
- **Codex CLI:** one custom `.tmTheme` syntax theme per color scheme.
- **Website:** a static gallery rendered from the same generated output users download.

No CSS injection, CDP, telemetry, runtime network access, install hooks, or runtime dependencies.

> **Unofficial:** This project is not affiliated with Paseo, Pi, Superset, OpenAI, ChatGPT, Codex, Ghostty, iTerm2 Color Schemes, or upstream theme authors. These are semantic adaptations, not pixel-identical ports.

![Grid of all generated themes](docs/theme-grid.svg)

## Let your agent install a theme

Give your coding agent this README URL and replace the bracketed values:

```text
Read https://github.com/jzlosman/agent-paint/blob/main/README.md.
Install the [THEME NAME] theme for [PASEO, PI, SUPERSET, CHATGPT, OR CODEX CLI].
Use only the generated artifact for that target. Inspect it first, preserve my
settings, and back up any file you would replace. If the app requires a UI step,
do everything safe and reversible first, then tell me exactly what to click or
paste. Ask before enabling plugins or changing the active theme.
```

An agent should:

1. Confirm the requested theme and target exist.
2. Inspect the generated file or Paseo plugin before installing it.
3. Back up any destination file it would replace.
4. Install only the requested target.
5. Stop for user confirmation when a target requires an in-app import or theme selection.
6. Ask before enabling plugins or selecting a new active theme.
7. Report the changed paths and how to undo the change.

## Browse the themes

Choose **Paseo**, **Pi**, **Superset**, **ChatGPT**, or **Codex CLI** in the gallery to see the actual colors generated for that target. Select a theme to download its native file or copy a target-specific agent prompt.

## Install manually

### Paseo

Requires Paseo 0.6.1 or newer.

```bash
git clone https://github.com/jzlosman/agent-paint.git
cd agent-paint
paseo plugin install "$PWD"
paseo plugin ls
```

If `paseo` is not on your `PATH` on macOS:

```bash
/Applications/Paseo.app/Contents/Resources/bin/paseo plugin install "$PWD"
```

Then open **Settings → Plugins**, enable plugins if needed, and choose a generated theme under **Settings → Appearance**.

Remove it with:

```bash
paseo plugin remove paseo-theme-pack
```

Paseo falls back to its default theme if the plugin disappears.

### Pi

Download one file from [`dist/pi/`](dist/pi/) into Pi's global theme directory:

```bash
theme_dir="$HOME/.pi/agent/themes"
destination="$theme_dir/nord.json"
backup="$destination.before-theme-pack"
temporary="$(mktemp)"

mkdir -p "$theme_dir"
curl -fsSL \
  https://raw.githubusercontent.com/jzlosman/agent-paint/main/dist/pi/nord.json \
  -o "$temporary"
python3 -m json.tool "$temporary" >/dev/null

if test -e "$destination" && ! test -e "$backup"; then
  cp -p "$destination" "$backup"
fi
mv "$temporary" "$destination"
```

Run `/reload` if Pi is already open, then select the theme through `/settings`.

To undo the installation, restore the backup when one exists; otherwise remove the downloaded theme:

```bash
destination="$HOME/.pi/agent/themes/nord.json"
backup="$destination.before-theme-pack"
if test -e "$backup"; then
  mv "$backup" "$destination"
else
  rm -f "$destination"
fi
```

Each generated Pi file defines every required TUI token, including message surfaces, tool states, Markdown, syntax highlighting, thinking levels, Bash mode, and HTML export colors.

### Superset

Download one theme from [`dist/superset/`](dist/superset/) or download [`all-themes.json`](dist/superset/all-themes.json).

Import through the CLI:

```bash
superset settings theme import /absolute/path/to/nord.json
superset settings theme set theme-pack-nord
```

Or open **Settings → Appearance → Theme**, click **Import Theme**, select the downloaded JSON, and choose the imported theme from the grid.

To undo the installation, switch away from the custom theme before removing it:

```bash
superset settings theme set system
superset settings theme remove theme-pack-nord
```

Superset accepts a single theme, an array, or `{ "themes": [...] }`. The generated files include both application UI and terminal ANSI colors.

### ChatGPT

Each file in [`dist/chatgpt/`](dist/chatgpt/) contains one portable `codex-theme-v1:` appearance string for the ChatGPT desktop app, using OpenAI's [Appearance import workflow](https://developers.openai.com/codex/app/settings#appearance). The import maps the app surface, foreground, accent, diff, and skill colors; it keeps the built-in Codex syntax theme for portability.

Before importing, open **Settings → Appearance**, select the current light or dark base theme, click **Copy theme**, and save that string as a backup. Then:

1. Open the generated `.txt` file for your theme and copy the complete line.
2. In **Settings → Appearance**, choose the matching light or dark base theme.
3. Click **Import**, paste the string, and confirm the preview.

An agent can fetch and validate the generated string, but it should stop and ask you to complete the in-app import. It must not edit ChatGPT application storage directly.

To undo the change, select a built-in appearance or import the backup string you saved first.

### Codex CLI

Codex CLI officially loads [custom TextMate themes](https://developers.openai.com/codex/cli-customization#syntax-highlighting-and-themes) from `$CODEX_HOME/themes` (`~/.codex/themes` by default):

```bash
codex_home="${CODEX_HOME:-$HOME/.codex}"
theme_dir="$codex_home/themes"
destination="$theme_dir/agent-paint-nord.tmTheme"

mkdir -p "$theme_dir"
curl -fsSL \
  https://raw.githubusercontent.com/jzlosman/agent-paint/main/dist/codex-cli/agent-paint-nord.tmTheme \
  -o "$destination"
```

Run `/theme` in Codex CLI and select `agent-paint-nord`. The picker previews the result and persists the equivalent valid TOML setting `tui.theme = "agent-paint-nord"` in `$CODEX_HOME/config.toml` when you confirm it. An agent may install the file, but it should ask before changing that setting.

Codex CLI themes syntax highlighting only. Your terminal emulator still owns the surrounding terminal background and ANSI palette.

To undo the change, use `/theme` to select your previous theme, then remove the custom file:

```bash
rm -f "${CODEX_HOME:-$HOME/.codex}/themes/agent-paint-nord.tmTheme"
```

## Themes

| Family | Included variants |
| --- | --- |
| Catppuccin | Latte, Frappé, Macchiato, Mocha |
| Dracula | Dracula, Alucard |
| GitHub | Light, Dark, Dark Dimmed |
| Atom One | Dark, Light |
| Tokyo Night | Night, Storm, Day |
| Nord | Nord |
| Gruvbox | Dark, Light |
| Solarized | Dark, Light |
| Rosé Pine | Main, Moon, Dawn |
| Ayu | Dark, Mirage, Light |
| Night Owl | Night Owl, Light Owl |
| Everforest | Dark, Light |
| Kanagawa | Wave |

## Why terminal-first?

Editor themes often use low-contrast comment colors and nearly identical surface colors. Those roles do not safely map to functional UI text and controls. The first version of this pack made that mistake: Nord's secondary text was only `1.69:1` against its background.

The canonical records now preserve:

- background and foreground;
- cursor and cursor text;
- selection background and foreground;
- ANSI colors 0–15;
- an explicit representative accent;
- pinned UI overrides only where a hand-tuned mapping is known to work.

Target adapters then derive readable semantic roles. Generated application themes require at least `7:1` primary-text contrast and `4.5:1` functional secondary-text contrast. Raised surfaces, controls, and borders receive distinct tonal steps.

Most terminal palettes are normalized from Ghostty's bundled representation of [iTerm2 Color Schemes](https://github.com/mbadolato/iTerm2-Color-Schemes). Every record also retains its canonical upstream editor/palette source.

## Repository layout

```text
themes/themes.json          terminal-first source records
scripts/theme-pack.mjs      validation and target adapters
scripts/generate.mjs        deterministic file generator
index.ts                    generated Paseo plugin
dist/pi/                    generated Pi themes
dist/superset/              generated Superset themes
dist/chatgpt/               generated ChatGPT appearance strings
dist/codex-cli/             generated Codex CLI TextMate themes
site/                       generated catalog + static gallery
docs/theme-grid.svg         generated social/README preview
```

## Develop and contribute

Node.js 22 or newer is sufficient. There are no package dependencies.

```bash
npm run generate
npm test
npm run check
```

To contribute a palette:

1. Add or update its terminal record in `themes/themes.json`.
2. Pin canonical source repositories to full commit SHAs.
3. Record source files, terminal source, and licenses.
4. Add UI overrides only when the generic adapter cannot preserve the theme's identity.
5. Generate and inspect all five target outputs.
6. Test narrow and wide application states and include screenshots.

Commercial themes, unclear licenses, logos, wallpaper, fonts, and icons are out of scope.

## Attribution and license

Adapter code and original documentation are MIT licensed. Theme names and palettes retain their upstream terms. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
