<script>
	import { createEventDispatcher } from 'svelte';
	import BioTitleThree from '$lib/components/BioTitleThree.svelte';

	export let scrollY;
	export let innerHeight;
	export let adaptiveSubTextClass;
	export let bioProjectionEnabled = false;

	const dispatch = createEventDispatcher();

	$: bioOpacity = Math.max(0, Math.min(1, (scrollY - innerHeight * 0.2) / (innerHeight * 0.2)));
</script>

<div class="biographical-text">
	<div class="bio-flow-container" style="opacity: {bioOpacity}; min-height: 5rem;">
		<div class="bio-title-overlay">
			<div class="bio-title-glow"></div>
			<button
				class="bio-toggle"
				type="button"
				on:click={() => dispatch('toggleBioProjection')}
				aria-pressed={bioProjectionEnabled}
			>
				BIO PROJECTION: {bioProjectionEnabled ? 'ON' : 'OFF'}
			</button>
			<BioTitleThree />
			<p class="bio-kicker">COMPOSER · GUITARIST · PRODUCER</p>
		</div>

		<div
			class="bio-text text-base xl:text-mds leading-relaxed space-y-8 adaptive-subtext"
			class:text-gray-300={adaptiveSubTextClass === 'text-gray-300'}
			class:text-gray-200={adaptiveSubTextClass === 'text-gray-200'}
			class:text-gray-700={adaptiveSubTextClass === 'text-gray-700'}
		>
			<p>Paweł Knorps – artysta poruszający się między tradycją a eksploracją, oddany dźwiękowi jako sile przekraczającej granice. Absolwent gitary jazzowej poznańskiej Akademii Muzycznej oraz kompozycji jazzowej na duńskiej Danish National Academy of Music w Odense.</p>
			<p>Jego muzyczna podróż jest skupiona wokół improwizacji – nie tylko na gitarze, ale również jako basista, producent i kompozytor. Paweł poszukuje w muzyce przestrzeni wolności, miejsca, gdzie intuicja spotyka się z ryzykiem, a dźwięk przeistacza się w narrację.</p>
			<p>Jego zespół <span class="text-[#FF0080] font-semibold">Pawel Knorps Group</span>, tworzony z wybitnymi poznańskimi muzykami, to świadectwo tej wizji – jazzowy dialog, wyrastający z lat doświadczeń muzycznych, ekspresji i otwartości. Projekt ten zdobył uznanie w finale Blue Note Competition 2024, podkreślając siłę jego kompozytorskiego głosu.</p>
			<p>Jego alter ego – <span class="text-[#FF0080] font-semibold">enthymeme</span> – to świat elektronicznej improwizacji. W dźwiękach klubów takich jak Farby czy Dom Technika tworzy on pejzaże z pogranicza chaosu i struktury, gdzie technologia spotyka się z ludzkim dotykiem.</p>
			<p>Dziś, po powrocie z Danii, Paweł zasila poznańskie projekty – od delikatnych brzmień <span class="text-[#FF0080] font-semibold">Milomi</span>, przez senne marzenia <span class="text-[#FF0080] font-semibold">SNY</span>, folkowo-djentowe eksploracje kolektywu <span class="text-[#FF0080] font-semibold">Przesilenie</span>, world-music z <span class="text-[#FF0080] font-semibold">GānāVānā</span>, po alternatywne i orientalne brzmienia <span class="text-[#FF0080] font-semibold">Aktas Erdogan Trio</span>.</p>
			<p>Każda z tych formacji jest przejawem niezaspokojonej ciekawości w poszukiwaniu własnej ekspresji.</p>
		</div>
	</div>
</div>

<style>
	.biographical-text {
		position: relative;
	}

	.bio-flow-container {
		position: relative;
		margin-top: 20rem;
		top: 2rem;
		padding: clamp(1.25rem, 2vw, 2rem);
		transition: opacity 0.9s cubic-bezier(0.4, 0, 0.2, 1);
		backdrop-filter: blur(16px) saturate(165%);
		background:
			radial-gradient(circle at 8% 15%, rgba(255, 51, 143, 0.26), transparent 35%),
			radial-gradient(circle at 86% 5%, rgba(81, 135, 255, 0.3), transparent 30%),
			linear-gradient(135deg, rgba(16, 18, 30, 0.72), rgba(9, 11, 20, 0.84));
		border: 1px solid rgba(255, 255, 255, 0.14);
		box-shadow:
			0 24px 64px rgba(0, 0, 0, 0.38),
			inset 0 1px 0 rgba(255, 255, 255, 0.22);
		border-radius: 24px;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		overflow: hidden;
	}

	.bio-title-overlay {
		position: relative;
		padding: 0.25rem 0.5rem 0.8rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.12);
	}

	.bio-toggle {
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
		z-index: 2;
		padding: 0.45rem 0.75rem;
		font-size: 0.64rem;
		letter-spacing: 0.15em;
		font-weight: 700;
		border-radius: 999px;
		border: 1px solid rgba(255, 255, 255, 0.26);
		background: rgba(6, 10, 20, 0.62);
		color: rgba(235, 245, 255, 0.95);
		backdrop-filter: blur(8px);
		transition: all 0.25s ease;
		pointer-events: auto;
	}

	.bio-toggle[aria-pressed='true'] {
		border-color: rgba(128, 220, 255, 0.9);
		box-shadow: 0 0 20px rgba(102, 186, 255, 0.35);
		background: rgba(10, 24, 38, 0.75);
		color: rgba(220, 244, 255, 1);
	}

	.bio-toggle:hover {
		transform: translateY(-1px);
	}

	.bio-title-glow {
		position: absolute;
		inset: 10% 18% auto;
		height: 65%;
		filter: blur(30px);
		background: radial-gradient(circle, rgba(255, 0, 128, 0.45), rgba(88, 133, 255, 0.12), transparent 70%);
		pointer-events: none;
	}

	.bio-kicker {
		text-align: center;
		letter-spacing: 0.38em;
		font-size: clamp(0.58rem, 0.6vw + 0.45rem, 0.8rem);
		font-weight: 700;
		opacity: 0.8;
		margin-top: -0.2rem;
		color: rgba(240, 246, 255, 0.88);
		text-shadow: 0 0 10px rgba(85, 145, 255, 0.35);
	}

	.bio-text {
		padding: 0.4rem 0.5rem 0.2rem;
	}

	.bio-text p {
		text-align: justify;
		font-family: 'IBM Plex Sans', 'Manrope', 'Sora', system-ui, -apple-system, sans-serif;
		font-weight: 340;
		line-height: 1.85;
		margin-bottom: 1rem;
		padding-right: 0.25rem;
	}

	.bio-text span {
		font-weight: 600;
	}

	.adaptive-subtext {
		transition: color 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		text-shadow:
			0 0 10px rgba(0, 0, 0, 0.45),
			0 1px 4px rgba(0, 0, 0, 0.36);
	}

	@media (min-width: 1536px) {
		.bio-text {
			font-size: 1.07rem;
			line-height: 1.95;
		}
	}

	@media (max-width: 1280px) {
		.bio-flow-container {
			margin-top: 6rem;
			top: 0;
		}
		.bio-kicker {
			letter-spacing: 0.28em;
		}
	}
</style>
