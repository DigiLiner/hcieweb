# Plan #1006 – Universal Image Format Infrastructure & Roadmap

## Goal
Design and implement a unified, extensible architecture for reading and writing 30+ image formats. All format adapters must conform to a standardized `IImageFormat` interface, enabling HCIE to act as a universal image translator.

## Status
- [x] 🟢 **Phase 1: Foundation (Completed)**
  - `IImageFormat` interface & `FormatRegistry`.
  - Core adapters (PNG, JPEG, PSD, BMP).
  - Basic Krita (.kra) & GIMP (.xcf) reading.
- [ ] 🔴 **Phase 2: Extended Formats (In Progress)**
  - TGA, ICO, GIF (full frame support), WebP.
- [ ] ⚪ **Phase 3: App Format Save Support (Backlog)**
  - Krita (.kra), GIMP (.xcf), PSD export.
- [ ] ⚪ **Phase 4: Specialized & Vector Support (Backlog)**
  - TIFF, PCX, DDS, SVG, WMF/EMF.

---

## 1. Core Architecture

### Universal Interface Definition
All adapters must reside in `hcie-io` and implement the following interface:

```typescript
export interface DecodedImage {
  width: number;
  height: number;
  layers: LayerData[];
  metadata?: FormatMetadata;
}

export interface LayerData {
  name: string;
  x: number;
  y: number;
  opacity: number;
  blendMode: string;
  canvas: HTMLCanvasElement | ImageData;
  visible: boolean;
  locked: boolean;
}

export interface IImageFormat {
  readonly extension: string;
  readonly mimeType: string;
  readonly supportsLayers: boolean;
  readonly supportsAnimation: boolean;
  readonly supportsTransparency: boolean;
  
  read(buffer: ArrayBuffer): Promise<DecodedImage>;
  write(image: DecodedImage): Promise<ArrayBuffer>;
  validate(buffer: ArrayBuffer): Promise<boolean>;
}
```

---

## 2. Format Registration Strategy

HCIE uses a centralized `FormatRegistry` to route file operations:
1. **Detection**: Sniffing file signatures (Magic Numbers) rather than relying solely on file extensions.
2. **Lazy Loading**: Using dynamic `import()` inside format adapters to keep the initial bundle size small, loading libraries (like `ag-psd`, `JSZip`) only when needed.

---

## 3. Roadmaps by Category

### A. Professional Application Formats
High-fidelity layered support for primary industry tools.
- **Krita (.kra)**: ZIP + XML. Researching `JSZip` for writing. (Plan: `#1040`)
- **GIMP (.xcf)**: Binary structure. Supporting v11+ (GIMP 2.8+). (Plan: `#1030`)
- **Photoshop (.psd)**: Using `ag-psd` for full layer/effect support. (Plan: `#1060`)
- **Paint.NET (.pdn)**: Researching `pdn-reader` for XML/Binary hybrid structure. (Plan: `#1050`)

### B. Animated Formats (#1054)
Extracting frames as individual layers.
- **GIF**: Multiple GCE blocks. Library: `gif-read-write`.
- **APNG**: Sequence Control (fcTL) and Frame Data (fdAT) chunks.
- **Goal**: Full frame extraction into `ImageData`.

### C. Standard & Specialized Raster (#1055)
Supporting the full list as per `USER_TASKS.md` filters.
- **Standard**: BMP, ICO, TGA, WebP.
- **Specialized**: TIFF (multi-page), DDS (DirectDraw), PCX, PCX, RAS, etc.
- **Strategy**: Individual micro-adapters for efficiency.

### D. Vector & Metafile (#1056)
- **SVG**: Primary vector format. Support for both rasterized import and path-based rendering.
- **WMF/EMF**: Legacy Windows Metafiles. Basic rasterized playback support.

---

## 4. Implementation Strategy (Phase 9 & Beyond)

1.  **Refine hcie-io Registry**: Ensure all current modules (Krita, GIMP, PNG, JPG) are fully registered via the `IImageFormat` interface.
2.  **Generic Raster Suite**: Implement the "long tail" of formats (TIFF, PCX, TGA) using standardized buffer parsing.
3.  **Animation Intercept**: Update `ProjectIO` to handle multi-layer images returned by GIF/APNG adapters.
4.  **Save/Export Pipeline**: Transition from "Read-Only" to "Read-Write" for professional layered formats.

---

## 5. Verification Plan
- **Round-trip fidelity**: Save a file and reopen it to ensure 1:1 pixel matches (where applicable).
- **Format signature validation**: Verify that incorrect extensions are handled by signature sniffing.
- **Memory Management**: Monitor heap usage during 100+ layer GIF or multi-page TIFF imports.

## 6. References to Detailed Plans
- [Krita Save Support (#1040)](file:///home/hc/Belgeler/00_PROJECTS/Tauri/hcie/memory-bank/plans/plan_1030_krita_save.md) *(Note: Numbering discrepancy in filename)*
- [GIMP Save Support (#1030)](file:///home/hc/Belgeler/00_PROJECTS/Tauri/hcie/memory-bank/plans/plan_1040_gimp_save.md) *(Note: Numbering discrepancy in filename)*
- [Paint.NET Support (#1050)](file:///home/hc/Belgeler/00_PROJECTS/Tauri/hcie/memory-bank/plans/plan_1050_pdn_support.md)
- [PSD Export (#1060)](file:///home/hc/Belgeler/00_PROJECTS/Tauri/hcie/memory-bank/plans/plan_1060_psd_export.md)
- [Icon Support (#1070/71)](file:///home/hc/Belgeler/00_PROJECTS/Tauri/hcie/memory-bank/plans/plan_1070_1071_ico_support.md)
- [SVG Support (#1080/82)](file:///home/hc/Belgeler/00_PROJECTS/Tauri/hcie/memory-bank/plans/plan_1080_1082_svg_support.md)
