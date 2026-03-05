<script>
	import { createEventDispatcher } from 'svelte';

	export let textureUrl = '';
	export let title = '';
	export let videoProvider = '';
	export let previewSource = '';
	export let sourceLabel = '';
	export let mediaKind = null;
	export let mediaEmbedSrc = null;
	export let mediaAllow = '';
	export let reducedMotion = false;

	const dispatch = createEventDispatcher();

	const handleOpen = () => {
		dispatch('open');
	};

	const shouldUseLiveMedia = () =>
		previewSource === 'fallback' &&
		(mediaKind === 'iframe' || mediaKind === 'video') &&
		typeof mediaEmbedSrc === 'string' &&
		mediaEmbedSrc.length > 0;

	const overlayLabel = () => {
		const normalized = (sourceLabel || videoProvider || 'project').trim().toLowerCase();
		if (previewSource === 'fallback') return `${normalized} source`;
		return `${normalized} preview`;
	};
</script>

<div class="sphere-preview" class:is-animated={!reducedMotion} role="group" aria-label={`${title || 'project'} preview`}>
	{#if shouldUseLiveMedia() && mediaKind === 'iframe'}
		<iframe
			src={mediaEmbedSrc}
			title={`${title || 'Project'} source`}
			allow={mediaAllow || 'autoplay; encrypted-media; picture-in-picture; fullscreen'}
			loading="lazy"
			referrerpolicy="strict-origin-when-cross-origin"
		></iframe>
	{:else if shouldUseLiveMedia() && mediaKind === 'video'}
		<video src={mediaEmbedSrc} controls playsinline preload="metadata">
			<track kind="captions" srclang="en" label="Captions unavailable" />
		</video>
	{:else if textureUrl}
		<img src={textureUrl} alt={`${title || 'Project'} preview`} loading="lazy" decoding="async" />
	{:else}
		<div class="sphere-preview__fallback" aria-hidden="true"></div>
	{/if}
	<div class="sphere-preview__overlay" aria-hidden="true">
		<span>{overlayLabel()}</span>
	</div>
	<button
		type="button"
		class="sphere-preview__open"
		on:click|stopPropagation={handleOpen}
		aria-label={`Open ${title || 'project'}`}
	>
		Open
	</button>
</div>

<style>
	.sphere-preview {
		position: relative;
		width: 100%;
		height: 100%;
		padding: 0;
		border: 0;
		cursor: pointer;
		background: radial-gradient(circle at 30% 18%, rgba(112, 173, 255, 0.25), transparent 58%),
			radial-gradient(circle at 76% 85%, rgba(255, 140, 203, 0.18), transparent 64%), #070d18;
	}

	.sphere-preview img,
	.sphere-preview__fallback,
	.sphere-preview iframe,
	.sphere-preview video {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	.sphere-preview img,
	.sphere-preview video {
		object-fit: cover;
	}

	.sphere-preview iframe {
		border: 0;
		background: #070d18;
	}

	.sphere-preview img {
		opacity: 0.86;
	}

	.sphere-preview__fallback {
		background: radial-gradient(circle at 62% 38%, rgba(148, 215, 255, 0.2), transparent 55%),
			radial-gradient(circle at 26% 72%, rgba(255, 136, 201, 0.2), transparent 64%),
			linear-gradient(152deg, rgba(7, 12, 22, 0.95), rgba(10, 16, 29, 0.98));
	}

	.sphere-preview::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(180deg, rgba(7, 12, 22, 0.06), rgba(7, 12, 22, 0.34));
		pointer-events: none;
	}

	.sphere-preview__overlay {
		position: absolute;
		left: 0.5rem;
		bottom: 0.45rem;
		z-index: 2;
	}

	.sphere-preview__overlay span {
		display: inline-flex;
		align-items: center;
		padding: 0.2rem 0.5rem;
		border-radius: 999px;
		border: 1px solid rgba(255, 255, 255, 0.16);
		background: rgba(7, 12, 22, 0.54);
		backdrop-filter: blur(6px);
		-webkit-backdrop-filter: blur(6px);
		font-family: var(--font-label);
		font-size: 0.54rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: rgba(226, 236, 252, 0.86);
	}

	.sphere-preview:focus-visible {
		outline: none;
		box-shadow: inset 0 0 0 2px rgba(143, 214, 255, 0.52);
	}

	.sphere-preview__open {
		position: absolute;
		right: 0.5rem;
		bottom: 0.45rem;
		z-index: 2;
		padding: 0.2rem 0.5rem;
		border-radius: 999px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		background: rgba(7, 12, 22, 0.58);
		backdrop-filter: blur(6px);
		-webkit-backdrop-filter: blur(6px);
		font-family: var(--font-label);
		font-size: 0.54rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: rgba(231, 240, 255, 0.92);
		cursor: pointer;
	}

	.sphere-preview__open:hover,
	.sphere-preview__open:focus-visible {
		border-color: rgba(255, 190, 226, 0.7);
		color: rgba(255, 205, 233, 0.98);
		outline: none;
	}

	.sphere-preview.is-animated img {
		transition: transform var(--dur-slow) var(--ease-emph), opacity var(--dur-med) var(--ease-std);
	}

	.sphere-preview.is-animated:hover img,
	.sphere-preview.is-animated:focus-visible img {
		transform: scale(1.02);
		opacity: 0.9;
	}

	@media (prefers-reduced-motion: reduce) {
		.sphere-preview.is-animated img {
			transition: none;
		}
	}
</style>
