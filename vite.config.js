import { sveltekit } from '@sveltejs/kit/vite';

const config = {
	plugins: [sveltekit()],
	build: {
		chunkSizeWarningLimit: 700,
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes('@rnbo/js')) return 'rnbo';
					if (id.includes('three')) return 'three';
					if (id.includes('@sanity/client')) return 'sanity';
				}
			}
		}
	}
};

export default config;
