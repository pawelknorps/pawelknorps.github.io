export const ssr = false;
export const prerender = true;


const data_portfolio = 'https://api.npoint.io/991be5738a65c25b5d2b';

/** @type {import('./$types').PageLoad} */
export async function load() {
	try {
		const res = await fetch(data_portfolio);
		const portfolioData = await res.json();

		// Patch data with new links provided by user
		if (portfolioData && portfolioData.musicProjects) {
			const aktas = portfolioData.musicProjects.find(p => p.id === 'aktas');
			if (aktas) {
				if (!aktas.links) aktas.links = {};
				aktas.links.facebook = 'https://www.facebook.com/aktasfatiherdogan/videos/2203511713478108/';
				// Remove youtube link if it was just a placeholder or keep it if needed, 
				// but the requirement implies we want to show the facebook video.
				// The plan said "priority order: YouTube > Facebook", so if I want FB to show, 
				// I should probably ensure FB is detected or remove the YT link if it's not a real YT link.
				// The current YT link in 'aktas' is an instagram link: "https://www.instagram.com/aktas.erdogan/"
				// My regex won't pick that up as YouTube, so it's fine.
			}

			const enthymematic = portfolioData.musicProjects.find(p => p.id === 'enthymematic-live');
			if (enthymematic) {
				if (!enthymematic.links) enthymematic.links = {};
				enthymematic.links.soundcloud = 'https://soundcloud.com/entymematic/aeo2o3ae';
			}

			const ganavana = portfolioData.musicProjects.find(p => p.id === 'ganavana-pawel-knorps');
			if (ganavana) {
				if (!ganavana.links) ganavana.links = {};
				ganavana.links.facebook = 'https://www.facebook.com/reel/25617457337854047/';
			}
		}

		return { portfolioData };
	} catch (error) {
		console.error('Failed to fetch portfolio data:', error);
		return { portfolioData: null };
	}
}