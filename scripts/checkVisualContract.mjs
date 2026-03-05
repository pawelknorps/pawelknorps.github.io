import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const checks = [
  {
    file: 'src/routes/+page.svelte',
    required: ['HeroSection', 'ProjectsSection', 'BiographicalSection', 'AudioControls', 'SocialBubbles', '<canvas']
  },
  {
    file: 'src/lib/components/ProjectsSection.svelte',
    required: ['project-card', 'ProjectSpherePreview', 'previewImageUrl']
  },
  {
    file: 'src/lib/components/HeroSection.svelte',
    required: ['hero-section', 'adaptive-text', 'hero-title']
  },
  {
    file: 'src/lib/components/AudioControls.svelte',
    required: ['audio-controls', 'Audio Params', 'rnboSliders']
  },
  {
    file: 'src/app.css',
    required: ['@import "tailwindcss";', 'scroll-behavior: smooth;']
  }
];

const errors = [];

for (const check of checks) {
  const absolute = path.join(ROOT, check.file);
  const content = fs.readFileSync(absolute, 'utf8');

  for (const token of check.required) {
    if (!content.includes(token)) {
      errors.push(`${check.file}: missing required visual token "${token}"`);
    }
  }
}

if (errors.length) {
  console.error('❌ Visual contract check failed');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log('✅ Visual contract check passed');
