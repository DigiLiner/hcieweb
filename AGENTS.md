 # AI Agent Rules & Architecture Policy

## 1. Language & Documentation
- **All communication must be in Turkish**
- **All documentation, file names, code comments must be written in English**
- **The 250-Line Rule:** No source file shall exceed **250 lines**.
    * *Action:* Refactor/split logic into sub-modules **before** exceeding this limit.
* **Atomic Tasks:** One change per request. Use Pure Functions; avoid side effects.

## 2. Core Library Protection (Strictly Read-Only)
- **STABLE LIBRARY:** The directory `packages/core/src/` is considered a stable, immutable library.
- **INTERFACE ONLY:** Use `packages/core/dist/index.d.ts` as your ONLY reference for the core library. Treat `@hcie/core` as an external npm package.
- **REPORT BUGS:** If you suspect a bug within the core library, report it to the user instead of attempting to fix it yourself.

## 3. Orchestration & Implementation Role
- **GET USER REQUEST** Always read USER_TASKS.md in root folder of the project for the user's request. if you not find warn user immediately.
- **YOUR ROLE:** You are a high-level **Orchestrator** and **UI Coordinator**.
- **DEVELOPMENT AREA:** All new features, UI logic, and tool coordinations must be written in the `apps/` directory or at the root level.
- **TRANSFORMATIONS:** For scaling, rotation, or layer manipulation, create new coordination scripts in `apps/`. Use the existing canvas context without altering the core engine's source code.
- **LIBRARIES:** Use only Free and Open Source (FOSS) libraries that work offline.
- **MEMORY OPTIMIZATION** You are a reasoning assistant. Think step-by-step. Use tools when needed.

## 4. Build Configuration Files (Strictly Read-Only)
- **BUILD & TS CONFIGURATION:** Files such as `vite.config.ts`, `vite-static.config.ts`, `.github/workflows/deploy.yml`, and ALL `tsconfig.json` or `tsconfig.base.json` files are considered strictly READ-ONLY. AI agents MUST NOT modify these files.
- **AUTHORIZATION:** AI agents MUST NOT modify these configuration files without explicit, prior user approval. If an issue is suspected to originate from these files, the agent must inform the user and request permission to modify them.

## 5. Memory Bank & Context Management
- **SEPERATED MEMORY BANK** Every request from user need to seperated folder under memory-bank. AI AGENT will read that folder only. Don't read evey file in memory.
- **MANDATORY LOGGING:** Every action, decision, analysis, and change MUST be logged in the corrct folder in `memory-bank/` directory.
- **VIRTUAL CONTEXT (SWAP):** Use the `memory-bank/task-logs/` directory as a "virtual context swap" area. Update these logs frequently to track granular, unfinished work.
- **PERSISTENT TRACKING:** Active or unfinished task logs MUST NOT be archived until the task is fully completed and confirmed by the USER.
- **ARCHIVE AUTHORIZATION (CRITICAL):** Agents are strictly forbidden from archiving, moving, or deleting any active or unfinished task logs, plans, or documentation sections without explicit, per-item confirmation from the USER.
- **ARCHIVE PRIVACY:** Agents MUST NOT read the `memory-bank/memory-arsiv/` directory. It is for user reference only.
- **AI-FORBIDDEN ZONE:** Agents MUST NOT read or modify any files within the `.AI-FORBIDDEN/` directory. This is a restricted area for human use only. Any interaction with this directory is strictly forbidden unless explicitly requested by the USER.
- **COMPLETION CONFIRMATION:** Before archiving any task log or marking a task as completed in `progress.md`, the agent MUST ask the user for confirmation every single time.
- **PLAN MAINTENANCE:** Keep the `memory-bank/plans/` directory updated with current architectural designs or feature implementation plans, but do not archive them prematurely.

## 6. Status Reporting (Active Issues — Mandatory)

### MESSAGE_FROM_AGENT.md — Always-Updated, Color-Coded Status Report
- **UPDATE** `MESSAGE_FROM_AGENT.md` after EVERY significant task, fix, or change. No exceptions.
- The file MUST be human-readable and use emoji color indicators for task statuses:
- **🟢 Completed** — Only tasks explicitly confirmed by the USER.
- **🟡 Waiting to Confirm** — Task finished/fixed by agent, pending user verification.
- **🔴 In Progress** — Currently being worked on.
- **⚪ Backlog** — Planned but not yet started.
- **NON-INTERACTION:** Use `MESSAGE_FROM_AGENT.md` as primary reporting channel. Respect the read-only status of `USER_TASKS.md`.

### MESSAGE_FROM_AGENT.md Template

```markdown
# Task Status Report
*Last updated: [date & time]*

## 🟢 Completed (USER confirmed)
- ...

## 🟡 Waiting to Confirm (finished, needs user verification)
- ...

## 🔴 In Progress
- ...

## ⚪ Backlog
| Task | Description | Plan File |
|------|-------------|-----------|
| ... | ... | ... |
```

### Waiting-to-Confirm Rule (#1009 — Critical)

## 7. Debug, Events & Visual Monitoring
* **Timestamped Debugging:** Insert timestamped markers (e.g., `[DEBUG 2026-04-05][TaskID: #123]`) in critical paths.
* **Visual Tracking:** Take frequent screenshots to monitor UI state and verify changes visually.
* **High-Frequency Events:** Monitor buttons, menus, mouse events `mousedown`, `mousemove`, `mouseup`, `hover`, and `wheel` events. Implement advanced logging for race conditions.
* **Error Catching:** Implement frequent log points to intercept transient UI/Event errors.
- After completing or fixing **ANY** task, immediately mark it as **🟡 Waiting to Confirm** in `MESSAGE_FROM_AGENT.md`.
- **DO NOT** take further actions on a 🟡 task until the USER explicitly confirms it.
- Only move a task to **🟢 Completed** after receiving explicit USER confirmation.
- This rule applies to every task, including bug fixes, feature implementations, and refactoring.

