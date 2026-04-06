# Task Log: #33 Checkerboard Pattern Theme Synchronization

## Analysis
- `styles.css` defines theme-aware `--checker-color-1` and `--checker-color-2` in CSS.
- `SettingsManager.js` defines hardcoded "dark" defaults for these variables:
    - `checkerColor1: '#404040'`
    - `checkerColor2: '#2a2a2a'`
- `SettingsManager.js` applies these as inline styles on `document.documentElement` during initialization and whenever settings change.
- Inline styles have higher specificity than CSS selectors, so they override the theme-specific colors in `styles.css`.
- As a result, the checkerboard remains dark even when the "light" theme is selected.

## Plan
1.  Modify `DEFAULT_SETTINGS` in `apps/editor/settings_manager.js`:
    - Remove `checkerColor1` and `checkerColor2` (or set them to `null` or `'auto'`).
2.  Modify `applyCanvasSettings` in `apps/editor/settings_manager.js`:
    - Only set the CSS variables for colors if the settings have a non-null/non-auto value.
    - If they are null/auto, use `removeProperty` to allow CSS to take over.
3.  Modify `apps/editor/settings_ui.js` if necessary to allow the user to choose "Auto" or reset to theme colors.
    - Actually, for now, just removing the forced dark defaults is enough to "fix" it as it was before.

## Action Steps
- [ ] Edit `apps/editor/settings_manager.js` to remove redundant color applications when using defaults.
- [ ] Verify if `styles.css` handles light mode colors correctly for checkerboards.
- [ ] Test if theme switching works as expected.
