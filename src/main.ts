// This is the main entry point for the Application
import './styles/styles.css';
import './styles/menu.css';
import './styles/tabs.css';
import './styles/options-bar.css';
import './styles/panels.css';
import './styles/dialog_handler.css';

import './core/globals';
import './core/history';
import * as layersModule from './canvas/layers';
import * as drawingCanvasModule from './canvas/drawing_canvas';
import * as vectorToolsModule from './tools/vector_tools';
import * as selectionToolsModule from './tools/selection';
import * as clipboardToolsModule from './tools/clipboard';
import * as documentModule from './core/document';
import * as menuModule from './ui/menu';
import * as panelsModule from './ui/panels';
import * as optionsBarModule from './ui/options-bar';
import * as propertiesPanelModule from './ui/properties-panel';
import * as tabsModule from './ui/tabs';
import * as dialogHandlerModule from './ui/dialog-handler';
import * as colorBoxModule from './ui/colorbox';
import * as paintingToolsModule from './tools/painting_tools';
import * as sprayModule from './tools/spray';
import * as floodFillModule from './tools/flood_fill';
import * as filtersModule from './canvas/filters';
import * as textToolModule from './tools/text_tool';
import * as filterUIModule from './ui/filter-ui';
import * as apiModule from './io/api';
import * as projectIOModule from './io/project-io';
import * as psdHandlerModule from './io/psd-handler';
import * as menuHandlersModule from './ui/menu-handlers';
import { setupWindowControls } from './window_controls';
import { setupThemeToggle } from './ui/theme';
import { initializeArtisticBrushes } from './ui/artistic-brushes';

// Temporarily re-expose exported variables to window to keep legacy modules functioning
console.log("[INIT] Exposing layersModule to window...");
Object.assign(window, layersModule);
console.log("[INIT] Exposing drawingCanvasModule to window...");
Object.assign(window, drawingCanvasModule);
console.log("[INIT] Exposing vectorToolsModule to window...");
Object.assign(window, vectorToolsModule);
console.log("[INIT] Exposing selectionToolsModule to window...");
Object.assign(window, selectionToolsModule);
console.log("[INIT] Exposing clipboardToolsModule to window...");
Object.assign(window, clipboardToolsModule);
console.log("[INIT] Exposing documentModule to window...");
Object.assign(window, documentModule);
console.log("[INIT] Exposing menuModule to window...");
Object.assign(window, menuModule);
console.log("[INIT] Exposing panelsModule to window...");
Object.assign(window, panelsModule);
console.log("[INIT] Exposing optionsBarModule to window...");
Object.assign(window, optionsBarModule);
console.log("[INIT] Exposing propertiesPanelModule to window...");
Object.assign(window, propertiesPanelModule);
console.log("[INIT] Exposing tabsModule to window...");
Object.assign(window, tabsModule);
console.log("[INIT] Exposing dialogHandlerModule to window...");
Object.assign(window, dialogHandlerModule);
console.log("[INIT] Exposing colorBoxModule to window...");
Object.assign(window, colorBoxModule);
console.log("[INIT] Exposing paintingToolsModule to window...");
Object.assign(window, paintingToolsModule);
console.log("[INIT] Exposing sprayModule to window...");
Object.assign(window, sprayModule);
console.log("[INIT] Exposing floodFillModule to window...");
Object.assign(window, floodFillModule);
console.log("[INIT] Exposing filtersModule to window...");
Object.assign(window, filtersModule);
console.log("[INIT] Exposing textToolModule to window...");
Object.assign(window, textToolModule);
console.log("[INIT] Exposing filterUIModule to window...");
Object.assign(window, filterUIModule);
console.log("[INIT] Exposing apiModule to window...");
Object.assign(window, apiModule);
console.log("[INIT] Exposing projectIOModule to window...");
Object.assign(window, projectIOModule);
console.log("[INIT] Exposing psdHandlerModule to window...");
Object.assign(window, psdHandlerModule);
console.log("[INIT] Exposing menuHandlersModule to window...");
Object.assign(window, menuHandlersModule);

// Perform specific initializations
if (typeof (window as any).initializeColorBox === 'function') {
    console.log("[INIT] Initializing ColorBox...");
    (window as any).initializeColorBox();
} else {
    console.error("[INIT] ERROR: initializeColorBox not found on window!");
}

if (typeof (window as any).initPanels === 'function') {
    console.log("[INIT] Initializing Panels...");
    (window as any).initPanels();
}

if (typeof (window as any).initializeMenuBar === 'function') {
    console.log("[INIT] Initializing Menu Bar...");
    (window as any).initializeMenuBar();
}

console.log("HCIE All Modules (Core, Tools, UI) Initialized via TS");

// Setup Custom Titlebar Controls
setupWindowControls();

// Setup Theme Toggle
setupThemeToggle();

// Initialize Artistic Brushes panel logic
initializeArtisticBrushes();
