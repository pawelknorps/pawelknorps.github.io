import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const PROJECT_ALLOWED_KEYS = new Set([
  'id',
  '_id',
  '_type',
  'title',
  'slug',
  'category',
  'status',
  'publishAt',
  'unpublishAt',
  'type',
  'year',
  'releaseDate',
  'description',
  'funding',
  'features',
  'credits',
  'technologies',
  'links',
  'github',
  'demo',
  'color',
  'cover',
  'orderRank',
  'videoAspectRatio'
]);

const PERSONAL_ALLOWED_KEYS = new Set(['bio', 'name', 'title', 'contact', 'subtitle']);

function checkUnknownKeys(record, allowed, label, errors) {
  Object.keys(record || {}).forEach((key) => {
    if (!allowed.has(key)) errors.push(`${label}: unknown key "${key}"`);
  });
}

function checkProject(project, category, index, errors) {
  const label = `${category}[${index}]`;
  checkUnknownKeys(project, PROJECT_ALLOWED_KEYS, label, errors);

  if (!project.title) errors.push(`${label}: missing title`);
  if (!project.description) errors.push(`${label}: missing description`);

  const links = project.links || {};
  if (typeof links !== 'object' || Array.isArray(links)) {
    errors.push(`${label}: links must be an object`);
  }
}

function main() {
  const dataPath = path.join(ROOT, 'data.json');
  const json = fs.readFileSync(dataPath, 'utf8');
  const data = JSON.parse(json);
  const errors = [];

  if (data.personal) checkUnknownKeys(data.personal, PERSONAL_ALLOWED_KEYS, 'personal', errors);

  if (!Array.isArray(data.musicProjects) || !Array.isArray(data.programmingProjects)) {
    errors.push('musicProjects and programmingProjects must both be arrays');
  }

  (data.musicProjects || []).forEach((project, index) => checkProject(project, 'musicProjects', index, errors));
  (data.programmingProjects || []).forEach((project, index) => checkProject(project, 'programmingProjects', index, errors));

  if (errors.length) {
    console.error('❌ Schema drift check failed');
    errors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }

  console.log('✅ Schema drift check passed');
}

main();
