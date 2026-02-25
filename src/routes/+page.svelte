<svelte:head>
    <title>Paweł Knorps - Composer Guitarist Portfolio</title>
    <meta name="description" content="Portfolio of Paweł Knorps, a composer, guitarist, basist, producer." />
    <link rel="canonical" href="https://pawelknorps.github.io/" />

    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://pawelknorps.github.io/" />
    <meta property="og:title" content="Paweł Knorps - Composer Guitarist Portfolio" />
    <meta property="og:description" content="Portfolio of Paweł Knorps, a composer, guitarist, basist, producer." />
    <meta property="og:image" content="https://pawelknorps.github.io/og-image.png" />

    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="https://pawelknorps.github.io/" />
    <meta property="twitter:title" content="Paweł Knorps - Composer Guitarist Portfolio" />
    <meta property="twitter:description" content="Portfolio of Paweł Knorps, a composer, guitarist, basist, producer." />
    <meta property="twitter:image" content="https://pawelknorps.github.io/og-image.png" />
</svelte:head>
<script>
	// Library Imports
	import { setScene, updateProjects, setBioProjectionEnabled, setProjectOpenHandler, setProjectedVideo, clearProjectedVideo, destroyScene } from '$lib/ThreeObject.js';
	import { onMount, onDestroy, tick } from 'svelte';
	
	// Import components
	import HeroSection from '$lib/components/HeroSection.svelte';
	import SocialBubbles from '$lib/components/SocialBubbles.svelte';
	import AudioControls from '$lib/components/AudioControls.svelte';
	import ProjectsSection from '$lib/components/ProjectsSection.svelte';
	import BiographicalSection from '$lib/components/BiographicalSection.svelte';
	import ProjectMediaOverlay from '$lib/components/ProjectMediaOverlay.svelte';
	import { resolveProjectMedia } from '$lib/utils/projectMedia.js';
	import { audioSystem } from '$lib/AudioSystem.js';
	

	// 🚀 Ta zmienna przychodzi z load()
	export let data; // SvelteKit domyślnie przekazuje `data` z load()
	const portfolioData = data.portfolioData;

	// Create a new wavy sphere scene
	let ThreeObject;
	let sceneInitialized = false;
	let sceneReady = false; // New state to track if the scene is loaded
	// Project data
	let personalData = {};
	let musicProjects = [];
	let programmingProjects = [];

	// Scroll tracking for text animation
	let scrollY = 0;
	let innerHeight = 0;
	let innerWidth = 0;
	
	// Background brightness detection for text readability
	let backgroundBrightness = 0.5; // Default middle brightness
	let adaptiveTextClass = 'text-white';
	let adaptiveSubTextClass = 'text-gray-300';

	let bioFocusEnabled = false;
	let activeMedia = null;
	let speechVoices = [];
	let selectedNarrationVoice = null;
	$: showBio = innerWidth >= 1300;
	$: projectsHeight = 0;

	const BIO_NARRATION_TEXT = `Paweł Knorps to artysta poruszający się między tradycją a eksploracją, oddany dźwiękowi jako sile przekraczającej granice. Absolwent gitary jazzowej poznańskiej Akademii Muzycznej oraz kompozycji jazzowej na Danish National Academy of Music w Odense. 
	Jego muzyczna podróż skupia się wokół improwizacji, nie tylko na gitarze, ale również jako basista, producent i kompozytor. Poszukuje przestrzeni wolności, gdzie intuicja spotyka się z ryzykiem, a dźwięk staje się narracją.
	Jego zespół Pawel Knorps Group, tworzony z wybitnymi poznańskimi muzykami, zdobył uznanie w finale Blue Note Competition 2024.
	Jego alter ego, enthymeme, to świat elektronicznej improwizacji, w którym technologia spotyka się z ludzkim dotykiem.
	Dziś po powrocie z Danii zasila wiele poznańskich projektów, od Milomi i SNY, przez Przesilenie i GānāVānā, po Aktas Erdogan Trio.
	Każda z tych formacji jest przejawem niezaspokojonej ciekawości w poszukiwaniu własnej ekspresji.`;

	const syncSceneFocus = () => {
		setBioProjectionEnabled(bioFocusEnabled || !!activeMedia);
	};

	const openProjectMedia = (project) => {
		const media = resolveProjectMedia(project);
		const url = media.url;
		if (!url || url === '#' || media.provider !== 'youtube') return false;

		// Real sphere projection requires direct video files (mp4/webm/ogg).
		// YouTube URLs can only be shown in iframe fallback unless pipeline provides projectionVideo.
		if (media.projectionVideo) {
			setProjectedVideo(media.projectionVideo);
			activeMedia = null;
			syncSceneFocus();
			return true;
		}

		activeMedia = {
			title: project.title || 'Project media',
			subtitle: project.type || project.year || media.provider || 'media',
			url,
			kind: media.kind,
			embedSrc: media.embedSrc,
			allow: media.allow
		};
		syncSceneFocus();
		return true;
	};

	const closeProjectMedia = () => {
		activeMedia = null;
		clearProjectedVideo();
		syncSceneFocus();
	};

	const setupNarrationVoice = () => {
		if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
		speechVoices = window.speechSynthesis.getVoices();
		if (speechVoices.length === 0) return;
		selectedNarrationVoice =
			speechVoices.find((voice) => voice.lang?.toLowerCase().startsWith('pl')) ||
			speechVoices.find((voice) => voice.lang?.toLowerCase().startsWith('en')) ||
			speechVoices[0];
	};

	const stopBioNarration = () => {
		if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
		window.speechSynthesis.cancel();
		audioSystem.clearNarrationPulses?.();
	};

	const startBioNarration = async () => {
		if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
		if (!audioSystem.isInitialized) {
			await audioSystem.init();
		}
		stopBioNarration();
		const utterance = new SpeechSynthesisUtterance(BIO_NARRATION_TEXT);
		utterance.rate = 0.95;
		utterance.pitch = 0.96;
		utterance.volume = 0.62;
		utterance.lang = selectedNarrationVoice?.lang || 'pl-PL';
		if (selectedNarrationVoice) {
			utterance.voice = selectedNarrationVoice;
		}
		utterance.onboundary = (event) => {
			audioSystem.emitNarrationPulse?.(event.charIndex, BIO_NARRATION_TEXT.length, event.name);
		};
		utterance.onend = () => {
			audioSystem.clearNarrationPulses?.();
		};
		utterance.onerror = () => {
			audioSystem.clearNarrationPulses?.();
		};
		window.speechSynthesis.speak(utterance);
	};
	
	// Function to sample canvas brightness
	function sampleCanvasBrightness() {
		if (!ThreeObject || !sceneInitialized) return;
		
		try {
			const canvas = ThreeObject;
			const ctx = canvas.getContext('2d', { willReadFrequently: true });
			if (!ctx) return;
			
			// Sample multiple points across the canvas
			const samplePoints = [
				{ x: canvas.width * 0.2, y: canvas.height * 0.3 },
				{ x: canvas.width * 0.5, y: canvas.height * 0.5 },
				{ x: canvas.width * 0.8, y: canvas.height * 0.7 },
				{ x: canvas.width * 0.3, y: canvas.height * 0.8 },
				{ x: canvas.width * 0.7, y: canvas.height * 0.2 }
			];
			
			let totalBrightness = 0;
			let validSamples = 0;
			
			samplePoints.forEach(point => {
				try {
					const imageData = ctx.getImageData(point.x, point.y, 1, 1);
					const [r, g, b] = imageData.data;
					// Calculate relative luminance
					const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
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
					adaptiveTextClass = 'text-gray-900';
					adaptiveSubTextClass = 'text-gray-700';
					
				} else if (backgroundBrightness > 0.4) {
					// Medium background - use high contrast
					adaptiveTextClass = 'text-white';
					adaptiveSubTextClass = 'text-gray-200';
				} else {
					// Dark background - use light text
					adaptiveTextClass = 'text-white';
					adaptiveSubTextClass = 'text-gray-300';
					
				}
			}
		} catch (error) {
			// Fallback to default colors
			adaptiveTextClass = 'text-white';
			adaptiveSubTextClass = 'text-gray-300';
		}
	}
	
	// Initialize the 3D scene
	const initializeScene = async () => {
		if (!ThreeObject || sceneInitialized) return;
		
		try {
			console.log('Initializing 3D scene...');
			
			// Ensure canvas is properly sized
			ThreeObject.width = window.innerWidth;
			ThreeObject.height = window.innerHeight;
			
				// Initialize the scene
				await setScene(ThreeObject);
				sceneInitialized = true;
				sceneReady = true;
				
				console.log('Scene initialized successfully');
			
			// Update projects if data is available
			if (musicProjects.length > 0 || programmingProjects.length > 0) {
				updateProjects(musicProjects, programmingProjects);
				console.log('Projects updated');
			}
			
			// Start brightness sampling
			let frameCount = 0;

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

			startBrightnessSampling();

			return () => {
				stopBrightnessSampling();
			};
			

		} catch (error) {
			console.error('Failed to initialize scene:', error);
		}
	};

	// Audio state tracking
	let isAudioEnabled = false;

	// Sample brightness periodically
	let brightnessInterval;
	
	onMount(async () => {
		// Wait for DOM to be ready
		await tick();
		
        // ✅ portfolioData już jest z `load()`, nie fetchuj go ponownie
		if (portfolioData) {
			personalData = portfolioData.personal ?? {};
			musicProjects = Array.isArray(portfolioData.musicProjects) ? portfolioData.musicProjects : [];
			programmingProjects = Array.isArray(portfolioData.programmingProjects) ? portfolioData.programmingProjects : [];
			
			console.log('Portfolio data loaded:', {
				personal: !!personalData,
				musicProjects: musicProjects.length,
				programmingProjects: programmingProjects.length
			});
		} else {
			console.error('Brak danych portfolio');
		}
		
		// Wait a bit more for canvas to be available
		setTimeout(async () => {
			if (ThreeObject) {
				await initializeScene();
			} else {
				console.error('Canvas element not available');
			}
		}, 100);

		setProjectOpenHandler((project) => openProjectMedia(project));
		setupNarrationVoice();
		if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
			window.speechSynthesis.onvoiceschanged = setupNarrationVoice;
		}
		
			// Cleanup function
			return () => {
				if (brightnessInterval) {
					cancelAnimationFrame(brightnessInterval);
				}
				stopBioNarration();
			};
    });

	onDestroy(() => {
		if (brightnessInterval) {
			cancelAnimationFrame(brightnessInterval);
			brightnessInterval = null;
		}
		stopBioNarration();
		destroyScene();
	});
		
	// Add a manual initialization trigger for debugging
	const handleCanvasClick = () => {
		if (!sceneInitialized) {
			console.log('Manual scene initialization triggered');
			initializeScene();
		}
		// Audio will be initialized automatically in ThreeObject.js onMouseDown
		isAudioEnabled = true;
	};

	const handleToggleBioFocus = () => {
		bioFocusEnabled = !bioFocusEnabled;
		if (bioFocusEnabled) {
			void startBioNarration();
		} else {
			stopBioNarration();
		}
		if (!bioFocusEnabled) {
			clearProjectedVideo();
			activeMedia = null;
		}
		syncSceneFocus();
	};

	const handleToggleBioProjection = () => {
		bioFocusEnabled = !bioFocusEnabled;
		syncSceneFocus();
	};

