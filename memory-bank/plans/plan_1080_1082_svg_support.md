# Plan #1080, #1081, #1082 – SVG Workspace, Import & Export Support

## Goal
Create a dedicated SVG editing workspace with import/export capabilities for scalable vector graphics.

## Status
- [ ] ⚪ Backlog
- [ ] 🔴 In Progress
- [ ] 🟢 Completed

## Architecture Overview

### SVG Format Characteristics
- **Vector-based**: Paths, shapes, text (not pixel-based)
- **XML structure**: Human-readable, editable
- **Scalable**: Resolution-independent
- **Styling**: CSS support, fills, strokes, gradients
- **Animation**: SMIL, CSS animations (optional)
- **Interactivity**: JavaScript support (optional, security concerns)

### HCIE SVG Strategy
**Hybrid Approach**: 
- **Import**: Render SVG to raster layers (preserves appearance)
- **Export**: Generate SVG from canvas (limited vector data)
- **Future**: Full vector editing (complex, defer to v2)

## Implementation Strategy

### Step 1: SVG Import (#1081)
```typescript
// File: packages/hcie-io/src/formats/svg/svg-reader.ts

import { DecodedImage, LayerData } from '../types';

export class SvgReader {
  async read(buffer: ArrayBuffer): Promise<DecodedImage> {
    const svgText = new TextDecoder().decode(buffer);
    
    // Parse SVG dimensions
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
    const svgElement = svgDoc.documentElement;
    
    const width = this.parseDimension(svgElement.getAttribute('width') || '100%');
    const height = this.parseDimension(svgElement.getAttribute('height') || '100%');
    
    // Create canvas and render SVG
    const canvas = await this.renderSvgToCanvas(svgElement, width, height);
    
    return {
      width,
      height,
      layers: [{
        name: 'SVG Import',
        x: 0,
        y: 0,
        opacity: 1,
        blendMode: 'normal',
        canvas,
        visible: true,
        locked: false,
      }],
      metadata: {
        format: 'svg',
        colorSpace: 'RGB',
        bitDepth: 32,
        vectorData: svgText, // Store original SVG for potential export
      },
    };
  }
  
  private async renderSvgToCanvas(svgElement: SVGElement, width: number, height: number): Promise<HTMLCanvasElement> {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    
    // Create Image from SVG
    const svgBlob = new Blob([new XMLSerializer().serializeToString(svgElement)], {
      type: 'image/svg+xml;charset=utf-8'
    });
    const url = URL.createObjectURL(svgBlob);
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);
        resolve(canvas);
      };
      img.onerror = reject;
      img.src = url;
    });
  }
  
  private parseDimension(value: string): number {
    if (value.endsWith('%')) {
      // Use default size for percentage
      return 1024;
    }
    if (value.endsWith('px')) {
      return parseFloat(value);
    }
    if (value.endsWith('em') || value.endsWith('rem')) {
      return parseFloat(value) * 16; // Assume 16px base
    }
    if (value.endsWith('pt')) {
      return parseFloat(value) * 1.333;
    }
    return parseFloat(value) || 1024;
  }
}
```

### Step 2: SVG Export (#1082)
```typescript
// File: packages/hcie-io/src/formats/svg/svg-writer.ts

export class SvgWriter {
  async write(image: DecodedImage): Promise<ArrayBuffer> {
    // Composite all layers into single image
    const compositeCanvas = await this.compositeLayers(image);
    
    // Convert to PNG data URL
    const pngDataUrl = compositeCanvas.toDataURL('image/png');
    
    // Create SVG with embedded PNG
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" 
     xmlns:xlink="http://www.w3.org/1999/xlink"
     width="${image.width}" 
     height="${image.height}"
     viewBox="0 0 ${image.width} ${image.height}">
  <image 
    width="${image.width}" 
    height="${image.height}" 
    xlink:href="${pngDataUrl}" />
</svg>`;
    
    return new TextEncoder().encode(svgContent).buffer;
  }
  
  private async compositeLayers(image: DecodedImage): Promise<HTMLCanvasElement> {
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d')!;
    
    // Draw background (white or transparent)
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Composite all layers
    for (const layer of image.layers) {
      if (!layer.visible) continue;
      
      ctx.globalAlpha = layer.opacity;
      ctx.globalCompositeOperation = layer.blendMode as GlobalCompositeOperation;
      ctx.drawImage(
        layer.canvas as HTMLCanvasElement,
        layer.x,
        layer.y
      );
    }
    
    return canvas;
  }
}
```

### Step 3: SVG Workspace (#1080)
```typescript
// File: apps/workspaces/svg-workspace.ts

