<script>
	import { createEventDispatcher, onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { resolveProjectMedia } from '$lib/utils/projectMedia.js';
	import ProjectSpherePreview from '$lib/components/ProjectSpherePreview.svelte';

	export let musicProjects = [];
	export let programmingProjects = [];
	export let adaptiveTextClass = 'text-white';
	export let adaptiveSubTextClass = 'text-gray-300';

	const dispatch = createEventDispatcher();
	let prefersReducedMotion = false;

	const isValidUrl = (value) => typeof value === 'string' && value.trim() && value !== '#';

	const formatSourceLabel = (value) => {
		if (!value || typeof value !== 'string') return 'website';
		return value.replace(/[_-]+/g, ' ').trim().toLowerCase();
	};

	const getDisplaySource = (project) => {
		const previewSource = project?.previewSource || '';
		const provider = project?.videoProvider || '';
		if (previewSource === 'fallback') return formatSourceLabel(provider || 'website');
		if (previewSource) return formatSourceLabel(previewSource);
		return formatSourceLabel(provider || 'website');
	};

	const getProjectTags = (project) => {
		if (Array.isArray(project?.features) && project.features.length > 0) return project.features;
		if (Array.isArray(project?.technologies) && project.technologies.length > 0) return project.technologies;
		return [];
	};

	const getExternalLinks = (project) => {
		const links = [];

		if (project?.links && typeof project.links === 'object') {
			for (const [platform, url] of Object.entries(project.links)) {
				if (!isValidUrl(url)) continue;
				links.push({ label: platform, url: url.trim() });
			}
		}

		if (isValidUrl(project?.github)) {
			links.push({ label: 'github', url: project.github.trim() });
		}
		if (isValidUrl(project?.demo)) {
			links.push({ label: 'demo', url: project.demo.trim() });
		}
		if (isValidUrl(project?.website)) {
			links.push({ label: 'website', url: project.website.trim() });
		}

		const seen = new Set();
		return links.filter((entry) => {
			if (seen.has(entry.url)) return false;
			seen.add(entry.url);
			return true;
		});
	};

	const openInApp = (event, project, type) => {
		event?.preventDefault?.();
		event?.stopPropagation?.();
		const media = resolveProjectMedia(project);
		dispatch('openProjectMedia', {
			...project,
			type,
			mediaUrl: media.url,
			videoProvider: media.provider
		});
	};

	const handleCardClick = (event, project, type) => {
		const target = event?.target;
		if (target instanceof HTMLElement) {
			if (target.closest('.project-card__media') || target.closest('.project-card__actions')) {
				return;
			}
		}
		openInApp(event, project, type);
	};

	const handleCardKeydown = (event, project, type) => {
		if (event.key !== 'Enter' && event.key !== ' ') return;
		event.preventDefault();
		openInApp(event, project, type);
	};

	onMount(() => {
		if (typeof window === 'undefined') return;
		const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		prefersReducedMotion = mediaQuery.matches;
		const syncPreference = (entry) => {
			prefersReducedMotion = entry.matches;
		};
		mediaQuery.addEventListener('change', syncPreference);
		return () => mediaQuery.removeEventListener('change', syncPreference);
	});
</script>

{#if musicProjects.length > 0}
	<div class="project-group mb-32 w-full xl:flex xl:flex-col xl:items-start xl:max-w-[56rem] 2xl:max-w-[64rem]">
		{#each musicProjects as data, i}
			{@const links = getExternalLinks(data)}
			{@const tags = getProjectTags(data)}
			{@const primaryLink = links[0]}
			{@const displaySource = getDisplaySource(data)}
			{@const media = resolveProjectMedia(data)}
			<div
				id="music-{i}"
				class="project-card group my-20 w-full md:max-w-[40rem] lg:max-w-[48rem] xl:max-w-[56rem] 2xl:max-w-[64rem] pointer-events-auto"
				role="button"
				tabindex="0"
				aria-label={`Open ${data.title} project`}
				on:click={(event) => handleCardClick(event, data, 'music')}
				on:keydown={(event) => handleCardKeydown(event, data, 'music')}
				in:fade={{ delay: 250 * i, duration: 900 }}
			>
				<div class="project-card__media">
					<ProjectSpherePreview
						textureUrl={data.previewImageUrl}
						title={data.title}
						videoProvider={data.videoProvider}
						previewSource={data.previewSource}
						sourceLabel={displaySource}
						mediaKind={media.kind}
						mediaEmbedSrc={media.embedSrc}
						mediaAllow={media.allow}
						reducedMotion={prefersReducedMotion}
						on:open={() => openInApp(null, data, 'music')}
					/>
					<span class="project-card__source">{displaySource}</span>
				</div>

				<div class="project-card__body">
					<p class="project-card__type">{data.type || 'Music Project'}</p>
					<h2
						class="adaptive-text"
						class:text-white={adaptiveTextClass === 'text-white'}
						class:text-gray-900={adaptiveTextClass === 'text-gray-900'}
					>
						{data.title}
					</h2>
					{#if data.description}
						<p
							class="adaptive-subtext"
							class:text-gray-300={adaptiveSubTextClass === 'text-gray-300'}
							class:text-gray-200={adaptiveSubTextClass === 'text-gray-200'}
							class:text-gray-700={adaptiveSubTextClass === 'text-gray-700'}
						>
							{data.description}
						</p>
					{/if}

					{#if tags.length > 0}
						<div class="project-tags">
							{#each tags as tag}
								<span>{tag}</span>
							{/each}
						</div>
					{/if}

					<div class="project-card__actions">
						<button type="button" class="project-open" on:click={(event) => openInApp(event, data, 'music')}>
							Open project
						</button>
						{#if primaryLink}
							<a href={primaryLink.url} target="_blank" rel="noopener noreferrer" on:click|stopPropagation>{primaryLink.label} ↗</a>
						{/if}
						{#each links.slice(1, 5) as link}
							<a href={link.url} target="_blank" rel="noopener noreferrer" on:click|stopPropagation>{link.label} ↗</a>
						{/each}
					</div>
				</div>
			</div>
		{/each}
	</div>
{/if}

{#if programmingProjects.length > 0}
	<div class="project-group mb-32 w-full xl:flex xl:flex-col xl:items-start xl:max-w-[56rem] 2xl:max-w-[64rem]">
		<h3
			class="text-3xl font-black tracking-widest mb-16 opacity-90 adaptive-text w-full xl:max-w-[56rem] 2xl:max-w-[64rem]"
			class:text-white={adaptiveTextClass === 'text-white'}
			class:text-gray-900={adaptiveTextClass === 'text-gray-900'}
		>
			OTHER
		</h3>

		{#each programmingProjects as data, i}
			{@const links = getExternalLinks(data)}
			{@const tags = getProjectTags(data)}
			{@const primaryLink = links[0]}
			{@const displaySource = getDisplaySource(data)}
			{@const media = resolveProjectMedia(data)}
			<div
				id="programming-{i}"
				class="project-card group my-20 w-full md:max-w-[40rem] lg:max-w-[48rem] xl:max-w-[56rem] 2xl:max-w-[64rem] pointer-events-auto"
				role="button"
				tabindex="0"
				aria-label={`Open ${data.title} project`}
				on:click={(event) => handleCardClick(event, data, 'programming')}
				on:keydown={(event) => handleCardKeydown(event, data, 'programming')}
				in:fade={{ delay: 250 * (i + musicProjects.length), duration: 900 }}
			>
				<div class="project-card__media">
					<ProjectSpherePreview
						textureUrl={data.previewImageUrl}
						title={data.title}
						videoProvider={data.videoProvider}
						previewSource={data.previewSource}
						sourceLabel={displaySource}
						mediaKind={media.kind}
						mediaEmbedSrc={media.embedSrc}
						mediaAllow={media.allow}
						reducedMotion={prefersReducedMotion}
						on:open={() => openInApp(null, data, 'programming')}
					/>
					<span class="project-card__source">{displaySource}</span>
				</div>

				<div class="project-card__body">
					<p class="project-card__type">{data.type || 'Programming Project'}</p>
					<h2
						class="adaptive-text"
						class:text-white={adaptiveTextClass === 'text-white'}
						class:text-gray-900={adaptiveTextClass === 'text-gray-900'}
					>
						{data.title}
					</h2>
					{#if data.description}
						<p
							class="adaptive-subtext"
							class:text-gray-300={adaptiveSubTextClass === 'text-gray-300'}
							class:text-gray-200={adaptiveSubTextClass === 'text-gray-200'}
							class:text-gray-700={adaptiveSubTextClass === 'text-gray-700'}
						>
							{data.description}
						</p>
					{/if}

					{#if tags.length > 0}
						<div class="project-tags">
							{#each tags as tag}
								<span>{tag}</span>
							{/each}
						</div>
					{/if}

					<div class="project-card__actions">
						<button
							type="button"
							class="project-open"
							on:click={(event) => openInApp(event, data, 'programming')}
						>
							Open project
						</button>
						{#if primaryLink}
							<a href={primaryLink.url} target="_blank" rel="noopener noreferrer" on:click|stopPropagation>{primaryLink.label} ↗</a>
						{/if}
						{#each links.slice(1, 5) as link}
							<a href={link.url} target="_blank" rel="noopener noreferrer" on:click|stopPropagation>{link.label} ↗</a>
						{/each}
					</div>
				</div>
			</div>
		{/each}
	</div>
{/if}

<style>
	.project-group {
		background: transparent;
	}

	.project-card {
		--card-surface-a: rgba(11, 17, 30, 0.62);
		--card-surface-b: rgba(8, 13, 24, 0.78);
		--card-outline: rgba(202, 221, 255, 0.24);
		--card-outline-strong: rgba(224, 236, 255, 0.38);
		--card-liquid-cyan: rgba(123, 198, 255, 0.2);
		--card-liquid-pink: rgba(255, 128, 196, 0.16);
		--card-shadow: 0 20px 44px -28px rgba(0, 0, 0, 0.8);
		--card-shadow-hover: 0 24px 54px -30px rgba(0, 0, 0, 0.88);
		--card-lift: -3px;
	}

	.project-card {
		position: relative;
		overflow: hidden;
		border-radius: 20px;
		padding: clamp(1rem, 0.85vw + 0.88rem, 1.28rem);
		border: 1px solid var(--card-outline);
		background:
			radial-gradient(circle at 0% 100%, var(--card-liquid-cyan), transparent 56%),
			radial-gradient(circle at 96% 4%, var(--card-liquid-pink), transparent 52%),
			linear-gradient(154deg, var(--card-surface-a), var(--card-surface-b));
		backdrop-filter: blur(8px) saturate(128%);
		-webkit-backdrop-filter: blur(8px) saturate(128%);
		box-shadow:
			var(--card-shadow),
			0 1px 0 rgba(255, 255, 255, 0.11) inset,
			0 0 0 1px rgba(255, 255, 255, 0.04) inset;
		transition:
			transform var(--dur-med) var(--ease-emph),
			border-color var(--dur-med) var(--ease-std),
			box-shadow var(--dur-med) var(--ease-std),
			background-position var(--dur-slow) var(--ease-std);
	}

	.project-card::before {
		content: '';
		position: absolute;
		inset: 0 auto auto 0;
		top: 0;
		width: 100%;
		height: 1px;
		background: linear-gradient(
			90deg,
			rgba(255, 255, 255, 0.04),
			rgba(200, 223, 255, 0.58) 38%,
			rgba(255, 176, 219, 0.36) 72%,
			rgba(255, 255, 255, 0.04)
		);
		pointer-events: none;
	}

	.project-card::after {
		content: '';
		position: absolute;
		inset: -22% -16% auto;
		height: 42%;
		background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.07), transparent 70%);
		opacity: 0.55;
		filter: blur(12px);
		pointer-events: none;
	}

	.project-card:hover,
	.project-card:focus-visible {
		transform: translateY(var(--card-lift));
		border-color: var(--card-outline-strong);
		box-shadow:
			var(--card-shadow-hover),
			0 1px 0 rgba(255, 255, 255, 0.14) inset,
			0 0 0 1px rgba(255, 255, 255, 0.05) inset;
	}

	.project-card:focus-visible {
		outline: none;
		box-shadow:
			var(--card-shadow-hover),
			0 0 0 1px rgba(255, 255, 255, 0.08) inset,
			0 0 0 2px rgba(143, 214, 255, 0.4);
	}

	.project-card__media {
		position: relative;
		width: 100%;
		aspect-ratio: 16 / 9;
		border-radius: 14px;
		overflow: hidden;
		border: 1px solid rgba(195, 216, 255, 0.24);
		background:
			radial-gradient(circle at 16% 18%, rgba(143, 214, 255, 0.2), transparent 58%),
			radial-gradient(circle at 86% 86%, rgba(255, 126, 194, 0.18), transparent 62%),
			#060a14;
		box-shadow:
			0 12px 24px rgba(0, 0, 0, 0.42),
			inset 0 0 0 1px rgba(255, 255, 255, 0.08);
	}

	.project-card__media::after {
		content: '';
		position: absolute;
		inset: 0;
		background:
			linear-gradient(180deg, rgba(6, 10, 20, 0) 46%, rgba(6, 10, 20, 0.24) 100%),
			radial-gradient(circle at 50% -30%, rgba(255, 255, 255, 0.18), transparent 60%);
		pointer-events: none;
	}

	.project-card__source {
		position: absolute;
		right: 0.6rem;
		top: 0.6rem;
		padding: 0.2rem 0.48rem;
		border-radius: 999px;
		border: 1px solid rgba(255, 255, 255, 0.18);
		background: rgba(7, 11, 20, 0.62);
		backdrop-filter: blur(8px) saturate(120%);
		-webkit-backdrop-filter: blur(8px) saturate(120%);
		font-family: var(--font-label);
		font-size: 0.56rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: rgba(228, 237, 255, 0.86);
	}

	.project-card__body {
		margin-top: 0.84rem;
		display: grid;
		gap: 0.56rem;
	}

	.project-card__type {
		margin: 0;
		font-family: var(--font-label);
		font-size: 0.64rem;
		letter-spacing: 0.095em;
		text-transform: uppercase;
		color: rgba(188, 213, 245, 0.8);
	}

	.project-card .adaptive-text {
		margin: 0;
		font-family: var(--font-display);
		font-size: clamp(1.1rem, 0.94rem + 0.52vw, 1.3rem);
		font-weight: 700;
		line-height: 1.25;
		letter-spacing: 0.006em;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
	}

	.project-card .adaptive-subtext {
		margin: 0;
		font-family: var(--font-body);
		font-size: clamp(0.8rem, 0.74rem + 0.18vw, 0.9rem);
		line-height: 1.58;
		letter-spacing: 0.004em;
		color: rgba(215, 226, 246, 0.9);
	}

	.project-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.38rem;
	}

	.project-tags span {
		font-family: var(--font-label);
		font-size: 0.56rem;
		text-transform: uppercase;
		letter-spacing: 0.065em;
		border-radius: 999px;
		padding: 0.22rem 0.52rem;
		background: rgba(173, 206, 255, 0.08);
		border: 1px solid rgba(179, 208, 255, 0.22);
		color: rgba(209, 225, 250, 0.9);
	}

	.project-card__actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.48rem 0.74rem;
		padding-top: 0.26rem;
	}

	.project-card__actions a,
	.project-open {
		text-decoration: none;
		font-family: var(--font-label);
		font-size: 0.61rem;
		letter-spacing: 0.072em;
		text-transform: uppercase;
		padding: 0;
		background: transparent;
		border: none;
		color: rgba(217, 229, 250, 0.92);
		cursor: pointer;
		border-bottom: 1px solid rgba(187, 210, 255, 0.22);
	}

	.project-card__actions a:hover,
	.project-card__actions a:focus-visible,
	.project-open:hover,
	.project-open:focus-visible {
		color: rgba(255, 188, 226, 0.98);
		border-bottom-color: rgba(255, 188, 226, 0.86);
		outline: none;
	}

	.project-group h3 {
		font-family: var(--font-label);
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	@media (max-width: 900px) {
		.project-card {
			padding: 0.9rem;
			border-radius: 18px;
		}

		.project-card .adaptive-text {
			font-size: var(--step-1);
		}

		.project-card__source {
			font-size: 0.62rem;
			padding: 0.26rem 0.56rem;
		}

		.project-card__actions {
			gap: 0.5rem;
		}

		.project-card__actions a,
		.project-open {
			display: inline-flex;
			align-items: center;
			min-height: 40px;
			padding: 0.36rem 0.62rem;
			font-size: 0.68rem;
			letter-spacing: 0.065em;
			border-radius: 999px;
			border: 1px solid rgba(187, 210, 255, 0.24);
			border-bottom: 1px solid rgba(187, 210, 255, 0.24);
			background: rgba(7, 11, 20, 0.34);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.project-card {
			transition: border-color var(--dur-fast) var(--ease-std), box-shadow var(--dur-fast) var(--ease-std);
		}

		.project-card:hover,
		.project-card:focus-visible {
			transform: none;
		}
	}
</style>
