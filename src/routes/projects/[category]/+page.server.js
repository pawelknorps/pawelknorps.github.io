import { error } from '@sveltejs/kit';
import { client } from '$lib/sanity/client';
import localData from '../../../../data.json';
import { normalizePortfolioProjects } from '$lib/utils/projects.js';

export const prerender = true;

async function loadPortfolioData() {
  if (client.config().projectId === 'YOUR_PROJECT_ID') {
    const normalized = normalizePortfolioProjects(localData);
    return { ...localData, ...normalized };
  }

  const query = `{
    "musicProjects": *[_type == "project" && category == "music" && !(_id in path("drafts.**")) && coalesce(status, "published") == "published" && (!defined(publishAt) || publishAt <= $now) && (!defined(unpublishAt) || unpublishAt > $now)] {..., "videoAspectRatio": coalesce(videoAspectRatio, "16:9")} | order(orderRank asc, coalesce(releaseDate, year) desc),
    "programmingProjects": *[_type == "project" && category == "programming" && !(_id in path("drafts.**")) && coalesce(status, "published") == "published" && (!defined(publishAt) || publishAt <= $now) && (!defined(unpublishAt) || unpublishAt > $now)] | order(orderRank asc, coalesce(releaseDate, year) desc)
  }`;

  try {
    const now = new Date().toISOString();
    const data = await client.fetch(query, { now });
    const normalized = normalizePortfolioProjects(data);
    return { ...data, ...normalized };
  } catch {
    const normalized = normalizePortfolioProjects(localData);
    return { ...localData, ...normalized };
  }
}

export async function entries() {
  return [{ category: 'music' }, { category: 'programming' }];
}

export const load = async ({ params }) => {
  const category = params.category === 'music' ? 'music' : params.category === 'programming' ? 'programming' : null;
  if (!category) throw error(404, 'Category not found');

  const data = await loadPortfolioData();
  const projects = category === 'music' ? data.musicProjects : data.programmingProjects;

  return {
    category,
    projects: projects || []
  };
};
