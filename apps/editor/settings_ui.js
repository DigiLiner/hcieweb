/**
 * settings_ui.js: The UI component for the application settings modal.
 */

import { settingsManager } from './settings_manager.js';
import { i18n } from './i18n.js';

export function showSettingsModal() {
    // Create elements
    const overlay = document.createElement('div');
    overlay.className = 'modal active';
    overlay.id = 'settings-modal-overlay';
    overlay.style.zIndex = '30000'; // Above everything

    const modal = document.createElement('div');
    modal.className = 'modal-content';
    modal.style.width = '650px';
    modal.style.height = '450px';
    modal.style.flexDirection = 'row';

    // Left Sidebar (Categories)
    const sidebar = document.createElement('div');
    sidebar.style.width = '160px';
    sidebar.style.background = 'var(--bg-panel)';
    sidebar.style.borderRight = '1px solid var(--border-light)';
    sidebar.style.display = 'flex';
    sidebar.style.flexDirection = 'column';
    sidebar.style.padding = '10px 0';

    const title = document.createElement('div');
    title.style.padding = '10px 20px';
    title.style.fontSize = '14px';
    title.style.fontWeight = '700';
    title.style.color = 'var(--text-primary)';
    title.style.marginBottom = '10px';
    title.textContent = i18n.t('settings.title');
    sidebar.appendChild(title);

    // Main Content Area
    const mainContent = document.createElement('div');
    mainContent.style.flex = '1';
    mainContent.style.display = 'flex';
    mainContent.style.flexDirection = 'column';
    mainContent.style.background = 'var(--bg-surface)';

    const body = document.createElement('div');
    body.className = 'modal-body';
    body.style.flex = '1';
    body.style.overflowY = 'auto';
    body.style.padding = '25px';

    const footer = document.createElement('div');
    footer.className = 'modal-footer';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn-ok';
    closeBtn.textContent = i18n.t('common.ok');
    footer.appendChild(closeBtn);

    mainContent.appendChild(body);
    mainContent.appendChild(footer);

    modal.appendChild(sidebar);
    modal.appendChild(mainContent);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Categories
    const categories = [
        { id: 'general', label: i18n.t('settings.tab.general'), icon: '⚙️' },
        { id: 'interface', label: i18n.t('settings.tab.interface'), icon: '🎨' },
        { id: 'canvas', label: i18n.t('settings.tab.canvas'), icon: '🖼️' },
        { id: 'advanced', label: i18n.t('settings.tab.advanced'), icon: '🛠️' }
    ];

    let activeTabId = 'general';
    const tabButtons = {};

    categories.forEach(cat => {
        const btn = document.createElement('div');
        btn.style.padding = '10px 20px';
        btn.style.cursor = 'pointer';
        btn.style.fontSize = '12px';
        btn.style.display = 'flex';
        btn.style.alignItems = 'center';
        btn.style.gap = '10px';
        btn.style.transition = 'background 0.2s';
        btn.textContent = cat.label;

        btn.onclick = () => switchTab(cat.id);
        sidebar.appendChild(btn);
        tabButtons[cat.id] = btn;
    });

    function switchTab(id) {
        activeTabId = id;
        Object.keys(tabButtons).forEach(tid => {
            tabButtons[tid].style.background = tid === id ? 'var(--bg-hover)' : 'transparent';
            tabButtons[tid].style.color = tid === id ? 'var(--text-primary)' : 'var(--text-secondary)';
            tabButtons[tid].style.borderLeft = tid === id ? '3px solid #0078d7' : '3px solid transparent';
        });
        renderTabContent(id);
    }

    function renderTabContent(id) {
        body.innerHTML = '';
        
        if (id === 'general') {
            addSelect(body, i18n.t('settings.lang'), 'general.language', [
                { value: 'tr', label: 'Türkçe' },
                { value: 'en', label: 'English' },
                { value: 'de', label: 'Deutsch' },
                { value: 'fr', label: 'Français' },
                { value: 'es', label: 'Español' },
                { value: 'ru', label: 'Русский' }
            ]);
            addToggle(body, i18n.t('settings.general.autoLoad'), 'general.autoLoadLastFile');
            addToggle(body, i18n.t('settings.general.confirmExit'), 'general.confirmExit');
        } else if (id === 'interface') {
            addSelect(body, i18n.t('settings.theme'), 'interface.theme', [
                { value: 'dark', label: i18n.t('settings.theme.dark') },
                { value: 'light', label: i18n.t('settings.theme.light') },
                { value: 'system', label: i18n.t('settings.theme.system') }
            ]);
            addInput(body, i18n.t('settings.interface.accent'), 'interface.accentColor', 'color');
            addSlider(body, i18n.t('settings.interface.scale'), 'interface.uiScaling', 0.5, 1.5, 0.1);
        } else if (id === 'canvas') {
            addSlider(body, i18n.t('settings.canvas.checkerSize'), 'canvas.checkerSize', 4, 64, 4);
            addInput(body, i18n.t('settings.canvas.checker1'), 'canvas.checkerColor1', 'color');
            addInput(body, i18n.t('settings.canvas.checker2'), 'canvas.checkerColor2', 'color');
            addToggle(body, i18n.t('settings.canvas.rulers'), 'canvas.showRulers');
            addToggle(body, i18n.t('settings.canvas.snap'), 'canvas.snapEnabled');
        } else if (id === 'advanced') {
            addToggle(body, i18n.t('settings.advanced.gpu'), 'advanced.gpuAcceleration');
            addSlider(body, i18n.t('settings.advanced.undo'), 'advanced.undoLimit', 10, 200, 10);
            
            const clearBtn = document.createElement('button');
            clearBtn.textContent = i18n.t('settings.advanced.reset');
            clearBtn.style.marginTop = '20px';
            clearBtn.className = 'btn-cancel';
            clearBtn.onclick = () => {
                if (confirm(i18n.t('settings.advanced.reset_confirm'))) {
                    settingsManager.reset();
                    switchTab(activeTabId); // Re-render
                }
            };
            body.appendChild(clearBtn);
        }
    }

    // Helper functions for UI components
    function createRow(container, labelText) {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.alignItems = 'center';
        row.style.marginBottom = '15px';
        row.style.paddingBottom = '10px';
        row.style.borderBottom = '1px solid var(--border-light)';

        const label = document.createElement('label');
        label.textContent = labelText;
        label.style.fontSize = '12px';
        label.style.color = 'var(--text-primary)';

        row.appendChild(label);
        container.appendChild(row);
        return row;
    }

    function addToggle(container, label, path) {
        const row = createRow(container, label);
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = settingsManager.get(path);
        input.style.cursor = 'pointer';
        input.onchange = (e) => settingsManager.set(path, e.target.checked);
        row.appendChild(input);
    }

    function addSelect(container, label, path, options) {
        const row = createRow(container, label);
        const select = document.createElement('select');
        select.style.padding = '4px 8px';
        select.style.background = 'var(--bg-input)';
        select.style.border = '1px solid var(--border-color)';
        select.style.color = 'var(--text-primary)';
        select.style.borderRadius = '4px';
        select.style.fontSize = '11px';

        options.forEach(opt => {
            const el = document.createElement('option');
            el.value = opt.value;
            el.textContent = opt.label;
            if (opt.value === settingsManager.get(path)) el.selected = true;
            select.appendChild(el);
        });

        select.onchange = (e) => {
           settingsManager.set(path, e.target.value);
           if (path === 'general.language') i18n.setLanguage(e.target.value);
        };
        row.appendChild(select);
    }

    function addInput(container, label, path, type = 'text') {
        const row = createRow(container, label);
        const input = document.createElement('input');
        input.type = type;
        input.value = settingsManager.get(path);
        input.style.padding = '4px 8px';
        input.style.background = 'var(--bg-input)';
        input.style.border = '1px solid var(--border-color)';
        input.style.color = 'var(--text-primary)';
        input.style.borderRadius = '4px';
        input.onchange = (e) => settingsManager.set(path, e.target.value);
        row.appendChild(input);
    }

    function addSlider(container, label, path, min, max, step) {
        const row = createRow(container, label);
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.gap = '10px';

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = min;
        slider.max = max;
        slider.step = step;
        slider.value = settingsManager.get(path);

        const valLabel = document.createElement('span');
        valLabel.textContent = slider.value;
        valLabel.style.fontSize = '11px';
        valLabel.style.minWidth = '25px';

        slider.oninput = (e) => {
            valLabel.textContent = e.target.value;
            settingsManager.set(path, parseFloat(e.target.value));
        };

        wrapper.appendChild(slider);
        wrapper.appendChild(valLabel);
        row.appendChild(wrapper);
    }

    // Initialization
    switchTab('general');

    const close = () => {
        document.body.removeChild(overlay);
        window.removeEventListener('keydown', escHandler);
    };

    closeBtn.onclick = close;

    const escHandler = (e) => {
        if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', escHandler);
}
