<script>
	export let scrollY;
	export let innerHeight;
	export let projectsHeight;
	export let adaptiveTextClass;
	export let adaptiveSubTextClass;

	// Calculate opacity based on scroll position
	$: bioOpacity = Math.max(0, Math.min(1, (scrollY - innerHeight * 0.2) / (innerHeight * 0.2)));
	
	// Calculate minimum height to match projects section
	// $: minBioHeight = Math.max(projectsHeight/2, innerHeight * 0.8);
</script>

<!-- Right side - Biographical text -->
<div class="biographical-text">
	<div class="bio-flow-container" 
		 style="opacity: {bioOpacity}; min-height: 5rem;">
		
		<div class="bio-content-flow">
			<h3 class="text-3xl xl:text-4xl font-black tracking-widest mb-8 opacity-80 adaptive-text"
				class:text-white={adaptiveTextClass === 'text-white'}
				class:text-gray-900={adaptiveTextClass === 'text-gray-900'}>
				<mark style="background: none;" class="text-[#FF0080]">//</mark> O MNIE
			</h3>
			
			<div class="bio-text text-base xl:text-mds leading-relaxed space-y-8 adaptive-subtext"
                 class:text-gray-300={adaptiveSubTextClass === 'text-gray-300'}
                 class:text-gray-200={adaptiveSubTextClass === 'text-gray-200'}
                 class:text-gray-700={adaptiveSubTextClass === 'text-gray-700'}>

                <p>Paweł Knorps – artysta poruszający się między tradycją a eksploracją, oddany dźwiękowi jako sile przekraczającej granice. Absolwent gitary jazzowej poznańskiej Akademii Muzycznej oraz kompozycji jazzowej na duńskiej Danish National Academy of Music w Odense.</p>
                
                <p>Jego muzyczna podróż jest skupiona wokół improwizacji – nie tylko na gitarze, ale również jako basista, producent i kompozytor. Paweł poszukuje w muzyce przestrzeni wolności, miejsca, gdzie intuicja spotyka się z ryzykiem, a dźwięk przeistacza się w narrację.</p>
                
                <p>Jego zespół <span class="text-[#FF0080] font-semibold">Pawel Knorps Group</span>, tworzony z wybitnymi poznańskimi muzykami, to świadectwo tej wizji – jazzowy dialog, wyrastający z lat doświadczeń muzycznych, ekspresji i otwartości. Projekt ten zdobył uznanie w finale Blue Note Competition 2024, podkreślając siłę jego kompozytorskiego głosu.</p>
                
                <p>Jego alter ego – <span class="text-[#FF0080] font-semibold">enthymeme</span> – to świat elektronicznej improwizacji. W dźwiękach klubów takich jak Farby czy Dom Technika tworzy on pejzaże z pogranicza chaosu i struktury, gdzie technologia spotyka się z ludzkim dotykiem.</p>
                
                <p>Dziś, po powrocie z Danii, Paweł zasila poznańskie projekty – od delikatnych brzmień <span class="text-[#FF0080] font-semibold">Milomi</span>, przez senne marzenia <span class="text-[#FF0080] font-semibold">SNY</span>, folkowo-djentowe eksploracje kolektywu <span class="text-[#FF0080] font-semibold">Przesilenie</span>, world-music z <span class="text-[#FF0080] font-semibold">GānāVānā</span>, po alternatywne i orientalne brzmienia <span class="text-[#FF0080] font-semibold">Aktas Erdogan Trio</span>.</p>

                <p>Każda z tych formacji jest przejawem niezaspokojonej ciekawości w poszukiwaniu własnej ekspresji.</p>
            </div>

			<!-- <div class="achievements-section mt-16">
				<h3 class="text-2xl xl:text-3xl font-black tracking-widest mb-8 opacity-80 adaptive-text"
					class:text-white={adaptiveTextClass === 'text-white'}
					class:text-gray-900={adaptiveTextClass === 'text-gray-900'}>
					<mark style="background: none;" class="text-[#FF0080]">//</mark> DOKONANIA
				</h3>
				<div class="achievements-list text-sm xl:text-base leading-relaxed space-y-6 adaptive-subtext"
					 class:text-gray-300={adaptiveSubTextClass === 'text-gray-300'}
					 class:text-gray-200={adaptiveSubTextClass === 'text-gray-200'}
					 class:text-gray-700={adaptiveSubTextClass === 'text-gray-700'}>
					<div class="achievement-item">
						<span class="text-[#FF0080] font-bold text-lg">2021</span> - wygrana O K N O | Mini-konkurs na kreatywne akcje w oknie Kołorkingu muzycznego
					</div>
					<div class="achievement-item">
						<span class="text-[#FF0080] font-bold text-lg">2020-2021</span> nagroda od Teatru Muzycznego w Poznaniu w Konkursie „Ciąg dalszy nastąpi cz. II" za projekt „Performance audiowizualny nawiązujący do sieci neuronowej"
					</div>
					<div class="achievement-item">
						<span class="text-[#FF0080] font-bold text-lg">2022</span> - stypendium programu Erasmus na studia w Syddansk musikkonservatorium w Odense, gdzie później zaczął pełnoprawne studia magisterskie
					</div>
					<div class="achievement-item">
						<span class="text-[#FF0080] font-bold text-lg">2024</span> – finał Blue Note Competition 2024 z autorskim projektem kompozytorskim Pawel Knorps Group
					</div>
					<div class="achievement-item">
						<span class="text-[#FF0080] font-bold text-lg">2024</span> - otrzymał Stypendium Twórcze Miasta Poznania za projekt „Jazzowa tkanka miasta – album inspirowany dźwiękami Poznania"
					</div>
				</div>
			</div> -->
		</div>
	</div>
