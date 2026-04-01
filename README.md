# HC Image Editor (HCIE) v4.0.0

![HCIE Logo](./public/resources/themes/ie_dark/hcie.png)

**[✨ Try the Live Demo here!](https://digiliner.github.io/hcieweb/)**

A modern, professional-grade image editing and layered design tool built with **Vite**, **TypeScript**, and **Tauri v2**. 

HCIE is designed to bridge the gap between web-based editors and high-performance desktop applications, offering a unified experience across platforms.

---

> [!IMPORTANT]
> **BETA RELEASE**: This software is currently in active development (Beta). While stable for general use, we recommend not using it for mission-critical production files without backups.

---

## 🟢 Features Overview

### 🎨 Layer & Design Management
*   **Advanced Layering**: Full control over layer visibility, opacity, blend modes, and reordering.
*   **Vector & Raster Mix**: Seamlessly work with both pixel-level tools and mathematical vector shapes.
*   **Multi-Document Interface**: Open and edit multiple projects simultaneously with a tabbed view.

### 🛠️ Professional Toolset
*   **Raster Tools**: High-performance Brush (with hardness/flow control), Pen, Eraser, and Spray.
*   **Advanced Floodfill**: Scanline-fill algorithm with a strict selection mask constraint.
*   **Selection Suite**: Rectangular, Elliptical, Lasso, and Magic Wand selection modes.
*   **Dynamic Filters**: Professional-standard filters including Sepia, Box Blur, Mosaic, and Negative.

### 📁 Advanced Format Support
*   **Industry Standards**: Native support for **Photoshop (.psd)** (via ag-psd).
*   **Open Source Support**: Built-in parsers for **Krita (.kra)** and **GIMP (.xcf)**.
*   **Standard Formats**: PNG, JPG, BMP, TGA, ICO, and WebP support.

### 🚀 Performance & Deployment
*   **Multi-Platform**: Native desktop installers (Windows/Linux/OSX) via Tauri and a static web version.
*   **Static/CORS Bypass**: Specialized IIFE bundling allowing the app to run over the `file://` protocol without a server.
*   **Persistence**: Automatic tool settings storage using browser LocalStorage.

---

## ⚪ Roadmap & Future Goals

*   [ ] **Paint.NET (.pdn)** format support (NRBF Binary Serialization).
*   [ ] **Layer Masks**: Advanced masking for non-destructive editing.
*   [ ] **Animation Support**: WebP/GIF frame extraction and sequencing.
*   [ ] **Performance Tweak**: Hardware-accelerated compositing for documents with 100+ layers.

---

## 🛠️ Getting Started

For full development details, see the [Development Guide](./DEV_GUIDE.md).

### Scripts
*   `npm run web:dev`: Start web-based development server.
*   `npm run web:build`: Generate static web deployment (CORS-ready).
*   `npm run tauri:build`: Build native desktop application installers.

---

## ⚖️ License
Released under the **ISC License**. Created and maintained by the HCIE Team.
