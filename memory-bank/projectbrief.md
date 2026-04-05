# AGENTS.md - AI Constitution & Architecture Policy

## 1. Language & Limits
* **Communication:** Turkish only. **Code/Docs/Comments:** English only.
* **The 250-Line Rule:** No source file shall exceed **250 lines**. 
    * *Action:* Refactor/split logic into sub-modules **before** exceeding this limit.
* **Atomic Tasks:** One change per request. Use Pure Functions; avoid side effects.

## 2. Read-Only Protection
* **Core Library (`packages/core/src/`):** Immutable. Reference only `dist/index.d.ts`.
* **Configurations:** `vite.config.ts`, `tsconfig.json`, `.github/` are **READ-ONLY**.
* **Forbidden Zones:** Never access `.AI-FORBIDDEN/` or `memory-bank/memory-arsiv/`.

## 3. Implementation & Orchestration
* **Source of Truth:** Always read `USER_TASKS.md` first.
* **Role:** Orchestrator. New UI logic and tool coordination go to `apps/` or root.
* **Decoupling:** Use `hcie-shared` for interfaces. Use FOSS, offline libraries only.

## 4. Memory Bank & Context
* **Isolation:** Read only the relevant task folder in `memory-bank/`.
* **Logging:** Log every decision in `memory-bank/task-logs/` (Virtual Context Swap).
* **Archive Rule:** No archiving/deleting without explicit user confirmation.

## 5. Status Reporting (MESSAGE_FROM_AGENT.md)
* 🟢 **Completed:** Only after explicit USER confirmation.
* 🟡 **Waiting to Confirm:** Task finished; **STOP** and wait for verification.
* 🔴 **In Progress:** Currently active.
* **Rule #1009:** Once marked 🟡, you are **strictly forbidden** from further actions.

## 6. Debug, Events & Visual Monitoring
* **Timestamped Debugging:** Insert timestamped markers (e.g., `[DEBUG 2026-04-05][TaskID: #123]`) in critical paths.
* **Visual Tracking:** Take frequent screenshots to monitor UI state and verify changes visually.
* **High-Frequency Events:** Monitor `mousedown`, `mousemove`, `mouseup`, `hover`, and `wheel` events. Implement lightweight logging for race conditions.
* **Error Catching:** Implement frequent log points to intercept transient UI/Event errors.