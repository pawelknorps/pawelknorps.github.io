<script>
	import { createEventDispatcher } from 'svelte';
	import { fade } from "svelte/transition";
	import { resolveProjectMedia } from '$lib/utils/projectMedia.js';
	import SandboxedEmbed from '$lib/components/SandboxedEmbed.svelte';
	
	export let musicProjects;
	export let programmingProjects;
	export let adaptiveTextClass;
	export let adaptiveSubTextClass;
	let loadedVideos = {};

	const dispatch = createEventDispatcher();

	const handleEnterViewport = (id) => {
		if (!id || loadedVideos[id]) return;
		loadedVideos = { ...loadedVideos, [id]: true };
	};

	function lazyLoad(node) {
		if (typeof IntersectionObserver === 'undefined') {
			node.dispatchEvent(new CustomEvent('enterViewport'));
			return {};
		}

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						node.dispatchEvent(new CustomEvent('enterViewport'));
						observer.unobserve(node);
					}
				});
			},
			{ rootMargin: '200px 0px', threshold: 0.01 }
		);

		observer.observe(node);

		return {
			destroy() {
				observer.disconnect();
			}
		};
	}

	const openInApp = (event, project, type) => {
		const media = resolveProjectMedia(project);
		const url = media.url;
		if (!url || media.provider !== 'youtube') return;
		event.preventDefault();
		dispatch('openProjectMedia', { ...project, type, mediaUrl: url });
	};
</script>

