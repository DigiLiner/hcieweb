# Unified Menu Integration Plan

This plan outlines the steps to synchronize the application's menu with the standard "Unified Menu Structure" while maintaining current functionality and preparing for future features.

## Status: 🟡 Waiting for Approval

## Proposed Changes

### [UI Components]

#### [MODIFY] [menu.css](file:///home/hc/Belgeler/00_PROJECTS/Tauri/hcie-ui-components/src/styles/menu.css)
- Add `.menu-option.not-implemented` class.
- Initially, this class will have `display: none;` to keep the UI clean.

### [Main Application]

#### [MODIFY] [index.html](file:///home/hc/Belgeler/00_PROJECTS/Tauri/hcie/index.html)
- Reorganize and expand the `<div class="app-menu-bar">` structure.
- Add **Layer** and **Window** menus.
- Update all `menu-option` elements:
    - Add `title` attribute for tooltips (from Unified Menu's "Tooltip" column).
    - Ensure `span.shortcut` matches the unified structure.
    - Add `not-implemented` class to items not listed as "✅" in `menu_test_results.md`.
    - Keep existing `onclick` bindings for functional items.

## Verification Plan

### Manual Verification
- Open `index.html` in a browser.
- Verify that only currently functional items are visible.
- Hover over items to check tooltips.
- Check that shortcuts are correctly displayed.
- Verify that new categories (Layer, Window) exist (even if items inside are hidden).
