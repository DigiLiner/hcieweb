# Plan #1050 – Paint.NET (.pdn) Import/Export Support

## Goal
Implement full .pdn file read/write support for Paint.NET's native layered format.

## Status
- [ ] ⚪ Backlog
- [ ] 🔴 In Progress
- [ ] 🟢 Completed

## Architecture

### PDN File Structure
```
.pdn file (custom binary + ZIP compression in v4+)
├── Header (magic, version)
├── Document metadata (width, height, background color)
├── Layer count
└── Layers (sequential)
    ├── Layer header (name, blend mode, opacity, visibility)
    ├── Pixel data (uncompressed RGBA)
    └── Thumbnail (optional)
```

### PDN Format Versions
- **v2/v3**: Uncompressed binary
- **v4+**: ZIP-compressed (recommended)
- **v5+**: Additional features (effects, adjustments)

**Target**: Support v4+ format with ZIP compression

## Implementation Strategy

### Step 1: PDN Reader (Import)
```typescript
// File: packages/hcie-io/src/formats/pdn/pdn-reader.ts

import { DecodedImage, LayerData } from '../types';
import { unzip } from '../../utils/zip-utils';

export class PdnReader {
  async read(buffer: ArrayBuffer): Promise<DecodedImage> {
    const view = new DataView(buffer);
    
    // Check magic number "PDN3" or "PDN4"
    const magic = this.readString(view, 0, 4);
    if (!magic.startsWith('PDN')) {
      throw new Error('Invalid PDN file');
    }
    
    const version = parseInt(magic[3]);
    
    if (version >= 4) {
      // Decompress ZIP first
      const decompressed = await unzip(buffer.slice(8)); // Skip header
      return this.parsePdnV4(decompressed);
    } else {
      // Legacy uncompressed format
      return this.parseLegacyPdn(view);
    }
  }
  
  private parsePdnV4(buffer: ArrayBuffer): DecodedImage {
    const view = new DataView(buffer);
    let offset = 0;
    
    // Read document properties
    const width = view.getUint32(offset, true); offset += 4;
    const height = view.getUint32(offset, true); offset += 4;
    
    // Background color (always white in PDN)
    const bgColor = view.getUint32(offset, true); offset += 4;
    
    // Layer count
    const layerCount = view.getUint32(offset, true); offset += 4;
    
    const layers: LayerData[] = [];
    
    // Read each layer
    for (let i = 0; i < layerCount; i++) {
      const layer = this.readLayer(view, offset);
      layers.push(layer.layer);
      offset = layer.nextOffset;
    }
    
    return {
      width,
      height,
      layers: layers.reverse(), // PDN stores top-to-bottom
    };
  }
  
  private readLayer(view: DataView, offset: number): { layer: LayerData; nextOffset: number } {
    const startOffset = offset;
    
    // Layer name (UTF-16LE string)
    const nameLength = view.getUint32(offset, true) * 2; offset += 4;
    const name = this.readUtf16String(view, offset, nameLength); offset += nameLength;
    
    // Blend mode
    const blendModeId = view.getUint32(offset, true); offset += 4;
    const blendMode = this.mapBlendMode(blendModeId);
    
    // Opacity (0-255)
    const opacity = view.getUint32(offset, true) / 255; offset += 4;
    
    // Visibility
    const visible = view.getUint32(offset, true) === 1; offset += 4;
    
    // Skip thumbnail (if present)
    const hasThumbnail = view.getUint32(offset, true) === 1; offset += 4;
    if (hasThumbnail) {
      const thumbSize = view.getUint32(offset, true); offset += 4 + thumbSize;
    }
    
    // Pixel data
    const pixelWidth = view.getUint32(offset, true); offset += 4;
    const pixelHeight = view.getUint32(offset, true); offset += 4;
    const pixelDataLength = view.getUint32(offset, true); offset += 4;
    
    const pixelData = new Uint8ClampedArray(view.buffer, offset, pixelDataLength);
    offset += pixelDataLength;
    
    // Create canvas from pixel data
    const canvas = this.createCanvasFromPixels(pixelData, pixelWidth, pixelHeight);
    
    return {
      layer: {
        name,
        x: 0,
        y: 0,
        opacity,
        blendMode,
        canvas,
        visible,
        locked: false,
      },
      nextOffset: offset,
    };
  }
  
  private mapBlendMode(modeId: number): string {
    const MODE_MAP: Record<number, string> = {
      0: 'normal',
      1: 'multiply',
      2: 'additive',
      3: 'color-burn',
      4: 'color-dodge',
      5: 'reflect',
      6: 'glow',
      7: 'overlay',
      8: 'difference',
      9: 'negation',
      10: 'lighten',
      11: 'darken',
      12: 'screen',
      13: 'xor',
      14: 'red-blue',
      15: 'green-red',
      16: 'blue-green',
      17: 'hue',
      18: 'saturation',
      19: 'color',
      20: 'luminosity',
      21: 'erase',
    };
    return MODE_MAP[modeId] || 'normal';
  }
}
```

