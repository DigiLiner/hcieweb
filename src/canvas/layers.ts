import { g, layers, LayerClass, Tool } from '../core/globals';
import { Point, Shape } from '../core/types';
import { LayerAddAction, LayerDeleteAction, LayerMoveAction, LayerPropertyAction } from '../core/history';
import { drawSelectionBorder } from '../tools/selection';

const ctx = (document.getElementById("drawingCanvas") as HTMLCanvasElement)?.getContext("2d");
const originalCanvas = document.getElementById('originalCanvas') as HTMLCanvasElement | null;

/**
 * Layer Manager
 * Handles layer operations: add, delete, select, visibility, reorder, render
 */

// ─── Layer Operations ─────────────────────────────────────

/**
 * Add a new layer above the active layer
 */
export function addLayer(name?: string) {
    const idx = g.activeLayerIndex + 1;
    const layerName = name || `Layer ${layers.length}`;
    const newLayer = new LayerClass(layerName);

    // Check if we want a vector layer (simple check for now, can be expanded)
    if (name && name.toLowerCase().includes('vector')) {
        newLayer.type = 'vector';
        newLayer.shapes = []; // Array to hold shape objects
    }

    layers.splice(idx, 0, newLayer);
    g.activeLayerIndex = idx;

    if (window.historyManager) {
        window.historyManager.push(new LayerAddAction(idx, newLayer));
    }

    renderLayers();
    updateLayerPanel();
    console.log(`Added layer "${layerName}" at index ${idx}`);
}

export function addVectorLayer() {
    addLayer("Vector Layer");
}

/**
 * Delete the active layer (prevents deleting the last layer)
 */
export function deleteLayer() {
    if (layers.length <= 1) {
        console.warn("Cannot delete the last layer");
        return;
    }
    const layerToDelete = layers[g.activeLayerIndex];
    const index = g.activeLayerIndex;

    const removed = layers.splice(g.activeLayerIndex, 1);

    if (window.historyManager) {
        window.historyManager.push(new LayerDeleteAction(index, layerToDelete));
    }

    console.log(`Deleted layer "${removed[0].name}"`);
    // Adjust active index
    if (g.activeLayerIndex >= layers.length) {
        g.activeLayerIndex = layers.length - 1;
    }
    renderLayers();
    updateLayerPanel();
}

/**
 * Select a layer by index
 */
export function selectLayer(index: number) {
    if (index < 0 || index >= layers.length) {
        console.error(`Layer index ${index} out of range`);
        return;
    }
    g.activeLayerIndex = index;
    updateLayerPanel();
    console.log(`Selected layer "${layers[index].name}" (index ${index})`);
}

/**
 * Toggle visibility of a layer
 */
export function toggleLayerVisibility(index: number) {
    if (index < 0 || index >= layers.length) return;

    const oldValue = layers[index].visible;
    layers[index].visible = !layers[index].visible;
    const newValue = layers[index].visible;

    if (window.historyManager) {
        window.historyManager.push(new LayerPropertyAction(index, 'visible', oldValue, newValue));
    }

    renderLayers();
    updateLayerPanel();
}

/**
 * Move a layer from one position to another
 */
export function moveLayer(fromIndex: number, toIndex: number, skipRecord = false) {
    if (fromIndex < 0 || fromIndex >= layers.length) return;
    if (toIndex < 0 || toIndex >= layers.length) return;

    if (!skipRecord && window.historyManager) {
        window.historyManager.push(new LayerMoveAction(fromIndex, toIndex));
    }

    const [layer] = layers.splice(fromIndex, 1);
    layers.splice(toIndex, 0, layer);

    // Update active index to follow the moved layer
    if (g.activeLayerIndex === fromIndex) {
        g.activeLayerIndex = toIndex;
    } else if (fromIndex < g.activeLayerIndex && toIndex >= g.activeLayerIndex) {
        g.activeLayerIndex--;
    } else if (fromIndex > g.activeLayerIndex && toIndex <= g.activeLayerIndex) {
        g.activeLayerIndex++;
    }
    renderLayers();
    updateLayerPanel();
}

/**
 * Move active layer up (visually higher = later in array)
 */
export function moveLayerUp() {
    if (g.activeLayerIndex < layers.length - 1) {
        moveLayer(g.activeLayerIndex, g.activeLayerIndex + 1);
    }
}

