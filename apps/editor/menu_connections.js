import { showSettingsModal } from './settings_ui.js';
import { i18n } from './i18n.js';

(function() {
    window.showSettingsModal = showSettingsModal;
    
    console.log("[UnifiedMenu] Linking logical connections...");

    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            showSettingsModal();
        }
    });

    // Initialize i18n on load
    document.addEventListener('DOMContentLoaded', () => {
        i18n.updateUI();
    });

    /**
     * Closes all active dropdown menus.
     */
    window.closeAllMenus = function() {
        document.querySelectorAll(".menu-item").forEach(mi => mi.classList.remove("active"));
        document.querySelectorAll(".menu-option").forEach(mo => mo.classList.remove("active"));
    };

    /**
     * Internal UI Helper: showModifierModal
     * Provides a premium, draggable slider + numeric input dialog with preview support.
     */
    function showModifierModal(title, initialValue, min, max, unit, onApply, onPreview, onCancel) {
        // Close menus after a short delay to ensure propagation completes
        setTimeout(() => {
            if (window.closeAllMenus) window.closeAllMenus();
        }, 30);

        // Remove existing if any
        const existing = document.getElementById('modifier-modal-container');
        if (existing) document.body.removeChild(existing);

        const container = document.createElement('div');
        container.id = 'modifier-modal-container';
        Object.assign(container.style, {
            position: 'fixed',
            top: '100px',
            right: '40px', // Defaults to top-right area
            zIndex: '100000',
            userSelect: 'none',
            fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
        });

        const modal = document.createElement('div');
        modal.className = 'modifier-modal';
        Object.assign(modal.style, {
            backgroundColor: '#2b2b2b',
            border: '1px solid #333',
            borderTop: '4px solid #0078d7', // Premium accent stripe
            boxShadow: '0 12px 30px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
            borderRadius: '6px',
            width: '300px',
            overflow: 'hidden'
        });

        // Title Bar (Draggable)
        const titleBar = document.createElement('div');
        Object.assign(titleBar.style, {
            backgroundColor: '#1e1e1e',
            padding: '10px 16px',
            cursor: 'move',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #333'
        });

        const titleText = document.createElement('span');
        titleText.textContent = title;
        Object.assign(titleText.style, {
            fontSize: '12px',
            fontWeight: '600',
            color: '#eee'
        });
        titleBar.appendChild(titleText);

        const content = document.createElement('div');
        Object.assign(content.style, {
            padding: '16px'
        });

        const controlRow = document.createElement('div');
        Object.assign(controlRow.style, {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px'
        });

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = min;
        slider.max = max;
        slider.value = initialValue;
        Object.assign(slider.style, {
            flex: '1',
            accentColor: '#0078d7',
            cursor: 'pointer'
        });

        const numInput = document.createElement('input');
        numInput.type = 'number';
        numInput.min = min;
        numInput.max = max;
        numInput.value = initialValue;
        Object.assign(numInput.style, {
            width: '55px',
            backgroundColor: '#1a1a1a',
            border: '1px solid #444',
            color: '#00ff7f',
            padding: '4px 2px',
            borderRadius: '3px',
            fontSize: '12px',
            textAlign: 'center',
            outline: 'none'
        });

        const unitText = document.createElement('span');
        unitText.textContent = unit;
        Object.assign(unitText.style, {
            fontSize: '11px',
            color: '#888',
            width: '20px'
        });

        controlRow.appendChild(slider);
        controlRow.appendChild(numInput);
        controlRow.appendChild(unitText);
        content.appendChild(controlRow);

        const footer = document.createElement('div');
        Object.assign(footer.style, {
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px'
        });

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'İptal';
        Object.assign(cancelBtn.style, {
            padding: '5px 12px',
            backgroundColor: '#444',
            border: 'none',
            color: '#eee',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '12px'
        });

        const okBtn = document.createElement('button');
        okBtn.textContent = 'Tamam';
        Object.assign(okBtn.style, {
            padding: '5px 16px',
            backgroundColor: '#0078d7',
            border: 'none',
            color: '#fff',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600'
        });

        footer.appendChild(cancelBtn);
        footer.appendChild(okBtn);
        content.appendChild(footer);

        modal.appendChild(titleBar);
        modal.appendChild(content);
        container.appendChild(modal);
        document.body.appendChild(container);

        // Drag Logic
        let isDragging = false;
        let startX, startY, initialLeft, initialTop;

        titleBar.onmousedown = (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialLeft = container.offsetLeft;
            initialTop = container.offsetTop;
            container.style.transform = 'none'; // Lock transformation to absolute pos
            container.style.left = initialLeft + 'px';
            container.style.top = initialTop + 'px';
            container.style.right = 'auto'; // Break alignment to right
            
            document.onmousemove = (e) => {
                if (!isDragging) return;
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                container.style.left = (initialLeft + dx) + 'px';
                container.style.top = (initialTop + dy) + 'px';
            };
            
            document.onmouseup = () => {
                isDragging = false;
                document.onmousemove = null;
            };
        };

        let previewTimeout = null;
        const updateValue = (v) => {
            slider.value = v;
            numInput.value = v;

            // Performance: 1000ms Debounce for preview to prevent massive memory usage on large images
            if (previewTimeout) {
                clearTimeout(previewTimeout);
            }
            
            previewTimeout = setTimeout(() => {
                if (onPreview) {
                    console.log(`[ModifierModal] Triggering preview: ${title} (${v}${unit})`);
                    onPreview(parseInt(v));
                }
                previewTimeout = null;
            }, 1000);
        };

        slider.oninput = (e) => updateValue(e.target.value);
        numInput.onchange = (e) => updateValue(e.target.value);
        numInput.oninput = (e) => updateValue(e.target.value);

        const close = () => {
            if (document.body.contains(container)) {
                document.body.removeChild(container);
            }
        };

        cancelBtn.onclick = () => {
            if (onCancel) onCancel();
            close();
        };

        okBtn.onclick = () => {
            onApply(parseInt(numInput.value));
            close();
        };

        numInput.focus();
        numInput.select();
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

    function wrapperSelectionChange(title, initial, min, max, unit, func) {
        const g = window.g;
        if (!g || !g.isSelectionActive) {
            // Visual alert could be replaced with simple guard or toast
            alert("Önce bir alan seçmelisiniz.");
            if (window.closeAllMenus) window.closeAllMenus();
            return;
        }
        if (!window.captureSelectionState) return;
        
        const startState = window.captureSelectionState();
        
        showModifierModal(title, initial, min, max, unit,
            (val) => { // OK/Apply - final change with history
                window.applySelectionState(startState);
                window.__BYPASS_HISTORY__ = false;
                func(val);
            },
            (val) => { // Preview - temporary change without history
                window.applySelectionState(startState);
                window.__BYPASS_HISTORY__ = true;
                func(val);
            },
            () => { // Cancel - revert to original state
                window.applySelectionState(startState);
                window.__BYPASS_HISTORY__ = false;
            }
        );
    }

    window.modifyFeather = () => wrapperSelectionChange("Seçimi Yumuşat (Feather)", 5, 0, 100, "px", (v) => window.featherSelection && window.featherSelection(v));
    window.modifyExpand = () => wrapperSelectionChange("Seçimi Genişlet (Grow)", 5, 1, 50, "px", (v) => window.expandSelection && window.expandSelection(v));
    window.modifyContract = () => wrapperSelectionChange("Seçimi Daralt (Shrink)", 5, 1, 50, "px", (v) => window.contractSelection && window.contractSelection(v));
    window.modifyBorder = () => wrapperSelectionChange("Kenarlık Seçimi (Border)", 5, 1, 100, "px", (v) => window.borderSelection && window.borderSelection(v));
    
    window.modifyStroke = () => wrapperSelectionChange("Seçimi Çiz (Stroke)", 2, 1, 50, "px", (v) => {
        if (window.strokeSelection) window.strokeSelection(window.g.pen_color || "#000000", v);
    });

    /**
     * Edit: Fill Selection
     */
    window.modifyFill = function() {
        const g = window.g;
        if (!g || !g.isSelectionActive) {
            alert("Önce bir alan seçmelisiniz.");
            if (window.closeAllMenus) window.closeAllMenus();
            return;
        }
        if (window.fillSelection) {
            window.fillSelection(g.pen_color || "#000000");
        }
        if (window.closeAllMenus) window.closeAllMenus();
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
        if (window.closeAllMenus) window.closeAllMenus();
    };

    // ─── Menu Interaction Overrides ───────────────────────────
    // Disable hover-open, enable click-open
    document.addEventListener("DOMContentLoaded", function() {
        const menuItems = document.querySelectorAll(".menu-item");
        
        function updateSelectionMenuStates() {
            const g = window.g;
            const hasSelection = g && g.isSelectionActive;
            
            // Find "Modify" menu option and its sub-options
            const modifyOptions = document.querySelectorAll('.menu-option[onclick*="modify"], .menu-option[onclick*="feather"], .menu-option[onclick*="expand"], .menu-option[onclick*="contract"], .menu-option[onclick*="border"], .menu-option[onclick*="stroke"], .menu-option[onclick*="fill"]');
            
            modifyOptions.forEach(opt => {
                if (hasSelection) {
                    opt.classList.remove('disabled');
                } else {
                    opt.classList.add('disabled');
                }
            });

            // Specific check for parent "Modify" (the one with the submenu)
            const modifyParent = Array.from(document.querySelectorAll('.menu-option')).find(el => el.textContent.includes('Modify'));
            if (modifyParent) {
                if (hasSelection) modifyParent.classList.remove('disabled');
                else modifyParent.classList.add('disabled');
            }
        }

        menuItems.forEach(item => {
            item.addEventListener("click", function(e) {
                // Update selection-dependent states before showing the menu
                if (this.textContent.trim().includes('Select') || this.textContent.trim().includes('Edit')) {
                    updateSelectionMenuStates();
                }

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
