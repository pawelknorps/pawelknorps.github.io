import { createClient } from '@sanity/client';

const PROJECT_ID = process.env.SANITY_PROJECT_ID || 'ota4ku6r';
const DATASET = process.env.SANITY_DATASET || 'production';

export function getReadClient() {
  return createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: '2024-01-01',
    useCdn: false
  });
}

export function getWriteClient() {
  const token = process.env.SANITY_API_TOKEN;
  if (!token) {
    throw new Error('SANITY_API_TOKEN is required for write operations.');
  }

  return createClient({
    projectId: PROJECT_ID,
    dataset: DATASET,
    apiVersion: '2024-01-01',
    token,
    useCdn: false
  });
}

export function getSanityConfig() {
  return {
    projectId: PROJECT_ID,
    dataset: DATASET,
    hasWriteToken: Boolean(process.env.SANITY_API_TOKEN)
  };
}

export function requireWriteToken() {
  if (!process.env.SANITY_API_TOKEN) {
    throw new Error('Missing SANITY_API_TOKEN environment variable.');
  }
}
