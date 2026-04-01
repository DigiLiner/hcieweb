# HC Image Editor - Menu Connection Analysis
*Report generated on: 2026-04-01 21:30*

This report analyzes the connection between UI menu items (in `index.html`) and their underlying implementation in the TypeScript codebase.

## 📊 Connection Summary Table

| Category | Menu Item | Bound Function (`onclick`) | Implementation Found | Description of Behavior | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **File** | New | `newCanvas()` | `openNewImageDialog` | Opens the "New Image" creation modal. | ✅ |
| | Open | `openImage()` | `handleOpenFile` | Opens native file picker to import images/projects. | ✅ |
| | Save | `saveProject()` | `handleSaveFile` | Saves current project as `.hcie`. | ✅ |
| | Save As... | `saveAsProject()` | `handleSaveAsFile` | Opens format selection (hcie, psd, png). | ✅ |
| | Export | `handleExportFile()` | `handleExportFile` | Directly exports active layer as `.png`. | ✅ |
| | Exit | `exitApp()` | `exitApp` | Closes application or exits in browser mode. | ✅ |
| **Edit** | Cut | `cutSelection()` | `cutSelection` | Copies and clears selection contents. | ✅ |
| | Copy | `copySelection()` | `copySelection` | Copies selected area to internal clipboard. | ✅ |
| | Paste | `pasteSelection()` | `pasteSelection` | Pastes clipboard as a floating content. | ✅ |
| | Undo | `undoImage()` | `undoImage` | Reverts last canvas action. | ✅ |
| | Redo | `redoImage()` | `redoImage` | Re-applies the next action in history. | ✅ |
| | Clear All | `clearCanvas()` | `clearCanvas` | Clears all pixels on the active layer. | ✅ |
| **Image** | Flip Horizontal | (None) | **EMPTY** | No function attached. | ⚪ IDLE |
| | Flip Vertical | (None) | **EMPTY** | No function attached. | ⚪ IDLE |
| | Negative / Invert | `applyFilter('negative')` | `applyFilter` | Inverts colors on current layer. | ✅ |
| | Grayscale | `applyFilter('grayscale')` | `applyFilter` | Converts layer to grayscale. | ✅ |
| | Sepia | `applyFilter('sepia')` | `applyFilter` | Applies sepia tone to current layer. | ✅ |
| | Rotate | (None) | **EMPTY** | No function attached. | ⚪ IDLE |
| | Crop | (None) | **EMPTY** | No function attached. | ⚪ IDLE |
| | Resize Image | (None) | **EMPTY** | No function attached. | ⚪ IDLE |
| | Resize Canvas | (None) | **EMPTY** | No function attached. | ⚪ IDLE |
| **Tools** | Draw Pen | `selectTool(Tool.Pen)` | `selectTool` | Sets Pen as the active tool. | ✅ |
| | Draw Line | `selectTool(Tool.Line)` | `selectTool` | Sets Line as the active tool. | ✅ |
| | Draw Rectangle | `selectTool(Tool.Rectangle)` | `selectTool` | Sets Rectangle as the active tool. | ✅ |
| | Draw Ellipse | `selectTool(Tool.Ellipse)` | `selectTool` | Sets Ellipse as the active tool. | ✅ |
| | Draw Text | `selectTool(Tool.Text)` | `selectTool` | Sets Text as the active tool. | ✅ |
| | Vector Selection | `selectTool(Tool.VectorSelect)` | `selectTool` | Sets Vector selection tool active. | ✅ |
| **Filter** | Soften | (None) | **EMPTY** | No function attached. | ⚪ IDLE |
| | Blur | `applyFilter('blur')` | `applyFilter` | Applies box blur to current layer. | ✅ |
| | Sharpen | (None) | **EMPTY** | No function attached. | ⚪ IDLE |
| | Emboss | (None) | **EMPTY** | No function attached. | ⚪ IDLE |
| | Edge Detect | (None) | **EMPTY** | No function attached. | ⚪ IDLE |
| | Add Noise | (None) | **EMPTY** | No function attached. | ⚪ IDLE |
| | Mosaic | `applyFilter('mosaic')` | `applyFilter` | Applies pixelation effect. | ✅ |
| | Oil Paint | (None) | **EMPTY** | No function attached. | ⚪ IDLE |
| | Vignette | (None) | **EMPTY** | No function attached. | ⚪ IDLE |
| | Erode Border | `window.showErodeBorderDialog()` | **EMPTY** | Function referenced in HTML but NOT DEFINED in code. | 🔴 BROKEN |
| | Fade Border | `window.showFadeBorderDialog()` | **EMPTY** | Function referenced in HTML but NOT DEFINED in code. | 🔴 BROKEN |
| **Select** | All | (None) | **EMPTY** | No function attached. | ⚪ IDLE |
| | Deselect | (None) | **EMPTY** | No function attached. | ⚪ IDLE |
| | Inverse | (None) | **EMPTY** | No function attached. | ⚪ IDLE |
| | Magic Wand | `selectTool(Tool.Wand)` | `selectTool` | Sets Wand tool active. | ✅ |
| **View** | Zoom In | `zoomIn()` | `zoomIn` | Increases canvas zoom level. | ✅ |
| | Zoom Out | `zoomOut()` | `zoomOut` | Decreases canvas zoom level. | ✅ |
| | Fit Screen | (None) | **EMPTY** | No function attached. | ⚪ IDLE |
| | Show Grid | (None) | **EMPTY** | No function attached. | ⚪ IDLE |
| | Show Rulers | (None) | **EMPTY** | No function attached. | ⚪ IDLE |
| **Help** | Documentation | (None) | **EMPTY** | No function attached. | ⚪ IDLE |
| | Keyboard Shortcuts | (None) | **EMPTY** | No function attached. | ⚪ IDLE |
| | About | (None) | **EMPTY** | No function attached. | ⚪ IDLE |

## 📝 Critical Observations

1.  **Missing Definitions (Runtime Errors)**:
    -   `window.showErodeBorderDialog()`
    -   `window.showFadeBorderDialog()`
    These will cause "Function not found" errors in the browser console if clicked, despite being in the HTML.

2.  **Duplicate Filters**:
    -   *Filter > Sepia/Grayscale* simply calls the same `applyFilter` as *Image > Negative/Invert*.

3.  **Idle Features**:
    -   The **Flip** and **Resize** operations in the *Image* menu are placeholders only.
    -   The **Select** menu is largely unimplemented (All/Deselect/Inverse).
    -   The **View** and **Help** menus are 90% empty placeholders.

## 🔨 Next Steps
- Implement `showErodeBorderDialog` and `showFadeBorderDialog` in `hcie-ui-components/src/dialog-handler.ts`.
- Map the remaining idle slots to core engine functions as they are developed.
