# Plan #1006 – Multi-Format Image I/O Infrastructure

## Goal
Design and implement an interface system for reading and writing multiple image file formats.
All format adapters must conform to a single `IImageFormat` interface, allowing plug-and-play support.

### Phase 1: Core & Standard Formats (Status: DONE 🟢)
- **PNG, JPEG, WebP** — Native browser support.
- **PSD** (Photoshop) — `ag-psd` library (Full layer support).
- **Registry & Interface** — Standardized routing system.

### Phase 2: Extended Raster Formats (NEXT ⚪)
- **GIF** (.gif) — `gifuct-js` for reading (Frame extraction).
- **BMP** (.bmp, .dib) — Native browser or `upng.js`.
- **TGA** (.tga) — `tga.js`.
- **ICO** (.ico, .cur) — `image-ico` or custom parser.
- **Other Formats** (Filter List Support):
  - `.dds`, `.pcx`, `.pgm`, `.ppm`, `.tif`, `.xbm`, `.xpm` etc.
  - Strategy: Use a lightweight suite like `UPNG.js` or individual micro-adapters.

### Phase 3: Professional Application Formats (RESEARCH ⚪)
- **Krita (.kra)**:
  - Spec: ZIP archive containing PNG layers and `layers.xml`.
  - Library: `JSZip` + XML Parser.
- **GIMP (.xcf)**:
  - Spec: Complex binary structure.
  - Library: `xcf.js` or WASM-based `GIMP-XCF`.
- **Paint.NET (.pdn)**:
  - Spec: Binary / XML hybrid.
  - Library: Researching `pdn-reader` or custom implementation.

## Architecture

### Interface Definition
```typescript
// packages/io/src/format-interface.ts (NEW)
export interface IImageFormat {
  readonly name: string;
  readonly extensions: string[];
  canRead: boolean;
  canWrite: boolean;
  read(buffer: ArrayBuffer): Promise<ImageData | ImageData[]>; // layers as array
  write(imageData: ImageData, options?: object): Promise<ArrayBuffer>;
}
```

### Format Registry
```typescript
// packages/io/src/format-registry.ts (NEW)
export class FormatRegistry {
  private formats: Map<string, IImageFormat> = new Map();
  register(format: IImageFormat): void;
  getByExtension(ext: string): IImageFormat | null;
  getAll(): IImageFormat[];
  getSaveFilter(): string; // "PNG Images|.png|JPEG Images|.jpg|..."
  getOpenFilter(): string;
}
```

### Individual Format Adapters
```
packages/io/src/formats/
├── png-format.ts         — [DONE]
├── jpeg-format.ts        — [DONE]
├── psd-format.ts         — [DONE]
├── gif-format.ts         — gifuct-js
├── tga-format.ts         — tga.js
├── ico-format.ts         — custom
├── kra-format.ts         — JSZip (Krita)
├── xcf-format.ts         — xcf.js (GIMP)
└── pdn-format.ts         — pdn-reader (Paint.NET)
```

## Files to Create/Modify

### [NEW] `packages/io/src/format-interface.ts`
- `IImageFormat` interface

### [NEW] `packages/io/src/format-registry.ts`
- `FormatRegistry` class with `register()`, `getByExtension()`, filter generators

### [NEW] `packages/io/src/formats/png-format.ts`
- Adapter using Canvas API `toBlob('image/png')` and `createImageBitmap()`

### [NEW] `packages/io/src/formats/jpeg-format.ts`
- Adapter using Canvas API `toBlob('image/jpeg')` with quality option

### [NEW] `packages/io/src/formats/psd-format.ts`
- Wrap existing `ag-psd` usage into the interface

### [MODIFY] `packages/io/src/index.ts`
- Export `FormatRegistry`, `IImageFormat`, and all adapters

### [MODIFY] `packages/io/src/project-io.ts`
- Replace direct format calls with `FormatRegistry.getByExtension()` for routing

## Implementation Steps

1. Create `format-interface.ts` with the `IImageFormat` type definition.
2. Create `format-registry.ts` with registration and lookup logic.
3. Implement PNG and JPEG adapters using Canvas API (no library needed).
4. Wrap existing `ag-psd` code into `psd-format.ts`.
5. Update `project-io.ts` to use the registry for open/save routing.
6. Export everything from `packages/io/src/index.ts`.
7. Test: open and save PNG, JPEG, PSD files from the UI.

## Phase 2: GIF & Common Rasters
1. Integrate `JSZip` and `gifuct-js`.
2. Implement `gif-format.ts` (extracting frames as layers).
3. Implement `tga-format.ts` and `ico-format.ts`.
4. Verify with sample files.

## Phase 3: Professional Apps (Krita, GIMP, PDN)
1. **Krita**: Implement ZIP extraction logic. Read `mergedimage.png` for quick load, then parse `layers.xml` and folder structure for full layer import.
2. **GIMP**: Integrate `xcf.js`. Support basic layer translation (opacity, visibility, blend modes).
3. **Paint.NET**: Prototype binary parser for PDN chunks (Layers, Masks).

## Detailed Filter List (Goal)
`Image Files|.bmp;.cut;.dds;.gif;.ico;.iff;.jpg;.koala;.lbm;.mng;.pbm;.pcd;.pcx;.pgm;.png;.ppm;.psd;.ras;.rle;.tga;.tif;.wbmp;.xbm;.xpm`

## Risks & Notes
- **Library Weight**: Adding too many libraries might bloat the IO package. Use dynamic imports (`import()`) inside format adapters to load libraries only when needed.
- **Krita/GIMP Complexity**: Full feature parity (vector layers, adjustment layers) is unlikely. Focus on Raster layers and basic structure.

## Status
- [ ] Pending implementation
