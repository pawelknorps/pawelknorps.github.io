import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getReadClient, getSanityConfig } from './lib/sanityClient.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

async function main() {
  const client = getReadClient();
  const config = getSanityConfig();
  const now = new Date().toISOString();

  const query = `{
    "personal": *[_id == "personal-info"][0],
    "musicProjects": *[_type == "project" && category == "music" && !(_id in path("drafts.**")) && coalesce(status, "published") == "published" && (!defined(publishAt) || publishAt <= $now) && (!defined(unpublishAt) || unpublishAt > $now)] {..., "id": coalesce(slug.current, _id), "videoAspectRatio": coalesce(videoAspectRatio, "16:9")} | order(orderRank asc, coalesce(releaseDate, year) desc),
    "programmingProjects": *[_type == "project" && category == "programming" && !(_id in path("drafts.**")) && coalesce(status, "published") == "published" && (!defined(publishAt) || publishAt <= $now) && (!defined(unpublishAt) || unpublishAt > $now)] {..., "id": coalesce(slug.current, _id)} | order(orderRank asc, coalesce(releaseDate, year) desc)
  }`;

  const data = await client.fetch(query, { now });

  const dataJsonPath = path.join(ROOT, 'data.json');
  const publicJsonPath = path.join(ROOT, 'static', 'portfolio.json');

  fs.writeFileSync(dataJsonPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  fs.writeFileSync(publicJsonPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');

  console.log(`✅ Exported portfolio data (${config.projectId}/${config.dataset})`);
  console.log(`   musicProjects=${data.musicProjects.length}, programmingProjects=${data.programmingProjects.length}`);
  console.log(`   updated: ${dataJsonPath}`);
  console.log(`   updated: ${publicJsonPath}`);
}

main().catch((error) => {
  console.error('❌ Export failed:', error.message);
  process.exit(1);
});
