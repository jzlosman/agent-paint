import { mkdir, readFile, writeFile } from "node:fs/promises";

import { loadThemes, renderPlugin, renderPreview } from "./theme-pack.mjs";

const root = new URL("../", import.meta.url);
const pluginUrl = new URL("index.ts", root);
const previewUrl = new URL("docs/theme-grid.svg", root);
const themes = await loadThemes(new URL("themes/", root));
const plugin = renderPlugin(themes);
const preview = renderPreview(themes);

if (process.argv.includes("--check")) {
  const checkedPlugin = await readFile(pluginUrl, "utf8").catch(() => "");
  const checkedPreview = await readFile(previewUrl, "utf8").catch(() => "");
  if (checkedPlugin !== plugin || checkedPreview !== preview) {
    console.error("generated files are stale; run npm run generate");
    process.exitCode = 1;
  }
} else {
  await mkdir(new URL("docs/", root), { recursive: true });
  await Promise.all([
    writeFile(pluginUrl, plugin),
    writeFile(previewUrl, preview),
  ]);
  console.log(`Generated index.ts and theme-grid.svg with ${themes.length} themes.`);
}
