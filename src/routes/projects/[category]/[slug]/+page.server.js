import { error } from '@sveltejs/kit';
import { client } from '$lib/sanity/client';
import localData from '../../../../../data.json';
import { findProjectByRoute, getAllProjects, normalizePortfolioProjects } from '$lib/utils/projects.js';

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
  const data = await loadPortfolioData();
  return getAllProjects(data).map((project) => ({
    category: project.category,
    slug: project.slug
  }));
}

export const load = async ({ params }) => {
  const category = params.category === 'music' ? 'music' : params.category === 'programming' ? 'programming' : null;
  if (!category) {
    throw error(404, 'Project category not found');
  }

  const portfolioData = await loadPortfolioData();
  const project = findProjectByRoute(portfolioData, category, params.slug);
  if (!project) {
    throw error(404, 'Project not found');
  }

  const relatedProjects = getAllProjects(portfolioData)
    .filter((entry) => entry.slug !== project.slug)
    .slice(0, 4);

  return {
    project,
    relatedProjects
  };
};
