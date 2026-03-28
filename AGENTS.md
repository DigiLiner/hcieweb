# Agent Rules

## Language
- **All documentation must be written in English.** This includes memory-bank files, code comments in documentation, commit messages, and any generated reports or walkthroughs.
- Code-level comments may remain in Turkish for consistency with the existing codebase (e.g., inline PHP/JS comments), but new structured documentation files must always be in English.

## Memory Bank
- **MANDATORY LOGGING:** Every action, decision, analysis, and change you make MUST be logged in the `memory-bank/` directory.
- Before starting any task, read the `memory-bank/` folder to understand the project context.
- After completing a task, update `memory-bank/activeContext.md` and `memory-bank/progress.md` to reflect the current state.
- Follow the structure defined in `memory-bank/projectbrief.md` for overall project understanding.
- NEVER modify or write to files in the `packages/core/src/` directory.
- You are strictly prohibited from opening files in `packages/core/src/` unless explicitly asked.
- Use `packages/core/dist/index.d.ts` as your ONLY reference for the core library.
- If you believe a change is needed in the core library, ask the user for permission and explain why.
- Treat `@hcie/core` as an external npm package.
# AI BEHAVIOR CONSTRAINTS
- NEVER modify or write to files in the `packages/core/src/` directory.
- You are strictly prohibited from opening files in `packages/core/src/` unless explicitly asked.
- Use `packages/core/dist/index.d.ts` as your ONLY reference for the core library.
- If you believe a change is needed in the core library, ask the user for permission and explain why.
- Treat `@hcie/core` as an external npm package.
# AI AGENT CONSTRAINTS & ARCHITECTURE POLICY

## 1. CORE DIRECTORY PROTECTION (READ-ONLY)
- **STRICT RULE:** The directory `packages/core/src/` is considered a STABLE LIBRARY.
- **NO MODIFICATIONS:** You are strictly forbidden from modifying, refactoring, or deleting any files inside `packages/core/src/`.
- **READ-ONLY ACCESS:** You may read these files only to understand the available APIs and functions. Do not propose "improvements" or "fixes" within this directory.

## 2. ORCHESTRATION ROLE
- **YOUR ROLE:** You are a high-level **Orchestrator** and **UI Coordinator**. 
- **DEVELOPMENT AREA:** All new features, UI logic, and tool coordinations must be written in the `apps/` directory or at the root level as specified by the user.
- **INTERFACE USAGE:** Interact with the core logic exclusively through the exported functions. Treat `packages/core/src/` as a "Black Box" (similar to a compiled C++ library).

## 3. IMPLEMENTATION GUIDELINES
- **SCALING & TRANSFORMATIONS:** When implementing rotation, scaling, or layer manipulation, create new coordination scripts in `apps/`. Use the existing canvas context provided by the core without altering the core engine's source code.
- **EXTERNAL LIBRARIES:** Use only Free and Open Source (FOSS) libraries that work offline.
- **ERROR HANDLING:** If you suspect a bug within the core library, report it to the user in the chat instead of attempting to fix the file yourself.

## 4. REFACTORING POLICY
- Do not refactor variable names or function structures in the `packages/core/` path.
- Focus on clean, modular, and well-documented code for the files you are authorized to create/edit in the `apps/` path.

## 5. MEMORY BANK LOGGING
- **STRICT LOGGING:** You MUST record all your technical decisions, changes, and progress in the `memory-bank/` directory.
- Update `memory-bank/activeContext.md` frequently to document the current focus.
- Document all completed features or fixes in `memory-bank/progress.md`.
- Ensure `memory-bank/` is the source of truth for the project's evolution.

## 6. USER COMMANDS PROTECTION
- **STRICT RULE:** You are strictly forbidden from writing to or modifying [USER_TASKS.md](file:///run/media/hc/DATA/00_PROJECTS/Electron/hcie/USER_TASKS.md).
- **PURPOSE:** This file is for the USER to write commands and track progress. You may only READ this file to understand your next tasks.
- **NO INTERACTION:** Never check/uncheck boxes or edit the text within this file.