/**
 * Move active layer down (visually lower = earlier in array)
 */
export function moveLayerDown() {
    if (g.activeLayerIndex > 0) {
        moveLayer(g.activeLayerIndex, g.activeLayerIndex - 1);
    }
}

/**
 * Rename a layer
 */
export function renameLayer(index: number, newName: string) {
    if (index < 0 || index >= layers.length) return;

    const oldName = layers[index].name;
    layers[index].name = newName;

    if (window.historyManager && oldName !== newName) {
        window.historyManager.push(new LayerPropertyAction(index, 'name', oldName, newName));
    }

    updateLayerPanel();
}


// ─── Rendering ─────────────────────────────────────────────

/**
 * Composite all visible layers onto the drawing canvas (bottom to top)
 * @param {HTMLCanvasElement} [liveCanvas] - Optional temp canvas for the active layer (used during drawing)
 */
export function renderLayers(liveCanvas?: HTMLCanvasElement) {
    if (!ctx) return;

    // Clear the display canvas
    ctx.clearRect(0, 0, g.image_width, g.image_height);

    // Composite each visible layer
    for (let i = 0; i < layers.length; i++) {
        const layer = layers[i];
        if (!layer.visible) continue;

        ctx.save();
        ctx.globalAlpha = layer.opacity;
        ctx.globalCompositeOperation = layer.blendMode;

        // Draw the permanent layer content (raster pixels)
        const isEraser = typeof Tool !== 'undefined' && g.current_tool.id === Tool.Eraser.id;
        if (!isEraser || !liveCanvas || i !== g.activeLayerIndex) {
            ctx.drawImage(layer.canvas as HTMLCanvasElement, 0, 0);
        }

        // Render shapes for THIS layer (if any exist)
        if (layer.shapes && layer.shapes.length > 0) {
            drawShapesToCtx(ctx, layer.shapes);
        }

        // ✨ AI ARCHITECTURE NOTE: Live Vector Drawing Preview
        // We draw the 'in-progress' vector shape directly from the manager to avoid rasterizing
        // every frame into tempCanvas. This prevents 'ghosting' artifacts.
        const vtm = (window as any).vectorToolManager;
        if (vtm && vtm.isDrawing && vtm.currentShape && i === g.activeLayerIndex) {
            drawShapesToCtx(ctx, [vtm.currentShape]);
        }

        // If this is the active layer and we are drawing (liveCanvas exists),
        // draw the temporary stroke ON TOP of everything.
        if (liveCanvas && i === g.activeLayerIndex) {
            // Apply selection mask to the live preview if active
            if (g.isSelectionActive && g.selectionCanvas) {
                // Persistent buffer to avoid allocation overhead during mousemove
                if (!(window as any)._maskedStrokeBuffer) {
                    (window as any)._maskedStrokeBuffer = g.createCanvas(g.image_width, g.image_height);
                }
                const offCanvas = (window as any)._maskedStrokeBuffer;
                if (offCanvas.width !== g.image_width || offCanvas.height !== g.image_height) {
                    offCanvas.width = g.image_width;
                    offCanvas.height = g.image_height;
                }
                
                const offCtx = offCanvas.getContext("2d");
                offCtx.clearRect(0, 0, g.image_width, g.image_height);
                
                // Copy stroke to buffer
                offCtx.globalAlpha = 1.0;
                offCtx.globalCompositeOperation = "source-over";
                offCtx.drawImage(liveCanvas, 0, 0);
                
                // Apply mask
                offCtx.globalCompositeOperation = "destination-in";
                offCtx.drawImage(g.selectionCanvas as HTMLCanvasElement, 0, 0);
                
                // Draw masked result (inherits layer's alpha/blend from current ctx state)
                ctx.drawImage(offCanvas, 0, 0);
            } else {
                ctx.drawImage(liveCanvas, 0, 0);
            }
        }

        ctx.restore();
    }

    // Draw Floating Selection Content (Move Content tool)
    if (g.floatingContent && g.floatingContent.canvas) {
        ctx.save();
        ctx.drawImage(g.floatingContent.canvas as HTMLCanvasElement, g.floatingContent.x, g.floatingContent.y);
        ctx.restore();
    }

    // Draw Selection Border (Marching Ants) if active
    drawSelectionBorder(ctx);

    // Also update originalCanvas to match the composite (for tools that read from it)
    if (!liveCanvas && originalCanvas) {
        const origCtx = originalCanvas.getContext("2d");
        if (origCtx) {
            origCtx.clearRect(0, 0, g.image_width, g.image_height);
            origCtx.drawImage(ctx.canvas, 0, 0);
        }
    }
}

