import { getReadClient } from './scripts/lib/sanityClient.mjs';

const client = getReadClient();

const verify = async () => {
    console.log('🔍 Verifying data in Sanity...');

    const query = `{
      "personal": *[_id == "personal-info"][0],
      "musicProjects": *[_type == "project" && category == "music" && coalesce(status, "published") == "published"] | order(releaseDate desc, year desc),
      "programmingProjects": *[_type == "project" && category == "programming" && coalesce(status, "published") == "published"] | order(year desc)
    }`;

    const data = await client.fetch(query);

    console.log('\n📊 Frontend Query Results:');
    console.log(`Music Projects (${data.musicProjects.length}):`);
    data.musicProjects.forEach((p) => console.log(`- [${p._id}] ${p.title}`));

    console.log(`\nProgramming Projects (${data.programmingProjects.length}):`);
    data.programmingProjects.forEach((p) => console.log(`- [${p._id}] ${p.title}`));
};

verify().catch((error) => {
    console.error('❌ Verification failed:', error.message);
    process.exit(1);
});
