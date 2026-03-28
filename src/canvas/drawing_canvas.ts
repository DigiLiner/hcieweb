import { g, layers, LayerClass, Tool } from '../core/globals';
import { DrawAction } from '../core/history';
import { renderLayers, getActiveLayer, updateLayerPanel, drawShapesToCtx } from './layers';
import { tooltipManager } from '../ui/tooltip';
import { drawSpray } from '../tools/spray';
import { floodFill, FillTolerance } from '../tools/flood_fill';
import { 
    drawPen, drawLine, drawRect, drawCircle, drawBrush, drawEraser, drawRoundedRect, drawEllipse 
} from '../tools/painting_tools';
import { 
    magicWandSelection, buildRectSelection, buildEllipseSelection, buildLassoSelection, 
    isPointInSelection, moveSelectionMask, moveSelectionContent, drawSelectionBorder,
    getRectBorder, getEllipseBorder 
} from '../tools/selection';
import { convertPsdToLayers } from '../io/psd-handler';
import type { SelectionMode } from '../core/types';

declare global {
  var historyManager: any;
  var openImageFile: any;
  var saveImageAsPNG: any;
  var saveProject: any;
  var loadProject: any;
  var renderVectorLayer: any;
  var buildPolygonalSelection: any;
  var copySelection: any;
  var pasteSelection: any;
  var cutSelection: any;
  var selectAll: any;
  var deselect: any;
  var invertSelection: any;
  var updateOptionsBar: any;
  var undo: ImageData[];
  var polyPoints: any[];
  var lassoPoints: any[];
  
  interface Window {
    undoImage: () => void;
    redoImage: () => void;
    selectTool: (tool: any) => void;
    propertiesPanel?: { render: () => void };
  }
}

"use strict";
//Canvas container
// Set CSS variables for canvas size based on window size and other UI elements
const calculateScreenSize = () => {
    // Legacy support, mostly handled by CSS now
};
window.addEventListener("resize", calculateScreenSize);
calculateScreenSize();

// ─── Global References & State ─────────────────────────────
const can = document.getElementById("drawingCanvas") as HTMLCanvasElement;
export let originalCanvas: HTMLCanvasElement | null = document.getElementById("originalCanvas") as HTMLCanvasElement;
const initWrapper = document.getElementById("canvasWrapper");
const zoomCanvas = document.getElementById("zoomCanvas") as HTMLCanvasElement;
export let tempCanvas: HTMLCanvasElement | null = null;
export let tempCtx: CanvasRenderingContext2D | null = null;

/**
 * Robust color parser using a hidden canvas
 */
export function parseColorToRgba(colorStr: string, opacity: number = 1.0) {
    const tempCan = document.createElement('canvas');
    tempCan.width = tempCan.height = 1;
    const tCtx = tempCan.getContext('2d');
    if (!tCtx) return { r: 0, g: 0, b: 0, a: 255 };
    tCtx.fillStyle = colorStr;
    tCtx.fillRect(0, 0, 1, 1);
    const data = tCtx.getImageData(0, 0, 1, 1).data;
    return {
        r: data[0],
        g: data[1],
        b: data[2],
        a: Math.floor(opacity * 255)
    };
}


// Function to resize all canvases
export function resizeCanvas(width: number, height: number) {
    g.image_width = width;
    g.image_height = height;

    if (can) {
        can.width = width;
        can.height = height;
    }
    if (originalCanvas) {
        (originalCanvas as HTMLCanvasElement).width = width;
        (originalCanvas as HTMLCanvasElement).height = height;
    }

    // Create or resize tempCanvas
    if (!tempCanvas || tempCanvas.width !== width || tempCanvas.height !== height) {
        tempCanvas = g.createCanvas(width, height) as HTMLCanvasElement;
        tempCtx = tempCanvas.getContext("2d") as CanvasRenderingContext2D;
    }

    if (initWrapper) {
        initWrapper.style.width = `${width}px`;
        initWrapper.style.height = `${height}px`;
    }
    if (zoomCanvas) {
        (zoomCanvas as HTMLCanvasElement).width = width * g.zoom;
        (zoomCanvas as HTMLCanvasElement).height = height * g.zoom;
    }

    // Update active document metadata if it exists
    if (typeof g.documents !== 'undefined' && g.activeDocumentIndex >= 0) {
        const doc = g.documents[g.activeDocumentIndex];
        if (doc) {
            doc.width = width;
            doc.height = height;
        }
    }

    console.log(`Canvas resized to ${width}x${height}`);
    if (typeof renderLayers === 'function') renderLayers();
}

// Initialize immediately
resizeCanvas(g.image_width, g.image_height);

// Expose globally
window.resizeCanvas = resizeCanvas;

//UNDO / REDO
window.undoImage = () => {
    if (window.historyManager) {
        window.historyManager.undo();
    }
};
window.redoImage = () => {
    if (window.historyManager) {
        window.historyManager.redo();
    }
};

// Expose these explicitly to window for other scripts (layers.js, project_io.js)