/**
 * Helper to draw an array of shapes to a specific context.
 */
export function drawShapesToCtx(targetCtx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, shapes: Shape[]) {
    if (!shapes || shapes.length === 0) return;

    targetCtx.save();
    shapes.forEach(shape => {
        targetCtx.save();

        // Setup style
        const lineWidth = shape.style.width || 1;
        const strokeColor = shape.style.color || '#000';
        targetCtx.lineWidth = lineWidth;
        targetCtx.strokeStyle = strokeColor;
        targetCtx.globalAlpha = shape.style.opacity !== undefined ? shape.style.opacity : 1.0;
        targetCtx.lineCap = shape.style.cap || 'round';

        // Hardness: 1 = sharp edge, 0 = soft (blurred) edge; applied via shadowBlur for vector strokes
        const hardness = shape.style.hardness !== undefined ? shape.style.hardness : 1.0;
        if (hardness < 1.0) {
            const maxBlur = Math.max(2, lineWidth / 2);
            targetCtx.shadowBlur = (1.0 - hardness) * maxBlur;
            targetCtx.shadowColor = strokeColor;
        }

        if (shape.style.fillColor) {
            targetCtx.fillStyle = shape.style.fillColor;
        }

        targetCtx.beginPath();
        switch (shape.type) {
            case 'line':
                targetCtx.moveTo(shape.x1, shape.y1);
                targetCtx.lineTo(shape.x2, shape.y2);
                targetCtx.stroke();
                break;
            case 'rect': {
                const w = shape.x2 - shape.x1;
                const h = shape.y2 - shape.y1;
                targetCtx.rect(shape.x1, shape.y1, w, h);
                if (shape.style.fill) targetCtx.fill();
                targetCtx.stroke();
                break;
            }
            case 'circle': {
                const radius = Math.hypot(shape.x2 - shape.x1, shape.y2 - shape.y1);
                targetCtx.arc(shape.x1, shape.y1, radius, 0, 2 * Math.PI);
                if (shape.style.fill) targetCtx.fill();
                targetCtx.stroke();
                break;
            }
            case 'ellipse': {
                const centerX = (shape.x1 + shape.x2) / 2;
                const centerY = (shape.y1 + shape.y2) / 2;
                const radiusX = Math.abs(shape.x2 - shape.x1) / 2;
                const radiusY = Math.abs(shape.y2 - shape.y1) / 2;
                targetCtx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
                if (shape.style.fill) targetCtx.fill();
                targetCtx.stroke();
                break;
            }
            case 'roundrect': {
                const rw = shape.x2 - shape.x1;
                const rh = shape.y2 - shape.y1;
                const rr = shape.style.cornerRadius || 10;
                if (typeof (targetCtx as any).roundRect === 'function') {
                    (targetCtx as any).roundRect(shape.x1, shape.y1, rw, rh, rr);
                } else {
                    const x = shape.x1, y = shape.y1, w = rw, h = rh, r = rr;
                    targetCtx.moveTo(x + r, y);
                    targetCtx.lineTo(x + w - r, y);
                    targetCtx.quadraticCurveTo(x + w, y, x + w, y + r);
                    targetCtx.lineTo(x + w, y + h - r);
                    targetCtx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
                    targetCtx.lineTo(x + r, y + h);
                    targetCtx.quadraticCurveTo(x, y + h, x, y + h - r);
                    targetCtx.lineTo(x, y + r);
                    targetCtx.quadraticCurveTo(x, y, x + r, y);
                }
                if (shape.style.fill) targetCtx.fill();
                targetCtx.stroke();
                break;
            }
        }

        targetCtx.restore();
    });
    targetCtx.restore();
}

/**
 * Get the active layer object
 */
export function getActiveLayer() {
    return layers[g.activeLayerIndex] || null;
}

// ─── Layer Panel UI ────────────────────────────────────────

/**
 * Update the Layers panel UI to reflect current layer state
 */
