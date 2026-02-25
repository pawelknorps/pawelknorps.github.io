<script>
	import { createEventDispatcher } from 'svelte';

	export let personalData = {};
	export let adaptiveTextClass;
	export let bioFocusEnabled = false;

	const dispatch = createEventDispatcher();
</script>

<!-- Hero Section -->
<div class="hero-section h-[75vh] flex flex-col justify-center relative">
	<div class="group z-10">
		<button
			type="button"
			class="text-6xl font-black tracking-widest ml-20 adaptive-text title-toggle"
			class:focus-active={bioFocusEnabled}
			on:click={() => dispatch('toggleBioFocus')}
			title="Toggle immersive bio focus"
			class:text-white={adaptiveTextClass === 'text-white'}
			class:text-gray-900={adaptiveTextClass === 'text-gray-900'}>
			{personalData?.name || 'Paweł Knorps'}
		</button>
		<h2 class="text-2xl font-thin tracking-widest mt-6 ml-20 adaptive-text"
			class:text-white={adaptiveTextClass === 'text-white'}
			class:text-gray-900={adaptiveTextClass === 'text-gray-900'}>
			&nbsp;{personalData?.title || 'Composer, Bassist, Producer'} and <mark id="revelation" style="background: none; color: #FF0080;" class="font-black">guitarist.</mark>
		</h2>
		<h2
			class="text-2xl xl:text-3xl 2xl:text-4xl font-thin tracking-widest mt-6 text-center md:text-left md:ml-20 adaptive-text"
			class:text-white={adaptiveTextClass === "text-white"}
			class:text-gray-900={adaptiveTextClass === "text-gray-900"}
		>
			&nbsp;An experimental musician and improviser based in Poznań.
		</h2>
	</div>
</div>

<style>
	#revelation {
		animation: rainbow 6s infinite;
	}

	@keyframes rainbow {
		0% {
			color: #ff0080;
		}
		15% {
			color: #ff00aa;
		}
		30% {
			color: #ff00ea;
		}
		45% {
			color: #ea00ff;
		}
		60% {
			color: #ff00c8;
		}
		75% {
			color: #ff009d;
		}
		100% {
			color: #ff008c;
		}
	}

	/* Hero section styling */
	.hero-section {
		background: transparent;
		position: relative;
		z-index: 40;
		pointer-events: none;
	}

	/* Adaptive text colors with smooth transitions */
	.adaptive-text {
		transition: color 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		text-shadow:
			0 0 20px rgba(0, 0, 0, 0.5),
			0 2px 4px rgba(0, 0, 0, 0.3);
		letter-spacing: -0.02em;
	}

	.title-toggle {
		background: transparent;
		border: 0;
		padding: 0;
		text-align: left;
		cursor: pointer;
		pointer-events: auto;
		user-select: none;
		transition: transform 0.25s ease, text-shadow 0.25s ease, letter-spacing 0.25s ease;
	}

	.title-toggle:hover {
		transform: translateY(-1px);
	}

	.title-toggle.focus-active {
		letter-spacing: 0.16em;
		text-shadow:
			0 0 14px rgba(90, 200, 255, 0.9),
			0 0 28px rgba(80, 120, 255, 0.55),
			0 2px 2px rgba(0, 0, 0, 0.55);
	}
</style>
