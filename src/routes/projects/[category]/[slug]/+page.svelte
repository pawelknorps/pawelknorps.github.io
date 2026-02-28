<script>
  import { SITE_NAME, SITE_URL } from '$lib/config/site.js';

  export let data;
  const { project, relatedProjects } = data;

  const description = project.description || `${project.title} by ${SITE_NAME}`;
  const canonicalUrl = `${SITE_URL}${project.href}`;
  const title = `${project.title} | ${project.categoryLabel} Project | ${SITE_NAME}`;
  const metaType = project.category === 'music' ? 'MusicRecording' : 'SoftwareSourceCode';
  const projectTagline =
    project.category === 'music'
      ? 'Original performance and composition work blending improvisation, production, and live collaboration.'
      : 'Creative software project designed and built with modern frontend tooling and interactive systems.';
  const defaultRole =
    project.category === 'music'
      ? 'Composer, guitarist, bassist, producer'
      : 'Product design, frontend development, creative coding';
  const processSummary =
    project.category === 'music'
      ? 'Compositional sketches evolved through rehearsal iterations, live testing, and arrangement refinements.'
      : 'Concept validation, interaction prototyping, implementation, and iterative UX/performance optimization.';
  const outcomes = [
    project.year ? `Released/active in ${project.year}` : null,
    project.features?.length ? `Key highlights: ${project.features.join(', ')}` : null,
    project.technologies?.length ? `Technology stack: ${project.technologies.join(', ')}` : null
  ].filter(Boolean);

  $: creativeWorkJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': metaType,
    name: project.title,
    description,
    url: canonicalUrl,
    datePublished: project.year ? String(project.year) : undefined,
    creator: {
      '@type': 'Person',
      name: SITE_NAME,
      url: SITE_URL
    },
    keywords: [...(project.features || []), ...(project.technologies || [])].join(', ')
  });

  $: breadcrumbJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Portfolio',
        item: `${SITE_URL}/`
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: project.categoryLabel,
        item: `${SITE_URL}/projects/${project.category}`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: project.title,
        item: canonicalUrl
      }
    ]
  });

  const entries = Object.entries(project.links || {}).filter(([, value]) => typeof value === 'string' && value && value !== '#');
  const externalPrimary = project.demo || project.github || entries[0]?.[1] || null;
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={canonicalUrl} />
  <meta property="og:type" content="article" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={canonicalUrl} />
  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:title" content={title} />
  <meta property="twitter:description" content={description} />
  <script type="application/ld+json">{creativeWorkJsonLd}</script>
  <script type="application/ld+json">{breadcrumbJsonLd}</script>
</svelte:head>

