<script>
	import { fade } from "svelte/transition";
	import { createEventDispatcher, onMount } from "svelte";

	export let musicProjects;
	export let programmingProjects;
	export let adaptiveTextClass;
	export let adaptiveSubTextClass;

	const dispatch = createEventDispatcher();
	let observer;

	onMount(async () => {
		// Wait for DOM updates
		await new Promise((r) => setTimeout(r, 100));

		const options = {
			root: null,
			rootMargin: "-10% 0px -10% 0px", // Much wider area (80% of screen height)
			threshold: [0, 0.1],
		};

		observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				// console.log("Entry:", entry.target.id, entry.isIntersecting); // Super verbose log
				if (entry.isIntersecting) {
					const id = entry.target.id;
					console.log("Intersection detected:", id);
					if (id) {
						const [type, index] = id.split("-");
						dispatch("projectFocus", {
							type,
							index: parseInt(index),
							id,
						});
					}
				}
			});
		}, options);

		const cards = document.querySelectorAll(".project-card");
		console.log("Found project cards to observe:", cards.length);

		cards.forEach((card) => {
			observer.observe(card);
		});

		return () => {
			if (observer) observer.disconnect();
		};
	});
</script>

<!-- Music Projects -->
{#if musicProjects.length > 0}
	<div
		class="project-group mb-32 w-full xl:flex xl:flex-col xl:items-start xl:w-[48rem] 2xl:w-[56rem]"
	>
		<h3
			class="text-3xl font-black tracking-widest mb-16 opacity-80 adaptive-text w-full xl:w-[48rem] 2xl:w-[56rem]"
			class:text-white={adaptiveTextClass === "text-white"}
			class:text-gray-900={adaptiveTextClass === "text-gray-900"}
		>
			<mark style="background: none;" class="text-[#FF0080]">//</mark> MUSIC
		</h3>
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
				class="group my-20 translate-y-0 hover:-translate-y-8 duration-[400ms] ease-in-out w-full md:w-[40rem] lg:w-[30rem] xl:w-[48rem] 2xl:w-[56rem] project-card pointer-events-auto"
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
						>
							<iframe
								width="100%"
								height="100%"
								src="https://www.youtube.com/embed/{youtubeId}"
								title={data.title}
								frameborder="0"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
								allowfullscreen
								class="absolute top-0 left-0 w-full h-full"
							></iframe>
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

						<div class="flex flex-wrap gap-3 mb-4">
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
							>
								<iframe
									src="https://www.facebook.com/plugins/video.php?href={encodeURIComponent(
										facebookUrl,
									)}&show_text=false&t=0"
									width="100%"
									height="100%"
									style="border:none;overflow:hidden;"
									scrolling="no"
									frameborder="0"
									allowfullscreen="true"
									allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
									class="absolute left-0 w-full {aspectRatio ===
									'9:16'
										? 'h-[320%] top-1/2 -translate-y-1/2'
										: aspectRatio === '1:1'
											? 'h-[178%] top-1/2 -translate-y-1/2'
											: 'h-full top-0'}"
								></iframe>
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

						<div class="flex flex-wrap gap-3 mb-4">
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
						>
							<iframe
								width="100%"
								height="166"
								scrolling="no"
								frameborder="no"
								allow="autoplay"
								src="https://w.soundcloud.com/player/?url={encodeURIComponent(
									soundcloudUrl,
								)}&color=%23ff0080&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true"
							></iframe>
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

						<div class="flex flex-wrap gap-3 mb-4">
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
						class="block h-auto px-0 py-0 tracking-widest transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
					>
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
						<div class="flex flex-wrap gap-3">
							{#if data.features}
								{#each data.features as feature}
									<span
										class="text-[0.65rem] text-[#FF0080] tracking-widest uppercase font-semibold border border-[#FF0080]/30 px-3 py-1 rounded-full transform hover:skew-x-3 transition-transform duration-200"
										>{feature}</span
									>
								{/each}
							{/if}
						</div>
					</a>
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
						<div class="flex flex-wrap gap-3">
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
		class="project-group mb-32 w-full xl:flex xl:flex-col xl:items-start xl:w-[48rem] 2xl:w-[56rem]"
	>
		<h3
			class="text-3xl font-black tracking-widest mb-16 opacity-80 adaptive-text w-full xl:w-[48rem] 2xl:w-[56rem]"
			class:text-white={adaptiveTextClass === "text-white"}
			class:text-gray-900={adaptiveTextClass === "text-gray-900"}
		>
			<mark style="background: none;" class="text-[#FF0080]">//</mark> OTHER
		</h3>
		{#each programmingProjects as data, i}
			<div
				id="programming-{i}"
				class="group my-20 translate-y-0 hover:-translate-y-8 duration-[400ms] ease-in-out w-full md:w-[40rem] lg:w-[30rem] xl:w-[48rem] 2xl:w-[56rem] project-card pointer-events-auto"
				in:fade={{
					delay: 250 * (i + musicProjects.length),
					duration: 1000,
				}}
			>
				{#if data.github || data.demo}
					<a
						href={data.github || data.demo}
						rel="noopener noreferrer"
						target="_blank"
						class="block h-auto px-0 py-0 tracking-widest transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
					>
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
						<div class="flex flex-wrap gap-3">
							{#if data.technologies}
								{#each data.technologies as topic}
									<span
										class="text-[0.65rem] text-[#FF0080] tracking-widest uppercase font-semibold border border-[#FF0080]/30 px-3 py-1 rounded-full transform hover:skew-x-3 transition-transform duration-200"
										>{topic}</span
									>
								{/each}
							{/if}
						</div>
					</a>
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
						<div class="flex flex-wrap gap-3">
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

	/* Enhanced project interactions */
	.project-group .group:hover {
		transform: translateY(-2rem) scale(1.02);
	}

	/* Project card highlight animation */
	.project-card {
		transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
		border-radius: 16px;
		padding: 1.5rem;
		position: relative;
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		background: rgba(20, 20, 20, 0.4);
		border: 1px solid rgba(255, 255, 255, 0.08);
		box-shadow:
			0 4px 24px -1px rgba(0, 0, 0, 0.2),
			0 0 0 1px rgba(255, 255, 255, 0.02) inset;
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
			rgba(255, 0, 128, 0.15),
			rgba(255, 255, 255, 0.05)
		);
		border-radius: 16px;
		opacity: 0;
		transition: opacity 0.4s ease;
		z-index: -1;
		pointer-events: none;
	}

	.project-card:hover {
		border-color: rgba(255, 255, 255, 0.2);
		box-shadow:
			0 20px 40px -5px rgba(0, 0, 0, 0.4),
			0 0 0 1px rgba(255, 255, 255, 0.1) inset;
	}

	.project-card:hover::before {
		opacity: 1;
	}

	/* Subtle hover effects for tags */
	.project-group span:hover {
		background: rgba(255, 0, 128, 0.2);
		border-color: rgba(255, 0, 128, 0.8);
		color: white;
		box-shadow: 0 0 15px rgba(255, 0, 128, 0.4);
	}

	/* Adaptive text colors with smooth transitions */
	.adaptive-text,
	.adaptive-subtext {
		transition: color 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.adaptive-text {
		text-shadow:
			0 0 20px rgba(0, 0, 0, 0.5),
			0 2px 4px rgba(0, 0, 0, 0.3);
		letter-spacing: -0.02em;
	}

	.adaptive-subtext {
		text-shadow:
			0 0 10px rgba(0, 0, 0, 0.5),
			0 1px 2px rgba(0, 0, 0, 0.3);
	}
</style>
