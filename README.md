# pawelknorps.github.io

## Hosting

Production hosting is Cloudflare Pages on `https://knorps.com`.

### Cloudflare Pages project setup

- Connect this GitHub repository to Cloudflare Pages.
- Build command: `npm ci && npm run pipeline:validate && npm run build`
- Build output directory: `build`
- Node.js version: `20`
- Custom domains:
  - `knorps.com`
  - `www.knorps.com`

### GitHub Actions secrets for Cloudflare deploy

Set these repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_PAGES_PROJECT_NAME`

Workflow file: `.github/workflows/cloudflare-pages.yml`

## DNS cutover checklist (single cutover)

1. Confirm Pages deployment for `main` is green.
2. Confirm Cloudflare custom-domain validation is complete.
3. Confirm SSL is active for both `knorps.com` and `www.knorps.com`.
4. Confirm redirect is active: `www.knorps.com` -> `knorps.com`.
5. Update nameservers/DNS to Cloudflare and cut over once.
6. Validate after propagation:
   - `https://knorps.com` loads
   - canonical/OG/Twitter URLs use `https://knorps.com`
   - `https://knorps.com/robots.txt` points to `https://knorps.com/sitemap.xml`
   - `https://knorps.com/sitemap.xml` has `https://knorps.com/` URLs

## Rollback checklist

1. Re-point DNS to previous GitHub Pages configuration.
2. Run archived GitHub Pages workflow only if emergency deploy is needed.
3. Re-validate site availability and metadata.

## Portfolio pipeline

### Environment variables

- `SANITY_PROJECT_ID` (default: `ota4ku6r`)
- `SANITY_DATASET` (default: `production`)
- `SANITY_API_TOKEN` (required for write operations or live validation)
- `BUNDLE_BUDGET_JS_BYTES` (optional, default: `650000`)
- `BUNDLE_BUDGET_CSS_BYTES` (optional, default: `120000`)
- `TURNSTILE_SECRET_KEY` (optional, enable Cloudflare Turnstile validation for contact form)
- `TURNSTILE_ENFORCE` (optional, set to `true` to require a valid Turnstile token)
- `PUBLIC_TURNSTILE_SITE_KEY` (optional, enables Turnstile widget on the contact form)
- `CONTACT_ALLOWED_ORIGINS` (optional, comma-separated origins allowed to post to `/api/contact`; default: `https://knorps.com,https://www.knorps.com`)
- `CONTACT_RATE_LIMIT_WINDOW_MS` (optional, contact API rate-limit window in milliseconds; default: `600000`)
- `CONTACT_RATE_LIMIT_MAX` (optional, max contact submissions per IP within window; default: `5`)
- `VITALS_LOG_ENABLED` (optional, set to `true` to log accepted web-vitals payloads; default: `false`)

### Commands

- `npm run pipeline:validate`
Validate local `data.json`. If `SANITY_API_TOKEN` is set, also validates live publishable data from Sanity.

- `npm run pipeline:schema-drift`
Checks local portfolio documents for unknown keys and missing structural fields.

- `npm run pipeline:visual-contract`
Runs visual contract checks (critical UI markers must exist in core components).

- `npm run pipeline:sitemap`
Generates `static/sitemap.xml` from current portfolio data and project routes.

### Project detail pages

- SEO detail pages are generated at `/projects/music/:slug` and `/projects/programming/:slug`.
- Category landing pages are generated at `/projects/music` and `/projects/programming`.
- `static/sitemap.xml` includes all generated project URLs.

### Search Console playbook

- Follow the checklist in `docs/SEO_SEARCH_CONSOLE_CHECKLIST.md`.

- `npm run pipeline:export`
Export publishable projects from Sanity into `data.json` and `static/portfolio.json`.

- `npm run portfolio:release`
Run validation and build.

- `npm run portfolio:release -- --sync`
Validate, export from Sanity, validate again, then build.
