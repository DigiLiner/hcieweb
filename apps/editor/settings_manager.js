/**
 * SettingsManager: Handles application preferences persistence and application.
 * Uses localStorage to store settings and provides an event-driven way to listen for changes.
 */

const SETTINGS_KEY = 'hcie_settings';

const DEFAULT_SETTINGS = {
    general: {
        language: 'en', // 'tr' or 'en'
        confirmExit: true,
        autoLoadLastFile: false
    },
    interface: {
        theme: 'dark', // 'dark', 'light', or 'system'
        accentColor: '#0078d7',
        uiScaling: 1,
    },
    canvas: {
        checkerSize: 16,
        checkerColor1: '#404040',
        checkerColor2: '#2a2a2a',
        showRulers: false,
        snapEnabled: true
    },
    advanced: {
        gpuAcceleration: true,
        undoLimit: 50
    }
};

class SettingsManager {
    constructor() {
        this.settings = this.loadSettings();
        this.applyInitialSettings();
    }

    loadSettings() {
        const saved = localStorage.getItem(SETTINGS_KEY);
        if (!saved) return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
        
        try {
            const parsed = JSON.parse(saved);
            // Merge with defaults to handle new keys in future updates
            return this.deepMerge(DEFAULT_SETTINGS, parsed);
        } catch (e) {
            console.error("SettingsManager: Failed to parse settings, falling back to defaults.", e);
            return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
        }
    }

    deepMerge(target, source) {
        const result = { ...target };
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(target[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        return result;
    }

    saveSettings() {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
        this.notifyChange();
    }

    get(path) {
        const parts = path.split('.');
        let current = this.settings;
        for (const part of parts) {
            if (current[part] === undefined) return undefined;
            current = current[part];
        }
        return current;
    }

    set(path, value) {
        const parts = path.split('.');
        let current = this.settings;
        for (let i = 0; i < parts.length - 1; i++) {
            if (!current[parts[i]]) current[parts[i]] = {};
            current = current[parts[i]];
        }
        current[parts[parts.length - 1]] = value;
        
        this.saveSettings();
        this.applySetting(path, value);
    }

    applyInitialSettings() {
        // Apply theme
        this.applyTheme(this.settings.interface.theme);
        
        // Apply canvas settings
        this.applyCanvasSettings();
    }

    applySetting(path, value) {
        if (path === 'interface.theme') {
            this.applyTheme(value);
        } else if (path.startsWith('canvas.')) {
            this.applyCanvasSettings();
        }
        // Add more immediate hooks here
    }

    applyTheme(theme) {
        const html = document.documentElement;
        if (theme === 'system') {
            html.removeAttribute('data-theme');
        } else {
            html.setAttribute('data-theme', theme);
        }
        // Force refresh of canvas settings to handle theme-dependent color defaults
        this.applyCanvasSettings();
    }

    applyCanvasSettings() {
        const root = document.documentElement;
        
        // Fix #33: If checker colors are the default values, remove the inline style 
        // to allow theme-aware CSS variables from styles.css to take effect.
        if (this.settings.canvas.checkerColor1 === DEFAULT_SETTINGS.canvas.checkerColor1) {
            root.style.removeProperty('--checker-color-1');
        } else {
            root.style.setProperty('--checker-color-1', this.settings.canvas.checkerColor1);
        }

        if (this.settings.canvas.checkerColor2 === DEFAULT_SETTINGS.canvas.checkerColor2) {
            root.style.removeProperty('--checker-color-2');
        } else {
            root.style.setProperty('--checker-color-2', this.settings.canvas.checkerColor2);
        }
        
        // Update checker size if needed (might require CSS var update)
        const size = this.settings.canvas.checkerSize + 'px';
        root.style.setProperty('--checker-size', size);
    }

    notifyChange() {
        const event = new CustomEvent('hcie-settings-changed', { detail: this.settings });
        window.dispatchEvent(event);
    }

    reset() {
        this.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
        this.saveSettings();
        this.applyInitialSettings();
    }
}

// Singleton instance
export const settingsManager = new SettingsManager();
window.settingsManager = settingsManager; // Export to window for easy access in legacy scripts
