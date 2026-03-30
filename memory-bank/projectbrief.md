# Project Brief
High-level overview of the project and its goals.

## Core Objective
modern TypeScript/Tauri v2  image editor application 

## Black Box Architecture
- Core algorithms and low-level canvas logic reside in `packages/core/src/`.
- This core is treated as a stable, read-only library for agents.
- Orchestration and UI logic are handled at the root or in future `apps/` directories.
