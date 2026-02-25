import { client } from '$lib/sanity/client';
import localData from '../../data.json';

export const prerender = true;

export const load = async () => {
    if (client.config().projectId === 'YOUR_PROJECT_ID') {
        console.warn('⚠️ Sanity Project ID not set. Using local fallback data.');
        return {
            portfolioData: localData
        };
    }

    const query = `{
        "musicProjects": *[_type == "project" && category == "music" && !(_id in path("drafts.**")) && coalesce(status, "published") == "published" && (!defined(publishAt) || publishAt <= $now) && (!defined(unpublishAt) || unpublishAt > $now)] {..., "videoAspectRatio": coalesce(videoAspectRatio, "16:9")} | order(orderRank asc, coalesce(releaseDate, year) desc),
        "programmingProjects": *[_type == "project" && category == "programming" && !(_id in path("drafts.**")) && coalesce(status, "published") == "published" && (!defined(publishAt) || publishAt <= $now) && (!defined(unpublishAt) || unpublishAt > $now)] | order(orderRank asc, coalesce(releaseDate, year) desc)
    }`;

    try {
        const now = new Date().toISOString();
        const data = await client.fetch(query, { now });
        return {
            portfolioData: data
        };
    } catch (error) {
        console.error('Failed to fetch data from Sanity:', error);
        console.warn('Falling back to local data.');
        return {
            portfolioData: localData
        };
    }
};
