# Task Log: Crop Tool Stabilization & Selection UI Improvements
Date: 2026-04-03 01:57

## Context
The user reported that the Crop tool's confirmation mechanisms (Enter/Double-click) were not working, and the UI was too similar to the selection tool (marching ants), causing confusion. Additionally, states were leaking between document tabs.

## Changes Applied

### 1. Crop UI Overhaul (layers.ts & drawing_canvas.ts)
- **Solid Borders:** Replaced "marching ants" with a solid blue (`rgba(0,120,215)`) 1.5px border.
- **Dark Overlay:** Implemented a semi-transparent dark overlay (`rgba(0,0,0,0.45)`) outside the crop area to provide visual focus.
- **Interactive Handles:** Added 8 professional resize handles (white boxes with blue strokes) at corners and midpoints.
- **On-Canvas Text:** Added instructional text ("ENTER ONAYLAR", "ESC İPTAL") within the crop box for large enough areas.

### 2. Logic & Stability (drawing_canvas.ts)
- **State Management:** Moved `lastCropRect`, `_isResizingCrop`, and `_isMovingCrop` from `window` to GlobalState (`g`) to ensure better integration and isolation.
- **Double-Click Confirmation:** Re-implemented `dblclick` listener to robustly trigger `performCrop` using the current `g.lastCropRect`.
- **Keyboard Navigation:** 
    - **ENTER:** Finalizes the crop.
    - **ESC:** Clears the crop selection and resets state.
- **Drafting vs Editing:** Ensured that `g.selectionPreviewBorder` is cleared during crop operations to avoid "marching ants" ghosting.

### 3. Document Isolation (core-patch.ts)
- Updated `switchDocument` and document state capture to include `lastCropRect`.
- Crop areas are now strictly isolated per tab; switching tabs restores the correct document's pending crop area.

## Results
- **Status:** 🟢 Completed, 🟡 Waiting for User Verification.
- **Verification points:**
    - Test dragging a crop: Solid blue lines and dark overlay.
    - Test handles: Resize in all directions.
    - Test Enter/Double-click: Crop action triggers history entry and resizes canvas.
    - Test ESC: Area disappears.
    - Test Tabs: Area disappears when switching to a different tab and returns when switching back.
