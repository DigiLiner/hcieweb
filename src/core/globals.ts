/**
 * @file globals.ts
 * @description Global application state (g), Tool definitions, and the LayerClass.
 * Migrated from global.js. All state is centralized here and exported as singletons.
 */

import type { DrawState, ToolDefinition, ILayer, BlendMode, CanvasLike, TextData, ToolConfig } from './types';

// ─── Tool Class ────────────────────────────────────────────

export class Tool implements ToolDefinition {
  public readonly name: string;
  public readonly id: string;
  public readonly toggle: boolean;

  constructor(name: string, id: string, toggle: boolean) {
    this.name = name;
    this.id = id;
    this.toggle = toggle;
  }

  toString(): string {
    return this.name;
  }

  static getAllTools(): Tool[] {
    return [
      Tool.Line, Tool.Circle, Tool.Rectangle, Tool.Pen, Tool.Brush,
      Tool.Spray, Tool.Flood_Fill, Tool.Eraser, Tool.Eye_Dropper,
      Tool.Text, Tool.Wand, Tool.Rounded_Rectangle, Tool.Ellipse,
      Tool.RectSelect, Tool.EllipseSelect, Tool.Lasso, Tool.Crop,
      Tool.Pan, Tool.MoveSelection, Tool.MoveContent,
      Tool.VectorSelect, Tool.PolySelect,
    ];
  }

  // Static instances — defined below after class declaration
  static readonly Line: Tool = new Tool('Line', 'btn-line', true);
  static readonly Circle: Tool = new Tool('Circle', 'btn-circle', true);
  static readonly Rectangle: Tool = new Tool('Rectangle', 'btn-rect', true);
  static readonly Pen: Tool = new Tool('Pen', 'btn-pen', true);
  static readonly Brush: Tool = new Tool('Brush', 'btn-brush', true);
  static readonly Spray: Tool = new Tool('Spray', 'btn-spray', true);
  static readonly Flood_Fill: Tool = new Tool('Flood Fill', 'btn-flood-fill', true);
  static readonly Eraser: Tool = new Tool('Eraser', 'btn-eraser', true);
  static readonly Eye_Dropper: Tool = new Tool('Eye Dropper', 'btn-eye-dropper', true);
  static readonly Text: Tool = new Tool('Text', 'btn-text', true);
  static readonly Wand: Tool = new Tool('Wand', 'btn-wand', true);
  static readonly Rounded_Rectangle: Tool = new Tool('Rounded Rectangle', 'btn-rounded-rect', true);
  static readonly Ellipse: Tool = new Tool('Ellipse', 'btn-ellipse', true);
  static readonly Zoom_In: Tool = new Tool('Zoom In', 'btn-zoom-in', false);
  static readonly Zoom_Out: Tool = new Tool('Zoom Out', 'btn-zoom-out', false);
  static readonly Undo: Tool = new Tool('Undo', 'btn-undo', false);
  static readonly Redo: Tool = new Tool('Redo', 'btn-redo', false);
  static readonly RectSelect: Tool = new Tool('Rect Select', 'btn-rect-select', true);
  static readonly EllipseSelect: Tool = new Tool('Ellipse Select', 'btn-ellipse-select', true);
  static readonly Lasso: Tool = new Tool('Lasso', 'btn-lasso', true);
  static readonly PolySelect: Tool = new Tool('Polygon Select', 'btn-poly-select', true);
  static readonly Crop: Tool = new Tool('Crop', 'btn-crop', true);
  static readonly Pan: Tool = new Tool('Pan', 'btn-pan', true);
  static readonly MoveSelection: Tool = new Tool('Move Selection', 'btn-move-selection', true);
  static readonly MoveContent: Tool = new Tool('Move Content', 'btn-move-content', true);
  static readonly VectorSelect: Tool = new Tool('Vector Select', 'btn-vector-select', true);
}

// ─── Layer Class ───────────────────────────────────────────

