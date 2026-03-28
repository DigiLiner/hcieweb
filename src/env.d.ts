import type { LayerClass } from './core/globals';
import type { ImageDocument } from './core/document';
import type { VectorToolManager } from './tools/vector_tools';

declare global {
  interface Window {
    // Core Domain
    g: any;
    layers: any[];
    LayerClass: typeof LayerClass;
    
    // Document System
    ImageDocument: typeof ImageDocument;
    initDocuments: () => void;
    newDocument: (name?: string, width?: number, height?: number) => void;
    closeDocument: (index: number) => void;
    switchDocument: (index: number) => void;
    renderImageTabs: () => void;
    
    // Tools
    vectorToolManager?: VectorToolManager;
    vectorSelection?: { hasSelection: boolean, shapeType: string | null, style: any | null };
    floatingContent: any;
    
    // Tool Functions
    copySelection: () => void;
    cutSelection: () => void;
    pasteSelection: () => void;
    duplicateSelection: () => void;
    cancelSelection?: () => void;
    finishDrawing?: () => void;
    
    // Selection state
    polyPoints?: Array<{x: number, y: number}>;
    lassoPoints?: Array<{x: number, y: number}>;
    buildPolygonalSelection?: (points: Array<{x: number, y: number}>, mode: any) => void;
    
    // UI Helpers
    switchTab: (tabName: string) => void;
    updateOptionsBar: (tool: any) => void;
    initializePropertiesPanel: () => void;
    DialogHandler: any;
    Panel: any;
    
    // Legacy / Misc / Tauri
    resizeCanvas: (width: number, height: number) => void;
    applyZoom: (zoom: number) => void;
    renderLayers?: (liveCanvas?: HTMLCanvasElement | OffscreenCanvas) => void;
    updateLayerPanel: () => void;
    historyManager: any;
    
    // Event handling
    appEvents: EventTarget;
    
    // Global IDs for UI elements
    drawingCanvas: HTMLCanvasElement;
    tempCanvas: HTMLCanvasElement;
    originalCanvas: HTMLCanvasElement;
  }
}

export {};