// Animation loop for selection border
export function animate() {
    // If selection is active, we might need to redraw for the marching ants animation
    // even if the user isn't doing anything.
    const hasPreview = g.selectionPreviewBorder && g.selectionPreviewBorder.length > 0;
    if (g.isSelectionActive || hasPreview) {
        // Redraw only if NOT currently drawing (because on_canvas_mouse_move already does it)
        if (!g.drawing && renderLayers) {
            renderLayers();
        }
    }
    requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

////////////////////////////////////////////////////
/////////////////   D  O  W  N /////////////////////
////////////////////////////////////////////////////
export function on_canvas_mouse_down(e: MouseEvent) {
    if (!can) return;
    const ctx = can.getContext('2d');
    if (!ctx) {
        console.error("No context found for drawing canvas");
        return;
    }

    const rect = can.getBoundingClientRect();
    const x = (e.clientX - rect.left) / g.zoom;
    const y = (e.clientY - rect.top) / g.zoom;

    g.pX = Math.round(x);
    g.pY = Math.round(y);
    g.startX = g.pX;
    g.startY = g.pY;
    g.drawing = true;

    // Debug: Check active layer
    const activeLayer = layers[g.activeLayerIndex];
    if (activeLayer) {
        console.log(`Active Layer: ${activeLayer.name}, Visible: ${activeLayer.visible}, Opacity: ${activeLayer.opacity}`);
    } else {
        console.error("No active layer selected!");
    }

    // Pan tool: don't start drawing, just let mouse_move handle it
    if (g.current_tool === Tool.Pan || e.buttons === 4) { // Middle click or Pan tool
        if (can) can.style.cursor = 'grabbing';
        g.drawing = false; // Pan is not a drawing operation
        return;
    }

    // Block drawing on hidden or locked layers
    const checkLayer = layers[g.activeLayerIndex];
    if (!checkLayer) {
        console.error("Critical: No layer found at index", g.activeLayerIndex);
        g.drawing = false;
        return;
    }
    console.log("Drawing on layer:", checkLayer.name, "Visible:", checkLayer.visible, "Locked:", checkLayer.locked);

    if (!checkLayer.visible || checkLayer.locked) {
        console.warn("Cannot draw: layer is", !checkLayer.visible ? "hidden" : "locked");
        g.drawing = false;
        return;
    }

    // ✨ ARCHITECTURE POLICY: Cross-layer tool usage is NOT ALLOWED.
    const isRasterDrawingTool = [
        Tool.Pen.id, 
        Tool.Brush.id, 
        Tool.Eraser.id, 
        Tool.Spray.id, 
        Tool.Flood_Fill.id
    ].includes(g.current_tool.id);

    const isVectorTool = [
        Tool.Line.id,
        Tool.Circle.id,
        Tool.Rectangle.id,
        Tool.Rounded_Rectangle.id,
        Tool.Ellipse.id
    ].includes(g.current_tool.id);

    if (isRasterDrawingTool && checkLayer.type === 'vector') {
        tooltipManager.showWarning("⚠️ Raster Tool on Vector Layer - Not Allowed");
        g.drawing = false;
        return;
    }

    if (isVectorTool && checkLayer.type === 'raster') {
        tooltipManager.showWarning("⚠️ Drawing Vector on Raster Layer");
    }

    // Prepare tempCtx
    if (!tempCtx) {
        console.error("tempCtx is null");
        g.drawing = false;
        return;
    }
    tempCtx.globalAlpha = 1;
    tempCtx.filter = "none";
    tempCtx.clearRect(0, 0, tempCtx.canvas.width, tempCtx.canvas.height);

    if (g.current_tool === Tool.Eraser) {
        tempCtx.drawImage(checkLayer.canvas, 0, 0);
    }

    // Capture state for Undo/Redo
    g.previousLayerState = checkLayer.ctx.getImageData(0, 0, g.image_width, g.image_height);

    switch (g.current_tool.id) {
        case Tool.Wand.id:
            let mode: SelectionMode = "replace" as SelectionMode;
            if (e.shiftKey) mode = "add" as SelectionMode;
            if (e.altKey) mode = "subtract" as SelectionMode;

            let sourceCtx: CanvasRenderingContext2D | null = null;
            // Wand needs the target pixel data
            if (g.wand_all_layers && originalCanvas) {
                // Pick from composite
                sourceCtx = (originalCanvas as HTMLCanvasElement).getContext('2d', { willReadFrequently: true });
            } else {
                // Pick from active layer
                const activeLayer = getActiveLayer();
                if (activeLayer) {
                    sourceCtx = (activeLayer.canvas as HTMLCanvasElement).getContext('2d', { willReadFrequently: true });
                }
            }

            if (typeof magicWandSelection === 'function' && tempCtx && sourceCtx) {
                try {
                    const tolerance = g.wand_tolerance || 32;
                    // magicWandSelection (startX, startY, sourceCtx, tolerance, mode)
                    magicWandSelection(g.pX, g.pY, sourceCtx, tolerance, mode);

                    // Re-extract border paths
                    if (g.isSelectionActive) {
                        drawSelectionBorder(tempCtx);
                        if (can) {
                            const canCtx = can.getContext('2d');
                            if (canCtx) drawSelectionBorder(canCtx as CanvasRenderingContext2D);
                        }
                    }
                    g.isSelectionActive = !!g.selectionCanvas;
                } catch (e) {
                    console.error("Magic Wand Error:", e);
                }
            } else {
                console.error("magicWandSelection function not found in selection_tools.js or sourceCtx/tempCtx is null");
            }

            renderLayers();
            g.drawing = false; // Magic wand is a single click operation
            return;
        case Tool.Spray.id:
            drawSpray(tempCtx, e);
            break;
        case Tool.Pen.id:
            drawPen(e, tempCtx);
            break;
        case Tool.Brush.id:
            g.lastStampX = g.pX;
            g.lastStampY = g.pY;
            drawBrush(tempCtx, g.pX, g.pY);
            break;
        case Tool.Eraser.id:
            g.lastStampX = g.pX;
            g.lastStampY = g.pY;
            drawEraser(tempCtx, g.startX, g.startY, g.pX, g.pY);
            break;
        case Tool.RectSelect.id:
        case Tool.EllipseSelect.id:
        case Tool.Lasso.id:
            // Selection tools: Only move if clicking INSIDE existing selection
            if (g.isSelectionActive && typeof isPointInSelection === 'function' && isPointInSelection(g.pX, g.pY)) {
                g.movingSelection = true;
            } else {
                g.movingSelection = false;
                if (g.current_tool === Tool.Lasso) {
                    window.lassoPoints = [{ x: g.pX, y: g.pY }];
                }
            }
            break;
        case Tool.MoveSelection.id:
        case Tool.MoveContent.id:
            // Dedicated move tools: Drag from anywhere if a selection exists
            if (g.isSelectionActive && g.selectionCanvas) {
                g.movingSelection = true;
                if (g.current_tool === Tool.MoveContent && typeof moveSelectionContent === 'function') {
                    moveSelectionContent(0, 0);
                }
            } else {
                g.movingSelection = false;
            }
            break;
        case Tool.PolySelect.id:
            // Standardize: Only move if clicking INSIDE existing selection AND not currently drafting a new one
            const hasDraftPoints = window.polyPoints && window.polyPoints.length > 0;
            if (g.isSelectionActive && !hasDraftPoints && typeof isPointInSelection === 'function' && isPointInSelection(g.pX, g.pY)) {
                console.log("[DEBUG] PolySelect: Clicked inside selection, starting move");
                g.movingSelection = true;
                // Note: Dedicated Move tools (MoveContent) handle pixel lifting.
                // Selection tools move the mask.
            } else {
                console.log("[DEBUG] PolySelect: Clicked outside or drafting, adding point");
                g.movingSelection = false;
                if (!window.polyPoints) window.polyPoints = [];
                window.polyPoints.push({ x: g.pX, y: g.pY });
            }
            break;
        case Tool.Flood_Fill.id:
            // Source selection logic: Global Composite or Active Layer
            let fillSourceCanvas = checkLayer.canvas; // Default
            if (g.fill_all_layers && originalCanvas) {
                renderLayers(); // Ensure composite is up to date
                fillSourceCanvas = originalCanvas;
            } else {
                // Active Layer Only
                fillSourceCanvas = checkLayer.canvas; // Default raster content

                // If the layer has vector shapes, we must composite them to see them
                if ((checkLayer.type === 'vector' || (checkLayer.shapes && checkLayer.shapes.length > 0))) {
                    // Create a temp canvas for the composite of this layer
                    const compositionCan = document.createElement('canvas');
                    compositionCan.width = fillSourceCanvas.width;
                    compositionCan.height = fillSourceCanvas.height;
                    const compositionCtx = compositionCan.getContext('2d');
                    if (!compositionCtx) {
                        console.error("Failed to get composition context for Flood Fill.");
                        return;
                    }

                    // Draw raster part
                    compositionCtx.drawImage(fillSourceCanvas as HTMLCanvasElement, 0, 0);

                    // Draw vector part
                    if (typeof drawShapesToCtx === 'function' && checkLayer.shapes) {
                        drawShapesToCtx(compositionCtx, checkLayer.shapes);
                    }

                    fillSourceCanvas = compositionCan;
                }
            }

            const fillSourceCtx = (fillSourceCanvas as HTMLCanvasElement).getContext('2d', { willReadFrequently: true });
            if (!fillSourceCtx) {
                console.error("Failed to get source context for Flood Fill.");
                return;
            }
            const fillColor = parseColorToRgba(g.pen_color, g.pen_opacity);
            const tol = g.fill_tolerance || 32;
            const toleranceObj: FillTolerance = { r: tol, g: tol, b: tol, a: tol };

            // floodFill handles the fill operation. We read from fillSourceCtx but write to checkLayer.ctx
            floodFill(g.startX, g.startY, checkLayer.ctx as CanvasRenderingContext2D, fillColor, toleranceObj, fillSourceCtx as CanvasRenderingContext2D);

            finishDrawing(e);
            g.drawing = false; // Flood fill is a single click operation
            break;
        default:
            break;
    }

    // Force first-point render for immediate feedback
    if (g.drawing && typeof renderLayers === 'function') {
        renderLayers(tempCanvas as HTMLCanvasElement);
    }
}

////////////////////////////////////////////////////
/////////////////   M  O  V  E /////////////////////
////////////////////////////////////////////////////
export function on_canvas_mouse_move(e: MouseEvent) {
    if (!can) return;
    const rect = can.getBoundingClientRect();
    const x = (e.clientX - rect.left) / g.zoom;
    const y = (e.clientY - rect.top) / g.zoom;

    g.pX = Math.round(x);
    g.pY = Math.round(y);

    // Update status bar
    const statusMessage = document.getElementById("statusMessage");
    const mousePosition = document.getElementById("mousePosition");
    if (mousePosition) mousePosition.textContent = `X: ${g.pX}, Y: ${g.pY}`;
    if (statusMessage) statusMessage.innerHTML = g.drawing ? "Drawing" : "Ready";

    // Handle Pan Tool or Middle Mouse Drag
    if (g.current_tool === Tool.Pan || (e.buttons === 4)) { // 4 is middle button
        if (e.buttons === 1 || e.buttons === 4) { // Left click (if Pan tool) or Middle click
            const container = document.getElementById('canvasScrollArea');
            if (container) {
                container.scrollLeft -= e.movementX;
                container.scrollTop -= e.movementY;
            }
        }
        return;
    }

    if (!g.drawing) return;

    // Special handling for Polygon: We want to show the 'rubber band' line even if button is up
    if (e.buttons !== 1) {
        if (g.current_tool.id === Tool.PolySelect.id && !g.movingSelection) {
            // Proceed to drawing block below to update the preview
        } else {
            g.drawing = false;
            return;
        }
    }

    // ✨ AI ARCHITECTURE NOTE: We explicitly EXCLUDE vector tools from the raster drawing context.
    // Vector tools are managed by VectorToolManager (vtm) which draws to layer.shapes.
    // Drawing them into tempCtx would 'burn' them into the raster layer pixels prematurely.
    const isRasterShapeTool = [Tool.RectSelect.id, Tool.EllipseSelect.id, Tool.Lasso.id, Tool.PolySelect.id, Tool.Crop.id].includes(g.current_tool.id);
    const isVectorShapeTool = [Tool.Line.id, Tool.Circle.id, Tool.Rectangle.id, Tool.Rounded_Rectangle.id, Tool.Ellipse.id].includes(g.current_tool.id);

    if (!tempCtx) return;

    const checkLayer = layers[g.activeLayerIndex];
    if (isVectorShapeTool && checkLayer && checkLayer.type === 'vector') {
        // ✨ AI ARCHITECTURE NOTE: Skip raster preview draw into tempCanvas for VECTOR layers.
        // Rendering of the active vector shape is handled directly by renderLayers in layers.ts via vtm.
    } else {
        // Clear tempCtx for shapes, even if vector-named (acting as raster tools)
        if (isVectorShapeTool || isRasterShapeTool) {
             tempCtx.clearRect(0, 0, tempCtx.canvas.width, tempCtx.canvas.height);
        }
    }

    // Draw based on tool
    const isBlurTool = [Tool.Line.id, Tool.Circle.id, Tool.Rectangle.id, Tool.Rounded_Rectangle.id, Tool.Ellipse.id].includes(g.current_tool.id);

    // tempCtx null check already performed above
    // if (!tempCtx) return; // Redundant null check for tempCtx before using it

    if (isBlurTool) {
        const hardness = (g.brush_hardness !== undefined) ? g.brush_hardness : 1.0;
        const maxBlur = Math.max(2, g.pen_width / 2);
        const blurAmount = (1.0 - hardness) * maxBlur;

        if (blurAmount > 0.5) {
            tempCtx.filter = `blur(${blurAmount}px)`;
        } else {
            tempCtx.filter = "none";
        }
    } else {
        tempCtx.filter = "none";
    }

    tempCtx.globalCompositeOperation = 'source-over';
    tempCtx.globalAlpha = g.pen_opacity || 1.0;

    const isVectorLayer = checkLayer && checkLayer.type === 'vector';

    if (isVectorShapeTool && isVectorLayer) {
        // Handled by VTM
    } else if (g.current_tool.id === Tool.Circle.id) {
        drawCircle(e, tempCtx);
    } else if (g.current_tool.id === Tool.Line.id) {
        drawLine(e, tempCtx);
    } else if (g.current_tool.id === Tool.Rectangle.id) {
        drawRect(tempCtx, g.startX, g.startY, g.pX, g.pY);
    } else if (g.current_tool.id === Tool.Ellipse.id) {
        drawEllipse(tempCtx, g.startX, g.startY, g.pX, g.pY);
    } else if (g.current_tool.id === Tool.Rounded_Rectangle.id) {
        drawRoundedRect(tempCtx, g.startX, g.startY, g.pX, g.pY);
    } else if (g.current_tool.id === Tool.Pen.id) {
        drawPen(e, tempCtx);
    } else if (g.current_tool.id === Tool.Brush.id || g.current_tool.id === Tool.Eraser.id) {
        // Advanced Spacing: Draw stamps based on distance traveled
        const dx = g.pX - g.lastStampX;
        const dy = g.pY - g.lastStampY;
        const dist = Math.hypot(dx, dy);
        
        // Step size is a percentage of brush width (min 1px)
        const spacingRatio = Math.max(0.01, g.brush_spacing / 100);
        const step = Math.max(1, g.pen_width * spacingRatio);
        
        if (dist >= step) {
            const steps = Math.floor(dist / step);
            for (let i = 1; i <= steps; i++) {
                const t = i / steps;
                const curX = Math.round(g.lastStampX + (g.pX - g.lastStampX) * t);
                const curY = Math.round(g.lastStampY + (g.pY - g.lastStampY) * t);
                
                if (g.current_tool.id === Tool.Brush.id) {
                    drawBrush(tempCtx, curX, curY);
                } else {
                    drawEraser(tempCtx, g.lastStampX, g.lastStampY, curX, curY);
                }
            }
            // Move last stamp reference forward by the distance covers
            g.lastStampX = g.pX;
            g.lastStampY = g.pY;
        }
    } else if (g.current_tool.id === Tool.Spray.id) {
        drawSpray(tempCtx, e);
    } else if (g.current_tool.id === Tool.Rounded_Rectangle.id) {
        drawRoundedRect(tempCtx, g.startX, g.startY, g.pX, g.pY);
    } else if (g.current_tool.id === Tool.Ellipse.id) {
        drawEllipse(tempCtx, g.startX, g.startY, g.pX, g.pY);
    } else if (g.current_tool.id === Tool.RectSelect.id) {
        if (g.movingSelection) {
            const dx = g.pX - g.startX;
            const dy = g.pY - g.startY;
            if (typeof moveSelectionMask === 'function') moveSelectionMask(dx, dy);
            g.startX = g.pX;
            g.startY = g.pY;
        } else {
            if (typeof getRectBorder === 'function') {
                g.selectionPreviewBorder = [getRectBorder(g.startX, g.startY, g.pX, g.pY)];
            }
        }
    } else if (g.current_tool.id === Tool.EllipseSelect.id) {
        if (g.movingSelection) {
            const dx = g.pX - g.startX;
            const dy = g.pY - g.startY;
            if (typeof moveSelectionMask === 'function') moveSelectionMask(dx, dy);
            g.startX = g.pX;
            g.startY = g.pY;
        } else {
            if (typeof getEllipseBorder === 'function') {
                g.selectionPreviewBorder = [getEllipseBorder(g.startX, g.startY, g.pX, g.pY)];
            }
        }
    } else if (g.current_tool.id === Tool.Lasso.id) {
        if (g.movingSelection) {
            const dx = g.pX - g.startX;
            const dy = g.pY - g.startY;
            if (typeof moveSelectionMask === 'function') moveSelectionMask(dx, dy);
            g.startX = g.pX;
            g.startY = g.pY;
        } else if (window.lassoPoints) {
            window.lassoPoints.push({ x: g.pX, y: g.pY });
            g.selectionPreviewBorder = [[...window.lassoPoints, window.lassoPoints[0]]];
        }
    } else if (g.current_tool.id === Tool.PolySelect.id) {
        if (g.movingSelection) {
            const dx = g.pX - g.startX;
            const dy = g.pY - g.startY;
            if (typeof moveSelectionMask === 'function') moveSelectionMask(dx, dy);
            g.startX = g.pX;
            g.startY = g.pY;
        } else if (window.polyPoints && window.polyPoints.length > 0) {
            g.selectionPreviewBorder = [[...window.polyPoints, { x: g.pX, y: g.pY }, window.polyPoints[0]]];
            tempCtx.beginPath();
            tempCtx.moveTo(window.polyPoints[0].x, window.polyPoints[0].y);
            for (let i = 1; i < window.polyPoints.length; i++) tempCtx.lineTo(window.polyPoints[i].x, window.polyPoints[i].y);
            tempCtx.lineTo(g.pX, g.pY);
            tempCtx.strokeStyle = 'rgba(0,0,0,0.5)';
            tempCtx.lineWidth = 1;
            tempCtx.stroke();
            const ctx = tempCtx!;
            window.polyPoints.forEach(p => {
                ctx.fillStyle = '#fff';
                ctx.strokeStyle = '#000';
                ctx.beginPath();
                ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            });
        }
    } else if (g.current_tool.id === Tool.MoveSelection.id || g.current_tool.id === Tool.MoveContent.id) {
        if (!g.movingSelection) return;
        const dx = g.pX - g.startX;
        const dy = g.pY - g.startY;
        if (g.current_tool.id === Tool.MoveSelection.id) {
            if (typeof moveSelectionMask === 'function') moveSelectionMask(dx, dy);
        } else {
            if (typeof moveSelectionContent === 'function') moveSelectionContent(dx, dy);
        }
        g.startX = g.pX;
        g.startY = g.pY;
    }

    // Render composition (now handles selection masking internally in layers.js)
    if (typeof renderLayers === 'function') renderLayers(tempCanvas as HTMLCanvasElement);
}

export function on_canvas_mouse_up(_e: MouseEvent) {
    if (can) can.style.cursor = 'crosshair';
    if (!g.drawing) return;

    if (g.current_tool.id === Tool.PolySelect.id) {
        // Polygon handling: don't finalize on MouseUp, wait for double-click or Enter
        return;
    }

    finishDrawing(_e);
}

/**
 * Utility to apply active selection mask to a context using destination-in.
 */
export function applySelectionMaskToCtx(targetCtx: CanvasRenderingContext2D) {
    if (g.isSelectionActive && g.selectionCanvas) {
        targetCtx.save();
        targetCtx.globalAlpha = 1.0;
        targetCtx.globalCompositeOperation = 'destination-in';
        targetCtx.drawImage(g.selectionCanvas as HTMLCanvasElement, 0, 0);
        targetCtx.restore();
    }
}

export function finishDrawing(e: MouseEvent | null) {
    console.log(`[DEBUG] FinishDrawing: Tool=${g.current_tool}, Drawing=${g.drawing}, movingSelection=${g.movingSelection}`);
    const mainCtx = can?.getContext("2d");
    if (!mainCtx || !g.drawing) {
        g.movingSelection = false; // Safety reset
        return;
    }

    // Use event for modifiers if available
    const shift = (e as MouseEvent)?.shiftKey ?? false;
    const alt = (e as MouseEvent)?.altKey ?? false;

    // Commit tempCanvas to active layer
    const activeLayer = layers[g.activeLayerIndex];
    if (!activeLayer) {
        console.error(`[DEBUG] FinishDrawing: No active layer at index ${g.activeLayerIndex}`);
        g.drawing = false;
        return;
    }

    if (activeLayer.locked) {
        console.warn("[DEBUG] FinishDrawing: Active layer is locked. Skipping commit.");
        g.drawing = false;
        return;
    }

    if (activeLayer) {

        // Handle SELECTION Tools -> Do NOT draw to layer
        try {
            if (g.current_tool.id === Tool.RectSelect.id) {
                if (g.movingSelection) {
                    g.movingSelection = false;
                } else {
                    let mode: SelectionMode = "replace" as SelectionMode;
                    if (shift) mode = "add" as SelectionMode;
                    if (alt) mode = "subtract" as SelectionMode;
                    if (typeof buildRectSelection === 'function') {
                        buildRectSelection(g.startX, g.startY, g.pX, g.pY, mode);
                    }
                }
                g.isSelectionActive = true;
                g.selectionPreviewBorder = [];
                g.drawing = false;
                if (tempCtx) tempCtx.clearRect(0, 0, tempCtx.canvas.width, tempCtx.canvas.height);
                renderLayers();
                return;
            }
            if (g.current_tool.id === Tool.EllipseSelect.id) {
                if (g.movingSelection) {
                    g.movingSelection = false;
                } else {
                    let mode: SelectionMode = "replace" as SelectionMode;
                    if (shift) mode = "add" as SelectionMode;
                    if (alt) mode = "subtract" as SelectionMode;
                    if (typeof buildEllipseSelection === 'function') {
                        buildEllipseSelection(g.startX, g.startY, g.pX, g.pY, mode);
                    }
                }
                g.isSelectionActive = true;
                g.selectionPreviewBorder = [];
                g.drawing = false;
                if (tempCtx) tempCtx.clearRect(0, 0, tempCtx.canvas.width, tempCtx.canvas.height);
                renderLayers();
                return;
            }
            if (g.current_tool.id === Tool.Lasso.id) {
                if (g.movingSelection) {
                    g.movingSelection = false;
                } else {
                    let mode: SelectionMode = "replace" as SelectionMode;
                    if (shift) mode = "add" as SelectionMode;
                    if (alt) mode = "subtract" as SelectionMode;
                    if (typeof buildLassoSelection === 'function' && window.lassoPoints) {
                        // Close the loop
                        window.lassoPoints.push({ x: g.pX, y: g.pY });
                        buildLassoSelection(window.lassoPoints, mode);
                    }
                }
                g.selectionPreviewBorder = [];
                window.lassoPoints = [];
                g.drawing = false;
                if (tempCtx) tempCtx.clearRect(0, 0, tempCtx.canvas.width, tempCtx.canvas.height);
                renderLayers();
                return;
            }
            if (g.current_tool.id === Tool.PolySelect.id) {
                if (g.movingSelection) {
                    g.movingSelection = false;
                    g.drawing = false;
                    renderLayers();
                }
                // If not moving, we stay in g.drawing = true to collect more points
                return;
            }

            if (g.current_tool.id === Tool.MoveContent.id) {
                // Persistent MoveContent doesn't auto-finalize on mouseup. 
                // The user must click OK or Cancel in the transform overlay.
                g.drawing = false;
                return;
            }

            if (g.current_tool.id === Tool.MoveSelection.id) {
                g.drawing = false;
                return;
            }
        } catch (e) {
            console.error("[DEBUG] Error in finishDrawing (Tool Logic):", e);
            // Ensure we reset flags even on error
            g.drawing = false;
            g.movingSelection = false;
        }

        // If selection is active, mask the stroke before committing
        if (tempCtx) applySelectionMaskToCtx(tempCtx);

        // Draw tempCanvas onto the active layer
        // Note: If we used "copy layer to temp" strategy, we would replace.
        // But we used "draw stroke on temp" strategy, so we drawImage on top.
        // UNLESS it was FloodFill which replaced content.

        try {
            const isVectorShapeTool = [Tool.Line.id, Tool.Circle.id, Tool.Rectangle.id, Tool.Rounded_Rectangle.id, Tool.Ellipse.id].includes(g.current_tool.id);
            
            const checkLayer = layers[g.activeLayerIndex];
            const isVectorLayer = checkLayer && checkLayer.type === 'vector';

            if (isVectorShapeTool && isVectorLayer) {
                // Done in on_canvas_mouse_up (handled by vtm) - no-op here for raster context
                console.log(`[DEBUG] Vector tool on Vector layer detected. Skipping raster commit.`);
            } else if (isVectorShapeTool && !isVectorLayer) {
                // If it's a vector shape tool ID but on a RASTER layer, commit it!
                console.log(`[DEBUG] Vector tool on RASTER layer detected. Rasterizing...`);
                activeLayer.ctx.drawImage(tempCanvas as HTMLCanvasElement, 0, 0);
                if (tempCtx) tempCtx.clearRect(0, 0, tempCtx.canvas.width, tempCtx.canvas.height);
            } else if (g.current_tool.id === Tool.Eraser.id) {
                // Eraser copied the whole layer to tempCanvas, so we replace it entirely
                activeLayer.ctx.clearRect(0, 0, g.image_width, g.image_height);
                if (tempCanvas) {
                    activeLayer.ctx.drawImage(tempCanvas, 0, 0);
                    console.log(`[DEBUG] Committed eraser from tempCanvas to layer: ${activeLayer.name}`);
                }
            } else {
                // Other tools (including Flood Fill) only draw their stroke on tempCanvas,
                // so we composite it visually onto the existing layer.
                if (tempCanvas) {
                    activeLayer.ctx.drawImage(tempCanvas, 0, 0);
                    console.log(`[DEBUG] Committed stroke from tempCanvas to layer: ${activeLayer.name}`);
                }
            }
        } catch (e) {
            console.error("[DEBUG] Error committing to layer:", e);
        }
    }

    console.log(`[DEBUG] Completing drawing operation. Resetting move states.`);
    g.drawing = false;
    g.movingSelection = false;

    // Reset cursor to tool default
    if (can) {
        can.style.cursor = (g.current_tool.id === Tool.Pan.id) ? 'grab' : 'crosshair';
    }

    // Clear temp canvas
    if (tempCtx) tempCtx.clearRect(0, 0, tempCtx.canvas.width, tempCtx.canvas.height);

    // Final render
    renderLayers();

    // Update thumbnails
    if (typeof updateLayerPanel === 'function') updateLayerPanel();

    // Save Undo using HistoryManager
    if (activeLayer) {
        const newData = activeLayer.ctx.getImageData(0, 0, g.image_width, g.image_height);
        // We need the previous state. 
        // Ideally, we capture 'currentState' at START of drawing (mousedown).
        // For now, let's grab it from undo stack? No.

        // Fix: We need to capture state BEFORE drawing.
        // Let's assume g.previousLayerState was captured in mousedown.
        if (g.previousLayerState) {
            historyManager.push(new DrawAction(g.activeLayerIndex, g.previousLayerState, newData));
        }
        g.previousLayerState = null; // Reset
    }
}

export function selectTool(tool: Tool) {
    if (!tool) return;
    g.current_tool = tool;

    // UI Updates: Status Bar Tool Name
    const toolNameEl = document.getElementById('toolName');
    if (toolNameEl) {
        toolNameEl.textContent = tool.name;
    }

    if (can) {
        can.style.cursor = (g.current_tool.id === Tool.Pan.id) ? 'grab' : 'crosshair';
    }

    // Cleanup vector overlays if switching away from vector tools
    const isVectorTool = [Tool.VectorSelect.id, Tool.Line.id, Tool.Circle.id, Tool.Rectangle.id, Tool.Rounded_Rectangle.id, Tool.Ellipse.id].includes(tool.id);
    if (!isVectorTool) {
        if (typeof (window as any).vectorToolManager !== 'undefined') {
            (window as any).vectorToolManager.cancelEdit();
        }
    }

    renderLayers();
    // Dispatch event for other subscribers (like options-bar or properties-panel)
    window.dispatchEvent(new CustomEvent('toolChanged', { detail: { tool: tool.id } }));

    // Update Properties Panel
    if (window.propertiesPanel && typeof window.propertiesPanel.render === 'function') {
        window.propertiesPanel.render();
    }

    // Update Toolbar Buttons
    clearSelected();
    let e = document.getElementById(tool.id);
    if (e) {
        e.classList.add("down");
        e.classList.add("active");
    }
}

export function clearSelected() {
    const buttons = document.querySelectorAll('.button');
    buttons.forEach(btn => btn.classList.remove('down', 'active', 'selected'));
}

export function undoImage() {
    if (window.historyManager) {
        window.historyManager.undo();
        if (typeof updateLayerPanel === 'function') updateLayerPanel();
    }
}

export function redoImage() {
    if (window.historyManager) {
        window.historyManager.redo();
        if (typeof updateLayerPanel === 'function') updateLayerPanel();
    }
}

export function restoreUndoState() {
    const data = undo[g.undo_index];
    if (!data) return;

    // Restore to originalCanvas
    const oCtx: CanvasRenderingContext2D | null = originalCanvas?.getContext("2d") ?? null;
    if (oCtx) oCtx.putImageData(data, 0, 0);

    // Restore to Active Layer (Simplified: Clear all layers and put undo image on background)
    // Ideally, undo should track layer states. For now, we flatten on undo.
    // TODO: Implement full layer history
    layers.length = 0;
    const newLayer = new LayerClass("Restored");
    newLayer.ctx.putImageData(data, 0, 0);
    layers.push(newLayer);
    g.activeLayerIndex = 0;

    renderLayers();
    updateLayerPanel();
}

// Helper to apply a loaded PSD object to the canvas
window.applyPsdToCanvas = async function (psd: any) {
    if (!psd) return;

    const newLayers = await convertPsdToLayers(psd);
    if (newLayers.length > 0) {
        layers.length = 0; // Clear existing
        layers.splice(0, layers.length, ...newLayers);

        g.activeLayerIndex = layers.length - 1; // Select top layer

        // Update dimensions
        const tree = psd.tree();
        g.image_width = tree.width;
        g.image_height = tree.height;

        // Resize canvases
        if (window.resizeCanvas) {
            window.resizeCanvas(g.image_width, g.image_height);
        } else {
            if (can) { can.width = g.image_width; can.height = g.image_height; }
            if (originalCanvas) { originalCanvas.width = g.image_width; originalCanvas.height = g.image_height; }
            tempCanvas = g.createCanvas(g.image_width, g.image_height) as HTMLCanvasElement;
            tempCtx = tempCanvas.getContext("2d");
        }

        // Reset Zoom
        const oldZoom = g.zoom;
        g.zoom = 1;
        applyZoom(oldZoom, null);

        renderLayers();
        if (typeof updateLayerPanel === 'function') updateLayerPanel();

        console.log("PSD applied successfully");
        finishDrawing(null); // Reset undo state
    }
};


export function getCanvasImageDataURL() {
    // Return the composite image
    return can.toDataURL("image/png");
}

// Zoom Functions
export function zoomIn(e: MouseEvent | null) {
    const oldZoom = g.zoom;
    g.zoom = Math.min(g.zoom * g.zoomFactor, 32);
    applyZoom(oldZoom, e);
}

export function zoomOut(e: MouseEvent | null) {
    const oldZoom = g.zoom;
    g.zoom = Math.max(g.zoom / g.zoomFactor, 0.05);
    applyZoom(oldZoom, e);
}

export function applyZoom(oldZoom: number, e: MouseEvent | null) {
    const wrapper = document.getElementById('canvasWrapper');
    const container = document.getElementById('canvasScrollArea');
    if (!wrapper || !container) return;

    const newWidth = g.image_width * g.zoom;
    const newHeight = g.image_height * g.zoom;

    wrapper.style.width = `${newWidth}px`;
    wrapper.style.height = `${newHeight}px`;

    // Center zoom logic
    if (e && e.clientX !== undefined) {
        const rect = container.getBoundingClientRect();
        const mouseContainerX = e.clientX - rect.left + container.scrollLeft;
        const mouseContainerY = e.clientY - rect.top + container.scrollTop;
        const imgX = mouseContainerX / oldZoom;
        const imgY = mouseContainerY / oldZoom;

        container.scrollLeft = (imgX * g.zoom) - (e.clientX - rect.left);
        container.scrollTop = (imgY * g.zoom) - (e.clientY - rect.top);
    }

    const zoomDisplay = document.getElementById('zoomDisplay');
    if (zoomDisplay) zoomDisplay.textContent = ` Zoom: ${Math.round(g.zoom * 100)}%`;

    if (newWidth > container.clientWidth || newHeight > container.clientHeight) {
        container.classList.add('has-overflow');
    } else {
        container.classList.remove('has-overflow');
    }

    // ✨ UI UX IMPROVMENT: Vector selection handles need to follow zoom!
    window.dispatchEvent(new CustomEvent('zoomChanged'));
}

// Event Listeners
const container = document.getElementById('canvasScrollArea');
console.log("drawing_canvas.js initializing listeners. Container found:", !!container);

if (container) {
    // Zoom Support
    container.addEventListener('wheel', (event) => {
        // console.log('Wheel event detected', event.deltaY); 
        event.preventDefault(); // Always prevent scrolling to zoom
        if (event.deltaY < 0) {
            zoomIn(event);
        } else {
            zoomOut(event);
        }
    }, { passive: false });

    // Pan Support (Middle Mouse)
    container.addEventListener('mousedown', (e) => {
        // console.log("Container mousedown", e.buttons);
        if (e.buttons === 4 || g.current_tool === Tool.Pan) {
            // Start panning
            container.style.cursor = 'grabbing';
            // We don't prevent default here to allow focus, but we handle move
        }
    });



    // Global MouseUp for Pan/Grab reset
    window.addEventListener('mouseup', () => {
        if (container.style.cursor === 'grabbing') {
            console.log("[DEBUG] Global MouseUp detected, resetting cursor from grabbing");
            container.style.cursor = (g.current_tool === Tool.Pan) ? 'grab' : 'default';
        }
    });

    // Debug
    container.addEventListener('click', () => {
        // console.log("Container clicked");
    });
}

if (can) {
    can.addEventListener('mousedown', (e) => {
        if (e.buttons === 1 || e.buttons === 2) on_canvas_mouse_down(e);
    }, false);
    can.addEventListener('mousemove', on_canvas_mouse_move, false);
    can.addEventListener('mouseup', (e) => on_canvas_mouse_up(e), false);

    can.addEventListener('touchstart', (e: any) => {
        e.preventDefault();
        if (e.touches.length > 0) {
            const touch = e.touches[0];
            const mockE = {
                clientX: touch.clientX,
                clientY: touch.clientY,
                buttons: 1,
                shiftKey: e.shiftKey,
                altKey: e.altKey
            } as any;
            on_canvas_mouse_down(mockE);
        }
    }, false);

    can.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if ((e as TouchEvent).touches.length > 0) {
            const touch = (e as TouchEvent).touches[0];
            const mockE = {
                clientX: touch.clientX,
                clientY: touch.clientY,
                buttons: 1,
                movementX: 0,
                movementY: 0
            } as any;
            on_canvas_mouse_move(mockE);
        }
    }, false);

    can.addEventListener('touchend', (e) => {
        e.preventDefault();
        finishDrawing(null);
    }, false);

    can.addEventListener('dblclick', (e) => {
        if (g.current_tool.id === Tool.PolySelect.id && window.polyPoints && window.polyPoints.length > 2) {
            try {
                if (window.polyPoints.length > 3) {
                    window.polyPoints.pop();
                }
                let mode: SelectionMode = "replace" as SelectionMode;
                if (e.shiftKey) mode = "add" as SelectionMode;
                if (e.altKey) mode = "subtract" as SelectionMode;
                if (typeof window.buildPolygonalSelection === 'function') {
                    window.buildPolygonalSelection(window.polyPoints, mode);
                } else if (typeof buildPolygonalSelection === 'function') {
                    buildPolygonalSelection(window.polyPoints, mode);
                }
            } catch (err) {
                console.error("[DEBUG] Error finalizing Polygon Selection:", err);
            } finally {
                window.polyPoints = [];
                g.drawing = false;
                g.movingSelection = false;
                if (tempCtx) tempCtx.clearRect(0, 0, tempCtx.canvas.width, tempCtx.canvas.height);
                renderLayers();
            }
        }
    }, false);
}

