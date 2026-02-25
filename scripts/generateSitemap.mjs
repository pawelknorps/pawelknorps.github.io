import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizePortfolioProjects } from '../src/lib/utils/projects.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const dataPath = path.join(root, 'data.json');
const outputPath = path.join(root, 'static', 'sitemap.xml');
const siteUrl = 'https://knorps.com';
const today = new Date().toISOString().slice(0, 10);

function main() {
  const raw = fs.readFileSync(dataPath, 'utf8');
  const data = JSON.parse(raw);
  const { musicProjects, programmingProjects } = normalizePortfolioProjects(data);
  const projects = [...musicProjects, ...programmingProjects];

  const urls = [
    { loc: `${siteUrl}/`, priority: '1.0', changefreq: 'weekly' },
    { loc: `${siteUrl}/projects/music`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${siteUrl}/projects/programming`, priority: '0.9', changefreq: 'weekly' },
    ...projects.map((project) => ({
      loc: `${siteUrl}${project.href}`,
      priority: '0.8',
      changefreq: 'monthly'
    }))
  ];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(
      (url) => `  <url>\n    <loc>${url.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${url.changefreq}</changefreq>\n    <priority>${url.priority}</priority>\n  </url>`
    ),
    '</urlset>'
  ].join('\n');

  fs.writeFileSync(outputPath, xml);
  console.log(`Generated sitemap with ${urls.length} URLs at ${outputPath}`);
}

main();
