# Plan #1072 – Icon Editing Workspace Architecture

## Goal
Create a dedicated workspace mode optimized for icon editing, with specialized canvas behavior, toolset, and export options.

## Status
- [ ] ⚪ Backlog
- [ ] 🔴 In Progress
- [ ] 🟢 Completed

## Vision
When editing icons, users need:
- Pixel-perfect precision at small sizes
- Multiple size previews simultaneously
- Grid/magnification tools
- Specialized export presets
- Transparency visualization

## Architecture

### Workspace Modes
```typescript
// File: apps/workspaces/icon-workspace.ts

export interface WorkspaceMode {
  id: string;
  name: string;
  icon: string;
  canvasConfig: CanvasConfig;
  availableTools: string[];
  panels: PanelConfig[];
  exportPresets: ExportPreset[];
}

export const ICON_WORKSPACE: WorkspaceMode = {
  id: 'icon',
  name: 'Icon Editor',
  icon: 'icon-smile',
  canvasConfig: {
    allowNonSquare: false, // Icons must be square
    standardSizes: [16, 24, 32, 48, 64, 96, 128, 256],
    defaultSize: 64,
    zoomLevels: [1, 2, 4, 8, 16, 32], // Higher max zoom for pixel work
    gridEnabled: true,
    pixelGridThreshold: 4, // Show pixel grid at 4x zoom and above
  },
  availableTools: [
    'pencil',      // 1px hard brush
    'eraser',
    'fill',
    'picker',
    'select-rect',
    'move',
    'zoom',
    'magnifier',   // Special magnifier tool
  ],
  panels: [
    { id: 'size-preview', type: 'custom', position: 'right' },
    { id: 'layers', type: 'standard', position: 'right' },
    { id: 'colors', type: 'standard', position: 'left' },
    { id: 'tools', type: 'standard', position: 'left' },
    { id: 'export-options', type: 'custom', position: 'bottom' },
  ],
  exportPresets: [
    { name: 'Windows Icon', sizes: [16, 32, 48, 64, 128, 256], format: 'ico' },
    { name: 'Web Favicon', sizes: [16, 32, 48, 64], format: 'ico' },
    { name: 'PNG Set', sizes: [32, 64, 128, 256], format: 'png' },
    { name: 'Single Size', sizes: [], format: 'png', prompt: true },
  ],
};
```

### Multi-Size Preview Panel
```typescript
// File: apps/panels/size-preview-panel.ts

export class SizePreviewPanel {
  private previews: Map<number, HTMLCanvasElement> = new Map();
  
  constructor(private mainDocument: DecodedImage) {
    this.generatePreviews();
  }
  
  private generatePreviews(): void {
    const standardSizes = [16, 24, 32, 48, 64, 96, 128, 256];
    
    for (const size of standardSizes) {
      const preview = this.createPreview(size);
      this.previews.set(size, preview);
    }
    
    this.render();
  }
  
  private createPreview(size: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    canvas.className = 'icon-preview';
    canvas.dataset.size = size.toString();
    
    const ctx = canvas.getContext('2d')!;
    
    // Composite all layers
    for (const layer of this.mainDocument.layers) {
      ctx.globalAlpha = layer.opacity;
      ctx.globalCompositeOperation = layer.blendMode as GlobalCompositeOperation;
      
      // Scale drawing to fit preview size
      const scale = size / this.mainDocument.width;
      ctx.save();
      ctx.scale(scale, scale);
      ctx.drawImage(
        layer.canvas as HTMLCanvasElement,
        layer.x,
        layer.y
      );
      ctx.restore();
    }
    
    return canvas;
  }
  
  private render(): void {
    const container = document.getElementById('size-preview-panel');
    if (!container) return;
    
    container.innerHTML = '<h3>Preview Sizes</h3>';
    
    for (const [size, canvas] of this.previews) {
      const wrapper = document.createElement('div');
      wrapper.className = 'preview-item';
      
      const label = document.createElement('span');
      label.textContent = `${size}x${size}`;
      label.className = 'preview-label';
      
      wrapper.appendChild(label);
      wrapper.appendChild(canvas);
      container.appendChild(wrapper);
    }
  }
  
  public update(): void {
    // Regenerate all previews when main document changes
    this.generatePreviews();
  }
}
```

