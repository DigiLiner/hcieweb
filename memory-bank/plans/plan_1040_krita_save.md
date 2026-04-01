# Plan #1040 – Krita (.kra) Save/Export Support

## Goal
Implement full .kra file writing capability, allowing users to save their work in Krita's native layered format.

## Status
- [ ] ⚪ Backlog
- [ ] 🔴 In Progress  
- [ ] 🟢 Completed

## Background
Reading support (#1051) is already implemented. This task focuses on the **write/export** direction.

## Architecture

### KRA File Structure
```
.kra file (ZIP archive)
├── mimetype              # "application/x-krita"
├── maindoc.xml           # Document metadata, layer hierarchy
├── preview.png           # Thumbnail preview
└── data/                 # Layer pixel data
    ├── layer0.png        # Layer 1 (bottom)
    ├── layer1.png        # Layer 2
    └── layer2.png        # Layer 3 (top)
```

### maindoc.xml Structure
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE DOC []>
<DOC version="1.0" type="Krita">
  <IMAGE width="1920" height="1080" colorspace="RGB" profile="sRGB-elle-V2-srgbtrc.icc">
    <LAYER name="Background" opacity="255" compositeop="srcover" visible="1">
      <FILENAME>layer0.png</FILENAME>
    </LAYER>
    <LAYER name="Layer 1" opacity="255" compositeop="srcover" visible="1">
      <FILENAME>layer1.png</FILENAME>
    </LAYER>
  </IMAGE>
</DOC>
```

## Implementation Strategy

### Step 1: Document Serializer
```typescript
// File: packages/hcie-io/src/formats/krita/krita-writer.ts

import { DecodedImage, LayerData } from '../types';
import { zip } from '../../utils/zip-utils';

export class KritaWriter {
  async write(image: DecodedImage): Promise<ArrayBuffer> {
    const files: Map<string, Uint8Array> = new Map();
    
    // Add mimetype (must be first, uncompressed)
    files.set('mimetype', new TextEncoder().encode('application/x-krita'));
    
    // Generate layer PNG files
    const layerFiles = await this.generateLayerFiles(image.layers);
    for (const [name, data] of layerFiles) {
      files.set(`data/${name}`, data);
    }
    
    // Generate maindoc.xml
    const xmlDoc = this.generateMainDocXML(image);
    files.set('maindoc.xml', new TextEncoder().encode(xmlDoc));
    
    // Generate preview.png
    const preview = await this.generatePreview(image);
    files.set('preview.png', preview);
    
    // ZIP everything
    return await zip(files);
  }
  
  private generateLayerFiles(layers: LayerData[]): Promise<Map<string, Uint8Array>> {
    // Convert each layer to PNG
    // Handle transparency, blend modes
  }
  
  private generateMainDocXML(image: DecodedImage): string {
    // Build XML document with layer hierarchy
  }
  
  private async generatePreview(image: DecodedImage): Promise<Uint8Array> {
    // Create thumbnail (256x256 max)
  }
}
```

### Step 2: Blend Mode Mapping
```typescript
// Map HCIE blend modes to Krita composite operations
const BLEND_MODE_MAP: Record<string, string> = {
  'normal': 'srcover',
  'multiply': 'multiply',
  'screen': 'screen',
  'overlay': 'overlay',
  'darken': 'darken',
  'lighten': 'lighten',
  'color-dodge': 'color-dodge',
  'color-burn': 'color-burn',
  'hard-light': 'hard-light',
  'soft-light': 'soft-light',
  'difference': 'difference',
  'exclusion': 'exclusion',
  'hue': 'hue',
  'saturation': 'saturation',
  'color': 'color',
  'luminosity': 'luminosity',
};
```

### Step 3: Color Profile Handling
- Embed sRGB ICC profile (required by Krita)
- Store colorspace metadata in maindoc.xml
- Handle RGBA vs RGB conversion

## Verification Plan

### Manual Tests
1. Save a multi-layer document as .kra
2. Open in Krita - verify layers appear correctly
3. Edit in Krita, save, reopen in HCIE
4. Test with various blend modes
5. Test with transparency

### Automated Tests
- Round-trip test: HCIE → KRA → HCIE
- Validate ZIP structure
- Validate XML schema

## Dependencies
- `jszip` or similar ZIP library
- PNG encoder (already available)
- ICC profile embedder

## Risks & Mitigation
| Risk | Impact | Mitigation |
|------|--------|------------|
| Krita version incompatibility | Medium | Use stable KRA v1.0 spec |
| Large file sizes | High | Optimize PNG compression |
| Missing blend mode support | Low | Fallback to 'normal' |
| Color profile issues | Medium | Always embed sRGB |

## Timeline Estimate
- XML generator: 1 day
- Layer PNG export: 1 day
- ZIP packaging: 0.5 days
- Testing: 0.5 days
- **Total**: 3 days

## Success Criteria
✅ Multi-layer .kra files save correctly
✅ Files open in Krita without errors
✅ Layer names, opacity, visibility preserved
✅ Blend modes mapped correctly
✅ Reasonable file sizes

---

**Status**: ⚪ Backlog  
**Priority**: HIGH (Phase 1A - Format Support)  
**Dependencies**: plan_1006_format_interface.md  
**Next Action**: Implement after base format interface is complete
