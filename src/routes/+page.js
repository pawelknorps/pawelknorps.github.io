export const ssr = false;
export const prerender = true;


const data_portfolio = 'https://api.npoint.io/991be5738a65c25b5d2b';

/** @type {import('./$types').PageLoad} */
export async function load() {
	try {
		const res = await fetch(data_portfolio);
		const portfolioData = await res.json();

		return { portfolioData };
	} catch (error) {
		console.error('Failed to fetch portfolio data:', error);
		return { portfolioData: null };
	}
}