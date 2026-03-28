import { Tool } from '../core/globals';

/**
 * Artistic Brushes Module 
 * Manages the visibility of the artistic brushes panel based on tool selection
 */

export function initializeArtisticBrushes() {
    console.log("[INIT] Artistic Brushes Module Initializing...");
    
    // Listen for tool changes
    window.addEventListener('toolChanged', (e: any) => {
        const toolId = e.detail.tool;
        updateArtisticBrushesVisibility(toolId);
    });

    // Initial check with small delay to ensure g object is ready
    setTimeout(() => {
        const currentToolId = (window as any).g?.current_tool?.id;
        if (currentToolId) {
            updateArtisticBrushesVisibility(currentToolId);
        }
    }, 100);
}

function updateArtisticBrushesVisibility(toolId: string) {
    const artisticPanel = document.getElementById('artistic-brushes-panel');
    const penPanel = document.getElementById('pen-settings-panel');
    
    if (artisticPanel) {
        artisticPanel.style.display = (toolId === Tool.Brush.id) ? 'flex' : 'none';
    }
    
    if (penPanel) {
        penPanel.style.display = (toolId === Tool.Pen.id) ? 'flex' : 'none';
    }
}

/**
 * Brush specific settings/behavior can be added here
 */
export function selectArtisticBrush(brushType: string) {
    console.log(`[ARTISTIC] Selected brush type: ${brushType}`);
    
    // Deactivate all buttons in this panel
    const buttons = document.querySelectorAll('#artistic-brushes-panel .button');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Activate selected button
    const activeBtn = document.getElementById(`btn-brush-${brushType}`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }

    // Custom logic for each brush type can be implemented here
    // For now we could just adjust pen/brush settings in the global object
    const g = (window as any).g;
    if (!g) return;

    switch (brushType) {
        case 'oil':
            g.brush_style = 'oil';
            g.brush_hardness = 0.8;
            g.brush_flow = 0.6;
            g.pen_width = Math.max(g.pen_width, 15);
            g.brush_spacing = 5;
            break;
        case 'charcoal':
            g.brush_style = 'charcoal';
            g.brush_hardness = 0.4;
            g.brush_flow = 0.6;
            g.pen_width = Math.max(g.pen_width, 25);
            g.brush_spacing = 5; // Denser buildup
            break;
        case 'watercolor':
            g.brush_style = 'watercolor';
            g.brush_hardness = 0.1;
            g.brush_flow = 0.2;
            g.pen_opacity = 0.3;
            g.brush_spacing = 5;
            break;
        case 'calligraphy':
            g.brush_style = 'calligraphy';
            g.brush_hardness = 0.9;
            g.brush_flow = 1.0;
            g.brush_spacing = 2;
            break;
        case 'marker':
            g.brush_style = 'marker';
            g.brush_hardness = 1.0;
            g.brush_flow = 0.8;
            g.pen_opacity = 0.7;
            g.brush_spacing = 2;
            break;
        case 'leaf':
            g.brush_style = 'leaf';
            g.brush_hardness = 0.5;
            g.brush_flow = 1.0;
            g.pen_width = Math.max(g.pen_width, 30);
            g.brush_spacing = 80;
            break;
        case 'rock':
            g.brush_style = 'rock';
            g.brush_hardness = 0.7;
            g.brush_flow = 0.8;
            g.pen_width = Math.max(g.pen_width, 40);
            g.brush_spacing = 60;
            break;
        case 'meadow':
            g.brush_style = 'meadow';
            g.brush_hardness = 0.8;
            g.brush_flow = 0.9;
            g.pen_width = Math.max(g.pen_width, 25);
            g.brush_spacing = 40;
            break;
        case 'wood':
            g.brush_style = 'wood';
            g.brush_hardness = 0.5;
            g.brush_flow = 0.7;
            g.pen_width = Math.max(g.pen_width, 50);
            g.brush_spacing = 15;
            break;
        default:
            g.brush_style = 'default';
            g.brush_spacing = 10;
    }

    // Update spacing UI
    syncSpacingUI();

    // Ensure the main brush tool is selected if not already
    if (g.current_tool?.id !== Tool.Brush.id) {
        if ((window as any).selectTool) {
            (window as any).selectTool(Tool.Brush);
        }
    }

    // Refresh properties panel if it exists
    if ((window as any).propertiesPanel && typeof (window as any).propertiesPanel.render === 'function') {
        (window as any).propertiesPanel.render();
    }
}

/**
 * Updates brush spacing from slider
 */
export function updateBrushSpacing(value: string) {
    const numericValue = parseInt(value);
    const g = (window as any).g;
    if (g) {
        g.brush_spacing = numericValue;
    }

    // Update value display
    const valueDisplay = document.getElementById('brush-spacing-value');
    if (valueDisplay) {
        valueDisplay.textContent = `${value}%`;
    }
}

function syncSpacingUI() {
    const g = (window as any).g;
    if (!g) return;

    const spacingSlider = document.getElementById('brush-spacing-slider') as HTMLInputElement;
    const spacingValue = document.getElementById('brush-spacing-value');

    if (spacingSlider) {
        spacingSlider.value = g.brush_spacing.toString();
    }
    if (spacingValue) {
        spacingValue.textContent = `${g.brush_spacing}%`;
    }
}

/**
 * Pen Tip Selection
 */
export function selectPenTip(tipShape: 'round' | 'square' | 'ellipse' | 'soft') {
    console.log(`[PEN] Selected tip shape: ${tipShape}`);
    const g = (window as any).g;
    if (!g) return;

    g.pen_tip = tipShape;

    // UI Feedback
    const buttons = document.querySelectorAll('#pen-settings-panel .button');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    const activeBtn = document.getElementById(`btn-pen-tip-${tipShape}`);
    if (activeBtn) activeBtn.classList.add('active');

    // Show/Hide angle control (Diamond and Ellipse benefit from Tilt)
    const angleControl = document.getElementById('pen-angle-control');
    if (angleControl) {
        const needsAngle = ['ellipse', 'diamond', 'vertical', 'horizontal', 'star'].includes(tipShape);
        angleControl.style.display = needsAngle ? 'block' : 'none';
    }
}

export function updatePenAngle(value: string) {
    const g = (window as any).g;
    if (!g) return;

    const angle = parseInt(value);
    g.pen_angle = angle;

    const display = document.getElementById('pen-angle-value');
    if (display) display.textContent = `${angle}°`;
}

// Expose to window for HTML onclick handlers
if (typeof window !== 'undefined') {
    (window as any).selectArtisticBrush = selectArtisticBrush;
    (window as any).updateBrushSpacing = updateBrushSpacing;
    (window as any).selectPenTip = selectPenTip;
    (window as any).updatePenAngle = updatePenAngle;
}
