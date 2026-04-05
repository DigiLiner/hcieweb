# Project Brief: HCIE (Image Editor)

## Overview
HCIE is a specialized image editing suite aimed at providing desktop-class features (Melt, Shear, Mosaic) in a lightweight, cross-platform application using Tauri v2 and a decoupled modular architecture.

## Primary Goals
- **Performance:** Ultra-low latency drawing and high-performance layer management.
- **Interoperability:** Native support for professional formats (.psd, .kra, .xcf).
- **Extensibility:** A decoupled architecture allowing new tools and I/O modules to be added atomically.
- **User Experience:** A clean, productive interface with features like interactive handles, live previews, and robust undo/redo (isolated per document).

## Architecture
- **Core:** A stable, high-performance C-style engine (viewed as a black box).
- **Apps/Web:** Next.js/Vite based orchestration and UI coordinator.
- **Packages:** Atomic modules (@hcie/shared, @hcie/tools, @hcie/io, @hcie/canvas-ui).
- **Communication:** Decoupled EventBus-driven state synchronization.

## Success Criteria
- [x] Functional multi-layer support with history.
- [x] Advanced Drawing Tools with angles and snapping.
- [x] GPU-accelerated selection UI (Marching Ants).
- [ ] Comprehensive I/O ecosystem for layered formats (Exporting).
- [ ] Stable Tauri v2 distribution across platforms.