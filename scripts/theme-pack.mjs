import { readFile, readdir } from "node:fs/promises";

const COLOR_KEYS = [
  "background",
  "foreground",
  "raised",
  "control",
  "border",
  "accent",
  "mutedForeground",
  "ring",
];

const HEX_COLOR = /^#[0-9a-f]{6}$/i;
const GIT_SHA = /^[0-9a-f]{40}$/i;

export function validateTheme(theme, filename = "theme") {
  const errors = [];

  if (!theme || typeof theme !== "object" || Array.isArray(theme)) {
    throw new Error(`${filename}: theme must be an object`);
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(theme.id ?? "")) {
    errors.push("id must use lowercase letters, numbers, and hyphens");
  }
  if (typeof theme.name !== "string" || !theme.name.trim()) {
    errors.push("name must be a non-empty string");
  }
  if (!new Set(["light", "dark"]).has(theme.appearance)) {
    errors.push('appearance must be "light" or "dark"');
  }

  for (const key of COLOR_KEYS) {
    if (!HEX_COLOR.test(theme.colors?.[key] ?? "")) {
      errors.push(`${key} must be a hex color`);
    }
  }

  if (typeof theme.source?.repository !== "string" || !theme.source.repository.startsWith("https://")) {
    errors.push("repository must be an HTTPS URL");
  }
  if (!GIT_SHA.test(theme.source?.commit ?? "")) {
    errors.push("commit must be a full Git SHA");
  }
  if (!Array.isArray(theme.source?.files) || theme.source.files.length === 0) {
    errors.push("files must contain at least one upstream path");
  }
  if (typeof theme.source?.license !== "string" || !theme.source.license) {
    errors.push("license is required");
  }
  if (typeof theme.source?.licenseUrl !== "string" || !theme.source.licenseUrl.startsWith("https://")) {
    errors.push("licenseUrl must be an HTTPS URL");
  }

  if (errors.length) {
    throw new Error(`${filename}: ${errors.join("; ")}`);
  }
}

function channelToLinear(channel) {
  const normalized = channel / 255;
  return normalized <= 0.04045
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)
    .map((value) => channelToLinear(Number.parseInt(value, 16)));
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

export function contrastRatio(left, right) {
  const [bright, dark] = [luminance(left), luminance(right)].sort((a, b) => b - a);
  return (bright + 0.05) / (dark + 0.05);
}

export async function loadThemes(directory) {
  const filenames = (await readdir(directory))
    .filter((filename) => filename.endsWith(".json"))
    .sort();
  const themes = [];

  for (const filename of filenames) {
    const contents = await readFile(new URL(filename, directory), "utf8");
    const records = JSON.parse(contents);
    for (const theme of Array.isArray(records) ? records : [records]) {
      validateTheme(theme, `${filename}:${theme.id ?? "unknown"}`);
      themes.push(theme);
    }
  }

  return themes;
}

function contribution(theme) {
  return {
    id: theme.id,
    name: theme.name,
    appearance: theme.appearance,
    colors: theme.colors,
  };
}

export function renderPlugin(themes) {
  const records = [...themes]
    .sort((left, right) => left.name.localeCompare(right.name))
    .map(contribution);
  const serialized = JSON.stringify(records, null, 2).replace(
    /^(\s*)"([A-Za-z][A-Za-z0-9]*)":/gm,
    "$1$2:",
  );

  return `// Generated from themes/*.json by npm run generate. Do not edit by hand.\nimport type { PluginContext, PluginThemeContribution } from "@getpaseo/plugin";\n\nconst themes: PluginThemeContribution[] = ${serialized};\n\nexport default function contribute(plugin: PluginContext) {\n  for (const theme of themes) {\n    plugin.addTheme(theme);\n  }\n  return () => {};\n}\n`;
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function renderPreview(themes) {
  const columns = 5;
  const cardWidth = 296;
  const cardHeight = 126;
  const gap = 16;
  const margin = 32;
  const header = 112;
  const sorted = [...themes].sort((left, right) => left.name.localeCompare(right.name));
  const rows = Math.ceil(sorted.length / columns);
  const width = margin * 2 + columns * cardWidth + (columns - 1) * gap;
  const height = header + margin + rows * cardHeight + (rows - 1) * gap;
  const cards = sorted.map((theme, index) => {
    const x = margin + (index % columns) * (cardWidth + gap);
    const y = header + Math.floor(index / columns) * (cardHeight + gap);
    const { colors } = theme;
    return `  <g transform="translate(${x} ${y})">
    <rect width="${cardWidth}" height="${cardHeight}" rx="14" fill="${colors.background}" stroke="${colors.border}"/>
    <text x="18" y="31" fill="${colors.foreground}" font-size="17" font-weight="700">${escapeXml(theme.name)}</text>
    <text x="18" y="54" fill="${colors.mutedForeground}" font-size="12">${theme.appearance.toUpperCase()}</text>
    <rect x="18" y="72" width="52" height="34" rx="8" fill="${colors.raised}"/>
    <rect x="78" y="72" width="52" height="34" rx="8" fill="${colors.control}"/>
    <rect x="138" y="72" width="52" height="34" rx="8" fill="${colors.border}"/>
    <rect x="198" y="72" width="80" height="34" rx="8" fill="${colors.accent}"/>
  </g>`;
  }).join("\n");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#0f1117"/>
  <text x="${margin}" y="48" fill="#f2f4f8" font-family="ui-sans-serif, system-ui, sans-serif" font-size="30" font-weight="800">Paseo Theme Pack</text>
  <text x="${margin}" y="78" fill="#9aa4b2" font-family="ui-sans-serif, system-ui, sans-serif" font-size="16">${sorted.length} popular coding palettes · official plugin API · no CDP</text>
  <g font-family="ui-sans-serif, system-ui, sans-serif">
${cards}
  </g>
</svg>
`;
}
