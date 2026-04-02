/**
 * Unified Menu Connections & Coordination
 * This script bridges the unified menu UI with the application core.
 */

(function() {
    console.log("[UnifiedMenu] Linking logical connections...");

    // ─── View Connections ─────────────────────────────────────

    /**
     * View: Fit on Screen (Ctrl+0)
     */
    window.fitOnScreen = function() {
        const g = window.g;
        const container = document.getElementById('canvasScrollArea');
        if (!container || !g) return;

        const padding = 60; // 30px each side
        const availableWidth = container.clientWidth - padding;
        const availableHeight = container.clientHeight - padding;
        
        const scaleX = availableWidth / g.image_width;
        const scaleY = availableHeight / g.image_height;
        
        // Calculate best fit zoom
        const newZoom = Math.min(scaleX, scaleY);
        const oldZoom = g.zoom;
        g.zoom = Math.max(0.05, Math.min(newZoom, 32)); // Clamp to core limits
        
        if (window.applyZoom) {
            window.applyZoom(oldZoom, null);
        }
        
        // Center the scroll
        setTimeout(() => {
            container.scrollLeft = (g.image_width * g.zoom - container.clientWidth) / 2;
            container.scrollTop = (g.image_height * g.zoom - container.clientHeight) / 2;
        }, 10);
        
        console.log(`[View] Fit on Screen: ${Math.round(g.zoom * 100)}%`);
    };

    /**
     * View: 100% (Ctrl+1)
     */
    window.actualSize = function() {
        if (!window.g) return;
        const oldZoom = window.g.zoom;
        window.g.zoom = 1.0;
        if (window.applyZoom) {
            window.applyZoom(oldZoom, null);
        }
    };

    // ─── Layer Connections ─────────────────────────────────────

    /**
     * Layer: Duplicate Layer (Ctrl+J)
     */
    window.duplicateLayer = function() {
        const g = window.g;
        const layers = window.layers;
        if (!g || !layers) return;

        const activeIdx = g.activeLayerIndex;
        const sourceLayer = layers[activeIdx];
        if (!sourceLayer) return;

        const LayerClass = window.LayerClass || window.layer_class || window._;
        if (!LayerClass) {
            console.error("Layer constructor not available.");
            return;
        }

        // Create new layer based on active one
        const newLayer = new LayerClass(`${sourceLayer.name} Copy`);
        newLayer.visible = sourceLayer.visible;
        newLayer.opacity = sourceLayer.opacity;
        newLayer.blendMode = sourceLayer.blendMode;
        newLayer.locked = sourceLayer.locked;
        newLayer.type = sourceLayer.type;
        
        // Copy raster content
        if (sourceLayer.canvas && newLayer.ctx) {
            newLayer.ctx.drawImage(sourceLayer.canvas, 0, 0);
        }
        
        // Copy vector shapes (deep copy)
        if (sourceLayer.shapes) {
            newLayer.shapes = JSON.parse(JSON.stringify(sourceLayer.shapes));
        }

        // Insert into array
        layers.splice(activeIdx + 1, 0, newLayer);
        g.activeLayerIndex = activeIdx + 1;

        // History support
        const HistoryAction = window.LayerAddAction;
        if (window.historyManager && HistoryAction) {
            window.historyManager.push(new HistoryAction(activeIdx + 1, newLayer));
        }

        // UI Update
        if (window.renderLayers) window.renderLayers();
        if (window.updateLayerPanel) window.updateLayerPanel();
        
        console.log(`[Layer] Duplicated: ${sourceLayer.name}`);
    };

    /**
     * Layer: Merge Down (Ctrl+E)
     */
    window.mergeLayers = function() {
        const g = window.g;
        const layers = window.layers;
        if (!g || !layers || g.activeLayerIndex <= 0) return;

        const activeIdx = g.activeLayerIndex;
        const topLayer = layers[activeIdx];
        const bottomLayer = layers[activeIdx - 1];

        // Backup bottom layer state for history if possible (complex)
        // For now, just commit.
        
        const bCtx = bottomLayer.ctx;
        bCtx.save();
        bCtx.globalAlpha = topLayer.opacity;
        bCtx.globalCompositeOperation = topLayer.blendMode;
        bCtx.drawImage(topLayer.canvas, 0, 0);
        
        // If there were shapes on top layer, we'd need to rasterize them too
        if (topLayer.shapes && window.drawShapesToCtx) {
             window.drawShapesToCtx(bCtx, topLayer.shapes);
        }
        bCtx.restore();

        // Remove the top layer
        layers.splice(activeIdx, 1);
        g.activeLayerIndex = activeIdx - 1;

        // UI Update
        if (window.renderLayers) window.renderLayers();
        if (window.updateLayerPanel) window.updateLayerPanel();
        
        console.log(`[Layer] Merged into: ${bottomLayer.name}`);
    };

    /**
     * Layer: New Group (Ctrl+G)
     */
    window.addGroup = function() {
        console.log("[Layer] Groups not yet implemented in core. Initializing folder logic...");
        // Placeholder for future implementation
    };

    // ─── Tool Selection ───────────────────────────────────────

    /**
     * Tools: Quick Select
     * @param {string} toolKey - The static key of the Tool class (e.g., 'Pen', 'Brush')
     */
    window.selectToolShortcut = function(toolKey) {
        const ToolClass = window.Tool;
        if (!ToolClass || !ToolClass[toolKey]) {
            console.warn(`Tool ${toolKey} not found in library.`);
            return;
        }
        
        const tool = ToolClass[toolKey];
        if (window.selectTool) {
            window.selectTool(tool);
        }
    };

})();
