/**
 * @file tool-coordinator.ts
 * @description Handles tool shortcuts, Eye Dropper, and Drawing Status Bar updates.
 */

import { g } from '@hcie/core';
import { EventBus } from '@hcie/shared';

const drawingInfo = document.getElementById('drawingInfo');
const startXInput = document.getElementById('startXInput') as HTMLInputElement | null;
const startYInput = document.getElementById('startYInput') as HTMLInputElement | null;
const widthInput = document.getElementById('widthInput') as HTMLInputElement | null;
const heightInput = document.getElementById('heightInput') as HTMLInputElement | null;
const angleInput = document.getElementById('angleInput') as HTMLInputElement | null;
const radiusInput = document.getElementById('radiusInput') as HTMLInputElement | null;
const radiusContainer = document.getElementById('radiusContainer') as HTMLElement | null;

let shiftPressed = false;

window.addEventListener('keydown', (e) => { if (e.key === 'Shift') shiftPressed = true; });
window.addEventListener('keyup', (e) => { if (e.key === 'Shift') shiftPressed = false; });

/**
 * Updates the drawing status bar with current coordinates and dimensions.
 */
export function updateDrawingStatusBar(e: MouseEvent) {
    if (!g.drawing || !drawingInfo) {
        // Only hide if NOT in edit mode (Ghost mode)
        const isEditing = (window as any).vectorToolManager?.isEditing;
        if (!isEditing && drawingInfo) drawingInfo.style.display = 'none';
        return;
    }

    drawingInfo.style.display = 'flex';
    const start = { x: g.startX, y: g.startY }; 
    const current = { x: g.pX, y: g.pY }; 

    let dx = current.x - start.x;
    let dy = current.y - start.y;
    
    // Ensure we are showing current tool's info
    const tool = (g.current_tool as any)?.id || '';
    const isEllipse = tool.includes('Circle') || tool.includes('Ellipse');
    const isLine = tool.includes('Line');
    const isRect = tool.includes('Rectangle');

    if (radiusContainer && radiusInput) {
        if (isEllipse) {
            radiusContainer.style.display = 'flex';
            radiusInput.value = Math.round(Math.hypot(dx, dy)).toString();
        } else {
            radiusContainer.style.display = 'none';
        }
    }

    if (shiftPressed && isLine) {
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        const allowedAngles = [0, 30, 45, 60, 90, 120, 135, 150, 180, -30, -45, -60, -90, -120, -135, -150, -180];
        const finalSnap = allowedAngles.reduce((prev, curr) => Math.abs(curr - angle) < Math.abs(prev - angle) ? curr : prev);
        if (angleInput) angleInput.value = Math.round(finalSnap).toString();
    } else if (angleInput) {
        let angle = Math.atan2(dy, dx) * 180 / Math.PI;
        if (angle < 0) angle += 360;
        angleInput.value = Math.round(angle).toString();
    }

    if (startXInput) startXInput.value = Math.round(start.x).toString();
    if (startYInput) startYInput.value = Math.round(start.y).toString();
    if (widthInput) widthInput.value = Math.round(Math.abs(dx)).toString();
    if (heightInput) heightInput.value = Math.round(Math.abs(dy)).toString();

    // Enable inputs even on raster layer IF drawing/editing is active
    const isVectorTool = tool.match(/Line|Circle|Rectangle|Ellipse|Rounded_Rectangle/i);
    const disableInputs = !isVectorTool;
    [startXInput, startYInput, widthInput, heightInput, angleInput, radiusInput].forEach(el => {
        if (el) el.disabled = disableInputs;
    });
}

/**
 * Handle Eye Dropper color picking.
 */
