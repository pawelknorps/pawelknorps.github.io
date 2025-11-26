<script>
	export let personalData;
	export let adaptiveTextClass;
	export let adaptiveSubTextClass;
</script>

<!-- Hero Section -->
<div class="hero-section h-[75vh] flex flex-col justify-center relative">
	<div class="group z-10">
		<h2
			class="text-6xl font-black tracking-widest ml-20 adaptive-text"
			class:text-white={adaptiveTextClass === "text-white"}
			class:text-gray-900={adaptiveTextClass === "text-gray-900"}
		>
			{personalData.name}
		</h2>
		<h2
			class="text-2xl font-thin tracking-widest mt-6 ml-20 adaptive-text"
			class:text-white={adaptiveTextClass === "text-white"}
			class:text-gray-900={adaptiveTextClass === "text-gray-900"}
		>
			&nbsp;{personalData.title} and
			<mark
				id="revelation"
				style="background: none; color: #FF0080;"
				class="font-black">guitarist.</mark
			>
		</h2>
		<h2
			class="text-2xl font-thin tracking-widest mt-6 ml-20 adaptive-text"
			class:text-white={adaptiveTextClass === "text-white"}
			class:text-gray-900={adaptiveTextClass === "text-gray-900"}
		>
			&nbsp;{personalData.bio}
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
	}

	/* Adaptive text colors with smooth transitions */
	.adaptive-text {
		transition: color 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		text-shadow:
			0 0 20px rgba(0, 0, 0, 0.5),
			0 2px 4px rgba(0, 0, 0, 0.3);
		letter-spacing: -0.02em;
	}
</style>
