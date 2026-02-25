import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getReadClient, getSanityConfig } from './lib/sanityClient.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const ALLOWED_STATUSES = new Set(['published', 'draft', 'archived']);
const LINK_KEYS = ['spotify', 'bandcamp', 'youtube', 'github', 'demo', 'website', 'facebook', 'soundcloud', 'instagram', 'maps'];

function isValidUrl(value) {
  if (!value || value === '#') return true;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function normalizedLinks(project) {
  const links = { ...(project.links || {}) };
  if (project.github && !links.github) links.github = project.github;
  if (project.demo && !links.demo) links.demo = project.demo;
  return links;
}

function validateProject(project, category, index, errors) {
  const label = `${category}[${index}]`;
  if (!project.id && !project.slug?.current && !project._id) errors.push(`${label}: missing id/slug`);
  if (!project.title) errors.push(`${label}: missing title`);
  if (!project.description) errors.push(`${label}: missing description`);

  const status = project.status || 'published';
  if (!ALLOWED_STATUSES.has(status)) errors.push(`${label}: invalid status "${status}"`);

  if (project.publishAt && Number.isNaN(Date.parse(project.publishAt))) {
    errors.push(`${label}: invalid publishAt`);
  }
  if (project.unpublishAt && Number.isNaN(Date.parse(project.unpublishAt))) {
    errors.push(`${label}: invalid unpublishAt`);
  }
  if (project.publishAt && project.unpublishAt && Date.parse(project.publishAt) >= Date.parse(project.unpublishAt)) {
    errors.push(`${label}: publishAt must be earlier than unpublishAt`);
  }

  const links = normalizedLinks(project);
  for (const key of LINK_KEYS) {
    if (!isValidUrl(links[key])) errors.push(`${label}: invalid URL in links.${key}`);
  }
}

function checkDuplicates(items, category, errors) {
  const seen = new Set();
  items.forEach((project, index) => {
    const key = project.id || project.slug?.current || project._id;
    if (!key) return;
    const id = `${category}:${key}`;
    if (seen.has(id)) errors.push(`${category}[${index}]: duplicate id/slug "${key}"`);
    seen.add(id);
  });
}

function validateDataShape(data) {
  const errors = [];
  if (!data || typeof data !== 'object') {
    return ['data.json is not an object'];
  }

  if (!Array.isArray(data.musicProjects)) errors.push('musicProjects must be an array');
  if (!Array.isArray(data.programmingProjects)) errors.push('programmingProjects must be an array');

  (data.musicProjects || []).forEach((project, index) => validateProject(project, 'musicProjects', index, errors));
  (data.programmingProjects || []).forEach((project, index) => validateProject(project, 'programmingProjects', index, errors));

  checkDuplicates(data.musicProjects || [], 'musicProjects', errors);
  checkDuplicates(data.programmingProjects || [], 'programmingProjects', errors);

  return errors;
}

async function validateLiveSanity() {
  const config = getSanityConfig();
  const client = getReadClient();
  const now = new Date().toISOString();

  const query = `{
    "musicProjects": *[_type == "project" && category == "music" && !(_id in path("drafts.**")) && coalesce(status, "published") == "published" && (!defined(publishAt) || publishAt <= $now) && (!defined(unpublishAt) || unpublishAt > $now)],
    "programmingProjects": *[_type == "project" && category == "programming" && !(_id in path("drafts.**")) && coalesce(status, "published") == "published" && (!defined(publishAt) || publishAt <= $now) && (!defined(unpublishAt) || unpublishAt > $now)]
  }`;

  const result = await client.fetch(query, { now });
  const errors = validateDataShape(result);
  return { errors, counts: { music: result.musicProjects.length, programming: result.programmingProjects.length }, config };
}

async function main() {
  const dataPath = path.join(ROOT, 'data.json');
  const raw = fs.readFileSync(dataPath, 'utf8');
  const data = JSON.parse(raw);

  const localErrors = validateDataShape(data);
  if (localErrors.length) {
    console.error('❌ Local validation failed:');
    localErrors.forEach((error) => console.error(`- ${error}`));
    process.exit(1);
  }

  console.log('✅ Local data.json validation passed');

  if (!process.env.SANITY_API_TOKEN) {
    console.log('ℹ️ SANITY_API_TOKEN not set, skipping live Sanity validation');
    return;
  }

  try {
    const { errors, counts, config } = await validateLiveSanity();
    if (errors.length) {
      console.error('❌ Live Sanity validation failed:');
      errors.forEach((error) => console.error(`- ${error}`));
      process.exit(1);
    }

    console.log(`✅ Live Sanity validation passed (${config.projectId}/${config.dataset})`);
    console.log(`   Published projects: music=${counts.music}, programming=${counts.programming}`);
  } catch (error) {
    console.error('❌ Live validation error:', error.message);
    process.exit(1);
  }
}

main();
