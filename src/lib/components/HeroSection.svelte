<script>
	import { createEventDispatcher } from 'svelte';

	export let personalData;
	export let adaptiveTextClass;
	export let adaptiveSubTextClass;
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
			{personalData.name}
		</button>
		<h2 class="text-2xl font-thin tracking-widest mt-6 ml-20 adaptive-text"
			class:text-white={adaptiveTextClass === 'text-white'}
			class:text-gray-900={adaptiveTextClass === 'text-gray-900'}>
			&nbsp;{personalData.title} and <mark id="revelation" style="background: none; color: #FF0080;" class="font-black">guitarist.</mark>
		</h2>
		<h2 class="text-2xl font-thin tracking-widest mt-6 ml-20 adaptive-text"
			class:text-white={adaptiveTextClass === 'text-white'}
			class:text-gray-900={adaptiveTextClass === 'text-gray-900'}>
			&nbsp;{personalData.bio}
		</h2>
	</div>
</div>

<style>
	#revelation { 
		animation: rainbow 6s infinite; 
	}
	
	@keyframes rainbow {
		0% 		{color: #FF0080}
		15% 	{color: #FF00AA}
		30% 	{color: #FF00EA}
		45% 	{color: #EA00FF}
		60% 	{color: #FF00C8}
		75% 	{color: #FF009D}
		100% 	{color: #FF008C}
	}

	/* Hero section styling */
	.hero-section {
		background: transparent;
		position: relative;
		z-index: 40;
		pointer-events: auto;
	}

	/* Adaptive text colors with smooth transitions */
	.adaptive-text {
		transition: color 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		text-shadow: 
			0 0 10px rgba(0, 0, 0, 0.8),
			0 2px 4px rgba(0, 0, 0, 0.6),
			0 1px 2px rgba(0, 0, 0, 0.9);
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
