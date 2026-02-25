# SEO + Search Console Checklist (knorps.com)

## 1) Verify Google Search Console property
1. Open Search Console and add a **Domain** property for `knorps.com`.
2. Verify DNS ownership in Cloudflare (TXT record provided by Google).
3. Wait for verification and confirm property status is active.

Alternative (URL-prefix) if needed:
1. Add URL-prefix property for `https://knorps.com/`.
2. Use HTML tag verification in page head, or upload HTML verification file to `static/`.
3. Re-run deploy and click Verify.

## 2) Submit and validate sitemap
1. In Search Console -> Sitemaps, submit `https://knorps.com/sitemap.xml`.
2. Confirm status is `Success`.
3. Check that project pages under `/projects/music/*` and `/projects/programming/*` appear.

## 3) Request indexing for key pages
Submit URL Inspection requests for:
- `https://knorps.com/`
- `https://knorps.com/projects/music`
- `https://knorps.com/projects/programming`
- top 3 priority project pages

## 4) Performance baseline (first 30 days)
Track these Search Console metrics weekly:
- Total impressions
- Total clicks
- Average CTR
- Average position

Track query/page pairs with high impressions + low CTR and improve title/meta copy.

## 5) Technical quality gates
Before each deploy:
1. `npm run pipeline:validate`
2. `npm run pipeline:sitemap`
3. `npm run build`
4. Confirm canonical, OG/Twitter, and JSON-LD are present in page source.

## 6) Content cadence for discoverability
Publish at least 1 update every 2-4 weeks:
- new case study,
- updated project outcome,
- performance/release note.

Each project page should include:
- Problem / Brief
- Role & Scope
- Process
- Outcomes
- Links

## 7) Monthly SEO review routine
1. In Search Console, review:
- Pages not indexed
- Core Web Vitals
- Search queries driving impressions
2. Update underperforming page titles/descriptions.
3. Add internal links from home + related projects sections.
4. Re-submit affected URLs for indexing.

## 8) Verification maintenance
If verification breaks after infra/domain changes:
1. Re-check DNS TXT record in Cloudflare.
2. Confirm `robots.txt` and `sitemap.xml` are publicly reachable.
3. Re-run URL Inspection for homepage.
