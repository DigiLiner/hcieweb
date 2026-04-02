# Plan #1060 – Photoshop (.psd) Export Support

## Goal
Implement .psd file writing capability for Adobe Photoshop's native layered format.

## Status
- [ ] ⚪ Backlog
- [ ] 🔴 In Progress
- [ ] 🟢 Completed

## Background
PSD reading is already supported via `ag-psd` library. This task adds **write/export** functionality.

## Architecture

### PSD File Structure
```
.psd file (binary format)
├── Header (signature, version, channels, dimensions, depth, mode)
├── Color Mode Data (optional, usually empty for RGB)
├── Image Resources (metadata, paths, guides, etc.)
├── Layer and Mask Information
│   ├── Layer count
│   ├── Layer records (name, blend mode, opacity, bounds)
│   └── Channel image data (per layer, per channel)
└── Global Layer Mask Info (optional)
```

### Key PSD Features to Support
- Multiple layers with names
- Layer opacity and visibility
- Blend modes (extensive support)
- Transparency/alpha channel
- Layer groups (folders)
- Clipping masks
- Adjustment layers (limited)
- ICC color profiles

## Implementation Strategy

### Option A: Use ag-psd Library (Recommended)
The `ag-psd` library already has write support. We should leverage it instead of implementing from scratch.

```typescript
// File: packages/hcie-io/src/formats/photoshop/psd-writer.ts

import { writePsd, Psd } from 'ag-psd';
import { DecodedImage, LayerData } from '../types';

export class PsdWriter {
  async write(image: DecodedImage): Promise<ArrayBuffer> {
    // Convert HCIE format to ag-psd format
    const psdDocument: Psd = {
      width: image.width,
      height: image.height,
      colorMode: 0, // RGB
      channels: 4, // RGBA
      bitsPerChannel: 8,
      resources: [],
      layers: [],
      mergedCanvas: undefined, // Don't include merged image
    };
    
    // Convert each layer
    for (const layer of image.layers) {
      const psdLayer = await this.convertLayer(layer);
      psdDocument.layers.push(psdLayer);
    }
    
    // Write PSD file
    const psdBuffer = writePsd(psdDocument);
    return psdBuffer.buffer;
  }
  
  private async convertLayer(layer: LayerData): Promise<any> {
    // Extract pixel data from canvas
    const imageData = await this.extractImageData(layer.canvas);
    
    // Map blend mode
    const blendMode = this.mapBlendMode(layer.blendMode);
    
    return {
      name: layer.name,
      width: layer.canvas.width,
      height: layer.canvas.height,
      hidden: !layer.visible,
      opacity: Math.floor(layer.opacity * 255),
      blendingMode: blendMode,
      channels: [
        { type: 0, data: imageData.r }, // Red
        { type: 1, data: imageData.g }, // Green
        { type: 2, data: imageData.b }, // Blue
        { type: -1, data: imageData.a }, // Alpha (mask)
      ],
    };
  }
  
  private mapBlendMode(mode: string): number {
    const BLEND_MODE_MAP: Record<string, number> = {
      'normal': 0,
      'multiply': 1,
      'screen': 2,
      'overlay': 3,
      'darken': 4,
      'lighten': 5,
      'color-dodge': 6,
      'color-burn': 7,
      'hard-light': 8,
      'soft-light': 9,
      'difference': 10,
      'exclusion': 11,
      'hue': 12,
      'saturation': 13,
      'color': 14,
      'luminosity': 15,
    };
    return BLEND_MODE_MAP[mode] || 0;
  }
  
  private async extractImageData(canvas: HTMLCanvasElement): Promise<{
    r: Uint8Array; g: Uint8Array; b: Uint8Array; a: Uint8Array;
  }> {
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    
    const r = new Uint8Array(pixels.length / 4);
    const g = new Uint8Array(pixels.length / 4);
    const b = new Uint8Array(pixels.length / 4);
    const a = new Uint8Array(pixels.length / 4);
    
    for (let i = 0; i < pixels.length; i += 4) {
      r[i / 4] = pixels[i];
      g[i / 4] = pixels[i + 1];
      b[i / 4] = pixels[i + 2];
      a[i / 4] = pixels[i + 3];
    }
    
    return { r, g, b, a };
  }
}
```

### Step 2: Advanced Features (Optional)
```typescript
// Add support for:
// - Layer groups (folders)
// - Adjustment layers
// - Layer effects (drop shadow, glow, etc.)
// - Vector masks
// - Smart objects (very complex, defer to future)
```

## Verification Plan

### Manual Tests
1. Export multi-layer document as .psd
2. Open in Photoshop - verify all layers
3. Check layer names, opacity, blend modes
4. Edit in Photoshop, save, reopen in HCIE
5. Test with layer groups
6. Test with transparency

### Automated Tests
- Round-trip: HCIE → PSD → HCIE
- Validate PSD structure with `ag-psd` reader
- Compare layer counts and properties

## Dependencies
- `ag-psd` library (already installed)
- Existing PSD reader integration

## Risks & Mitigation
| Risk | Impact | Mitigation |
|------|--------|------------|
| Photoshop version incompatibility | Low | Use standard PSD spec |
| Complex layer effects | Low | Document limitations, fallback to rasterized |
| Large file sizes | Medium | Optimize compression settings |
| Missing blend modes | Low | Map to closest equivalent |

## Timeline Estimate
- ag-psd integration: 0.5 days
- Layer conversion: 1 day
- Testing: 0.5 days
- **Total**: 2 days

## Success Criteria
✅ Multi-layer .psd files export correctly
✅ Files open in Photoshop without errors
✅ Layer names, opacity, visibility preserved
✅ Blend modes mapped correctly
✅ Reasonable file sizes

---

**Status**: ⚪ Backlog  
**Priority**: HIGH (Phase 1A - Format Support)  
**Dependencies**: plan_1006_format_interface.md, `ag-psd` library  
**Next Action**: Implement after PDN support (can be done in parallel with other formats)
