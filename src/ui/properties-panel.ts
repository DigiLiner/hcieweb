import { g } from '../core/globals';
import type { ToolPropConfig } from '../core/types';


document.addEventListener('DOMContentLoaded', function () {
    initializePropertiesPanel();
});

export function initializePropertiesPanel() {
    console.log('Properties panel initializing...');

    const container = document.getElementById('dynamic-properties');
    if (!container) return;

    // Helper to setup a dynamic slider
    function createSlider(config: any) {
        const group = document.createElement('div');
        group.className = 'property-group';

        const label = document.createElement('label');
        label.className = 'property-label';
        label.textContent = config.label;

        const control = document.createElement('div');
        control.className = 'property-control';

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.className = 'property-slider';
        slider.min = config.min.toString();
        slider.max = config.max.toString();
        slider.id = `dynamic-${config.prop}`;

        // Get initial value
        let currentVal = (g as any)[config.prop];
        if (config.mapping === 'percent') {
            slider.value = Math.round(currentVal * 100).toString();
        } else {
            slider.value = currentVal.toString();
        }

        const valueInput = document.createElement('input');
        valueInput.type = 'number';
        valueInput.className = 'property-value-input';
        valueInput.style.cssText = `
            width: 45px;
            font-size: 11px;
            background: #1a1a1a;
            color: #e0e0e0;
            border: 1px solid #333;
            border-radius: 2px;
            text-align: right;
            margin-left: 8px;
        `;
        valueInput.value = slider.value;

        const syncValue = (val: string) => {
            slider.value = val;
            valueInput.value = val;

            if (config.mapping === 'percent') {
                (g as any)[config.prop] = parseFloat(val) / 100;
            } else {
                (g as any)[config.prop] = parseInt(val);
            }

            // Dispatch specific sync events
            if (config.prop === 'brush_hardness') {
                window.dispatchEvent(new CustomEvent('hardnessChanged', { detail: { value: (g as any)[config.prop] } }));
            }
            if (config.prop === 'pen_width') {
                window.dispatchEvent(new CustomEvent('penWidthChanged', { detail: { value: (g as any)[config.prop] } }));
            }
            if (config.prop === 'round_rect_corner_radius') {
                window.dispatchEvent(new CustomEvent('cornerRadiusChanged', { detail: { value: (g as any)[config.prop] } }));
            }
            if (config.prop === 'pen_opacity') {
                window.dispatchEvent(new CustomEvent('syncOpacity', { detail: { value: val } }));
            }
            if (config.prop === 'text_size') {
                window.dispatchEvent(new CustomEvent('textPropertyChanged', { detail: { prop: 'size', value: parseInt(val) } }));
            }
        };

        slider.addEventListener('input', () => syncValue(slider.value));
        valueInput.addEventListener('change', () => {
            let val = parseInt(valueInput.value);
            if (isNaN(val)) val = config.min;
            val = Math.max(config.min, Math.min(config.max, val));
            syncValue(val.toString());
        });

        control.appendChild(slider);
        control.appendChild(valueInput);
        group.appendChild(label);
        group.appendChild(control);
        return group;
    }

    // Helper to setup a dynamic select
    function createSelect(config: any) {
        const group = document.createElement('div');
        group.className = 'property-group';

        const label = document.createElement('label');
        label.className = 'property-label';
        label.textContent = config.label;

        const control = document.createElement('div');
        control.className = 'property-control';

        const select = document.createElement('select');
        select.style.width = '100%';
        select.style.fontSize = '11px';

        config.items.forEach((item: string) => {
            const option = document.createElement('option');
            option.value = item;
            option.textContent = item;
            if ((g as any)[config.prop] === item) option.selected = true;
            select.appendChild(option);
        });

        select.addEventListener('change', (e) => {
            const target = e.target as HTMLSelectElement;
            (g as any)[config.prop] = target.value;
            if (config.prop === 'text_font') {
                window.dispatchEvent(new CustomEvent('textPropertyChanged', { detail: { prop: 'font', value: target.value } }));
            }
        });

        control.appendChild(select);
        group.appendChild(label);
        group.appendChild(control);
        return group;
    }

    // Helper to setup a dynamic checkbox
    function createCheckbox(config: any) {
        const group = document.createElement('div');
        group.className = 'property-group';
        group.style.flexDirection = 'row';
        group.style.alignItems = 'center';
        group.style.justifyContent = 'space-between';
        group.style.padding = '4px 0';

        const label = document.createElement('label');
        label.className = 'property-label';
        label.textContent = config.label;
        label.style.margin = '0';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = (g as any)[config.prop];

        const controlWrapper = document.createElement('div');
        controlWrapper.style.display = 'flex';
        controlWrapper.style.alignItems = 'center';
        controlWrapper.style.gap = '8px';

        if (config.prop === 'cyclic_color') {
            const rainbowIcon = document.createElement('div');
            rainbowIcon.style.width = '16px';
            rainbowIcon.style.height = '16px';
            rainbowIcon.style.borderRadius = '2px';
            rainbowIcon.style.background = 'linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)';
            rainbowIcon.style.marginRight = '4px';
            rainbowIcon.title = 'Cyclic Rainbow Mode';
            controlWrapper.appendChild(rainbowIcon);
        }

        checkbox.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement;
            (g as any)[config.prop] = target.checked;
            if (config.prop === 'shape_fill') {
                window.dispatchEvent(new CustomEvent('fillChanged', { detail: { value: (g as any)[config.prop] } }));
            }
        });

        controlWrapper.appendChild(checkbox);
        group.appendChild(label);
        group.appendChild(controlWrapper);
        return group;
    }

    // Props controlled by the top options bar (Size, Opacity) — do not duplicate in this panel
    const TOOLBAR_ONLY_PROPS = ['pen_opacity', 'pen_width'];

    // Vector Select: show only props that apply to the selected shape type (values synced from shape.style)
    const VECTOR_SHAPE_PROPS: any = {
        line: ['brush_hardness'],
        rect: ['brush_hardness', 'shape_fill'],
        circle: ['brush_hardness', 'shape_fill'],
        ellipse: ['brush_hardness', 'shape_fill'],
        roundrect: ['brush_hardness', 'round_rect_corner_radius', 'shape_fill']
    };

    function getPropConfigsForShapeType(shapeType: string) {
        const propNames = VECTOR_SHAPE_PROPS[shapeType];
        if (!propNames || propNames.length === 0) return [];
        const vectorConfig = window.g.toolConfig['btn-vector-select'];
        if (!vectorConfig || !vectorConfig.props) return [];
        return propNames
            .map((name: string) => vectorConfig.props.find((p: any) => p.prop === name))
            .filter(Boolean);
    }

    function updatePanelForVectorSelection() {
        if (!container) return;
        container.innerHTML = '';
        const sel = (window as any).vectorSelection || { hasSelection: false, shapeType: null, style: null };
        if (!sel.hasSelection || !sel.shapeType || !sel.style) {
            container.innerHTML = `<p style="color: #999; font-size: 11px; text-align: center; padding: 10px;">Select a shape to edit</p>`;
            return;
        }

        // Sync shape style to global state so sliders show correct values
        if (sel.style.width !== undefined) (g as any).pen_width = sel.style.width;
        if (sel.style.opacity !== undefined) (g as any).pen_opacity = sel.style.opacity;
        if (sel.style.hardness !== undefined) (g as any).brush_hardness = sel.style.hardness;
        if (sel.style.cornerRadius !== undefined) (g as any).round_rect_corner_radius = sel.style.cornerRadius;
        if (sel.style.fill !== undefined) (g as any).shape_fill = sel.style.fill;
        if (sel.style.color !== undefined) (g as any).pen_color = sel.style.color;
        if (sel.style.fillColor !== undefined) (g as any).pen_secondary_color = sel.style.fillColor;

        const propConfigs = getPropConfigsForShapeType(sel.shapeType);
        if (propConfigs.length === 0) {
            container.innerHTML = `<p style="color: #999; font-size: 11px; text-align: center; padding: 10px;">No editable properties</p>`;
            return;
        }
        propConfigs.forEach((propConfig: ToolPropConfig) => {
            if (propConfig.type === 'select') {
                container.appendChild(createSelect(propConfig));
            } else if (propConfig.type === 'checkbox') {
                container.appendChild(createCheckbox(propConfig));
            } else {
                container.appendChild(createSlider(propConfig));
            }
        });
    }

    function updatePanelForTool(toolId: string) {
        if (!container) return;
        container.innerHTML = '';
        if (toolId === 'btn-vector-select') {
            updatePanelForVectorSelection();
            return;
        }
        const config = g.toolConfig[toolId];
        if (!config || !config.props || config.props.length === 0) {
            container.innerHTML = `<p style="color: #999; font-size: 11px; text-align: center; padding: 10px;">No extra options</p>`;
            return;
        }
        const panelProps = config.props.filter(p => !TOOLBAR_ONLY_PROPS.includes(p.prop));
        if (panelProps.length === 0) {
            container.innerHTML = `<p style="color: #999; font-size: 11px; text-align: center; padding: 10px;">No extra options</p>`;
            return;
        }
        panelProps.forEach((propConfig: ToolPropConfig) => {
            if (propConfig.type === 'select') {
                container.appendChild(createSelect(propConfig));
            } else if (propConfig.type === 'checkbox') {
                container.appendChild(createCheckbox(propConfig));
            } else {
                container.appendChild(createSlider(propConfig));
            }
        });
    }

    if (container) {
        window.addEventListener('toolChanged', (e: any) => {
            updatePanelForTool(e.detail.tool);
        });
        window.addEventListener('vectorShapeSelectionChanged', () => {
            if (g && g.current_tool && g.current_tool.id === 'btn-vector-select') {
                updatePanelForVectorSelection();
            }
        });

        if (g && g.current_tool) {
            updatePanelForTool(g.current_tool.id);
        }
    }

    console.log('Properties panel dynamic logic initialized');
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
    
    // Expose for debugging/manual calls if needed
    // We need to extract it from the closure or attach it to window inside the closure
}
