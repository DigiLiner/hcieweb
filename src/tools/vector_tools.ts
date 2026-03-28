import { g, layers, Tool } from '../core/globals';
import { getActiveLayer } from '../canvas/layers';
import type { Shape } from '../core/types';
import { tooltipManager } from '../ui/tooltip';



export class VectorToolManager {
    public isDrawing: boolean = false;
    public isEditing: boolean = false;
    public startX: number = 0;
    public startY: number = 0;
    public currentShape: Shape | null = null;
    public activeLayerIndex: number = -1;
    public selectedShapeIndex: number = -1;

    public overlay: HTMLDivElement | null = null;
    public controls: HTMLDivElement | null = null;
    public dragStartX: number = 0;
    public dragStartY: number = 0;
    public editStartX: number = 0;
    public editStartY: number = 0;
    public dragStartLeft: number = 0;
    public dragStartTop: number = 0;

    public isDraggingOverlay: boolean = false;

    private originalShape: Shape | null = null;
    private isResizing: boolean = false;
    private resizeDir: string = '';
    private resizeStartX: number = 0;
    private resizeStartY: number = 0;
    private resizeStartShape: Shape | null = null;
    private handles: Record<string, HTMLDivElement> = {};

    private dragStartShapeX1: number = 0;
    private dragStartShapeY1: number = 0;
    private dragStartShapeX2: number = 0;
    private dragStartShapeY2: number = 0;

    constructor() {
        this.init();
    }

