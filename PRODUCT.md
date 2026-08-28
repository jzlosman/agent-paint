# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Plain static HTML, CSS, and JavaScript deployed through GitHub Pages. Node.js scripts generate target theme files and gallery data; the published site has no framework or runtime dependencies.

## Users

Developers who use Paseo, Pi, Superset, Ghostty, or adjacent coding tools and want recognizable, readable color schemes across their agent development environment.

## Product Purpose

Maintain a curated collection of popular coding palettes, adapt each palette safely to every supported target, and let users preview and install a chosen theme without manually translating color formats.

Success means the generated themes are legible in real use, look recognizably related across targets, and can be installed by either a person or an agent from the public repository instructions.

## Positioning

Agent Paint makes popular color schemes easy to preview and install across agent harnesses and agent development environments. A terminal-first canonical palette produces native, contrast-aware outputs instead of injecting CSS or treating one editor's surface tokens as universally interchangeable.

## Operating Context

Users browse a public theme gallery, compare generated palette cards, choose a theme and target, then copy a command or give the README URL and a prewritten request to their coding agent. Contributors work primarily in checked-in JSON palette data and run the dependency-free generator and tests.

## Capabilities and Constraints

- Generate native theme files for Paseo, Pi, and Superset.
- Preserve terminal background, foreground, selection, cursor, and ANSI 0–15 colors in the canonical data.
- Derive platform semantic colors with readable primary and secondary text contrast.
- Publish a static gallery showing the actual generated colors for every theme.
- Provide human installation steps and copyable agent prompts.
- Keep source repositories, pinned commits, files, licenses, and adaptation notes with the palette data.
- No CSS injection, CDP, telemetry, runtime network access, install hooks, commercial themes, or unclear redistribution licenses.
- Paseo and Superset plugins are trusted local code; generated runtime files must remain static and reviewable.

## Brand Commitments

The product is named “Agent Paint.” The voice is direct, technically honest, and developer-friendly. The brand should make color feel practical and approachable without AI jargon, empty statistics, or faux-terminal decoration. The project must describe themes as unofficial adaptations and must not imply endorsement by Paseo, Pi, Superset, terminal projects, or upstream theme authors.

## Evidence on Hand

- Thirty researched theme adaptations in `themes/themes.json`.
- A generated palette grid in `docs/theme-grid.svg`.
- Paseo's official `plugin.addTheme()` integration in `index.ts`.
- Pi's complete custom-theme specification and built-in reference themes.
- Superset's official custom-theme base format and import documentation.
- Ghostty's bundled terminal themes, including Nord and most existing theme families.
- User feedback that Catppuccin and Ayu Mirage map well, while Nord and several low-contrast mappings do not.

## Product Principles

1. Show the generated truth, not an idealized swatch.
2. Preserve palette identity while enforcing readable interface semantics.
3. Keep installation inspectable and agent-friendly.
4. Prefer boring data and deterministic generation over runtime cleverness.
5. Attribute every upstream palette precisely.

## Accessibility & Inclusion

Primary and secondary functional text must meet WCAG AA contrast against their rendered backgrounds. Color cannot be the only indicator of status, selection, or errors in the gallery. The site must support keyboard navigation, reduced motion, narrow screens, and readable zoom.
