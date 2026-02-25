<script>
	export let media = null;
	export let onClose = () => {};
</script>

{#if media}
	<div class="media-overlay">
		<div class="media-shell">
			<div class="media-topbar">
				<div class="media-meta">
					<h3>{media.title}</h3>
					<p>{media.subtitle}</p>
				</div>
				<button type="button" class="media-close" on:click={onClose}>Close</button>
			</div>

			<div class="media-body">
				{#if media.kind === 'video' && media.embedSrc}
					<!-- svelte-ignore a11y-media-has-caption -->
					<video src={media.embedSrc} controls autoplay playsinline></video>
				{:else if media.embedSrc}
					<iframe
						src={media.embedSrc}
						title={media.title}
						allow={media.allow || 'autoplay; encrypted-media; picture-in-picture; fullscreen'}
						allowfullscreen
						loading="lazy"
						referrerpolicy="strict-origin-when-cross-origin"
					></iframe>
				{:else}
					<div class="media-fallback">
						<p>This platform does not allow full in-app embedding for this link.</p>
						<a href={media.url} target="_blank" rel="noopener noreferrer">Open original media</a>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.media-overlay {
		position: fixed;
		inset: 0;
		z-index: 120;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: clamp(1rem, 3vw, 2rem);
		background:
			radial-gradient(circle at 12% 10%, rgba(82, 154, 255, 0.24), transparent 35%),
			radial-gradient(circle at 85% 85%, rgba(255, 51, 148, 0.23), transparent 40%),
			rgba(3, 7, 16, 0.74);
		backdrop-filter: blur(20px);
	}

	.media-shell {
		width: min(1120px, 100%);
		border-radius: 18px;
		overflow: hidden;
		border: 1px solid rgba(255, 255, 255, 0.18);
		background: rgba(8, 12, 24, 0.88);
		box-shadow: 0 24px 80px rgba(0, 0, 0, 0.55);
	}

	.media-topbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		padding: 0.85rem 1rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.12);
	}

	.media-meta h3 {
		margin: 0;
		font-size: 0.95rem;
		letter-spacing: 0.05em;
		font-weight: 700;
		color: #f1f6ff;
	}

	.media-meta p {
		margin: 0.2rem 0 0;
		font-size: 0.7rem;
		letter-spacing: 0.1em;
		opacity: 0.75;
		color: #e0ecff;
		text-transform: uppercase;
	}

	.media-close {
		border: 1px solid rgba(255, 255, 255, 0.28);
		background: rgba(9, 19, 37, 0.8);
		color: #f4f9ff;
		border-radius: 999px;
		padding: 0.4rem 0.8rem;
		font-size: 0.72rem;
		letter-spacing: 0.08em;
		cursor: pointer;
	}

	.media-body {
		position: relative;
		aspect-ratio: 16 / 9;
		background: #070c17;
	}

	.media-body iframe {
		width: 100%;
		height: 100%;
		border: 0;
		display: block;
	}

	.media-body video {
		width: 100%;
		height: 100%;
		object-fit: contain;
		background: #050910;
		display: block;
	}

	.media-fallback {
		height: 100%;
		display: grid;
		place-content: center;
		gap: 0.8rem;
		text-align: center;
		color: #f0f6ff;
		padding: 1.25rem;
	}

	.media-fallback a {
		color: #8dd2ff;
		text-decoration: underline;
	}
	@media (max-width: 900px) {
		.media-overlay {
			padding: 0.5rem;
		}
	}
</style>
