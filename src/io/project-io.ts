/**
 * @file project-io.ts
 * @description HCIE project file (.hcie) serialization and deserialization.
 * Migrated from project_io.js.
 */

import { g, layers, LayerClass } from '../core/globals';
import type { BlendMode } from '../core/types';

interface SerializedLayer {
  name: string;
  visible: boolean;
  opacity: number;
  blendMode: BlendMode;
  locked: boolean;
  data: string; // base64 data URL
}

interface SerializedProject {
  version: number;
  width: number;
  height: number;
  backgroundColor: string;
  layers: SerializedLayer[];
}

export class ProjectIO {
  static async saveProject(): Promise<string> {
    const project: SerializedProject = {
      version: 1,
      width: g.image_width,
      height: g.image_height,
      backgroundColor: g.image_bg_color,
      layers: [],
    };

    for (const layer of layers) {
      let dataUrl: string;
      if (typeof (layer.canvas as HTMLCanvasElement).toDataURL === 'function') {
        dataUrl = (layer.canvas as HTMLCanvasElement).toDataURL('image/png');
      } else {
        // Fallback for OffscreenCanvas
        const tmp = document.createElement('canvas');
        tmp.width = layer.canvas.width;
        tmp.height = layer.canvas.height;
        const tmpCtx = tmp.getContext('2d');
        if (!tmpCtx) throw new Error('Could not get 2D context for temp canvas');
        tmpCtx.drawImage(layer.canvas as CanvasImageSource, 0, 0);
        dataUrl = tmp.toDataURL('image/png');
      }

      project.layers.push({
        name: layer.name,
        visible: layer.visible,
        opacity: layer.opacity,
        blendMode: layer.blendMode,
        locked: layer.locked,
        data: dataUrl,
      });
    }

    return JSON.stringify(project);
  }

  static async loadProject(jsonString: string): Promise<boolean> {
    try {
      const project = JSON.parse(jsonString) as SerializedProject;

      if (!project.width || !project.height || !project.layers) {
        throw new Error('Invalid project file format');
      }

      g.image_width = project.width;
      g.image_height = project.height;

      if (window.resizeCanvas) {
        window.resizeCanvas(g.image_width, g.image_height);
      }

      // Clear and rebuild layers
      layers.length = 0;

      for (const layerData of project.layers) {
        const newLayer = new LayerClass(layerData.name, g.image_width, g.image_height);
        newLayer.visible = layerData.visible;
        newLayer.opacity = layerData.opacity;
        newLayer.blendMode = layerData.blendMode ?? 'source-over';
        newLayer.locked = layerData.locked ?? false;

        await new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            (newLayer.ctx as CanvasRenderingContext2D).drawImage(img, 0, 0);
            resolve();
          };
          img.onerror = () => reject(new Error(`Failed to load layer image: ${layerData.name}`));
          img.src = layerData.data;
        });

        layers.push(newLayer);
      }

      if (layers.length === 0) g.initDefaultLayer();

      g.activeLayerIndex = Math.max(0, layers.length - 1);

      window.historyManager?.clear();
      window.renderLayers?.();
      window.updateLayerPanel?.();

      console.log('Project loaded successfully');
      return true;
    } catch (err) {
      console.error('Failed to load project:', err);
      alert(`Error loading project file: ${(err as Error).message}`);
      return false;
    }
  }
}

// Browser global
declare global {
  interface Window {
    ProjectIO: typeof ProjectIO;
    resizeCanvas?: (width: number, height: number) => void;
  }
}
window.ProjectIO = ProjectIO;