export function updateLayerPanel() {
    const layersList = document.querySelector('#layers-pane .layers-list');
    if (!layersList) return;

    layersList.innerHTML = '';

    // Render layers in reverse order (top layer first in the panel)
    for (let i = layers.length - 1; i >= 0; i--) {
        const layer = layers[i];
        const item = document.createElement('div');
        item.className = `layer-item${i === g.activeLayerIndex ? ' selected' : ''}`;
        item.dataset.index = i.toString();

        // Visibility toggle
        const visIcon = document.createElement('span');
        visIcon.className = `layer-icon${layer.visible ? ' active' : ''}`;
        visIcon.title = layer.visible ? 'Visible' : 'Hidden';
        visIcon.textContent = layer.visible ? '👁' : '·';
        visIcon.style.cursor = 'pointer';
        visIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleLayerVisibility(i);
        });

        // Thumbnail
        const thumb = document.createElement('div');
        thumb.className = 'layer-thumbnail';
        // Draw a small preview of the layer
        const thumbCanvas = document.createElement('canvas');
        thumbCanvas.width = 32;
        thumbCanvas.height = 32;
        const thumbCtx = thumbCanvas.getContext('2d');
        if (thumbCtx) {
            thumbCtx.drawImage(layer.canvas as HTMLCanvasElement, 0, 0, g.image_width, g.image_height, 0, 0, 32, 32);
        }
        thumb.appendChild(thumbCanvas);

        // Name (editable on double-click)
        const nameDiv = document.createElement('div');
        nameDiv.className = 'layer-name';
        nameDiv.textContent = layer.name;
        nameDiv.addEventListener('dblclick', (e: MouseEvent) => {
            e.stopPropagation();
            const input = document.createElement('input');
            input.type = 'text';
            input.value = layer.name;
            input.className = 'layer-name-input';
            input.style.cssText = 'width: 100%; font-size: 11px; border: 1px solid #5b9bd5; padding: 1px 3px; background: #fff;';
            nameDiv.replaceWith(input);
            input.focus();
            input.select();
            const finish = () => {
                renameLayer(i, input.value || layer.name);
            };
            input.addEventListener('blur', finish);
            input.addEventListener('keydown', (ke: KeyboardEvent) => {
                if (ke.key === 'Enter') finish();
                if (ke.key === 'Escape') {
                    input.value = layer.name;
                    finish();
                }
            });
        });

        // Lock indicator
        const lockIcon = document.createElement('span');
        lockIcon.className = 'layer-icon';
        lockIcon.title = layer.locked ? 'Locked' : 'Unlocked';
        lockIcon.textContent = layer.locked ? '🔒' : '';
        lockIcon.style.cursor = 'pointer';
        lockIcon.addEventListener('click', (e: MouseEvent) => {
            e.stopPropagation();
            layers[i].locked = !layers[i].locked;
            updateLayerPanel();
        });

        // Blend Mode Dropdown
        const blendSelect = document.createElement('select');
        blendSelect.className = 'layer-blend-mode';
        blendSelect.style.cssText = 'font-size: 10px; margin-left: 5px; width: 60px;';

        const modes = [
            'source-over', 'multiply', 'screen', 'overlay', 'darken', 'lighten',
            'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference',
            'exclusion', 'hue', 'saturation', 'color', 'luminosity'
        ];

        // Map internal names to display names if needed (e.g. source-over -> Normal)
        const displayNames: Record<string, string> = {
            'source-over': 'Normal',
            'color-dodge': 'Color Dodge',
            'color-burn': 'Color Burn',
            'hard-light': 'Hard Light',
            'soft-light': 'Soft Light'
        };

        modes.forEach(mode => {
            const option = document.createElement('option');
            option.value = mode;
            option.textContent = displayNames[mode] || mode.charAt(0).toUpperCase() + mode.slice(1);
            if (layer.blendMode === mode) option.selected = true;
            blendSelect.appendChild(option);
        });

        const stopProp = (e: Event) => e.stopPropagation();
        blendSelect.addEventListener('mousedown', (e: MouseEvent) => {
            e.stopPropagation();
            // Capture initial value for history
            (blendSelect as any).dataset.startValue = layers[i].blendMode;
        });
        blendSelect.addEventListener('mouseup', stopProp);
        blendSelect.addEventListener('click', stopProp);

        // Handle change
        blendSelect.addEventListener('change', (e: Event) => {
            e.stopPropagation();
            const newValue = (e.target as HTMLSelectElement).value;
            const startValue = (blendSelect as any).dataset.startValue || layers[i].blendMode;

            if (window.historyManager && startValue !== newValue) {
                window.historyManager.push(new LayerPropertyAction(i, 'blendMode', startValue as any, newValue as any));
            }

            layers[i].blendMode = newValue as any;
            renderLayers();
        });


        // Click to select layer
        item.addEventListener('click', () => {
            selectLayer(i);
        });

        item.appendChild(visIcon);
        item.appendChild(thumb);
        item.appendChild(nameDiv);
        item.appendChild(blendSelect); // Add dropdown
        item.appendChild(lockIcon);
        layersList.appendChild(item);
    }

    // Update layer opacity slider if it exists
    const layerOpacitySlider = document.getElementById('layerOpacity') as HTMLInputElement;
    if (layerOpacitySlider) {
        layerOpacitySlider.value = Math.round(layers[g.activeLayerIndex].opacity * 100).toString();
    }
}

