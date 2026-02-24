<script>
	export let adaptiveTextClass;
</script>

<!-- Hero Section -->
<div class="hero-section h-[75vh] flex flex-col justify-center relative">
	<div class="group z-10 flex flex-col items-center md:items-start hero-stack">
		<p class="kicker md:ml-20">AUDIO · PERFORMANCE · CODE</p>
		<h2
			class="display-font text-6xl xl:text-8xl 2xl:text-9xl font-black tracking-tight text-center md:text-left md:ml-20 adaptive-text"
			class:text-white={adaptiveTextClass === "text-white"}
			class:text-gray-900={adaptiveTextClass === "text-gray-900"}
		>
			Paweł Knorps
		</h2>
		<h2
			class="text-2xl xl:text-3xl 2xl:text-4xl font-thin tracking-wide mt-6 text-center md:text-left md:ml-20 adaptive-text"
			class:text-white={adaptiveTextClass === "text-white"}
			class:text-gray-900={adaptiveTextClass === "text-gray-900"}
		>
			Composer, Bassist, Producer and
			<mark
				id="revelation"
				style="background: none; color: #FF0080;"
				class="font-black">guitarist.</mark
			>
		</h2>
		<h2
			class="text-2xl xl:text-3xl 2xl:text-4xl font-thin tracking-widest mt-6 text-center md:text-left md:ml-20 adaptive-text"
			class:text-white={adaptiveTextClass === "text-white"}
			class:text-gray-900={adaptiveTextClass === "text-gray-900"}
		>
			An experimental musician and improviser based in Poznań.
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
	.hero-stack > * {
		animation: hero-enter 900ms cubic-bezier(0.16, 1, 0.3, 1) both;
	}
	.hero-stack > *:nth-child(1) {
		animation-delay: 90ms;
	}
	.hero-stack > *:nth-child(2) {
		animation-delay: 180ms;
	}
	.hero-stack > *:nth-child(3) {
		animation-delay: 260ms;
	}
	.hero-stack > *:nth-child(4) {
		animation-delay: 340ms;
	}
	.kicker {
		font-size: 0.72rem;
		letter-spacing: 0.26em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.72);
		margin-bottom: 1rem;
	}

	/* Adaptive text colors with smooth transitions */
	.adaptive-text {
		transition: color 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		text-shadow:
			0 0 20px rgba(0, 0, 0, 0.5),
			0 2px 4px rgba(0, 0, 0, 0.3);
		letter-spacing: -0.02em;
	}
	@keyframes hero-enter {
		from {
			opacity: 0;
			transform: translateY(22px);
			filter: blur(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
			filter: blur(0);
		}
	}
</style>
