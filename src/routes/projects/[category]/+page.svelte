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
  .category-page {
    min-height: 100vh;
    padding: clamp(1rem, 4vw, 4rem);
    color: var(--text-1);
    background:
      radial-gradient(circle at 16% 8%, rgba(109, 170, 255, 0.18), transparent 34%),
      radial-gradient(circle at 88% 88%, rgba(255, 78, 163, 0.16), transparent 38%),
      #060910;
  }

  .category-page h1 {
    margin: 0.8rem 0 0;
    font-family: var(--font-display);
    font-size: var(--step-4);
    line-height: 1.16;
    letter-spacing: 0.01em;
    font-weight: 600;
  }

  .back-link {
    color: var(--accent-cyan);
    font-family: var(--font-label);
    font-size: var(--step--1);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    text-decoration: none;
    border-bottom: 1px solid rgba(143, 214, 255, 0.42);
  }

  .back-link:hover {
    color: #c6ebff;
    border-bottom-color: #c6ebff;
  }

  .grid {
    margin-top: 1.25rem;
    display: grid;
    gap: 0.9rem;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }

  .card {
    border: 1px solid var(--stroke-soft);
    border-radius: var(--radius-md);
    padding: 1rem;
    background: linear-gradient(140deg, rgba(10, 16, 30, 0.72), rgba(9, 14, 26, 0.8));
    color: var(--text-1);
    box-shadow: var(--shadow-soft);
    transition:
      transform var(--dur-fast) var(--ease-emph),
      border-color var(--dur-fast) var(--ease-std),
      box-shadow var(--dur-fast) var(--ease-std);
  }

  .card:hover {
    transform: translateY(-2px);
    border-color: var(--stroke-strong);
    box-shadow: 0 18px 38px rgba(2, 5, 14, 0.45);
  }

  .card p {
    margin: 0;
    font-family: var(--font-label);
    font-size: var(--step--1);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #ff7fbe;
  }

  .card h2 {
    margin: 0.45rem 0 0;
    font-family: var(--font-display);
    font-size: var(--step-2);
    line-height: 1.3;
    letter-spacing: 0.006em;
    font-weight: 600;
  }
</style>
