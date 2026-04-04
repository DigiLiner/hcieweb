# Plan #1005 – SVG Icon Reorganization & Resource Structure

## Goal
Categorize 200+ SVG icons into theme-based folders to ensure a clean, sustainable resource structure and maintain theme compatibility.

## Status
- [ ] ⚪ Backlog
- [x] 🔴 In Progress
- [ ] 🟢 Completed

## Current Structure (Flat or Partially Organized)
- `public/resources/themes/ie_color/`
  - `tools/`
  - `selection/`
  - ... (partially organized, many icons mixed)

## Proposed Structure
```
public/resources/icons/
├── tools/        # Drawing, selection, transformation tools
├── ui/           # UI elements (buttons, sliders, modals)
├── selection/    # Selection-specific icons
├── file/         # Open, save, export, format icons
├── edit/         # Undo, redo, cut, copy, paste
└── depo/         # Unused or future-use archive
```

## Implementation Strategy

### Step 1: Physical Reorganization (Week 1, Day 1)
- Map all current SVG paths in the codebase.
- Move files to the new directory structure.
- Update all references in `DrawingCanvas`, `ToolsPanel`, `Sidebar`, etc.

### Step 2: Theme Compatibility (Week 1, Day 2)
- Ensure all icons work with the dark theme monochromatic filter.
- `grayscale(1) brightness(0) invert(var(--icon-invert))`
- Verify SVG `fill` and `stroke` attributes aren't hardcoded in a way that breaks filtering.

### Step 3: Archive (Depo) (Week 1, Day 3)
- Identify unused icons and move them to `depo/`.
- Clean up `public/resources/` of redundant old files.

## Verification Plan

### Manual
- [ ] Check every tool icon in the sidebar for both Light and Dark modes.
- [ ] Verify menu icons are correctly loaded.
- [ ] Check dialog icons (Open/Save/Alerts).

### Automated
- [ ] Search for broken resource paths (404s in dev console).
- [ ] Run a quick script to check for non-existent `.svg` references in the source.

## Risks & Mitigation
| Risk | Impact | Mitigation |
|------|--------|------------|
| Broken image paths | High | Comprehensive search & replace, verify in logs. |
| Broken themes | Medium | Standardize CSS filter application. |
| Inconsistent icon sizes | Low | Normalize SVG `viewBox`. |

## Timeline Estimate
- Path mapping: 4h
- File move: 2h
- Reference update: 8h
- Testing & Polish: 4h
- **Total**: ~18h working time.

## Success Criteria
✅ 100% of used icons are in the new `icons/` structure.
✅ No broken paths (404 errors) in the application.
✅ All icons correctly respond to theme changes.
✅ `depo/` contains all non-critical or legacy assets.
