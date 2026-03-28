/**
 * @file api.ts
 * @description Platform-aware file API bridge.
 * Detects Tauri, Electron, or Web environment and provides a unified interface.
 * Migrated from renderer.js.
 */

import type { AppFileAPI } from '../core/types';

// ─── Tauri type shims (populated via withGlobalTauri) ──────
declare global {
  interface Window {
    __TAURI__?: {
      dialog: {
        open(opts: { filters: { name: string; extensions: string[] }[] }): Promise<string | string[] | null>;
        save(opts: { filters: { name: string; extensions: string[] }[]; defaultPath?: string }): Promise<string | null>;
      };
      fs: {
        readTextFile(path: string): Promise<string>;
        readFile(path: string): Promise<Uint8Array>;
        writeTextFile(path: string, content: string): Promise<void>;
        writeFile(path: string, content: Uint8Array): Promise<void>;
      };
    };
    electronAPI?: AppFileAPI;
    lastSelectedFile?: File;
    lastFileName?: string;
    api: AppFileAPI;
  }
}

// ─── API Factory ───────────────────────────────────────────

function buildTauriApi(): AppFileAPI {
  const { open, save } = window.__TAURI__!.dialog;
  const { readTextFile, readFile, writeTextFile, writeFile } = window.__TAURI__!.fs;

  return {
    openFile: async (): Promise<string | null> => {
      const result = await open({
        filters: [
          { name: 'All Supported Files', extensions: ['hcie', 'png', 'jpg', 'jpeg', 'psd', 'gif'] },
          { name: 'HCIE Project', extensions: ['hcie'] },
          { name: 'Images (PNG, JPG, GIF)', extensions: ['png', 'jpg', 'jpeg', 'gif'] },
          { name: 'Photoshop', extensions: ['psd'] }
        ],
      });
      if (Array.isArray(result)) return result[0] ?? null;
      return result;
    },

    readFile: async (filePath: string): Promise<string | null> =>
      readTextFile(filePath),

    readFileBinary: async (filePath: string): Promise<Uint8Array | null> =>
      readFile(filePath),

    saveFile: async (
      content: string | Uint8Array | ArrayBuffer,
      filePath: string | null,
      saveas: boolean,
      type: 'png' | 'jpg' | 'psd' | 'hcie' | 'gif'
    ): Promise<string | null> => {
      try {
        const filterMap: Record<string, { name: string; extensions: string[] }[]> = {
          hcie: [{ name: 'HC Image Editor Project', extensions: ['hcie'] }],
          psd: [{ name: 'Photoshop Document', extensions: ['psd'] }],
          png: [{ name: 'PNG Image', extensions: ['png'] }],
          jpg: [{ name: 'JPEG Image', extensions: ['jpg'] }],
          gif: [{ name: 'GIF Image', extensions: ['gif'] }],
        };
        const filters = filterMap[type] ?? filterMap['png'];

        let targetPath = filePath;
        if (saveas || !filePath) {
          const ext = type === 'hcie' ? 'hcie' : type === 'psd' ? 'psd' : type === 'jpg' ? 'jpg' : type === 'gif' ? 'gif' : 'png';
          targetPath = await save({ filters, defaultPath: filePath ?? `untitled.${ext}` });
          if (!targetPath) return null;
        }
        if (!targetPath) return null;

        // Auto-append extension if missing
        const expectedExt = `.${type === 'hcie' ? 'hcie' : type === 'psd' ? 'psd' : type === 'jpg' ? 'jpg' : type === 'gif' ? 'gif' : 'png'}`;
        if (!targetPath.toLowerCase().endsWith(expectedExt)) {
            // Check if it already has another valid extension from the same type (like .jpeg for jpg)
            const isJpeg = type === 'jpg' && targetPath.toLowerCase().endsWith('.jpeg');
            if (!isJpeg) {
                targetPath += expectedExt;
            }
        }

        if (type === 'hcie') {
          await writeTextFile(targetPath, content as string);
        } else {
          let bytes: Uint8Array;
          if (typeof content === 'string' && content.startsWith('data:')) {
            const base64 = content.replace(/^data:image\/\w+;base64,/, '');
            const binary = atob(base64);
            bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          } else if (content instanceof Uint8Array) {
            bytes = content;
          } else if (content instanceof ArrayBuffer) {
            bytes = new Uint8Array(content);
          } else {
            // If it's a string (e.g. project JSON), convert to bytes
            const encoder = new TextEncoder();
            bytes = encoder.encode(content as string);
          }
          console.log(`[Tauri] Writing ${bytes.length} bytes to ${targetPath}`);
          await writeFile(targetPath, bytes);
        }
        return targetPath;
      } catch (err) {
        console.error('[Tauri] saveFile failed:', err);
        alert(`Tauri Save Error: ${(err as Error).message}\nPath: ${filePath}`);
        throw err;
      }
    },

    onMenuOpen: () => { /* Tauri menu events wired via main.ts */ },
    onMenuSave: () => { },
    onMenuSaveAs: () => { },
    onMenuExport: () => { },
    onMenuErodeBorder: () => { },
    onMenuFadeBorder: () => { },
  };
}