export class LayerClass implements ILayer {
  public name: string;
  public canvas: CanvasLike;
  public ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  public visible: boolean;
  public opacity: number;
  public blendMode: BlendMode;
  public locked: boolean;
  public type: ILayer['type'];
  public textData: TextData;
  public shapes?: import('../core/types').Shape[];
  public isBeingEdited?: boolean;

  constructor(name = 'Layer', width = g.image_width, height = g.image_height) {
    this.name = name;
    this.canvas = g.createCanvas(width, height);
    // createCanvas returns CanvasLike; getContext('2d') is guaranteed to work
    const ctx = (this.canvas as HTMLCanvasElement).getContext('2d') ??
      (this.canvas as OffscreenCanvas).getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context for layer canvas');
    this.ctx = ctx;
    this.visible = true;
    this.opacity = 1.0;
    this.blendMode = 'source-over';
    this.locked = false;
    this.type = 'raster';
    this.textData = {
      text: '', x: 0, y: 0,
      font: 'Roboto', size: 40, color: '#000000',
      bold: false, italic: false,
    };
  }
}

// ─── Global State Object ───────────────────────────────────

class GlobalState implements DrawState {
  // Drawing flags
  drawing = false;
  erasing = false;
  zooming = false;
  movingSelection = false;
  isTransforming = false;
  isSelectionActive = false;

  // Active tool
  current_tool: ToolDefinition = Tool.Pen;

  // Pen properties
  pen_color = '#000000';
  pen_secondary_color = '#ffffff';
  pen_width = 2;
  pen_opacity = 1;
  pen_blur = 1;
  pen_type = 'solid';
  pen_cap: CanvasLineCap = 'round';
  pen_join: CanvasLineJoin = 'round';
  pen_tip: 'round' | 'square' | 'ellipse' | 'soft' | 'diamond' | 'vertical' | 'horizontal' | 'star' = 'round';
  pen_angle = 0;
  pen_hue = 0;
  cyclic_color = false;
  cyclic_color_speed = 5;

  // Brush properties
  brush_color = 'blue';
  brush_blur = 2;
  brush_hardness = 0.8;
  brush_flow = 1.0;
  brush_density = 100;
  brush_shape = 'circle';
  brush_style = 'default';
  brush_spacing = 10; // Default 10% spacing

  // Spray properties
  spray_radius = 100;
  spray_density = 100;

  // Canvas coordinates
  startX = 0;
  startY = 0;
  pX = 0;
  pY = 0;
  lastStampX = 0;
  lastStampY = 0;

  // Zoom
  zoom = 1;
  zoomFactor = 1.1;

  // Canvas dimensions
  image_width = 500;
  image_height = 500;
  image_bg_color = 'white';

  // Misc
  tool_icon_size = '24px';
  counter = 0;
  undo_index = -1;
  filepath = '';
  activeLayerIndex = 0;

  // Selection state
  selectionMask: ImageData | null = null;
  selectionBorder: import('./types').Point[][] = [];
  selectionPreviewBorder: import('./types').Point[][] = [];
  selectionCanvas: CanvasLike | null = null;
  inverseSelectionCanvas: CanvasLike | null = null;
  floatingContent: import('./types').FloatingContent | null = null;

  // Filter parameters
  shear_amount = 40;
  shear_horizontal = true;
  shear_direction = 1;
  melt_amount = 30;
  blur_radius = 3;
  gaussian_blur_radius = 2;
  mosaic_block_size = 10;

  // Fill tool
  fill_tolerance = 32;
  fill_all_layers = false;

  // Shape properties
  round_rect_corner_radius = 10;
  shape_fill = false;

  // Wand tool
  wand_tolerance = 32;
  wand_all_layers = false;

  // History limit
  max_undo_steps = 200;

  // Text tool
  text_size = 40;
  text_font = 'Roboto';

  // Undo state capture
  previousLayerState: ImageData | null = null;
  selectionDashOffset = 0;
  selectionDashOffsetMax = 8;

  // Documents (tabs)
  documents: import('./types').DocumentState[] = [];
  activeDocumentIndex = -1;

