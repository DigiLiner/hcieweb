# Task Log - Fixing GitHub Pages Deployment

## Context
The website `https://digiliner.github.io/hcieweb/` is currently broken with 404 errors for CSS and JS assets. This is due to path mismatches between the source `index.html` (which expects assets in `public/`) and the built `dist-web` output (where Vite moves `public/` contents to the root).

## Problem
1. `index.html` hardcodes `<script src="./public/ag-psd.js"></script>`.
2. Fallback logic for `isGitHub` or `isLocalFile` injects `./public/hcie.css` and `./public/main.bundle.js`.
3. Vite build strips the `public/` directory name.

## Plan
1. Update `index.html`:
   - Remove `./public/` from all hardcoded paths (`ag-psd.js`, etc.).
   - Update fallback scripts to use root paths for production.
   - Improve `fixPath` logic to handle `file:` protocol for both dev (root) and production (`dist`) environments.
2. Rebuild the fallback bundle `main.bundle.js` using `vite-static.config.ts`.
3. Verify the local build produces a working `dist-web` folder.
4. (The user will have to push the changes to GitHub).

## Execution
- [ ] Modify `index.html` paths.
- [ ] Rebuild `main.bundle.js` and update in `public/`.
- [ ] Run `npm run web:build` and verify `dist-web`.
