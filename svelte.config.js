import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// Replace adapter-auto with the static adapter.
		adapter: adapter({
			// The fallback option is useful for Single-Page Applications (SPAs)
			// to handle client-side routing on a static host.
			fallback: '404.html'
		})
	}
};

export default config;