export function handleEyeDropper(e: MouseEvent) {
    if (g.current_tool?.id !== 'EyeDropper') return;
    const can = document.getElementById("drawingCanvas") as HTMLCanvasElement;
    if (!can) return;
    const ctx = can.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    const pos = (window as any).getMousePos ? (window as any).getMousePos(e) : { x: e.offsetX, y: e.offsetY };
    const pixel = ctx.getImageData(pos.x, pos.y, 1, 1).data;
    const color = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1)}`;
    
    (g as any).primary_color = color;
    EventBus.emit('UPDATE_PROPERTIES_PANEL', { type: 'color', value: color });
}

export function initToolCoordinator() {
    // Commit/Cancel drawing logic
    (window as any).commitDrawing = function() {
        if ((window as any).vectorToolManager && (window as any).vectorToolManager.isEditing) {
            (window as any).vectorToolManager.commitEdit();
        } else {
            EventBus.emit('FINISH_DRAWING');
        }
        g.drawing = false;
        if (drawingInfo) drawingInfo.style.display = 'none';
        EventBus.emit('RENDER_LAYERS');
    };

    (window as any).cancelDrawing = function() {
        if ((window as any).vectorToolManager && (window as any).vectorToolManager.isEditing) {
            (window as any).vectorToolManager.cancelEdit();
        } else {
            g.drawing = false;
        }
        if (drawingInfo) drawingInfo.style.display = 'none';
        EventBus.emit('RENDER_LAYERS');
    };

    // Tool shortcuts
    EventBus.on('TOOL_CHANGED', (data: { toolId: string }) => {
       // Perform UI sync for tools here
    });

    EventBus.on('CANVAS_MOUSE_MOVE', (e: MouseEvent) => {
        updateDrawingStatusBar(e);
    });

    const updateVectorShapeFromInputs = () => {
        const vtm = (window as any).vectorToolManager;
        if (!vtm || !vtm.currentShape) return;
        const s = vtm.currentShape;
        
        const newX1 = parseFloat(startXInput?.value || '0');
        const newY1 = parseFloat(startYInput?.value || '0');
        const w = parseFloat(widthInput?.value || '0');
        const h = parseFloat(heightInput?.value || '0');
        const radius = parseFloat(radiusInput?.value || '0');
        const angle = parseFloat(angleInput?.value || '0');

        s.x1 = newX1;
        s.y1 = newY1;

        if (s.type === 'circle') {
            s.x2 = s.x1 + radius;
            s.y2 = s.y1;
        } else if (s.type === 'line') {
            // Use actual current line length so changing angle doesn't change length
            const dist = Math.hypot(s.x2 - s.x1, s.y2 - s.y1);
            const rad = angle * Math.PI / 180;
            s.x2 = s.x1 + dist * Math.cos(rad);
            s.y2 = s.y1 + dist * Math.sin(rad);
        } else {
            s.x2 = s.x1 + w;
            s.y2 = s.y1 + h;
        }

        s.style = s.style || {};
        s.style.angle = (s.type === 'circle' || s.type === 'line') ? 0 : angle;
        
        // Refresh overlay + status bar so all inputs stay in sync
        vtm.updateOverlay({ zoom: g.zoom, layers: (window as any).layers, activeLayerIndex: g.activeLayerIndex, g, tempCtx: null } as any, s);
        vtm.updateStatusBarInfo(s);
        EventBus.emit('RENDER_LAYERS');
    };

    [startXInput, startYInput, widthInput, heightInput, angleInput, radiusInput].forEach(el => {
        if (el) {
            el.addEventListener('input', updateVectorShapeFromInputs);
            el.addEventListener('change', updateVectorShapeFromInputs);
            el.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    updateVectorShapeFromInputs();
                    (window as any).commitDrawing?.();
                }
                if (e.key === 'Escape') {
                    (window as any).cancelDrawing?.();
                }
            });
        }
    });
    
    const btnCommit = document.getElementById('btnCommitDrawing');
    const btnCancel = document.getElementById('btnCancelDrawing');
    if (btnCommit) btnCommit.addEventListener('click', (window as any).commitDrawing);
    if (btnCancel) btnCancel.addEventListener('click', (window as any).cancelDrawing);
}
