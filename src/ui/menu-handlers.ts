import { g, layers } from '../core/globals';
import { historyManager, DrawAction } from '../core/history';
import { renderLayers, updateLayerPanel } from '../canvas/layers';
import { api } from '../io/api';
import { ProjectIO } from '../io/project-io';
import { newDocument } from '../core/document';
import * as filters from '../canvas/filters';

/**
 * Menu Handlers
 * This module provides global functions that are called by onclick attributes in index.html.
 * It bridges the modular TypeScript codebase with the legacy HTML-based UI.
 */

// --- File Operations ---

export async function handleOpenFile() {
    try {
        const filePath = await api.openFile();
        if (!filePath) return;

        console.log('Opening file:', filePath);

        if (filePath.toLowerCase().endsWith('.hcie')) {
            const content = await api.readFile(filePath);
            if (content) {
                await ProjectIO.loadProject(content);
                g.filepath = filePath;
                const el = document.getElementById('filePath');
                if (el) el.innerText = filePath;
            }
        } else if (filePath.toLowerCase().endsWith('.psd')) {
            const buffer = await api.readFileBinary(filePath);
            if (buffer) {
                const psdObj = await (window as any).loadPsdFile(buffer.buffer);
                if (psdObj) {
                    await (window as any).applyPsdToCanvas(psdObj);
                    g.filepath = filePath;
                    const el = document.getElementById('filePath');
                    if (el) el.innerText = filePath;
                }
            }
        } else {
            // Assume it's an image
            const img = new Image();
            img.onload = () => {
                // If it's a direct open, maybe we should create a new document with this image?
                // For now, let's just add it to the active layer or create a new document.
                // The current behavior of "Open" usually means "Open as New Project" in editors.
                newDocument(filePath.split(/[/\\]/).pop() || 'Untitled', img.width, img.height);
                const activeLayer = layers[g.activeLayerIndex];
                if (activeLayer) {
                    (activeLayer.ctx as CanvasRenderingContext2D).drawImage(img, 0, 0);
                    renderLayers();
                    updateLayerPanel();
                }
                g.filepath = filePath;
                const el = document.getElementById('filePath');
                if (el) el.innerText = filePath;
            };
            // If it's a blob/data URL from web API, it's already set. 
            // If it's a native path from Tauri, we need to read it as binary then blob URL for security.
            if (window.__TAURI__ && !filePath.startsWith('blob:') && !filePath.startsWith('data:')) {
                api.readFileBinary(filePath).then(bytes => {
                    if (bytes) {
                        const ext = filePath.split('.').pop()?.toLowerCase() || 'png';
                        const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';
                        const blob = new Blob([bytes as any], { type: mime });
                        img.src = URL.createObjectURL(blob);
                    }
                }).catch(err => {
                    console.error('Failed to read image binary:', err);
                });
            } else {
                img.src = filePath;
            }
        }
    } catch (err) {
        console.error('Open failed:', err);
        alert(`Open failed: ${(err as Error).message}`);
    }
}

export async function handleSaveFile() {
    try {
        if (!g.filepath || g.filepath.toLowerCase().endsWith('.png') || g.filepath.toLowerCase().endsWith('.jpg')) {
            // If no path or path is an image (can't save project as image directly), do Save As
            return handleSaveAsFile();
        }

        const content = await ProjectIO.saveProject();
        const savedPath = await api.saveFile(content, g.filepath, false, 'hcie');
        if (savedPath) {
            console.log('File saved to:', savedPath);
            g.filepath = savedPath;
            const el = document.getElementById('filePath');
            if (el) el.innerText = savedPath;
        }
    } catch (err) {
        console.error('Save failed:', err);
    }
}

export async function handleSaveAsFile() {
    try {
        // 1. Ask for Format
        const format = await (window as any).DialogHandler.showFormatSelector() as 'hcie' | 'png' | 'psd' | null;
        if (!format) return; // User cancelled

        let content: string | Uint8Array;
        let type: 'hcie' | 'png' | 'psd' | 'jpg' = format === 'png' ? 'png' : (format === 'psd' ? 'psd' : 'hcie');

        // 2. Prepare Content based on format
        if (format === 'hcie') {
            content = await ProjectIO.saveProject();
        } else if (format === 'psd') {
            const bytes = await (window as any).savePsdFile(layers);
            if (!bytes) return;
            content = bytes;
        } else {
            // PNG (Export)
            const activeLayer = layers[g.activeLayerIndex];
            if (!activeLayer) return;
            content = (activeLayer.canvas as HTMLCanvasElement).toDataURL('image/png');
        }

        // 3. Save File (will trigger system dialog because saveas=true)
        const savedPath = await api.saveFile(content, g.filepath, true, type);
        if (savedPath) {
            console.log(`File saved as ${format} to:`, savedPath);
            if (format === 'hcie') {
                g.filepath = savedPath;
                const el = document.getElementById('filePath');
                if (el) el.innerText = savedPath;
            }
        }
    } catch (err) {
        console.error('Save As failed:', err);
    }
}

export async function handleExportFile() {
    try {
        const activeLayer = layers[g.activeLayerIndex];
        if (!activeLayer) return;

        const dataURL = (activeLayer.canvas as HTMLCanvasElement).toDataURL('image/png');
        await api.saveFile(dataURL, g.filepath, true, 'png');
    } catch (err) {
        console.error('Export failed:', err);
    }
}

// --- Edit Operations ---

export function undoImage() {
    historyManager.undo();
}

