<script>
	import { createEventDispatcher } from 'svelte';
	import ContactPortal from '$lib/components/ContactPortal.svelte';

	export let scrollY;
	export let innerHeight;
	export let adaptiveSubTextClass;
	export let contactStatus = 'idle';
	export let contactError = '';
	export let turnstileSiteKey = '';
	export let turnstileToken = '';

	const dispatch = createEventDispatcher();
	let showContactForm = false;

	$: bioOpacity = Math.max(0, Math.min(1, (scrollY - innerHeight * 0.2) / (innerHeight * 0.2)));
</script>

<div class="biographical-text">
	<div class="bio-flow-container" style="opacity: {bioOpacity}; min-height: 5rem;">
		<div class="bio-title-overlay">
			<h3 class="bio-title typ-label">O MNIE</h3>
		</div>

		<div
			class="bio-text typ-body text-base xl:text-mds leading-relaxed space-y-8 adaptive-subtext"
			class:text-gray-300={adaptiveSubTextClass === 'text-gray-300'}
			class:text-gray-200={adaptiveSubTextClass === 'text-gray-200'}
			class:text-gray-700={adaptiveSubTextClass === 'text-gray-700'}
		>
			<p><button
					type="button"
					class="bio-contact-trigger"
					on:click={() => (showContactForm = !showContactForm)}
					aria-expanded={showContactForm}
				>Paweł Knorps</button> – artysta poruszający się między tradycją a eksploracją, oddany dźwiękowi jako sile przekraczającej granice. Absolwent gitary jazzowej poznańskiej Akademii Muzycznej oraz kompozycji jazzowej na duńskiej Danish National Academy of Music w Odense.</p>
			<p>Jego muzyczna podróż jest skupiona wokół improwizacji – nie tylko na gitarze, ale również jako basista, producent i kompozytor. Paweł poszukuje w muzyce przestrzeni wolności, miejsca, gdzie intuicja spotyka się z ryzykiem, a dźwięk przeistacza się w narrację.</p>
			<p>Jego zespół <span class="text-[#FF0080] font-semibold">Pawel Knorps Group</span>, tworzony z wybitnymi poznańskimi muzykami, to świadectwo tej wizji – jazzowy dialog, wyrastający z lat doświadczeń muzycznych, ekspresji i otwartości. Projekt ten zdobył uznanie w finale Blue Note Competition 2024, podkreślając siłę jego kompozytorskiego głosu.</p>
			<p>Jego alter ego – <span class="text-[#FF0080] font-semibold">enthymeme</span> – to świat elektronicznej improwizacji. W dźwiękach klubów takich jak Farby czy Dom Technika tworzy on pejzaże z pogranicza chaosu i struktury, gdzie technologia spotyka się z ludzkim dotykiem.</p>
			<p>Dziś, po powrocie z Danii, Paweł zasila poznańskie projekty – od delikatnych brzmień <span class="text-[#FF0080] font-semibold">Milomi</span>, przez senne marzenia <span class="text-[#FF0080] font-semibold">SNY</span>, folkowo-djentowe eksploracje kolektywu <span class="text-[#FF0080] font-semibold">Przesilenie</span>, world-music z <span class="text-[#FF0080] font-semibold">GānāVānā</span>, po alternatywne i orientalne brzmienia <span class="text-[#FF0080] font-semibold">Aktas Erdogan Trio</span>.</p>
			<p>Każda z tych formacji jest przejawem niezaspokojonej ciekawości w poszukiwaniu własnej ekspresji.</p>
			{#if showContactForm}
				<div class="bio-contact-wrap">
					<ContactPortal
						status={contactStatus}
						error={contactError}
						turnstileSiteKey={turnstileSiteKey}
						bind:turnstileToken
						on:focusContact={(event) => dispatch('focusContact', event.detail)}
						on:submitContact={(event) => dispatch('submitContact', event.detail)}
					/>
				</div>
			{/if}
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
		transition: opacity var(--dur-slow) var(--ease-std);
		backdrop-filter: blur(var(--glass-blur)) saturate(165%);
		background:
			radial-gradient(circle at 8% 15%, rgba(255, 78, 163, 0.24), transparent 35%),
			radial-gradient(circle at 86% 5%, rgba(105, 162, 255, 0.28), transparent 34%),
			linear-gradient(135deg, rgba(13, 17, 32, 0.76), rgba(7, 11, 24, 0.88));
		border: 1px solid var(--stroke-soft);
		box-shadow:
			var(--shadow-soft),
			inset 0 1px 0 rgba(255, 255, 255, 0.18);
		border-radius: var(--radius-lg);
		display: flex;
		flex-direction: column;
		gap: 1rem;
		overflow: hidden;
	}

	.bio-title-overlay {
		position: relative;
		padding: 0.25rem 0.4rem 0.55rem;
		border-bottom: 1px solid var(--stroke-soft);
	}

	.bio-title {
		margin: 0;
		font-size: var(--step--1);
		font-weight: 800;
		color: var(--text-2);
	}

	.bio-text {
		padding: 0.4rem 0.5rem 0.2rem;
	}

	.bio-text p {
		text-align: justify;
		font-weight: 400;
		font-size: var(--step-1);
		line-height: 1.82;
		letter-spacing: 0.005em;
		margin: 0 auto 1rem;
		max-width: 58ch;
		padding-right: 0.25rem;
		color: var(--text-2);
	}

	.bio-text span {
		font-weight: 600;
	}

	.bio-contact-trigger {
		border: 1px solid transparent;
		background: transparent;
		padding: 0.05rem 0.18rem;
		margin-left: -0.18rem;
		border-radius: 0.35rem;
		color: var(--accent-pink);
		font: inherit;
		font-weight: 600;
		text-decoration: underline;
		text-decoration-color: var(--accent-pink-soft);
		text-underline-offset: 0.18rem;
		cursor: pointer;
		pointer-events: auto;
		transition: color var(--dur-fast) var(--ease-std), text-decoration-color var(--dur-fast) var(--ease-std), border-color var(--dur-fast) var(--ease-std), background-color var(--dur-fast) var(--ease-std);
	}

	.bio-contact-trigger:hover {
		color: #ffd6ec;
		text-decoration-color: rgba(255, 214, 236, 0.9);
		background: rgba(255, 78, 163, 0.12);
		border-color: rgba(255, 78, 163, 0.35);
	}

	.bio-contact-wrap {
		padding-top: 0.4rem;
	}

	.adaptive-subtext {
		transition: color var(--dur-med) var(--ease-std);
		text-shadow:
			0 0 10px rgba(0, 0, 0, 0.45),
			0 1px 4px rgba(0, 0, 0, 0.36);
	}

	@media (min-width: 1536px) {
		.bio-text {
			font-size: 1.03rem;
			line-height: 1.9;
		}
	}

	@media (max-width: 1280px) {
		.bio-flow-container {
			margin-top: 6rem;
			top: 0;
		}
	}
</style>
