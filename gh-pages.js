import { publish } from 'gh-pages';

// Dodaj .nojekyll
fs.writeFileSync('build/.nojekyll', '');

publish('build', {
        branch: 'gh-pages',
        repo: 'https://github.com/pawelknorps/pawelknorps.github.io/',
        dotfiles: true,
        user: {
            name: 'pawelknorps',
            email: 'pawel.knorps@gmail.com'
        }
    },
    () => { console.log('Github Page Deployed') }
);
