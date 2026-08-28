const gallery = document.querySelector("#theme-gallery");
const template = document.querySelector("#theme-card-template");
const search = document.querySelector("#theme-search");
const appearance = document.querySelector("#appearance-filter");
const resultCount = document.querySelector("#result-count");
const targetNote = document.querySelector("#target-note");
const selectionPanel = document.querySelector("#selection-panel");
const selectionTitle = document.querySelector("#selection-title");
const selectionTarget = document.querySelector("#selection-target");
const selectionDescription = document.querySelector("#selection-description");
const themeDownload = document.querySelector("#theme-download");
const copyThemePrompt = document.querySelector("#copy-theme-prompt");

const targetNotes = {
  paseo: "Paseo preview · plugin theme",
  pi: "Pi preview · native TUI theme",
  superset: "Superset preview · app and terminal theme",
};

const state = {
  themes: [],
  target: "paseo",
  selectedId: null,
};

function targetColors(theme) {
  if (state.target === "pi") {
    return {
      background: theme.terminal.background,
      foreground: theme.pi.text,
      raised: theme.pi.userMessageBg,
      control: theme.pi.toolPendingBg,
      border: theme.pi.border,
      accent: theme.pi.accent,
      mutedForeground: theme.pi.muted,
      ring: theme.pi.borderAccent,
      strip: [
        theme.pi.error, theme.pi.success, theme.pi.warning, theme.pi.mdLink,
        theme.pi.syntaxKeyword, theme.pi.mdCode, theme.pi.muted, theme.pi.text,
      ],
    };
  }

  if (state.target === "superset") {
    return {
      background: theme.superset.background,
      foreground: theme.superset.foreground,
      raised: theme.superset.card,
      control: theme.superset.input,
      border: theme.superset.border,
      accent: theme.superset.primary,
      mutedForeground: theme.superset.mutedForeground,
      ring: theme.superset.ring,
      strip: theme.terminal.ansi.slice(1, 8).concat(theme.terminal.ansi[15]),
    };
  }

  return {
    ...theme.paseo,
    strip: [
      theme.paseo.background, theme.paseo.raised, theme.paseo.control, theme.paseo.border,
      theme.paseo.accent, theme.paseo.ring, theme.paseo.mutedForeground, theme.paseo.foreground,
    ],
  };
}

function setCardColors(card, colors) {
  const values = {
    "--card-bg": colors.background,
    "--card-fg": colors.foreground,
    "--card-raised": colors.raised,
    "--card-control": colors.control,
    "--card-border": colors.border,
    "--card-accent": colors.accent,
    "--card-muted": colors.mutedForeground,
    "--card-ring": colors.ring,
  };
  for (const [property, value] of Object.entries(values)) card.style.setProperty(property, value);
}

function renderCard(theme) {
  const fragment = template.content.cloneNode(true);
  const card = fragment.querySelector(".theme-card");
  const button = fragment.querySelector(".theme-card-button");
  const title = fragment.querySelector("h2");
  const meta = fragment.querySelector(".theme-meta");
  const strip = fragment.querySelector(".palette-strip");
  const colors = targetColors(theme);

  card.dataset.id = theme.id;
  card.dataset.name = theme.name.toLowerCase();
  card.dataset.appearance = theme.appearance;
  title.textContent = theme.name;
  meta.textContent = `${theme.appearance} · ${state.target}`;
  button.setAttribute("aria-label", `Inspect ${theme.name} for ${state.target}`);
  button.setAttribute("aria-pressed", "false");
  setCardColors(card, colors);

  for (const color of colors.strip) {
    const swatch = document.createElement("span");
    swatch.style.backgroundColor = color;
    swatch.title = color;
    strip.append(swatch);
  }

  button.addEventListener("click", () => selectTheme(theme.id));
  return fragment;
}

function filteredThemes() {
  const query = search.value.trim().toLowerCase();
  return state.themes.filter((theme) => {
    const matchesQuery = !query || theme.name.toLowerCase().includes(query) || theme.id.includes(query);
    const matchesAppearance = appearance.value === "all" || theme.appearance === appearance.value;
    return matchesQuery && matchesAppearance;
  });
}

