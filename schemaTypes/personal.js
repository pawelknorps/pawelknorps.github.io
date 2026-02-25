// schemaTypes/personal.js
import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'personal',
    title: 'Personal Info',
    type: 'document',
    fields: [
        defineField({ name: 'name', title: 'Name', type: 'string' }),
        defineField({ name: 'title', title: 'Job Title', type: 'string' }),
        defineField({ name: 'subtitle', title: 'Subtitle', type: 'string' }),
        defineField({ name: 'bio', title: 'Bio', type: 'text' }),
        defineField({
            name: 'contact',
            title: 'Contact Info',
            type: 'object',
            fields: [
                { name: 'email', type: 'string' },
                { name: 'location', type: 'string' },
                { name: 'github', type: 'url' },
                { name: 'website', type: 'url' }
            ]
        }),
        defineField({
            name: 'image',
            title: 'Profile Picture',
            type: 'image',
            options: { hotspot: true }
        })
    ]
})
