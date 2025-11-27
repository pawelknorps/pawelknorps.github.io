<script>
	// Library Imports
	import { base } from "$app/paths";
	import {
		setScene,
		updateProjects,
		setAudioSystem,
		focusProject,
	} from "$lib/ThreeObject.js";
	import { fade } from "svelte/transition";
	import { onMount, tick } from "svelte";
	import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

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

	// Create a new wavy sphere scene
	let ThreeObject;
	let sceneInitialized = false;
	let sceneReady = false; // New state to track if the scene is loaded
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

	// Function to sample canvas brightness
	function sampleCanvasBrightness() {
		if (!ThreeObject || !sceneInitialized) return;

		try {
			const canvas = ThreeObject;
			const ctx = canvas.getContext("2d", { willReadFrequently: true });
			if (!ctx) return;

			// Sample multiple points across the canvas
			const samplePoints = [
				{ x: canvas.width * 0.2, y: canvas.height * 0.3 },
				{ x: canvas.width * 0.5, y: canvas.height * 0.5 },
				{ x: canvas.width * 0.8, y: canvas.height * 0.7 },
				{ x: canvas.width * 0.3, y: canvas.height * 0.8 },
				{ x: canvas.width * 0.7, y: canvas.height * 0.2 },
			];

			let totalBrightness = 0;
			let validSamples = 0;

			samplePoints.forEach((point) => {
				try {
					const imageData = ctx.getImageData(point.x, point.y, 1, 1);
					const [r, g, b] = imageData.data;
					// Calculate relative luminance
					const brightness =
						(0.299 * r + 0.587 * g + 0.114 * b) / 255;
					totalBrightness += brightness;
					validSamples++;
				} catch (e) {
					// Skip invalid samples
				}
			});

			if (validSamples > 0) {
				backgroundBrightness = totalBrightness / validSamples;

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
		} catch (error) {
			// Fallback to default colors
			adaptiveTextClass = "text-white";
			adaptiveSubTextClass = "text-gray-300";
		}
	}

	// Initialize the 3D scene
	const initializeScene = async () => {
		if (!ThreeObject || sceneInitialized) return;

		try {
			console.log("Initializing 3D scene...");

			// Ensure canvas is properly sized
			ThreeObject.width = window.innerWidth;
			ThreeObject.height = window.innerHeight;

			// Initialize the scene
			await setScene(ThreeObject);
			sceneInitialized = true;
			sceneReady = true; // Make sure this is set to true!

			console.log("Scene initialized successfully");

			// Update projects if data is available
			if (musicProjects.length > 0 || programmingProjects.length > 0) {
				updateProjects(musicProjects, programmingProjects);
				console.log("Projects updated");
			}

			// Start brightness sampling
			// In your page.svelte script

			let frameCount = 0;
			let brightnessInterval; // We'll keep this name for the handle

			function startBrightnessSampling() {
				function sampleLoop() {
					// Only sample every 10 frames to save CPU
					if (frameCount % 10 === 0) {
						sampleCanvasBrightness();
					}
					frameCount++;
					brightnessInterval = requestAnimationFrame(sampleLoop);
				}
				sampleLoop();
			}

			function stopBrightnessSampling() {
				cancelAnimationFrame(brightnessInterval);
			}

			// In loadAndInitializeScene() function, replace setInterval:
			// brightnessInterval = setInterval(sampleCanvasBrightness, 200); // <-- REMOVE
			startBrightnessSampling(); // <-- ADD

			// In your onMount's return function (cleanup):
			return () => {
				stopBrightnessSampling();
			};
		} catch (error) {
			console.error("Failed to initialize scene:", error);
		}
	};

	// Audio state tracking
	let isAudioEnabled = false;
	let showVideo = false; // State for "STAN WODY" video background
	let videoElement; // Reference to the video element

	// Sample brightness periodically
	let brightnessInterval;

	// Reactive statement removed to avoid conflicts with transition events

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

		// Wait a bit more for canvas to be available
		setTimeout(async () => {
			if (ThreeObject) {
				await initializeScene();
			} else {
				console.error("Canvas element not available");
			}
		}, 100);

		// Cleanup function
		return () => {
			if (brightnessInterval) {
				clearInterval(brightnessInterval);
			}
		};
	});

	// Add a manual initialization trigger for debugging
	const handleCanvasClick = () => {
		if (!sceneInitialized) {
			console.log("Manual scene initialization triggered");
			initializeScene();
		}
		// Audio will be initialized automatically in ThreeObject.js onMouseDown
		isAudioEnabled = true;
	};

	const toggleVideo = () => {
		// Ensure audio is initialized when entering "STAN WODY" mode
		if (!sceneInitialized) {
			initializeScene();
		}
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

<!--
{#if showVideo}
	<video
		bind:this={videoElement}
		src="{base}/demo.mp4"
		loop
		muted={false}
		playsinline
		transition:fade={{ duration: 1000 }}
		on:introstart={(e) => e.target.play().catch((err) => console.error("Video play failed:", err))}
		on:outrostart={(e) => e.target.pause()}
		class="fixed top-0 left-0 w-full h-full object-cover z-0"
	></video>
{/if}
-->

{#if !sceneReady}
	<div
		class="fixed top-0 left-0 w-full h-full gradient-placeholder z-0"
	></div>
{/if}

<canvas
	bind:this={ThreeObject}
	on:click={handleCanvasClick}
	class="fixed top-0 left-0 w-full h-full cursor-grab transition-opacity duration-1000"
	style:opacity={sceneReady && !showVideo ? 1 : 0}
	style:pointer-events={sceneReady && !showVideo ? "auto" : "none"}
	style:z-index={0}
></canvas>

<!-- STAN WODY Button -->
<!--
<button
	on:click={toggleVideo}
	class="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 text-white font-black tracking-[0.2em] text-sm md:text-base mix-blend-difference hover:text-[#FF0080] transition-colors duration-300 cursor-pointer"
	style="font-family: 'Inter', sans-serif;"
>
	STAN WODY
</button>
-->

<!-- Simple audio enable notice - top center -->
{#if sceneInitialized && !isAudioEnabled && !showVideo}
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
	<div class="projects-flow relative w-full px-4 md:px-8 xl:px-16 2xl:px-24">
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
					on:projectFocus={(e) => {
						console.log("Page received projectFocus:", e.detail.id);
						focusProject(e.detail.id);
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

<!-- Debug info (remove in production) -->
<!-- {#if !sceneInitialized}
<div class="fixed bottom-4 left-4 z-50 bg-red-900/70 text-white px-3 py-2 rounded-lg text-sm backdrop-blur-sm">
	⚠️ Scene not initialized - click canvas to retry
</div>
{/if} -->

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

	/* By default, let Three.js control all gestures */
	canvas {
		touch-action: none;
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

	/* Responsive adjustments for mobile */
	@media (max-width: 800px) {
		canvas {
			touch-action: pan-y;
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
