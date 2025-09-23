<script>
	export let scrollY;
	export let innerHeight;
	export let projectsHeight;
	export let adaptiveTextClass;
	export let adaptiveSubTextClass;

	// Calculate opacity based on scroll position
	$: bioOpacity = Math.max(0, Math.min(1, (scrollY - innerHeight * 0.2) / (innerHeight * 0.2)));
	
	// Calculate minimum height to match projects section
	$: minBioHeight = Math.max(projectsHeight/2, innerHeight * 0.8);
</script>

<!-- Right side - Biographical text -->
<div class="biographical-text">
	<div class="bio-flow-container" 
		 style="opacity: {bioOpacity}; min-height: {minBioHeight}px;">
		
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
				<p>Paweł Knorps jest aktywnym muzykiem na polskiej i duńskiej scenie. Niedawno obronił dyplom magisterski z gitary jazzowej na poznańskiej Akademii, a niedługo później również dyplom magisterski z kompozycji jazzowej na prestiżowej uczelni Danish National Academy of Music w Odense.</p>
				
				<p>Jest głównie muzykiem improwizującym – zawodowo gitarzystą, ale również basistą, producentem muzycznym i kompozytorem. Interesuje go szczególnie tworzenie muzyki, która przekracza utrwalone granice. Kluczowa jest dla niego swobodna ekspresja i niczym nieskrępowana kreatywność.</p>
				
				<p>Jego nowy projekt to oryginalny jazzowy materiał grany z poznańskimi jazzmanami – Krzysztofem Dysem, Dawidem Tokłowiczem, Piotrem Cienkowskim, Kajetanem Pilarskim. Działają pod nazwą <span class="text-[#FF0080] font-semibold">Pawel Knorps Group</span>, jest to debiutancki projekt Pawła jako lidera i kompozytora muzyki jazzowej.</p>
				
				<p>Są jednym z sześciu finalistów Blue Note Competition 2024, gdzie zostali wybrani spośród prawie 50 zespołów jazzowych z Europy.</p>
				
				<p>Paweł jest głęboko zaangażowany w tworzenie miejskiej tkanki kulturalnej Poznania. Od 2019 roku jest jedną z osób zarządzających i tworzących <span class="text-[#FF0080] font-semibold">Kołorking Muzyczny</span> na Św. Marcinie 75.</p>
				
				<p>Zorganizował tam kilkadziesiąt wydarzeń – koncertów, warsztatów, spotkań, prób muzycznych. Jest to oddolna inicjatywa, która wspiera społeczeństwo w rozwoju muzycznym bez barier – bez kosztów finansowych i ze wsparciem mentorskim.</p>
				
				<p>Jego poboczną pasją jest produkcja i tworzenie muzyki elektronicznej jako <span class="text-[#FF0080] font-semibold">enthymeme</span>. Grał improwizowaną, eksperymentalną tkankę dźwiękową w takich klubach jak: Dom Technika, Farby, My, Mózg Bydgoszcz.</p>
				
				<p>Obecnie po powrocie do Poznania w czerwcu 2024 ze studiów w Danii dołączył do poznańskich projektów: Milomi, SNY, MUIZK NVA LAB, Domsun.</p>
			</div>

			<div class="achievements-section mt-16">
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
			</div>
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
		margin-top: 25rem;
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