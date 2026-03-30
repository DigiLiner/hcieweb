# Plan #1050 – Core I/O & Standard Raster Formats

## Goal
Standardize and verify the core I/O architecture and basic raster format support (PNG, JPEG, WebP, PSD, BMP, TGA, ICO, GIF).

## Status
- [x] Phase 1: PNG, JPEG, PSD (Done)
- [x] Phase 2: BMP, TGA, ICO, WebP, GIF (Done & Registered)
- [ ] Verification: Final testing of specialized encoders (BMP/TGA) and multi-layer ICO reading.

## Proposed Changes

### [DONE] packages/io/src/formats/
- `png-format.ts`, `jpeg-format.ts`, `webp-format.ts`: Native browser support.
- `psd-format.ts`: `ag-psd` wrapper.
- `bmp-format.ts`: Custom 24-bit uncompressed encoder.
- `tga-format.ts`: Custom RLE/Uncompressed decoder/encoder.
- `ico-format.ts`: PNG/BMP Icon directory parser.
- `gif-format.ts`: Basic single-frame native reader.

### [DONE] packages/io/src/format-registry.ts
- Centralized registration and user-compliant filter generation.

## Tasks & Progress
- [x] Implement standard format adapters.
- [x] Register formats in `FormatRegistry`.
- [x] Standardize `getOpenFilter()` according to `USER_TASKS.md`.
- [ ] Add unit tests for BMP and TGA edge cases.

## Verification Plan

### Automated
- `npm run test:io` (Once test infra is ready).

### Manual
- **BMP**: Save a 24-bit BMP and open in a standard viewer (e.g., GIMP).
- **TGA**: Test RLE compression by opening a sample TGA RLE.
- **ICO**: Open a multi-res ICO and verify it imports as multiple layers.