<!-- Music Projects -->
{#if musicProjects.length > 0}
	<div
		class="project-group mb-32 w-full xl:flex xl:flex-col xl:items-start xl:max-w-[56rem] 2xl:max-w-[64rem]"
	>
		{#each musicProjects as data, i}
			{@const youtubeId = data.links?.youtube
				? (() => {
						const regExp =
							/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
						const match = data.links.youtube.match(regExp);
						return match && match[2].length === 11
							? match[2]
							: null;
					})()
				: null}

			{@const facebookUrl =
				!youtubeId &&
				data.links?.facebook &&
				(data.links.facebook.includes("/videos/") ||
					data.links.facebook.includes("/watch") ||
					data.links.facebook.includes("/reel/"))
					? data.links.facebook
					: null}

			{@const soundcloudUrl =
				!youtubeId &&
				!facebookUrl &&
				data.links?.soundcloud &&
				data.links.soundcloud.includes("soundcloud.com")
					? data.links.soundcloud
					: null}

			{@const instagramUrl =
				!youtubeId &&
				!facebookUrl &&
				!soundcloudUrl &&
				data.links?.instagram &&
				(data.links.instagram.includes("instagram.com/p/") ||
					data.links.instagram.includes("instagram.com/reel/"))
					? data.links.instagram
					: null}

			<div
				id="music-{i}"
				class="group my-20 translate-y-0 hover:-translate-y-4 duration-[400ms] ease-in-out w-full md:max-w-[40rem] lg:max-w-[48rem] xl:max-w-[56rem] 2xl:max-w-[64rem] project-card pointer-events-auto"
				in:fade={{ delay: 250 * i, duration: 1000 }}
			>
				{#if youtubeId}
					<!-- YouTube Video -->
					<div
						class="block h-auto px-0 py-0 tracking-widest transition-all duration-300"
					>
						<h2
							class="text-xl font-black mb-4 adaptive-text"
							class:text-white={adaptiveTextClass ===
								"text-white"}
							class:text-gray-900={adaptiveTextClass ===
								"text-gray-900"}
						>
							<mark
								style="background: none;"
								class="text-[#FF0080]">.</mark
							>&nbsp;{data.title}
						</h2>

						<!-- Video Container -->
						<div
							class="relative w-full aspect-video mb-6 rounded-lg overflow-hidden border border-white/10 shadow-lg"
							use:lazyLoad
							on:enterViewport={() =>
								handleEnterViewport(`youtube-${i}`)}
						>
							{#if loadedVideos[`youtube-${i}`]}
								<SandboxedEmbed
									src="https://www.youtube.com/embed/{youtubeId}"
									title={data.title}
									allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
									className="absolute top-0 left-0 w-full h-full"
								/>
							{/if}
						</div>

						<h2
							class="text-md font-base mb-6 leading-relaxed adaptive-subtext"
							class:text-gray-300={adaptiveSubTextClass ===
								"text-gray-300"}
							class:text-gray-200={adaptiveSubTextClass ===
								"text-gray-200"}
							class:text-gray-700={adaptiveSubTextClass ===
								"text-gray-700"}
						>
							{data.description}
						</h2>

						<div class="project-tags flex flex-wrap gap-3 mb-4">
							{#if data.features}
								{#each data.features as feature}
									<span
										class="text-[0.65rem] text-[#FF0080] tracking-widest uppercase font-semibold border border-[#FF0080]/30 px-3 py-1 rounded-full"
										>{feature}</span
									>
								{/each}
							{/if}
						</div>
						<!-- External Links -->
						<div class="flex flex-wrap gap-4 mt-4">
							{#if data.links}
								{#each Object.entries(data.links) as [platform, url]}
									{#if (platform !== "youtube" || !youtubeId) && url && url !== "#" && url !== ""}
										<a
											href={url}
											target="_blank"
											rel="noopener noreferrer"
											class="text-xs uppercase tracking-widest hover:text-[#FF0080] transition-colors duration-300 adaptive-subtext border-b border-transparent hover:border-[#FF0080]"
											class:text-gray-300={adaptiveSubTextClass ===
												"text-gray-300"}
											class:text-gray-200={adaptiveSubTextClass ===
												"text-gray-200"}
											class:text-gray-700={adaptiveSubTextClass ===
												"text-gray-700"}
										>
											{platform} ↗
										</a>
									{/if}
								{/each}
							{/if}
						</div>
					</div>
				{:else if facebookUrl}
					{@const isReel =
						facebookUrl && facebookUrl.includes("/reel/")}
					{@const aspectRatio =
						data.videoAspectRatio || (isReel ? "9:16" : "16:9")}

					<!-- Facebook Video -->
					<div
						class="block h-auto px-0 py-0 tracking-widest transition-all duration-300"
					>
						<h2
							class="text-xl font-black mb-4 adaptive-text"
							class:text-white={adaptiveTextClass ===
								"text-white"}
							class:text-gray-900={adaptiveTextClass ===
								"text-gray-900"}
						>
							<mark
								style="background: none;"
								class="text-[#FF0080]">.</mark
							>&nbsp;{data.title}
						</h2>

						<!-- Universal Centered Video Container (Fixed 16:9) -->
						<div class="w-full flex justify-center mb-6">
							<div
								class="relative w-full aspect-video rounded-lg overflow-hidden border border-white/10 shadow-lg bg-black"
								use:lazyLoad
								on:enterViewport={() =>
									handleEnterViewport(`facebook-${i}`)}
							>
								{#if loadedVideos[`facebook-${i}`]}
									<SandboxedEmbed
										src="https://www.facebook.com/plugins/video.php?href={encodeURIComponent(
											facebookUrl,
										)}&show_text=false&t=0"
										title={`${data.title} Facebook video`}
										allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share; fullscreen"
										style="border:none;overflow:hidden;"
										className="absolute left-0 w-full {aspectRatio ===
										'9:16'
											? 'h-[320%] top-1/2 -translate-y-1/2'
											: aspectRatio === '1:1'
												? 'h-[178%] top-1/2 -translate-y-1/2'
												: 'h-full top-0'}"
									/>
								{/if}
							</div>
						</div>

						<h2
							class="text-md font-base mb-6 leading-relaxed adaptive-subtext"
							class:text-gray-300={adaptiveSubTextClass ===
								"text-gray-300"}
							class:text-gray-200={adaptiveSubTextClass ===
								"text-gray-200"}
							class:text-gray-700={adaptiveSubTextClass ===
								"text-gray-700"}
						>
							{data.description}
						</h2>

						<div class="project-tags flex flex-wrap gap-3 mb-4">
							{#if data.features}
								{#each data.features as feature}
									<span
										class="text-[0.65rem] text-[#FF0080] tracking-widest uppercase font-semibold border border-[#FF0080]/30 px-3 py-1 rounded-full"
										>{feature}</span
									>
								{/each}
							{/if}
						</div>
						<div class="flex flex-wrap gap-4 mt-4">
							{#if data.links}
								{#each Object.entries(data.links) as [platform, url]}
									{#if (platform !== "facebook" || !facebookUrl) && url && url !== "#" && url !== ""}
										<a
											href={url}
											target="_blank"
											rel="noopener noreferrer"
											class="text-xs uppercase tracking-widest hover:text-[#FF0080] transition-colors duration-300 adaptive-subtext border-b border-transparent hover:border-[#FF0080]"
											class:text-gray-300={adaptiveSubTextClass ===
												"text-gray-300"}
											class:text-gray-200={adaptiveSubTextClass ===
												"text-gray-200"}
											class:text-gray-700={adaptiveSubTextClass ===
												"text-gray-700"}
										>
											{platform} ↗
										</a>
									{/if}
								{/each}
							{/if}
						</div>
					</div>
				{:else if soundcloudUrl}
					<!-- SoundCloud Player -->
					<div
						class="block h-auto px-0 py-0 tracking-widest transition-all duration-300"
					>
						<h2
							class="text-xl font-black mb-4 adaptive-text"
							class:text-white={adaptiveTextClass ===
								"text-white"}
							class:text-gray-900={adaptiveTextClass ===
								"text-gray-900"}
						>
							<mark
								style="background: none;"
								class="text-[#FF0080]">.</mark
							>&nbsp;{data.title}
						</h2>

						<div
							class="relative w-full mb-6 rounded-lg overflow-hidden border border-white/10 shadow-lg"
							use:lazyLoad
							on:enterViewport={() =>
								handleEnterViewport(`soundcloud-${i}`)}
						>
							{#if loadedVideos[`soundcloud-${i}`]}
								<SandboxedEmbed
									height="166"
									title={`${data.title} SoundCloud player`}
									allow="autoplay"
									src="https://w.soundcloud.com/player/?url={encodeURIComponent(
										soundcloudUrl,
									)}&color=%23ff0080&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"
								/>
							{/if}
						</div>

						<h2
							class="text-md font-base mb-6 leading-relaxed adaptive-subtext"
							class:text-gray-300={adaptiveSubTextClass ===
								"text-gray-300"}
							class:text-gray-200={adaptiveSubTextClass ===
								"text-gray-200"}
							class:text-gray-700={adaptiveSubTextClass ===
								"text-gray-700"}
						>
							{data.description}
						</h2>

						<div class="project-tags flex flex-wrap gap-3 mb-4">
							{#if data.features}
								{#each data.features as feature}
									<span
										class="text-[0.65rem] text-[#FF0080] tracking-widest uppercase font-semibold border border-[#FF0080]/30 px-3 py-1 rounded-full"
										>{feature}</span
									>
								{/each}
							{/if}
						</div>
						<div class="flex flex-wrap gap-4 mt-4">
							{#if data.links}
								{#each Object.entries(data.links) as [platform, url]}
									{#if (platform !== "soundcloud" || !soundcloudUrl) && url && url !== "#" && url !== ""}
										<a
											href={url}
											target="_blank"
											rel="noopener noreferrer"
											class="text-xs uppercase tracking-widest hover:text-[#FF0080] transition-colors duration-300 adaptive-subtext border-b border-transparent hover:border-[#FF0080]"
											class:text-gray-300={adaptiveSubTextClass ===
												"text-gray-300"}
											class:text-gray-200={adaptiveSubTextClass ===
												"text-gray-200"}
											class:text-gray-700={adaptiveSubTextClass ===
												"text-gray-700"}
										>
											{platform} ↗
										</a>
									{/if}
								{/each}
							{/if}
						</div>
					</div>
				{:else if data.links}
					<div class="block h-auto px-0 py-0 tracking-widest transition-all duration-300 transform hover:scale-[1.02]">
						<h2
							class="text-xl font-black mb-4 hover:text-[#FF0080] transition-colors duration-300 adaptive-text"
							class:text-white={adaptiveTextClass ===
								"text-white"}
							class:text-gray-900={adaptiveTextClass ===
								"text-gray-900"}
						>
							<mark
								style="background: none;"
								class="text-[#FF0080]">.</mark
							>&nbsp;{data.title}
						</h2>
						<h2
							class="text-md font-base mb-6 leading-relaxed adaptive-subtext"
							class:text-gray-300={adaptiveSubTextClass ===
								"text-gray-300"}
							class:text-gray-200={adaptiveSubTextClass ===
								"text-gray-200"}
							class:text-gray-700={adaptiveSubTextClass ===
								"text-gray-700"}
						>
							{data.description}
						</h2>
						<div class="project-tags flex flex-wrap gap-3">
							{#if data.features}
								{#each data.features as feature}
									<span
										class="text-[0.65rem] text-[#FF0080] tracking-widest uppercase font-semibold border border-[#FF0080]/30 px-3 py-1 rounded-full transform hover:skew-x-3 transition-transform duration-200"
										>{feature}</span
									>
								{/each}
							{/if}
						</div>
						<div class="mt-4">
							<div class="flex flex-wrap gap-4">
								<a
									href={data.links.youtube ||
										data.links.bandcamp ||
										data.links.soundcloud ||
										data.links.facebook ||
										data.links.instagram ||
										data.links.website ||
										data.links.maps}
									rel="noopener noreferrer"
									target="_blank"
									on:click={(event) => openInApp(event, data, 'music')}
									class="inline-flex text-xs uppercase tracking-widest hover:text-[#FF0080] transition-colors duration-300 adaptive-subtext border-b border-transparent hover:border-[#FF0080]"
								>
									Open project ↗
								</a>
							</div>
						</div>
					</div>
				{:else}
					<div class="h-auto px-0 py-0 tracking-widest">
						<h2
							class="text-xl font-black mb-4 adaptive-text"
							class:text-white={adaptiveTextClass ===
								"text-white"}
							class:text-gray-900={adaptiveTextClass ===
								"text-gray-900"}
						>
							<mark
								style="background: none;"
								class="text-[#FF0080]">.</mark
							>&nbsp;{data.title}
						</h2>
						<h2
							class="text-md font-base mb-6 leading-relaxed adaptive-subtext"
							class:text-gray-300={adaptiveSubTextClass ===
								"text-gray-300"}
							class:text-gray-200={adaptiveSubTextClass ===
								"text-gray-200"}
							class:text-gray-700={adaptiveSubTextClass ===
								"text-gray-700"}
						>
							{data.description}
						</h2>
						<div class="project-tags flex flex-wrap gap-3">
							{#if data.features}
								{#each data.features as feature}
									<span
										class="text-[0.65rem] text-[#FF0080] tracking-widest uppercase font-semibold border border-[#FF0080]/30 px-3 py-1 rounded-full"
										>{feature}</span
									>
								{/each}
							{/if}
						</div>
					</div>
				{/if}
			</div>
		{/each}
	</div>
{/if}

<!-- Programming Projects -->
{#if programmingProjects.length > 0}
	<div
		class="project-group mb-32 w-full xl:flex xl:flex-col xl:items-start xl:max-w-[56rem] 2xl:max-w-[64rem]"
	>
		<h3
			class="text-3xl font-black tracking-widest mb-16 opacity-80 adaptive-text w-full xl:max-w-[56rem] 2xl:max-w-[64rem]"
			class:text-white={adaptiveTextClass === "text-white"}
			class:text-gray-900={adaptiveTextClass === "text-gray-900"}
		>
			<mark style="background: none;" class="text-[#FF0080]">//</mark> OTHER
		</h3>
		{#each programmingProjects as data, i}
			<div
				id="programming-{i}"
				class="group my-20 translate-y-0 hover:-translate-y-4 duration-[400ms] ease-in-out w-full md:max-w-[40rem] lg:max-w-[48rem] xl:max-w-[56rem] 2xl:max-w-[64rem] project-card pointer-events-auto"
				in:fade={{
					delay: 250 * (i + musicProjects.length),
					duration: 1000,
				}}
			>
				{#if data.github || data.demo}
					<div class="block h-auto px-0 py-0 tracking-widest transition-all duration-300 transform hover:scale-[1.02]">
						<h2 class="text-xl font-black mb-4 hover:text-[#FF0080] transition-colors duration-300 adaptive-text"
							class:text-white={adaptiveTextClass === 'text-white'}
							class:text-gray-900={adaptiveTextClass === 'text-gray-900'}>
							<mark style="background: none;" class="text-[#FF0080]">.</mark>&nbsp;{data.title}
						</h2>
						<h2
							class="text-md font-base mb-4 leading-relaxed adaptive-subtext"
							class:text-gray-300={adaptiveSubTextClass === 'text-gray-300'}
							class:text-gray-200={adaptiveSubTextClass === 'text-gray-200'}
							class:text-gray-700={adaptiveSubTextClass === 'text-gray-700'}
						>
							{data.description}
						</h2>
						<div class="project-tags flex flex-wrap gap-3">
							{#if data.technologies}
								{#each data.technologies as topic}
									<span
										class="text-[0.65rem] text-[#FF0080] tracking-widest uppercase font-semibold border border-[#FF0080]/30 px-3 py-1 rounded-full transform hover:skew-x-3 transition-transform duration-200"
										>{topic}</span
									>
								{/each}
							{/if}
						</div>
						<div class="mt-4 flex flex-wrap gap-4">
							<a href={data.github || data.demo} rel="noopener noreferrer" target="_blank" on:click={(event) => openInApp(event, data, 'programming')} class="inline-flex text-xs uppercase tracking-widest hover:text-[#FF0080] transition-colors duration-300 adaptive-subtext border-b border-transparent hover:border-[#FF0080]">Open project ↗</a>
						</div>
					</div>
				{:else}
					<div class="h-auto px-0 py-0 tracking-widest">
						<h2
							class="text-xl font-black mb-4 adaptive-text"
							class:text-white={adaptiveTextClass ===
								"text-white"}
							class:text-gray-900={adaptiveTextClass ===
								"text-gray-900"}
						>
							<mark
								style="background: none;"
								class="text-[#FF0080]">.</mark
							>&nbsp;{data.title}
						</h2>
						<h2
							class="text-md font-base mb-6 leading-relaxed adaptive-subtext"
							class:text-gray-300={adaptiveSubTextClass ===
								"text-gray-300"}
							class:text-gray-200={adaptiveSubTextClass ===
								"text-gray-200"}
							class:text-gray-700={adaptiveSubTextClass ===
								"text-gray-700"}
						>
							{data.description}
						</h2>
						<div class="project-tags flex flex-wrap gap-3">
							{#if data.technologies}
								{#each data.technologies as topic}
									<span
										class="text-[0.65rem] text-[#FF0080] tracking-widest uppercase font-semibold border border-[#FF0080]/30 px-3 py-1 rounded-full"
										>{topic}</span
									>
								{/each}
							{/if}
						</div>
					</div>
				{/if}
			</div>
		{/each}
	</div>
{/if}

<style>
	.project-group {
		background: transparent;
	}

	.project-tags {
		display: none;
	}

	.project-card {
		will-change: transform;
		transition:
			transform var(--dur-med) var(--ease-emph),
			border-color var(--dur-fast) var(--ease-std),
			box-shadow var(--dur-fast) var(--ease-std),
			background var(--dur-fast) var(--ease-std);
		border-radius: var(--radius-lg);
		padding: clamp(1.15rem, 2.2vw, 1.8rem);
		position: relative;
		backdrop-filter: blur(var(--glass-blur));
		-webkit-backdrop-filter: blur(var(--glass-blur));
		background:
			radial-gradient(circle at 0% 0%, rgba(255, 78, 163, 0.12), transparent 30%),
			radial-gradient(circle at 100% 100%, rgba(143, 214, 255, 0.08), transparent 35%),
			linear-gradient(140deg, rgba(12, 17, 32, 0.72), rgba(10, 14, 28, 0.84));
		border: 1px solid var(--stroke-soft);
		box-shadow:
			0 14px 36px -12px rgba(0, 0, 0, 0.45),
			0 0 0 1px rgba(255, 255, 255, 0.02) inset;
		overflow: hidden;
	}

	.project-card::before {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(
			135deg,
			rgba(255, 78, 163, 0.2),
			rgba(255, 255, 255, 0.06)
		);
		border-radius: var(--radius-lg);
		opacity: 0;
		transition: opacity var(--dur-med) var(--ease-std);
		z-index: -1;
		pointer-events: none;
	}

	.project-card:hover {
		border-color: var(--stroke-strong);
		box-shadow:
			0 24px 54px -14px rgba(0, 0, 0, 0.55),
			0 0 0 1px rgba(255, 255, 255, 0.1) inset;
	}

	.project-card:hover::before {
		opacity: 1;
	}

	.project-card .adaptive-text {
		font-family: var(--font-display);
		font-size: var(--step-1);
		font-weight: 600;
		line-height: 1.28;
		letter-spacing: 0.008em;
	}

	.project-card .adaptive-subtext {
		font-family: var(--font-body);
		font-size: var(--step--1);
		line-height: 1.68;
		color: var(--text-2);
		letter-spacing: 0.01em;
	}

	.project-group h3 {
		font-family: var(--font-label);
		letter-spacing: 0.08em;
		font-size: var(--step-3);
		text-transform: uppercase;
	}

	.project-group span {
		font-family: var(--font-label);
		font-size: var(--step--1);
		letter-spacing: 0.06em;
		border-radius: 999px;
		border-color: rgba(255, 78, 163, 0.45);
		color: #ff6db5;
		background: rgba(255, 78, 163, 0.08);
		transition:
			background var(--dur-fast) var(--ease-std),
			border-color var(--dur-fast) var(--ease-std),
			color var(--dur-fast) var(--ease-std),
			box-shadow var(--dur-fast) var(--ease-std);
	}

	.project-group span:hover {
		background: rgba(255, 78, 163, 0.2);
		border-color: rgba(255, 78, 163, 0.84);
		color: white;
		box-shadow: 0 0 18px rgba(255, 78, 163, 0.42);
	}

	.project-group a {
		font-family: var(--font-label);
		letter-spacing: 0.06em;
		border-bottom: 1px solid rgba(255, 78, 163, 0.28);
		color: #cedaf5;
	}

	.project-group a:hover {
		color: var(--accent-pink);
		border-bottom-color: var(--accent-pink);
	}

	.adaptive-text,
	.adaptive-subtext {
		transition: color var(--dur-med) var(--ease-std);
	}

	.adaptive-text {
		text-shadow:
			0 8px 24px rgba(0, 0, 0, 0.46),
			0 2px 4px rgba(0, 0, 0, 0.32);
	}

	.adaptive-subtext {
		text-shadow:
			0 0 12px rgba(0, 0, 0, 0.42),
			0 1px 2px rgba(0, 0, 0, 0.3);
	}

	@media (max-width: 900px) {
		.project-card .adaptive-text {
			font-size: var(--step-0);
		}

		.project-card .adaptive-subtext {
			font-size: 0.78rem;
		}
	}
</style>
