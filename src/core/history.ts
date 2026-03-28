/**
 * @file history.ts
 * @description Action-based undo/redo history manager.
 * Migrated from history_manager.js.
 */

import { g, layers } from './globals';
import type { IHistoryAction } from './types';
import type { LayerClass } from './globals';

// ─── History Manager ───────────────────────────────────────

export class HistoryManager {
  private actions: IHistoryAction[] = [];
  private currentIndex = -1;
  private readonly maxSteps: number;

  constructor(maxSteps = 200) {
    this.maxSteps = maxSteps;
  }

  push(action: IHistoryAction): void {
    // Branching: discard future actions when a new one is recorded
    if (this.currentIndex < this.actions.length - 1) {
      this.actions = this.actions.slice(0, this.currentIndex + 1);
    }
    this.actions.push(action);
    this.currentIndex++;

    if (this.actions.length > this.maxSteps) {
      this.actions.shift();
      this.currentIndex--;
    }
    this.updateUI();
  }

  undo(): void {
    if (this.currentIndex < 0) return;
    const action = this.actions[this.currentIndex];
    console.log(`Undo: ${action.description}`);
    action.undo();
    this.currentIndex--;
    this.updateUI();
  }

  redo(): void {
    if (this.currentIndex >= this.actions.length - 1) return;
    this.currentIndex++;
    const action = this.actions[this.currentIndex];
    console.log(`Redo: ${action.description}`);
    action.redo();
    this.updateUI();
  }

  jumpTo(targetIndex: number): void {
    if (targetIndex === this.currentIndex) return;
    if (targetIndex < this.currentIndex) {
      while (this.currentIndex > targetIndex) this.undo();
    } else {
      while (this.currentIndex < targetIndex) this.redo();
    }
  }

  clear(): void {
    this.actions = [];
    this.currentIndex = -1;
    this.updateUI();
  }

  get canUndo(): boolean { return this.currentIndex >= 0; }
  get canRedo(): boolean { return this.currentIndex < this.actions.length - 1; }

