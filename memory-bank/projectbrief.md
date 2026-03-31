
HCIE Project Configuration and Dependency Map

The distribution of projects should follow this hierarchy to minimize AI agent errors:

1. hcie-shared (Layer 1: Foundation)

Responsibility: The project's "common language". Does not import any packages.

Contents: interface, enum, type definitions, constants, mathematical helper functions (vector/matrix utils).

AI Strategy: When AI wants to add a type, it should only access this package. Do not allow type definitions in other packages.

2. hcie-core (Layer 2: Brain)

Responsibility: Manage the application's state and business logic.

Contents: State management (Zustand/Redux), undo-redo mechanism, layer hierarchy management.

Dependency: hcie-shared

AI Strategy: Whenever the state structure changes, show the AI only this package.

3. hcie-tools & hcie-io (Layer 3: Services)

Responsibility: Isolated functions.

hcie-tools: Drawing tools' (pen, brush) algorithms.

hcie-io: encode/decode operations for formats like PNG, JPG, PSD.

Dependency: hcie-shared, hcie-core (only to read the store).

AI Strategy: When adding a new tool, AI should only work within hcie-tools.

4. hcie-ui-components (Layer 4A: UI Elements)

Responsibility: Pure visual components.

Contents: Button, Slider, ColorPicker, Sidebar, Modal.

Dependency: hcie-shared. (If possible, avoid hcie-core dependency; pass data via props).

AI Strategy: AI should only work here for design improvements.

5. hcie-canvas-ui (Layer 4B: Orchestra)

Responsibility: The main unit that all components and displays on the screen.

Contents: WebGL context, event listeners (mouse/touch), render loop.

Dependency: All other packages (hcie-core, hcie-tools, hcie-ui-components, hchie-shared).

AI Strategy: This is the most critical place. AI should only be allowed to touch this at "connection" points (e.g., linking a new tool to a button).

Dependency Flow Diagram

[hcie-canvas-ui] ────────┐
      │                  │
      ▼                  ▼
[hcie-tools]       [hcie-ui-components]
[hcie-io]                │
      │                  ▼
      │                  │
      ▼                  ▼
[hcie-core] <────────────┘
      │
      ▼
[hcie-shared]


Important Rules

No Circular Dependencies: hcie-core cannot import hcie-tools. Tools operate based on signals from the store inside hcie-core.

Physical Isolation: When giving commands to the AI agent, prevent it from seeing the contents of other packages by saying "Base only on the hcie-tools package."

Barrel Exports: Have an `index.ts` at the start of each package and export only the functions/types intended for external use.