  // Tool config metadata  
  toolConfig: Record<string, ToolConfig> = {
    'btn-pen': { 
      props: [
        { label: 'Thickness', prop: 'pen_width', min: 1, max: 100, unit: 'px', mapping: 'int' },
        { label: 'Opacity', prop: 'pen_opacity', min: 0, max: 100, unit: '%', mapping: 'percent' },
        { label: 'Cyclic Color', prop: 'cyclic_color', type: 'checkbox' },
        { label: 'Cycle Speed', prop: 'cyclic_color_speed', min: 1, max: 20, unit: '', mapping: 'int' },
      ] 
    },
    'btn-brush': {
      props: [
        { label: 'Hardness', prop: 'brush_hardness', min: 0, max: 100, unit: '%', mapping: 'percent' },
        { label: 'Flow', prop: 'brush_flow', min: 0, max: 100, unit: '%', mapping: 'percent' },
        { label: 'Opacity', prop: 'pen_opacity', min: 0, max: 100, unit: '%', mapping: 'percent' },
        { label: 'Cyclic Color', prop: 'cyclic_color', type: 'checkbox' },
        { label: 'Cycle Speed', prop: 'cyclic_color_speed', min: 1, max: 20, unit: '', mapping: 'int' },
      ],
    },
    'btn-eraser': {
      props: [
        { label: 'Hardness', prop: 'brush_hardness', min: 0, max: 100, unit: '%', mapping: 'percent' },
        { label: 'Opacity', prop: 'pen_opacity', min: 0, max: 100, unit: '%', mapping: 'percent' },
      ],
    },
    'btn-spray': {
      props: [
        { label: 'Radius', prop: 'spray_radius', min: 1, max: 600, unit: 'px', mapping: 'int' },
        { label: 'Density', prop: 'spray_density', min: 1, max: 300, unit: '%', mapping: 'int' },
        { label: 'Cyclic Color', prop: 'cyclic_color', type: 'checkbox' },
        { label: 'Cycle Speed', prop: 'cyclic_color_speed', min: 1, max: 20, unit: '', mapping: 'int' },
      ],
    },
    'btn-line': {
      props: [
        { label: 'Thickness', prop: 'pen_width', min: 1, max: 100, unit: 'px', mapping: 'int' },
        { label: 'Hardness', prop: 'brush_hardness', min: 0, max: 100, unit: '%', mapping: 'percent' },
        { label: 'Opacity', prop: 'pen_opacity', min: 0, max: 100, unit: '%', mapping: 'percent' },
      ],
    },
    'btn-rect': {
      props: [
        { label: 'Thickness', prop: 'pen_width', min: 1, max: 100, unit: 'px', mapping: 'int' },
        { label: 'Hardness', prop: 'brush_hardness', min: 0, max: 100, unit: '%', mapping: 'percent' },
        { label: 'Opacity', prop: 'pen_opacity', min: 0, max: 100, unit: '%', mapping: 'percent' },
        { label: 'Fill Shape', prop: 'shape_fill', type: 'checkbox' },
      ],
    },
    'btn-circle': {
      props: [
        { label: 'Thickness', prop: 'pen_width', min: 1, max: 100, unit: 'px', mapping: 'int' },
        { label: 'Hardness', prop: 'brush_hardness', min: 0, max: 100, unit: '%', mapping: 'percent' },
        { label: 'Opacity', prop: 'pen_opacity', min: 0, max: 100, unit: '%', mapping: 'percent' },
        { label: 'Fill Shape', prop: 'shape_fill', type: 'checkbox' },
      ],
    },
    'btn-rounded-rect': {
      props: [
        { label: 'Thickness', prop: 'pen_width', min: 1, max: 100, unit: 'px', mapping: 'int' },
        { label: 'Hardness', prop: 'brush_hardness', min: 0, max: 100, unit: '%', mapping: 'percent' },
        { label: 'Opacity', prop: 'pen_opacity', min: 0, max: 100, unit: '%', mapping: 'percent' },
        { label: 'Corner Radius', prop: 'round_rect_corner_radius', min: 0, max: 200, unit: 'px', mapping: 'int' },
        { label: 'Fill Shape', prop: 'shape_fill', type: 'checkbox' },
      ],
    },
    'btn-ellipse': {
      props: [
        { label: 'Thickness', prop: 'pen_width', min: 1, max: 100, unit: 'px', mapping: 'int' },
        { label: 'Hardness', prop: 'brush_hardness', min: 0, max: 100, unit: '%', mapping: 'percent' },
        { label: 'Opacity', prop: 'pen_opacity', min: 0, max: 100, unit: '%', mapping: 'percent' },
        { label: 'Fill Shape', prop: 'shape_fill', type: 'checkbox' },
      ],
    },
    'btn-text': {
      props: [
        { label: 'Size', prop: 'text_size', min: 10, max: 200, unit: 'px', mapping: 'int' },
        { label: 'Opacity', prop: 'pen_opacity', min: 0, max: 100, unit: '%', mapping: 'percent' },
        { label: 'Font', prop: 'text_font', type: 'select', items: ['Roboto', 'Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana'] },
      ],
    },
    'btn-vector-select': {
      props: [
        { label: 'Thickness', prop: 'pen_width', min: 1, max: 100, unit: 'px', mapping: 'int' },
        { label: 'Hardness', prop: 'brush_hardness', min: 0, max: 100, unit: '%', mapping: 'percent' },
        { label: 'Opacity', prop: 'pen_opacity', min: 0, max: 100, unit: '%', mapping: 'percent' },
        { label: 'Corner Radius', prop: 'round_rect_corner_radius', min: 0, max: 200, unit: 'px', mapping: 'int' },
        { label: 'Fill Shape', prop: 'shape_fill', type: 'checkbox' },
      ],
    },
    'btn-wand': {
      props: [
        { label: 'Tolerance', prop: 'wand_tolerance', min: 0, max: 255, unit: '', mapping: 'int' },
        { label: 'All Layers', prop: 'wand_all_layers', type: 'checkbox' },
      ],
    },
    'btn-flood-fill': {
      props: [
        { label: 'Tolerance', prop: 'fill_tolerance', min: 0, max: 255, unit: '', mapping: 'int' },
        { label: 'All Layers', prop: 'fill_all_layers', type: 'checkbox' },
      ],
    },
  };

