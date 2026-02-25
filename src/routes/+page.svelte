<script>
	// Library Imports
	import { base } from "$app/paths";
	import { fade } from "svelte/transition";
	import { onMount, tick } from "svelte";

	// Import components
	import HeroSection from "$lib/components/HeroSection.svelte";
	import SocialBubbles from "$lib/components/SocialBubbles.svelte";
	import ProjectsSection from "$lib/components/ProjectsSection.svelte";
	import BiographicalSection from "$lib/components/BiographicalSection.svelte";

	// 🚀 Ta zmienna przychodzi z load()
	export let data; // SvelteKit domyślnie przekazuje `data` z load()

	// Ensure portfolioData exists, otherwise default to empty objects to prevent crashes
	const portfolioData = data?.portfolioData || {
		musicProjects: [],
		programmingProjects: [],
	};

	// Lazy Loading State
	let ThreeComponent;
	let AudioControlsComponent;
	let sceneReady = false;
	let threeSceneInstance;

	// Project data
	let musicProjects = [];
	let programmingProjects = [];

	// Scroll tracking for text animation
	let scrollY = 0;
	let innerHeight = 0;
	let innerWidth = 0;

	// Background brightness detection for text readability
	let backgroundBrightness = 0.5; // Default middle brightness
	let adaptiveTextClass = "text-white";
	let adaptiveSubTextClass = "text-gray-300";

	// Breakpoint for bio visibility
	$: showBio = innerWidth >= 1200;

	// Handle brightness updates from ThreeScene
	function handleBrightnessChange(event) {
		backgroundBrightness = event.detail;

		// Update text classes based on brightness
		if (backgroundBrightness > 0.6) {
			// Bright background - use dark text
			adaptiveTextClass = "text-gray-900";
			adaptiveSubTextClass = "text-gray-700";
		} else if (backgroundBrightness > 0.4) {
			// Medium background - use high contrast
			adaptiveTextClass = "text-white";
			adaptiveSubTextClass = "text-gray-200";
		} else {
			// Dark background - use light text
			adaptiveTextClass = "text-white";
			adaptiveSubTextClass = "text-gray-300";
		}
	}

	// Audio state tracking
	let isAudioEnabled = false;
	let immersiveMode = false;

	onMount(async () => {
		// Wait for DOM to be ready
		await tick();
		// ✅ portfolioData już jest z `load()`, nie fetchuj go ponownie
		if (portfolioData) {
			musicProjects = portfolioData.musicProjects;
			programmingProjects = portfolioData.programmingProjects;

			console.log("Portfolio data loaded:", {
				musicProjects: musicProjects.length,
				programmingProjects: programmingProjects.length,
			});
		} else {
			console.error("Brak danych portfolio");
		}

		// Optimize TBT: Wait for browser to be idle before importing heavy 3D component
		const loadComponent = async () => {
			const [threeModule, audioControlsModule] = await Promise.all([
				import("$lib/components/ThreeScene.svelte"),
				import("$lib/components/AudioControls.svelte")
			]);
			ThreeComponent = threeModule.default;
			AudioControlsComponent = audioControlsModule.default;
		};

		if ("requestIdleCallback" in window) {
			requestIdleCallback(loadComponent, { timeout: 3000 });
		} else {
			setTimeout(loadComponent, 2000);
		}

		const onKey = (event) => {
			if (event.key.toLowerCase() === "m") {
				toggleImmersiveMode();
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	});

	const handleAudioReq = () => {
		isAudioEnabled = true;
	};

	const toggleImmersiveMode = async () => {
		immersiveMode = !immersiveMode;
		document.body.classList.toggle("immersive-mode", immersiveMode);
		if (immersiveMode && document.fullscreenEnabled && !document.fullscreenElement) {
			try {
				await document.documentElement.requestFullscreen();
			} catch (e) {
				// Ignore fullscreen errors; keep immersive style mode.
			}
		}
	};

</script>

<svelte:head>
	<title>Paweł Knorps - Composer Guitarist Portfolio</title>
	<meta
		name="description"
		content="Portfolio of Paweł Knorps, a composer, guitarist, bassist, producer."
	/>
	<link rel="canonical" href="https://pawelknorps.github.io/" />

	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://pawelknorps.github.io/" />
	<meta
		property="og:title"
		content="Paweł Knorps - Composer Guitarist Portfolio"
	/>
	<meta
		property="og:description"
		content="Portfolio of Paweł Knorps, a composer, guitarist, bassist, producer."
	/>
	<meta
		property="og:image"
		content="https://pawelknorps.github.io/my-photo2.webp"
	/>

	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content="https://pawelknorps.github.io/" />
	<meta
		property="twitter:title"
		content="Paweł Knorps - Composer Guitarist Portfolio"
	/>
	<meta
		property="twitter:description"
		content="Portfolio of Paweł Knorps, a composer, guitarist, bassist, producer."
	/>
	<meta
		property="twitter:image"
		content="https://pawelknorps.github.io/my-photo2.webp"
	/>
	<meta name="robots" content="max-image-preview:large" />
	<meta
		property="og:image"
		content="https://pawelknorps.github.io/my-photo.webp"
	/>
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="1200" />
	<meta property="og:type" content="profile" />

	<script type="application/ld+json">
		{
			"@context": "https://schema.org",
			"@type": "MusicGroup",
			"name": "Paweł Knorps",
			"url": "https://pawelknorps.github.io/",
			"image": "https://pawelknorps.github.io/my-photo.webp",
			"description": "Portfolio of Paweł Knorps, a composer, guitarist, bassist, producer.",
			"jobTitle": ["Composer", "Guitarist", "Bassist", "Producer"],
			"sameAs": [
				"https://www.instagram.com/pawelknorps",
				"https://www.facebook.com/pawelknorps",
				"https://soundcloud.com/pawelknorps",
				"https://www.youtube.com/@pawelknorps"
			]
		}
	</script>
</svelte:head>

<svelte:window bind:scrollY bind:innerHeight bind:innerWidth />

<!-- Scene Container for LCP and CLS optimization -->
<div class="scene-container fixed top-0 left-0 w-full h-full z-0">
	<div class="atmosphere-layer"></div>
	<div class="grain-layer"></div>
	{#if !sceneReady}
		<img
			src="{base}/scene-poster.webp"
			alt="3D Scene Preview"
			class="poster absolute inset-0 w-full h-full object-cover z-10"
			out:fade={{ duration: 1000 }}
		/>
		<!-- Fallback gradient if image fails or while loading -->
		<div
			class="absolute inset-0 w-full h-full gradient-placeholder -z-10"
		></div>
	{/if}

	{#if ThreeComponent}
		<svelte:component
			this={ThreeComponent}
			bind:this={threeSceneInstance}
			{musicProjects}
			{programmingProjects}
			bind:sceneReady
			on:brightnessChange={handleBrightnessChange}
			on:audioReq={handleAudioReq}
		/>
	{/if}
</div>

<!-- Simple audio enable notice - top center -->
{#if sceneReady && !isAudioEnabled}
	<div
		class="audio-notice fixed top-16 left-1/2 transform -translate-x-1/2 z-50 bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm border border-white/20 transition-all duration-300"
	>
		touch the sphere for audio
	</div>
{/if}

{#if AudioControlsComponent && !immersiveMode}
	<svelte:component this={AudioControlsComponent} />
{/if}
{#if !immersiveMode}
	<SocialBubbles />
{/if}

<button
	type="button"
	class="immersive-toggle fixed bottom-4 left-4 z-50"
	on:click={toggleImmersiveMode}
>
	{immersiveMode ? "Exit Performance" : "Performance Mode"}
</button>

<!-- Seamless flowing content -->
<div class="seamless-flow" class:immersive-active={immersiveMode}>
	<HeroSection {adaptiveTextClass} />
	<!-- Projects naturally flowing from bottom of page with biographical text -->
	<div class="projects-flow relative w-full px-4 md:px-8 xl:px-16 2xl:px-24 content-visibility-auto">
		<!-- Centered column on mobile, row on xl+ -->
		<div
			class="flex flex-col items-center xl:items-start xl:flex-row gap-16 2xl:gap-24"
		>
			<!-- Left side - Projects -->
			<div
				class="projects-container w-full max-w-full xl:max-w-none xl:w-1/2"
			>
				<ProjectsSection
					{musicProjects}
					{programmingProjects}
					{adaptiveTextClass}
					{adaptiveSubTextClass}
					triggerLoad={sceneReady}
					on:projectFocus={(e) => {
						console.log("Page received projectFocus:", e.detail.id);
						if (threeSceneInstance)
							threeSceneInstance.focusProject(e.detail.id);
					}}
				/>
			</div>

			<!-- Right side - Biographical text -->
			{#if showBio}
				<div
					class="w-full max-w-3xl xl:max-w-none xl:w-1/2 2xl:w-2/3 mt-12 xl:mt-0"
				>
					<BiographicalSection
						{scrollY}
						{innerHeight}
						{adaptiveTextClass}
						{adaptiveSubTextClass}
					/>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	/* Seamless flow container */
	.seamless-flow {
		background: transparent;
		position: relative;
		z-index: 10; /* Higher z-index for content */
		pointer-events: none; /* Allow clicks to pass through to canvas */
	}
	.seamless-flow.immersive-active {
		opacity: 0.24;
		transition: opacity 300ms ease;
	}

	/* Projects flow seamlessly */
	.projects-flow {
		background: transparent;
		position: relative;
		z-index: 15;
		pointer-events: none; /* Re-enable pointer events for content */
	}

	/* Simple audio notice */
	.audio-notice {
		animation: gentlePulse 2s ease-in-out infinite;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
	.immersive-toggle {
		padding: 0.45rem 0.8rem;
		border-radius: 999px;
		border: 1px solid rgba(255, 255, 255, 0.25);
		background: rgba(0, 0, 0, 0.55);
		backdrop-filter: blur(8px);
		font-size: 0.68rem;
		letter-spacing: 0.09em;
		text-transform: uppercase;
		color: white;
		pointer-events: auto;
	}

	@keyframes gentlePulse {
		0%,
		100% {
			opacity: 0.9;
		}
		50% {
			opacity: 1;
		}
	}

	/* Large screen adjustments */
	@media (min-width: 1280px) {
		.projects-container {
			padding-right: 2rem;
		}
	}

	@media (max-width: 900px) {
		.audio-notice {
			top: 1.5rem;
			font-size: 0.68rem;
			padding: 0.45rem 0.7rem;
		}
		.projects-flow {
			padding-left: 0.9rem;
			padding-right: 0.9rem;
		}
	}

	/* Text selection styling */
	::selection {
		background-color: #ff0080;
		color: white;
	}
	.gradient-placeholder {
		background: linear-gradient(-45deg, #0f0f0f, #1a1a1a, #2a2a2a, #3a3a3a);
		background-size: 400% 400%;
		animation: gradient-animation 15s ease infinite;
	}

	.atmosphere-layer {
		position: absolute;
		inset: 0;
		background:
			radial-gradient(circle at 20% 20%, rgba(255, 0, 128, 0.2), transparent 50%),
			radial-gradient(circle at 80% 35%, rgba(0, 183, 255, 0.16), transparent 45%),
			radial-gradient(circle at 50% 85%, rgba(255, 140, 0, 0.14), transparent 52%);
		filter: blur(20px);
		animation: atmosphere-drift 18s ease-in-out infinite alternate;
		z-index: 2;
		pointer-events: none;
	}

	.grain-layer {
		position: absolute;
		inset: 0;
		opacity: 0.1;
		background-image:
			radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.2) 1px, transparent 0);
		background-size: 3px 3px;
		mix-blend-mode: soft-light;
		z-index: 3;
		pointer-events: none;
	}

	@keyframes atmosphere-drift {
		0% {
			transform: translate3d(-2%, -1%, 0) scale(1);
		}
		100% {
			transform: translate3d(2%, 1%, 0) scale(1.06);
		}
	}

	@keyframes gradient-animation {
		0% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
		100% {
			background-position: 0% 50%;
		}
	}

	/* Remove any visual separations */
	* {
		border: none;
		outline: none;
	}
</style>
