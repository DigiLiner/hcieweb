# Task Log #1006 – Multi-Format Image I/O Infrastructure

## Description
Design and implement a plug-and-play interface for image file format reading/writing.

## Status
- [🔴] In Progress (Phase 2)

## Tasks & Progress
### Phase 1: Core & PSD (DONE 🟢)
- [x] Create `packages/io/src/format-interface.ts`
- [x] Create `packages/io/src/format-registry.ts`
- [x] Implement `packages/io/src/formats/png-format.ts`
- [x] Implement `packages/io/src/formats/jpeg-format.ts`
- [x] Implement `packages/io/src/formats/psd-format.ts`
- [x] Update `packages/io/src/project-io.ts` to use the registry
- [x] Export everything from `packages/io/src/index.ts`
- [x] Refactored `menu-handlers.ts` to use the new centralized I/O logic.
- [x] Fixed missing `convertPsdToLayers` export in `packages/io/src/index.ts`.

### Phase 2: Extended Raster Formats (DONE 🟢)
- [x] Implement `gif-format.ts` (using browser-native for now)
- [x] Implement `tga-format.ts` (TGA decoding/encoding)
- [x] Implement `ico-format.ts` (ICO decoding)
- [x] Implement `bmp-format.ts` (Native + custom encoder)
- [x] Implement `webp-format.ts` (Native)
- [x] Update Registry to include new filters (User-compliant list)

### Phase 3: Professional Application Formats (IN PROGRESS 🔴)
- [ ] Implement `kra-format.ts` (Krita via JSZip)
- [ ] Research/Implement `xcf-format.ts` (GIMP)
- [ ] Research/Implement `pdn-format.ts` (Paint.NET)

## Decisions
- Use native Canvas API for PNG and JPEG to minimize dependencies.
- Maintain `psd-handler.ts` as the underlying implementation for PSD but wrap it in the new interface.

## Notes
- `IImageFormat` should handle multi-layer formats (like GIF or PSD) via `ImageData[]` return type.
