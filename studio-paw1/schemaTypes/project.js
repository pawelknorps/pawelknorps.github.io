// schemaTypes/project.js
import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'project',
    title: 'Projects',
    type: 'document',
    fields: [
        defineField({ name: 'title', title: 'Title', type: 'string' }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: { source: 'title' }
        }),
        defineField({
            name: 'category',
            title: 'Category',
            type: 'string',
            options: {
                list: [
                    { title: 'Music', value: 'music' },
                    { title: 'Programming', value: 'programming' }
                ],
                layout: 'radio'
            }
        }),
        defineField({ name: 'type', title: 'Project Type', type: 'string' }),
        defineField({ name: 'year', title: 'Year', type: 'string' }),
        defineField({ name: 'releaseDate', title: 'Release Date', type: 'date' }),
        defineField({ name: 'description', title: 'Description', type: 'text' }),
        defineField({ name: 'funding', title: 'Funding/Grants', type: 'string' }),

        // Lists
        defineField({
            name: 'features',
            title: 'Features',
            type: 'array',
            of: [{ type: 'string' }]
        }),
        defineField({
            name: 'credits',
            title: 'Credits (Music)',
            type: 'array',
            of: [{ type: 'string' }],
            hidden: ({ document }) => document?.category === 'programming'
        }),
        defineField({
            name: 'technologies',
            title: 'Technologies (Code)',
            type: 'array',
            of: [{ type: 'string' }],
            hidden: ({ document }) => document?.category === 'music'
        }),

        // Links
        defineField({
            name: 'links',
            title: 'Links',
            type: 'object',
            fields: [
                { name: 'bandcamp', type: 'url' },
                { name: 'spotify', type: 'url' },
                { name: 'youtube', type: 'url' },
                { name: 'github', type: 'url' },
                { name: 'demo', type: 'url' },
                { name: 'website', type: 'url' },
                { name: 'facebook', type: 'url' },
                { name: 'soundcloud', type: 'url' },
                { name: 'instagram', type: 'url' },
                { name: 'maps', type: 'url' }
            ]
        }),

        // Color (for Three.js)
        defineField({ name: 'color', title: 'Color Hex/Name', type: 'string' }),

        // Cover Image
        defineField({
            name: 'cover',
            title: 'Cover Image',
            type: 'image',
            options: { hotspot: true }
        }),

        // Order Rank (for manual sorting)
        defineField({
            name: 'orderRank',
            title: 'Order Rank',
            type: 'string',
            hidden: true,
        }),

        // Video Aspect Ratio (for correct cropping)
        defineField({
            name: 'videoAspectRatio',
            title: 'Video Aspect Ratio',
            type: 'string',
            options: {
                list: [
                    { title: 'Landscape (16:9)', value: '16:9' },
                    { title: 'Square (1:1)', value: '1:1' },
                    { title: 'Vertical / Reel (9:16)', value: '9:16' }
                ],
                layout: 'radio'
            },
            initialValue: '16:9',
            description: 'Select "Square" for 1:1 videos (like Stan Wody) to crop them correctly. Select "Vertical" for Reels.'
        })
    ]
})
