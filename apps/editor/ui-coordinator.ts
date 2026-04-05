import { EventBus } from '@hcie/shared';
// We import from the UI package to access rendering functions
import { renderLayers, updateLayerPanel } from '@hcie/canvas-ui';

// Sub-coordinators
import { initDocumentCoordinator, updateZoomUI } from './coordinators/document-coordinator';
import { initToolCoordinator, updateDrawingStatusBar, handleEyeDropper } from './coordinators/tool-coordinator';
import { initSelectionCoordinator } from './coordinators/selection-coordinator';
import { initOverlayCoordinator } from './coordinators/overlay-coordinator';
import { extendHistoryManager } from './coordinators/history-coordinator';
import { historyManager } from '@hcie/core';

/**
 * Initializes all UI event listeners and sub-coordinators.
 */
export function initUICoordinator() {
    console.log('[UI-Coordinator] Initializing subscriptions...');
    
    // Force initial canvas ref lookups
    if ((window as any).initCanvasRefs) (window as any).initCanvasRefs();
    if ((window as any).attachCanvasEvents) (window as any).attachCanvasEvents();

    // Initialize core extensions
    extendHistoryManager(historyManager);

    // Initialize sub-coordinators
    initDocumentCoordinator();
    initToolCoordinator();
    initSelectionCoordinator();
    initOverlayCoordinator();

    // ─── Rendering Signals ───────────────────────────────────

    EventBus.on('RENDER_LAYERS', () => {
        console.log('[UI] Signal: RENDER_LAYERS');
        renderLayers();
    });

    EventBus.on('UPDATE_LAYER_PANEL', () => {
        console.log('[UI] Signal: UPDATE_LAYER_PANEL');
        updateLayerPanel();
    });

    // ─── Project IO Signals ──────────────────────────────────

    EventBus.on('PROJECT_LOADED', (data: any) => {
        console.log('[UI] Signal: PROJECT_LOADED', data);
        renderLayers();
        updateLayerPanel();
        
        // Reset history UI if needed
        if ((window as any).historyManager) {
            (window as any).historyManager.clear();
        }
    });

    EventBus.on('PROJECT_RESIZE', (data: { width: number; height: number }) => {
        console.log('[UI] Signal: PROJECT_RESIZE', data);
        if ((window as any).resizeCanvas) {
            (window as any).resizeCanvas(data.width, data.height);
        }
    });

    EventBus.on('PSD_LOADED', (data: any) => {
        console.log('[UI] Signal: PSD_LOADED', data);
        renderLayers();
        updateLayerPanel();
        if ((window as any).resizeCanvas && data.width && data.height) {
            (window as any).resizeCanvas(data.width, data.height);
        }
    });

    // ─── History & Document Signals ──────────────────────────

    EventBus.on('HISTORY_CHANGED', () => {
        // Update history pane if global function exists
        if ((window as any).updateHistoryUI) {
            (window as any).updateHistoryUI();
        }
    });

    EventBus.on('DOCUMENT_SWITCHED', () => {
        renderLayers();
        updateLayerPanel();
    });

    EventBus.on('DOCUMENT_TABS_CHANGED', () => {
        if ((window as any).renderImageTabs) {
            (window as any).renderImageTabs();
        }
    });

    // ─── Tool Signals ────────────────────────────────────────

    EventBus.on('TOOL_CHANGED', (data: { toolId: string }) => {
        console.log('[UI] Signal: TOOL_CHANGED', data.toolId);
        // Sync toolbar UI if needed
    });

    console.log('[UI-Coordinator] Subscriptions active.');
}
