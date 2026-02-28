<script>
	import { tick } from 'svelte';
	import SandboxedEmbed from '$lib/components/SandboxedEmbed.svelte';

	export let media = null;
	export let onClose = () => {};
	export let reducedMotion = false;

	let overlayEl;
	let lastFocusedElement = null;

	const FOCUSABLE_SELECTORS = [
		'button:not([disabled])',
		'a[href]',
		'input:not([disabled])',
		'select:not([disabled])',
		'textarea:not([disabled])',
		'[tabindex]:not([tabindex="-1"])'
	].join(',');

	const closeOverlay = () => {
		onClose?.();
	};

	const handleOverlayClick = (event) => {
		if (event.target === overlayEl) {
			closeOverlay();
		}
	};

	const trapFocus = (event) => {
		if (event.key === 'Escape') {
			event.preventDefault();
			closeOverlay();
			return;
		}
		if (event.key !== 'Tab' || !overlayEl) return;

		const focusable = [...overlayEl.querySelectorAll(FOCUSABLE_SELECTORS)].filter(
			(el) => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true'
		);
		if (focusable.length === 0) return;

		const first = focusable[0];
		const last = focusable[focusable.length - 1];
		const active = document.activeElement;

		if (event.shiftKey && active === first) {
			event.preventDefault();
			last.focus();
			return;
		}
		if (!event.shiftKey && active === last) {
			event.preventDefault();
			first.focus();
		}
	};

	$: if (media) {
		lastFocusedElement = document.activeElement;
		tick().then(() => {
			const focusable = overlayEl?.querySelector(FOCUSABLE_SELECTORS);
			focusable?.focus();
		});
	}

	$: if (!media && lastFocusedElement?.focus) {
		lastFocusedElement.focus();
		lastFocusedElement = null;
	}
</script>

{#if media}
	<div
		class="media-overlay"
		bind:this={overlayEl}
		role="dialog"
		aria-modal="true"
		aria-label={media.title || 'Project media'}
		tabindex="-1"
		on:click={handleOverlayClick}
		on:keydown={trapFocus}
	>
		<div class="media-shell">
			<div class="media-topbar">
				<div class="media-meta">
					<h3>{media.title}</h3>
					<p>{media.subtitle}</p>
				</div>
				<button type="button" class="media-close" on:click={closeOverlay}>Close</button>
			</div>

			<div class="media-body">
				{#if media.kind === 'video' && media.embedSrc}
					<!-- svelte-ignore a11y-media-has-caption -->
					<video src={media.embedSrc} controls autoplay={!reducedMotion} playsinline></video>
				{:else if media.embedSrc}
					<SandboxedEmbed
						src={media.embedSrc}
						title={media.title}
						allow={media.allow || 'autoplay; encrypted-media; picture-in-picture; fullscreen'}
					/>
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
			radial-gradient(circle at 85% 85%, rgba(255, 78, 163, 0.24), transparent 40%),
			rgba(3, 7, 16, 0.74);
		backdrop-filter: blur(20px) saturate(140%);
	}

	.media-shell {
		width: min(1120px, 100%);
		border-radius: var(--radius-lg);
		overflow: hidden;
		border: 1px solid var(--stroke-strong);
		background: linear-gradient(140deg, rgba(8, 12, 24, 0.9), rgba(10, 15, 29, 0.84));
		box-shadow: var(--shadow-lg);
	}

	.media-topbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		padding: 0.85rem 1rem;
		border-bottom: 1px solid var(--stroke-soft);
	}

	.media-meta h3 {
		margin: 0;
		font-family: var(--font-display);
		font-size: var(--step-1);
		letter-spacing: 0.008em;
		font-weight: 600;
		color: var(--text-1);
	}

	.media-meta p {
		margin: 0.2rem 0 0;
		font-family: var(--font-label);
		font-size: var(--step--1);
		letter-spacing: 0.07em;
		opacity: 0.75;
		color: var(--text-2);
		text-transform: uppercase;
	}

	.media-close {
		border: 1px solid rgba(255, 78, 163, 0.5);
		background: rgba(9, 19, 37, 0.8);
		color: #ffe7f3;
		border-radius: 999px;
		padding: 0.4rem 0.8rem;
		font-family: var(--font-label);
		font-size: var(--step--1);
		letter-spacing: 0.06em;
		cursor: pointer;
		text-transform: uppercase;
	}

	.media-close:hover {
		background: rgba(255, 78, 163, 0.2);
		border-color: rgba(255, 78, 163, 0.7);
	}

	.media-body {
		position: relative;
		aspect-ratio: 16 / 9;
		background: #070c17;
	}

	.media-body :global(iframe) {
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
		color: var(--text-1);
		padding: 1.25rem;
	}

	.media-fallback a {
		color: var(--accent-cyan);
		text-decoration: underline;
	}
	@media (max-width: 900px) {
		.media-overlay {
			padding: 0.5rem;
		}
	}
</style>
