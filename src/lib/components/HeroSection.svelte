<script>
	import { createEventDispatcher } from 'svelte';

	export let personalData = {};
	export let adaptiveTextClass;
	export let bioFocusEnabled = false;
	export let isAudioEnabled = false;
	export let audioIntensity = 0;

	const dispatch = createEventDispatcher();
</script>

<!-- Hero Section -->
<div class="hero-section h-[75vh] flex flex-col justify-center relative">
	<div class="group z-10">
		<button
			type="button"
			class="hero-title ml-6 md:ml-20 adaptive-text title-toggle typ-display"
			class:focus-active={bioFocusEnabled}
			class:audio-live={isAudioEnabled}
			style:--audio-intensity={audioIntensity}
			on:click={() => dispatch('toggleBioFocus')}
			title="Toggle immersive bio focus"
			class:text-white={adaptiveTextClass === 'text-white'}
			class:text-gray-900={adaptiveTextClass === 'text-gray-900'}>
			{personalData?.name || 'Paweł Knorps'}
		</button>
		<h2
			class="hero-subtitle mt-6 text-center md:text-left md:ml-20 adaptive-text typ-body"
			class:text-white={adaptiveTextClass === "text-white"}
			class:text-gray-900={adaptiveTextClass === "text-gray-900"}
		>
			&nbsp;An experimental musician and improviser based in Poznań.
		</h2>
	</div>
</div>

<style>
	/* Hero section styling */
	.hero-section {
		background: transparent;
		position: relative;
		z-index: 40;
		pointer-events: none;
	}

	/* Adaptive text colors with smooth transitions */
	.adaptive-text {
		transition: color var(--dur-med) var(--ease-std);
		text-shadow:
			0 8px 24px rgba(0, 0, 0, 0.45),
			0 2px 6px rgba(0, 0, 0, 0.34);
	}

	.title-toggle {
		--audio-intensity: 0;
		background: transparent;
		border: 0;
		padding: 0;
		text-align: left;
		cursor: pointer;
		pointer-events: auto;
		user-select: none;
		transition: transform var(--dur-fast) var(--ease-emph), text-shadow var(--dur-fast) var(--ease-emph), letter-spacing var(--dur-fast) var(--ease-emph);
	}

	.hero-title {
		font-size: var(--step-6);
		line-height: 0.9;
		letter-spacing: 0.02em;
	}

	.hero-subtitle {
		font-size: var(--step-2);
		font-weight: 400;
		letter-spacing: 0.1em;
		max-width: 28ch;
		color: var(--text-2);
	}

	.title-toggle:hover {
		transform: translateY(-1px);
		text-shadow:
			0 0 18px rgba(255, 78, 173, 0.88),
			0 0 34px rgba(104, 193, 255, 0.74),
			0 0 52px rgba(255, 40, 145, 0.45),
			0 2px 2px rgba(0, 0, 0, 0.55);
	}

	.title-toggle.audio-live {
		text-shadow:
			0 0 calc(10px + var(--audio-intensity) * 24px)
				rgba(255, 90, 180, calc(0.22 + var(--audio-intensity) * 0.55)),
			0 0 calc(16px + var(--audio-intensity) * 30px)
				rgba(110, 200, 255, calc(0.2 + var(--audio-intensity) * 0.45)),
			0 0 calc(22px + var(--audio-intensity) * 36px)
				rgba(255, 50, 160, calc(0.12 + var(--audio-intensity) * 0.35)),
			0 2px 2px rgba(0, 0, 0, 0.5);
	}

	.title-toggle.focus-active {
		letter-spacing: 0.1em;
		text-shadow:
			0 0 14px rgba(90, 200, 255, 0.9),
			0 0 28px rgba(80, 120, 255, 0.55),
			0 2px 2px rgba(0, 0, 0, 0.55);
	}

	.title-toggle.audio-live.focus-active {
		text-shadow:
			0 0 calc(14px + var(--audio-intensity) * 22px)
				rgba(255, 94, 186, calc(0.3 + var(--audio-intensity) * 0.5)),
			0 0 calc(24px + var(--audio-intensity) * 30px)
				rgba(110, 200, 255, calc(0.28 + var(--audio-intensity) * 0.42)),
			0 2px 2px rgba(0, 0, 0, 0.56);
	}

	@media (max-width: 900px) {
		.hero-subtitle {
			font-size: var(--step-1);
			letter-spacing: 0.08em;
			padding: 0 1rem;
			max-width: none;
		}
	}

</style>
