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
    color: #f3f7ff;
    background:
      radial-gradient(circle at 10% 0%, rgba(67, 118, 255, 0.26), transparent 35%),
      radial-gradient(circle at 90% 100%, rgba(255, 0, 128, 0.2), transparent 45%),
      #070911;
  }

  .back-link {
    display: inline-flex;
    margin-bottom: 1.25rem;
    color: #9ed5ff;
  }

  .breadcrumbs {
    display: flex;
    gap: 0.45rem;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: 0.9rem;
    font-size: 0.74rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #9ab8e6;
  }

  .breadcrumbs a {
    color: #9ed5ff;
  }

  .project-shell {
    width: min(820px, 100%);
    padding: clamp(1rem, 3vw, 2rem);
    border-radius: 18px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(7, 12, 24, 0.72);
    backdrop-filter: blur(8px);
  }

  .project-category {
    letter-spacing: 0.18em;
    font-size: 0.72rem;
    text-transform: uppercase;
    color: #ffa8de;
  }

  h1 {
    margin: 0.3rem 0;
    font-size: clamp(1.8rem, 4vw, 2.7rem);
    line-height: 1.2;
  }

  h2 {
    margin: 1.6rem 0 0.7rem;
    font-size: 1rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #b5d2ff;
  }

  ul {
    margin: 0;
    padding-left: 1rem;
    display: grid;
    gap: 0.5rem;
  }

  .project-description {
    margin-top: 1rem;
    line-height: 1.7;
    color: #dce7ff;
  }

  .project-tagline {
    margin-top: 0.7rem;
    color: #a7ffd8;
    line-height: 1.6;
  }

  .project-copy {
    margin: 0;
    line-height: 1.72;
    color: #dce7ff;
  }

  .project-year {
    margin: 0;
    opacity: 0.72;
  }

  .project-links {
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
  }

  .project-links a {
    display: inline-flex;
    font-size: 0.78rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #9ed5ff;
    border-bottom: 1px solid rgba(158, 213, 255, 0.45);
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
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 14px;
    padding: 0.8rem;
    background: rgba(10, 16, 28, 0.65);
    color: #f3f7ff;
  }

  .related-card p {
    margin: 0;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #ffa8de;
  }

  .related-card h3 {
    margin: 0.35rem 0 0;
    font-size: 1rem;
    line-height: 1.4;
  }
</style>
