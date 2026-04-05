/**
 * @file selection-coordinator.ts
 * @description Handles selection history and universal selection change capture.
 */

import { g } from '@hcie/core';
import { EventBus } from '@hcie/shared';

export function captureSelectionState() {
    return {
        mask: g.selectionMask ? {
            data: new Uint8ClampedArray(g.selectionMask.data),
            width: g.selectionMask.width,
            height: g.selectionMask.height
        } : null,
        border: g.selectionBorder ? JSON.parse(JSON.stringify(g.selectionBorder)) : []
    };
}

export function applySelectionState(state: any) {
    (g as any).selectionMask = state.mask ? new ImageData(new Uint8ClampedArray(state.mask.data), state.mask.width, state.mask.height) : null;
    (g as any).selectionBorder = state.border ? JSON.parse(JSON.stringify(state.border)) : [];
    (g as any).isSelectionActive = !!state.mask || (state.border && state.border.length > 0);
    
    if (state.mask) {
        const canvas = document.createElement('canvas');
        canvas.width = state.mask.width;
        canvas.height = state.mask.height;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.putImageData(new ImageData(new Uint8ClampedArray(state.mask.data), canvas.width, canvas.height), 0, 0);
        (g as any).selectionCanvas = canvas;
    } else {
        (g as any).selectionCanvas = null;
    }

    EventBus.emit('RENDER_LAYERS');
}

class SelectionAction {
    constructor(public description: string, public before: any, public after: any) {}
    undo() { applySelectionState(this.before); }
    redo() { applySelectionState(this.after); }
}

export function initSelectionCoordinator() {
    const can = document.getElementById("drawingCanvas") as HTMLCanvasElement;
    if (!can) return;

    const recordChange = (actionName: string | null, before: any) => {
        const after = captureSelectionState();
        const maskChanged = (!!before.mask !== !!after.mask);
        const borderChanged = JSON.stringify(before.border) !== JSON.stringify(after.border);

        if (maskChanged || borderChanged) {
            const activeHM = (window as any).historyManager;
            if (activeHM && typeof activeHM.push === 'function') {
                const toolName = actionName || g.current_tool?.name || 'Seçim Değişikliği';
                activeHM.push(new SelectionAction(toolName, before, after));
            }
        }
    };

    can.addEventListener('mousedown', (e) => {
        if (e.buttons === 1 || e.buttons === 2) {
            (window as any)._selectionBefore = captureSelectionState();
        }
    }, true);

    can.addEventListener('mouseup', (e) => {
        setTimeout(() => {
            if ((window as any)._selectionBefore) {
                recordChange(null, (window as any)._selectionBefore);
                (window as any)._selectionBefore = null;
            }
        }, 50);
    }, true);
}
