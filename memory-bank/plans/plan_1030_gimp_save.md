# Plan #1030 – GIMP (.xcf) Save/Export Support

## Goal
Implement full .xcf file writing capability for GIMP's native layered format.

## Status
- [ ] ⚪ Backlog
- [ ] 🔴 In Progress
- [ ] 🟢 Completed

## Background
Reading support (#1052) is already implemented. This task adds **write/export** functionality.

## Architecture

### XCF File Structure (v11+)
```
.xcf file (binary format)
├── Header (magic, version, width, height, color mode)
├── Properties (compression, GUID, etc.)
├── Layers (hierarchical)
│   ├── Layer header
│   ├── Channel data (R, G, B, A)
│   └── Selection mask (optional)
├── Channels (additional channels)
└── Hierarchical structure (layer groups)
```

### Key XCF Features to Support
- Multiple layers with names
- Layer opacity and visibility
- Blend modes (limited support)
- Transparency/alpha channel
- Layer groups (folders)
- Compression (RLE or GZIP)

## Implementation Strategy

### Step 1: Binary Writer
```typescript
// File: packages/hcie-io/src/formats/gimp/xcf-writer.ts

import { DecodedImage, LayerData } from '../types';

export class XcfWriter {
  private buffer: ArrayBuffer;
  private offset: number = 0;
  
  async write(image: DecodedImage): Promise<ArrayBuffer> {
    // Calculate total size needed
    const size = this.calculateSize(image);
    this.buffer = new ArrayBuffer(size);
    this.offset = 0;
    
    // Write header
    this.writeHeader(image);
    
    // Write properties
    this.writeProperties();
    
    // Write layers (bottom to top)
    for (const layer of image.layers.reverse()) {
      this.writeLayer(layer);
    }
    
    // Write end marker
    this.writeUint32(0);
    
    return this.buffer;
  }
  
  private writeHeader(image: DecodedImage): void {
    // Magic number: "gimp xcf file"
    this.writeString('gimp xcf file', 12);
    
    // Version: 11 for GIMP 2.8+
    this.writeUint32(11);
    
    // Dimensions
    this.writeUint32(image.width);
    this.writeUint32(image.height);
    
    // Color mode: 0=RGB, 1=Grayscale, 2=Indexed
    this.writeUint32(0); // RGB
  }
  
  private writeLayer(layer: LayerData): void {
    const layerStart = this.offset;
    
    // Layer width, height
    this.writeUint32(layer.canvas.width);
    this.writeUint32(layer.canvas.height);
    
    // Layer type: 0=RGB, 1=Grayscale, 2=Indexed, 3=RGBA
    this.writeUint32(3); // RGBA
    
    // Layer name
    this.writeString(layer.name);
    
    // Opacity (0-255)
    this.writeUint8(Math.floor(layer.opacity * 255));
    
    // Visibility (1=visible, 0=hidden)
    this.writeUint8(layer.visible ? 1 : 0);
    
    // Linked state (not used)
    this.writeUint8(0);
    
    // Preserve transparency (not used)
    this.writeUint8(0);
    
    // Apply offset
    this.writeUint32(0); // No offset for now
    
    // Channel data pointers (filled later)
    const channelPtrOffset = this.offset;
    this.writeUint32(0); // R channel pointer (placeholder)
    this.writeUint32(0); // G channel pointer
    this.writeUint32(0); // B channel pointer
    this.writeUint32(0); // A channel pointer
    
    // Blend mode (property)
    this.writeProperty(17, this.getGimpBlendMode(layer.blendMode));
    
    // Write channel data
    const channelData = await this.extractChannels(layer.canvas);
    
    // Update channel pointers
    const savedOffset = this.offset;
    this.offset = channelPtrOffset;
    this.writeUint32(savedOffset + 16); // R
    this.writeUint32(savedOffset + 16 + channelData.r.length); // G
    this.writeUint32(savedOffset + 16 + channelData.r.length + channelData.g.length); // B
    this.writeUint32(savedOffset + 16 + channelData.r.length + channelData.g.length + channelData.b.length); // A
    this.offset = savedOffset;
    
    // Write channel data (RLE compressed)
    this.writeChannelData(channelData.r);
    this.writeChannelData(channelData.g);
    this.writeChannelData(channelData.b);
    this.writeChannelData(channelData.a);
    
    // End of layer marker
    this.writeUint32(0);
  }
  
  private extractChannels(canvas: HTMLCanvasElement): Promise<{
    r: Uint8Array; g: Uint8Array; b: Uint8Array; a: Uint8Array;
  }> {
    // Extract RGBA channels from canvas
  }
  
  private writeChannelData(data: Uint8Array): void {
    // RLE compression
    const compressed = this.rleCompress(data);
    this.writeUint32(compressed.length);
    this.writeBytes(compressed);
  }
}
```

### Step 2: Blend Mode Mapping
```typescript
const XCF_BLEND_MODES: Record<string, number> = {
  'normal': 0,
  'dissolve': 1,
  'behind': 2,
  'multiply': 3,
  'screen': 4,
  'overlay': 5,
  'difference': 6,
  'addition': 7,
  'subtract': 8,
  'darken-only': 9,
  'lighten-only': 10,
  'hue': 11,
  'saturation': 12,
  'color': 13,
  'value': 14,
  'divide': 15,
  'dodge': 16,
  'burn': 17,
  'hardlight': 18,
  'softlight': 19,
  'grain-merge': 20,
  'grain-extract': 21,
  'erase': 22,
  'replace': 23,
  'anti-erase': 24,
};
```

### Step 3: Compression Support
- **RLE (Run-Length Encoding)**: Default, fast
- **GZIP**: Optional, better compression
- **None**: Uncompressed (for debugging)

## Verification Plan

### Manual Tests
1. Save multi-layer document as .xcf
2. Open in GIMP - verify layers, names, opacity
3. Edit in GIMP, save, reopen in HCIE
4. Test with layer groups
5. Test various blend modes

### Automated Tests
- Round-trip: HCIE → XCF → HCIE
- Validate binary structure
- Test compression ratios

## Dependencies
- XCF specification documentation
- RLE compression algorithm
- Existing XCF reader (#1052)

## Risks & Mitigation
| Risk | Impact | Mitigation |
|------|--------|------------|
| GIMP version incompatibility | Medium | Target XCF v11 (GIMP 2.8+) |
| Complex layer effects | Low | Document limitations |
| Large file sizes | High | Use RLE compression |
| Layer group support | Medium | Flatten groups if needed |

## Timeline Estimate
- Binary writer: 2 days
- Channel extraction: 1 day
- RLE compression: 0.5 days
- Testing: 0.5 days
- **Total**: 4 days

## Success Criteria
✅ Multi-layer .xcf files save correctly
✅ Files open in GIMP without errors
✅ Layer names, opacity, visibility preserved
✅ Reasonable file sizes with compression
✅ Round-trip fidelity

---

**Status**: ⚪ Backlog  
**Priority**: HIGH (Phase 1A - Format Support)  
**Dependencies**: plan_1006_format_interface.md  
**Next Action**: Implement after Krita save support
