/**
 * @file overlay-coordinator.ts
 * @description Handles splash screen and SVG marching ants selection border.
 */

import { g } from '@hcie/core';
import { EventBus } from '@hcie/shared';

export function setupEmptyStateUI() {
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
        emptyState.style.cssText = "position:absolute; top:0; left:0; width:100%; height:100%; background:#f5f6f7; z-index:900; display:flex; align-items:center; justify-content:center;";
        const canvasContainer = document.getElementById('drawingCanvasContainer');
        if (canvasContainer) canvasContainer.appendChild(emptyState);
    }

    const isEmpty = g.documents.length === 0;
    emptyState.style.display = isEmpty ? 'flex' : 'none';
}

export function setupSVGOverlay() {
    let svg = document.getElementById('hcie-selection-svg') as any;
    if (!svg) {
        const svgNS = "http://www.w3.org/2000/svg";
        const newSvg = document.createElementNS(svgNS, "svg");
        newSvg.id = 'hcie-selection-svg';
        newSvg.style.cssText = "position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:1000; display:none;";
        
        // Define pattern for marching ants
        const defs = document.createElementNS(svgNS, "defs");
        const pattern = document.createElementNS(svgNS, "pattern");
        pattern.id = "ants";
        pattern.setAttribute("patternUnits", "userSpaceOnUse");
        pattern.setAttribute("width", "8");
        pattern.setAttribute("height", "8");
        
        const rect1 = document.createElementNS(svgNS, "rect");
        rect1.setAttribute("width", "8");
        rect1.setAttribute("height", "8");
        rect1.setAttribute("fill", "white");
        
        const rect2 = document.createElementNS(svgNS, "rect");
        rect2.setAttribute("width", "4");
        rect2.setAttribute("height", "8");
        rect2.setAttribute("fill", "black");
        
        pattern.appendChild(rect1);
        pattern.appendChild(rect2);
        defs.appendChild(pattern);
        newSvg.appendChild(defs);
        
        const path = document.createElementNS(svgNS, "path");
        path.id = 'hcie-selection-path';
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", "url(#ants)");
        path.setAttribute("stroke-width", "1");
        
        newSvg.appendChild(path);
        const canvasContainer = document.getElementById('drawingCanvasContainer');
        if (canvasContainer) canvasContainer.appendChild(newSvg);
    }
}

export function initOverlayCoordinator() {
    EventBus.on('PROJECT_LOADED', setupEmptyStateUI);
    EventBus.on('DOCUMENT_SWITCHED', setupEmptyStateUI);
    window.addEventListener('load', () => {
        setupEmptyStateUI();
        setupSVGOverlay();
    });
}