export const SVG_WORKSPACE: WorkspaceMode = {
  id: 'svg',
  name: 'SVG Editor',
  icon: 'vector',
  canvasConfig: {
    allowNonSquare: true,
    standardSizes: [
      { width: 512, height: 512 },
      { width: 1024, height: 1024 },
      { width: 1920, height: 1080 },
      { width: 800, height: 600 },
    ],
    defaultSize: { width: 512, height: 512 },
    zoomLevels: [0.25, 0.5, 1, 2, 4, 8],
    gridEnabled: true,
    snapToGrid: true,
    showBounds: true,
  },
  availableTools: [
    'select',
    'move',
    'zoom',
    'shape-rect',
    'shape-ellipse',
    'shape-polygon',
    'pen',          // Future: bezier curves
    'text',         // Future: text tool
    'fill',
    'stroke',       // Future: stroke settings
    'gradient',     // Future: gradient tool
  ],
  panels: [
    { id: 'layers', type: 'standard', position: 'right' },
    { id: 'properties', type: 'custom', position: 'right' }, // Fill, stroke, etc.
    { id: 'colors', type: 'standard', position: 'left' },
    { id: 'tools', type: 'standard', position: 'left' },
    { id: 'svg-tree', type: 'custom', position: 'bottom' }, // SVG element tree
    { id: 'export-options', type: 'custom', position: 'bottom' },
  ],
  exportPresets: [
    { name: 'SVG (Embedded PNG)', format: 'svg', embed: 'png' },
    { name: 'SVG (Optimized)', format: 'svg', optimize: true },
    { name: 'PNG @1x', format: 'png', scale: 1 },
    { name: 'PNG @2x', format: 'png', scale: 2 },
    { name: 'PNG @4x', format: 'png', scale: 4 },
  ],
};
```

### Step 4: SVG Properties Panel
```typescript
// File: apps/panels/svg-properties-panel.ts

export class SvgPropertiesPanel {
  render(element: SVGGElement | SVGPathElement | any): HTMLElement {
    const container = document.createElement('div');
    container.className = 'svg-properties';
    
    // Fill color
    const fillSection = this.createColorPicker('Fill', element.style.fill || '#000000');
    container.appendChild(fillSection);
    
    // Stroke color
    const strokeSection = this.createColorPicker('Stroke', element.style.stroke || 'none');
    container.appendChild(strokeSection);
    
    // Stroke width
    const strokeWidthSection = this.createSlider('Stroke Width', 
      parseFloat(element.style.strokeWidth) || 1, 
      0, 100, 1
    );
    container.appendChild(strokeWidthSection);
    
    // Opacity
    const opacitySection = this.createSlider('Opacity',
      parseFloat(element.style.opacity) || 1,
      0, 1, 0.01
    );
    container.appendChild(opacitySection);
    
    return container;
  }
  
  private createColorPicker(label: string, value: string): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = 'property-row';
    
    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    
    const input = document.createElement('input');
    input.type = 'color';
    input.value = value === 'none' ? '#000000' : value;
    
    wrapper.appendChild(labelEl);
    wrapper.appendChild(input);
    
