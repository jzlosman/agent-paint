import { mkdir, readFile, writeFile } from "node:fs/promises";

import {
  buildPiTheme,
  buildSiteCatalog,
  buildSupersetTheme,
  loadThemes,
  renderPlugin,
  renderPreview,
} from "./theme-pack.mjs";

const root = new URL("../", import.meta.url);
const pluginUrl = new URL("index.ts", root);
const previewUrl = new URL("docs/theme-grid.svg", root);
const themes = await loadThemes(new URL("themes/", root));
const generatedFiles = [
  [pluginUrl, renderPlugin(themes)],
  [previewUrl, renderPreview(themes)],
  ...themes.flatMap((theme) => [
    [new URL(`dist/pi/${theme.id}.json`, root), `${JSON.stringify(buildPiTheme(theme), null, 2)}\n`],
    [new URL(`dist/superset/${theme.id}.json`, root), `${JSON.stringify(buildSupersetTheme(theme), null, 2)}\n`],
  ]),
  [
    new URL("dist/superset/all-themes.json", root),
    `${JSON.stringify(themes.map(buildSupersetTheme), null, 2)}\n`,
  ],
  [
    new URL("site/themes.json", root),
    `${JSON.stringify(buildSiteCatalog(themes), null, 2)}\n`,
  ],
];

if (process.argv.includes("--check")) {
  const stale = [];
  for (const [url, expected] of generatedFiles) {
    const checkedIn = await readFile(url, "utf8").catch(() => "");
    if (checkedIn !== expected) stale.push(url.pathname);
  }
  if (stale.length) {
    console.error(`generated files are stale; run npm run generate:\n${stale.join("\n")}`);
    process.exitCode = 1;
  }
} else {
  await Promise.all([
    mkdir(new URL("docs/", root), { recursive: true }),
    mkdir(new URL("dist/pi/", root), { recursive: true }),
    mkdir(new URL("dist/superset/", root), { recursive: true }),
    mkdir(new URL("site/", root), { recursive: true }),
  ]);
  await Promise.all(generatedFiles.map(([url, contents]) => writeFile(url, contents)));
  console.log(`Generated Paseo, Pi, Superset, and preview files for ${themes.length} themes.`);
}
