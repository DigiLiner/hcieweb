import { g, layers, Tool } from '../core/globals';
import { renderLayers, renderTextLayer, addLayer, updateLayerPanel, selectLayer } from '../canvas/layers';

/**
 * Text Tool Logic
 * Manages the interactive text-input overlay and its commitment to raster/text layers.
 * Ported from legacy text_tool.js.
 */
export class TextTool {
    private overlay: HTMLElement;
    private input: HTMLTextAreaElement;
    private canvas: HTMLCanvasElement;
    private activeLayerIndex: number = -1;
    private isEditing: boolean = false;
    private isDragging: boolean = false;

    // Drag state
    private dragStartX: number = 0;
    private dragStartY: number = 0;
    private initialLeft: number = 0;
    private initialTop: number = 0;

    constructor() {
        this.overlay = document.getElementById('textToolOverlay')!;
        this.input = document.getElementById('textToolInput') as HTMLTextAreaElement;
        this.canvas = document.getElementById('drawingCanvas') as HTMLCanvasElement;

        this.init();
    }

    private init() {
        // Bind methods
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.commitText = this.commitText.bind(this);
        this.cancelText = this.cancelText.bind(this);
        this.handleInput = this.handleInput.bind(this);
        this.onDragStart = this.onDragStart.bind(this);
        this.onDragMove = this.onDragMove.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
        this.handleDocumentClick = this.handleDocumentClick.bind(this);

        // Attach Canvas Listeners
        this.canvas.addEventListener('mousedown', this.handleMouseDown);

        // Attach Input Listeners
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.commitText();
                e.preventDefault();
            }
            if (e.key === 'Escape') {
                this.cancelText();
            }
            e.stopPropagation();
        });
        this.input.addEventListener('input', this.handleInput);

        // Listen for Property Changes
        window.addEventListener('textPropertyChanged' as any, (e: any) => {
            if (!this.isEditing) return;

            const { prop, value } = e.detail;
            if (prop === 'size') {
                this.input.style.fontSize = (value * g.zoom) + 'px';
                this.handleInput(); 
                this.updateActiveLayerProp('size', value);
            } else if (prop === 'font') {
                this.input.style.fontFamily = value;
                this.handleInput();
                this.updateActiveLayerProp('font', value);
            } else if (prop === 'color') {
                this.input.style.color = value;
                this.updateActiveLayerProp('color', value);
                this.input.focus();
            }
        });

        // Initialize Overlay UI
        this.createOverlayUI();

        // Listen for Global Color Changes
        window.addEventListener('colorChanged' as any, (e: any) => {
            if (this.isEditing) {
                const newColor = e.detail.color;
                this.input.style.color = newColor;
                this.updateActiveLayerProp('color', newColor);
                this.input.focus();
            }
        });
    }

    private createOverlayUI() {
        let toolsContainer = document.getElementById('textToolControls');
        if (!toolsContainer) {
            toolsContainer = document.createElement('div');
            toolsContainer.id = 'textToolControls';
            toolsContainer.className = 'text-tool-controls';
            toolsContainer.style.cssText = 'position: absolute; top: -28px; left: 0; display: flex; gap: 2px; z-index: 101;';
            this.overlay.appendChild(toolsContainer);

            // Move Handle
            const handle = document.createElement('div');
            handle.className = 'text-tool-handle';
            handle.innerHTML = 'Move';
            handle.style.cssText = 'background: #333; color: #fff; padding: 4px 8px; font-size: 11px; cursor: move; border-radius: 3px; user-select: none; display: flex; align-items: center;';
            handle.addEventListener('mousedown', this.onDragStart);
            toolsContainer.appendChild(handle);

            // OK Button
            const btnOk = document.createElement('div');
            btnOk.innerHTML = '✓';
            btnOk.title = 'Confirm (Ctrl+Enter)';
            btnOk.style.cssText = 'background: #28a745; color: #fff; padding: 4px 8px; font-size: 12px; cursor: pointer; border-radius: 3px; user-select: none; display: flex; align-items: center;';
            btnOk.addEventListener('click', (e) => {
                e.stopPropagation();
                this.commitText();
            });
            toolsContainer.appendChild(btnOk);

            // Cancel Button
            const btnCancel = document.createElement('div');
            btnCancel.innerHTML = '✕';
            btnCancel.title = 'Cancel (Esc)';
            btnCancel.style.cssText = 'background: #dc3545; color: #fff; padding: 4px 8px; font-size: 12px; cursor: pointer; border-radius: 3px; user-select: none; display: flex; align-items: center;';
            btnCancel.addEventListener('click', (e) => {
                e.stopPropagation();
                this.cancelText();
            });
            toolsContainer.appendChild(btnCancel);
        }
    }

    private updateActiveLayerProp(prop: string, value: any) {
        if (this.activeLayerIndex >= 0) {
            const layer = layers[this.activeLayerIndex];
            if (layer && layer.type === 'text') {
                (layer.textData as any)[prop] = value;
                renderTextLayer(layer);
                renderLayers();
            }
        }
        setTimeout(() => this.input.focus(), 10);
    }

    private handleMouseDown(e: MouseEvent) {
        if (g.current_tool !== Tool.Text) return;

        if ((e.target as HTMLElement).closest('#textToolControls') || (e.target as HTMLElement).closest('#textToolOverlay')) {
            return;
        }

        e.preventDefault(); 

        if (this.isEditing) return;

        const rect = this.canvas.getBoundingClientRect();
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;

        const x = screenX / g.zoom;
        const y = screenY / g.zoom;

        for (let i = layers.length - 1; i >= 0; i--) {
            const layer = layers[i];
            if (layer.visible && layer.type === 'text') {
                if (this.hitTest(layer, x, y)) {
                    if (g.activeLayerIndex !== i) selectLayer(i);
                    this.startEditing(x, y, i);
                    return;
                }
            }
        }

        this.startEditing(x, y, -1);
    }

    private hitTest(layer: any, x: number, y: number): boolean {
        const data = layer.textData;
        if (!data) return false;

        const ctx = layer.ctx as CanvasRenderingContext2D;
        ctx.save();
        const style = data.italic ? 'italic' : 'normal';
        const weight = data.bold ? 'bold' : 'normal';
        ctx.font = `${style} ${weight} ${data.size}px ${data.font}, "Roboto", sans-serif`;

        const lines = (data.text || "").split('\n');
        let maxWidth = 0;
        lines.forEach((line: string) => {
            const w = ctx.measureText(line).width;
            if (w > maxWidth) maxWidth = w;
        });

        const lineHeight = data.size * 1.2;
        const totalHeight = lines.length * lineHeight;
        ctx.restore();

        return (x >= data.x && x <= data.x + maxWidth &&
            y >= data.y && y <= data.y + totalHeight);
    }

    private startEditing(x: number, y: number, existingLayerIndex = -1) {
        this.isEditing = true;
        this.activeLayerIndex = existingLayerIndex;

        this.overlay.style.display = 'block';
        this.overlay.style.left = (x * g.zoom) + 'px';
        this.overlay.style.top = (y * g.zoom) + 'px';

        this.input.style.cssText = `
            background: transparent; border: none; outline: 1px dashed #000;
            min-width: 10px; min-height: 10px; display: block; padding: 0; margin: 0;
            line-height: 1.2; overflow: hidden; resize: none; white-space: pre;
        `;

        let text = "";
        let fontSize = g.text_size || 40;
        let fontFamily = g.text_font || "Roboto";
        let color = g.pen_color;

        if (existingLayerIndex >= 0) {
            const layer = layers[existingLayerIndex];
            text = layer.textData.text;
            fontSize = layer.textData.size;
            fontFamily = layer.textData.font;
            color = layer.textData.color;

            this.overlay.style.left = (layer.textData.x * g.zoom) + 'px';
            this.overlay.style.top = (layer.textData.y * g.zoom) + 'px';

            layer.isBeingEdited = true;
            renderTextLayer(layer);
            renderLayers();
        }

        this.input.value = text;
        this.input.style.fontSize = (fontSize * g.zoom) + 'px';
        this.input.style.fontFamily = fontFamily;
        this.input.style.color = color;
        this.handleInput();

        setTimeout(() => {
            document.addEventListener('mousedown', this.handleDocumentClick);
        }, 100);

        setTimeout(() => this.input.focus(), 10);
    }

    private handleInput() {
        this.input.style.width = '0px';
        this.input.style.height = '0px';
        this.input.style.width = (this.input.scrollWidth + 10) + 'px';
        this.input.style.height = (this.input.scrollHeight + 10) + 'px';
    }

    private onDragStart(e: MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        this.isDragging = true;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;

        this.initialLeft = parseFloat(this.overlay.style.left) || 0;
        this.initialTop = parseFloat(this.overlay.style.top) || 0;

        document.addEventListener('mousemove', this.onDragMove);
        document.addEventListener('mouseup', this.onDragEnd);
    }

    private onDragMove(e: MouseEvent) {
        if (!this.isDragging) return;
        const dx = e.clientX - this.dragStartX;
        const dy = e.clientY - this.dragStartY;

        const newLeft = this.initialLeft + dx;
        const newTop = this.initialTop + dy;

        this.overlay.style.left = newLeft + 'px';
        this.overlay.style.top = newTop + 'px';

        if (this.activeLayerIndex >= 0) {
            const layer = layers[this.activeLayerIndex];
            if (layer && layer.type === 'text') {
                layer.textData.x = newLeft / g.zoom;
                layer.textData.y = newTop / g.zoom;
            }
        }
    }

    private onDragEnd(_e: MouseEvent) {
        if (this.isDragging) {
            this.isDragging = false;
            document.removeEventListener('mousemove', this.onDragMove);
            document.removeEventListener('mouseup', this.onDragEnd);
            this.input.focus();
        }
    }

    private handleDocumentClick(e: MouseEvent) {
        if (!this.isEditing) return;
        if (this.overlay.contains(e.target as Node)) return;

        if ((e.target as HTMLElement).closest('.properties-panel') ||
            (e.target as HTMLElement).closest('#propertiesPanel') ||
            (e.target as HTMLElement).closest('#historyPanel') ||
            (e.target as HTMLElement).closest('.panel') ||
            (e.target as HTMLElement).closest('.color-picker-panel') ||
            (e.target as HTMLElement).closest('.tool-options-bar')) {
            return;
        }

        this.commitText();
    }

    public commitText() {
        document.removeEventListener('mousedown', this.handleDocumentClick);

        if (!this.isEditing) return;

        const text = this.input.value;
        const screenX = parseFloat(this.overlay.style.left);
        const screenY = parseFloat(this.overlay.style.top);

        const x = screenX / g.zoom;
        const y = screenY / g.zoom;

        this.overlay.style.display = 'none';
        this.isEditing = false;

        if (!text.trim()) {
            if (this.activeLayerIndex >= 0) {
                 // Might want to delete layer if it becomes empty? 
                 // Leaving it for now as per legacy behavior.
                 layers[this.activeLayerIndex].isBeingEdited = false;
                 renderTextLayer(layers[this.activeLayerIndex]);
                 renderLayers();
            }
            return;
        }

        const currentInputFontSize = parseFloat(this.input.style.fontSize);
        const realFontSize = currentInputFontSize / g.zoom;

        if (this.activeLayerIndex === -1) {
            addLayer("Text Layer");
            const layer = layers[g.activeLayerIndex];
            layer.type = 'text';
            layer.textData = {
                text: text,
                x: x,
                y: y,
                font: this.input.style.fontFamily.replace(/"/g, ''),
                size: realFontSize,
                color: this.input.style.color,
                bold: false,
                italic: false
            };

            renderTextLayer(layer);
            renderLayers();
            updateLayerPanel();
        } else {
            const layer = layers[this.activeLayerIndex];
            if (layer && layer.type === 'text') {
                layer.isBeingEdited = false;
                layer.textData.text = text;
                layer.textData.x = x;
                layer.textData.y = y;
                renderTextLayer(layer);
                renderLayers();
            }
        }
    }

    public cancelText() {
        document.removeEventListener('mousedown', this.handleDocumentClick);
        this.overlay.style.display = 'none';
        this.isEditing = false;

        if (this.activeLayerIndex >= 0 && layers[this.activeLayerIndex]) {
            layers[this.activeLayerIndex].isBeingEdited = false;
            renderTextLayer(layers[this.activeLayerIndex]);
        }

        this.input.value = '';
        renderLayers();
    }
}

// Global instance for legacy interop
(window as any).textTool = new TextTool();
