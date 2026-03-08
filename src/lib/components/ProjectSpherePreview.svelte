<script>
	export let textureUrl = '';
	export let title = '';
	export let videoProvider = '';
	export let mediaKind = null;
	export let mediaEmbedSrc = null;
	export let mediaAllow = '';
	export let reducedMotion = false;

	const shouldUseLiveMedia = () =>
		(mediaKind === 'iframe' || mediaKind === 'video') &&
		typeof mediaEmbedSrc === 'string' &&
		mediaEmbedSrc.length > 0;

	const isFacebookEmbed = () => {
		const provider = (videoProvider || '').trim().toLowerCase();
		if (provider === 'facebook') return true;
		return typeof mediaEmbedSrc === 'string' && mediaEmbedSrc.includes('facebook.com/plugins/video.php');
	};

	const shouldRenderIframe = () => shouldUseLiveMedia() && mediaKind === 'iframe';
	const shouldRenderVideo = () => shouldUseLiveMedia() && mediaKind === 'video';

</script>

<div class="sphere-preview" class:is-animated={!reducedMotion} role="group" aria-label={`${title || 'project'} preview`}>
	{#if shouldRenderIframe()}
		<div class="sphere-preview__player" class:is-facebook={isFacebookEmbed()}>
			<iframe
				src={mediaEmbedSrc}
				title={`${title || 'Project'} source`}
				allow={mediaAllow || 'autoplay; encrypted-media; picture-in-picture; fullscreen'}
				loading="lazy"
				referrerpolicy="strict-origin-when-cross-origin"
			></iframe>
		</div>
	{:else if shouldRenderVideo()}
		<div class="sphere-preview__player">
			<video src={mediaEmbedSrc} controls playsinline preload="metadata">
				<track kind="captions" srclang="en" label="Captions unavailable" />
			</video>
		</div>
	{:else if textureUrl}
		<img src={textureUrl} alt={`${title || 'Project'} preview`} loading="lazy" decoding="async" />
	{:else}
		<div class="sphere-preview__fallback" aria-hidden="true"></div>
	{/if}
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
	.sphere-preview__player,
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

	.sphere-preview__player {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: clamp(0.5rem, 1.6vw, 0.9rem);
		z-index: 1;
	}

	.sphere-preview__player.is-facebook {
		padding: 0;
		overflow: hidden;
	}

	.sphere-preview iframe {
		position: relative;
		display: block;
		border: 0;
		background: #070d18;
		width: 100%;
		height: 100%;
		max-width: 100%;
	}

	.sphere-preview img {
		opacity: 0.86;
	}

	.sphere-preview__player.is-facebook iframe {
		position: absolute;
		inset: 50% auto auto 50%;
		width: max(100%, calc(100% * 16 / 9));
		height: max(100%, calc(100% * 16 / 9));
		max-width: none;
		max-height: none;
		margin: 0;
		transform: translate(-50%, -50%);
		transform-origin: center center;
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

	.sphere-preview:focus-visible {
		outline: none;
		box-shadow: inset 0 0 0 2px rgba(143, 214, 255, 0.52);
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
