<script>
	import { fade } from "svelte/transition";
	
	export let musicProjects;
	export let programmingProjects;
	export let adaptiveTextClass;
	export let adaptiveSubTextClass;
</script>

<!-- Music Projects -->
{#if musicProjects.length > 0}
	<div class="project-group mb-32 w-full xl:flex xl:flex-col xl:items-start xl:w-[40rem]">

		<h3 class="text-3xl font-black tracking-widest mb-16 opacity-80 adaptive-text w-full xl:w-[40rem]"
			class:text-white={adaptiveTextClass === 'text-white'}
			class:text-gray-900={adaptiveTextClass === 'text-gray-900'}>
			<mark style="background: none;" class="text-[#FF0080]">//</mark> MUSIC
		</h3>
		{#each musicProjects as data, i}
			<div id="music-{i}" class="group my-20 translate-y-0 hover:-translate-y-8 duration-[400ms] ease-in-out w-[20rem] md:w-[40rem] lg:w-[30rem] xl:w-[40rem] project-card pointer-events-auto" in:fade={{ delay: 250 * i, duration: 1000 }}>
				{#if data.links}
					<a
						href={data.links.youtube || data.links.bandcamp || data.links.soundcloud || data.links.facebook}
						rel="noopener noreferrer"
						target="_blank"
						class="block h-auto px-0 py-0 tracking-widest transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
						>
						<h2 class="text-xl font-black mb-4 hover:text-[#FF0080] transition-colors duration-300 adaptive-text"
							class:text-white={adaptiveTextClass === 'text-white'}
							class:text-gray-900={adaptiveTextClass === 'text-gray-900'}>
							<mark style="background: none;" class="text-[#FF0080]">.</mark>&nbsp;{data.title}
						</h2>
						<h2 class="text-md font-base mb-6 leading-relaxed adaptive-subtext"
							class:text-gray-300={adaptiveSubTextClass === 'text-gray-300'}
							class:text-gray-200={adaptiveSubTextClass === 'text-gray-200'}
							class:text-gray-700={adaptiveSubTextClass === 'text-gray-700'}>{data.description}</h2>
						<div class="flex flex-wrap gap-3">
							{#if data.features}
								{#each data.features as feature}
									<span class="text-[0.65rem] text-[#FF0080] tracking-widest uppercase font-semibold border border-[#FF0080]/30 px-3 py-1 rounded-full transform hover:skew-x-3 transition-transform duration-200">{feature}</span>
								{/each}
							{/if}
						</div>
					</a>
				{:else}
					<div class="h-auto px-0 py-0 tracking-widest">
						<h2 class="text-xl font-black mb-4 adaptive-text"
							class:text-white={adaptiveTextClass === 'text-white'}
							class:text-gray-900={adaptiveTextClass === 'text-gray-900'}>
							<mark style="background: none;" class="text-[#FF0080]">.</mark>&nbsp;{data.title}
						</h2>
						<h2 class="text-md font-base mb-6 leading-relaxed adaptive-subtext"
							class:text-gray-300={adaptiveSubTextClass === 'text-gray-300'}
							class:text-gray-200={adaptiveSubTextClass === 'text-gray-200'}
							class:text-gray-700={adaptiveSubTextClass === 'text-gray-700'}>{data.description}</h2>
						<div class="flex flex-wrap gap-3">
							{#if data.features}
								{#each data.features as feature}
									<span class="text-[0.65rem] text-[#FF0080] tracking-widest uppercase font-semibold border border-[#FF0080]/30 px-3 py-1 rounded-full">{feature}</span>
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
	<div class="project-group mb-32 w-full xl:flex xl:flex-col xl:items-start xl:w-[40rem]">
		<h3 class="text-3xl font-black tracking-widest mb-16 opacity-80 adaptive-text w-full xl:w-[40rem]"
			class:text-white={adaptiveTextClass === 'text-white'}
			class:text-gray-900={adaptiveTextClass === 'text-gray-900'}>
			<mark style="background: none;" class="text-[#FF0080]">//</mark> OTHER
		</h3>
		{#each programmingProjects as data, i}
			<div id="programming-{i}" class="group my-20 translate-y-0 hover:-translate-y-8 duration-[400ms] ease-in-out w-[20rem] md:w-[40rem] lg:w-[30rem] xl:w-[40rem] project-card pointer-events-auto" in:fade={{ delay: 250 * (i + musicProjects.length), duration: 1000 }}>
				{#if data.github || data.demo}
					<a href={data.github || data.demo} rel="noopener noreferrer" target="_blank" class="block h-auto px-0 py-0 tracking-widest transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
						<h2 class="text-xl font-black mb-4 hover:text-[#FF0080] transition-colors duration-300 adaptive-text"
							class:text-white={adaptiveTextClass === 'text-white'}
							class:text-gray-900={adaptiveTextClass === 'text-gray-900'}>
							<mark style="background: none;" class="text-[#FF0080]">.</mark>&nbsp;{data.title}
						</h2>
						<h2 class="text-md font-base mb-6 leading-relaxed adaptive-subtext"
							class:text-gray-300={adaptiveSubTextClass === 'text-gray-300'}
							class:text-gray-200={adaptiveSubTextClass === 'text-gray-200'}
							class:text-gray-700={adaptiveSubTextClass === 'text-gray-700'}>{data.description}</h2>
						<div class="flex flex-wrap gap-3">
							{#if data.technologies}
								{#each data.technologies as topic}
									<span class="text-[0.65rem] text-[#FF0080] tracking-widest uppercase font-semibold border border-[#FF0080]/30 px-3 py-1 rounded-full transform hover:skew-x-3 transition-transform duration-200">{topic}</span>
								{/each}
							{/if}
						</div>
					</a>
				{:else}
					<div class="h-auto px-0 py-0 tracking-widest">
						<h2 class="text-xl font-black mb-4 adaptive-text"
							class:text-white={adaptiveTextClass === 'text-white'}
							class:text-gray-900={adaptiveTextClass === 'text-gray-900'}>
							<mark style="background: none;" class="text-[#FF0080]">.</mark>&nbsp;{data.title}
						</h2>
						<h2 class="text-md font-base mb-6 leading-relaxed adaptive-subtext"
							class:text-gray-300={adaptiveSubTextClass === 'text-gray-300'}
							class:text-gray-200={adaptiveSubTextClass === 'text-gray-200'}
							class:text-gray-700={adaptiveSubTextClass === 'text-gray-700'}>{data.description}</h2>
						<div class="flex flex-wrap gap-3">
							{#if data.technologies}
								{#each data.technologies as topic}
									<span class="text-[0.65rem] text-[#FF0080] tracking-widest uppercase font-semibold border border-[#FF0080]/30 px-3 py-1 rounded-full">{topic}</span>
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
		transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
		border-radius: 10px;
		padding: 0.8rem;
		position: relative;
		backdrop-filter: blur(2px);
		background: rgba(0, 0, 0, 0.15);
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.project-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(45deg, rgba(255, 0, 128, 0.1), transparent);
		border-radius: 12px;
		opacity: 0;
		transition: opacity 0.3s ease;
		z-index: -1;
	}

	.project-card:hover::before {
		opacity: 1;
	}

	/* Subtle hover effects for tags */
	.project-group span:hover {
		background: rgba(255, 0, 128, 0.1);
		border-color: rgba(255, 0, 128, 0.8);
		color: white;
	}

	/* Adaptive text colors with smooth transitions */
	.adaptive-text, .adaptive-subtext {
		transition: color 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.adaptive-text {
		text-shadow: 
			0 0 10px rgba(0, 0, 0, 0.8),
			0 2px 4px rgba(0, 0, 0, 0.6),
			0 1px 2px rgba(0, 0, 0, 0.9);
	}

	.adaptive-subtext {
		text-shadow: 
			0 0 8px rgba(0, 0, 0, 0.7),
			0 1px 3px rgba(0, 0, 0, 0.5);
	}
</style>