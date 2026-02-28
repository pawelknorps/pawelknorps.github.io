<svelte:head>
    <title>{SITE_TITLE}</title>
    <meta name="description" content={SITE_DESCRIPTION} />
    <link rel="canonical" href={SITE_URL + '/'} />

    <meta property="og:type" content="website" />
    <meta property="og:url" content={SITE_URL + '/'} />
    <meta property="og:title" content={SITE_TITLE} />
    <meta property="og:description" content={SITE_DESCRIPTION} />
    <meta property="og:image" content={SITE_OG_IMAGE} />
    <meta property="og:site_name" content={SITE_NAME} />

    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content={SITE_URL + '/'} />
    <meta property="twitter:title" content={SITE_TITLE} />
    <meta property="twitter:description" content={SITE_DESCRIPTION} />
    <meta property="twitter:image" content={SITE_OG_IMAGE} />
    <script type="application/ld+json">{personJsonLd}</script>
    <script type="application/ld+json">{projectsJsonLd}</script>
</svelte:head>
<script>
	import { onMount, onDestroy, tick } from 'svelte';
	import { env as publicEnv } from '$env/dynamic/public';
	
	// Import components
	import HeroSection from '$lib/components/HeroSection.svelte';
	import SocialBubbles from '$lib/components/SocialBubbles.svelte';
	import ProjectsSection from '$lib/components/ProjectsSection.svelte';
	import BiographicalSection from '$lib/components/BiographicalSection.svelte';
	import ProjectMediaOverlay from '$lib/components/ProjectMediaOverlay.svelte';
	import { resolveProjectMedia } from '$lib/utils/projectMedia.js';
	import { audioSystem } from '$lib/AudioSystem.js';
	import { SITE_DESCRIPTION, SITE_NAME, SITE_OG_IMAGE, SITE_TITLE, SITE_URL } from '$lib/config/site.js';
	const PUBLIC_TURNSTILE_SITE_KEY = publicEnv.PUBLIC_TURNSTILE_SITE_KEY || '';
	

	// 🚀 Ta zmienna przychodzi z load()
	export let data; // SvelteKit domyślnie przekazuje `data` z load()
	const portfolioData = data.portfolioData;

	// Create a new wavy sphere scene
	let ThreeObject;
	let sceneInitialized = false;
	let sceneReady = false; // New state to track if the scene is loaded
	let immersiveApi = null;
	const noOp = () => {};
	const getImmersiveApi = () =>
		immersiveApi || {
			setScene: async () => {},
			updateProjects: noOp,
			setCanvasSubtitles: noOp,
			setBioProjectionEnabled: noOp,
			setProjectOpenHandler: noOp,
			setProjectedVideo: noOp,
			setProjectedMediaStream: async () => false,
			clearProjectedVideo: noOp,
			clearProjectedMediaStream: noOp,
			destroyScene: noOp
		};
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
	let projectMediaActive = false;
	let webcamEnabled = false;
	let webcamLoading = false;
	let webcamError = '';
	let speechVoices = [];
	let selectedNarrationVoice = null;
	let reducedMotion = false;
	let AudioControlsComponent = null;
	let contactFocusEnabled = false;
	let contactStatus = 'idle';
	let contactError = '';
	let turnstileToken = '';
	$: projectsHeight = 0;

	const BIO_NARRATION_TEXT = `Paweł Knorps to artysta poruszający się między tradycją a eksploracją, oddany dźwiękowi jako sile przekraczającej granice. Absolwent gitary jazzowej poznańskiej Akademii Muzycznej oraz kompozycji jazzowej na Danish National Academy of Music w Odense. 
	Jego muzyczna podróż skupia się wokół improwizacji, nie tylko na gitarze, ale również jako basista, producent i kompozytor. Poszukuje przestrzeni wolności, gdzie intuicja spotyka się z ryzykiem, a dźwięk staje się narracją.
	Jego zespół Pawel Knorps Group, tworzony z wybitnymi poznańskimi muzykami, zdobył uznanie w finale Blue Note Competition 2024.
	Jego alter ego, enthymeme, to świat elektronicznej improwizacji, w którym technologia spotyka się z ludzkim dotykiem.
	Dziś po powrocie z Danii zasila wiele poznańskich projektów, od Milomi i SNY, przez Przesilenie i GānāVānā, po Aktas Erdogan Trio.
	Każda z tych formacji jest przejawem niezaspokojonej ciekawości w poszukiwaniu własnej ekspresji.`;
	$: personJsonLd = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Person',
		name: personalData?.name || SITE_NAME,
		url: SITE_URL,
		jobTitle: personalData?.title || 'Composer, Guitarist, Producer',
		description: SITE_DESCRIPTION,
		sameAs: [
			personalData?.links?.instagram,
			personalData?.links?.youtube,
			personalData?.links?.facebook
		].filter(Boolean)
	});
	$: projectsJsonLd = JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'ItemList',
		name: `${SITE_NAME} projects`,
		itemListElement: [...musicProjects, ...programmingProjects].map((project, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			url: `${SITE_URL}${project.href || ''}`,
			name: project.title
		}))
	});

	const ensureImmersiveApi = async () => {
		if (immersiveApi) return immersiveApi;
		const module = await import('$lib/ThreeObject.js');
		immersiveApi = {
			setScene: module.setScene,
			updateProjects: module.updateProjects,
			setCanvasSubtitles: module.setCanvasSubtitles,
			setBioProjectionEnabled: module.setBioProjectionEnabled,
			setProjectOpenHandler: module.setProjectOpenHandler,
			setProjectedVideo: module.setProjectedVideo,
			setProjectedMediaStream: module.setProjectedMediaStream,
			clearProjectedVideo: module.clearProjectedVideo,
			clearProjectedMediaStream: module.clearProjectedMediaStream,
			destroyScene: module.destroyScene
		};
		return immersiveApi;
	};

	const withAutoplay = (embedSrc, enabled) => {
		if (!embedSrc) return embedSrc;
		try {
			const parsed = new URL(embedSrc);
			parsed.searchParams.set('autoplay', enabled ? '1' : '0');
			return parsed.toString();
		} catch {
			return embedSrc;
		}
	};

	const syncSceneFocus = () => {
		getImmersiveApi().setBioProjectionEnabled(bioFocusEnabled || contactFocusEnabled || !!activeMedia);
	};
	const getRoleSubtitle = () =>
		(personalData?.title && String(personalData.title).trim()) ||
		'Composer, Bassist, Producer and guitarist.';
	const syncCanvasSubtitles = () => {
		getImmersiveApi().setCanvasSubtitles({
			roleText: getRoleSubtitle(),
			musicText: '// MUSIC'
		});
	};
	const syncGenerativeSuppression = () => {
		audioSystem.setGenerativeSuppressed?.(projectMediaActive);
	};
	$: if (sceneInitialized) {
		syncSceneFocus();
		syncCanvasSubtitles();
	}

	const openProjectMedia = (project) => {
		const media = resolveProjectMedia(project);
		const url = media.url;
		if (!url || url === '#' || media.provider !== 'youtube') return false;
		projectMediaActive = true;
		syncGenerativeSuppression();

		// Webcam has precedence over project projection while enabled.
		if (webcamEnabled) {
			activeMedia = {
				title: project.title || 'Project media',
				subtitle: project.type || project.year || media.provider || 'media',
				url,
				kind: media.kind,
				embedSrc: withAutoplay(media.embedSrc, !reducedMotion),
				allow: media.allow
			};
			syncSceneFocus();
			return true;
		}

		// Real sphere projection requires direct video files (mp4/webm/ogg).
		// YouTube URLs can only be shown in iframe fallback unless pipeline provides projectionVideo.
		if (media.projectionVideo) {
			getImmersiveApi().setProjectedVideo(media.projectionVideo);
			activeMedia = null;
			syncSceneFocus();
			return true;
		}

		activeMedia = {
			title: project.title || 'Project media',
			subtitle: project.type || project.year || media.provider || 'media',
			url,
			kind: media.kind,
			embedSrc: withAutoplay(media.embedSrc, !reducedMotion),
			allow: media.allow
		};
		syncSceneFocus();
		return true;
	};

	const closeProjectMedia = () => {
		projectMediaActive = false;
		syncGenerativeSuppression();
		activeMedia = null;
		if (!webcamEnabled) {
			getImmersiveApi().clearProjectedVideo();
		}
		syncSceneFocus();
	};

	const startWebcamProjection = async () => {
		if (webcamLoading || webcamEnabled) return;
		webcamError = '';
		webcamLoading = true;
		try {
			if (typeof window === 'undefined' || typeof navigator === 'undefined') {
				throw new Error('Webcam is only available in the browser.');
			}
			if (!window.isSecureContext) {
				throw new Error('Webcam requires a secure context (HTTPS).');
			}
			if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
				throw new Error('This browser does not support webcam access.');
			}
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: 'user' },
				audio: false
			});
			await ensureImmersiveApi();
			const ok = await getImmersiveApi().setProjectedMediaStream(stream);
			if (!ok) {
				stream.getTracks().forEach((track) => track.stop());
				throw new Error('Failed to project webcam stream.');
			}
			projectMediaActive = false;
			syncGenerativeSuppression();
			activeMedia = null;
			webcamEnabled = true;
			syncSceneFocus();
		} catch (error) {
			const cameraErrorName = error?.name || '';
			if (cameraErrorName === 'NotAllowedError' || cameraErrorName === 'SecurityError') {
				webcamError = 'Camera permission denied. Please allow access and try again.';
			} else if (cameraErrorName === 'NotFoundError' || cameraErrorName === 'OverconstrainedError') {
				webcamError = 'No compatible camera found on this device.';
			} else if (cameraErrorName === 'NotReadableError') {
				webcamError = 'Camera is currently in use by another app.';
			} else {
				webcamError = error?.message || 'Could not start webcam projection.';
			}
			webcamEnabled = false;
			getImmersiveApi().clearProjectedMediaStream();
			syncSceneFocus();
		} finally {
			webcamLoading = false;
		}
	};

	const stopWebcamProjection = () => {
		getImmersiveApi().clearProjectedMediaStream();
		webcamEnabled = false;
		webcamLoading = false;
		webcamError = '';
		syncSceneFocus();
	};

	const handleToggleWebcamProjection = async () => {
		if (webcamEnabled) {
			stopWebcamProjection();
			return;
		}
		await startWebcamProjection();
	};

	const preloadAudioControls = async () => {
		if (AudioControlsComponent) return;
		try {
			const module = await import('$lib/components/AudioControls.svelte');
			AudioControlsComponent = module.default;
		} catch (error) {
			console.warn('Failed to load audio controls:', error);
		}
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
		if (reducedMotion) return;
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
				await ensureImmersiveApi();
				await getImmersiveApi().setScene(ThreeObject);
					syncCanvasSubtitles();
					getImmersiveApi().setProjectOpenHandler((project) => openProjectMedia(project));
					sceneInitialized = true;
					sceneReady = true;
					syncSceneFocus();
				
				console.log('Scene initialized successfully');
			
			// Update projects if data is available
			if (musicProjects.length > 0 || programmingProjects.length > 0) {
				getImmersiveApi().updateProjects(musicProjects, programmingProjects);
				console.log('Projects updated');
			}
			
			// Start brightness sampling
			let frameCount = 0;

			function startBrightnessSampling() {
				function sampleLoop() {
					// Keep readbacks from the WebGL canvas infrequent to reduce main-thread work.
					const sampleEvery = reducedMotion ? 90 : 45;
					if (frameCount % sampleEvery === 0) {
						sampleCanvasBrightness();
					}
					if (isAudioEnabled) {
						const { low = 0, mid = 0, high = 0 } = audioSystem.getAnalysis?.() || {};
						const targetIntensity = clamp01(low * 0.5 + mid * 0.35 + high * 0.15);
						audioIntensity += (targetIntensity - audioIntensity) * 0.12;
					} else {
						audioIntensity += (0 - audioIntensity) * 0.08;
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
	let audioIntensity = 0;

	// Sample brightness periodically
	let brightnessInterval;
	const clamp01 = (value) => Math.min(1, Math.max(0, value));
	
	const bootstrapAudio = async () => {
		if (audioSystem.isInitialized) {
			isAudioEnabled = true;
			return;
		}
		try {
			await audioSystem.init();
			isAudioEnabled = true;
		} catch (error) {
			console.warn('Audio bootstrap failed:', error);
		}
	};

	onMount(async () => {
		reducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
		
		// Delay heavy 3D startup and prefer idle time.
		const scheduleInit = window.requestIdleCallback || ((cb) => setTimeout(cb, 1200));
		scheduleInit(async () => {
			if (ThreeObject) {
				await initializeScene();
			} else {
				console.error('Canvas element not available');
			}
		});
		const scheduleControls = window.requestIdleCallback || ((cb) => setTimeout(cb, 2200));
		scheduleControls(() => {
			void preloadAudioControls();
		});

		setupNarrationVoice();
		audioSystem.attachComputerKeyboard?.();
		if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
			window.speechSynthesis.onvoiceschanged = setupNarrationVoice;
		}
		
			// Cleanup function
			return () => {
				if (brightnessInterval) {
					cancelAnimationFrame(brightnessInterval);
				}
				stopBioNarration();
				if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
					window.speechSynthesis.onvoiceschanged = null;
				}
			};
    });

	onDestroy(() => {
		if (brightnessInterval) {
			cancelAnimationFrame(brightnessInterval);
			brightnessInterval = null;
		}
		stopBioNarration();
		stopWebcamProjection();
		projectMediaActive = false;
		syncGenerativeSuppression();
		getImmersiveApi().destroyScene();
	});
		
	// Add a manual initialization trigger for debugging
	const handleCanvasClick = async () => {
		if (!sceneInitialized) {
			console.log('Manual scene initialization triggered');
			await initializeScene();
		}
		void preloadAudioControls();
		await bootstrapAudio();
	};

	const handleToggleBioFocus = () => {
		bioFocusEnabled = !bioFocusEnabled;
		if (!webcamEnabled) {
			getImmersiveApi().clearProjectedVideo();
		}
		if (bioFocusEnabled) {
			projectMediaActive = false;
			syncGenerativeSuppression();
			activeMedia = null;
			void startBioNarration();
		} else {
			stopBioNarration();
		}
		if (!bioFocusEnabled) {
			activeMedia = null;
		}
		syncSceneFocus();
	};

	const handleContactFocus = (focused) => {
		contactFocusEnabled = !!focused;
		syncSceneFocus();
	};

	const handleContactSubmit = async (event) => {
		const { name, email, message, website, startedAt } = event.detail || {};
		contactStatus = 'submitting';
		contactError = '';
		contactFocusEnabled = true;
		syncSceneFocus();
		try {
			const response = await fetch('/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name,
					email,
					message,
					website,
					startedAt,
					turnstileToken,
					source: 'knorps.com artistic contact portal'
				})
			});
			const result = await response.json().catch(() => ({}));
			if (!response.ok || !result?.ok) {
				throw new Error(result?.error || 'Failed to send message');
			}
			contactStatus = 'success';
			turnstileToken = '';
			setTimeout(() => {
				contactStatus = 'idle';
			}, 3000);
		} catch (error) {
			contactStatus = 'error';
			contactError = error?.message || 'Failed to send message';
		} finally {
			contactFocusEnabled = false;
			syncSceneFocus();
		}
	};

