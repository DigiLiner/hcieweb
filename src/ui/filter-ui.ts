import { g, layers } from '../core/globals';
import { renderLayers, updateLayerPanel } from '../canvas/layers';
import { 
    applySepia, 
    applyBoxBlur, 
    applyMelt, 
    applyShear, 
    applyMosaic 
} from '../canvas/filters';

/**
 * Filter UI Helper Functions
 * Manages slider updates and applies filters to the active layer.
 * Ported and enhanced from legacy filter_ui.js.
 */

export function updateBlurValue(value: string | number): void {
    const val = typeof value === 'string' ? parseInt(value) : value;
    const label = document.getElementById('blurRadiusValue');
    if (label) label.textContent = val.toString();
    g.blur_radius = val;
}

export function updateMeltValue(value: string | number): void {
    const val = typeof value === 'string' ? parseInt(value) : value;
    const label = document.getElementById('meltAmountValue');
    if (label) label.textContent = val.toString();
    g.melt_amount = val;
}

export function updateShearValue(value: string | number): void {
    const val = typeof value === 'string' ? parseInt(value) : value;
    const label = document.getElementById('shearAmountValue');
    if (label) label.textContent = val.toString();
    g.shear_amount = val;
}

export function updateMosaicValue(value: string | number): void {
    const val = typeof value === 'string' ? parseInt(value) : value;
    const label = document.getElementById('mosaicSizeValue');
    if (label) label.textContent = val.toString();
    g.mosaic_block_size = val;
}

/**
 * Common logic to apply a filter to the active layer
 */
function applyToActiveLayer(filterFn: (imageData: ImageData) => void | ImageData): void {
    const layer = layers[g.activeLayerIndex];
    if (!layer || layer.locked || !layer.visible) {
        console.warn('Cannot apply filter: layer is locked, hidden, or selected index invalid');
        return;
    }

    const ctx = layer.ctx as CanvasRenderingContext2D;
    const width = layer.canvas.width;
    const height = layer.canvas.height;
    
    // Capture state for undo
    const oldData = ctx.getImageData(0, 0, width, height);
    
    // Apply filter
    const imageData = ctx.getImageData(0, 0, width, height);
    const result = filterFn(imageData);
    
    if (result instanceof ImageData) {
        ctx.putImageData(result, 0, 0);
    } else {
        ctx.putImageData(imageData, 0, 0);
    }
    
    // Record history
    if ((window as any).historyManager) {
        const newData = ctx.getImageData(0, 0, width, height);
        // We need a DrawAction or similar
        const DrawActionClass = (window as any).DrawAction;
        if (DrawActionClass) {
            (window as any).historyManager.push(new DrawActionClass(g.activeLayerIndex, oldData, newData));
        }
    }

    renderLayers();
    updateLayerPanel();
}

export function applyFilterSepia(): void {
    applyToActiveLayer((imgData) => applySepia(imgData));
}

export function applyFilterBlur(): void {
    applyToActiveLayer((imgData) => applyBoxBlur(imgData, g.blur_radius || 3));
}

export function applyFilterMelt(): void {
    applyToActiveLayer((imgData) => applyMelt(imgData, g.melt_amount || 30));
}

export function applyFilterShear(): void {
    const checkbox = document.getElementById('shearHorizontalCheckbox') as HTMLInputElement;
    const horizontal = checkbox ? checkbox.checked : true;
    applyToActiveLayer((imgData) => applyShear(imgData, g.shear_amount || 40, horizontal, g.shear_direction || 1));
}

export function applyFilterMosaic(): void {
    applyToActiveLayer((imgData) => applyMosaic(imgData, g.mosaic_block_size || 10));
}

// Global exposure for legacy index.html onclick/oninput
(window as any).updateBlurValue = updateBlurValue;
(window as any).updateMeltValue = updateMeltValue;
(window as any).updateShearValue = updateShearValue;
(window as any).updateMosaicValue = updateMosaicValue;
(window as any).applyFilterSepia = applyFilterSepia;
(window as any).applyFilterBlur = applyFilterBlur;
(window as any).applyFilterMelt = applyFilterMelt;
(window as any).applyFilterShear = applyFilterShear;
(window as any).applyFilterMosaic = applyFilterMosaic;
