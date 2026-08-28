# Contributing

Keep the plugin boring: static palette data in, generated Paseo registrations out.

## Add a theme

1. Add a record to `themes/themes.json`.
2. Use the canonical upstream repository and pin a full 40-character commit SHA.
3. Record every source palette file used and link its license.
4. Map only the eight colors supported by Paseo's `addTheme` API.
5. Run:

```bash
npm run generate
npm run check
```

6. Test the theme in Paseo at narrow and wide window sizes.
7. Include screenshots and explain any deliberate contrast adjustment.

## Acceptance rules

- Clear open-source redistribution license.
- Primary foreground/background contrast of at least 4.5:1.
- No copied extension code, scripts, icons, fonts, logos, or wallpaper.
- No runtime dependencies, network access, telemetry, or install hooks.
- No commercial themes or names used in a way that implies endorsement.
- One focused pull request per theme family.
