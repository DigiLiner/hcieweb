# Plan: Selection Tools and Cut / Copy / Paste

## Overview

This document describes the implementation plan for:

1. **Selection tools**: Rectangle, Circle (round), and Lasso — with add/subtract modifiers and selection-scope options.
2. **Cut, Copy, Paste**: Standard behaviour — region-based when a pixel selection exists, vector-based when a vector shape is selected; move and duplicate selection integrated the same way.

---

## Current State (Summary)

- **Global selection state** (`global.js`): `g.selectionMask`, `g.selectionBorder`, `g.isSelectionActive`, `g.selectionCanvas`, `g.inverseSelectionCanvas`. Used for masking drawing and for rendering marching-ants border (`drawSelectionBorder` in `layers.js`).
- **Magic Wand**: Already creates a selection (calls `magicWand()`; selection pipeline exists). Wand has props: Tolerance, All Layers (`g.wand_tolerance`, `g.wand_all_layers`).
- **Rect Select & Lasso**: Tools exist in UI and in `Tool` enum; they are treated as “shape tools” in `drawing_canvas.js` (temp canvas cleared each move) but **no code creates `g.selectionCanvas` / `g.selectionBorder`** from a drawn rectangle or lasso. So rectangular and lasso selection creation is **missing**.
- **Circle selection**: No tool in toolbar; user requested “yuvarlak” (round) — add **Ellipse/Circle selection** tool.
- **Cut / Copy / Paste**: Menu items exist in `index.html` (Ctrl+X, Ctrl+C, Ctrl+V) but have **no handlers**; behaviour is not implemented.
- **Vector Select**: Already selects a single vector shape; `window.vectorSelection` and `vectorShapeSelectionChanged` drive the properties panel. No integration yet with cut/copy/paste (copy/paste vector shape).

---

## Part 1: Selection Tools (Rectangle, Circle, Lasso)

### 1.1 Scope

- **Rectangle Select** (`Tool.RectSelect`): drag to define a rectangle; on mouseup, create selection from that rectangle.
- **Circle Select** (new tool, e.g. `Tool.EllipseSelect` or reuse “round” as circle): drag to define ellipse (or circle with Shift); on mouseup, create selection from that ellipse.
- **Lasso Select** (`Tool.Lasso`): freeform path; on mouseup, close path and create selection from polygon.

All three must **create or update**:

- `g.selectionCanvas`: same size as document; alpha = 255 inside selection, 0 outside (or equivalent 1-bit mask used for `destination-in`).
- `g.selectionBorder`: array of points/lines for marching-ants (if existing `drawSelectionBorder` expects a specific format, follow it; otherwise define a simple format, e.g. outline path).
- `g.isSelectionActive = true`.

