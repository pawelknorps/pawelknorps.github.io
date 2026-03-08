const URL_PRIORITY = [
	'youtube',
	'vimeo',
	'instagram',
	'facebook',
	'soundcloud',
	'tiktok',
	'bandcamp',
	'spotify',
	'website',
	'demo',
	'github',
	'playstore'
];

const URL_KEYS = [
	'mediaUrl',
	'projectionVideo',
	'projectionUrl',
	'videoUrl',
	'videoFile',
	'url',
	'href',
	'demo',
	'github',
	'playstore',
	'youtube',
	'instagram',
	'facebook',
	'soundcloud',
	'bandcamp',
	'spotify',
	'website',
	'video',
	'stream',
	'link',
	'links'
];

const EMBED_ALLOW = 'autoplay; encrypted-media; picture-in-picture; fullscreen';

const isLikelyUrl = (value) => typeof value === 'string' && /^https?:\/\//i.test(value.trim());

const normalizeHost = (value) => value.replace(/^www\./, '').toLowerCase();

const isFacebookVideoUrl = (url) => {
	try {
		const parsed = new URL(url);
		const host = normalizeHost(parsed.hostname);
		if (!host.includes('facebook.com') && !host.includes('fb.watch')) return false;
		const pathname = parsed.pathname.toLowerCase();
		return (
			host.includes('fb.watch') ||
			pathname.includes('/videos/') ||
			pathname.startsWith('/watch') ||
			pathname.startsWith('/reel/') ||
			pathname.startsWith('/share/v/')
		);
	} catch {
		return false;
	}
};

const inferProvider = (url) => {
	try {
		const host = normalizeHost(new URL(url).hostname);
		if (host.includes('youtube.com') || host === 'youtu.be') return 'youtube';
		if (host.includes('vimeo.com')) return 'vimeo';
		if (host.includes('instagram.com')) return 'instagram';
		if (host.includes('facebook.com') || host.includes('fb.watch')) {
			return isFacebookVideoUrl(url) ? 'facebook' : 'website';
		}
		if (host.includes('soundcloud.com')) return 'soundcloud';
		if (host.includes('tiktok.com')) return 'tiktok';
		if (host.includes('bandcamp.com')) return 'bandcamp';
		if (host.includes('spotify.com')) return 'spotify';
		return 'website';
	} catch {
		return 'website';
	}
};

const collectUrls = (value, out, depth = 0) => {
	if (depth > 2 || value == null) return;
	if (typeof value === 'string') {
		if (isLikelyUrl(value)) out.push(value.trim());
		return;
	}
	if (Array.isArray(value)) {
		value.forEach((entry) => collectUrls(entry, out, depth + 1));
		return;
	}
	if (typeof value === 'object') {
		for (const [key, entry] of Object.entries(value)) {
			if (URL_KEYS.includes(key) || depth > 0) {
				collectUrls(entry, out, depth + 1);
			}
		}
	}
};

const dedupe = (items) => [...new Set(items.filter(Boolean))];

const providerRank = (provider) => {
	const i = URL_PRIORITY.indexOf(provider);
	return i === -1 ? 999 : i;
};

const resolveEmbed = (url, provider) => {
	try {
		const parsed = new URL(url);
		const host = normalizeHost(parsed.hostname);
		const pathname = parsed.pathname;

		if (provider === 'youtube') {
			let id = '';
			if (host === 'youtu.be') id = pathname.slice(1);
			if (!id && pathname.startsWith('/watch')) id = parsed.searchParams.get('v') || '';
			if (!id && pathname.startsWith('/shorts/')) id = pathname.split('/')[2] || '';
			if (!id && pathname.startsWith('/embed/')) id = pathname.split('/')[2] || '';
			if (id) {
				return {
					kind: 'iframe',
					embedSrc: `https://www.youtube.com/embed/${id}?autoplay=0&rel=0&modestbranding=1`,
					allow: EMBED_ALLOW
				};
			}
		}

		if (provider === 'vimeo') {
			const id = pathname.split('/').filter(Boolean).pop();
			if (id) {
				return {
					kind: 'iframe',
					embedSrc: `https://player.vimeo.com/video/${id}?autoplay=0`,
					allow: EMBED_ALLOW
				};
			}
		}

		if (provider === 'instagram') {
			const match = pathname.match(/\/(p|reel|tv)\/([^/]+)/);
			if (match) {
				return {
					kind: 'iframe',
					embedSrc: `https://www.instagram.com/${match[1]}/${match[2]}/embed`,
					allow: EMBED_ALLOW
				};
			}
		}

		if (provider === 'facebook' && isFacebookVideoUrl(url)) {
			return {
				kind: 'iframe',
				embedSrc: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=1280`,
				allow: EMBED_ALLOW
			};
		}

		if (provider === 'soundcloud') {
			return {
				kind: 'iframe',
				embedSrc: `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&auto_play=false&hide_related=false&show_comments=false&show_user=true&show_reposts=false&visual=true`,
				allow: 'autoplay'
			};
		}

		if (provider === 'tiktok') {
			const match = pathname.match(/\/video\/(\d+)/);
			if (match) {
				return {
					kind: 'iframe',
					embedSrc: `https://www.tiktok.com/embed/v2/${match[1]}`,
					allow: EMBED_ALLOW
				};
			}
		}

		if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url)) {
			return { kind: 'video', embedSrc: url, allow: '' };
		}
	} catch {
		return { kind: null, embedSrc: null, allow: null };
	}
	return { kind: null, embedSrc: null, allow: null };
};

export const resolveProjectMedia = (project) => {
	const urls = [];
	collectUrls(project, urls);
	const uniqueUrls = dedupe(urls);

	if (!uniqueUrls.length) {
		return { url: null, provider: null, kind: null, embedSrc: null, allow: null };
	}

	const ranked = uniqueUrls
		.map((url) => ({ url, provider: inferProvider(url) }))
		.sort((a, b) => providerRank(a.provider) - providerRank(b.provider));
	const selected = ranked[0];
	const embed = resolveEmbed(selected.url, selected.provider);
	const projectionVideo =
		(project &&
			(project.projectionVideo ||
				project.projectionUrl ||
				project.videoUrl ||
				project.videoFile ||
				(project.links && (project.links.projectionVideo || project.links.videoUrl || project.links.videoFile)))) ||
		null;

	return {
		url: selected.url,
		provider: selected.provider,
		kind: embed.kind,
		embedSrc: embed.embedSrc,
		allow: embed.allow || EMBED_ALLOW,
		projectionVideo: isLikelyUrl(projectionVideo) ? projectionVideo : null
	};
};
