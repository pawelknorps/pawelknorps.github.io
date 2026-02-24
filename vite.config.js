import { sveltekit } from '@sveltejs/kit/vite';

const config = {
	plugins: [sveltekit()],
	build: {
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes('@rnbo/js')) return 'rnbo';
					if (id.includes('three')) return 'three';
					if (id.includes('@sanity')) return 'sanity';
					if (id.includes('node_modules')) return 'vendor';
				}
			}
		}
	}
};

export default config;
