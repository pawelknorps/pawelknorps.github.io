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

const patch = async () => {
    console.log('🔧 Starting data patch...')

    const transaction = client.transaction()

    // 1. Patch Aktas Erdogan Trio
    // We need to find the document ID first, or use a query to patch
    const aktas = await client.fetch(`*[_type == "project" && title == "Aktas Erdogan Trio"][0]`)
    if (aktas) {
        console.log(`Found Aktas project (${aktas._id}). Updating Facebook link...`)
        transaction.patch(aktas._id, p => p.set({
            'links.facebook': 'https://www.facebook.com/aktasfatiherdogan/videos/2203511713478108/'
        }))
    } else {
        console.warn('⚠️ Aktas project not found!')
    }

    // 2. Patch Ganavana
    const ganavana = await client.fetch(`*[_type == "project" && title == "GānāVānā & Paweł Knorps"][0]`)
    if (ganavana) {
        console.log(`Found Ganavana project (${ganavana._id}). Updating Facebook link...`)
        transaction.patch(ganavana._id, p => p.set({
            'links.facebook': 'https://www.facebook.com/reel/25617457337854047/'
        }))
    } else {
        console.warn('⚠️ Ganavana project not found!')
    }

    await transaction.commit()
        .then(() => console.log('✅ Patch successful!'))
        .catch(err => console.error('❌ Patch failed:', err.message))
}

patch()