// ─── Initialization ────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
    // Wire up layer panel buttons
    const addLayerBtn = document.querySelector('.panel-footer-btn[title="Add Layer"]');
    const deleteLayerBtn = document.querySelector('.panel-footer-btn[title="Delete Layer"]');
    const moveUpBtn = document.querySelector('.panel-footer-btn[title="Move Up"]');
    const moveDownBtn = document.querySelector('.panel-footer-btn[title="Move Down"]');

    if (addLayerBtn) {
        addLayerBtn.addEventListener('click', () => addLayer());
    }
    if (deleteLayerBtn) {
        deleteLayerBtn.addEventListener('click', () => deleteLayer());
    }
    if (moveUpBtn) {
        moveUpBtn.addEventListener('click', () => moveLayerUp());
    }
    if (moveDownBtn) {
        moveDownBtn.addEventListener('click', () => moveLayerDown());
    }

    // Layer Opacity Slider
    const layerOpacitySlider = document.getElementById('layerOpacity') as HTMLInputElement;
    if (layerOpacitySlider) {
        layerOpacitySlider.addEventListener('input', (e: Event) => {
            const val = parseInt((e.target as HTMLInputElement).value);
            const layer = layers[g.activeLayerIndex];
            if (layer) {
                layer.opacity = val / 100;
                renderLayers();
            }
        });

        let startOpacity = 1.0;
        layerOpacitySlider.addEventListener('mousedown', () => {
            const layer = layers[g.activeLayerIndex];
            if (layer) startOpacity = layer.opacity;
        });

        layerOpacitySlider.addEventListener('change', () => {
            const layer = layers[g.activeLayerIndex];
            if (layer && window.historyManager) {
                window.historyManager.push(new LayerPropertyAction(g.activeLayerIndex, 'opacity', startOpacity, layer.opacity));
            }
        });
    }

    // Initial render of the layer panel
    setTimeout(() => {
        updateLayerPanel();
    }, 100);

    console.log('Layers manager initialized');
});

export function renderVectorLayer(layer: LayerClass) {
    if (!layer) return;

    if (layer.type === 'vector') {
        const ctx: any = layer.ctx;
        ctx.clearRect(0, 0, (layer.canvas as any).width, (layer.canvas as any).height);
        drawShapesToCtx(ctx, layer.shapes || []);
    }
}

export function renderTextLayer(layer: LayerClass) {
    if (!layer || layer.type !== 'text') return;

    const ctx: any = layer.ctx;
    const data = layer.textData;

    ctx.clearRect(0, 0, (layer.canvas as any).width, (layer.canvas as any).height);

    if (layer.isBeingEdited) return; // Hide text while editing to avoid ghosting


    ctx.save();
    const style = data.italic ? 'italic' : 'normal';
    const weight = data.bold ? 'bold' : 'normal';
    ctx.font = `${style} ${weight} ${data.size}px ${data.font}, "Roboto", sans-serif`;
    ctx.fillStyle = data.color;
    ctx.textBaseline = 'top';

    const lines = (data.text || "").split('\n');
    const lineHeight = data.size * 1.2;

    lines.forEach((line: string, index: number) => {
        ctx.fillText(line, data.x, data.y + (index * lineHeight));
    });
    ctx.restore();
}
