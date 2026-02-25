import { getWriteClient, requireWriteToken } from './scripts/lib/sanityClient.mjs';

requireWriteToken();

const client = getWriteClient();

const cleanup = async () => {
    console.log('🧹 Starting cleanup of duplicate projects...');

    const projects = await client.fetch('*[_type == "project"]{_id, title, slug, _createdAt}');
    const groups = {};
    projects.forEach((project) => {
        const key = project.slug?.current || project._id;
        if (!groups[key]) groups[key] = [];
        groups[key].push(project);
    });

    const toDelete = [];
    Object.values(groups).forEach((group) => {
        if (group.length < 2) return;
        group.sort((a, b) => new Date(a._createdAt) - new Date(b._createdAt));
        group.slice(1).forEach((duplicate) => toDelete.push(duplicate._id));
    });

    if (toDelete.length === 0) {
        console.log('✨ No duplicates found');
        return;
    }

    const transaction = client.transaction();
    toDelete.forEach((id) => transaction.delete(id));
    await transaction.commit();
    console.log(`✅ Cleanup successful. Deleted ${toDelete.length} duplicates.`);
};

cleanup().catch((error) => {
    console.error('❌ Cleanup failed:', error.message);
    process.exit(1);
});
