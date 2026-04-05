/**
 * @file document-coordinator.ts
 * @description Handles zoom synchronization, document switching, and tab management.
 */

import { g, appEvents } from '@hcie/core';
import { EventBus } from '@hcie/shared';
import { getHistoryForDoc } from './history-coordinator';

const zoomSlider = document.getElementById('zoomSlider') as HTMLInputElement;
const zoomDisplay = document.getElementById('zoomDisplay');

export function updateZoomUI() {
    const zoomPercent = Math.round((g.zoom || 1) * 100);
    if (zoomSlider) zoomSlider.value = zoomPercent.toString();
    if (zoomDisplay) zoomDisplay.innerText = zoomPercent + '%';
}

export function initDocumentCoordinator() {
    if (zoomSlider) {
        zoomSlider.addEventListener('input', () => {
            const val = parseInt(zoomSlider.value);
            if ((window as any).zoomTo) (window as any).zoomTo(val / 100);
            else {
                g.zoom = val / 100;
                EventBus.emit('RENDER_LAYERS');
                if ((window as any).updateSVGSelection) (window as any).updateSVGSelection();
            }
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
        }
    });

    // Tab rendering implementation since core logic was removed
    (window as any).renderImageTabs = function() {
        const container = document.getElementById('imageTabs');
        if (!container) return;

        container.innerHTML = '';
        if (!g.documents) return;
        
        g.documents.forEach((doc: any, i: number) => {
            const tab = document.createElement('div');
            tab.className = `image-tab ${i === (g as any).activeDocumentIndex ? 'active' : ''}`;
            tab.dataset.index = i.toString();

            const title = document.createElement('span');
            title.className = 'image-tab-name';
            title.innerText = doc.name + (doc.modified ? '*' : '');
            
            if (g.documents.length > 1) {
                const closeBtn = document.createElement('span');
                closeBtn.className = 'image-tab-close';
                closeBtn.innerHTML = '×';
                closeBtn.onclick = (e) => {
                    e.stopPropagation();
                    if (typeof (window as any).closeDocument === 'function') {
                        (window as any).closeDocument(i);
                    } else if (typeof (appEvents as any)?.emit === 'function') {
                        (appEvents as any).emit('CLOSE_DOCUMENT', { index: i });
                    }
                };
                tab.appendChild(title);
                tab.appendChild(closeBtn);
            } else {
                tab.appendChild(title);
            }
            
            container.appendChild(tab);
        });

        document.querySelectorAll('.image-tab-name').forEach((tab: any) => {
            const parent = tab.parentElement;
            if (parent?.dataset.index) {
                const idx = parseInt(parent.dataset.index);
                tab.onclick = (e: Event) => {
                    e.stopPropagation();
                    if (typeof (window as any).switchDocument === 'function') {
                        (window as any).switchDocument(idx);
                    }
                };
            }
        });
    };
}
