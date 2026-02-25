# pawelknorps.github.io

## Portfolio pipeline

### Environment variables

- `SANITY_PROJECT_ID` (default: `ota4ku6r`)
- `SANITY_DATASET` (default: `production`)
- `SANITY_API_TOKEN` (required for write operations or live validation)

### Commands

- `npm run pipeline:validate`
Validate local `data.json`. If `SANITY_API_TOKEN` is set, also validates live publishable data from Sanity.

- `npm run pipeline:export`
Export publishable projects from Sanity into `data.json` and `static/portfolio.json`.

- `npm run portfolio:release`
Run validation and build.

- `npm run portfolio:release -- --sync`
Validate, export from Sanity, validate again, then build.