### Magnifier Tool
```typescript
// File: apps/tools/magnifier-tool.ts

export class MagnifierTool {
  private magnifierCanvas: HTMLCanvasElement;
  private magnifierSize = 150;
  private zoomLevel = 8;
  
  constructor() {
    this.magnifierCanvas = document.createElement('canvas');
    this.magnifierCanvas.width = this.magnifierSize;
    this.magnifierCanvas.height = this.magnifierSize;
    this.magnifierCanvas.className = 'magnifier-overlay';
    document.body.appendChild(this.magnifierCanvas);
  }
  
  onMouseMove(x: number, y: number, sourceCanvas: HTMLCanvasElement): void {
    const ctx = this.magnifierCanvas.getContext('2d')!;
    
    // Clear
    ctx.clearRect(0, 0, this.magnifierSize, this.magnifierSize);
    
    // Draw magnified area
    const sourceX = x - (this.magnifierSize / 2) / this.zoomLevel;
    const sourceY = y - (this.magnifierSize / 2) / this.zoomLevel;
    
    ctx.imageSmoothingEnabled = false; // Keep pixels sharp
    ctx.drawImage(
      sourceCanvas,
      sourceX, sourceY,
      this.magnifierSize / this.zoomLevel,
      this.magnifierSize / this.zoomLevel,
      0, 0,
      this.magnifierSize,
      this.magnifierSize
    );
    
    // Draw grid overlay
    this.drawPixelGrid(ctx);
    
    // Position magnifier near cursor
    this.magnifierCanvas.style.left = (x + 20) + 'px';
    this.magnifierCanvas.style.top = (y + 20) + 'px';
  }
  
  private drawPixelGrid(ctx: CanvasRenderingContext2D): void {
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.lineWidth = 1;
    
    const gridSize = this.magnifierSize / this.zoomLevel;
    
    for (let x = 0; x <= this.magnifierSize; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.magnifierSize);
      ctx.stroke();
    }
    
    for (let y = 0; y <= this.magnifierSize; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.magnifierSize, y);
      ctx.stroke();
    }
  }
  
  destroy(): void {
    this.magnifierCanvas.remove();
  }
}
```

### CSS Styling
```css
/* File: apps/styles/icon-workspace.css */

.icon-workspace {
  --pixel-grid-color: rgba(200, 200, 200, 0.3);
  --pixel-grid-size: 1px;
}

.icon-workspace .canvas-container.show-pixel-grid {
  background-image: 
    linear-gradient(var(--pixel-grid-color) 1px, transparent 1px),
    linear-gradient(90deg, var(--pixel-grid-color) 1px, transparent 1px);
  background-size: var(--pixel-grid-size) var(--pixel-grid-size);
}

.preview-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 8px 0;
  padding: 8px;
  background: var(--bg-panel);
  border-radius: 4px;
}

.preview-label {
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 4px;
}

.icon-preview {
  border: 1px solid var(--border-color);
  image-rendering: pixelated; /* Keep pixels sharp */
}

.magnifier-overlay {
  position: fixed;
  pointer-events: none;
  border: 2px solid var(--accent-color);
  border-radius: 50%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  image-rendering: pixelated;
}

.export-preset-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  margin: 4px 0;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
}

.export-preset-button:hover {
  background: var(--bg-hover);
}
```

## UI Layout

```
┌─────────────────────────────────────────────────────┐
│  [Tools]  │           CANVAS            │ [Layers]  │
│           │                             │           │
│  Pencil   │    ┌─────────────────┐     │ Size Prev │
│  Eraser   │    │                 │     │ 16x16     │
│  Fill     │    │    Main Icon    │     │ 32x32     │
│  Picker   │    │                 │     │ 48x48     │
│  Select   │    └─────────────────┘     │ 64x64     │
│  Move     │                            │ 128x128   │
│  Zoom     │                            │ 256x256   │
│           │                            │           │
│           │                            │ [Export]  │
│           │                            │ Windows   │
│  Colors   │                            │ Web       │
│           │                            │ PNG Set   │
└───────────┴────────────────────────────┴───────────┘
```

## Implementation Strategy

### Phase 1: Core Workspace Structure (Day 1)
- Create workspace mode definition
- Add workspace switcher UI
- Implement canvas config for icon mode

### Phase 2: Specialized Tools (Day 2)
- Implement magnifier tool
- Add pixel grid toggle
- Configure tool palette for icon work

### Phase 3: Preview Panel (Day 3)
- Build multi-size preview component
- Add real-time updates
- Style for dark/light themes

### Phase 4: Export Integration (Day 4)
- Create export preset system
- Connect to ICO/PNG exporters
- Add batch export functionality

## Verification Plan

### Manual Tests
1. Switch to icon workspace mode
2. Test magnifier tool at various zoom levels
3. Verify pixel grid visibility
4. Check multi-size preview accuracy
5. Test export presets
6. Verify tool availability

### User Acceptance Criteria
✅ Workspace switches correctly
✅ Magnifier shows sharp pixels
✅ Preview panel updates in real-time
✅ Export presets work as expected
✅ UI is clean and intuitive

## Dependencies
- Format exporters (#1070, #1071)
- Canvas rendering system
- Workspace management system

## Risks & Mitigation
| Risk | Impact | Mitigation |
|------|--------|------------|
| Performance with many previews | Medium | Lazy rendering, throttled updates |
| Complex state management | Medium | Use existing state system |
| UI clutter | Low | Clean, minimal design |

## Timeline Estimate
- Core structure: 1 day
- Tools: 1 day
- Preview panel: 1 day
- Export integration: 1 day
- **Total**: 4 days

## Success Criteria
✅ Dedicated icon workspace available
✅ Magnifier tool functional
✅ Multi-size previews accurate
✅ Export presets simplify workflow
✅ Pixel-perfect editing experience

---

**Status**: ⚪ Backlog  
**Priority**: MEDIUM (Phase 1B - After core formats)  
**Dependencies**: plan_1070_1071_ico_support.md  
**Next Action**: Implement after basic ICO import/export is working
