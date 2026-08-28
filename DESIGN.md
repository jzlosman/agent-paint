---
name: Agent Paint
description: A graphite calibration wall for comparing truthful generated themes across agent surfaces.
colors:
  page: "#0d1015"
  panel: "#151922"
  panel-strong: "#1b202a"
  line: "#303744"
  line-bright: "#4a5565"
  text: "#f2f5f7"
  muted: "#aab3bf"
  dim: "#7e8997"
  focus: "#8cc8ff"
typography:
  display:
    fontFamily: "Mona Sans Display, Mona Sans, sans-serif"
    fontSize: "clamp(48px, 7vw, 96px)"
    fontWeight: 700
    lineHeight: 0.92
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Mona Sans Display, Mona Sans, sans-serif"
    fontSize: "clamp(34px, 4vw, 58px)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Mona Sans, Helvetica Neue, sans-serif"
    fontSize: "17px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Mona Sans, Helvetica Neue, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "normal"
  label:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "10px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.08em"
  navigation:
    fontFamily: "Mona Sans, Helvetica Neue, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "normal"
rounded:
  square: "0px"
  control: "8px"
  specimen: "10px"
  card: "14px"
spacing:
  compact: "10px"
  control: "14px"
  card: "18px"
  section: "24px"
  frame: "28px"
components:
  target-button:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    typography: "{typography.navigation}"
    rounded: "{rounded.square}"
    padding: "9px 16px"
  target-button-active:
    backgroundColor: "#e9eff5"
    textColor: "#101318"
    typography: "{typography.navigation}"
    rounded: "{rounded.square}"
    padding: "9px 16px"
  search-field:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    rounded: "{rounded.square}"
    height: "38px"
    width: "100%"
  theme-specimen-card:
    typography: "{typography.title}"
    rounded: "{rounded.card}"
    padding: "18px"
    width: "100%"
  selected-action-tray:
    backgroundColor: "#171c24"
    textColor: "{colors.text}"
    rounded: "{rounded.card}"
    padding: "18px 20px"
    width: "min(920px, calc(100% - 28px))"
  primary-action:
    backgroundColor: "#eaf1f7"
    textColor: "#101318"
    rounded: "{rounded.control}"
    padding: "0 15px"
    height: "42px"
  header-navigation:
    backgroundColor: "{colors.page}"
    textColor: "{colors.muted}"
    typography: "{typography.navigation}"
    padding: "0 28px"
    height: "64px"
    width: "100%"
---

# Design System: Agent Paint

## Overview

**Creative North Star: "The Calibration Wall."**

The interface is an engineered wall for comparing real outputs, not a campaign around color. Graphite-dark framing, measured labels, tight borders, and direct controls create a quiet instrument panel; the actual generated theme specimens carry the visual energy and remain the subject.

The mood is engineered, measured, color-accurate, and direct. Controls should recede until needed, while truthful differences between Paseo, Pi, and Superset outputs stay vivid and inspectable. The system rejects generic marketing hero cards, decorative fake previews, neon or glow-heavy terminal cosplay, and any flow that hides installation behind the gallery.

**Key Characteristics:**
- Graphite-dark, high-clarity application framing.
- Restrained instrument controls around vivid generated specimens.
- Dense comparison layouts with only the metadata needed to choose a theme.
- Direct installation and agent handoff paths beside the gallery experience.

## Colors

The shell uses a cool graphite neutral stack and one precise calibration-blue focus accent, leaving broad hue variation to the generated themes.

### Primary
- **Calibration Blue** (`colors.focus`): Reserved for keyboard focus, selected-target annotation, and other exact interaction cues; it is not a decorative brand wash.

### Neutral
- **Graphite Page** (`colors.page`): The continuous site canvas and darkest framing surface.
- **Instrument Panel** (`colors.panel`): Control-bus cells and contained working surfaces.
- **Raised Graphite** (`colors.panel-strong`): Hovered or quietly emphasized controls without introducing shadow.
- **Measured Line** (`colors.line`): Subtle internal borders and quiet control separation.
- **Bright Measure** (`colors.line-bright`): Major boundaries, control-bus outlines, and structural dividers.
- **Calibration White** (`colors.text`): Primary copy and high-priority labels.
- **Cool Muted Text** (`colors.muted`): Supporting prose and inactive navigation.
- **Dim Instrument Text** (`colors.dim`): Uppercase micro-labels, placeholders, and low-priority metadata.

**The Specimen Truth Rule.** Dynamic theme-card colors are generated product content, not global brand tokens. Never normalize them into the graphite shell palette or reuse a specimen accent as site chrome.

## Typography

**Display Font:** Mona Sans Display (with Mona Sans and sans-serif fallbacks)  
**Body Font:** Mona Sans (with Helvetica Neue and sans-serif fallbacks)  
**Label/Mono Font:** System monospace (ui-monospace, SFMono-Regular, Menlo, monospace)

**Character:** Mona Sans supplies compact, technically neutral reading text, while Mona Sans Display gives the largest statements blunt visual authority. Monospace is functional instrumentation for target metadata and control labels—not terminal decoration.

### Hierarchy
- **Display** (700, fluid 48–96px, 0.92 line-height): The page promise; tightly tracked and balanced, with a mobile range of 43–58px.
- **Headline** (700, fluid 34–58px, 1 line-height): Major explanatory sections such as installation and generation method.
- **Title** (700, 17px, 1.2 line-height): Theme names and compact card-level headings.
- **Body** (400, 16px, 1.65 line-height): Explanatory copy; prominent intro copy rises fluidly to 21px, while operational notes contract to 13px.
- **Label** (700, 10px, 0.08em tracking, uppercase): Measured control headings and generated metadata.

