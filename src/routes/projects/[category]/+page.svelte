<script>
  import { SITE_NAME } from '$lib/config/site.js';
  export let data;
  const categoryLabel = data.category === 'music' ? 'Music' : 'Programming';
</script>

<svelte:head>
  <title>{categoryLabel} Projects | {SITE_NAME}</title>
  <meta name="description" content={`${categoryLabel} projects by ${SITE_NAME}`} />
</svelte:head>

<main class="category-page">
  <a href="/" class="back-link">← Back to portfolio</a>
  <h1>{categoryLabel} projects</h1>
  <div class="grid">
    {#each data.projects as project}
      <a href={project.href} class="card">
        <p>{project.categoryLabel}</p>
        <h2>{project.title}</h2>
      </a>
    {/each}
  </div>
</main>

<style>
  .category-page { min-height: 100vh; padding: clamp(1rem, 4vw, 4rem); color: #f3f7ff; background: #070911; }
  .back-link { color: #9ed5ff; }
  .grid { margin-top: 1.25rem; display: grid; gap: 0.8rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
  .card { border: 1px solid rgba(255,255,255,0.12); border-radius: 14px; padding: 0.9rem; background: rgba(10,16,28,0.65); color: #f3f7ff; }
  .card p { margin: 0; font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase; color: #ffa8de; }
  .card h2 { margin: 0.4rem 0; font-size: 1.05rem; }
</style>
