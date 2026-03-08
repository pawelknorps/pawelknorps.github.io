<script>
	import { createEventDispatcher, onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import { resolveProjectMedia } from '$lib/utils/projectMedia.js';
	import ProjectSpherePreview from '$lib/components/ProjectSpherePreview.svelte';

	export let musicProjects = [];
	export let programmingProjects = [];
	export let showOtherProjects = true;
	export let adaptiveTextClass = 'text-white';
	export let adaptiveSubTextClass = 'text-gray-300';

	const dispatch = createEventDispatcher();
	let prefersReducedMotion = false;

	const isValidUrl = (value) => typeof value === 'string' && value.trim() && value !== '#';

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

	const getPrimaryProjectUrl = (project) => getExternalLinks(project)[0]?.url || project?.href || null;

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

	const navigateToProject = async (event, project, type) => {
		event?.preventDefault?.();
		const destination = getPrimaryProjectUrl(project);
		if (!destination) {
			openInApp(event, project, type);
			return;
		}
		if (/^https?:\/\//i.test(destination)) {
			window.open(destination, '_blank', 'noopener,noreferrer');
			return;
		}
		await goto(destination);
	};

	const handleCardClick = (event, project, type) => {
		const target = event?.target;
		if (target instanceof HTMLElement) {
			if (target.closest('.project-card__actions')) {
				return;
			}
		}
		navigateToProject(event, project, type);
	};

	const handleCardKeydown = (event, project, type) => {
		if (event.key !== 'Enter' && event.key !== ' ') return;
		event.preventDefault();
		navigateToProject(event, project, type);
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
			{@const primaryLink = links[0]}
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
						videoProvider={media.provider || data.videoProvider}
						mediaKind={media.kind}
						mediaEmbedSrc={media.embedSrc}
						mediaAllow={media.allow}
						reducedMotion={prefersReducedMotion}
					/>
				</div>

				<div class="project-card__body">
					<p class="project-card__type">{data.type || 'Music Project'}</p>
					<h2
						class="adaptive-text text-contrast-strong"
						class:text-white={adaptiveTextClass === 'text-white'}
						class:text-gray-900={adaptiveTextClass === 'text-gray-900'}
					>
						{data.title}
					</h2>
					{#if data.description}
						<p
							class="adaptive-subtext text-contrast-soft"
							class:text-gray-300={adaptiveSubTextClass === 'text-gray-300'}
							class:text-gray-200={adaptiveSubTextClass === 'text-gray-200'}
							class:text-gray-700={adaptiveSubTextClass === 'text-gray-700'}
						>
							{data.description}
						</p>
					{/if}

					<div class="project-card__actions">
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

{#if showOtherProjects && programmingProjects.length > 0}
	<div class="project-group mb-32 w-full xl:flex xl:flex-col xl:items-start xl:max-w-[56rem] 2xl:max-w-[64rem]">
		<h3
			class="text-3xl font-black tracking-widest mb-16 opacity-90 adaptive-text text-contrast-strong w-full xl:max-w-[56rem] 2xl:max-w-[64rem]"
			class:text-white={adaptiveTextClass === 'text-white'}
			class:text-gray-900={adaptiveTextClass === 'text-gray-900'}
		>
			OTHER
		</h3>

		{#each programmingProjects as data, i}
			{@const links = getExternalLinks(data)}
			{@const primaryLink = links[0]}
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
						videoProvider={media.provider || data.videoProvider}
						mediaKind={media.kind}
						mediaEmbedSrc={media.embedSrc}
						mediaAllow={media.allow}
						reducedMotion={prefersReducedMotion}
					/>
				</div>

				<div class="project-card__body">
					<p class="project-card__type">{data.type || 'Programming Project'}</p>
					<h2
						class="adaptive-text text-contrast-strong"
						class:text-white={adaptiveTextClass === 'text-white'}
						class:text-gray-900={adaptiveTextClass === 'text-gray-900'}
					>
						{data.title}
					</h2>
					{#if data.description}
						<p
							class="adaptive-subtext text-contrast-soft"
							class:text-gray-300={adaptiveSubTextClass === 'text-gray-300'}
							class:text-gray-200={adaptiveSubTextClass === 'text-gray-200'}
							class:text-gray-700={adaptiveSubTextClass === 'text-gray-700'}
						>
							{data.description}
						</p>
					{/if}

					<div class="project-card__actions">
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
		--card-surface-a: rgba(8, 11, 18, 0.02);
		--card-surface-b: rgba(18, 28, 42, 0.03);
		--card-liquid-cyan: rgba(78, 204, 255, 0.08);
		--card-liquid-pink: rgba(255, 69, 165, 0.07);
		--card-acid: rgba(220, 255, 78, 0.04);
		--card-shadow: 0 38px 80px -52px rgba(0, 0, 0, 0.62);
		--card-shadow-hover: 0 46px 96px -56px rgba(0, 0, 0, 0.78);
		--card-lift: -2px;
	}

	.project-card {
		position: relative;
		overflow: hidden;
		border-radius: 34px 8px 42px 12px;
		padding: clamp(0.48rem, 0.48vw + 0.42rem, 0.72rem);
		background:
			radial-gradient(circle at 8% 12%, var(--card-liquid-cyan), transparent 34%),
			radial-gradient(circle at 88% 14%, var(--card-liquid-pink), transparent 28%),
			radial-gradient(circle at 52% 100%, var(--card-acid), transparent 30%),
			linear-gradient(154deg, var(--card-surface-a), var(--card-surface-b));
		backdrop-filter: blur(3px) saturate(118%);
		-webkit-backdrop-filter: blur(3px) saturate(118%);
		box-shadow: var(--card-shadow);
		isolation: isolate;
		transition:
			transform var(--dur-med) var(--ease-emph),
			box-shadow var(--dur-med) var(--ease-std),
			background-position var(--dur-slow) var(--ease-std);
	}

	.project-card::before {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.025), transparent 28%);
		opacity: 0.24;
		pointer-events: none;
	}

	.project-card::after {
		content: '';
		position: absolute;
		inset: auto -12% -18% 22%;
		height: 58%;
		background:
			conic-gradient(
				from 220deg at 50% 50%,
				rgba(255, 88, 172, 0.16),
				rgba(112, 216, 255, 0.06),
				transparent 58%,
				rgba(218, 255, 72, 0.08),
				rgba(255, 88, 172, 0.16)
			);
		opacity: 0.42;
		filter: blur(28px);
		pointer-events: none;
		z-index: 0;
	}

	.project-card:hover,
	.project-card:focus-visible {
		transform: translateY(var(--card-lift));
		box-shadow: var(--card-shadow-hover);
	}

	.project-card:focus-visible {
		outline: none;
		box-shadow:
			var(--card-shadow-hover),
			0 0 0 1px rgba(129, 223, 255, 0.08);
	}

	.project-card__media {
		position: relative;
		width: 100%;
		aspect-ratio: 16 / 9;
		border-radius: 30px 6px 38px 8px;
		overflow: hidden;
		background:
			radial-gradient(circle at 16% 18%, rgba(143, 214, 255, 0.24), transparent 42%),
			radial-gradient(circle at 86% 86%, rgba(255, 126, 194, 0.22), transparent 46%),
			linear-gradient(135deg, rgba(6, 10, 20, 0.84), rgba(5, 9, 18, 0.64));
		box-shadow:
			0 26px 44px -34px rgba(0, 0, 0, 0.84),
			-18px 0 30px -28px rgba(87, 214, 255, 0.22),
			20px 0 34px -30px rgba(255, 73, 166, 0.18);
	}

	.project-card__media::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, rgba(6, 10, 20, 0.04) 12%, rgba(6, 10, 20, 0.42) 100%);
		pointer-events: none;
	}

	.project-card__body {
		margin-top: 0.48rem;
		display: grid;
		gap: 0.56rem;
		padding: 0 0.28rem 0.24rem;
	}

	.project-card__type {
		margin: 0;
		font-family: var(--font-label);
		font-size: 0.58rem;
		letter-spacing: 0.19em;
		text-transform: uppercase;
		color: rgba(244, 248, 255, 0.92);
		text-shadow:
			0 1px 0 rgba(0, 0, 0, 0.8),
			0 0.15em 0.45em rgba(0, 0, 0, 0.52);
	}

	.project-card .adaptive-text {
		margin: 0;
		font-family: var(--font-display);
		font-size: clamp(1.16rem, 0.96rem + 0.66vw, 1.44rem);
		font-weight: 700;
		line-height: 1.16;
		letter-spacing: 0.045em;
		text-transform: uppercase;
	}

	.project-card .adaptive-subtext {
		margin: 0;
		font-family: var(--font-body);
		font-size: clamp(0.82rem, 0.76rem + 0.18vw, 0.92rem);
		line-height: 1.6;
		letter-spacing: 0.016em;
		color: rgba(248, 251, 255, 0.96);
	}

	.project-card__actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.48rem 0.74rem;
		padding-top: 0.26rem;
	}

	.project-card__actions a {
		text-decoration: none;
		font-family: var(--font-label);
		font-size: 0.56rem;
		letter-spacing: 0.13em;
		text-transform: uppercase;
		padding: 0;
		background: transparent;
		color: rgba(217, 229, 250, 0.72);
		border-bottom: 1px solid rgba(187, 210, 255, 0.12);
	}

	.project-card__actions a:hover,
	.project-card__actions a:focus-visible {
		color: rgba(236, 255, 134, 0.98);
		border-bottom-color: rgba(236, 255, 134, 0.64);
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
			padding: 0.42rem;
			border-radius: 24px 8px 30px 10px;
		}

		.project-card .adaptive-text {
			font-size: var(--step-1);
		}

		.project-card__media {
			border-radius: 22px 6px 28px 8px;
		}

		.project-card__actions {
			gap: 0.5rem;
		}

		.project-card__actions a {
			display: inline-flex;
			align-items: center;
			min-height: 40px;
			padding: 0.36rem 0.62rem;
			font-size: 0.68rem;
			letter-spacing: 0.065em;
			border-radius: 999px;
			border: none;
			border-bottom: 1px solid rgba(187, 210, 255, 0.16);
			background: rgba(7, 11, 20, 0.22);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.project-card {
			transition: box-shadow var(--dur-fast) var(--ease-std);
		}

		.project-card:hover,
		.project-card:focus-visible {
			transform: none;
		}
	}
</style>
