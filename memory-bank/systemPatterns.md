# System Patterns
Established architectural patterns.

## Orchestrator Pattern
Agents act as high-level orchestrators. They use the `CoreEngine` export from `packages/core/` to perform image operations but manage state and UI independently.

## Black Box Core
`packages/core/src/` is read-only. Any required changes should be proposed to the user as potential library updates rather than edited directly.

## UI Event Sync
Panels communicate via `CustomEvent` (e.g., `syncOpacity`, `toolChanged`) for cross-panel synchronization.

## Centralized UI Interaction (DialogHandler)
All user prompts, alerts, and format selections are handled by the `DialogHandler` class. This ensures a consistent, premium look and prevents the use of blocking browser prompts.

## Atomic Resizing (resizeCanvas)
Canvas dimension updates are handled by a single `resizeCanvas(w, h)` function in `drawing_canvas.ts`. This function ensures that `drawingCanvas`, `originalCanvas`, `tempCanvas`, and the UI wrappers stay in sync, preventing rendering artifacts or hidden content.
## Unified CSS Variables & Theme Support
Styles are driven by a centralized variable system in `:root` of `styles.css`. All component-specific styles (e.g., `menu.css`, `panels.css`) must consume these variables rather than hardcoding colors. Theme switching is handled by updating the `data-theme` attribute on `document.documentElement` or via `@media (prefers-color-scheme)`.