</div>

<style>
	/* Biographical text styling */
	.biographical-text {
		position: relative;
	}

	.bio-flow-container {
		position: relative;
		margin-top: 20rem;
		top: 2rem;
		padding: 2rem;
		transition: opacity 0.9s cubic-bezier(0.4, 0, 0.2, 1);
		backdrop-filter: blur(3px);
		background: rgba(0, 0, 0, 0.1);
		border-left: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 12px;
		display: flex;
		flex-direction: column;
		justify-content: flex-start;
	}

	.bio-content-flow {
		background: transparent;
		border: none;
		padding: 1rem;
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: space-evenly;
	}

	.bio-text p {
		text-align: justify;
		font-family: system-ui, -apple-system, sans-serif;
		font-weight: 300;
		line-height: 1.8;
		margin-bottom: 1rem;
		padding-right: 3rem;
	}

	.bio-text span {
		font-weight: 600;
	}

	.achievements-section {
		border-top: 1px solid rgba(255, 0, 128, 0.2);
		padding-top: 1rem;
		margin-top: 1rem;
	}

	.achievements-list {
		max-height: none;
	}

	.achievement-item {
		padding: 1rem 0;
		border-left: 3px solid rgba(255, 0, 128, 0.3);
		padding-left: 1.5rem;
		margin-left: 0.75rem;
		transition: all 0.3s ease;
		line-height: 1.6;
	}

	.achievement-item:hover {
		border-left-color: rgba(255, 0, 128, 0.8);
		padding-left: 2rem;
		background: rgba(255, 0, 128, 0.05);
		border-radius: 0 8px 8px 0;
	}

	/* Custom scrollbar for bio text */
	.bio-flow-container::-webkit-scrollbar {
		width: 6px;
	}

	.bio-flow-container::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 3px;
	}

	.bio-flow-container::-webkit-scrollbar-thumb {
		background: rgba(255, 0, 128, 0.5);
		border-radius: 3px;
	}

	.bio-flow-container::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 0, 128, 0.8);
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

	/* Responsive text sizing */
	@media (min-width: 1536px) {
		.bio-text {
			font-size: 1.125rem;
			line-height: 1.9;
		}
	}
</style>