<script>
	import '../app.css';
	import { onMount } from 'svelte';
	import { setupVitals } from '$lib/utils/vitals.js';

	onMount(() => {
		void setupVitals();
	});
</script>

<slot />
