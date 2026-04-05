# System Patterns

## Orchestration & Core
- **Black Box Core**: `packages/core/src/` is read-only. Access via `@hcie/core` exports.
- **Runtime Patching (Opaque Core Patch)**: When the read-only Core library contains bugs or requires behavioral changes, we apply patches in `apps/web/src/core-patch.ts`. 
  - **Function Overrides**: Window-level core functions (`switchDocument`, `closeDocument`) are replaced with wrappers that inject additional logic (history isolation, splash screen triggers).
  - **State Hijacking**: We use hardcoded core flags (e.g., `g.zooming`) to conditionally toggle core behaviors (e.g., hiding the brush tip) at runtime.
  - **Action Injection**: Custom `Action` classes (e.g., `SelectionAction`) are injected into the core `HistoryManager`'s internal stacks to add history support for external features.
- **Orchestrator Pattern**: UI logic and tool coordination live in `apps/` or root, using Core as a service.

## Communication & State
- **Event-Driven UI / EventBus**: Centralized `EventBus` in `@hcie/shared` manages cross-module communication (e.g., `toolChanged`, `documentSwitched`, `fillChanged`). This removes direct circular dependencies between logic and UI.
- **Decoupled Main UI**: `hcie-canvas-ui` is split into:
  - **`RenderingLoop`**: Handles animation frame management and canvas context management.
  - **`EventDispatcher`**: Manages mouse/keyboard interactions and translates them into EventBus actions.
- **DialogHandler**: Centralized UI for prompts, alerts, and formatting.

## Performance & Rendering
- **Atomic Resize**: Central `resizeCanvas(w, h)` in `drawing_canvas.ts` ensures all layers and UI stay in sync.
## UI Aesthetics & Themes
- **Unified Monochromatic Icons**: Toolicons use a synchronized system of `grayscale(1) brightness(0) invert(var(--icon-invert))` to ensure a consistent, professional soft gray look in Dark Mode regardless of original SVG colors.
- **CSS Variable Driven Themes**: All themeable properties (bg-surface, bg-panel, icon-filter) adhere to central variables in `global.css`.

## Persistence & Configuration
- **Structured Tool Settings**: Drawing tool settings (size, opacity, hardness) are stored in a structured JSON object in `localStorage` via `@hcie/shared`.
- **Bidirectional Sync**: Shared settings are synced to/from the core `g` object upon tool change and manual input, ensuring old core logic remains functional without awareness of the storage structure.
- **Auto-Restoration**: Tools retrieve their specific last-used settings immediately upon selection.

## IO & Formats
- **Standardized DecodedImage**: All format adapters (`IImageFormat`) must return a `DecodedImage` object containing `width`, `height`, and `layers: LayerData[]`.
- **LayerData Flexibility**: `LayerData` supports both `HTMLCanvasElement` and `ImageData` for the `canvas` property, enabling adapters to choose the most efficient representation.
- **ProjectIO Orchestration**: `ProjectIO` serves as the central bridge between file binary data and the core `LayerClass` and `Document` systems.

## Project Structure
- **Polyrepo Migration**: Logical separation into `@hcie/core`, `@hcie/tools`, `@hcie/ui-components`, `@hcie/io`, `@hcie/canvas-ui`, and `@hcie/shared`.
- **Local Linking**: Development uses `file:../hcie-*` npm links to maintain isolation while allowing cross-package development.

