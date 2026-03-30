# Plan #1005 – SVG Icon Reorganization & Theme Awareness

## Goal
Reorganize all SVG icons in `public/svgicons/` into a logical folder structure.
Make icons theme-aware (light/dark variants). Move unused/future assets to an archive folder.

## Current State
- `public/svgicons/` contains ~200 SVG files in a flat structure.
- No distinction between tool icons, UI icons, and deprecated assets.
- Many icons appear to be unused or from other projects (e.g., `browser_db.svg`, `cnc.svg`).

## Proposed Folder Structure
```
public/svgicons/
├── tools/           # Drawing tool icons (pen, brush, eraser, selection, etc.)
├── ui/              # Generic UI icons (undo, redo, save, open, etc.)
├── theme/           # Theme-switching icons (dark/light/system)
├── window/          # Window control icons (minimize, maximize, close)
└── archive/         # Unused or unrelated icons
```

## Icon Categorization Plan

### tools/
- `pen.svg`, `pen-gray.svg`, `brush.svg`, `paint-brush.svg`
- `eraser.svg`, `eraser-gray.svg`, `gui-eraser.svg`
- `fill.svg`, `Fill_576x576.svg`, `bucket.svg`
- `lasso_select.svg`, `selection-drag.svg`, `selection-ellipse.svg`
- `select-circle-gray.svg`, `select-rectangle-gray.svg`
- `rectangle.svg`, `rounded-rectangle.svg`, `ellipse.svg`, `circle.svg`, `circle-gray.svg`
- `line-gray.svg`, `crop.svg`, `crop-gray.svg`
- `magic.svg`, `dropper.svg`, `eyedropper.svg`, `color-picker.svg`
- `text.svg`, `gradient.svg`, `spray.svg`, `spray-gray.svg`
- `zoom.svg`, `zoomin.svg`, `zoomout.svg`, `zoomin-gray.svg`, `zoomout-gray.svg`
- `zoom100_blue.svg`, `zoomin_blue.svg`, `zoomout_blue.svg`, `zoomreset-gray.svg`, `zoom_reset.svg`

### ui/
- `Undo.svg`, `Redo.svg`, `undo-gray.svg`, `redo-gray.svg`
- `open.svg`, `open-gray.svg`, `save-gray.svg`
- `new.svg`, `delete-gray.svg`, `copy.svg`, `cut.svg`, `paste.svg`, `paste-gray.svg`
- `Add.svg`, `Clear.svg`, `Check.svg`, `CancelGray.svg`
- `visible.svg`, `visible-gray.svg`, `invisible-gray.svg`
- `Hide.svg`, `Show.svg`, `lock.svg`, `unlock.svg`, `locked.svg`, `unlocked.svg`
- `list-add.svg`, `list-remove.svg`
- `colorbox.svg`, `opaque.svg`, `transparent.svg`, `invert-colors.svg`
- `flip-horizontal-2.svg`, `flip-horizontal-3.svg`, `flip-vertical-2.svg`, `flip-vertical-3.svg`
- `icon_scale.svg`, `drag-gray.svg`, `pan-gray.svg`, `cursor-gray.svg`
- `filter-ui.ts`-related icons: `blur.svg`, `pixelate.svg`, `rays.svg`
- `automatic.svg`

### theme/
- `theme_dark.svg`, `theme_light.svg`, `theme_system.svg`, `theme_palette.svg`

### window/
- `minimize.svg`, `minimize_big.svg`, `minimize_gray.svg`
- `exit.svg`, `exit-black.svg`, `exit-gray.svg`
- `FullScreen.svg`, `FullScreenExit.svg`

### archive/
- All remaining SVGs not used in the application (e.g., `cnc.svg`, `cpu.svg`, `businessmanblue.svg`, etc.)

## Theme-Aware Icon Strategy

### Recommended: CSS `filter: invert()` approach
- Keep a single set of dark-stroke SVG icons.
- In dark theme, apply `filter: invert(1)` via CSS variable.

### Alternative: Dual icon sets
- `tools/light/pen.svg` (dark strokes for light bg)
- `tools/dark/pen.svg` (white strokes for dark bg)
- Use JS to swap `src` attribute on theme toggle.

**Decision**: Start with CSS filter approach (simpler). Only create dual sets if icons have colors that can't be inverted.

## Implementation Steps

1. **Audit icons**: Create a catalog of which icons are actually referenced in `index.html` and TypeScript source files.
2. **Create subfolders** under `public/svgicons/`.
3. **Move icons** to their appropriate folders.
4. **Update all references** in HTML and TS files to new paths.
5. **Move unused icons** to `archive/`.
6. **Apply CSS filter** for theme-aware icon colors.
7. **Document** final folder structure in `DEV_GUIDE.md`.

## Risks & Notes
- This is a large refactoring task — update references carefully to avoid broken icon paths.
- Run a search for icon paths after moving to verify no references are missed.
- Do NOT delete archive icons — the user may need them later.

## Status
- [ ] Pending implementation — requires user approval before mass file moves
