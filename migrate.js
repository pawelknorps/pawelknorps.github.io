import slugify from 'slugify';
import fs from 'fs';
import { getWriteClient, requireWriteToken } from './scripts/lib/sanityClient.mjs';

requireWriteToken();

const client = getWriteClient();
const data = JSON.parse(fs.readFileSync('./data.json', 'utf8'));

const mutate = client.transaction();

console.log('🚀 Starting migration...');

console.log('👤 Processing Personal Info...');
mutate.createOrReplace({
    _id: 'personal-info',
    _type: 'personal',
    ...data.personal
});

console.log(`🎵 Processing ${data.musicProjects.length} Music Projects...`);
data.musicProjects.forEach((project) => {
    mutate.create({
        _type: 'project',
        category: 'music',
        status: project.status || 'published',
        title: project.title,
        slug: { _type: 'slug', current: slugify(project.title, { lower: true, strict: true }) },
        type: project.type,
        year: project.year,
        description: project.description,
        features: project.features,
        credits: project.credits,
        funding: project.funding,
        links: project.links,
        color: project.color,
        releaseDate: project.releaseDate,
        publishAt: project.publishAt,
        unpublishAt: project.unpublishAt
    });
});

console.log(`💻 Processing ${data.programmingProjects.length} Programming Projects...`);
data.programmingProjects.forEach((project) => {
    mutate.create({
        _type: 'project',
        category: 'programming',
        status: project.status || 'published',
        title: project.title,
        slug: { _type: 'slug', current: slugify(project.title, { lower: true, strict: true }) },
        type: project.type,
        year: project.year,
        description: project.description,
        features: project.features,
        technologies: project.technologies,
        links: {
            ...(project.links || {}),
            github: project.github || project.links?.github,
            demo: project.demo || project.links?.demo
        },
        color: project.color,
        publishAt: project.publishAt,
        unpublishAt: project.unpublishAt
    });
});

console.log('💾 Committing transaction to Sanity...');
mutate
    .commit()
    .then(() => console.log('✅ Migration successful'))
    .catch((err) => {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    });
