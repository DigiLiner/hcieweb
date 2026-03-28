# Project Brief
High-level overview of the project and its goals.

## Core Objective
Migrate a Python-based image editor to a modern JavaScript/Tauri v2 application while preserving the "IE Style" aesthetics and specialized core algorithms.

## Black Box Architecture
- Core algorithms and low-level canvas logic reside in `packages/core/src/`.
- This core is treated as a stable, read-only library for agents.
- Orchestration and UI logic are handled at the root or in future `apps/` directories.
