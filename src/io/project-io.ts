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
  type: import('../core/types').LayerType;
  data: string; // base64 data URL
  shapes?: import('../core/types').Shape[];
  textData?: import('../core/types').TextData;
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
      version: 2, // Upgraded version for vector/text support
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
        type: layer.type,
        data: dataUrl,
        shapes: layer.shapes,
        textData: layer.textData,
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

      console.log(`Loading Project v${project.version || 1}...`);

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
        newLayer.type = layerData.type ?? 'raster';
        newLayer.shapes = layerData.shapes;
        newLayer.textData = layerData.textData ?? {
            text: '', x: 0, y: 0,
            font: 'Roboto', size: 40, color: '#000000',
            bold: false, italic: false,
        };

        // Load the raster content
        if (layerData.data) {
            await new Promise<void>((resolve, reject) => {
              const img = new Image();
              img.onload = () => {
                (newLayer.ctx as CanvasRenderingContext2D).drawImage(img, 0, 0);
                resolve();
              };
              img.onerror = () => reject(new Error(`Failed to load layer image: ${layerData.name}`));
              img.src = layerData.data;
            });
        }

        layers.push(newLayer);
      }

      if (layers.length === 0) g.initDefaultLayer();

      g.activeLayerIndex = Math.max(0, layers.length - 1);

      window.historyManager?.clear();
      window.renderLayers?.();
      window.updateLayerPanel?.();
      
      // If we have vector layers, we might want to ensure they are synchronized with the raster engine if needed.
      // Usually, renderLayers handles the display of the canvas contents loaded from dataURL.

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
  }
}
window.ProjectIO = ProjectIO;
