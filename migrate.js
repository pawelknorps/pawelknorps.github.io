import { createClient } from '@sanity/client'
import slugify from 'slugify'
import fs from 'fs'

// Read data.json
const data = JSON.parse(fs.readFileSync('./data.json', 'utf8'))

// --- CONFIGURATION ---
// Please fill in your Sanity project details here
const PROJECT_ID = 'ota4ku6r'
const DATASET = 'production'
const TOKEN = 'skxlbge9eyuqdbocDLlfvMYDcxz3xCLcpJJipCmvwMfBWmULFemsKrSTPPOoR00eg75nobZ4mMxNcio0U9KM7mp1cEVhtYWVizjk7hpUzfVdoH7OgSulfKBdp9ReIiBSwsx0EmpVcwuaYntzsNJMrNxuPsEIclzEY2udCWxjDCHCyOpnDEhH' // Get this from https://sanity.io/manage -> API -> Tokens -> Add New Token (Editor/Write)
// ---------------------

if (PROJECT_ID === 'YOUR_PROJECT_ID' || TOKEN === 'YOUR_WRITE_TOKEN') {
    console.error('❌ Please configure PROJECT_ID and TOKEN in migrate.js before running!')
    process.exit(1)
}

const client = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: '2024-01-01',
    token: TOKEN,
    useCdn: false,
})

const mutate = client.transaction()

console.log('🚀 Starting migration...')

// 1. Prepare Personal Data (Singleton)
console.log('👤 Processing Personal Info...')
const personalDoc = {
    _id: 'personal-info',
    _type: 'personal',
    ...data.personal
}
mutate.createOrReplace(personalDoc)

// 2. Prepare Music Projects
console.log(`🎵 Processing ${data.musicProjects.length} Music Projects...`)
data.musicProjects.forEach(project => {
    const doc = {
        _type: 'project',
        category: 'music',
        title: project.title,
        slug: { _type: 'slug', current: slugify(project.title, { lower: true, strict: true }) },
        type: project.type,
        year: project.year,
        description: project.description,
        features: project.features,
        credits: project.credits,
        funding: project.funding,
        links: project.links,
        color: project.color,
        releaseDate: project.releaseDate
    }
    mutate.create(doc)
})

// 3. Prepare Programming Projects
console.log(`💻 Processing ${data.programmingProjects.length} Programming Projects...`)
data.programmingProjects.forEach(project => {
    const doc = {
        _type: 'project',
        category: 'programming',
        title: project.title,
        slug: { _type: 'slug', current: slugify(project.title, { lower: true, strict: true }) },
        type: project.type,
        year: project.year,
        description: project.description,
        features: project.features,
        technologies: project.technologies,
        links: {
            github: project.github,
            demo: project.demo
        },
        color: project.color
    }
    mutate.create(doc)
})

// Execute transaction
console.log('💾 Committing transaction to Sanity...')
mutate.commit()
    .then(() => console.log('✅ Migration successful! Welcome to Sanity! 🎹 💻'))
    .catch((err) => {
        console.error('❌ Migration failed:', err.message)
        console.error('Details:', JSON.stringify(err, null, 2))
    })