    private getLocalCoords(e: MouseEvent): { x: number, y: number } {
        // ✨ AI ARCHITECTURE NOTE: Window-level mouse listeners lose canvas context.
        // We MUST manually calculate canvas pixels from screen coordinates using the scale (g.zoom).
        const can = document.getElementById('drawingCanvas') as HTMLCanvasElement;
        if (!can) return { x: 0, y: 0 };
        const rect = can.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) / g.zoom,
            y: (e.clientY - rect.top) / g.zoom
        };
    }

    init() {
        // Event listeners - using capture to intercept high-level events
        window.addEventListener('mousedown', (e: MouseEvent) => {
            const detail = (e as any).detail || {};
            // If it's a standard mouse event, calculate local coords
            const local = this.getLocalCoords(e);
            const x = detail.x ?? local.x;
            const y = detail.y ?? local.y;

            if (g.current_tool.id === Tool.VectorSelect.id) {
                this.handleMouseDown(e, x, y);
            } else if (this.isVectorTool(g.current_tool.id)) {
                this.handleMouseDown(e, x, y);
            }
        }, true);

        window.addEventListener('mousemove', (e: MouseEvent) => {
            const detail = (e as any).detail || {};
            const local = this.getLocalCoords(e);
            const x = detail.x ?? local.x;
            const y = detail.y ?? local.y;
            this.handleMouseMove(e, x, y);
        }, true);

        window.addEventListener('mouseup', (e: MouseEvent) => {
            this.handleMouseUp(e);
        }, true);

        window.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 'Escape' && this.isEditing) {
                this.cancelEdit();
            }
            if ((e.key === 'Delete' || e.key === 'Backspace') && this.isEditing) {
                this.deleteSelectedShape();
            }
        });

        // Property change listeners
        window.addEventListener('colorChanged', (e: any) => this.handlePropertyChange('color', e.detail.color));
        window.addEventListener('secondaryColorChanged', (e: any) => this.handlePropertyChange('fillColor', e.detail.color));
        window.addEventListener('syncOpacity', (e: any) => this.handlePropertyChange('opacity', parseFloat(e.detail.value) / 100));
        window.addEventListener('penWidthChanged', (e: any) => this.handlePropertyChange('width', e.detail.value));
        window.addEventListener('hardnessChanged', (e: any) => this.handlePropertyChange('hardness', e.detail.value));
        window.addEventListener('cornerRadiusChanged', (e: any) => this.handlePropertyChange('cornerRadius', e.detail.value));
        window.addEventListener('fillChanged', (e: any) => this.handlePropertyChange('fill', e.detail.value));

        this.createOverlayUI();
    }

    private isVectorTool(toolId: string): boolean {
        return [
            Tool.Line.id, 
            Tool.Rectangle.id, 
            Tool.Circle.id, 
            Tool.Ellipse.id, 
            Tool.Rounded_Rectangle.id
        ].includes(toolId);
    }

    private handlePropertyChange(prop: string, value: any) {
        if (!this.isEditing || this.selectedShapeIndex === -1) return;
        const layer = getActiveLayer();
        if (!layer || !layer.shapes) return;
        const shape = layer.shapes[this.selectedShapeIndex];
        if (shape) {
            if (prop === 'fillColor') {
                shape.style.fillColor = value;
            } else if (prop === 'fill') {
                shape.style.fill = value;
            } else {
                (shape.style as any)[prop] = value;
            }
            if (window.renderLayers) window.renderLayers();
        }
    }

    private createOverlayUI() {
        if (typeof document === 'undefined') return;
        this.overlay = document.createElement('div');
        this.overlay.id = 'vector-edit-overlay';
        this.overlay.style.cssText = `
            position: absolute;
            border: 1px dashed #007bff;
            display: none;
            z-index: 1000;
            box-sizing: border-box;
            background: rgba(0, 123, 255, 0.05);
            pointer-events: none;
        `;

        this.controls = document.createElement('div');
        this.controls.id = 'vector-edit-controls';
        this.controls.style.cssText = `
            position: absolute;
            top: -40px;
            right: 0;
            display: flex;
            gap: 8px;
            padding: 5px;
            background: #222;
            border-radius: 4px;
            border: 1px solid #444;
            pointer-events: auto;
        `;

        const moveHandle = document.createElement('div');
        moveHandle.innerHTML = 'Position';
        moveHandle.style.cssText = 'color: #ccc; font-size: 11px; cursor: move; padding: 2px 5px; user-select: none;';
        moveHandle.onmousedown = (e) => this.onOverlayDragStart(e);

        const okBtn = document.createElement('button');
        okBtn.innerText = 'OK';
        okBtn.style.cssText = 'background: #28a745; color: white; border: none; padding: 2px 8px; border-radius: 2px; cursor: pointer; font-size: 11px; font-weight: bold;';
        okBtn.onclick = (e) => { e.stopPropagation(); this.commitEdit(); };

        const cancelBtn = document.createElement('button');
        cancelBtn.innerText = 'Cancel';
        cancelBtn.style.cssText = 'background: #dc3545; color: white; border: none; padding: 2px 8px; border-radius: 2px; cursor: pointer; font-size: 11px; font-weight: bold;';
        cancelBtn.onclick = (e) => { e.stopPropagation(); this.cancelEdit(); };

        this.controls.appendChild(moveHandle);
        this.controls.appendChild(okBtn);
        this.controls.appendChild(cancelBtn);
        this.overlay.appendChild(this.controls);

        // Resize handles
        const handles = ['n', 's', 'e', 'w', 'nw', 'ne', 'sw', 'se'];
        handles.forEach(dir => {
            const h = document.createElement('div');
            h.style.cssText = `
                position: absolute;
                width: 8px;
                height: 8px;
                background: white;
                border: 1px solid #007bff;
                pointer-events: auto;
            `;
            if (dir.includes('n')) h.style.top = '-4px';
            if (dir.includes('s')) h.style.bottom = '-4px';
            if (dir.includes('e')) h.style.right = '-4px';
            if (dir.includes('w')) h.style.left = '-4px';

            if (dir === 'n' || dir === 's') h.style.left = '50%';
            if (dir === 'e' || dir === 'w') h.style.top = '50%';
            if (dir === 'n' || dir === 's') h.style.marginLeft = '-4px';
            if (dir === 'e' || dir === 'w') h.style.marginTop = '-4px';

            h.style.cursor = `${dir}-resize`;
            h.onmousedown = (e) => this.onResizeStart(e, dir);
            if (this.overlay) this.overlay.appendChild(h);
            this.handles[dir] = h;
        });

        const wrapper = document.getElementById('canvasWrapper');
        if (wrapper) wrapper.appendChild(this.overlay);
    }

    public showWarning(show: boolean) {
        if (show) {
            tooltipManager.showWarning("⚠️ Vector Tool on Raster Layer");
        }
    }

    private onOverlayDragStart(e: MouseEvent) {
        this.isDraggingOverlay = true;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
        if (this.currentShape) {
            this.dragStartShapeX1 = this.currentShape.x1;
            this.dragStartShapeY1 = this.currentShape.y1;
            this.dragStartShapeX2 = this.currentShape.x2;
            this.dragStartShapeY2 = this.currentShape.y2;
        }
        e.stopPropagation();
    }

    private onResizeStart(e: MouseEvent, dir: string) {
        this.isResizing = true;
        this.resizeDir = dir;
        this.resizeStartX = e.clientX;
        this.resizeStartY = e.clientY;
        if (this.currentShape) {
            this.resizeStartShape = JSON.parse(JSON.stringify(this.currentShape));
        }
        e.stopPropagation();
    }

    private handleMouseDown(_e: MouseEvent, x: number, y: number) {
        const activeLayer = getActiveLayer();
        if (!activeLayer) return;

        if (g.current_tool.id === Tool.VectorSelect.id) {
            if (this.isEditing) return;
            this.trySelectShapeAt(x, y);
            return;
        }

        if (this.isEditing) {
            // Already editing, just handle the click
            return;
        }

        // ONLY allow vector tools on vector layers for VTM.
        // If it's a raster layer, they should be handled by drawing_canvas.ts as raster tools (Rasterization).
        if (activeLayer.type === 'raster') {
            return;
        }

        this.isDrawing = true;
        this.startX = x;
        this.startY = y;
        this.activeLayerIndex = g.activeLayerIndex;

        this.currentShape = {
            id: 'v-' + Date.now(),
            type: this.getShapeTypeFromTool(g.current_tool.id) as any,
            x1: x, y1: y, x2: x, y2: y,
            style: {
                color: g.pen_color,
                width: g.pen_width,
                opacity: g.pen_opacity,
                cap: g.pen_cap,
                hardness: g.brush_hardness,
                cornerRadius: g.round_rect_corner_radius,
                fill: !!g.shape_fill,
                fillColor: g.pen_secondary_color
            }
        };
    }

    private handleMouseMove(e: MouseEvent, x: number, y: number) {
        if (g.current_tool.id === Tool.VectorSelect.id && !this.isEditing && !this.isDrawing) {
            this.updateCursor(x, y);
        }

        if (this.isDraggingOverlay && this.currentShape) {
            const dx = (e.clientX - this.dragStartX) / g.zoom;
            const dy = (e.clientY - this.dragStartY) / g.zoom;
            this.currentShape.x1 = this.dragStartShapeX1 + dx;
            this.currentShape.y1 = this.dragStartShapeY1 + dy;
            this.currentShape.x2 = this.dragStartShapeX2 + dx;
            this.currentShape.y2 = this.dragStartShapeY2 + dy;
            this.updateOverlay(this.currentShape);
            if (window.renderLayers) window.renderLayers();
            return;
        }

        if (this.isResizing && this.currentShape && this.resizeStartShape) {
            const dx = (e.clientX - this.resizeStartX) / g.zoom;
            const dy = (e.clientY - this.resizeStartY) / g.zoom;
            const s = this.resizeStartShape;

            if (this.resizeDir.includes('e')) this.currentShape.x2 = s.x2 + dx;
            if (this.resizeDir.includes('w')) this.currentShape.x1 = s.x1 + dx;
            if (this.resizeDir.includes('s')) this.currentShape.y2 = s.y2 + dy;
            if (this.resizeDir.includes('n')) this.currentShape.y1 = s.y1 + dy;

            this.updateOverlay(this.currentShape);
            if (window.renderLayers) window.renderLayers();
            return;
        }

        if (!this.isDrawing || !this.currentShape) return;

        this.currentShape.x2 = x;
        this.currentShape.y2 = y;
        if (window.renderLayers) window.renderLayers();
    }

    private updateCursor(x: number, y: number) {
        const layer = layers[g.activeLayerIndex];
        const can = document.getElementById('drawingCanvas');
        if (!can || !layer || !layer.shapes) {
            if (can) can.style.cursor = 'crosshair';
            return;
        }

        let found = false;
        for (let i = layer.shapes.length - 1; i >= 0; i--) {
            if (this.isPointInShape(layer.shapes[i], x, y)) {
                found = true;
                break;
            }
        }
        can.style.cursor = found ? 'pointer' : 'crosshair';
    }

    private handleMouseUp(_e: MouseEvent) {
        if (this.isDraggingOverlay || this.isResizing) {
            this.isDraggingOverlay = false;
            this.isResizing = false;
            return;
        }

        if (!this.isDrawing || !this.currentShape) return;
        this.isDrawing = false;

        const layer = layers[this.activeLayerIndex];
        if (layer) {
            if (!layer.shapes) layer.shapes = [];
            layer.shapes.push(this.currentShape);
            // Don't auto-edit after drawing, let user select it with VectorSelect if needed
        }

        if (window.renderLayers) window.renderLayers();
        if (window.finishDrawing) window.finishDrawing();
    }

    private getShapeTypeFromTool(toolId: string): string {
        if (toolId === Tool.Line.id) return 'line';
        if (toolId === Tool.Circle.id) return 'circle';
        if (toolId === Tool.Rectangle.id) return 'rect';
        if (toolId === Tool.Rounded_Rectangle.id) return 'roundrect';
        if (toolId === Tool.Ellipse.id) return 'ellipse';
        return 'rect';
    }

    public trySelectShapeAt(x: number, y: number) {
        const layer = layers[g.activeLayerIndex];
        if (!layer || !layer.shapes) return;

        for (let i = layer.shapes.length - 1; i >= 0; i--) {
            if (this.isPointInShape(layer.shapes[i], x, y)) {
                this.startEdit(i);
                return;
            }
        }
    }

    private isPointInShape(shape: Shape, x: number, y: number): boolean {
        const margin = 8; // Selection tolerance in pixels

        if (shape.type === 'line') {
            // Distance from point to line segment
            const L2 = Math.pow(shape.x2 - shape.x1, 2) + Math.pow(shape.y2 - shape.y1, 2);
            if (L2 === 0) return Math.sqrt(Math.pow(x - shape.x1, 2) + Math.pow(y - shape.y1, 2)) < margin;
            let t = ((x - shape.x1) * (shape.x2 - shape.x1) + (y - shape.y1) * (shape.y2 - shape.y1)) / L2;
            t = Math.max(0, Math.min(1, t));
            const dist = Math.sqrt(
                Math.pow(x - (shape.x1 + t * (shape.x2 - shape.x1)), 2) +
                Math.pow(y - (shape.y1 + t * (shape.y2 - shape.y1)), 2)
            );
            return dist < margin + (shape.style.width / 2);
        }

        if (shape.type === 'circle') {
            const r = Math.sqrt(Math.pow(shape.x2 - shape.x1, 2) + Math.pow(shape.y2 - shape.y1, 2));
            const dist = Math.sqrt(Math.pow(x - shape.x1, 2) + Math.pow(y - shape.y1, 2));
            // Select if near the stroke or inside the circle
            return dist <= r + margin;
        }

        if (shape.type === 'ellipse') {
            const rx = Math.abs(shape.x2 - shape.x1) / 2;
            const ry = Math.abs(shape.y2 - shape.y1) / 2;
            const cx = (shape.x1 + shape.x2) / 2;
            const cy = (shape.y1 + shape.y2) / 2;
            
            if (rx === 0 || ry === 0) return false;
            
            // Equation of ellipse: (x-cx)^2/rx^2 + (y-cy)^2/ry^2 <= 1
            const val = Math.pow(x - cx, 2) / Math.pow(rx + margin, 2) + 
                        Math.pow(y - cy, 2) / Math.pow(ry + margin, 2);
            return val <= 1;
        }

        // Default: Rectangle bounding box for 'rect' and 'roundrect'
        const left = Math.min(shape.x1, shape.x2) - margin;
        const right = Math.max(shape.x1, shape.x2) + margin;
        const top = Math.min(shape.y1, shape.y2) - margin;
        const bottom = Math.max(shape.y1, shape.y2) + margin;
        return x >= left && x <= right && y >= top && y <= bottom;
    }

    public startEdit(index: number) {
        const layer = layers[g.activeLayerIndex];
        if (!layer || !layer.shapes || !layer.shapes[index]) return;

        this.isEditing = true;
        this.selectedShapeIndex = index;
        this.currentShape = layer.shapes[index];
        this.originalShape = JSON.parse(JSON.stringify(this.currentShape));
        layer.isBeingEdited = true;

        this.updateOverlay(this.currentShape as Shape);
        if (this.overlay) this.overlay.style.display = 'block';
        this.notifyVectorSelectionChanged(true, this.currentShape?.type, this.currentShape?.style);
        if (window.renderLayers) window.renderLayers();
    }

    public updateOverlay(shape: Shape) {
        if (!this.overlay) return;
        
        let left, top, w, h;
        if (shape.type === 'circle') {
            const r = Math.sqrt(Math.pow(shape.x2 - shape.x1, 2) + Math.pow(shape.y2 - shape.y1, 2));
            left = shape.x1 - r;
            top = shape.y1 - r;
            w = r * 2;
            h = r * 2;
        } else {
            left = Math.min(shape.x1, shape.x2);
            top = Math.min(shape.y1, shape.y2);
            w = Math.abs(shape.x2 - shape.x1);
            h = Math.abs(shape.y2 - shape.y1);
        }

        this.overlay.style.left = (left * g.zoom) + 'px';
        this.overlay.style.top = (top * g.zoom) + 'px';
        this.overlay.style.width = (w * g.zoom) + 'px';
        this.overlay.style.height = (h * g.zoom) + 'px';
    }

    public commitEdit() {
        if (!this.isEditing) return;
        const layer = layers[g.activeLayerIndex];
        if (layer) layer.isBeingEdited = false;
        this.isEditing = false;
        if (this.overlay) this.overlay.style.display = 'none';
        this.notifyVectorSelectionChanged(false);
        if (window.renderLayers) window.renderLayers();
        if (window.finishDrawing) window.finishDrawing();
    }

    public cancelEdit() {
        if (!this.isEditing) return;
        const layer = layers[g.activeLayerIndex];
        if (layer && layer.shapes && this.originalShape) {
            layer.shapes[this.selectedShapeIndex] = this.originalShape;
            layer.isBeingEdited = false;
        }
        this.isEditing = false;
        if (this.overlay) this.overlay.style.display = 'none';
        this.notifyVectorSelectionChanged(false);
        if (window.renderLayers) window.renderLayers();
    }

    public deleteSelectedShape() {
        if (!this.isEditing) return;
        const layer = layers[g.activeLayerIndex];
        if (layer && layer.shapes) {
            layer.shapes.splice(this.selectedShapeIndex, 1);
            layer.isBeingEdited = false;
        }
        this.isEditing = false;
        if (this.overlay) this.overlay.style.display = 'none';
        this.notifyVectorSelectionChanged(false);
        if (window.renderLayers) window.renderLayers();
        if (window.finishDrawing) window.finishDrawing();
    }

    public notifyVectorSelectionChanged(hasSelection: boolean, shapeType: string | null = null, style: any = null) {
        window.vectorSelection = { hasSelection, shapeType, style };
        window.dispatchEvent(new CustomEvent('vectorShapeSelectionChanged', { detail: { hasSelection, shapeType, style } }));
    }

    public drawShapes(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, shapes: Shape[]) {
        if (!shapes) return;
        shapes.forEach(s => {
            ctx.save();
            if (this.isEditing && s === this.currentShape) {
                ctx.globalAlpha = (s.style.opacity || 1.0) * 0.7;
            } else {
                ctx.globalAlpha = s.style.opacity || 1.0;
            }
            this.drawSingleShape(ctx, s);
            ctx.restore();
        });
    }

    private drawSingleShape(ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, s: Shape) {
        ctx.beginPath();
        ctx.strokeStyle = s.style.color;
        ctx.fillStyle = s.style.fillColor || 'transparent';
        ctx.lineWidth = s.style.width;
        ctx.lineCap = s.style.cap || 'round';
        ctx.lineJoin = 'round';

        if (s.type === 'line') {
            ctx.moveTo(s.x1, s.y1);
            ctx.lineTo(s.x2, s.y2);
        } else if (s.type === 'rect') {
            ctx.rect(s.x1, s.y1, s.x2 - s.x1, s.y2 - s.y1);
        } else if (s.type === 'circle') {
            const r = Math.sqrt(Math.pow(s.x2 - s.x1, 2) + Math.pow(s.y2 - s.y1, 2));
            ctx.arc(s.x1, s.y1, r, 0, Math.PI * 2);
        } else if (s.type === 'ellipse') {
            const rx = Math.abs(s.x2 - s.x1) / 2;
            const ry = Math.abs(s.y2 - s.y1) / 2;
            const cx = (s.x1 + s.x2) / 2;
            const cy = (s.y1 + s.y2) / 2;
            ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        } else if (s.type === 'roundrect') {
            const x = Math.min(s.x1, s.x2);
            const y = Math.min(s.y1, s.y2);
            const w = Math.abs(s.x2 - s.x1);
            const h = Math.abs(s.y2 - s.y1);
            const r = s.style.cornerRadius || 10;
            if ((ctx as any).roundRect) (ctx as any).roundRect(x, y, w, h, r);
            else ctx.rect(x, y, w, h);
        }
        if (s.style.fill) ctx.fill();
        ctx.stroke();
    }
}

export const vectorToolManager = new VectorToolManager();
(window as any).vectorToolManager = vectorToolManager;

// ✨ UI UX IMPROVMENT: Vector selection handles need to follow zoom!
window.addEventListener('zoomChanged', () => {
    if (vectorToolManager.isEditing && vectorToolManager.currentShape) {
        vectorToolManager.updateOverlay(vectorToolManager.currentShape as Shape);
    }
});
