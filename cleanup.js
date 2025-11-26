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

const cleanup = async () => {
    console.log('🧹 Starting cleanup of duplicate projects...')

    // 1. Fetch all projects
    const projects = await client.fetch(`*[_type == "project"]{_id, title, slug, _createdAt}`)
    console.log(`Found ${projects.length} total projects.`)

    // 2. Group by slug
    const groups = {}
    projects.forEach(p => {
        const key = p.slug.current
        if (!groups[key]) groups[key] = []
        groups[key].push(p)
    })

    // 3. Identify duplicates
    const toDelete = []
    let keptCount = 0

    Object.keys(groups).forEach(key => {
        const group = groups[key]
        if (group.length > 1) {
            // Sort by creation date (keep the oldest one)
            group.sort((a, b) => new Date(a._createdAt) - new Date(b._createdAt))

            const kept = group[0]
            const duplicates = group.slice(1)

            console.log(`Found ${duplicates.length} duplicates for "${kept.title}"`)
            duplicates.forEach(d => toDelete.push(d._id))
            keptCount++
        } else {
            keptCount++
        }
    })

    if (toDelete.length === 0) {
        console.log('✨ No duplicates found!')
        return
    }

    console.log(`🗑️ Deleting ${toDelete.length} duplicate documents...`)

    // 4. Delete duplicates
    const transaction = client.transaction()
    toDelete.forEach(id => transaction.delete(id))

    await transaction.commit()
        .then(() => console.log('✅ Cleanup successful!'))
        .catch(err => console.error('❌ Cleanup failed:', err.message))
}

cleanup()
