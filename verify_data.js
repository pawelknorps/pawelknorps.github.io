import { createClient } from '@sanity/client'

// --- CONFIGURATION ---
const PROJECT_ID = 'ota4ku6r'
const DATASET = 'production'
const TOKEN = 'skxlbge9eyuqdbocDLlfvMYDcxz3xCLcpJJipCmvwMfBWmULFemsKrSTPPOoR00eg75nobZ4mMxNcio0U9KM7mp1cEVhtYWVizjk7hpUzfVdoH7OgSulfKBdp9ReIiBSwsx0EmpVcwuaYntzsNJMrNxuPsEIclzEY2udCWxjDCHCyOpnDEhH'
// ---------------------

const client = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: '2024-01-01',
    token: TOKEN,
    useCdn: false,
})

const verify = async () => {
    console.log('🔍 Verifying data in Sanity...')

    const query = `{
    "personal": *[_id == "personal-info"][0],
    "musicProjects": *[_type == "project" && category == "music"] | order(releaseDate desc, year desc),
    "programmingProjects": *[_type == "project" && category == "programming"] | order(year desc)
  }`;

    const data = await client.fetch(query);

    console.log(`\n📊 Frontend Query Results:`);
    console.log(`Music Projects (${data.musicProjects.length}):`);
    data.musicProjects.forEach(p => console.log(`- [${p._id}] ${p.title}`));

    console.log(`\nProgramming Projects (${data.programmingProjects.length}):`);
    data.programmingProjects.forEach(p => console.log(`- [${p._id}] ${p.title}`));
}

verify()