  // ─── Methods ────────────────────────────────────────────

  createCanvas(width: number, height: number): CanvasLike {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  initDefaultLayer(): void {
    try {
      layers.push(new LayerClass('Background'));
      console.log('Background layer created successfully');
    } catch (err) {
      console.error('CRITICAL ERROR initializing layers:', err);
    }
  }
}

// ─── Singletons ────────────────────────────────────────────

/** The global application state. Import `g` from this module wherever state is needed. */
export const g = new GlobalState();

/** The active layers array. Mutated directly; references are shared. */
export const layers: LayerClass[] = [];

/** Global event bus for cross-module communication. */
export const appEvents = new EventTarget();

// ─── Browser Globals (for vendor scripts & inline HTML scripts) ────

declare global {
  interface Window {
    g: GlobalState;
    layers: LayerClass[];
    appEvents: EventTarget;
    Tool: typeof Tool;
    layer_class: typeof LayerClass;
  }
}

window.g = g;
window.layers = layers;
window.appEvents = appEvents;
window.Tool = Tool;
window.layer_class = LayerClass;

// Initialize default layer
g.initDefaultLayer();

console.log('Global state initialized');

// ─── Utility Functions ─────────────────────────────────────

/** Convert an RGB/CSS color string to its integer representation. */
export function rgbToInt(rgbString: string): number {
  const match = rgbString.match(/\d+/g);
  if (!match || match.length < 3) {
    throw new Error('Invalid RGB format');
  }
  const [r, gv, b] = match.map(Number);
  return (r << 16) | (gv << 8) | b;
}
