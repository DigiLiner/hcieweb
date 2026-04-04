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
            if (w.markLayersDirty) w.markLayersDirty();
            if (w.renderLayers) w.renderLayers();
        };

        const originalRedo = hm.redo;
        hm.redo = function() {
            originalRedo.call(this);
            if (w.updateUndoRedoUI) w.updateUndoRedoUI();
            if (w.markLayersDirty) w.markLayersDirty();
            if (w.renderLayers) w.renderLayers();
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

    // ─── Zoom ve UI Senkronizasyonu ──────────────────────────────
    const zoomSlider = document.getElementById('zoomSlider') as HTMLInputElement;
    const zoomDisplay = document.getElementById('zoomDisplay');

    const updateZoomUI = () => {
        const zoomPercent = Math.round((g.zoom || 1) * 100);
        if (zoomSlider) zoomSlider.value = zoomPercent.toString();
        if (zoomDisplay) zoomDisplay.innerText = zoomPercent + '%';
    };

    if (zoomSlider) {
        zoomSlider.addEventListener('input', () => {
            const val = parseInt(zoomSlider.value);
            if (w.zoomTo) w.zoomTo(val / 100);
            else {
                g.zoom = val / 100;
                if (w.renderLayers) w.renderLayers();
                if (w.updateSVGSelection) w.updateSVGSelection();
            }
            if (zoomDisplay) zoomDisplay.innerText = val + '%';
        });
    }

    // Listen for custom zoom events if they exist
    window.addEventListener('zoomChanged', updateZoomUI);
    // Initial sync and periodic sync as fallback
    setInterval(updateZoomUI, 1000);
    setTimeout(updateZoomUI, 500);

    // Patch original zoom functions for instant feedback
    const originalZoomIn = w.zoomIn;
    w.zoomIn = function() {
        if (originalZoomIn) originalZoomIn.apply(this, arguments as any);
        updateZoomUI();
    };
    const originalZoomOut = w.zoomOut;
    w.zoomOut = function() {
        if (originalZoomOut) originalZoomOut.apply(this, arguments as any);
        updateZoomUI();
    };
    const originalActualSize = w.actualSize;
    w.actualSize = function() {
        if (originalActualSize) originalActualSize.apply(this, arguments as any);
        updateZoomUI();
    };

    // ─── Araç Kısayolları ve Eye Dropper ──────────────────────────
    const originalSelectToolShortcut = w.selectToolShortcut;
    w.selectToolShortcut = function(toolId: string) {
        if (toolId === 'EyeDropper') {
            w.selectTool({ id: 'EyeDropper', name: 'Eye Dropper' });
            return;
        }
        if (originalSelectToolShortcut) originalSelectToolShortcut.apply(this, arguments as any);
    };

    // ─── StatusBar Drawing Info & Snap Logic (#1324) ─────────────
    const drawingInfo = document.getElementById('drawingInfo');
    const startPosElem = document.getElementById('startPos');
    const dimensionsElem = document.getElementById('dimensions');
    const angleElem = document.getElementById('angle');
    const radiusElem = document.getElementById('radius');

    let shiftPressed = false;
    window.addEventListener('keydown', (e) => { if (e.key === 'Shift') shiftPressed = true; });
    window.addEventListener('keyup', (e) => { if (e.key === 'Shift') shiftPressed = false; });

    const updateDrawingStatusBar = (e: MouseEvent) => {
        if (!g.drawing || !drawingInfo) {
            if (drawingInfo) drawingInfo.style.display = 'none';
            return;
        }

        drawingInfo.style.display = 'flex';
        // Use our tracked start or g.draw_start_pos
        const start = (window as any)._drawStart || g.draw_start_pos || { x: 0, y: 0 };
        const current = (w as any).getMousePos ? (w as any).getMousePos(e) : { x: e.offsetX, y: e.offsetY };
        
        let dx = current.x - start.x;
        let dy = current.y - start.y;

        const tool = g.current_tool?.id || '';
        const isEllipse = tool.includes('ellipse') || tool.includes('circle');
        
        if (radiusElem) {
            if (isEllipse) {
                radiusElem.style.display = 'inline';
                const rx = Math.abs(dx) / 2;
                const ry = Math.abs(dy) / 2;
                radiusElem.innerText = `Radius: ${Math.round(rx)} x ${Math.round(ry)}`;
            } else {
                radiusElem.style.display = 'none';
            }
        }

        if (shiftPressed) {
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;
            const allowedAngles = [0, 30, 45, 60, 90, 120, 135, 150, 180, -30, -45, -60, -90, -120, -135, -150, -180];
            const finalSnap = allowedAngles.reduce((prev, curr) => Math.abs(curr - angle) < Math.abs(prev - angle) ? curr : prev);
            
            const dist = Math.sqrt(dx * dx + dy * dy);
            const rad = finalSnap * Math.PI / 180;
            dx = Math.cos(rad) * dist;
            dy = Math.sin(rad) * dist;
            
            if (angleElem) angleElem.innerText = `Angle: ${Math.round(finalSnap)}°`;
        } else {
            const angle = Math.atan2(dy, dx) * 180 / Math.PI;
            if (angleElem) angleElem.innerText = `Angle: ${Math.round(angle)}°`;
        }

        if (startPosElem) startPosElem.innerText = `Start: ${Math.round(start.x)}, ${Math.round(start.y)}`;
        if (dimensionsElem) dimensionsElem.innerText = `Size: ${Math.round(Math.abs(dx))} x ${Math.round(Math.abs(dy))}`;
        
        // Ensure buttons visibility for vector tools
        const isVector = tool.includes('select') || tool.includes('rect') || tool.includes('ellipse') || tool.includes('path') || tool.includes('shape');
        const actions = drawingInfo.querySelector('.drawing-actions') as HTMLElement;
        if (actions) actions.style.display = isVector ? 'flex' : 'none';
    };

    // ─── Eye Dropper Logic (#1326) ──────────────────────────────
    const handleEyeDropper = (e: MouseEvent) => {
        if (g.current_tool?.id !== 'EyeDropper') return;
        
        const can = document.getElementById("drawingCanvas") as HTMLCanvasElement;
        if (!can) return;
        
        const ctx = can.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;
        
        const pos = (w as any).getMousePos ? (w as any).getMousePos(e) : { x: e.offsetX, y: e.offsetY };
        const pixel = ctx.getImageData(pos.x, pos.y, 1, 1).data;
        const color = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1)}`;
        
        g.primary_color = color;
        const preview = document.getElementById('primary-color-preview');
        if (preview) preview.style.backgroundColor = color;
        
        if (w.updateColorUI) w.updateColorUI();
    };

    // ─── Drawing Commit/Cancel Logic (#1324-3) ──────────────────
    w.commitDrawing = function() {
        if (g.drawing) {
            console.log("[core-patch] Committing drawing...");
            // Send Enter key event to canvas to trigger core commit logic if exists
            const can = document.getElementById("drawingCanvas");
            if (can) {
                can.dispatchEvent(new KeyboardEvent('keydown', { 'key': 'Enter' }));
                can.dispatchEvent(new KeyboardEvent('keyup', { 'key': 'Enter' }));
            }
            g.drawing = false;
            if (drawingInfo) drawingInfo.style.display = 'none';
            if (w.markLayersDirty) w.markLayersDirty();
            if (w.renderLayers) w.renderLayers();
        }
    };

    w.cancelDrawing = function() {
        if (g.drawing) {
            console.log("[core-patch] Cancelling drawing...");
            // Send Escape key event
            const can = document.getElementById("drawingCanvas");
            if (can) {
                can.dispatchEvent(new KeyboardEvent('keydown', { 'key': 'Escape' }));
            }
            g.drawing = false;
            if (drawingInfo) drawingInfo.style.display = 'none';
            if (w.markLayersDirty) w.markLayersDirty();
            if (w.renderLayers) w.renderLayers();
        }
    };

    // ─── Katman İsimlendirme (#1325) ───────────────────────────
    const getNextLayerName = (baseName: string) => {
        const existingNames = (layers || []).map((l: any) => l.name);
        let counter = 1;
        
        // Enhanced regex to match patterns like "Base 1", "Base 01", "Base 001"
        const regex = new RegExp(`^${baseName}\\s*(0*(\\d+))$`, 'i');
        let maxNum = 0;
        let originalPadding = 0;
        
        existingNames.forEach((name: string) => {
            const match = name.match(regex);
            if (match) {
                const numStr = match[1];
                const num = parseInt(match[2]);
                if (num > maxNum) {
                    maxNum = num;
                    originalPadding = numStr.startsWith('0') ? numStr.length : 0;
                }
            }
        });
        
        if (maxNum > 0) counter = maxNum + 1;
        
        // simplified format: "Vector 1" unless original padding is detected
        if (originalPadding > 1) {
            return `${baseName} ${counter.toString().padStart(originalPadding, '0')}`;
        }
        return `${baseName} ${counter}`;
    };

    const originalAddLayer = w.addLayer;
    w.addLayer = function() {
        const name = getNextLayerName('Layer');
        const res = originalAddLayer ? originalAddLayer.apply(this, arguments as any) : null;
        if (layers && layers.length > 0) {
            layers[layers.length - 1].name = name;
        }
        if (w.updateLayerPanel) w.updateLayerPanel();
        return res;
    };

    const originalAddVectorLayer = w.addVectorLayer;
    w.addVectorLayer = function() {
        const name = getNextLayerName('Vector');
        const res = originalAddVectorLayer ? originalAddVectorLayer.apply(this, arguments as any) : null;
        if (layers && layers.length > 0) {
            layers[layers.length - 1].name = name;
        }
        if (w.updateLayerPanel) w.updateLayerPanel();
        return res;
    };

    // ─── Otomatik Fare Gruplaması ──────────────────────────────────
    const attachInteractionListeners = () => {
        const wrapper = document.getElementById('canvasWrapper');
        if (!wrapper) return;

        wrapper.addEventListener('mousedown', (e) => {
            // Track start position accurately
            const pos = (w as any).getMousePos ? (w as any).getMousePos(e) : { x: e.offsetX, y: e.offsetY };
            (window as any)._drawStart = pos;

            if (g.current_tool?.id === 'EyeDropper') {
                handleEyeDropper(e);
                return;
            }
            const hm = (window as any).historyManager;
            if (hm && hm.beginGroup) {
                const toolName = g.current_tool?.name || 'Çizim';
                hm.beginGroup(toolName);
            }
        }, true);

        wrapper.addEventListener('mousemove', (e) => {
            if (g.drawing) updateDrawingStatusBar(e);
            if (g.current_tool?.id === 'EyeDropper' && e.buttons === 1) {
                handleEyeDropper(e);
            }
        }, true);

        window.addEventListener('mouseup', (e) => {
            if (drawingInfo) drawingInfo.style.display = 'none';
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
    const applySelectionState = (state: any) => {
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

        if (w.renderLayers) w.renderLayers();
        if (w.updateLayerPanel) w.updateLayerPanel();
        if (w.updateSVGSelection) w.updateSVGSelection();
    };

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

    w.captureSelectionState = captureSelectionState;
    w.applySelectionState = applySelectionState;

    class SelectionAction {
        constructor(public description: string, public before: any, public after: any) {}
        undo() { applySelectionState(this.before); }
        redo() { applySelectionState(this.after); }
    }

    const selectionGfxMap: any = {
        'buildRectSelection': 'Dörtgen Seçim',
        'buildEllipseSelection': 'Elips Seçim',
        'buildCircleSelection': 'Daire Seçim',
        'buildSingleRowSelection': 'Satır Seçim',
        'buildSingleColumnSelection': 'Sütun Seçim',
        'buildLassoSelection': 'Kement Seçim',
        'buildPolygonalSelection': 'Poligon Seçim',
        'crop': 'Kırpma',
        'deselect': 'Seçimi Kaldır',
        'invertSelection': 'Seçimi Ters Çevir',
        'magicWandSelection': 'Sihirli Değnek',
        'selectAll': 'Tümünü Seç',
        'featherSelection': 'Seçim Tüy Yumuşatma',
        'expandSelection': 'Seçimi Genişlet (Grow)',
        'contractSelection': 'Seçimi Daralt (Shrink)',
        'borderSelection': 'Kenarlık Seçimi'
    };

    // ─── Extend Tool Definitions ────────────────────────────────
    if (w.Tool) {
        if (!w.Tool.CircleSelect) w.Tool.CircleSelect = { id: 'btn-circle-select', name: 'Daire Seçim' };
        if (!w.Tool.SingleRowSelect) w.Tool.SingleRowSelect = { id: 'btn-row-select', name: 'Tek Satır Seçim' };
        if (!w.Tool.SingleColumnSelect) w.Tool.SingleColumnSelect = { id: 'btn-col-select', name: 'Tek Sütun Seçim' };
        if (!w.Tool.Crop) w.Tool.Crop = { id: 'btn-crop', name: 'Kırpma' };
    }

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
                    
                    if (w.markLayersDirty) w.markLayersDirty();
                    if (w.__BYPASS_HISTORY__) return res;

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
            oldDoc.lastCropRect = (g as any).lastCropRect;
        }

        if (originalSwitchDocument) originalSwitchDocument(index); else g.activeDocumentIndex = index;
        
        const doc = g.documents[index] as any;
        w.historyManager = getHistoryForDoc(doc);
        
        (g as any).isSelectionActive = !!doc.selectionActive;
        (g as any).selectionMask = doc.selectionMask || null;
        (g as any).selectionBorder = doc.selectionBorder ? [...doc.selectionBorder] : [];
        (g as any).selectionCanvas = doc.selectionCanvas || null;
        (g as any).selectionPreviewBorder = []; // Reset preview on switch
        (g as any).lastCropRect = doc.lastCropRect || null;

        const forceUpdate = () => {
            if (w.markLayersDirty) w.markLayersDirty();
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
                if (w.markLayersDirty) w.markLayersDirty();
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

    // ─── GPU-Accelerated SVG Seçim Kenarlığı (Marching Ants) ──────────────
    // #10016-GPU Optimizasyonu: JS loopları yerine CSS ve SVG kullanarak 
    // çizimi tamamen GPU kompozitörüne taşır.
    
    const setupSVGOverlay = () => {
        let svg = document.getElementById('hcie-selection-svg') as any;
        if (!svg) {
            const svgNS = "http://www.w3.org/2000/svg";
            const newSvg = document.createElementNS(svgNS, "svg");
            newSvg.id = 'hcie-selection-svg';
            newSvg.setAttribute('width', '100%');
            newSvg.setAttribute('height', '100%');
            // Set viewBox to image dimensions so SVG coordinates match image pixels regardless of zoom
            newSvg.setAttribute('viewBox', `0 0 ${g.image_width || 100} ${g.image_height || 100}`);
            newSvg.style.cssText = "position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:1000; overflow:visible; display:none;";
            
            // Add CSS for animation
            const style = document.createElement('style');
            style.innerHTML = `
                @keyframes marchingAnts { from { stroke-dashoffset: 0; } to { stroke-dashoffset: 8; } }
                .marching-ants-path { animation: marchingAnts 0.4s linear infinite; }
            `;
            document.head.appendChild(style);
            
            const wrapper = document.getElementById('canvasWrapper');
            if (wrapper) wrapper.appendChild(newSvg);
            svg = newSvg;

            // Update SVG on zoom
            window.addEventListener('zoomChanged', () => {
                if (svg) {
                    svg.setAttribute('viewBox', `0 0 ${g.image_width} ${g.image_height}`);
                    w.updateSVGSelection(); // Refresh to ensure precision
                }
            });
        }
        return svg as any;
    };

    w.updateSVGSelection = () => {
        const svg = setupSVGOverlay();
        const allPaths = [...(g.selectionBorder || []), ...(g.selectionPreviewBorder || [])];
        
        if (!g.isSelectionActive && allPaths.length === 0) {
            if (svg) svg.style.display = 'none';
            return;
        }
        
        if (svg) {
            svg.style.display = 'block';
            // Final safety: Sync viewBox with image size (e.g. after crop/resize)
            const expectedViewBox = `0 0 ${g.image_width} ${g.image_height}`;
            if (svg.getAttribute('viewBox') !== expectedViewBox) {
                svg.setAttribute('viewBox', expectedViewBox);
            }
        }
        
        // Optimize: Path Data Generation
        const svgNS = "http://www.w3.org/2000/svg";
        const frag = document.createDocumentFragment();
        
        allPaths.forEach((path) => {
            if (!path || path.length < 2) return;
            
            // Simplification: Skip points for giant paths (Performance vs Precision)
            const step = path.length > 5000 ? (path.length > 20000 ? 5 : 2) : 1;
            let d = `M ${path[0].x} ${path[0].y}`;
            for (let i = 1; i < path.length; i += step) {
                d += ` L ${path[i].x} ${path[i].y}`;
            }
            if (path.length > 2) d += ' Z';
            
            // 1. Black Outline (Contrast)
            const p1 = document.createElementNS(svgNS, "path");
            p1.setAttribute('d', d);
            p1.setAttribute('stroke', 'rgba(0,0,0,0.8)');
            p1.setAttribute('stroke-width', '1');
            p1.setAttribute('fill', 'none');
            frag.appendChild(p1);
            
            // 2. White Animated Dashes
            const p2 = document.createElementNS(svgNS, "path");
            p2.setAttribute('d', d);
            p2.setAttribute('stroke', 'white');
            p2.setAttribute('stroke-width', '1');
            p2.setAttribute('stroke-dasharray', '4,4');
            p2.setAttribute('fill', 'none');
            p2.setAttribute('class', 'marching-ants-path');
            frag.appendChild(p2);
        });
        
        if (svg) {
            svg.innerHTML = '';
            svg.appendChild(frag);
        }
    };

    // Override original drawSelectionBorder to stop canvas-based animation
    w.drawSelectionBorder = function() {
        // SVG manages the drawing now.
        // We only trigger update if data changed (handled elsewhere).
    };

    // Trigger SVG update on selection changes
    const originalApplySelectionState = w.applySelectionState;
    w.applySelectionState = function(state: any) {
        if (originalApplySelectionState) originalApplySelectionState.call(this, state);
        w.updateSVGSelection();
    };

    // ─── renderLayers Throttling (Cache-based Optimization) ────────
    let lastComposite: HTMLCanvasElement | null = null;
    let layersDirty = true;
    
    w.markLayersDirty = () => { 
        layersDirty = true; 
        w.updateSVGSelection();
    };
    
    w.addEventListener('mousedown', w.markLayersDirty, true);
    w.addEventListener('mouseup', w.markLayersDirty, true);
    w.addEventListener('keydown', w.markLayersDirty, true);
    w.addEventListener('toolChanged', w.markLayersDirty, true);
    
    // Auto-update SVG on a regular timer but only when needed (e.g. preview)
    setInterval(() => {
        if (g.selectionPreviewBorder?.length > 0 || g.drawing) {
             w.updateSVGSelection();
        }
    }, 50);

    const originalRenderLayers = w.renderLayers;
    w.renderLayers = function(liveCanvas?: HTMLCanvasElement) {
        if (!originalRenderLayers) return;
        
        const can = document.getElementById("drawingCanvas") as HTMLCanvasElement;
        const ctx = can?.getContext("2d");
        if (!ctx) return originalRenderLayers.apply(this, arguments as any);

        // If we are just during an animation tick (nothing dirty), we do ABSOLUTELY NOTHING.
        // The SVG handles the marching ants animation. 
        // We only re-render layers if they are dirty or we are actively moving.
        if (liveCanvas || g.drawing || g.zooming || layersDirty) {
            const wasActive = g.isSelectionActive;
            g.isSelectionActive = false; // Hide from canvas render
            
            originalRenderLayers.apply(this, arguments as any);
            
            g.isSelectionActive = wasActive;
            layersDirty = false;
            
            // Update cache
            if (!lastComposite) lastComposite = document.createElement('canvas');
            if (lastComposite.width !== g.image_width || lastComposite.height !== g.image_height) {
                lastComposite.width = g.image_width;
                lastComposite.height = g.image_height;
            }
            const lctx = lastComposite.getContext('2d');
            if (lctx) {
                lctx.clearRect(0, 0, g.image_width, g.image_height);
                lctx.drawImage(can, 0, 0);
            }
        } else if (lastComposite && lastComposite.width === g.image_width && lastComposite.height === g.image_height) {
            // Lazy restore from cache if canvas was wiped by something else
            // Usually not needed if we just skip drawing.
        }
    };

    console.log('[core-patch] Tüm iyileştirmeler uygulandı.');
}
