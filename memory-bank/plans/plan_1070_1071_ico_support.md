# Plan #1070 & #1071 – Icon (.ico) Import/Export Support

## Goal
Implement .ico file reading and writing for Windows icon format support, including multi-size and multi-color-depth icons.

## Status
- [ ] ⚪ Backlog
- [ ] 🔴 In Progress
- [ ] 🟢 Completed

## Architecture

### ICO File Structure
```
.ico file (binary format)
├── Header (6 bytes)
│   ├── Reserved (2 bytes, always 0)
│   ├── Image type (2 bytes, 1=ICO, 2=CUR)
│   └── Image count (2 bytes)
└── Image Directory Entries (16 bytes each)
    ├── Width (1 byte, 0=256)
    ├── Height (1 byte, 0=256)
    ├── Color count (1 byte, 0=no palette)
    ├── Reserved (1 byte)
    ├── Color planes (2 bytes)
    ├── Bits per pixel (2 bytes)
    ├── Image data size (4 bytes)
    └── Image data offset (4 bytes)
└── Image Data (PNG or BMP format)
    ├── PNG compressed (modern, recommended)
    └── OR uncompressed BMP (legacy)
```

### Supported Icon Configurations
| Size | Color Depth | Usage |
|------|-------------|-------|
| 16x16 | 32-bit RGBA | Taskbar, small icons |
| 24x24 | 32-bit RGBA | - |
| 32x32 | 32-bit RGBA | Toolbar, medium icons |
| 48x48 | 32-bit RGBA | Desktop icons |
| 64x64 | 32-bit RGBA | - |
| 96x96 | 32-bit RGBA | High DPI |
| 128x128 | 32-bit RGBA | - |
| 256x256 | 32-bit RGBA | Large icons |

**Strategy**: Store multiple sizes in single .ico file for best compatibility

## Implementation Strategy

### Step 1: ICO Reader (Import - #1071)
```typescript
// File: packages/hcie-io/src/formats/icon/ico-reader.ts

import { DecodedImage, LayerData } from '../types';

export class IcoReader {
  async read(buffer: ArrayBuffer): Promise<DecodedImage> {
    const view = new DataView(buffer);
    
    // Validate header
    const reserved = view.getUint16(0, true);
    const imageType = view.getUint16(2, true);
    const imageCount = view.getUint16(4, true);
    
    if (reserved !== 0 || imageType !== 1) {
      throw new Error('Invalid ICO file');
    }
    
    // Find the best icon (largest size with 32-bit color)
    let bestIconIndex = -1;
    let bestScore = -1;
    
    for (let i = 0; i < imageCount; i++) {
      const offset = 6 + i * 16;
      const width = view.getUint8(offset);
      const height = view.getUint8(offset + 1);
      const colorCount = view.getUint8(offset + 2);
      const bpp = view.getUint16(offset + 6, true);
      
      // Score: prefer 32-bit, then larger size
      const actualWidth = width === 0 ? 256 : width;
      const actualHeight = height === 0 ? 256 : height;
      const score = (bpp === 32 ? 1000 : 0) + actualWidth * actualHeight;
      
      if (score > bestScore) {
        bestScore = score;
        bestIconIndex = i;
      }
    }
    
    // Read the best icon
    return this.readIconEntry(view, bestIconIndex);
  }
  
  private async readIconEntry(view: DataView, index: number): Promise<DecodedImage> {
    const offset = 6 + index * 16;
    
    const width = view.getUint8(offset);
    const height = view.getUint8(offset + 1);
    const dataSize = view.getUint32(offset + 8, true);
    const dataOffset = view.getUint32(offset + 12, true);
    
    const actualWidth = width === 0 ? 256 : width;
    const actualHeight = height === 0 ? 256 : height;
    
    // Check if PNG format (PNG signature at start)
    const pngSignature = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
    const isPng = pngSignature.every((byte, i) => 
      view.getUint8(dataOffset + i) === byte
    );
    
    let canvas: HTMLCanvasElement;
    
    if (isPng) {
      // Decode PNG
      const pngBuffer = view.buffer.slice(dataOffset, dataOffset + dataSize);
      canvas = await this.decodePng(pngBuffer);
    } else {
      // Decode BMP (uncompressed)
      canvas = this.decodeBmp(view, dataOffset, dataSize, actualWidth, actualHeight);
    }
    
    return {
      width: actualWidth,
      height: actualHeight,
      layers: [{
        name: 'Icon',
        x: 0,
        y: 0,
        opacity: 1,
        blendMode: 'normal',
        canvas,
        visible: true,
        locked: false,
      }],
    };
  }
  
  private decodeBmp(view: DataView, offset: number, size: number, width: number, height: number): HTMLCanvasElement {
    // BMP DIB format (no file header, just DIB header)
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.createImageData(width, height);
    
    // Skip DIB header (usually 40 bytes for BITMAPINFOHEADER)
    const dibHeaderSize = view.getUint32(offset, true);
    let pixelOffset = offset + dibHeaderSize;
    
    // Read dimensions from DIB header
    const bmpWidth = view.getInt32(offset + 4, true);
    const bmpHeight = view.getInt32(offset + 8, true);
    const planes = view.getUint16(offset + 12, true);
    const bpp = view.getUint16(offset + 14, true);
    const compression = view.getUint32(offset + 16, true);
    
    // For now, handle 32-bit uncompressed only
    if (bpp === 32 && compression === 0) {
      const pixels = new Uint8ClampedArray(view.buffer, pixelOffset, width * height * 4);
      
      // BMP stores bottom-to-top, flip it
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const srcOffset = (height - 1 - y) * width * 4 + x * 4;
          const dstOffset = (y * width + x) * 4;
          
          imageData.data[dstOffset] = pixels[srcOffset + 2];     // B -> R
          imageData.data[dstOffset + 1] = pixels[srcOffset + 1]; // G -> G
          imageData.data[dstOffset + 2] = pixels[srcOffset];     // R -> B
          imageData.data[dstOffset + 3] = pixels[srcOffset + 3]; // A -> A
        }
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }
}
```

