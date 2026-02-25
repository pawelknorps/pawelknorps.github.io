const normalizeText = (value) =>
  String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

export const slugify = (value) =>
  normalizeText(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'project';

export const categoryLabel = (category) => (category === 'music' ? 'Music' : 'Programming');

export const normalizeProject = (project, category, index = 0) => {
  const title = project?.title || `Project ${index + 1}`;
  const slugBase = slugify(title);
  const idSuffix = String(project?.id || index + 1).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 24);
  const slug = idSuffix ? `${slugBase}-${idSuffix}` : slugBase;

  return {
    ...project,
    slug,
    category,
    categoryLabel: categoryLabel(category),
    href: `/projects/${category}/${slug}`
  };
};

export const normalizePortfolioProjects = (portfolioData) => {
  const musicProjects = Array.isArray(portfolioData?.musicProjects)
    ? portfolioData.musicProjects.map((project, index) => normalizeProject(project, 'music', index))
    : [];
  const programmingProjects = Array.isArray(portfolioData?.programmingProjects)
    ? portfolioData.programmingProjects.map((project, index) => normalizeProject(project, 'programming', index))
    : [];

  return { musicProjects, programmingProjects };
};

export const getAllProjects = (portfolioData) => {
  const { musicProjects, programmingProjects } = normalizePortfolioProjects(portfolioData);
  return [...musicProjects, ...programmingProjects];
};

export const findProjectByRoute = (portfolioData, category, slug) =>
  getAllProjects(portfolioData).find((project) => project.category === category && project.slug === slug) || null;
