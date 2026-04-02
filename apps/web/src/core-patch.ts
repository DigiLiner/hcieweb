import { g as coreG, HistoryManager, historyManager as coreHM, appEvents as coreAppEvents, renderImageTabs as coreRenderImageTabs, layers as coreLayers } from '@hcie/core';

/**
 * Core Patch Controller - #10011 & #10012 İyileştirmeleri
 * Undo/Redo gruplama, döküman izolasyonu ve seçim geçmişi sorunlarını giderir.
 */
export function applyCorePatch() {
    const w = window as any;

    const g = w.g || coreG;
    const historyManager = w.historyManager || coreHM;
    const appEvents = w.appEvents || coreAppEvents;
    const coreLayersVar = coreLayers as any[];
    const layers = w.layers || coreLayersVar;

    if (!g || !historyManager) {
        console.warn('[core-patch] g veya historyManager bulunamadı. Yama erteleniyor...');
        setTimeout(applyCorePatch, 100);
        return;
    }

    if (w.__CORE_PATCH_APPLIED_V2__) return;
    w.__CORE_PATCH_APPLIED_V2__ = true;

    console.log('[core-patch] Gelişmiş döküman izolasyonu ve gruplama yaması uygulanıyor...');

    // ─── Geçmiş Yönetimi Geliştirmeleri (#10011) ─────────────────
    
    class GroupAction {
        constructor(public description: string, public actions: any[]) {}
        undo() { for (let i = this.actions.length - 1; i >= 0; i--) this.actions[i].undo(); }
        redo() { for (let i = 0; i < this.actions.length; i++) this.actions[i].redo(); }
    }

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

        hm.beginGroup = function(description = 'Çoklu İşlem') {
            const group = { description, actions: [] };
            this._groupStack.push(group);
            this._currentGroup = group;
        };

        hm.endGroup = function() {
            if (this._groupStack.length === 0) return;
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

    // Singleton yöneticiye proxy üzerinden erişim
    const propsToProxy = ['push', 'undo', 'redo', 'clear', 'canUndo', 'canRedo', 'jumpTo', 'updateUI', 'beginGroup', 'endGroup'];
    propsToProxy.forEach(prop => {
        const originalValue = (historyManager as any)[prop];
        Object.defineProperty(historyManager, prop, {
            get() {
                const activeHM = (window as any).historyManager;
                const source = (activeHM && activeHM !== historyManager) ? activeHM : historyManager;
                if (source === historyManager) return originalValue;
                const value = (source as any)[prop];
                if (typeof value === 'function') {
                    if (prop === 'updateUI') {
                         return function(...args: any[]) {
                             if (typeof value === 'function') return value.apply(source, args);
                             console.warn("[HistoryProxy] Source does not have updateUI function");
                         };
                    }
                    return value.bind(source);
                }
                return value;
            },
            configurable: true
        });
    });

    const docHistories = new Map<any, any>();
    function getHistoryForDoc(doc: any) {
        if (!docHistories.has(doc.id)) {
            const hm = new HistoryManager(g.max_undo_steps || 200);
            extendHistoryManager(hm);
            docHistories.set(doc.id, hm);
        }
        return docHistories.get(doc.id);
    }

    // ─── Otomatik Fare Gruplaması ──────────────────────────────────
    const attachInteractionListeners = () => {
        const wrapper = document.getElementById('canvasWrapper');
        if (!wrapper) return;

        wrapper.addEventListener('mousedown', (e) => {
            const hm = (window as any).historyManager;
            if (hm && hm.beginGroup) {
                const toolName = g.current_tool?.name || 'Çizim';
                hm.beginGroup(toolName);
            }
        }, true);

        window.addEventListener('mouseup', (e) => {
            const hm = (window as any).historyManager;
            if (hm && hm.endGroup) {
                setTimeout(() => hm.endGroup(), 10);
            }
        }, true);
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attachInteractionListeners);
    else attachInteractionListeners();

    // --- ESC Key Handler ---
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (typeof (window as any).deselect === 'function') {
                (window as any).deselect();
            }
        }
    });

    // ─── Seçim Geçmişi ve İzolasyonu (#10012) ───────────────────
    class SelectionAction {
        constructor(public description: string, public before: any, public after: any) {}
        
        undo() { this.applyState(this.before); }
        redo() { this.applyState(this.after); }

        private applyState(state: any) {
            (g as any).selectionMask = state.mask ? new ImageData(new Uint8ClampedArray(state.mask.data), state.mask.width, state.mask.height) : null;
            (g as any).selectionBorder = state.border ? JSON.parse(JSON.stringify(state.border)) : [];
            (g as any).isSelectionActive = !!state.mask || (state.border && state.border.length > 0);
            
            if (state.mask) {
                const canWidth = state.mask.width || 1;
                const canHeight = state.mask.height || 1;
                const canvas = document.createElement('canvas');
                canvas.width = canWidth;
                canvas.height = canHeight;
                const ctx = canvas.getContext('2d');
                if (ctx) ctx.putImageData(new ImageData(new Uint8ClampedArray(state.mask.data), canWidth, canHeight), 0, 0);
                (g as any).selectionCanvas = canvas;
            } else {
                (g as any).selectionCanvas = null;
            }

            // Force a full redraw of everything including the marching ants
            if (w.renderLayers) {
                w.renderLayers();
            } else {
                const mainCan = document.getElementById('drawingCanvas') as HTMLCanvasElement;
                if (mainCan && w.drawSelectionBorder) {
                    const mainCtx = mainCan.getContext('2d');
                    if (mainCtx) w.drawSelectionBorder(mainCtx);
                }
            }
            if (w.updateLayerPanel) w.updateLayerPanel();
        }
    }

    function captureSelectionState() {
        return {
            mask: g.selectionMask ? {
                data: new Uint8ClampedArray(g.selectionMask.data),
                width: g.selectionMask.width,
                height: g.selectionMask.height
            } : null,
            border: g.selectionBorder ? JSON.parse(JSON.stringify(g.selectionBorder)) : []
        };
    }

    const selectionGfxMap: any = {
        'buildRectSelection': 'Dörtgen Seçim',
        'buildEllipseSelection': 'Elips Seçim',
        'buildLassoSelection': 'Kement Seçim',
        'buildPolygonalSelection': 'Poligon Seçim',
        'deselect': 'Seçimi Kaldır',
        'invertSelection': 'Seçimi Ters Çevir',
        'magicWandSelection': 'Sihirli Değnek',
        'selectAll': 'Tümünü Seç'
    };

    // ─── Universal Event-Level Selection Capture (V5) ───────────
    const setupUniversalCapture = () => {
        const can = document.getElementById("drawingCanvas") as HTMLCanvasElement;
        if (!can) {
            setTimeout(setupUniversalCapture, 500);
            return;
        }
        if (can.dataset.universalPatched) return;
        can.dataset.universalPatched = "true";

        const recordChange = (actionName: string, before: any) => {
            const after = captureSelectionState();
            const maskChanged = (!!before.mask !== !!after.mask) || 
                               (before.mask && after.mask && JSON.stringify(before.mask.data.length) !== JSON.stringify(after.mask.data.length));
            const borderChanged = JSON.stringify(before.border) !== JSON.stringify(after.border);

            if (maskChanged || borderChanged) {
                const activeHM = (window as any).historyManager;
                if (activeHM && typeof activeHM.push === 'function') {
                    const toolName = actionName || g.current_tool?.name || 'Seçim Değişikliği';
                    console.log(`[SelectionPatch] Event-based record: ${toolName}`);
                    activeHM.push(new SelectionAction(toolName, before, after));
                    if (activeHM.updateUI) activeHM.updateUI();
                }
            }
        };

        // Capture state at the very start of interaction (Capture Phase)
        can.addEventListener('mousedown', (e) => {
            if (e.buttons === 1 || e.buttons === 2) {
                (window as any)._selectionBefore = captureSelectionState();
            }
        }, true);

        // Record state at the end of interaction
        can.addEventListener('mouseup', (e) => {
            setTimeout(() => {
                if ((window as any)._selectionBefore) {
                    recordChange(null as any, (window as any)._selectionBefore);
                    (window as any)._selectionBefore = null;
                }
            }, 50);
        }, true);

        // Handle Magic Wand (single click) and Polygon/Lasso finalization
        can.addEventListener('click', (e) => {
            if (g.current_tool?.id === 'Wand') {
                setTimeout(() => {
                    if ((window as any)._selectionBefore) {
                        recordChange("Sihirli Değnek", (window as any)._selectionBefore);
                        (window as any)._selectionBefore = null;
                    }
                }, 100);
            }
        }, true);

        can.addEventListener('dblclick', () => {
            setTimeout(() => {
                if ((window as any)._selectionBefore) {
                    recordChange("Poligon Seçim", (window as any)._selectionBefore);
                    (window as any)._selectionBefore = null;
                } else {
                    // Start of polygon might not have mousedown capture if it's the very first click
                    // but usually it does. If not, we use empty state.
                    recordChange("Poligon Seçim", { mask: null, border: [] });
                }
            }, 100);
        }, true);

        // Keyboard finalization (Enter key)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                setTimeout(() => {
                    if ((window as any)._selectionBefore) {
                        recordChange(null as any, (window as any)._selectionBefore);
                        (window as any)._selectionBefore = null;
                    }
                }, 100);
            }
        }, true);
    };

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setupUniversalCapture);
    else setupUniversalCapture();
    
    // Polling mechanism for late-added canvas
    setInterval(setupUniversalCapture, 2000);

    const wrapSelectionFunctions = () => {
        let patchedCount = 0;
        Object.keys(selectionGfxMap).forEach(fnName => {
            if (typeof w[fnName] === 'function' && !w[fnName].__patched) {
                patchedCount++;
                const original = w[fnName];
                const actionName = selectionGfxMap[fnName];
                
                w[fnName] = function(...args: any[]) {
                    console.log(`[SelectionPatch] Function call (Gfx): ${fnName}`);
                    const activeHM = (window as any).historyManager;
                    const before = captureSelectionState();
                    const res = original.apply(this, args);
                    
                    const after = captureSelectionState();
                    if (JSON.stringify(before.border) !== JSON.stringify(after.border)) {
                        if (activeHM && activeHM.push) {
                            activeHM.push(new SelectionAction(actionName, before, after));
                        }
                    }
                    return res;
                };
                w[fnName].__patched = true;
            }
        });
        return patchedCount;
    };
    wrapSelectionFunctions();
    setInterval(wrapSelectionFunctions, 2000);


    // ─── UI ve Döküman İzolasyonu ──────────────────────────────────
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
            const oldDoc = g.documents[oldIndex] as any;
            oldDoc.selectionActive = (g as any).isSelectionActive;
            oldDoc.selectionMask = (g as any).selectionMask;
            oldDoc.selectionBorder = (g as any).selectionBorder;
            oldDoc.selectionCanvas = (g as any).selectionCanvas;
        }

        if (originalSwitchDocument) originalSwitchDocument(index); else g.activeDocumentIndex = index;
        
        const doc = g.documents[index] as any;
        w.historyManager = getHistoryForDoc(doc);
        
        (g as any).isSelectionActive = !!doc.selectionActive;
        (g as any).selectionMask = doc.selectionMask || null;
        (g as any).selectionBorder = doc.selectionBorder ? [...doc.selectionBorder] : [];
        (g as any).selectionCanvas = doc.selectionCanvas || null;
        (g as any).selectionPreviewBorder = []; // Reset preview on switch

        const forceUpdate = () => {
            if (w.updateUndoRedoUI) w.updateUndoRedoUI();
            if (w.updateLayerPanel) w.updateLayerPanel();
            if (w.renderLayers) w.renderLayers();
            if (w.historyManager && w.historyManager.updateUI) {
                w.historyManager.updateUI();
            }
        };
            
        // Footer (Alt bilgi) güncellemesi
        const filePathElem = document.getElementById('filePath') || document.getElementById('status-file-path') || document.querySelector('.file-path');
        if (filePathElem) (filePathElem as HTMLElement).innerText = doc.name || 'Adsız';
        
        forceUpdate();
        setTimeout(forceUpdate, 50);
    };

    const originalRenderImageTabs = w.renderImageTabs || coreRenderImageTabs;
    w.renderImageTabs = function() {
        if (originalRenderImageTabs) originalRenderImageTabs();
        document.querySelectorAll('.image-tab-name').forEach((tab: any) => {
            const parent = tab.parentElement;
            if (parent?.dataset.index) {
                const idx = parseInt(parent.dataset.index);
                tab.onclick = (e: Event) => { e.stopPropagation(); w.switchDocument(idx); };
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
            }
        });
    }

    // ─── Modal ve Görünürlük İyileştirmeleri ──────────────────────
    const updateModalVisibility = (show: boolean) => {
        const modal = document.getElementById('newImageModal');
        if (modal) {
            modal.style.display = show ? 'flex' : 'none';
            if (show) modal.classList.add('active'); else modal.classList.remove('active');
        }
    };

    if (typeof w.openNewImageDialog === 'function') {
        const originalOpenNew = w.openNewImageDialog;
        w.openNewImageDialog = function() {
            originalOpenNew.apply(this);
            updateModalVisibility(true);
        };
    }
    
    if (typeof w.createNewImage === 'function') {
        const originalCreate = w.createNewImage;
        w.createNewImage = function() {
            originalCreate.apply(this);
            updateModalVisibility(false);
            // Ensure splash is hidden
            const splash = document.getElementById('hcie-empty-state');
            if (splash) splash.style.display = 'none';
        };
    }

    if (typeof w.closeNewImageDialog === 'function') {
        const originalClose = w.closeNewImageDialog;
        w.closeNewImageDialog = function() {
            originalClose.apply(this);
            updateModalVisibility(false);
        };
    }

    // ─── Boş Durum (Splash) Ekranı ────────────────────────────────
    const setupEmptyStateUI = () => {
        let emptyState = document.getElementById('hcie-empty-state');
        if (!emptyState) {
            emptyState = document.createElement('div');
            emptyState.id = 'hcie-empty-state';
            emptyState.className = 'empty-state-overlay';
            emptyState.innerHTML = `
                <div class="empty-state-card" style="padding: 40px; background: white; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); text-align:center; max-width: 400px; width: 90%;">
                    <h2 style="margin-top:0;">HC Image Editor</h2>
                    <p style="color: #666; margin-bottom: 30px;">Hızlıca başlamak için bir yöntem seçin:</p>
                    <div style="display: flex; flex-direction: column; gap: 12px;">
                        <button class="menu-option-btn" onclick="openNewImageDialog()" style="background:#0078d7; color:white; border:none; padding:12px; border-radius:4px; font-weight:bold; cursor:pointer;">Yeni Resim Oluştur</button>
                        <button class="menu-option-btn" onclick="openImage()" style="background:#eee; border:none; padding:12px; border-radius:4px; font-weight:bold; cursor:pointer;">Dosyadan Resim Aç</button>
                    </div>
                </div>
            `;
            emptyState.style.cssText = "position:absolute; top:0; left:0; width:100%; height:100%; background:#f5f6f7; z-index:900; display:none; align-items:center; justify-content:center;";
            const canvasContainer = document.getElementById('drawingCanvasContainer');
            if (canvasContainer) canvasContainer.appendChild(emptyState);
        }

        const isEmpty = g.documents.length === 0;
        emptyState.style.display = isEmpty ? 'flex' : 'none';
    };

    const originalCloseDocument = w.closeDocument;
    w.closeDocument = function(index: number) {
        if (index < 0 || index >= g.documents.length) return;
        
        g.documents.splice(index, 1);
        if (g.documents.length === 0) {
            (g as any).activeDocumentIndex = -1;
            layers.length = 0;
            if (w.renderLayers) w.renderLayers();
            if (w.updateLayerPanel) w.updateLayerPanel();
        } else if (g.activeDocumentIndex >= g.documents.length) {
            (g as any).activeDocumentIndex = g.documents.length - 1;
            w.switchDocument(g.activeDocumentIndex);
        } else {
            // Re-render tabs at least
            w.renderImageTabs();
        }
        setupEmptyStateUI();
        if (w.renderImageTabs) w.renderImageTabs();
    };

    // Initialize Empty State
    if (document.readyState === 'complete') setupEmptyStateUI();
    else window.addEventListener('load', setupEmptyStateUI);

    const observer = new MutationObserver(() => {
        // Menülerin kazara display:none kalmasını önle
        ['file-menu', 'edit-menu', 'image-menu'].forEach(id => {
            const menu = document.getElementById(id);
            if (menu && menu.style.display === 'none' && !w.__IN_TEST_SESSION__) {
                // Menüleri normale döndür
            }
        });
        
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
    });
    observer.observe(document.body, { childList: true, subtree: true });

    console.log('[core-patch] Tüm iyileştirmeler uygulandı.');
}
