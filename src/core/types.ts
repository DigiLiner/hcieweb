/**
 * @file types.ts
 * @description Central type definitions for HCIE Image Editor.
 * All shared interfaces, enums, and type aliases live here.
 */

// ─── Canvas & Rendering ────────────────────────────────────

export type BlendMode =
  | 'source-over' | 'multiply' | 'screen' | 'overlay'
  | 'darken' | 'lighten' | 'color-dodge' | 'color-burn'
  | 'hard-light' | 'soft-light' | 'difference' | 'exclusion'
  | 'hue' | 'saturation' | 'color' | 'luminosity';

export type CanvasLike = HTMLCanvasElement | OffscreenCanvas;
export type CanvasContextLike = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

export interface RgbaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface Point {
  x: number;
  y: number;
}

// ─── Tools ────────────────────────────────────────────────

export interface ToolDefinition {
  name: string;
  id: string;
  toggle: boolean;
}

// ─── Layers ───────────────────────────────────────────────

export type LayerType = 'raster' | 'vector' | 'text';

export interface TextData {
  text: string;
  x: number;
  y: number;
  font: string;
  size: number;
  color: string;
  bold: boolean;
  italic: boolean;
}

export interface ILayer {
  name: string;
  canvas: CanvasLike;
  ctx: CanvasContextLike;
  visible: boolean;
  opacity: number;
  blendMode: BlendMode;
  locked: boolean;
  type: LayerType;
  textData: TextData;
  shapes?: Shape[];
  isBeingEdited?: boolean;
}

// ─── Shapes (Vector) ──────────────────────────────────────

export type ShapeType = 'line' | 'rect' | 'circle' | 'ellipse' | 'roundrect';

export interface ShapeStyle {
  width: number;
  color: string;
  opacity: number;
  cap: CanvasLineCap;
  hardness: number;
  fillColor?: string;
  fill?: boolean;
  cornerRadius?: number;
}

export interface Shape {
  id: string;
  type: ShapeType;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  style: ShapeStyle;
}

// ─── Selection ────────────────────────────────────────────

export type SelectionMode = 'replace' | 'add' | 'subtract' | 'intersect';

export interface FloatingContent {
  canvas: CanvasLike;
  x: number;
  y: number;
}

// ─── History ──────────────────────────────────────────────

export interface IHistoryAction {
  undo(): void;
  redo(): void;
  description: string;
}

// ─── Global State ─────────────────────────────────────────

export interface DrawState {
  drawing: boolean;
  erasing: boolean;
  zooming: boolean;
  movingSelection: boolean;
  isTransforming: boolean;
  isSelectionActive: boolean;

  current_tool: ToolDefinition;
  pen_color: string;
  pen_secondary_color: string;
  pen_width: number;
  pen_opacity: number;
  pen_blur: number;
  pen_type: string;
  pen_cap: CanvasLineCap;
  pen_join: CanvasLineJoin;

  brush_color: string;
  brush_blur: number;
  brush_hardness: number;
  brush_flow: number;
  brush_density: number;
  brush_shape: string;
  brush_style: string;
  brush_spacing: number;

  pen_tip: 'round' | 'square' | 'ellipse' | 'soft' | 'diamond' | 'vertical' | 'horizontal' | 'star';
  pen_angle: number;
  pen_hue: number;

  cyclic_color: boolean;
  cyclic_color_speed: number;

  spray_radius: number;
  spray_density: number;

  startX: number;
  startY: number;
  pX: number;
  pY: number;
  lastStampX: number;
  lastStampY: number;
  zoom: number;
  zoomFactor: number;

  image_width: number;
  image_height: number;
  image_bg_color: string;

  tool_icon_size: string;
  counter: number;
  undo_index: number;
  filepath: string;

  activeLayerIndex: number;

  selectionMask: ImageData | null;
  selectionBorder: Point[][];
  selectionPreviewBorder?: Point[][];
  selectionCanvas: CanvasLike | null;
  inverseSelectionCanvas: CanvasLike | null;
  floatingContent: FloatingContent | null;

  // Filter parameters
  shear_amount: number;
  shear_horizontal: boolean;
  shear_direction: number;
  melt_amount: number;
  blur_radius: number;
  gaussian_blur_radius: number;
  mosaic_block_size: number;

  // Tool-specific
  fill_tolerance: number;
  fill_all_layers: boolean;
  round_rect_corner_radius: number;
  shape_fill: boolean;
  wand_tolerance: number;
  wand_all_layers: boolean;
  max_undo_steps: number;
  text_size: number;
  text_font: string;

  previousLayerState: ImageData | null;
  selectionDashOffset: number;
  selectionDashOffsetMax?: number;

  // Dynamic properties (set at runtime)
  toolConfig: Record<string, ToolConfig>;
  documents?: DocumentState[];
  activeDocumentIndex?: number;

  // Helper methods
  createCanvas(width: number, height: number): CanvasLike;
  initDefaultLayer(): void;
}

// ─── Tool Config ──────────────────────────────────────────

export type PropMapping = 'percent' | 'int';
export type PropType = 'range' | 'select' | 'checkbox';

export interface ToolPropConfig {
  label: string;
  prop: string;
  min?: number;
  max?: number;
  unit?: string;
  mapping?: PropMapping;
  type?: PropType;
  items?: string[];
}

export interface ToolConfig {
  props: ToolPropConfig[];
}

// ─── Document (Tab) ───────────────────────────────────────

export interface DocumentState {
  id: string;
  name: string;
  width: number;
  height: number;
  layers: ILayer[];
  activeLayerIndex: number;
  undoStack: any[];
  undoIndex: number;
  zoom: number;
  scrollLeft: number;
  scrollTop: number;
  modified: boolean;
  selectionActive?: boolean;
  selectionMask?: any;
  selectionBorder?: Point[][];
  selectionCanvas?: CanvasLike | null;
  vectorSelection?: any;
}

// ─── File IO ──────────────────────────────────────────────

export interface FileFilter {
  name: string;
  extensions: string[];
}

export interface AppFileAPI {
  openFile(): Promise<string | null>;
  readFile(filePath: string): Promise<string | null>;
  readFileBinary(filePath: string): Promise<Uint8Array | null>;
  saveFile(
    content: string | Uint8Array,
    filePath: string | null,
    saveas: boolean,
    type: 'png' | 'jpg' | 'psd' | 'hcie'
  ): Promise<string | null>;
  onMenuOpen(cb: () => void): void;
  onMenuSave(cb: () => void): void;
  onMenuSaveAs(cb: () => void): void;
  onMenuExport(cb: () => void): void;
  onMenuErodeBorder?(cb: () => void): void;
  onMenuFadeBorder?(cb: () => void): void;
}