  private updateUI(): void {
    const pane = document.getElementById('history-pane');
    if (!pane) return;
    const list = pane.querySelector('.history-list');
    if (!list) return;

    list.innerHTML = '';

    // Initial "Open" state
    const openItem = document.createElement('div');
    openItem.className = `history-item${this.currentIndex === -1 ? ' active' : ''}`;
    openItem.innerHTML = `<div class="history-item-icon">📝</div><div class="history-item-text">Open</div>`;
    openItem.onclick = () => this.jumpTo(-1);
    list.appendChild(openItem);

    this.actions.forEach((action, index) => {
      const item = document.createElement('div');
      const isPast = index > this.currentIndex;
      item.className =
        `history-item` +
        (index === this.currentIndex ? ' active' : '') +
        (isPast ? ' ghosted' : '');
      if (isPast) item.style.opacity = '0.5';

      let icon = '⚡';
      if (action.description.includes('Draw')) icon = '✏️';
      if (action.description.includes('Layer')) icon = '📄';
      if (action.description.includes('Vector')) icon = '🔷';
      if (action.description.includes('Property') || action.description.includes('Change')) icon = '⚙️';
      if (action.description.includes('Add')) icon = '➕';
      if (action.description.includes('Edit')) icon = '📝';

      item.innerHTML = `<div class="history-item-icon">${icon}</div><div class="history-item-text">${action.description}</div>`;
      item.onclick = () => this.jumpTo(index);
      list.appendChild(item);
    });

    const activeItem = list.querySelector('.history-item.active');
    if (activeItem) activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

// ─── Action Implementations ────────────────────────────────

export class DrawAction implements IHistoryAction {
  readonly description: string;
  private readonly layerIndex: number;
  private readonly previousImageData: ImageData;
  private readonly newImageData: ImageData;

  constructor(layerIndex: number, previousImageData: ImageData, newImageData: ImageData) {
    this.description = 'Draw';
    this.layerIndex = layerIndex;
    this.previousImageData = previousImageData;
    this.newImageData = newImageData;
  }

  undo(): void {
    const layer = layers[this.layerIndex];
    if (layer) {
      (layer.ctx as CanvasRenderingContext2D).putImageData(this.previousImageData, 0, 0);
      window.renderLayers?.();
      window.updateLayerPanel?.();
    }
  }

  redo(): void {
    const layer = layers[this.layerIndex];
    if (layer) {
      (layer.ctx as CanvasRenderingContext2D).putImageData(this.newImageData, 0, 0);
      window.renderLayers?.();
      window.updateLayerPanel?.();
    }
  }
}

export class LayerAddAction implements IHistoryAction {
  readonly description = 'Add Layer';
  private readonly layerIndex: number;
  private readonly layerData: LayerClass;

  constructor(layerIndex: number, layerData: LayerClass) {
    this.layerIndex = layerIndex;
    this.layerData = layerData;
  }

  undo(): void {
    layers.splice(this.layerIndex, 1);
    if (g.activeLayerIndex >= layers.length) {
      g.activeLayerIndex = Math.max(0, layers.length - 1);
    }
    window.renderLayers?.();
    window.updateLayerPanel?.();
  }

  redo(): void {
    layers.splice(this.layerIndex, 0, this.layerData);
    g.activeLayerIndex = this.layerIndex;
    window.renderLayers?.();
    window.updateLayerPanel?.();
  }
}

export class LayerDeleteAction implements IHistoryAction {
  readonly description = 'Delete Layer';
  private readonly layerIndex: number;
  private readonly layerData: LayerClass;

  constructor(layerIndex: number, layerData: LayerClass) {
    this.layerIndex = layerIndex;
    this.layerData = layerData;
  }

  undo(): void {
    layers.splice(this.layerIndex, 0, this.layerData);
    g.activeLayerIndex = this.layerIndex;
    window.renderLayers?.();
    window.updateLayerPanel?.();
  }

  redo(): void {
    layers.splice(this.layerIndex, 1);
    if (g.activeLayerIndex >= layers.length) {
      g.activeLayerIndex = Math.max(0, layers.length - 1);
    }
    window.renderLayers?.();
    window.updateLayerPanel?.();
  }
}

export class LayerMoveAction implements IHistoryAction {
  readonly description = 'Move Layer';
  private readonly fromIndex: number;
  private readonly toIndex: number;

  constructor(fromIndex: number, toIndex: number) {
    this.fromIndex = fromIndex;
    this.toIndex = toIndex;
  }

  undo(): void { window.moveLayer?.(this.toIndex, this.fromIndex, true); }
  redo(): void { window.moveLayer?.(this.fromIndex, this.toIndex, true); }
}

export class LayerPropertyAction implements IHistoryAction {
  readonly description: string;
  private readonly layerIndex: number;
  private readonly property: string;
  private readonly oldValue: unknown;
  private readonly newValue: unknown;

  constructor(layerIndex: number, property: string, oldValue: unknown, newValue: unknown) {
    this.description = `Change ${property}`;
    this.layerIndex = layerIndex;
    this.property = property;
    this.oldValue = oldValue;
    this.newValue = newValue;
  }

  undo(): void {
    const layer = layers[this.layerIndex] as Record<string, unknown>;
    if (layer) {
      layer[this.property] = this.oldValue;
      window.renderLayers?.();
      window.updateLayerPanel?.();
    }
  }

  redo(): void {
    const layer = layers[this.layerIndex] as Record<string, unknown>;
    if (layer) {
      layer[this.property] = this.newValue;
      window.renderLayers?.();
      window.updateLayerPanel?.();
    }
  }
}

export class VectorAddAction implements IHistoryAction {
  readonly description: string;
  private readonly layerIndex: number;
  private readonly shape: import('./types').Shape;

  constructor(layerIndex: number, shape: import('./types').Shape) {
    this.description = `Add ${shape.type.charAt(0).toUpperCase() + shape.type.slice(1)}`;
    this.layerIndex = layerIndex;
    this.shape = JSON.parse(JSON.stringify(shape)) as import('./types').Shape;
  }

  undo(): void {
    const layer = layers[this.layerIndex];
    if (layer?.shapes) {
      layer.shapes.pop();
      window.renderVectorLayer?.(layer);
      window.renderLayers?.();
    }
  }

  redo(): void {
    const layer = layers[this.layerIndex];
    if (layer) {
      if (!layer.shapes) layer.shapes = [];
      layer.shapes.push(JSON.parse(JSON.stringify(this.shape)) as import('./types').Shape);
      window.renderVectorLayer?.(layer);
      window.renderLayers?.();
    }
  }
}

export class VectorEditAction implements IHistoryAction {
  readonly description: string;
  private readonly layerIndex: number;
  private readonly shapeIndex: number;
  private readonly oldShape: import('./types').Shape;
  private readonly newShape: import('./types').Shape;

  constructor(
    layerIndex: number, shapeIndex: number,
    oldShape: import('./types').Shape, newShape: import('./types').Shape
  ) {
    this.description = `Edit ${newShape.type.charAt(0).toUpperCase() + newShape.type.slice(1)}`;
    this.layerIndex = layerIndex;
    this.shapeIndex = shapeIndex;
    this.oldShape = JSON.parse(JSON.stringify(oldShape)) as import('./types').Shape;
    this.newShape = JSON.parse(JSON.stringify(newShape)) as import('./types').Shape;
  }

  undo(): void {
    const layer = layers[this.layerIndex];
    if (layer?.shapes?.[this.shapeIndex]) {
      layer.shapes[this.shapeIndex] = JSON.parse(JSON.stringify(this.oldShape)) as import('./types').Shape;
      window.renderVectorLayer?.(layer);
      window.renderLayers?.();
    }
  }

  redo(): void {
    const layer = layers[this.layerIndex];
    if (layer?.shapes?.[this.shapeIndex]) {
      layer.shapes[this.shapeIndex] = JSON.parse(JSON.stringify(this.newShape)) as import('./types').Shape;
      window.renderVectorLayer?.(layer);
      window.renderLayers?.();
    }
  }
}

// ─── Singleton & Browser Globals ───────────────────────────

export const historyManager = new HistoryManager(g.max_undo_steps);

declare global {
  interface Window {
    historyManager: HistoryManager;
    DrawAction: typeof DrawAction;
    LayerAddAction: typeof LayerAddAction;
    LayerDeleteAction: typeof LayerDeleteAction;
    LayerMoveAction: typeof LayerMoveAction;
    LayerPropertyAction: typeof LayerPropertyAction;
    VectorAddAction: typeof VectorAddAction;
    VectorEditAction: typeof VectorEditAction;
    renderLayers?: (liveCanvas?: HTMLCanvasElement | OffscreenCanvas) => void;
    updateLayerPanel?: () => void;
    moveLayer?: (from: number, to: number, skipRecord?: boolean) => void;
    renderVectorLayer?: (layer: LayerClass) => void;
  }
}

window.historyManager = historyManager;
window.DrawAction = DrawAction;
window.LayerAddAction = LayerAddAction;
window.LayerDeleteAction = LayerDeleteAction;
window.LayerMoveAction = LayerMoveAction;
window.LayerPropertyAction = LayerPropertyAction;
window.VectorAddAction = VectorAddAction;
window.VectorEditAction = VectorEditAction;
