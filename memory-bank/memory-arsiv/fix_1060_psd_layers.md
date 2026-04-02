# Plan – Fix #1060: PSD Layered Export Support

## Problem Statement
The Photoshop (.psd) export feature is currently producing files with only a single flattened layer, losing all project layer information. This occurs even when the project contains multiple layers.

## Root Cause Analysis
Based on the code review:
1.  **Canvas Type Mismatch**: HCIE uses `OffscreenCanvas` for performance. While the code casts these to `HTMLCanvasElement`, `ag-psd` may not support them correctly in all environments, especially if it relies on browser-specific `HTMLCanvasElement` APIs.
2.  **Composite vs. Layers**: If `ag-psd` encounters an error with the `children` array (layers), it might fall back to writing only the root `canvas` (composite image), resulting in a single-layer file.
3.  **Library Versions**: The `index.html` uses an old `ag-psd` (14.x) via CDN, whereas `package.json` specifies 30.x. This inconsistency can lead to unexpected behavior during export.

## Proposed Changes

### Component: `hcie-io`

#### [NEW] [psd-roundtrip-debug.test.ts](file:///home/hc/Belgeler/00_PROJECTS/Tauri/hcie-io/tests/psd-roundtrip-debug.test.ts)
- Create a dedicated Vitest/JSDOM test that:
    1.  Loads the user-provided `io-format-tests/layered.psd`.
    2.  Decodes it into `DecodedImage` (using `psd-handler.ts`).
    3.  Writes it back out using `PsdFormat.write` to `io-format-tests/layered_roundtrip.psd`.
    4.  Verify (visually or via re-reading) that layers are preserved.

#### [MODIFY] [psd-handler.ts](file:///home/hc/Belgeler/00_PROJECTS/Tauri/hcie-io/src/psd-handler.ts)
- Implement `ensureHTMLCanvas(canvas: CanvasLike): HTMLCanvasElement` helper to safely convert `OffscreenCanvas`.
- Update `savePsdFile` to convert all layer canvases using this helper.
- Add detailed console logging to track layer count and dimensions during export.
- Correctly map HCIE `visible` to `ag-psd` `hidden: !visible`.

#### [MODIFY] [project-io.ts](file:///home/hc/Belgeler/00_PROJECTS/Tauri/hcie-io/src/project-io.ts)
- Ensure the `DecodedImage` passed to format adapters contains correct layer metadata (x, y, visible, opacity).

## Open Questions
- [ ] Should we synchronize the `ag-psd` version in `index.html` to match `package.json` (v30.1.0)? v14.x is quite old.

## Verification Plan

### Automated Tests
- Run `npx vitest tests/psd-roundtrip-debug.test.ts` in `hcie-io`.
- Verify that `layered_roundtrip.psd` is generated in `io-format-tests/`.

### Manual Verification
1.  Open `layered_roundtrip.psd` in GIMP/Photoshop.
2.  Confirm all layers from the original `layered.psd` are present.
3.  Verify that single-layer formats (PNG/JPEG) are unaffected.