export function redoImage() {
    historyManager.redo();
}

export function clearCanvas() {
    const activeLayer = layers[g.activeLayerIndex];
    if (!activeLayer || activeLayer.locked) return;

    const ctx = activeLayer.ctx as CanvasRenderingContext2D;
    const oldData = ctx.getImageData(0, 0, g.image_width, g.image_height);
    
    ctx.clearRect(0, 0, g.image_width, g.image_height);
    
    const newData = ctx.getImageData(0, 0, g.image_width, g.image_height);
    historyManager.push(new DrawAction(g.activeLayerIndex, oldData, newData));
    
    renderLayers();
    updateLayerPanel();
}

// --- Filter Operations ---

export function applyFilter(type: string) {
    const activeLayer = layers[g.activeLayerIndex];
    if (!activeLayer || activeLayer.locked) return;

    const ctx = activeLayer.ctx as CanvasRenderingContext2D;
    const imageData = ctx.getImageData(0, 0, g.image_width, g.image_height);

    switch (type) {
        case 'negative':
        case 'invert':
            filters.applyNegative(imageData);
            break;
        case 'grayscale':
            filters.applyGrayscale(imageData);
            break;
        case 'sepia':
            filters.applySepia(imageData);
            break;
        case 'blur':
            // Using default radius from globals
            const blurred = filters.applyBoxBlur(imageData, g.blur_radius);
            ctx.putImageData(blurred, 0, 0);
            break;
        case 'mosaic':
            const pixelated = filters.applyMosaic(imageData, g.mosaic_block_size);
            ctx.putImageData(pixelated, 0, 0);
            break;
        default:
            console.warn('Unknown filter type:', type);
            return;
    }

    if (type !== 'blur' && type !== 'mosaic') {
        ctx.putImageData(imageData, 0, 0);
    }

    renderLayers();
    updateLayerPanel();
    // TODO: Add to history
}

// --- View Operations ---

export function zoomIn() {
    if ((window as any).zoomIn) {
        (window as any).zoomIn(null);
    }
}

export function zoomOut() {
    if ((window as any).zoomOut) {
        (window as any).zoomOut(null);
    }
}

// --- New Image Dialog ---

export function closeNewImageDialog() {
    const modal = document.getElementById('newImageModal');
    if (modal) modal.style.display = 'none';
}

export function openNewImageDialog() {
     const modal = document.getElementById('newImageModal');
    if (modal) {
        modal.style.display = 'block';
        // Reset to custom or default values if needed
    }
}

export function applyPreset() {
    const preset = (document.getElementById('imagePreset') as HTMLSelectElement).value;
    const widthInput = document.getElementById('newWidth') as HTMLInputElement;
    const heightInput = document.getElementById('newHeight') as HTMLInputElement;

    switch (preset) {
        case 'hd':
            widthInput.value = '1280';
            heightInput.value = '720';
            break;
        case 'fhd':
            widthInput.value = '1920';
            heightInput.value = '1080';
            break;
        case '4k':
            widthInput.value = '3840';
            heightInput.value = '2160';
            break;
        case 'a4':
            widthInput.value = '2480';
            heightInput.value = '3508';
            break;
        case 'square':
            widthInput.value = '1024';
            heightInput.value = '1024';
            break;
        case 'custom':
            // Don't change values
            break;
    }
}

export function setOrientation(orientation: 'portrait' | 'landscape') {
    const widthInput = document.getElementById('newWidth') as HTMLInputElement;
    const heightInput = document.getElementById('newHeight') as HTMLInputElement;
    const width = parseInt(widthInput.value);
    const height = parseInt(heightInput.value);

    const btnPortrait = document.getElementById('btn-portrait');
    const btnLandscape = document.getElementById('btn-landscape');

    if (orientation === 'portrait') {
        if (width > height) {
            widthInput.value = height.toString();
            heightInput.value = width.toString();
        }
        btnPortrait?.classList.add('btn-active');
        btnLandscape?.classList.remove('btn-active');
    } else {
        if (height > width) {
            widthInput.value = height.toString();
            heightInput.value = width.toString();
        }
        btnLandscape?.classList.add('btn-active');
        btnPortrait?.classList.remove('btn-active');
    }
}

export function createNewImage() {
    const width = parseInt((document.getElementById('newWidth') as HTMLInputElement).value);
    const height = parseInt((document.getElementById('newHeight') as HTMLInputElement).value);
    const name = "Untitled"; 
    
    const bgColor = (document.getElementById('newBgColor') as HTMLInputElement).value;
    const isTransparent = (document.getElementById('transparentBg') as HTMLInputElement).checked;

    newDocument(name, width, height);

    // After newDocument, the active layer is the Background layer.
    const activeLayer = layers[g.activeLayerIndex];
    if (activeLayer) {
        const ctx = activeLayer.ctx as CanvasRenderingContext2D;
        ctx.clearRect(0, 0, width, height);
        if (!isTransparent) {
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, width, height);
        }
    }
    
    closeNewImageDialog();
    renderLayers();
    updateLayerPanel();
}

// Expose to window
if (typeof window !== 'undefined') {
    Object.assign(window, {
        handleOpenFile,
        handleSaveFile,
        handleSaveAsFile,
        handleExportFile,
        undoImage,
        redoImage,
        clearCanvas,
        applyFilter,
        zoomIn,
        zoomOut,
        closeNewImageDialog,
        openNewImageDialog,
        applyPreset,
        setOrientation,
        createNewImage
    });
}
