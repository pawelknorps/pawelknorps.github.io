<script>
	export let src = '';
	export let title = 'Embedded media';
	export let allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
	export let allowfullscreen = true;
	export let loading = 'lazy';
	export let referrerpolicy = 'strict-origin-when-cross-origin';
	export let sandbox = 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms allow-presentation';
	export let width = '100%';
	export let height = '100%';
	export let className = '';
	export let style = '';
</script>

<iframe
	{src}
	{title}
	{allow}
	{allowfullscreen}
	{loading}
	{referrerpolicy}
	{sandbox}
	{width}
	{height}
	class={className}
	{style}
></iframe>
