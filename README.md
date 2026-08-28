# Paseo Theme Pack

Thirty popular coding color schemes adapted to Paseo's official theme plugin API.

- Uses `plugin.addTheme()`—no CSS injection or Chrome DevTools Protocol.
- Contains no runtime dependencies, network requests, install hooks, or telemetry.
- Keeps palette sources, commit SHAs, and licenses beside the theme data.
- Validates theme shape, provenance, duplicate IDs, generated output, and primary-text contrast.

> **Unofficial:** This project is not affiliated with Paseo or the upstream theme authors. These are semantic Paseo UI adaptations, not pixel-identical ports or syntax themes.

![Grid of all 30 Paseo themes](docs/theme-grid.svg)

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

Paseo controls syntax highlighting separately. Pair these UI themes with Paseo's built-in GitHub, Catppuccin, Dracula, Tokyo Night, One, Nord, Gruvbox, or Solarized syntax themes when appropriate.

## Install safely

Requires Paseo 0.6.1 or newer.

```bash
git clone https://github.com/jzlosman/paseo-theme-pack.git
cd paseo-theme-pack

# Review index.ts and themes/themes.json, then install the local directory.
paseo plugin install "$PWD"
paseo plugin ls
```

If `paseo` is not on your `PATH` on macOS:

```bash
/Applications/Paseo.app/Contents/Resources/bin/paseo plugin install "$PWD"
```

In Paseo:

1. Open **Settings → Plugins** and enable plugins if needed.
2. Confirm `paseo-theme-pack` is enabled.
3. Open **Settings → Appearance** and choose a theme.

Paseo plugins are trusted local code. This plugin's runtime is intentionally limited to the generated `index.ts`, which registers static theme records.

## Remove

```bash
paseo plugin remove paseo-theme-pack
```

Paseo falls back to its default theme when the plugin is unavailable.

## How it works

`themes/themes.json` is the human-edited source. `npm run generate` validates it and writes the small `index.ts` that Paseo loads.

```bash
npm run generate
npm test
npm run check
```

No `npm install` is required: the repository uses Node's built-in test runner and has no dependencies.

Each Paseo theme maps an upstream palette to eight semantic colors:

- `background`
- `foreground`
- `raised`
- `control`
- `border`
- `accent`
- `mutedForeground`
- `ring`

Paseo derives the remaining application, terminal, diff, status, menu, and panel colors.

## Contributing

1. Add or update a record in `themes/themes.json`.
2. Pin the canonical upstream repository to a full commit SHA.
3. Record the source files and license URL.
4. Run `npm run generate && npm run check`.
5. Include screenshots from Paseo when proposing a new palette.

Only submit palettes with a clear redistribution license. Commercial themes, unclear licenses, logos, wallpaper, fonts, and icons are out of scope.

## Attribution and license

The adapter code is MIT licensed. Theme names and palettes come from their respective projects and retain their upstream terms. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