### Step 2: ICO Writer (Export - #1070)
```typescript
// File: packages/hcie-io/src/formats/icon/ico-writer.ts

export class IcoWriter {
  async write(image: DecodedImage, options?: { sizes?: number[] }): Promise<ArrayBuffer> {
    const sizes = options?.sizes || [16, 32, 48, 64, 128, 256];
    
    // Generate icon images at different sizes
    const iconImages: Map<number, Uint8Array> = new Map();
    
    for (const size of sizes) {
      const resized = await this.resizeImage(image, size, size);
      const pngData = await this.encodePng(resized);
      iconImages.set(size, pngData);
    }
    
    // Build ICO file
    const headerSize = 6;
    const directorySize = 16 * sizes.length;
    const dataStart = headerSize + directorySize;
    
    let totalSize = dataStart;
    for (const [size, data] of iconImages) {
      totalSize += data.length;
    }
    
    const buffer = new ArrayBuffer(totalSize);
    const view = new DataView(buffer);
    
    // Write header
    view.setUint16(0, 0, true); // Reserved
    view.setUint16(2, 1, true); // ICO type
    view.setUint16(4, sizes.length, true); // Image count
    
    // Write directory entries and track offsets
    let dataOffset = dataStart;
    for (let i = 0; i < sizes.length; i++) {
      const size = sizes[i];
      const data = iconImages.get(size)!;
      const dirOffset = 6 + i * 16;
      
      // Width (0 = 256)
      view.setUint8(dirOffset, size >= 256 ? 0 : size);
      // Height (0 = 256)
      view.setUint8(dirOffset + 1, size >= 256 ? 0 : size);
      // Color count (0 = no palette)
      view.setUint8(dirOffset + 2, 0);
      // Reserved
      view.setUint8(dirOffset + 3, 0);
      // Color planes
      view.setUint16(dirOffset + 4, 1, true);
      // Bits per pixel
      view.setUint16(dirOffset + 6, 32, true);
      // Image data size
      view.setUint32(dirOffset + 8, data.length, true);
      // Image data offset
      view.setUint32(dirOffset + 12, dataOffset, true);
      
      dataOffset += data.length;
    }
    
    // Write image data
    let offset = dataStart;
    for (const [, data] of iconImages) {
      new Uint8Array(buffer).set(data, offset);
      offset += data.length;
    }
    
    return buffer;
  }
  
  private async resizeImage(image: DecodedImage, width: number, height: number): Promise<HTMLCanvasElement> {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    
    // Composite all layers
    for (const layer of image.layers) {
      ctx.globalAlpha = layer.opacity;
      ctx.globalCompositeOperation = layer.blendMode as GlobalCompositeOperation;
      ctx.drawImage(layer.canvas as HTMLCanvasElement, layer.x, layer.y);
    }
    
    return canvas;
  }
  
  private async encodePng(canvas: HTMLCanvasElement): Promise<Uint8Array> {
    const blob = await new Promise<Blob>(resolve => 
      canvas.toBlob(resolve, 'image/png')
    );
    const arrayBuffer = await blob.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  }
}
```

### Step 3: Multi-Size Export Strategy
```typescript
// Recommended sizes for different use cases
export const ICON_SIZE_PRESETS = {
  web: [16, 32, 48, 64],           // Browser favicon
  windows: [16, 32, 48, 64, 128, 256], // Full Windows icon
  minimal: [32, 64, 128],          // Small footprint
};
```

## Verification Plan

### Manual Tests
1. Open various .ico files (different sizes, color depths)
2. Verify correct icon is selected (best quality)
3. Export as .ico with multiple sizes
4. Test in Windows file explorer, taskbar
5. Test as website favicon
6. Verify transparency works correctly

### Automated Tests
- Parse known .ico test files
- Validate structure after write
- Test all standard sizes

## Dependencies
- PNG encoder (browser native)
- Canvas API for resizing
- Existing format interface (#1006)

## Risks & Mitigation
| Risk | Impact | Mitigation |
|------|--------|------------|
| Legacy BMP icons | Medium | Support both PNG and BMP formats |
| Very large icons (>256px) | Low | Cap at 256px, document limitation |
| Color depth issues | Low | Always export 32-bit RGBA |
| File size concerns | Low | PNG compression keeps it small |

## Timeline Estimate
- Reader implementation: 1 day
- Writer implementation: 1 day
- Testing: 0.5 days
- **Total**: 2.5 days

## Success Criteria
✅ Open .ico files with multiple sizes
✅ Select best quality icon automatically
✅ Export .ico with multiple embedded sizes
✅ Icons work in Windows and web browsers
✅ Transparency preserved correctly

---

**Status**: ⚪ Backlog  
**Priority**: HIGH (Phase 1A - Format Support)  
**Dependencies**: plan_1006_format_interface.md  
**Next Action**: Can be implemented in parallel with other format exporters
