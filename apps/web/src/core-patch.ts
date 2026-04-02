import { g, ImageDocument, HistoryManager, historyManager, renderImageTabs, appEvents } from '@hcie/core';

/**
 * Core Patch Controller
 * Overrides core library functions and proxies global state to fix issues:
 * #10010: Dialog/Splash Lifecycle
 * #10011: Undo/Redo Isolation
 * #10012: Selection History
 * #10013: History UI Sync
 * #10014: Brush Visibility/Event Cleanup
 */
export function applyCorePatch() {
    console.log("[CorePatch] Applying advanced proxies and patches...");

    const w = window as any;

    // --- #10011: Global History Proxy ---
    // Since core modules use the imported 'historyManager' instance, we proxy its methods
    // to point to whatever is currently in window.historyManager.
    const originalPush = historyManager.push;
    const originalUndo = historyManager.undo;
    const originalRedo = historyManager.redo;
    const originalClear = historyManager.clear;

    (historyManager as any).push = function(action: any) {
        const activeHM = (window as any).historyManager;
        if (activeHM && activeHM !== historyManager) activeHM.push(action);
        else originalPush.call(historyManager, action);
    };
    (historyManager as any).undo = function() {
        const activeHM = (window as any).historyManager;
        if (activeHM && activeHM !== historyManager) activeHM.undo();
        else originalUndo.call(historyManager);
    };
    (historyManager as any).redo = function() {
        const activeHM = (window as any).historyManager;
        if (activeHM && activeHM !== historyManager) activeHM.redo();
        else originalRedo.call(historyManager);
    };
    (historyManager as any).clear = function() {
        const activeHM = (window as any).historyManager;
        if (activeHM && activeHM !== historyManager) activeHM.clear();
        else originalClear.call(historyManager);
    };

    // --- State Trackers (#10014) ---
    w.isMouseInCanvas = false;
    (g as any).pX = -1000;
    (g as any).pY = -1000;

    // --- #10012: Selection History ---
    class SelectionAction {
        constructor(
            public oldMaskImageData: ImageData | null,
            public oldBorder: any[],
            public newMaskImageData: ImageData | null,
            public newBorder: any[]
        ) {}

        private applyState(mask: ImageData | null, border: any[]) {
            (g as any).selectionMask = mask;
            (g as any).selectionBorder = border;
            (g as any).isSelectionActive = !!mask;
            
            if (mask) {
                const canvas = document.createElement('canvas');
                canvas.width = mask.width;
                canvas.height = mask.height;
                const ctx = canvas.getContext('2d');
                if (ctx) ctx.putImageData(mask, 0, 0);
                (g as any).selectionCanvas = canvas;
            } else {
                (g as any).selectionCanvas = null;
            }

            if (w.renderLayers) w.renderLayers();
            if (w.updateLayerPanel) w.updateLayerPanel();
        }

        undo() { this.applyState(this.oldMaskImageData, this.oldBorder); }
        redo() { this.applyState(this.newMaskImageData, this.newBorder); }
    }

    function captureSelectionState() {
        return {
            mask: g.selectionMask ? new ImageData(new Uint8ClampedArray(g.selectionMask.data), g.selectionMask.width, g.selectionMask.height) : null,
            border: g.selectionBorder ? JSON.parse(JSON.stringify(g.selectionBorder)) : []
        };
    }

    const selectionGfx = ['buildRectSelection', 'buildEllipseSelection', 'buildLassoSelection', 'buildPolygonalSelection', 'deselect', 'invertSelection', 'magicWandSelection'];
    selectionGfx.forEach(fnName => {
        if (typeof w[fnName] === 'function') {
            const original = w[fnName];
            w[fnName] = function(...args: any[]) {
                const before = captureSelectionState();
                original.apply(this, args);
                const after = captureSelectionState();
                
                const bothNull = !before.mask && !after.mask;
                if (!(bothNull && before.border.length === 0 && after.border.length === 0)) {
                    if (w.historyManager) w.historyManager.push(new SelectionAction(before.mask, before.border, after.mask, after.border));
                }
            };
        }
    });

    // --- #10014: Brush Tip Visibility ---
    const originalRenderLayers = w.renderLayers;
    w.renderLayers = function(tempCanvas?: any) {
        if (g.documents.length === 0) return; 
        const wasZooming = g.zooming;
        if (!w.isMouseInCanvas) (g as any).zooming = true; 
        originalRenderLayers(tempCanvas);
        (g as any).zooming = wasZooming;
    };

    const attachMouseListeners = () => {
        const area = document.getElementById('canvasWrapper');
        if (area) {
            area.addEventListener('mouseenter', () => { w.isMouseInCanvas = true; if (w.renderLayers) w.renderLayers(); });
            area.addEventListener('mouseleave', () => { w.isMouseInCanvas = false; if (w.renderLayers) w.renderLayers(); });
        }
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attachMouseListeners);
    else attachMouseListeners();

    // --- #10013: History Manager Swapping ---
    const historyMap = new Map<string, HistoryManager>();

    function getHistoryForDoc(doc: any): HistoryManager {
        if (!historyMap.has(doc.id)) {
            console.log(`[CorePatch] Initializing HistoryManager for: ${doc.name}`);
            const hm = new HistoryManager(g.max_undo_steps);
            
            // Patch Push/Undo/Redo for UI updates
            const instPush = hm.push;
            hm.push = function(action: any) {
                instPush.call(hm, action);
                w.updateUndoRedoUI();
            };
            const instUndo = hm.undo;
            hm.undo = function() {
                instUndo.call(hm);
                w.updateUndoRedoUI();
            }
            const instRedo = hm.redo;
            hm.redo = function() {
                instRedo.call(hm);
                w.updateUndoRedoUI();
            }

            historyMap.set(doc.id, hm);
        }
        return historyMap.get(doc.id)!;
    }

    w.updateUndoRedoUI = function() {
        const hm = w.historyManager;
        if (!hm) return;
        
        const canUndo = hm.canUndo;
        const canRedo = hm.canRedo;
        
        const undoBtn = document.getElementById('btn-undo') || document.querySelector('[onclick*="undoImage"]');
        const redoBtn = document.getElementById('btn-redo') || document.querySelector('[onclick*="redoImage"]');
        
        if (undoBtn) {
            (undoBtn as any).disabled = !canUndo;
            (undoBtn as HTMLElement).parentElement?.classList.toggle('disabled', !canUndo);
        }
        if (redoBtn) {
            (redoBtn as any).disabled = !canRedo;
            (redoBtn as HTMLElement).parentElement?.classList.toggle('disabled', !canRedo);
        }
    };

    const originalSwitchDocument = w.switchDocument;
    w.switchDocument = function(index: number) {
        if (index < 0 || index >= g.documents.length) return;
        
        const oldIndex = (g as any).activeDocumentIndex;
        if (oldIndex >= 0 && oldIndex < g.documents.length) {
            const oldDoc = g.documents[oldIndex];
            oldDoc.selectionActive = (g as any).isSelectionActive;
            oldDoc.selectionMask = (g as any).selectionMask;
            oldDoc.selectionBorder = (g as any).selectionBorder;
            oldDoc.selectionCanvas = (g as any).selectionCanvas;
        }

        document.body.classList.remove('no-document-active');
        originalSwitchDocument(index);
        
        const doc = g.documents[index];
        w.historyManager = getHistoryForDoc(doc);
        
        (g as any).isSelectionActive = !!doc.selectionActive;
        (g as any).selectionMask = doc.selectionMask || null;
        (g as any).selectionBorder = doc.selectionBorder || [];
        (g as any).selectionCanvas = doc.selectionCanvas || null;

        w.updateUndoRedoUI();

        const splash = document.getElementById('no-document-splash');
        if (splash) splash.style.display = 'none';
        const wrapper = document.getElementById('canvasWrapper');
        if (wrapper) wrapper.style.display = 'inline-block';
        const canvas = document.getElementById('drawingCanvas');
        if (canvas) canvas.style.display = 'block';
    };

    w.closeDocument = function(index: number) {
        const doc = g.documents[index];
        if (doc) historyMap.delete(doc.id);
        g.documents.splice(index, 1);

        if (g.documents.length === 0) {
            (g as any).activeDocumentIndex = -1;
            showNoDocumentSplash();
            renderImageTabs();
        } else {
            if (g.activeDocumentIndex >= g.documents.length) (g as any).activeDocumentIndex = g.documents.length - 1;
            w.switchDocument(g.activeDocumentIndex);
        }
    };

    // --- #10010: Modal Handling ---
    if (typeof w.openNewImageDialog === 'function') {
        const originalOpenNew = w.openNewImageDialog;
        w.openNewImageDialog = function() {
            originalOpenNew.apply(this);
            const modal = document.getElementById('newImageModal');
            if (modal) modal.style.display = 'flex';
        };
    }

    const originalNewDocument = w.newDocument;
    w.newDocument = function(...args: any[]) {
        const res = originalNewDocument.apply(this, args);
        document.body.classList.remove('no-document-active');
        const splash = document.getElementById('no-document-splash');
        if (splash) splash.style.display = 'none';
        if (g.documents.length > 0) w.switchDocument(g.documents.length - 1);
        return res;
    };

    const observer = new MutationObserver(() => {
        // 1. Patch Tab Close Buttons
        document.querySelectorAll('.image-tab-close').forEach((btn: any) => {
            if (!btn.dataset.patched) {
                const tab = btn.closest('.image-tab');
                const index = parseInt(tab?.dataset.index || '-1');
                if (index !== -1) {
                    btn.onclick = (e: Event) => { e.stopPropagation(); w.closeDocument(index); };
                    btn.dataset.patched = "true";
                }
            }
        });

        // 2. Aggressive Splash/Modal Sync (#10010)
        const hasDocs = g.documents && g.documents.length > 0;
        const splash = document.getElementById('no-document-splash');
        
        if (hasDocs && splash && splash.style.display !== 'none') {
            console.log("[CorePatch] Auto-hiding splash.");
            splash.style.display = 'none';
            document.body.classList.remove('no-document-active');
            const workspace = document.getElementById('canvasWrapper');
            if (workspace) workspace.style.display = 'inline-block';
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
}

function showNoDocumentSplash() {
    const scrollArea = document.getElementById('canvasScrollArea');
    if (!scrollArea) return;
    document.body.classList.add('no-document-active');

    let splash = document.getElementById('no-document-splash');
    if (!splash) {
        splash = document.createElement('div');
        splash.id = 'no-document-splash';
        // USE ATTRIBUTES INSTEAD OF ADD-EVENT-LISTENER FOR RELIABILITY (#10010)
        splash.innerHTML = `
            <div class="splash-content fadeIn">
                <img src="assets/logo.png" alt="HCIE" class="splash-logo" onerror="this.style.display='none'">
                <h2>Welcome to HC Image Editor</h2>
                <p>Start by creating a new document or opening an existing image.</p>
                <div class="splash-actions">
                    <button class="primary-btn" onclick="window.openNewImageDialog()">New Image</button>
                    <button class="secondary-btn" onclick="window.openImage()">Open Image</button>
                </div>
            </div>
        `;
        scrollArea.appendChild(splash);
    }
    splash.style.display = 'flex';
    const wrapper = document.getElementById('canvasWrapper');
    if (wrapper) wrapper.style.display = 'none';
    scrollArea.style.backgroundColor = 'var(--bg-darker, #1a1a1a)';
}
