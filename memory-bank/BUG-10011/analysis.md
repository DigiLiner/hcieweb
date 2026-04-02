# Analysis of BUG-10011: Document Isolation & History Fix

## Issues Identified

### 1. Incomplete HistoryManager Proxy
The current proxy in `core-patch.ts` only overrides methods (`push`, `undo`, `redo`, `clear`). However, `HistoryManager` in the core library uses getters `canUndo` and `canRedo`.
- **Finding:** The UI elements (buttons and menus) likely check `historyManager.canUndo` directly. Since this property is NOT proxied, it reflects the state of the original singleton, which remains empty while all actions are pushed to the per-doc instances.
- **Result:** The UI doesn't accurately reflect the undo/redo status of the active document.

### 2. Selection Data Leakage
When switching documents, the global selection state (`g.selectionMask`, `g.selectionBorder`, `g.selectionCanvas`) is saved and restored.
- **Potential Failure Point:** `g.selectionCanvas` is a DOM `<canvas>` element (or Offscreen). Simply assigning a reference to the global `g` variable might not be enough if the core rendering logic doesn't correctly re-initialize the canvas context or if it keeps internal caches.
- **Potential Failure Point:** The `InverseSelectionCanvas` is not being isolated. If Doc A has an inverted selection, and you switch to Doc B, the inverse version might leak.

### 3. State Synchronization Order
In `w.switchDocument`, `originalSwitchDocument` is called *before* restoring the selection state and history manager.
- **Improvement:** The order should be:
    1. Save old state.
    2. Switch core document.
    3. Restore new state (including history).
    4. Force UI update.
    5. Force render.

## Proposed Fix Strategy

1.  **Refactor `applyCorePatch`**:
    - Use `Object.defineProperties` to proxy the *entire* `historyManager` instance, including its getters.
    - Added `getHistoryForDoc` which initializes history for a document if it doesn't exist.
2.  **Enhance `switchDocument`**:
    - Ensure all selection-related variables are properly swapped.
    - Clear the selection entirely if the document has none.
    - Synchronize the `HistoryManager` instance on `window`.
3.  **UI Updates**:
    - Ensure `updateUndoRedoUI()` is robust and called whenever needed.