Implementation place: **apps/** (or a new `apps/selection_tools.js`), using only public canvas/layer APIs and existing globals. No changes in `packages/core/src/`.

### 1.2 Modifier Keys (add / subtract selection)

- **Shift** held while drawing: **add** to current selection (if any). After computing the new shape mask, combine with existing `g.selectionCanvas` (e.g. max alpha or OR of masks).
- **Alt** held while drawing: **subtract** from current selection. New shape mask is subtracted (e.g. set alpha to 0 where new shape is opaque).

Logic: in `mousedown` / `mousemove` / `mouseup`, read `e.shiftKey` and `e.altKey`; pass a flag into the “commit selection” function: `replace | add | subtract`. If no selection exists, “add” behaves as replace.

### 1.3 Selection scope (which layers affect selection)

User requirement: when using selection tools, show in the **Properties panel** a “Selection scope” (or “Apply to”) option:

- **All layers**
- **Vector only**
- **Raster only**
- **Selected layer only**

Interpretation:

- **For creating the selection shape (Rect/Circle/Lasso)**: The *shape* of the selection is independent of layers (user draws a rect/ellipse/lasso). So “scope” does not change the geometry. It will be used for:
  - **Copy/Cut/Paste** and **move/duplicate**: which layer(s) are read/written (see below).
- Optional future: Magic Wand could respect the same scope (sample from composite vs active layer vs vector-only composite). For this plan, we only add the UI and a global (e.g. `g.selection_scope`) and use it for copy/cut/paste and move; Wand can keep current behaviour or be extended later.

Add to `global.js`:

- `g.selection_scope = 'selected_layer'` (or similar), with allowed values: `'all_layers' | 'vector_only' | 'raster_only' | 'selected_layer'`.

Add to **Properties panel**:

- When current tool is one of Rect Select, Circle Select, Lasso (and optionally Wand), show a **dropdown**: “Selection scope” / “Apply to” with the four options, bound to `g.selection_scope`.

Files: `global.js` (default + allowed values), `properties-panel.js` (show dropdown for these tools), and optionally `g.toolConfig` entries for the selection tools so the panel knows which tools get this prop.

### 1.4 Implementation tasks (selection tools)

| # | Task | Where |
|---|------|--------|
| 1 | Add **Ellipse/Circle Select** tool (e.g. `Tool.EllipseSelect`), same pattern as Rect/Lasso; add toolbar button and icon. | `global.js`, `index.html` |
| 2 | Implement **rect selection**: on mouseup for RectSelect, build a canvas mask from the rectangle (fill rect with white on transparent), set `g.selectionCanvas`, `g.selectionBorder`, `g.isSelectionActive`. Reuse or implement `drawSelectionBorder` input format. | `drawing_canvas.js` and/or `apps/selection_tools.js` |
| 3 | Implement **ellipse selection**: same as rect but shape = ellipse (and optional circle with Shift). | Same as above |
| 4 | Implement **lasso selection**: record points in mousedown/mousemove; on mouseup close path, build polygon mask (e.g. `ctx.fill()` with a path), set selection. | Same as above |
| 5 | In mouse handlers, read **Shift** (add) and **Alt** (subtract); when committing selection, combine with existing `g.selectionCanvas` (add = OR/max, subtract = clear inside new shape). | Same as above |
| 6 | Add **selection scope** option to `g` and Properties panel for Rect/Circle/Lasso (and optionally Wand). | `global.js`, `properties-panel.js` |
| 7 | Ensure **Escape** continues to clear selection (already in `drawing_canvas.js`). | Existing |

Note: If `drawSelectionBorder` or selection border format is provided by an external script (e.g. `ie_scripts/tools.js`), the new code must match that format; otherwise implement a simple marching-ants drawing in the app.

---

## Part 2: Cut, Copy, Paste (and Move / Duplicate)

### 2.1 Behaviour summary

- **Copy (Ctrl+C)**  
  - If **pixel selection** is active: copy image content from the selected region (according to `g.selection_scope`) into an internal clipboard (and optionally system clipboard as image).  
  - If **vector shape** is selected (Vector Select tool + `window.vectorSelection.hasSelection`): copy that shape (and its style) to a “vector clipboard”.
- **Cut (Ctrl+X)**  
  - Same as copy, then **delete** the source: clear selected region to background (or transparent) for pixel selection, or remove the shape from the layer for vector selection. Record undo.
- **Paste (Ctrl+V)**  
  - If **vector clipboard** has content: paste as new shape on active layer (and optionally enter “move” mode to position it).  
  - If **pixel clipboard** has content: paste as floating content (e.g. new temp layer or “paste layer”) and optionally enter move mode, or paste in place on active layer at origin/clipboard position.
- **Move selection** (e.g. drag when selection exists, or dedicated action): move the selected pixels or the selected vector shape; same scope rules.
- **Duplicate** (e.g. Ctrl+J or menu): copy then paste in place (or offset) for current selection (pixel or vector).

### 2.2 Clipboard model

- **Pixel clipboard**:  
  - Store: image (canvas or ImageData), and optionally top-left position and dimensions.  
  - Scope at copy time: `g.selection_scope` determines which layers are composited (all / vector only / raster only / selected layer) and then the selected region is cropped.
- **Vector clipboard**:  
  - Store: single shape object (type, points, style) (and optionally layer index).  
  - Paste: add shape to active layer (must be vector or support shapes); if active layer is raster-only, either convert to vector or create a new vector layer and paste there.

### 2.3 Scope for copy/cut (pixel)

- **All layers**: Composite all visible layers (respecting blend modes) into a single image, then crop the selection region.
- **Vector only**: Composite only layers that have `type === 'vector'` (and their rasterized content if any) into a buffer, then crop the selection region.
- **Raster only**: Composite only raster layers (or raster part of layers), then crop.
- **Selected layer only**: Use only the active layer (raster + if vector, rasterized shapes) and crop the selection region.

Paste target: always “active layer” for a single paste; if “paste as new layer” is desired, that can be a separate option (e.g. paste into new layer above active).

### 2.4 Undo / history

- **Cut**: One history action that records “deleted content” (pixel region or vector shape) so undo restores it.
- **Paste**: One history action that records “added content” so undo removes it.
- **Move selection**: One history action (before/after position or before/after image state).

Use existing `historyManager` and action types (or add new ones, e.g. `CutAction`, `PasteAction`, `MoveSelectionAction`).

### 2.5 Implementation tasks (clipboard and actions)

| # | Task | Where |
|---|------|--------|
| 8 | **Clipboard state**: Add `g.pixelClipboard` (e.g. `{ image, x, y, width, height }`) and `g.vectorClipboard` (e.g. `{ shape }` or null). Clear vector clipboard when copying pixels and vice versa if desired. | `global.js` or `apps/clipboard.js` |
| 9 | **Copy**: Implement `copySelection()`. If `g.isSelectionActive` → copy region using `g.selection_scope` into `g.pixelClipboard`. If vector selection → copy shape into `g.vectorClipboard`. Optionally write image to `navigator.clipboard.write()` for pixel. | New or existing app script, e.g. `apps/clipboard.js` or `menu.js` |
| 10 | **Cut**: Call copy then delete: for pixel selection clear region (to bg/transparent); for vector remove shape; push undo. | Same |
| 11 | **Paste**: If `g.vectorClipboard` → paste shape on active layer; if `g.pixelClipboard` → paste image at cursor or at saved position; optionally enter “move” mode. Push undo. | Same |
| 12 | **Menu and shortcuts**: Wire Edit menu Cut/Copy/Paste to these functions; ensure Ctrl+X, Ctrl+C, Ctrl+V work (including in Electron). | `menu.js`, `index.html` (or event listeners in one place) |
| 13 | **Move selection**: When selection exists and user drags, move the selected content (pixels or vector shape) and redraw. Use same scope for “content” as copy. Record undo. | `drawing_canvas.js` and/or `apps/selection_tools.js` |
| 14 | **Duplicate**: Copy then paste in place (or slightly offset); same as copy + paste, with one undo step if desired. | Same as paste |

---

## Part 3: Integration and UX

### 3.1 Cursor and tool feedback

- When a selection tool is active, cursor remains crosshair (or tool-specific); when selection exists and tool is Move or default, show move cursor on selection (optional).
- After paste, optionally auto-select Move tool or enter “move pasted content” mode until user clicks to drop.

### 3.2 Select menu

- **Select All (Ctrl+A)**: Create full-document selection (rectangle covering entire canvas).  
- **Deselect (Ctrl+D)**: Call `cancelSelection()` (and clear vector selection if desired).  
- **Inverse (Ctrl+Shift+I)**: Invert selection mask (selected ↔ unselected).  

These can be implemented in the same place as clipboard (e.g. `apps/selection_tools.js` or `menu.js`).

### 3.3 Delete key

- When pixel selection is active: clear selection to background (like cut but without copying).  
- When vector shape is selected: delete that shape.  
- Wire to existing or new handler; ensure undo is recorded.

---

## File and dependency summary

| File | Changes |
|------|--------|
| `global.js` | Add `Tool.EllipseSelect`, `g.selection_scope`, toolConfig for Rect/Circle/Lasso (and selection scope prop). |
| `index.html` | Add Ellipse Select button; wire Cut/Copy/Paste menu to functions (or leave to menu.js). |
| `properties-panel.js` | When tool is Rect/Circle/Lasso (and optionally Wand), show “Selection scope” dropdown. |
| `drawing_canvas.js` | For RectSelect, Lasso, EllipseSelect: in `finishDrawing` (or dedicated handler), if one of these tools was used, build mask from temp drawing and set `g.selectionCanvas` / `g.selectionBorder`; handle Shift/Alt for add/subtract. Optionally handle move-selection drag. |
| New: `apps/selection_tools.js` (recommended) | Centralize: rect/ellipse/lasso mask building, add/subtract logic, `drawSelectionBorder` if not from core, Select All / Deselect / Invert. |
| New or existing: `apps/clipboard.js` (or in `menu.js`) | `copySelection()`, `cutSelection()`, `pasteSelection()`, clipboard state; scope-based compositing for pixel copy. |
| `menu.js` | Register Cut/Copy/Paste and optionally Select All / Deselect / Invert; keyboard shortcuts. |
| `document.js` | Already saves/restores `g.selectionBorder` and `g.selectionCanvas`; ensure compatibility with new selection format. |
| `layers.js` | No change to `drawSelectionBorder` call; ensure any new border format is supported. |

---

## Order of implementation (suggested)

1. **Selection tools (shape → mask)**  
   - Rectangle selection in `finishDrawing` or `apps/selection_tools.js`.  
   - Then Ellipse, then Lasso.  
   - Then Shift/Alt add/subtract.  
   - Then selection scope UI and `g.selection_scope`.

2. **Clipboard and Edit actions**  
   - Clipboard state and `copySelection()` (pixel + vector).  
   - `cutSelection()` and `pasteSelection()`.  
   - Menu and Ctrl+X/C/V.  
   - Undo for cut/paste/move.

3. **Move and duplicate**  
   - Move selection (drag).  
   - Duplicate (Ctrl+J or menu).

4. **Select menu**  
   - Select All, Deselect, Invert.

5. **Delete key**  
   - Clear selection / delete vector shape with undo.

---

## Notes

- **Core**: No changes in `packages/core/src/`. Use only public APIs and existing globals; if a helper (e.g. marching-ants) is needed and not provided by core/external scripts, implement it in `apps/`.
- **Memory bank**: After implementation steps, update `memory-bank/activeContext.md` and `memory-bank/progress.md` per project rules.