</script>

<svelte:window bind:scrollY bind:innerHeight bind:innerWidth />
{#if !sceneReady}
		<div class="fixed top-0 left-0 w-full h-full gradient-placeholder z-0"></div> 
	{/if}

	<canvas  
			bind:this={ThreeObject}  
			on:click={handleCanvasClick}
			class="fixed top-0 left-0 w-full h-full cursor-grab transition-opacity duration-1000"
		style:opacity={sceneReady ? 1 : 0} 
		style:pointer-events={sceneReady ? 'auto' : 'none'} 
		style:z-index={0}
	></canvas>
<!-- Simple audio enable notice - top center -->
{#if sceneInitialized && !isAudioEnabled}
<div class="audio-notice fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm border border-white/20 transition-all duration-300">
		 touch the sphere for audio
</div>
{/if}

<SocialBubbles />
<AudioControls />

<!-- Seamless flowing content -->
<div class="seamless-flow">
	<HeroSection 
		{personalData} 
		{adaptiveTextClass} 
		{bioFocusEnabled}
		on:toggleBioFocus={handleToggleBioFocus}
	/>
<!-- Projects naturally flowing from bottom of page with biographical text -->
		<div class="projects-flow relative px-4 sm:px-6 md:px-8 xl:px-16 2xl:px-24">
		<div class="flex flex-col items-center xl:items-start xl:flex-row gap-16 2xl:gap-24">
			
			<!-- Left side - Projects -->
			<div
			class="projects-container w-full max-w-3xl xl:max-w-none xl:w-1/2"
			bind:clientHeight={projectsHeight}
			>
			<ProjectsSection 
				{musicProjects}
			{programmingProjects}
			{adaptiveTextClass}
			{adaptiveSubTextClass}
			on:openProjectMedia={(event) => openProjectMedia(event.detail)}
			/>
			</div>

			{#if showBio}
			<div class="w-full max-w-3xl xl:max-w-none xl:w-1/2 2xl:w-2/3 mt-12 xl:mt-0">
				<BiographicalSection
					{scrollY}
					{innerHeight}
					{adaptiveSubTextClass}
					bioProjectionEnabled={bioFocusEnabled}
					on:toggleBioProjection={handleToggleBioProjection}
				/>
			</div>
			{/if}
		</div>
		</div>
		</div>

<ProjectMediaOverlay media={activeMedia} onClose={closeProjectMedia} />


<!-- Debug info (remove in production) -->
<!-- {#if !sceneInitialized}
<div class="fixed bottom-4 left-4 z-50 bg-red-900/70 text-white px-3 py-2 rounded-lg text-sm backdrop-blur-sm">
	⚠️ Scene not initialized - click canvas to retry
</div>
{/if} -->

<style>
	/* Smooth scrolling */
	:global(html) {
		scroll-behavior: smooth;
	}

	/* Seamless flow container */
	.seamless-flow {
		background: transparent;
		position: relative;
		z-index: 10; /* Higher z-index for content */
		pointer-events: none;
	}

	/* Projects flow seamlessly */
	.projects-flow {
		background: transparent;
		position: relative;
		z-index: 15;
		pointer-events: none;
	}

	.projects-container {
		pointer-events: auto;
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
		0%, 100% { opacity: 0.9; }
		50% { opacity: 1; }
	}

	/* Responsive adjustments for mobile */
	@media (max-width: 800px) {
		.projects-container {
			padding: 0 1rem;
		}
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
		background-color: #FF0080;
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
