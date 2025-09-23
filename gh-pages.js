import { publish } from 'gh-pages';

// Dodaj .nojekyll
fs.writeFileSync('build/.nojekyll', '');

publish('build', {
        branch: 'gh-pages',
        repo: 'https://github.com/pawo161/portfolio_new',
        dotfiles: true,
        user: {
            name: 'pawo161',
            email: 'pawo161@gmail.com'
        }
    },
    () => { console.log('Github Page Deployed') }
);