<main class="project-page">
  <nav class="breadcrumbs" aria-label="Breadcrumb">
    <a href="/">Portfolio</a>
    <span>/</span>
    <a href={`/projects/${project.category}`}>{project.categoryLabel}</a>
    <span>/</span>
    <span aria-current="page">{project.title}</span>
  </nav>
  <a href="/" class="back-link">← Back to portfolio</a>
  <article class="project-shell">
    <p class="project-category">{project.categoryLabel}</p>
    <h1>{project.title}</h1>
    {#if project.year}
      <p class="project-year">{project.year}</p>
    {/if}

    {#if description}
      <p class="project-description">{description}</p>
    {/if}
    <p class="project-tagline">{projectTagline}</p>

    <section>
      <h2>Problem / Brief</h2>
      <p class="project-copy">
        {description}
      </p>
    </section>

    <section>
      <h2>Role & Scope</h2>
      <p class="project-copy">{defaultRole}</p>
    </section>

    <section>
      <h2>Process</h2>
      <p class="project-copy">{processSummary}</p>
    </section>

    {#if outcomes.length > 0}
      <section>
        <h2>Outcomes</h2>
        <ul>
          {#each outcomes as item}
            <li>{item}</li>
          {/each}
        </ul>
      </section>
    {/if}

    {#if project.features?.length}
      <section>
        <h2>Highlights</h2>
        <ul>
          {#each project.features as feature}
            <li>{feature}</li>
          {/each}
        </ul>
      </section>
    {/if}

    {#if project.technologies?.length}
      <section>
        <h2>Technologies</h2>
        <ul>
          {#each project.technologies as tech}
            <li>{tech}</li>
          {/each}
        </ul>
      </section>
    {/if}

    {#if entries.length > 0 || externalPrimary}
      <section>
        <h2>Links</h2>
        <div class="project-links">
          {#if externalPrimary}
            <a href={externalPrimary} target="_blank" rel="noopener noreferrer">Open project ↗</a>
          {/if}
          {#each entries as [label, href]}
            <a href={href} target="_blank" rel="noopener noreferrer">{label} ↗</a>
          {/each}
        </div>
      </section>
    {/if}
  </article>

  {#if relatedProjects.length > 0}
    <section class="related-projects">
      <h2>More projects</h2>
      <div class="related-grid">
        {#each relatedProjects as entry}
          <a href={entry.href} class="related-card">
            <p>{entry.categoryLabel}</p>
            <h3>{entry.title}</h3>
          </a>
        {/each}
      </div>
    </section>
  {/if}
</main>

<style>
  .project-page {
    min-height: 100vh;
    padding: clamp(1rem, 4vw, 4rem);
    color: var(--text-1);
    background:
      radial-gradient(circle at 10% 0%, rgba(67, 118, 255, 0.26), transparent 35%),
      radial-gradient(circle at 90% 100%, rgba(255, 78, 163, 0.2), transparent 45%),
      #070911;
  }

  .back-link {
    display: inline-flex;
    margin-bottom: 1.25rem;
    color: var(--accent-cyan);
    font-family: var(--font-label);
    font-size: var(--step--1);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    border-bottom: 1px solid rgba(143, 214, 255, 0.42);
    text-decoration: none;
  }

  .back-link:hover {
    color: #c8ecff;
    border-bottom-color: #c8ecff;
  }

  .breadcrumbs {
    display: flex;
    gap: 0.45rem;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: 0.9rem;
    font-family: var(--font-label);
    font-size: var(--step--1);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-3);
  }

  .breadcrumbs a {
    color: var(--accent-cyan);
    text-decoration: none;
  }

  .project-shell {
    width: min(820px, 100%);
    padding: clamp(1rem, 3vw, 2rem);
    border-radius: var(--radius-lg);
    border: 1px solid var(--stroke-soft);
    background:
      radial-gradient(circle at 8% 8%, rgba(255, 78, 163, 0.13), transparent 35%),
      radial-gradient(circle at 90% 4%, rgba(143, 214, 255, 0.1), transparent 36%),
      linear-gradient(140deg, rgba(7, 12, 24, 0.8), rgba(9, 13, 25, 0.72));
    backdrop-filter: blur(var(--glass-blur));
    box-shadow: var(--shadow-soft);
  }

  .project-category {
    font-family: var(--font-label);
    letter-spacing: 0.08em;
    font-size: var(--step--1);
    text-transform: uppercase;
    color: #ff8bc8;
  }

  h1 {
    margin: 0.3rem 0;
    font-family: var(--font-display);
    font-size: var(--step-5);
    line-height: 1.12;
    letter-spacing: 0.008em;
    font-weight: 600;
  }

  h2 {
    margin: 1.6rem 0 0.7rem;
    font-family: var(--font-label);
    font-size: var(--step-0);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #b9d8ff;
  }

  ul {
    margin: 0;
    padding-left: 1rem;
    display: grid;
    gap: 0.55rem;
    color: var(--text-2);
    line-height: 1.68;
  }

  .project-description {
    margin-top: 1rem;
    line-height: 1.75;
    color: var(--text-2);
  }

  .project-tagline {
    margin-top: 0.7rem;
    color: var(--accent-mint);
    line-height: 1.6;
  }

  .project-copy {
    margin: 0;
    line-height: 1.75;
    color: var(--text-2);
  }

  .project-year {
    margin: 0;
    opacity: 0.72;
    color: var(--text-3);
  }

  .project-links {
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
  }

  .project-links a {
    display: inline-flex;
    font-family: var(--font-label);
    font-size: var(--step--1);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--accent-cyan);
    text-decoration: none;
    border-bottom: 1px solid rgba(143, 214, 255, 0.45);
  }

  .project-links a:hover {
    color: #d2efff;
    border-bottom-color: #d2efff;
  }

  .related-projects {
    margin-top: 2rem;
  }

  .related-grid {
    display: grid;
    gap: 0.8rem;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  }

  .related-card {
    border: 1px solid var(--stroke-soft);
    border-radius: var(--radius-md);
    padding: 0.95rem;
    background: linear-gradient(140deg, rgba(10, 16, 28, 0.7), rgba(10, 15, 27, 0.58));
    color: var(--text-1);
    text-decoration: none;
    transition:
      transform var(--dur-fast) var(--ease-emph),
      border-color var(--dur-fast) var(--ease-std),
      box-shadow var(--dur-fast) var(--ease-std);
  }

  .related-card:hover {
    transform: translateY(-2px);
    border-color: var(--stroke-strong);
    box-shadow: 0 16px 35px rgba(2, 5, 14, 0.4);
  }

  .related-card p {
    margin: 0;
    font-family: var(--font-label);
    font-size: var(--step--1);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #ff8bc8;
  }

  .related-card h3 {
    margin: 0.42rem 0 0;
    font-family: var(--font-display);
    font-size: var(--step-1);
    line-height: 1.35;
    letter-spacing: 0.006em;
    font-weight: 600;
  }

  @media (max-width: 700px) {
    .project-shell {
      padding: 1rem;
    }

    h1 {
      font-size: var(--step-4);
    }
  }
</style>
