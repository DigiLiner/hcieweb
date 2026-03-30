# Task Log: Fix GitHub Deployment (#3000)

## Problem
The GitHub Actions deployment was failing, and a deprecation warning for Node.js 20 was issued by GitHub. The warning suggested forcing the runner to use Node.js 24 for actions execution and updating action versions.

## Actions Taken
1.  Modified `.github/workflows/deploy.yml`:
    *   Added `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true` environment variable to the `build` job.
    *   Updated the Node.js version in `actions/setup-node@v4` from `20` to `22` (latest stable LTS).
    *   Confirmed that `v4` of `actions/checkout` and `actions/setup-node` are the current major versions.

## Technical Observation
The project uses `file:../` links in `package.json` for internal dependencies (polyrepo structure). 
If these sibling repositories (`hcie-core`, `hcie-shared`, etc.) are not checked out during the CI/CD run, the build will fail during `npm install` or `vite build`. 

> [!WARNING]
> If the build continues to fail, we may need to update the workflow to check out all required sibling repositories into the expected directory structure (e.g., using multiple checkout steps or a custom script).

## Status
- **🟡 Waiting to Confirm**: Deployment workflow updated. Needs verification on GitHub.