### Step 2: PDN Writer (Export)
```typescript
// File: packages/hcie-io/src/formats/pdn/pdn-writer.ts

export class PdnWriter {
  async write(image: DecodedImage): Promise<ArrayBuffer> {
    const chunks: Uint8Array[] = [];
    
    // Header: "PDN4"
    chunks.push(new TextEncoder().encode('PDN4'));
    
    // Version (4)
    const versionBuffer = new Uint8Array(4);
    new DataView(versionBuffer.buffer).setUint32(0, 4, true);
    chunks.push(versionBuffer);
    
    // Document properties
    chunks.push(this.writeDocumentProps(image));
    
    // Layer count
    const layerCountBuffer = new Uint8Array(4);
    new DataView(layerCountBuffer.buffer).setUint32(0, image.layers.length, true);
    chunks.push(layerCountBuffer);
    
    // Write each layer (top to bottom for PDN)
    for (const layer of image.layers.reverse()) {
      chunks.push(await this.writeLayer(layer));
    }
    
    // Combine all chunks
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }
    
    // Compress with ZIP (PDN v4+ requirement)
    return await zip(result);
  }
  
  private writeDocumentProps(image: DecodedImage): Uint8Array {
    const buffer = new ArrayBuffer(12);
    const view = new DataView(buffer);
    
    // Width, height
    view.setUint32(0, image.width, true);
    view.setUint32(4, image.height, true);
    
    // Background color (white, opaque)
    view.setUint32(8, 0xFFFFFFFF, true); // ABGR
    
    return new Uint8Array(buffer);
  }
  
  private async writeLayer(layer: LayerData): Promise<Uint8Array> {
    const chunks: Uint8Array[] = [];
    
    // Layer name (UTF-16LE)
    const nameBytes = new TextEncoder().encode(layer.name);
    const nameLengthBuffer = new Uint8Array(4);
    new DataView(nameLengthBuffer.buffer).setUint32(0, layer.name.length, true);
    chunks.push(nameLengthBuffer);
    
    // Convert to UTF-16LE
    const nameUtf16 = new Uint8Array(nameBytes.length * 2);
    for (let i = 0; i < nameBytes.length; i++) {
      nameUtf16[i * 2] = nameBytes[i];
      nameUtf16[i * 2 + 1] = 0;
    }
    chunks.push(nameUtf16);
    
    // Blend mode
    const blendModeBuffer = new Uint8Array(4);
    new DataView(blendModeBuffer.buffer).setUint32(0, this.getBlendModeId(layer.blendMode), true);
    chunks.push(blendModeBuffer);
    
    // Opacity (0-255)
    const opacityBuffer = new Uint8Array(4);
    new DataView(opacityBuffer.buffer).setUint32(0, Math.floor(layer.opacity * 255), true);
    chunks.push(opacityBuffer);
    
    // Visibility
    const visibilityBuffer = new Uint8Array(4);
    new DataView(visibilityBuffer.buffer).setUint32(0, layer.visible ? 1 : 0, true);
    chunks.push(visibilityBuffer);
    
    // No thumbnail (set to 0)
    const noThumbBuffer = new Uint8Array(4);
    chunks.push(noThumbBuffer);
    
    // Pixel data
    const pixels = await this.extractPixels(layer.canvas);
    const pixelWidthBuffer = new Uint8Array(4);
    new DataView(pixelWidthBuffer.buffer).setUint32(0, layer.canvas.width, true);
    chunks.push(pixelWidthBuffer);
    
    const pixelHeightBuffer = new Uint8Array(4);
    new DataView(pixelHeightBuffer.buffer).setUint32(0, layer.canvas.height, true);
    chunks.push(pixelHeightBuffer);
    
    const pixelLengthBuffer = new Uint8Array(4);
    new DataView(pixelLengthBuffer.buffer).setUint32(0, pixels.length, true);
    chunks.push(pixelLengthBuffer);
    
    chunks.push(pixels);
    
    // Combine layer chunks
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }
    
    return result;
  }
  
  private getBlendModeId(mode: string): number {
    const MODE_MAP: Record<string, number> = {
      'normal': 0,
      'multiply': 1,
      'additive': 2,
      'color-burn': 3,
      'color-dodge': 4,
      'overlay': 7,
      'difference': 8,
      'lighten': 10,
      'darken': 11,
      'screen': 12,
      'hue': 17,
      'saturation': 18,
      'color': 19,
      'luminosity': 20,
      'erase': 21,
    };
    return MODE_MAP[mode] || 0;
  }
}
```

## Verification Plan

### Manual Tests
1. Open .pdn files from Paint.NET
2. Verify layers, names, opacity, blend modes
3. Save as .pdn, open in Paint.NET
4. Test with various layer configurations
5. Test round-trip fidelity

### Automated Tests
- Parse known .pdn test files
- Validate structure after write
- Compare pixel data accuracy

## Dependencies
- `jszip` for compression/decompression
- Existing PDN format documentation
- Canvas pixel manipulation APIs

## Risks & Mitigation
| Risk | Impact | Mitigation |
|------|--------|------------|
| PDN v5+ features unsupported | Low | Support v4 baseline, ignore advanced features |
| Large file sizes | Medium | Use ZIP compression |
| Blend mode mismatches | Low | Map to closest equivalent |
| Memory usage on large files | High | Stream processing where possible |

## Timeline Estimate
- Reader implementation: 2 days
- Writer implementation: 2 days
- Testing: 1 day
- **Total**: 5 days

## Success Criteria
✅ Open .pdn files from Paint.NET v4+
✅ Save multi-layer documents as .pdn
✅ Preserve layer names, opacity, visibility
✅ Blend modes mapped correctly
✅ Round-trip fidelity acceptable

---

**Status**: ⚪ Backlog  
**Priority**: HIGH (Phase 1A - Format Support)  
**Dependencies**: plan_1006_format_interface.md  
**Next Action**: Implement after GIMP save support