    return wrapper;
  }
  
  private createSlider(label: string, value: number, min: number, max: number, step: number): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = 'property-row';
    
    const labelEl = document.createElement('label');
    labelEl.textContent = label;
    
    const input = document.createElement('input');
    input.type = 'range';
    input.min = min.toString();
    input.max = max.toString();
    input.step = step.toString();
    input.value = value.toString();
    
    const valueDisplay = document.createElement('span');
    valueDisplay.textContent = value.toString();
    
    input.addEventListener('input', () => {
      valueDisplay.textContent = input.value;
    });
    
    wrapper.appendChild(labelEl);
    wrapper.appendChild(input);
    wrapper.appendChild(valueDisplay);
    
    return wrapper;
  }
}
```

### Step 5: CSS Styling
```css
/* File: apps/styles/svg-workspace.css */

.svg-workspace {
  --vector-stroke-color: #3b82f6;
  --vector-fill-color: rgba(59, 130, 246, 0.2);
  --vector-handle-color: #ffffff;
  --vector-handle-border: #1d4ed8;
}

.svg-workspace .canvas-container {
  background: repeating-conic-gradient(
    var(--bg-surface) 0% 25%,
    var(--bg-panel) 0% 50%
  ) 50% / 20px 20px;
}

.svg-element-selected {
  outline: 2px solid var(--vector-stroke-color);
  outline-offset: 2px;
}

.vector-handle {
  width: 8px;
  height: 8px;
  background: var(--vector-handle-color);
  border: 2px solid var(--vector-handle-border);
  border-radius: 50%;
  position: absolute;
  transform: translate(-50%, -50%);
  cursor: pointer;
}

.property-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid var(--border-color);
}

.property-row label {
  font-size: 12px;
  color: var(--text-muted);
  flex: 1;
}

.property-row input[type="color"] {
  width: 40px;
  height: 24px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 0;
  background: var(--bg-surface);
}

.property-row input[type="range"] {
  flex: 2;
  margin: 0 8px;
}

.property-row span {
  font-size: 11px;
  color: var(--text-muted);
  min-width: 40px;
  text-align: right;
}

#svg-tree-panel {
  font-family: monospace;
  font-size: 11px;
}

.svg-tree-item {
  padding: 4px 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.svg-tree-item:hover {
  background: var(--bg-hover);
}

.svg-tree-item.selected {
  background: var(--accent-color);
  color: white;
}

.svg-tree-icon {
  width: 12px;
  height: 12px;
  opacity: 0.7;
}
```

## Verification Plan

### Manual Tests
1. Import various SVG files (simple shapes, complex paths, text)
2. Verify rendering accuracy
3. Edit in HCIE
4. Export as SVG
5. Open exported SVG in browser/vector editor
6. Test export presets (PNG @1x, @2x, @4x)

### Automated Tests
- Parse known SVG test files
- Validate XML structure after export
- Test dimension preservation

## Dependencies
- Browser SVG rendering engine
- Canvas API
- Existing format interface (#1006)

## Risks & Mitigation
| Risk | Impact | Mitigation |
|------|--------|------------|
| Complex SVG features unsupported | High | Rasterize on import, document limitations |
| Text rendering issues | Medium | Convert text to paths or raster |
| Performance on large SVGs | Medium | Limit max render size |
| Loss of vector data on export | High | Warn user, offer PNG export alternative |

## Timeline Estimate
- Import implementation: 1 day
- Export implementation: 1 day
- Workspace setup: 1 day
- Properties panel: 1 day
- Testing: 0.5 days
- **Total**: 4.5 days

## Success Criteria
✅ Import SVG files renders correctly
✅ Export generates valid SVG
✅ Dedicated workspace available
✅ Properties panel functional
✅ Multiple export formats work

---

**Status**: ⚪ Backlog  
**Priority**: MEDIUM (Phase 1B - After core formats)  
**Dependencies**: plan_1006_format_interface.md  
**Next Action**: Implement after ICO workspace is complete
