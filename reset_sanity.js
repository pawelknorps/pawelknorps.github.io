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

const reset = async () => {
    console.log('🧨 STARTING COMPLETE DATA WIPE...')

    // Delete all projects and personal info
    const query = '*[_type == "project" || _type == "personal"]'
    const docs = await client.fetch(query)

    console.log(`Found ${docs.length} documents to delete.`)

    if (docs.length === 0) {
        console.log('Nothing to delete.')
        return
    }

    const transaction = client.transaction()
    docs.forEach(doc => {
        console.log(`Deleting: ${doc.title || doc._id}`)
        transaction.delete(doc._id)
    })

    await transaction.commit()
        .then(() => console.log('✅ Wipe successful! Sanity is now empty.'))
        .catch(err => console.error('❌ Wipe failed:', err.message))
}

reset()
