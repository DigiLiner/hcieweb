# Plan #1007 – Floodfill Constrained to Selection Area

## Current State
The `floodFill` function in `packages/tools/src/flood_fill.ts` **already accepts a `maskData: Uint8ClampedArray | null` parameter** and has selection mask logic implemented:
- If a mask is provided, it checks the seed point — aborts if outside the mask (alpha < 10).
- During BFS, the `isMasked(idx)` helper prevents expanding into unselected pixels.

**The algorithm is already correct. The bug is in the call site** — `maskData` is likely being passed as `null` even when a selection is active.

## Root Cause
The caller in `drawing_canvas.ts` (or wherever `floodFill()` is invoked) is not passing the current selection mask's pixel data.

## Files to Modify
- `packages/canvas-ui/src/drawing_canvas.ts` — Where `floodFill()` is called. Needs to fetch the selection mask.
- `packages/core/src/document.ts` or selection module — Where the selection mask is stored.

## Investigation Steps

1. Search for `floodFill(` in `packages/canvas-ui/src/drawing_canvas.ts`.
2. Identify the call signature — specifically whether `maskData` is being passed.
3. Locate how the selection mask is stored (likely a `selectionCanvas` or `maskCanvas`).
4. Get the mask's `ImageData` and pass its `.data` as `maskData`.

## Implementation Steps

1. **Find the floodFill call** in `drawing_canvas.ts`.
2. **Check if a selection is active**: Look for `globals.hasSelection`, `selectionMaskCanvas`, or a flag indicating active selection.
3. **Get the mask data**: Call `selectionCtx.getImageData(0, 0, w, h).data` to get the `Uint8ClampedArray`.
4. **Pass it to `floodFill()`**:
   ```typescript
   const maskData = globals.hasSelection
     ? selectionCtx.getImageData(0, 0, w, h).data
     : null;
   floodFill(x, y, targetCtx, fillColor, tolerance, sourceCtx, maskData);
   ```
5. **Test**: Draw a rectangular selection, then use the fill tool — fill should not escape the selection boundary.

## Risks & Notes
- The core `floodFill` algorithm does NOT need to change (AGENTS.md Rule #2 — core is read-only, and tools package is what we control).
- If selection data is stored in `@hcie/core`, access it through the public API only.
- `getImageData()` on the selection canvas may be slow for large canvases — acceptable for now.

## Status
- [ ] Pending implementation — need to review drawing_canvas.ts call site
