/**
 * Menu Bar Manager
 * Handles menu visibility based on environment (Electron vs Web)
 */

// Detect environment on page load
document.addEventListener('DOMContentLoaded', function () {
    initializeMenuBar();
});

export function initializeMenuBar() {
    const menuBar = document.getElementById('appMenuBar');

    if (!menuBar) {
        console.warn('Menu bar element not found');
        return;
    }

    // Check if running in Electron
    const isElectron = typeof window !== 'undefined' &&
        ((window as any).process?.type === 'renderer' ||
            (window as any).electronAPI !== undefined ||
            navigator.userAgent.toLowerCase().includes('electron'));

    if (isElectron) {
        // Hide web menu in Electron (native menu is used)
        menuBar.style.display = 'none';
        console.log('Running in Electron - using native menu');
    } else {
        // Show web menu when running as standalone HTML
        menuBar.style.display = 'flex';
        console.log('Running in web mode - showing application menu');
    }
}

// Optional: Add keyboard shortcut support for menu items
document.addEventListener('keydown', function (e) {
    // Only handle shortcuts if web menu is visible
    const menuBar = document.getElementById('appMenuBar');
    if (!menuBar || menuBar.style.display === 'none') {
        return;
    }

    const ctrl = e.ctrlKey || e.metaKey;
    const shift = e.shiftKey;

    const w = window as any;

    // File menu
    if (ctrl && e.key === 'n') {
        e.preventDefault();
        if (w.newDocument) w.newDocument();
        else newCanvas();
    } else if (ctrl && e.key === 'o') {
        e.preventDefault();
        const btn = document.getElementById('btn-open') as HTMLButtonElement | null;
        if (btn) btn.click();
    } else if (ctrl && !shift && e.key === 's') {
        e.preventDefault();
        const btn = document.getElementById('btn-save') as HTMLButtonElement | null;
        if (btn) btn.click();
    }
    // Edit menu
    else if (ctrl && !shift && e.key === 'x') {
        e.preventDefault();
        if (w.cutSelection) w.cutSelection();
    } else if (ctrl && !shift && e.key === 'c') {
        e.preventDefault();
        if (w.copySelection) w.copySelection();
    } else if (ctrl && !shift && e.key === 'v') {
        e.preventDefault();
        if (w.pasteSelection) w.pasteSelection();
    } else if (ctrl && !shift && e.key === 'j') {
        e.preventDefault();
        if (w.duplicateSelection) w.duplicateSelection();
    }
    else if (ctrl && e.key === 'z') {
        e.preventDefault();
        if (w.undoImage) w.undoImage();
    } else if (ctrl && e.key === 'y') {
        e.preventDefault();
        if (w.redoImage) w.redoImage();
    } else if (e.key === 'Delete') {
        e.preventDefault();
        if (w.clearCanvas) w.clearCanvas();
    }
    // View menu
    else if (ctrl && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        if (w.zoomIn) w.zoomIn();
    } else if (ctrl && e.key === '-') {
        e.preventDefault();
        if (w.zoomOut) w.zoomOut();
    }
});

// Function to create new canvas (if not already defined)
export function newCanvas() {
    const w = window as any;
    if (w.openNewImageDialog) {
        w.openNewImageDialog();
        return;
    }
    if (w.newDocument) {
        w.newDocument();
        return;
    }
    if (confirm('Create a new canvas? Unsaved changes will be lost.')) {
        if (w.clearCanvas) w.clearCanvas();
        console.log('New canvas created');
    }
}
