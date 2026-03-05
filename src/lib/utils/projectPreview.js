import { resolveProjectMedia } from './projectMedia.js';

const FALLBACK_PREVIEW = '/scene-poster.webp';

const extractYoutubeId = (url) => {
	if (typeof url !== 'string' || !url.trim()) return null;
	try {
		const parsed = new URL(url.trim());
		const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
		const path = parsed.pathname;
		if (host === 'youtu.be') return path.slice(1) || null;
		if (host.includes('youtube.com')) {
			if (path === '/watch') return parsed.searchParams.get('v');
			if (path.startsWith('/shorts/')) return path.split('/')[2] || null;
			if (path.startsWith('/embed/')) return path.split('/')[2] || null;
		}
	} catch {
		return null;
	}
	return null;
};

const toYoutubeThumbnail = (url) => {
	const id = extractYoutubeId(url);
	return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
};

export const getProjectPreview = (project) => {
	const media = resolveProjectMedia(project || {});
	const coverUrl = typeof project?.coverUrl === 'string' ? project.coverUrl.trim() : '';
	if (coverUrl) {
		return {
			previewImageUrl: coverUrl,
			previewSource: 'cover',
			videoProvider: media.provider || 'website',
			coverAlt: project?.coverAlt || project?.title || 'Project preview'
		};
	}

	const youtubeThumb = media.provider === 'youtube' ? toYoutubeThumbnail(media.url) : null;
	if (youtubeThumb) {
		return {
			previewImageUrl: youtubeThumb,
			previewSource: 'youtube',
			videoProvider: media.provider,
			coverAlt: project?.coverAlt || project?.title || 'Project preview'
		};
	}

	return {
		previewImageUrl: FALLBACK_PREVIEW,
		previewSource: 'fallback',
		videoProvider: media.provider || 'website',
		coverAlt: project?.coverAlt || project?.title || 'Project preview'
	};
};

