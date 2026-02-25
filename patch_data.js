import { getReadClient, getWriteClient, requireWriteToken } from './scripts/lib/sanityClient.mjs';

requireWriteToken();

const readClient = getReadClient();
const writeClient = getWriteClient();

const patch = async () => {
    console.log('🔧 Starting data patch...');
    const transaction = writeClient.transaction();

    const aktas = await readClient.fetch(`*[_type == "project" && title == "Aktas Erdogan Trio"][0]`);
    if (aktas) {
        transaction.patch(aktas._id, (p) =>
            p.set({ 'links.facebook': 'https://www.facebook.com/aktasfatiherdogan/videos/2203511713478108/' })
        );
    }

    const ganavana = await readClient.fetch(`*[_type == "project" && title == "GānāVānā & Paweł Knorps"][0]`);
    if (ganavana) {
        transaction.patch(ganavana._id, (p) =>
            p.set({ 'links.facebook': 'https://www.facebook.com/reel/25617457337854047/' })
        );
    }

    await transaction.commit();
    console.log('✅ Patch successful');
};

patch().catch((error) => {
    console.error('❌ Patch failed:', error.message);
    process.exit(1);
});
