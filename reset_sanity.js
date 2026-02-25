import { getWriteClient, requireWriteToken } from './scripts/lib/sanityClient.mjs';

requireWriteToken();

const client = getWriteClient();

const reset = async () => {
    console.log('🧨 STARTING COMPLETE DATA WIPE...');

    const docs = await client.fetch('*[_type == "project" || _type == "personal"]');
    console.log(`Found ${docs.length} documents to delete.`);

    if (docs.length === 0) return;

    const transaction = client.transaction();
    docs.forEach((doc) => transaction.delete(doc._id));

    await transaction.commit();
    console.log('✅ Wipe successful');
};

reset().catch((error) => {
    console.error('❌ Wipe failed:', error.message);
    process.exit(1);
});