**The Instrument Label Rule.** Use monospace only where text behaves like a reading, filename, state, count, or machine-oriented label; narrative copy remains Mona Sans.

## Layout

The frame uses a maximum width of 1540px with 24px side gutters on large screens and 14px gutters below 850px. The opening composition pairs the Agent Paint mark with a direct product description, then presents the agent-install prompt as the primary path. Gallery controls and specimens follow as the secondary browse-and-compare path.

The gallery runs four columns by default with 14px gutters, then moves to three columns at 1180px, two at 850px, and one at 590px. At 1180px the intro stacks and the target selector spans the full control bus; at 590px the bus becomes a compact two-column field row under a three-button target row. The selected action tray is sticky on larger screens and fixed to 14px side insets on mobile so the chosen theme remains actionable.

Spacing follows a compact instrument rhythm inside controls and cards, then opens substantially between narrative sections. Preserve the contrast between dense comparison tools and generous explanatory bands rather than applying one uniform spacing scale everywhere.

## Elevation & Depth

The system is flat and tonal by default. Depth comes from the page, panel, and stronger-panel sequence; bright structural lines; clipped card silhouettes; and a 2px specimen lift on hover. The sticky header uses translucency and backdrop blur, not a drop shadow. Only the selected-theme action tray receives a wide ambient shadow because it must remain legible while floating above either dark or light specimens.

### Shadow Vocabulary
- **Selected Tray Ambient** (`0 18px 48px rgba(0, 0, 0, 0.42)`): Use only on the selected-theme action tray in its sticky desktop and fixed mobile states.

**The Flat-by-Default Rule.** Do not add card, control, header, or section shadows; tonal separation and measured borders carry the hierarchy until an action tray must float over generated content.

## Shapes

The form language alternates square measurement structures with gently clipped content objects. Segmented target buttons and underlined fields stay square; primary actions use an 8px radius; inner interface specimens use 10px; and theme cards plus the selected action tray use 14px. Palette strips use a compact 6px clip, while micro-bars use only a 2px softening.

Borders are one-pixel structural lines. Cards clip their generated colors cleanly, and selected cards add an offset three-pixel ring in the theme's own generated ring color. Do not round the control bus or prompt console into generic floating cards.

## Components

### Target Button

A restrained segmented instrument for changing the generated output under inspection.

- **Shape:** Square segments with shared one-pixel boundaries; only the final segment restores the right border.
- **Default:** Transparent over the panel with muted text and compact 9px by 16px padding.
- **Hover / Focus / Active:** Hover uses the stronger graphite tone; keyboard focus uses the global three-pixel focus ring. The active segment inverts to a pale solid surface with dark text and maintains `aria-pressed`.

### Search Field

An underlined filter field integrated into the control bus rather than a standalone rounded input.

- **Style:** Transparent, full-width, 38px high, with one bright bottom rule and no radius.
- **Focus:** The global focus-visible ring surrounds the field; placeholders remain dim and results update as the user types.

### Theme Specimen Card

The signature component and visual subject: a generated theme rendered as interface evidence rather than a decorative swatch.

- **Corner Style:** 14px outer clip with a 10px inner specimen.
- **Background:** Every foreground, surface, border, accent, muted text, selection ring, and eight-color strip value comes from the selected generated target.
- **State:** Hover or keyboard focus lifts only the inner specimen by 2px over 180ms ease-out. Selection uses the generated ring color, an offset outline, and `aria-pressed`.
- **Evidence:** Keep the theme name, light/dark target metadata, interface specimen, and full semantic or ANSI strip visible. Contrast remains enforced in generated output; do not expose unexplained compliance badges in the gallery.

### Selected Action Tray

A persistent handoff surface that connects the chosen specimen directly to its generated output.

- **Style:** Strong graphite background, bright border, 14px radius, and the system's only ambient shadow.
- **Behavior:** Sticky and centered on larger screens; fixed with 14px side insets on mobile. Descriptive copy may collapse on mobile, but the selected name and actions remain visible.

### Primary Download / Copy Action

A pale, high-contrast control shared by generated downloads, install links, and primary copy actions.

- **Shape:** Gently rounded (8px), at least 42px high, with 15px horizontal padding.
- **State:** Hover brightens to white; focus uses the global focus ring. Link and button implementations must remain visually equivalent.

### Header Navigation

A compact sticky index that stays secondary to the gallery.

- **Style:** 64px high with the Agent Paint brush mark at left and muted 14px links at right. The translucent graphite background uses a 14px backdrop blur and a quiet bottom rule.
- **State:** Links brighten to primary text on hover and receive the global focus ring. At 850px gaps and type tighten; the redundant Themes link is hidden while Agent install and GitHub remain available.

## Do's and Don'ts

### Do:
- **Do** keep graphite surfaces and measured one-pixel boundaries subordinate to the generated specimens.
- **Do** make actual generated target colors and palette strips the visual subject.
- **Do** preserve the four-to-three-to-two-to-one gallery progression across the 1180px, 850px, and 590px breakpoints.
- **Do** use the three-pixel calibration-blue focus ring with a three-pixel offset for keyboard-visible interaction.
- **Do** place installation and agent handoff guidance before the gallery as the primary path.

### Don't:
- **Don't** replace the opening composition or gallery with generic marketing hero cards or statistic boxes.
- **Don't** use decorative fake previews when generated theme values are available.
- **Don't** add neon glows, faux terminal effects, or cyberpunk cosplay to imply technical credibility.
- **Don't** hide installation, downloads, or agent handoff behind the gallery or an ornamental interaction.
