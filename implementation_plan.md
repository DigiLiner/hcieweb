# Selection History & Advanced Tools Stabilization (V5)

## Goal
Finalize the stabilization of selection history and advanced selection tools (Feather, Grow, Shrink, Border, Fill, Stroke, Crop). Ensure all actions are correctly recorded per document tab and robustly handled during undo/redo.

## Current State (V5)
- **Document Isolation:** History stacks are isolated per tab. Switching documents correctly swaps the active `historyManager`.
- **Event-Level Capture:** Implemented in `core-patch.ts` using `setupUniversalCapture`. This catches selection changes triggered by mouse tools (Rect, Lasso, Polygon, Magic Wand) at the event level (mousedown -> record before state, mouseup/keydown/etc -> record after change).
- **Function Patching:** Advanced selection methods called via menus (Invert, Select All, etc.) are patched via `wrapSelectionFunctions` to capture state transitions.

## Missing / Fixed Items
- [x] **Feather Selection:** Was missing implementation in `selection.ts`. Added using CSS Gaussian blur filter on a temporary canvas.
- [x] **Crop Tool:** Finalized with handle points and **Enter** key confirmation. Integrated into history.
- [x] **Unified Menu Linking:** All modification tools (Grow, Shrink, Border, Fill, Stroke, Feather) are linked in `menu_connections.js`.

## Selection Logic Details
- **SelectionAction (class):** Captures both `mask` (ImageData) and `border` (Point[][]) for high-fidelity undo/redo.
- **Thresholding:** Marching ants continue to follow the 127 alpha threshold, even for feathered selections, while pixel-level tools (like Fill) respect the full alpha gradient.
- **CropAction (class):** Resizes all layers and global dimensions, saving full state backups for reliable undo.

## Verification Checklist
1. [ ] **Feathering:** Create selection -> Select 'Modify > Feather' -> Confirm history entry -> Undo/Redo visually.
2. [ ] **History Isolation:** Open 2 tabs -> Select in Tab A -> Switch to Tab B -> History panel should be empty for B -> Switch back -> Tab A history returns.
3. [ ] **Crop Lifecycle:** Use Crop tool -> Resize handles -> Press Enter -> Confirm image size change -> Undo (image restores size).
4. [ ] **Advanced Menu:** Select All -> Invert -> Grow -> Confirm each step generates a unique History entry.

---
**Status:** 🟡 Testing (Waiting for User Verification)
**Revision:** 2026-04-03
