import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const manifestPath = path.join(ROOT, '.svelte-kit/output/client/.vite/manifest.json');

const MAX_JS_BYTES = Number(process.env.BUNDLE_BUDGET_JS_BYTES || 650_000);
const MAX_CSS_BYTES = Number(process.env.BUNDLE_BUDGET_CSS_BYTES || 120_000);

if (!fs.existsSync(manifestPath)) {
  console.error('❌ Bundle manifest missing. Run build first.');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const files = new Set();

Object.values(manifest).forEach((entry) => {
  if (entry.file) files.add(entry.file);
  (entry.css || []).forEach((css) => files.add(css));
});

let largestJs = { file: '', bytes: 0 };
let largestCss = { file: '', bytes: 0 };

for (const rel of files) {
  const abs = path.join(ROOT, '.svelte-kit/output/client', rel);
  if (!fs.existsSync(abs)) continue;
  const bytes = fs.statSync(abs).size;

  if (rel.endsWith('.js') && bytes > largestJs.bytes) largestJs = { file: rel, bytes };
  if (rel.endsWith('.css') && bytes > largestCss.bytes) largestCss = { file: rel, bytes };
}

const errors = [];
if (largestJs.bytes > MAX_JS_BYTES) {
  errors.push(`largest JS chunk ${largestJs.file} is ${largestJs.bytes} bytes (budget ${MAX_JS_BYTES})`);
}
if (largestCss.bytes > MAX_CSS_BYTES) {
  errors.push(`largest CSS chunk ${largestCss.file} is ${largestCss.bytes} bytes (budget ${MAX_CSS_BYTES})`);
}

if (errors.length) {
  console.error('❌ Bundle budget check failed');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log('✅ Bundle budget check passed');
console.log(`   largest JS: ${largestJs.file} (${largestJs.bytes} bytes)`);
console.log(`   largest CSS: ${largestCss.file} (${largestCss.bytes} bytes)`);
