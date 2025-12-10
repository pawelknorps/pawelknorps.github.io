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
	import AudioControls from "$lib/components/AudioControls.svelte";

	// Import audio system
	import { audioSystem } from "$lib/AudioSystem.js";

	// 🚀 Ta zmienna przychodzi z load()
	export let data; // SvelteKit domyślnie przekazuje `data` z load()

	// Ensure portfolioData exists, otherwise default to empty objects to prevent crashes
	const portfolioData = data?.portfolioData || {
		musicProjects: [],
		programmingProjects: [],
	};

	// Lazy Loading State
	let ThreeComponent;
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
	$: showBio = innerWidth >= 1300; // Show bio only on xl screens and larger
	$: projectsHeight = 0;

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
	let showVideo = false; // State for "STAN WODY" video background
	let videoElement; // Reference to the video element

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
			const module = await import("$lib/components/ThreeScene.svelte");
			ThreeComponent = module.default;
		};

		if ("requestIdleCallback" in window) {
			requestIdleCallback(loadComponent, { timeout: 3000 });
		} else {
			setTimeout(loadComponent, 2000);
		}
	});

	const handleAudioReq = () => {
		isAudioEnabled = true;
	};

	const toggleVideo = () => {
		isAudioEnabled = true;

		if (showVideo && videoElement) {
			videoElement.pause();
		}

		showVideo = !showVideo;
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
{#if sceneReady && !isAudioEnabled && !showVideo}
	<div
		class="audio-notice fixed top-16 left-1/2 transform -translate-x-1/2 z-50 bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm border border-white/20 transition-all duration-300"
	>
		touch the sphere for audio
	</div>
{/if}

<AudioControls />
<SocialBubbles />

<!-- Seamless flowing content -->
<div class="seamless-flow">
	<HeroSection {adaptiveTextClass} {adaptiveSubTextClass} />
	<!-- Projects naturally flowing from bottom of page with biographical text -->
	<div
		class="projects-flow relative w-full px-4 md:px-8 xl:px-16 2xl:px-24 content-visibility-auto"
	>
		<!-- Centered column on mobile, row on xl+ -->
		<div
			class="flex flex-col items-center xl:items-start xl:flex-row gap-16 2xl:gap-24"
		>
			<!-- Left side - Projects -->
			<div
				class="projects-container w-full max-w-full xl:max-w-none xl:w-1/2"
				bind:clientHeight={projectsHeight}
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
						{projectsHeight}
						{adaptiveTextClass}
						{adaptiveSubTextClass}
					/>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	/* Smooth scrolling */
	html {
		scroll-behavior: smooth;
	}

	/* Seamless flow container */
	.seamless-flow {
		background: transparent;
		position: relative;
		z-index: 10; /* Higher z-index for content */
		pointer-events: none; /* Allow clicks to pass through to canvas */
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
