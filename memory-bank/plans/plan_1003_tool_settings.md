# Plan #1003 – Drawing Tool Settings Persistence

## Goal
Store all drawing tool settings (brush size, opacity, radius, etc.) in a config file/global
object. Settings must auto-save on change and auto-restore on startup.

## Architecture Design

### Storage Strategy
- Use `localStorage` for web, Tauri `fs` API for desktop.
- Key: `hcie-tool-settings`
- Value: JSON object containing all tool settings.

### Global Settings Object
```typescript
// In packages/shared/src/tool-settings.ts (NEW FILE)
export interface ToolSettings {
  pen: { size: number; opacity: number; };
  brush: { size: number; opacity: number; hardness: number; };
  eraser: { size: number; opacity: number; hardness: number; };
  spray: { radius: number; density: number; opacity: number; };
  fill: { tolerance: number; opacity: number; };
}

export const DEFAULT_TOOL_SETTINGS: ToolSettings = {
  pen: { size: 2, opacity: 100 },
  brush: { size: 10, opacity: 100, hardness: 80 },
  eraser: { size: 15, opacity: 100, hardness: 50 },
  spray: { radius: 20, density: 30, opacity: 100 },
  fill: { tolerance: 32, opacity: 100 },
};
```

## Files to Create/Modify

### [NEW] `packages/shared/src/tool-settings.ts`
- Define `ToolSettings` interface and `DEFAULT_TOOL_SETTINGS` constant.
- Export `loadToolSettings()` — reads from localStorage, merges with defaults.
- Export `saveToolSettings(settings)` — writes to localStorage.
- Export `getGlobalSettings()` / `setGlobalSettings()` — in-memory singleton.

### [MODIFY] `packages/ui-components/src/properties-panel.ts`
- On panel initialization, call `loadToolSettings()` and populate all sliders/checkboxes.
- On every slider/checkbox `input` event, call `saveToolSettings()` with updated values.
- Sync UI controls ↔ global settings object bidirectionally.

### [MODIFY] `packages/canvas-ui/src/drawing_canvas.ts`
- Replace hardcoded size/opacity defaults with values from `getGlobalSettings()`.
- When a tool is activated, read the latest settings from the global object.

### [MODIFY] `packages/shared/src/index.ts`
- Export new `tool-settings` module.

## Implementation Steps

1. Create `packages/shared/src/tool-settings.ts` with interface, defaults, load, save.
2. Update `packages/shared/src/index.ts` to export it.
3. In `properties-panel.ts`, call `loadToolSettings()` on init and populate inputs.
4. Wire each input's `oninput` / `onchange` to `saveToolSettings()`.
5. In `drawing_canvas.ts`, read settings when tools are invoked.
6. Test: change slider → refresh → verify value is restored.

## Risks & Notes
- Must use `localStorage` on web; Tauri-specific file path is optional for Phase 1.
- Deep merge defaults with loaded settings to handle new settings keys gracefully (forward compatibility).

## Status
- [ ] Pending implementation
