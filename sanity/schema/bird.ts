import { defineField, defineType } from 'sanity'

export const bird = defineType({
  name: 'bird',
  title: 'Bird',
  type: 'document',

  // How the entry title appears in Sanity Studio list view
  preview: {
    select: {
      title: 'commonName',
      subtitle: 'country',
      media: 'images.0',
    },
  },

  // Sort by taxonomic order in Studio
  orderings: [
    {
      title: 'Taxonomic Order',
      name: 'taxonomicOrderAsc',
      by: [{ field: 'taxonomicOrder', direction: 'asc' }],
    },
    {
      title: 'Common Name A–Z',
      name: 'commonNameAsc',
      by: [{ field: 'commonName', direction: 'asc' }],
    },
    {
      title: 'Country',
      name: 'countryAsc',
      by: [{ field: 'country', direction: 'asc' }, { field: 'commonName', direction: 'asc' }],
    },
  ],

  fields: [
    // ── From CSV ──────────────────────────────────────────────────────────────
    defineField({
      name: 'rowNumber',
      title: 'Row #',
      type: 'number',
      readOnly: true,
      description: 'Original row number from the eBird export. Do not edit.',
    }),
    defineField({
      name: 'commonName',
      title: 'Common Name',
      type: 'string',
      validation: (Rule) => Rule.required().error('Common name is required'),
    }),
    defineField({
      name: 'scientificName',
      title: 'Scientific Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'country',
      title: 'Country',
      type: 'string',
      options: {
        list: [
          { title: 'India', value: 'India' },
          { title: 'Kenya', value: 'Kenya' },
          { title: 'Costa Rica', value: 'Costa Rica' },
          { title: 'Colombia', value: 'Colombia' },
          { title: 'Vietnam', value: 'Vietnam' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'taxonomicOrder',
      title: 'Taxonomic Order',
      type: 'number',
      description: 'eBird taxonomic sequence number. Used for sorting.',
    }),
    defineField({
      name: 'family',
      title: 'Family',
      type: 'string',
      description: 'e.g. "Anatidae (Ducks, Geese, and Waterfowl)"',
    }),
    defineField({
      name: 'isFeatured',
      title: '🌟 Showcase / Star Marked',
      type: 'boolean',
      description: 'Mark this bird to display it at the very top of your gallery grid.',
      initialValue: false,
    }),

    // ── Technical fields required for the website ─────────────────────────────
    defineField({
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      description: 'Auto-generated from Common Name. Used in page URLs.',
      options: {
        source: 'commonName',
        maxLength: 96,
        slugify: (input) =>
          input
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // strip apostrophes, dots, etc.
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim(),
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'images',
      title: 'Photos',
      type: 'array',
      description: 'Up to 2 photos. First image is shown in the grid.',
      options: {
        layout: 'grid',
      },
      of: [
        {
          type: 'image',
          options: {
            // Enables the focal-point/hotspot picker in Sanity Studio.
            // Click the focal point icon on any image to set where the
            // bird's head is — this is used by Option B smart crop later.
            hotspot: true,
          },
        },
      ],
      validation: (Rule) => Rule.max(2),
    }),
  ],
})
