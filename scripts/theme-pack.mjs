import { readFile, readdir } from "node:fs/promises";

const UI_COLOR_KEYS = [
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

  if (!HEX_COLOR.test(theme.accent ?? "")) {
    errors.push("accent must be a hex color");
  }
  for (const [key, color] of Object.entries(theme.uiOverrides ?? {})) {
    if (!UI_COLOR_KEYS.includes(key)) errors.push(`unknown UI override: ${key}`);
    else if (!HEX_COLOR.test(color)) errors.push(`${key} override must be a hex color`);
  }

  const terminalColorKeys = [
    "background",
    "foreground",
    "cursor",
    "cursorText",
    "selectionBackground",
    "selectionForeground",
  ];
  for (const key of terminalColorKeys) {
    if (!HEX_COLOR.test(theme.terminal?.[key] ?? "")) {
      errors.push(`terminal ${key} must be a hex color`);
    }
  }
  if (
    !Array.isArray(theme.terminal?.ansi)
    || theme.terminal.ansi.length !== 16
    || theme.terminal.ansi.some((color) => !HEX_COLOR.test(color))
  ) {
    errors.push("terminal ANSI palette must contain 16 hex colors");
  }

  if (typeof theme.terminalSource?.repository !== "string" || !theme.terminalSource.repository.startsWith("https://")) {
    errors.push("terminal source repository must be an HTTPS URL");
  }
  if (!GIT_SHA.test(theme.terminalSource?.commit ?? "")) {
    errors.push("terminal source commit must be a full Git SHA");
  }
  if (typeof theme.terminalSource?.file !== "string" || !theme.terminalSource.file) {
    errors.push("terminal source file is required");
  }
  if (typeof theme.terminalSource?.license !== "string" || !theme.terminalSource.license) {
    errors.push("terminal source license is required");
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

function hexToRgb(hex) {
  return hex.slice(1).match(/.{2}/g).map((value) => Number.parseInt(value, 16));
}

function rgbToHex(channels) {
  return `#${channels
    .map((value) => Math.round(value).toString(16).padStart(2, "0"))
    .join("")}`;
}

export function mixColors(left, right, amount) {
  const leftChannels = hexToRgb(left);
  const rightChannels = hexToRgb(right);
  return rgbToHex(leftChannels.map(
    (channel, index) => channel + (rightChannels[index] - channel) * amount,
  ));
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

function ensureTextContrast(color, background, minimum) {
  if (contrastRatio(color, background) >= minimum) return color.toLowerCase();
  const blackContrast = contrastRatio("#000000", background);
  const whiteContrast = contrastRatio("#ffffff", background);
  const target = whiteContrast >= blackContrast ? "#ffffff" : "#000000";
  let low = 0;
  let high = 1;
  for (let index = 0; index < 16; index += 1) {
    const middle = (low + high) / 2;
    const mixed = mixColors(color, target, middle);
    if (contrastRatio(mixed, background) >= minimum) high = middle;
    else low = middle;
  }
  return mixColors(color, target, high);
}

function surfaceAtContrast(background, foreground, minimum) {
  let low = 0;
  let high = 1;
  for (let index = 0; index < 16; index += 1) {
    const middle = (low + high) / 2;
    const mixed = mixColors(background, foreground, middle);
    if (contrastRatio(mixed, background) >= minimum) high = middle;
    else low = middle;
  }
  return mixColors(background, foreground, high);
}

export function deriveUiColors(theme) {
  const overrides = theme.uiOverrides ?? {};
  const background = (overrides.background ?? theme.terminal.background).toLowerCase();
  const foreground = ensureTextContrast(
    overrides.foreground ?? theme.terminal.foreground,
    background,
    7,
  );
  const accent = ensureTextContrast(
    overrides.accent ?? theme.accent ?? theme.terminal.ansi[4],
    background,
    3,
  );

  return {
    background,
    foreground,
    raised: overrides.raised ?? surfaceAtContrast(background, foreground, 1.12),
    control: overrides.control ?? surfaceAtContrast(background, foreground, 1.3),
    border: overrides.border ?? surfaceAtContrast(background, foreground, 1.8),
    accent,
    mutedForeground: ensureTextContrast(
      overrides.mutedForeground ?? theme.terminal.ansi[8],
      background,
      4.5,
    ),
    ring: ensureTextContrast(overrides.ring ?? theme.terminal.cursor ?? accent, background, 3),
  };
}

function readableOn(background) {
  return contrastRatio("#000000", background) >= contrastRatio("#ffffff", background)
    ? "#000000"
    : "#ffffff";
}

function withAlpha(hex, alpha) {
  const [red, green, blue] = hexToRgb(hex);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function buildChatGptPreview(theme) {
  const ui = deriveUiColors(theme);
  const readableSemantic = (color) => ensureTextContrast(color, ui.background, 3);
  return {
    ...ui,
    diffAdded: readableSemantic(theme.terminal.ansi[10]),
    diffRemoved: readableSemantic(theme.terminal.ansi[9]),
    skill: readableSemantic(theme.terminal.ansi[13]),
  };
}

export function buildChatGptThemeString(theme) {
  const preview = buildChatGptPreview(theme);
  const payload = {
    codeThemeId: "codex",
    theme: {
      accent: preview.accent,
      contrast: theme.appearance === "dark" ? 60 : 45,
      fonts: {
        code: null,
        ui: null,
      },
      ink: preview.foreground,
      opaqueWindows: true,
      semanticColors: {
        diffAdded: preview.diffAdded,
        diffRemoved: preview.diffRemoved,
        skill: preview.skill,
      },
      surface: preview.background,
    },
    variant: theme.appearance,
  };
  return `codex-theme-v1:${JSON.stringify(payload)}`;
}

function tmThemeSetting(name, scope, foreground, fontStyle) {
  const style = fontStyle == null
    ? ""
    : `\n        <key>fontStyle</key>\n        <string>${escapeXml(fontStyle)}</string>`;
  return `    <dict>
      <key>name</key>
      <string>${escapeXml(name)}</string>
      <key>scope</key>
      <string>${escapeXml(scope)}</string>
      <key>settings</key>
      <dict>
        <key>foreground</key>
        <string>${foreground}</string>${style}
      </dict>
    </dict>`;
}

function buildCodexCliPreview(theme) {
  const ui = deriveUiColors(theme);
  const ansi = theme.terminal.ansi;
  const readable = (color) => ensureTextContrast(color, ui.background, 4.5);
  return {
    ...ui,
    accent: readable(ansi[12]),
    comment: readable(ui.mutedForeground),
    string: readable(ansi[10]),
    number: readable(ansi[11]),
    keyword: readable(ansi[13]),
    function: readable(ansi[12]),
    type: readable(ansi[14]),
    variable: readable(ansi[14]),
    error: readable(ansi[9]),
    success: readable(ansi[10]),
  };
}

export function renderCodexCliTheme(theme) {
  const ui = buildCodexCliPreview(theme);
  const settings = [
    tmThemeSetting("Comments", "comment, punctuation.definition.comment", ui.comment, "italic"),
    tmThemeSetting("Strings", "string, constant.other.symbol", ui.string),
    tmThemeSetting("Numbers and constants", "constant.numeric, constant.language, constant.character", ui.number),
    tmThemeSetting("Keywords", "keyword, storage", ui.keyword, "bold"),
    tmThemeSetting("Functions", "entity.name.function, support.function", ui.function),
    tmThemeSetting("Types", "entity.name.type, entity.name.class, support.type", ui.type),
    tmThemeSetting("Variables", "variable, variable.other.readwrite", ui.variable),
    tmThemeSetting("Invalid", "invalid, invalid.illegal", ui.error),
    tmThemeSetting("Headings", "markup.heading, entity.name.section", ui.number, "bold"),
    tmThemeSetting("Inserted", "markup.inserted, meta.diff.header.to-file", ui.success),
    tmThemeSetting("Deleted", "markup.deleted, meta.diff.header.from-file", ui.error),
  ].join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>name</key>
  <string>Agent Paint · ${escapeXml(theme.name)}</string>
  <key>author</key>
  <string>Agent Paint contributors</string>
  <key>settings</key>
  <array>
    <dict>
      <key>settings</key>
      <dict>
        <key>background</key>
        <string>${ui.background}</string>
        <key>foreground</key>
        <string>${ui.foreground}</string>
        <key>caret</key>
        <string>${theme.terminal.cursor}</string>
        <key>selection</key>
        <string>${theme.terminal.selectionBackground}</string>
        <key>selectionForeground</key>
        <string>${theme.terminal.selectionForeground}</string>
        <key>lineHighlight</key>
        <string>${ui.raised}</string>
      </dict>
    </dict>
${settings}
  </array>
</dict>
</plist>
`;
}

export function buildPiTheme(theme) {
  const ui = deriveUiColors(theme);
  const ansi = theme.terminal.ansi;
  const readable = (color) => ensureTextContrast(color, theme.terminal.background, 4.5);
  const muted = readable(ui.mutedForeground);
  return {
    $schema: "https://raw.githubusercontent.com/earendil-works/pi/main/packages/coding-agent/src/modes/interactive/theme/theme-schema.json",
    name: theme.id,
    colors: {
      accent: ui.accent,
      border: ui.border,
      borderAccent: ui.ring,
      borderMuted: ui.raised,
      success: readable(ansi[10]),
      error: readable(ansi[9]),
      warning: readable(ansi[11]),
      muted,
      dim: readable(ansi[8]),
      text: readable(ui.foreground),
      thinkingText: muted,
      selectedBg: theme.terminal.selectionBackground,
      userMessageBg: ui.control,
      userMessageText: readable(ui.foreground),
      customMessageBg: ui.raised,
      customMessageText: readable(ui.foreground),
      customMessageLabel: readable(ansi[13]),
      toolPendingBg: ui.raised,
      toolSuccessBg: mixColors(ui.background, ansi[2], 0.14),
      toolErrorBg: mixColors(ui.background, ansi[1], 0.14),
      toolTitle: readable(ui.foreground),
      toolOutput: muted,
      mdHeading: readable(ansi[11]),
      mdLink: readable(ansi[12]),
      mdLinkUrl: muted,
      mdCode: readable(ansi[14]),
      mdCodeBlock: readable(ansi[10]),
      mdCodeBlockBorder: ui.border,
      mdQuote: muted,
      mdQuoteBorder: ui.border,
      mdHr: ui.border,
      mdListBullet: readable(ansi[14]),
      toolDiffAdded: readable(ansi[10]),
      toolDiffRemoved: readable(ansi[9]),
      toolDiffContext: muted,
      syntaxComment: muted,
      syntaxKeyword: readable(ansi[13]),
      syntaxFunction: readable(ansi[12]),
      syntaxVariable: readable(ansi[14]),
      syntaxString: readable(ansi[2]),
      syntaxNumber: readable(ansi[3]),
      syntaxType: readable(ansi[6]),
      syntaxOperator: readable(ui.foreground),
      syntaxPunctuation: muted,
      thinkingOff: ui.border,
      thinkingMinimal: muted,
      thinkingLow: ansi[4],
      thinkingMedium: ansi[6],
      thinkingHigh: ansi[5],
      thinkingXhigh: ansi[9],
      thinkingMax: ansi[13],
      bashMode: ansi[11],
    },
    export: {
      pageBg: ui.background,
      cardBg: ui.raised,
      infoBg: mixColors(ui.background, ansi[3], 0.16),
    },
  };
}

export function buildSupersetTheme(theme) {
  const ui = deriveUiColors(theme);
  const ansi = theme.terminal.ansi;
  const primaryForeground = readableOn(ui.accent);
  return {
    id: `theme-pack-${theme.id}`,
    name: theme.name,
    type: theme.appearance,
    author: "Agent Paint contributors",
    description: `Unofficial ${theme.name} adaptation generated from a terminal-first palette`,
    ui: {
      background: ui.background,
      foreground: ui.foreground,
      card: ui.raised,
      cardForeground: ui.foreground,
      popover: ui.control,
      popoverForeground: ui.foreground,
      primary: ui.accent,
      primaryForeground,
      secondary: ui.control,
      secondaryForeground: ui.foreground,
      muted: ui.raised,
      mutedForeground: ui.mutedForeground,
      accent: ui.control,
      accentForeground: ui.foreground,
      tertiary: mixColors(ui.background, ui.foreground, 0.04),
      tertiaryActive: ui.raised,
      destructive: ansi[1],
      destructiveForeground: readableOn(ansi[1]),
      border: ui.border,
      input: ui.control,
      ring: ui.ring,
      sidebar: ui.background,
      sidebarForeground: ui.foreground,
      sidebarPrimary: ui.accent,
      sidebarPrimaryForeground: primaryForeground,
      sidebarAccent: ui.control,
      sidebarAccentForeground: ui.foreground,
      sidebarBorder: ui.border,
      sidebarRing: ui.ring,
      chart1: ansi[1],
      chart2: ansi[2],
      chart3: ansi[3],
      chart4: ansi[4],
      chart5: ansi[5],
      highlightMatch: withAlpha(ui.accent, 0.2),
      highlightActive: withAlpha(ui.accent, 0.5),
      highlight: ui.accent,
      highlightForeground: primaryForeground,
    },
    terminal: {
      background: theme.terminal.background,
      foreground: theme.terminal.foreground,
      cursor: theme.terminal.cursor,
      cursorAccent: theme.terminal.cursorText,
      selectionBackground: theme.terminal.selectionBackground,
      black: ansi[0],
      red: ansi[1],
      green: ansi[2],
      yellow: ansi[3],
      blue: ansi[4],
      magenta: ansi[5],
      cyan: ansi[6],
      white: ansi[7],
      brightBlack: ansi[8],
      brightRed: ansi[9],
      brightGreen: ansi[10],
      brightYellow: ansi[11],
      brightBlue: ansi[12],
      brightMagenta: ansi[13],
      brightCyan: ansi[14],
      brightWhite: ansi[15],
    },
  };
}

export function buildSiteCatalog(themes) {
  return [...themes]
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((theme) => ({
      id: theme.id,
      name: theme.name,
      appearance: theme.appearance,
      source: theme.source.repository,
      terminalSource: theme.terminalSource.theme,
      paseo: deriveUiColors(theme),
      pi: buildPiTheme(theme).colors,
      superset: buildSupersetTheme(theme).ui,
      chatgpt: buildChatGptPreview(theme),
      chatgptImport: buildChatGptThemeString(theme),
      codexCli: buildCodexCliPreview(theme),
      terminal: theme.terminal,
      piDownload: `dist/pi/${theme.id}.json`,
      supersetDownload: `dist/superset/${theme.id}.json`,
      chatgptDownload: `dist/chatgpt/${theme.id}.txt`,
      codexCliName: `agent-paint-${theme.id}`,
      codexCliDownload: `dist/codex-cli/agent-paint-${theme.id}.tmTheme`,
    }));
}

export function parseGhosttyTheme(contents) {
  const values = new Map();
  const ansi = Array(16);

  for (const rawLine of contents.split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const paletteMatch = line.match(/^palette\s*=\s*(\d+)\s*=\s*(#[0-9a-f]{6})$/i);
    if (paletteMatch) {
      const index = Number.parseInt(paletteMatch[1], 10);
      if (index >= 0 && index < ansi.length) ansi[index] = paletteMatch[2].toLowerCase();
      continue;
    }

    const valueMatch = line.match(/^([a-z-]+)\s*=\s*(#[0-9a-f]{6})$/i);
    if (valueMatch) values.set(valueMatch[1], valueMatch[2].toLowerCase());
  }

  if (ansi.some((color) => !color)) {
    throw new Error("Ghostty theme must define ANSI colors 0 through 15");
  }
  for (const key of ["background", "foreground"]) {
    if (!values.has(key)) throw new Error(`Ghostty theme must define ${key}`);
  }

  const background = values.get("background");
  const foreground = values.get("foreground");
  return {
    background,
    foreground,
    cursor: values.get("cursor-color") ?? foreground,
    cursorText: values.get("cursor-text") ?? background,
    selectionBackground: values.get("selection-background") ?? ansi[8],
    selectionForeground: values.get("selection-foreground") ?? foreground,
    ansi,
  };
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
    colors: deriveUiColors(theme),
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
    const colors = deriveUiColors(theme);
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
  <text x="${margin}" y="48" fill="#f2f4f8" font-family="ui-sans-serif, system-ui, sans-serif" font-size="30" font-weight="800">Agent Paint · Paseo, Pi, Superset, ChatGPT &amp; Codex CLI</text>
  <text x="${margin}" y="78" fill="#9aa4b2" font-family="ui-sans-serif, system-ui, sans-serif" font-size="16">${sorted.length} terminal-first palettes · generated Paseo output shown below</text>
  <g font-family="ui-sans-serif, system-ui, sans-serif">
${cards}
  </g>
</svg>
`;
}