console.log("Drawing canvas initialized");

// ─── Selection Management ──────────────────────────────────

export function cancelSelection() {
    if (g.isSelectionActive || (window.polyPoints && window.polyPoints.length > 0)) {
        g.isSelectionActive = false;
        g.selectionCanvas = null;
        g.selectionMask = null;
        g.selectionBorder = [];
        window.polyPoints = [];
        window.lassoPoints = [];
        g.drawing = false;
        g.movingSelection = false;
        if (tempCtx) tempCtx.clearRect(0, 0, tempCtx.canvas.width, tempCtx.canvas.height);
        renderLayers();
        console.log("Selection cleared (including points)");
    }
}

// Global Key Listener for Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        let handled = false;

        // 1. Cancel drawing if in progress (Poly, Lasso, etc.)
        if (g.drawing) {
            g.drawing = false;
            if (window.polyPoints) window.polyPoints = [];
            if (window.lassoPoints) window.lassoPoints = [];

            // Clear preview border that might have been set during move
            g.selectionBorder = [];

            if (tempCtx) tempCtx.clearRect(0, 0, tempCtx.canvas.width, tempCtx.canvas.height);
            renderLayers();
            console.log("Drawing cancelled via Escape");
            handled = true;
        }

        // 2. Clear active selection
        if (g.isSelectionActive) {
            cancelSelection();
            handled = true;
        }

        if (handled) {
            e.preventDefault();
            e.stopPropagation();
        }
    } else if (e.key === 'Enter') {
        // Finalize Poly/Lasso on Enter
        if (g.drawing) {
            if (g.current_tool.id === Tool.PolySelect.id && window.polyPoints && window.polyPoints.length > 2) {
                let mode: SelectionMode = "replace" as SelectionMode;
                if (e.shiftKey) mode = "add" as SelectionMode;
                if (e.altKey) mode = "subtract" as SelectionMode;
                if (typeof buildPolygonalSelection === 'function') {
                    buildPolygonalSelection(window.polyPoints, mode);
                }
                window.polyPoints = [];
                g.selectionPreviewBorder = [];
                g.drawing = false;
                if (tempCtx) tempCtx.clearRect(0, 0, tempCtx.canvas.width, tempCtx.canvas.height);
                renderLayers();
                console.log("Polygon Selection finalized via Enter");
            } else if (g.current_tool.id === Tool.Lasso.id && window.lassoPoints && window.lassoPoints.length > 2) {
                let mode: SelectionMode = "replace" as SelectionMode;
                if (e.shiftKey) mode = "add" as SelectionMode;
                if (e.altKey) mode = "subtract" as SelectionMode;
                if (typeof buildLassoSelection === 'function') {
                    window.lassoPoints.push({ x: g.pX, y: g.pY });
                    buildLassoSelection(window.lassoPoints, mode);
                }
                window.lassoPoints = [];
                g.selectionPreviewBorder = [];
                g.drawing = false;
                if (tempCtx) tempCtx.clearRect(0, 0, tempCtx.canvas.width, tempCtx.canvas.height);
                renderLayers();
                console.log("Lasso Selection finalized via Enter");
            }
        }
    } else if (e.ctrlKey || e.metaKey) {
        // Keyboard Shortcuts
        switch (e.key.toLowerCase()) {
            case 'c':
                if (typeof copySelection === 'function') copySelection();
                e.preventDefault();
                break;
            case 'v':
                if (typeof pasteSelection === 'function') pasteSelection();
                e.preventDefault();
                break;
            case 'x':
                if (typeof cutSelection === 'function') cutSelection();
                e.preventDefault();
                break;
            case 'a':
                if (typeof selectAll === 'function') selectAll();
                e.preventDefault();
                break;
            case 'd':
                if (typeof deselect === 'function') deselect();
                e.preventDefault();
                break;
            case 'i':
                if (e.shiftKey && typeof invertSelection === 'function') {
                    invertSelection();
                    e.preventDefault();
                }
                break;
            case 'z':
                if (e.shiftKey) redoImage();
                else undoImage();
                e.preventDefault();
                break;
            case 'y':
                redoImage();
                e.preventDefault();
                break;
        }
    }
});

// TEMPORARY WINDOW BINDINGS
if (typeof window !== 'undefined') {
    Object.assign(window, {
        selectTool,
        clearSelected,
        undoImage,
        redoImage,
        getCanvasImageDataURL,
        zoomIn,
        zoomOut,
        applyZoom
    });
}