function renderGallery() {
  const themes = filteredThemes();
  gallery.replaceChildren();

  if (!themes.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "No palettes match that search. Clear the filter or try a family name.";
    gallery.append(empty);
  } else {
    const fragment = document.createDocumentFragment();
    for (const theme of themes) fragment.append(renderCard(theme));
    gallery.append(fragment);
  }

  gallery.setAttribute("aria-busy", "false");
  resultCount.textContent = `${themes.length} of ${state.themes.length} generated themes`;
  targetNote.textContent = targetNotes[state.target];

  if (state.selectedId) {
    const selectedCard = gallery.querySelector(`[data-id="${CSS.escape(state.selectedId)}"]`);
    selectedCard?.classList.add("is-selected");
    selectedCard?.querySelector(".theme-card-button")?.setAttribute("aria-pressed", "true");
  }
}

function promptFor(theme) {
  const targetName = state.target === "pi" ? "Pi" : state.target === "superset" ? "Superset" : "Paseo";
  const delivery = state.target === "paseo"
    ? "Install the repository's static Paseo plugin, then select the named theme."
    : "Use the generated native JSON file for that target.";
  return `Read https://github.com/jzlosman/paseo-theme-pack/blob/main/README.md. Install the ${theme.name} theme for ${targetName}. ${delivery} Follow the repository instructions for that target. Review the code or file before installing it, preserve my existing settings, and ask before enabling plugins or changing the active theme.`;
}

function selectTheme(id) {
  state.selectedId = id;
  const theme = state.themes.find((entry) => entry.id === id);
  if (!theme) return;

  for (const card of gallery.querySelectorAll(".theme-card")) {
    const selected = card.dataset.id === id;
    card.classList.toggle("is-selected", selected);
    card.querySelector(".theme-card-button")?.setAttribute("aria-pressed", String(selected));
  }

  const targetName = state.target === "pi" ? "Pi" : state.target === "superset" ? "Superset" : "Paseo";
  selectionTarget.textContent = `${targetName} theme`;
  selectionTitle.textContent = theme.name;
  selectionDescription.textContent = `Terminal source: ${theme.terminalSource}. Generated from the same checked-in palette as this specimen.`;

  if (state.target === "pi") {
    themeDownload.href = theme.piDownload;
    themeDownload.textContent = "Download Pi JSON";
    themeDownload.setAttribute("download", `${theme.id}.json`);
    themeDownload.removeAttribute("target");
  } else if (state.target === "superset") {
    themeDownload.href = theme.supersetDownload;
    themeDownload.textContent = "Download Superset JSON";
    themeDownload.setAttribute("download", `${theme.id}.json`);
    themeDownload.removeAttribute("target");
  } else {
    themeDownload.href = "https://github.com/jzlosman/paseo-theme-pack#paseo";
    themeDownload.textContent = "View Paseo install";
    themeDownload.removeAttribute("download");
    themeDownload.target = "_blank";
    themeDownload.rel = "noreferrer";
  }

  copyThemePrompt.dataset.prompt = promptFor(theme);
  selectionPanel.hidden = false;
}

async function copyText(text, button) {
  const original = button.textContent;
  try {
    await navigator.clipboard.writeText(text);
    button.textContent = "Copied";
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.append(area);
    area.select();
    document.execCommand("copy");
    area.remove();
    button.textContent = "Copied";
  }
  window.setTimeout(() => { button.textContent = original; }, 1600);
}

for (const button of document.querySelectorAll(".target-button")) {
  button.addEventListener("click", () => {
    state.target = button.dataset.target;
    for (const candidate of document.querySelectorAll(".target-button")) {
      const active = candidate === button;
      candidate.classList.toggle("is-active", active);
      candidate.setAttribute("aria-pressed", String(active));
    }
    renderGallery();
    if (state.selectedId) selectTheme(state.selectedId);
  });
}

search.addEventListener("input", renderGallery);
appearance.addEventListener("change", renderGallery);
copyThemePrompt.addEventListener("click", () => copyText(copyThemePrompt.dataset.prompt, copyThemePrompt));
document.querySelector("#copy-general-prompt").addEventListener("click", (event) => {
  copyText(document.querySelector("#general-prompt").textContent, event.currentTarget);
});

try {
  const response = await fetch("themes.json");
  if (!response.ok) throw new Error(`Theme catalog returned ${response.status}`);
  state.themes = await response.json();
  renderGallery();
} catch (error) {
  gallery.setAttribute("aria-busy", "false");
  gallery.innerHTML = `<p class="empty-state">The generated theme catalog could not be loaded. Refresh the page or view the files on GitHub.</p>`;
  resultCount.textContent = "Theme catalog unavailable";
  console.error(error);
}
