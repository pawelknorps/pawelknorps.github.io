import { createClient } from '@sanity/client'

// --- CONFIGURATION ---
// Please fill in your Sanity project details here
export const PROJECT_ID = 'ota4ku6r'
export const DATASET = 'production'
// ---------------------

export const client = createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: '2024-01-01',
    useCdn: true, // Use CDN for faster response times
})