</script>

<svelte:window bind:scrollY bind:innerHeight bind:innerWidth />
{#if !sceneReady}
		<div class="fixed top-0 left-0 w-full h-full gradient-placeholder z-0"></div> 
	{/if}

	<canvas  
			bind:this={ThreeObject}  
			on:click={handleCanvasClick}
			aria-hidden="true"
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
{#if AudioControlsComponent}
	<svelte:component
		this={AudioControlsComponent}
		{webcamEnabled}
		{webcamLoading}
		{webcamError}
		on:toggleWebcamProjection={handleToggleWebcamProjection}
	/>
{/if}

<!-- Seamless flowing content -->
<div class="seamless-flow">
	<HeroSection 
		{personalData} 
		{adaptiveTextClass} 
		{bioFocusEnabled}
		{isAudioEnabled}
		{audioIntensity}
		on:toggleBioFocus={handleToggleBioFocus}
	/>
<!-- Projects naturally flowing from bottom of page with biographical text -->
		<div class="projects-flow relative px-0 sm:px-6 md:px-8 xl:px-16 2xl:px-24">
		<div class="flex flex-col items-center xl:items-start xl:flex-row gap-16 2xl:gap-24">
			
			<!-- Left side - Projects -->
			<div
			class="projects-container w-full max-w-4xl xl:max-w-none xl:w-7/12 2xl:w-3/5"
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

			<div class="hidden xl:block w-full max-w-3xl xl:max-w-none xl:w-5/12 2xl:w-2/5 mt-12 xl:mt-0">
				<BiographicalSection
					{scrollY}
					{innerHeight}
					{adaptiveSubTextClass}
					contactStatus={contactStatus}
					contactError={contactError}
					turnstileSiteKey={PUBLIC_TURNSTILE_SITE_KEY}
					bind:turnstileToken
					on:focusContact={(event) => handleContactFocus(event.detail)}
					on:submitContact={handleContactSubmit}
				/>
			</div>
		</div>
		</div>
		</div>

<ProjectMediaOverlay media={activeMedia} onClose={closeProjectMedia} reducedMotion={reducedMotion} />


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
		z-index: 10;
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
		font-family: var(--font-label);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		background: linear-gradient(140deg, rgba(7, 14, 29, 0.92), rgba(15, 23, 42, 0.82));
		border: 1px solid var(--stroke-soft);
		box-shadow: var(--shadow-soft);
		color: var(--text-1);
	}

	@keyframes gentlePulse {
		0%, 100% { opacity: 0.9; }
		50% { opacity: 1; }
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
		background-color: var(--accent-pink);
		color: white;
	}

	.gradient-placeholder {
		background:
			radial-gradient(circle at 20% 18%, rgba(124, 176, 255, 0.2), transparent 36%),
			radial-gradient(circle at 82% 14%, rgba(255, 88, 175, 0.17), transparent 34%),
			linear-gradient(-35deg, #070a14, #0a1022 45%, #101930);
		background-size: 100% 100%;
		animation: drift-gradient 15s var(--ease-std) infinite;
	}

	@keyframes drift-gradient {
		0% {
			filter: saturate(100%);
			transform: scale(1);
		}

		50% {
			filter: saturate(120%);
			transform: scale(1.02);
		}

		100% {
			filter: saturate(100%);
			transform: scale(1);
		}
	}
</style>
