/**
 * @file document-coordinator.ts
 * @description Handles zoom synchronization, document switching, and tab management.
 */

import { g, appEvents } from '@hcie/core';
import { EventBus } from '@hcie/shared';
import { getHistoryForDoc } from './history-coordinator';

export function updateZoomUI() {
    const zoomSlider = document.getElementById('zoomSlider') as HTMLInputElement;
    const zoomDisplay = document.getElementById('zoomDisplay');
    const zoomPercent = Math.round((g.zoom || 1) * 100);
    if (zoomSlider) zoomSlider.value = zoomPercent.toString();
    if (zoomDisplay) zoomDisplay.innerText = zoomPercent + '%';
}

export function initDocumentCoordinator() {
    const zoomSlider = document.getElementById('zoomSlider') as HTMLInputElement;
    const zoomDisplay = document.getElementById('zoomDisplay');

    if (zoomSlider) {
        zoomSlider.addEventListener('input', () => {
            const val = parseInt(zoomSlider.value);
            const oldZoom = g.zoom;
            const newZoom = val / 100;
            
            // Standardize zoom setting
            g.zoom = newZoom;

            if ((window as any).applyZoom) {
                (window as any).applyZoom(oldZoom, null);
            } else {
                console.warn('[DocumentCoordinator] window.applyZoom not found, falling back to manual refresh.');
                EventBus.emit('RENDER_LAYERS');
                if (zoomDisplay) zoomDisplay.innerText = Math.round(newZoom * 100) + '%';
            }
            
            if ((window as any).updateSVGSelection) (window as any).updateSVGSelection();
        });
    }

    // Manual zoom sync
    window.addEventListener('zoomChanged', updateZoomUI);
    // Initial sync
    setTimeout(updateZoomUI, 100);

    // Document switching
    EventBus.on('DOCUMENT_SWITCHED', (data: { index: number }) => {
        const doc = g.documents[data.index] as any;
        if (doc) {
            (window as any).historyManager = getHistoryForDoc(doc.id);
            updateZoomUI();
            
            // Reset visual zoom to match the newly switched document's zoom
            if ((window as any).applyZoom) {
                (window as any).applyZoom(g.zoom, null);
            }
        }
    });

    // Tab rendering implementation since core logic was removed
    (window as any).renderImageTabs = function() {
        // BUG FIX #30: imageTabs -> imageTabBar
        const container = document.getElementById('imageTabBar');
        if (!container) {
            console.warn('[DocumentCoordinator] #imageTabBar not found');
            return;
        }

        container.innerHTML = '';
        if (!g.documents || g.documents.length === 0) {
            // Signal that no documents are active
            document.body.classList.add('no-document-active');
            return;
        }
        
        document.body.classList.remove('no-document-active');

        g.documents.forEach((doc: any, i: number) => {
            const tab = document.createElement('div');
            tab.className = `image-tab ${i === g.activeDocumentIndex ? 'active' : ''}`;
            tab.dataset.index = i.toString();

            const title = document.createElement('span');
            title.className = 'image-tab-name';
            title.innerText = doc.name + (doc.modified ? '*' : '');
            
            const closeBtn = document.createElement('span');
            closeBtn.className = 'image-tab-close';
            closeBtn.innerHTML = '×';
            closeBtn.onclick = (e) => {
                e.stopPropagation();
                if (typeof (window as any).closeDocument === 'function') {
                    (window as any).closeDocument(i);
                } else {
                    EventBus.emit('CLOSE_DOCUMENT', { index: i });
                }
            };
            tab.appendChild(title);
            tab.appendChild(closeBtn);
            
            container.appendChild(tab);
        });

        // Use more direct click handling
        container.querySelectorAll('.image-tab-name').forEach((titleEl: any) => {
            const tab = titleEl.closest('.image-tab');
            const idx = parseInt(tab.dataset.index);
            titleEl.onclick = (e: Event) => {
                e.stopPropagation();
                if (typeof (window as any).switchDocument === 'function') {
                    (window as any).switchDocument(idx);
                } else {
                    EventBus.emit('SWITCH_DOCUMENT', { index: idx });
                }
            };
        });
    };
    
    // Auto-render tabs on init
    if ((window as any).renderImageTabs) (window as any).renderImageTabs();
}
