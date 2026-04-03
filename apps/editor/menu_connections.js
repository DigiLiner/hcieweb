(function() {
    console.log("[UnifiedMenu] Linking logical connections...");

    /**
     * Internal UI Helper: showModifierModal
     * Provides a premium slider + numeric input dialog.
     */
    function showModifierModal(title, initialValue, min, max, unit, onApply) {
        const overlay = document.createElement('div');
        overlay.id = 'modifier-modal-overlay';
        Object.assign(overlay.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '100000', // Extremely high
            backdropFilter: 'blur(4px)',
            transition: 'opacity 0.2s ease'
        });

        const modal = document.createElement('div');
        modal.className = 'modifier-modal';
        Object.assign(modal.style, {
            backgroundColor: '#252525',
            border: '1px solid #444',
            borderTop: '4px solid #0078d7',
            borderRadius: '8px',
            padding: '24px',
            width: '340px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            color: '#fff',
            fontFamily: "'Roboto', sans-serif",
            userSelect: 'none'
        });

        const h3 = document.createElement('h3');
        h3.textContent = title;
        Object.assign(h3.style, {
            marginTop: '0',
            marginBottom: '20px',
            fontSize: '18px',
            fontWeight: '500',
            color: '#0078d7'
        });

        const controlGroup = document.createElement('div');
        Object.assign(controlGroup.style, {
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            marginBottom: '30px'
        });

        const sliderRow = document.createElement('div');
        Object.assign(sliderRow.style, {
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
        });

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = min;
        slider.max = max;
        slider.value = initialValue;
        Object.assign(slider.style, {
            flex: '1',
            cursor: 'pointer',
            height: '4px',
            borderRadius: '2px',
            outline: 'none',
            accentColor: '#0078d7'
        });

        const numberInput = document.createElement('input');
        numberInput.type = 'number';
        numberInput.min = min;
        numberInput.max = max;
        numberInput.value = initialValue;
        Object.assign(numberInput.style, {
            width: '70px',
            backgroundColor: '#111',
            border: '1px solid #444',
            color: '#00ff00', // Green for values
            padding: '8px',
            borderRadius: '4px',
            textAlign: 'center',
            fontSize: '14px',
            fontFamily: 'monospace',
            outline: 'none'
        });

        const unitSpan = document.createElement('span');
        unitSpan.textContent = unit;
        Object.assign(unitSpan.style, {
            fontSize: '12px',
            color: '#888',
            width: '20px'
        });

        sliderRow.appendChild(slider);
        sliderRow.appendChild(numberInput);
        sliderRow.appendChild(unitSpan);
        controlGroup.appendChild(sliderRow);

        const buttonRow = document.createElement('div');
        Object.assign(buttonRow.style, {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px'
        });

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'İptal';
        Object.assign(cancelBtn.style, {
            backgroundColor: 'transparent',
            border: '1px solid #444',
            color: '#aaa',
            padding: '8px 20px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.1s'
        });
        cancelBtn.onmouseover = () => cancelBtn.style.color = '#fff';
        cancelBtn.onmouseout = () => cancelBtn.style.color = '#aaa';

        const applyBtn = document.createElement('button');
        applyBtn.textContent = 'Uygula';
        Object.assign(applyBtn.style, {
            backgroundColor: '#0078d7',
            border: 'none',
            color: '#fff',
            padding: '8px 24px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'background 0.1s'
        });
        applyBtn.onmouseover = () => applyBtn.style.backgroundColor = '#0084ee';
        applyBtn.onmouseout = () => applyBtn.style.backgroundColor = '#0078d7';

        buttonRow.appendChild(cancelBtn);
        buttonRow.appendChild(applyBtn);

        modal.appendChild(h3);
        modal.appendChild(controlGroup);
        modal.appendChild(buttonRow);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        const sync = (source, target) => {
            target.value = source.value;
        };
        slider.addEventListener('input', () => sync(slider, numberInput));
        numberInput.addEventListener('input', () => sync(numberInput, slider));

        const close = () => {
            if (document.body.contains(overlay)) {
                document.body.removeChild(overlay);
            }
        };
        cancelBtn.onclick = close;
        applyBtn.onclick = () => {
            onApply(parseInt(numberInput.value));
            close();
        };
        overlay.onclick = (e) => { if (e.target === overlay) close(); };
        
        window.addEventListener('keydown', function esc(e) {
            if (e.key === 'Escape') {
                close();
                window.removeEventListener('keydown', esc);
            }
        });

        numberInput.focus();
        numberInput.select();
    }

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

    // ─── Selection Modification Connections ───────────────────

    /**
     * Select: Feather
     */
    /**
     * Select: Feather
     */
    window.modifyFeather = function() {
        console.log("[Menu] Opening Feather modal...");
        showModifierModal("Seçimi Yumuşat (Feather)", 5, 0, 100, "px", (val) => {
            if (window.featherSelection) {
                console.log(`[Menu] Calling featherSelection(${val})`);
                window.featherSelection(val);
            }
        });
    };

    /**
     * Select: Expand
     */
    window.modifyExpand = function() {
        console.log("[Menu] Opening Expand modal...");
        showModifierModal("Seçimi Genişlet (Expand)", 5, 1, 50, "px", (val) => {
            if (window.expandSelection) {
                console.log(`[Menu] Calling expandSelection(${val})`);
                window.expandSelection(val);
            }
        });
    };

    /**
     * Select: Contract
     */
    window.modifyContract = function() {
        console.log("[Menu] Opening Contract modal...");
        showModifierModal("Seçimi Daralt (Contract)", 5, 1, 50, "px", (val) => {
            if (window.contractSelection) {
                console.log(`[Menu] Calling contractSelection(${val})`);
                window.contractSelection(val);
            }
        });
    };

    /**
     * Select: Border
     */
    window.modifyBorder = function() {
        console.log("[Menu] Opening Border modal...");
        showModifierModal("Seçim Kenarlığı (Border)", 5, 1, 100, "px", (val) => {
            if (window.borderSelection) {
                console.log(`[Menu] Calling borderSelection(${val})`);
                window.borderSelection(val);
            }
        });
    };

    /**
     * Edit: Fill Selection
     */
    window.modifyFill = function() {
        const g = window.g;
        if (!g || !g.isSelectionActive) {
            alert("Önce bir alan seçmelisiniz.");
            return;
        }
        if (window.fillSelection) {
            // Fill with current active color
            window.fillSelection(g.pen_color || "#000000");
        }
    };

    window.modifyStroke = function() {
        const g = window.g;
        if (!g || !g.isSelectionActive) {
            alert("Önce bir alan seçmelisiniz.");
            return;
        }
        showModifierModal("Seçimi Çiz (Stroke)", 2, 1, 50, "px", (val) => {
            if (window.strokeSelection) {
                window.strokeSelection(g.pen_color || "#000000", val);
            }
        });
    };

    // ─── Image/Global Connections ─────────────────────────────

    /**
     * Image: Resize/Crop
     */
    window.cropToSelection = function() {
        if (!window.g || !window.g.selectionCanvas || !window.getMaskBounds) return;
        const bounds = window.getMaskBounds(window.g.selectionCanvas);
        if (bounds && window.performCrop) {
            window.performCrop(bounds.x, bounds.y, bounds.w, bounds.h);
        }
    };

    // ─── Menu Interaction Overrides ───────────────────────────
    // Disable hover-open, enable click-open
    document.addEventListener("DOMContentLoaded", function() {
        const menuItems = document.querySelectorAll(".menu-item");
        
        menuItems.forEach(item => {
            item.addEventListener("click", function(e) {
                // Toggle active class on the clicked menu item
                const isActive = this.classList.contains("active");
                
                // Close all others first
                menuItems.forEach(mi => mi.classList.remove("active"));
                
                if (!isActive) {
                    this.classList.add("active");
                }
                
                e.stopPropagation();
            });

            // Prevent dropdown clicks from closing the menu immediately
            const dropdown = item.querySelector(".menu-dropdown");
            if (dropdown) {
                dropdown.addEventListener("click", function(e) {
                    const option = e.target.closest(".menu-option");
                    if (option) {
                        const hasSubmenu = option.querySelector(".menu-submenu");
                        if (hasSubmenu) {
                            // Toggle active on the option itself for submenus
                            option.classList.toggle("active");
                            e.stopPropagation(); // Keep dropdown open
                        } else {
                            // Regular option, close top menu
                            item.classList.remove("active");
                        }
                    }
                });
            }
        });

        // Global click-out to close
        document.addEventListener("click", function() {
            menuItems.forEach(mi => mi.classList.remove("active"));
        });

        console.log("[UnifiedMenu] Menu hover disabled. Click to open enabled.");
    });

})();
