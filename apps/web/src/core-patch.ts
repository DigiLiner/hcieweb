import { g as coreG, HistoryManager, historyManager as coreHM, appEvents as coreAppEvents, renderImageTabs as coreRenderImageTabs } from '@hcie/core';

/**
 * Core Patch Controller
 * Overrides core library functions and proxies global state to fix issues:
 * #10010: Dialog/Splash Lifecycle
 * #10011: Undo/Redo Isolation & Consolidation
 * #10012: Selection History
 * #10013: History UI Sync
 * #10014: Brush Visibility/Event Cleanup
 */
export function applyCorePatch() {
    const w = window as any;

    // Use window-exposed globals if available (exposed by UIController)
    // otherwise fallback to imported ones.
    const g = w.g || coreG;
    const historyManager = w.historyManager || coreHM;
    const appEvents = w.appEvents || coreAppEvents;

    if (!g || !historyManager) {
        console.warn('[core-patch] g or historyManager not found. Postponing patch...');
        setTimeout(applyCorePatch, 100);
        return;
    }

    if (w.__CORE_PATCH_APPLIED__) return;
    w.__CORE_PATCH_APPLIED__ = true;

    console.log('[core-patch] Applying unified document isolation and UI sync patches...');

    // ─── History Manager Refinement (#10011) ───────────────────
    
    // GroupAction to bundle multiple actions into one undo step
    class GroupAction {
        constructor(public description: string, public actions: any[]) {}
        undo() { for (let i = this.actions.length - 1; i >= 0; i--) this.actions[i].undo(); }
        redo() { for (let i = 0; i < this.actions.length; i++) this.actions[i].redo(); }
    }

    // Enhance HistoryManager with grouping capabilities
    const extendHistoryManager = (hm: any) => {
        if (hm._grouped) return;
        hm._grouped = true;
        hm._groupStack = [];
        hm._currentGroup = null;

        const originalPush = hm.push;
        hm.push = function(action: any) {
            if (this._currentGroup) {
                this._currentGroup.actions.push(action);
            } else {
                originalPush.call(this, action);
                if (w.updateUndoRedoUI) w.updateUndoRedoUI();
            }
        };

        hm.beginGroup = function(description = 'Multiple Actions') {
            const group = { description, actions: [] };
            this._groupStack.push(group);
            this._currentGroup = group;
        };

        hm.endGroup = function() {
            const group = this._groupStack.pop();
            this._currentGroup = this._groupStack.length > 0 ? this._groupStack[this._groupStack.length - 1] : null;
            
            if (group && group.actions.length > 0) {
                if (group.actions.length === 1) {
                    this.push(group.actions[0]);
                } else {
                    originalPush.call(this, new GroupAction(group.description, group.actions));
                }
            }
            if (w.updateUndoRedoUI) w.updateUndoRedoUI();
        };

        const originalUndo = hm.undo;
        hm.undo = function() {
            originalUndo.call(this);
            if (w.updateUndoRedoUI) w.updateUndoRedoUI();
        };

        const originalRedo = hm.redo;
        hm.redo = function() {
            originalRedo.call(this);
            if (w.updateUndoRedoUI) w.updateUndoRedoUI();
        };
    };

    // Proxy the singleton to redirect all calls to the ACTIVE document's HistoryManager instance.
    const propsToProxy = ['push', 'undo', 'redo', 'clear', 'canUndo', 'canRedo', 'jumpTo', 'updateUI', 'beginGroup', 'endGroup'];
    propsToProxy.forEach(prop => {
        const originalValue = (historyManager as any)[prop];
        Object.defineProperty(historyManager, prop, {
            get() {
                const activeHM = (window as any).historyManager;
                const source = (activeHM && activeHM !== historyManager) ? activeHM : historyManager;
                
                if (source === historyManager) return originalValue;

                const value = (source as any)[prop];
                if (typeof value === 'function') return value.bind(source);
                return value;
            },
            configurable: true
        });
    });

    // Storage for document-specific HistoryManagers
    const docHistories = new Map<any, any>();

    function getHistoryForDoc(doc: any) {
        if (!docHistories.has(doc.id)) {
            const hm = new HistoryManager(g.max_undo_steps || 200);
            extendHistoryManager(hm);
            docHistories.set(doc.id, hm);
        }
        return docHistories.get(doc.id);
    }

    // --- State Trackers (#10014) ---
    w.isMouseInCanvas = false;
    (g as any).pX = -1000;
    (g as any).pY = -1000;

    // --- #10012: Selection History & Consolidation ---
    class SelectionAction {
        constructor(
            public description: string,
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
                const activeHM = (window as any).historyManager;
                const groupStarted = activeHM && !activeHM._currentGroup;
                if (groupStarted) activeHM.beginGroup(fnName.startsWith('build') ? 'Selection' : fnName.charAt(0).toUpperCase() + fnName.slice(1));
                
                const before = captureSelectionState();
                original.apply(this, args);
                const after = captureSelectionState();
                
                const maskChanged = (before.mask?.data.length !== after.mask?.data.length); // Rough check
                const borderChanged = JSON.stringify(before.border) !== JSON.stringify(after.border);
                
                if (maskChanged || borderChanged) {
                    if (w.historyManager) w.historyManager.push(new SelectionAction('Selection Change', before.mask, before.border, after.mask, after.border));
                }

                if (groupStarted) activeHM.endGroup();
            };
        }
    });

    // Patch Vector Tools to use grouping if available
    const vectorTools = ['addVectorShape', 'updateVectorShape', 'deleteVectorShape'];
    vectorTools.forEach(fnName => {
        if (typeof w[fnName] === 'function') {
            const original = w[fnName];
            w[fnName] = function(...args: any[]) {
                const activeHM = (window as any).historyManager;
                if (activeHM) activeHM.beginGroup('Vector Action');
                const res = original.apply(this, args);
                if (activeHM) activeHM.endGroup();
                return res;
            };
        }
    });

    // --- #10014: Brush Tip Visibility ---
    const originalRenderLayers = w.renderLayers;
    if (originalRenderLayers) {
        w.renderLayers = function(tempCanvas?: any) {
            if (g.documents.length === 0) return; 
            const wasZooming = g.zooming;
            if (!w.isMouseInCanvas) (g as any).zooming = true; 
            originalRenderLayers(tempCanvas);
            (g as any).zooming = wasZooming;
        };
    }

    const attachMouseListeners = () => {
        const area = document.getElementById('canvasWrapper');
        if (area) {
            area.addEventListener('mouseenter', () => { w.isMouseInCanvas = true; if (w.renderLayers) w.renderLayers(); });
            area.addEventListener('mouseleave', () => { w.isMouseInCanvas = false; if (w.renderLayers) w.renderLayers(); });
        }
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attachMouseListeners);
    else attachMouseListeners();

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

    // --- #10011: Document Isolation & Sync ---
    const originalSwitchDocument = w.switchDocument;
    w.switchDocument = function(index: number) {
        if (index < 0 || index >= g.documents.length) return;
        
        const oldIndex = (g as any).activeDocumentIndex;
        if (oldIndex >= 0 && oldIndex < g.documents.length) {
            const oldDoc = g.documents[oldIndex] as any;
            oldDoc.selectionActive = (g as any).isSelectionActive;
            oldDoc.selectionMask = (g as any).selectionMask;
            oldDoc.selectionBorder = (g as any).selectionBorder;
            oldDoc.selectionPreviewBorder = (g as any).selectionPreviewBorder;
            oldDoc.selectionCanvas = (g as any).selectionCanvas;
            oldDoc.selectionDashOffset = (g as any).selectionDashOffset;
        }

        if (originalSwitchDocument) {
            originalSwitchDocument(index);
        } else {
            g.activeDocumentIndex = index;
        }
        
        const doc = g.documents[index] as any;
        w.historyManager = getHistoryForDoc(doc);
        
        // Restore selection state
        (g as any).isSelectionActive = !!doc.selectionActive;
        (g as any).selectionMask = doc.selectionMask || null;
        (g as any).selectionBorder = doc.selectionBorder || [];
        (g as any).selectionPreviewBorder = doc.selectionPreviewBorder || [];
        (g as any).selectionCanvas = doc.selectionCanvas || null;
        (g as any).selectionDashOffset = doc.selectionDashOffset || 0;

        const forceUpdate = () => {
            if (w.updateUndoRedoUI) w.updateUndoRedoUI();
            if (historyManager.updateUI) historyManager.updateUI(); // Proxied call
            if (w.updateLayerPanel) w.updateLayerPanel();
            if (w.renderLayers) w.renderLayers();
            const filePath = document.getElementById('filePath');
            if (filePath) filePath.innerText = doc.name || 'Untitled';
        };

        forceUpdate();
        setTimeout(forceUpdate, 50);
    };

    const originalRenderImageTabs = w.renderImageTabs || coreRenderImageTabs;
    w.renderImageTabs = function() {
        if (originalRenderImageTabs) originalRenderImageTabs();
        
        // Force re-bind of tabs to use window.switchDocument if needed
        const tabs = document.querySelectorAll('.image-tab-name');
        tabs.forEach((tab: any) => {
            const parent = tab.parentElement;
            if (parent && parent.dataset.index) {
                const idx = parseInt(parent.dataset.index);
                tab.onclick = (e: Event) => {
                    e.stopPropagation();
                    w.switchDocument(idx);
                };
            }
        });
    };

    if (appEvents) {
        appEvents.addEventListener('document:switch', (e: any) => {
            const doc = g.documents[g.activeDocumentIndex];
            if (doc) {
                w.historyManager = getHistoryForDoc(doc);
                if (w.updateUndoRedoUI) w.updateUndoRedoUI();
                if (historyManager.updateUI) historyManager.updateUI();
                if (w.updateLayerPanel) w.updateLayerPanel();
                if (w.renderLayers) w.renderLayers();
                const filePath = document.getElementById('filePath');
                if (filePath) filePath.innerText = doc.name || 'Untitled';
            }
        });
    }

    w.closeDocument = function(index: number) {
        const doc = g.documents[index];
        if (doc) docHistories.delete(doc.id);
        g.documents.splice(index, 1);

        if (g.documents.length === 0) {
            (g as any).activeDocumentIndex = -1;
            showNoDocumentSplash();
            w.renderImageTabs();
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
    if (originalNewDocument) {
        w.newDocument = function(...args: any[]) {
            const res = originalNewDocument.apply(this, args);
            document.body.classList.remove('no-document-active');
            const splash = document.getElementById('no-document-splash');
            if (splash) splash.style.display = 'none';
            if (g.documents.length > 0) w.switchDocument(g.documents.length - 1);
            return res;
        };
    }

    const observer = new MutationObserver(() => {
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

        const hasDocs = g.documents && g.documents.length > 0;
        const splash = document.getElementById('no-document-splash');
        if (hasDocs && splash && splash.style.display !== 'none') {
            splash.style.display = 'none';
            document.body.classList.remove('no-document-active');
            const workspace = document.getElementById('canvasWrapper');
            if (workspace) workspace.style.display = 'inline-block';
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    console.log('[core-patch] Applied all core fixes.');
}

function showNoDocumentSplash() {
    const scrollArea = document.getElementById('canvasScrollArea');
    if (!scrollArea) return;
    document.body.classList.add('no-document-active');

    let splash = document.getElementById('no-document-splash');
    if (!splash) {
        splash = document.createElement('div');
        splash.id = 'no-document-splash';
        splash.innerHTML = `
            <div class=\"splash-content fadeIn\">
                <img src=\"assets/logo.png\" alt=\"HCIE\" class=\"splash-logo\" onerror=\"this.style.display='none'\">
                <h2>Welcome to HC Image Editor</h2>
                <p>Start by creating a new document or opening an existing image.</p>
                <div class=\"splash-actions\">
                    <button class=\"primary-btn\" onclick=\"window.openNewImageDialog()\">New Image</button>
                    <button class=\"secondary-btn\" onclick=\"window.openImage()\">Open Image</button>
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
