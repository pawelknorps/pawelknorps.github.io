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
			class="hero-title ml-6 md:ml-20 adaptive-text text-contrast-strong title-toggle typ-display"
			class:focus-active={bioFocusEnabled}
			class:audio-live={isAudioEnabled}
			style:--audio-intensity={audioIntensity}
			on:click={() => dispatch('toggleBioFocus')}
			title="Toggle immersive bio focus"
			class:text-white={adaptiveTextClass === 'text-white'}
			class:text-gray-900={adaptiveTextClass === 'text-gray-900'}>
			{personalData?.name || 'Paweł Knorps'}
		</button>
		<p
			class="hero-role mt-8 ml-6 md:ml-20 adaptive-text text-contrast-soft typ-body"
			class:text-white={adaptiveTextClass === 'text-white'}
			class:text-gray-900={adaptiveTextClass === 'text-gray-900'}
		>
			Composer, Bassist, Producer and <span>guitarist.</span>
		</p>
		<h2
			class="hero-subtitle mt-12 text-center md:text-left md:ml-20 adaptive-text text-contrast-soft typ-body"
			class:text-white={adaptiveTextClass === "text-white"}
			class:text-gray-900={adaptiveTextClass === "text-gray-900"}
		>
			An experimental musician and improviser based in Poznań.
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
		font-size: clamp(3.4rem, 2.2rem + 5.4vw, 7.2rem);
		line-height: 0.9;
		letter-spacing: -0.055em;
		text-transform: none;
		font-weight: 700;
		text-shadow:
			0 10px 24px rgba(0, 0, 0, 0.34),
			0 4px 8px rgba(0, 0, 0, 0.22);
	}

	.hero-role {
		font-size: clamp(1.7rem, 1.08rem + 2.4vw, 3.25rem);
		font-weight: 300;
		line-height: 1.08;
		letter-spacing: -0.04em;
		max-width: 20ch;
		color: rgba(255, 255, 255, 0.97);
	}

	.hero-role span {
		color: #ff00b8;
		font-weight: 700;
		text-shadow:
			0 0 18px rgba(255, 0, 184, 0.34),
			0 6px 10px rgba(0, 0, 0, 0.28);
	}

	.hero-subtitle {
		font-size: clamp(1.45rem, 1rem + 1.65vw, 2.9rem);
		font-weight: 300;
		letter-spacing: -0.045em;
		line-height: 1.14;
		max-width: 32ch;
		text-transform: none;
		color: rgba(255, 255, 255, 0.94);
		text-wrap: balance;
		opacity: 1;
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
		letter-spacing: 0.04em;
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
		.hero-title {
			font-size: clamp(2.9rem, 2rem + 4vw, 4.4rem);
		}

		.hero-role {
			margin-top: 1.25rem;
			font-size: clamp(1.55rem, 1.2rem + 1.8vw, 2.35rem);
			max-width: 16ch;
		}

		.hero-subtitle {
			font-size: clamp(1.2rem, 0.98rem + 1vw, 1.65rem);
			letter-spacing: -0.035em;
			padding: 0 1rem;
			max-width: none;
		}
	}

</style>