function buildWebFallbackApi(): AppFileAPI {
  return {
    openFile: (): Promise<string | null> =>
      new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.hcie,.png,.jpg,.jpeg,.psd';
        input.onchange = () => {
          const file = input.files?.[0];
          if (!file) { resolve(null); return; }
          window.lastSelectedFile = file;
          if (file.name.endsWith('.hcie') || file.name.endsWith('.psd')) {
            resolve(file.name);
          } else {
            window.lastFileName = file.name;
            resolve(URL.createObjectURL(file));
          }
        };
        input.click();
      }),

    readFile: async (_filePath: string): Promise<string | null> => {
      const file = window.lastSelectedFile;
      if (!file) { console.error('No file selected in Web Mode'); return null; }
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
      });
    },

    readFileBinary: async (_filePath: string): Promise<Uint8Array | null> => {
      const file = window.lastSelectedFile;
      if (!file) return null;
      const buf = await file.arrayBuffer();
      return new Uint8Array(buf);
    },

    saveFile: async (
      content: string | Uint8Array | ArrayBuffer,
      filePath: string | null,
      _saveas: boolean,
      type: 'png' | 'jpg' | 'psd' | 'hcie'
    ): Promise<string | null> => {
      const a = document.createElement('a');
      let url: string;

      if (content instanceof Uint8Array || content instanceof ArrayBuffer) {
        const bytes = content instanceof Uint8Array ? content : new Uint8Array(content);
        const mimeMap = { psd: 'image/vnd.adobe.photoshop', hcie: 'application/json', png: 'image/png', jpg: 'image/jpeg' };
        const blob = new Blob([bytes as unknown as BlobPart], { type: mimeMap[type] ?? 'application/octet-stream' });
        url = URL.createObjectURL(blob);
      } else if (typeof content === 'string' && !content.startsWith('data:')) {
        const blob = new Blob([content], { type: 'application/json' });
        url = URL.createObjectURL(blob);
      } else {
        url = content as string;
      }

      let name = filePath ?? 'untitled';
      if (!name.includes('.')) name += `.${type}`;
      a.href = url;
      a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      if (typeof url === 'string' && url.startsWith('blob:')) URL.revokeObjectURL(url);
      return name;
    },

    onMenuOpen: () => { },
    onMenuSave: () => { },
    onMenuSaveAs: () => { },
    onMenuExport: () => { },
  };
}

// ─── Resolve Api ───────────────────────────────────────────

function resolveApi(): AppFileAPI {
  if (window.__TAURI__) {
    console.log('Tauri API found. Initializing Tauri Mode.');
    return buildTauriApi();
  }
  if (window.electronAPI) {
    console.log('Electron API successfully linked.');
    return window.electronAPI;
  }
  console.warn('Desktop API not found. Using Web Mode Fallback.');
  return buildWebFallbackApi();
}

export const api: AppFileAPI = resolveApi();
// Expose for legacy global calls
window.api = api;
