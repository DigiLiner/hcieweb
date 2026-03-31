# Task: Debug and Fix Static index.html

## Status
- **🔴 In Progress**

## Objective
- Fix console errors when opening `index.html` as a static file (`file://` protocol).

## Findings
- **404 Errors**: SVG icon paths were relative to root, but assets are in `public/`.
- **CORS Errors**: `apps/web/src/main.ts` fails as an ES module over `file://`.
- **ag-psd.js**: Path was `./ag-psd.js` but it exists in `public/`.

## Actions Taken
- [x] Address `main.ts` module loading: Added IIFE bundle fallback (`public/main.bundle.js`) and conditional loader to bypass CORS on `file://`.
- [x] Static build configuration: Created `vite-static.config.ts` for generating stable, non-ESM bundles.

## Next Steps
- User to verify static operation by opening `index.html` directly in browser.
- Task is 🟡 Waiting to Confirm.
