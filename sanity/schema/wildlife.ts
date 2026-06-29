import { defineField, defineType } from 'sanity'
import { CountryAutocomplete } from './CountryAutocomplete'
import { CompressedImageInput } from './CompressedImageInput'

export const wildlife = defineType({
  name: 'wildlife',
  title: 'Wildlife',
  type: 'document',

  // How the entry title appears in Sanity Studio list view
  preview: {
    select: {
      title: 'commonName',
      subtitle: 'animalGroup',
      media: 'images.0',
    },
  },

  orderings: [
    {
      title: 'Common Name A–Z',
      name: 'commonNameAsc',
      by: [{ field: 'commonName', direction: 'asc' }],
    },
    {
      title: 'Animal Group',
      name: 'animalGroupAsc',
      by: [
        { field: 'animalGroup', direction: 'asc' },
        { field: 'commonName', direction: 'asc' },
      ],
    },
    {
      title: 'Country',
      name: 'countryAsc',
      by: [
        { field: 'country', direction: 'asc' },
        { field: 'commonName', direction: 'asc' },
      ],
    },
  ],

  fields: [
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
      components: {
        input: CountryAutocomplete,
      },
      description: 'Select an existing country or type a new one to add it.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'animalGroup',
      title: 'Animal Group',
      type: 'string',
      options: {
        list: [
          { title: 'Mammal', value: 'Mammal' },
          { title: 'Reptile', value: 'Reptile' },
          { title: 'Amphibian', value: 'Amphibian' },
          { title: 'Fish', value: 'Fish' },
          { title: 'Insect', value: 'Insect' },
          { title: 'Arachnid', value: 'Arachnid' },
          { title: 'Other', value: 'Other' },
        ],
      },
      description: 'Select the broad animal group this species belongs to.',
    }),
    defineField({
      name: 'isFeatured',
      title: '🌟 Showcase / Star Marked',
      type: 'boolean',
      description: 'Mark this wildlife entry to display it at the top of the wildlife gallery.',
      initialValue: false,
    }),
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
            .replace(/[^a-z0-9\s-]/g, '')
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
      description: 'Up to 10 photos. First image is shown in the gallery grid.',
      options: {
        layout: 'grid',
      },
      of: [
        {
          type: 'image',
          options: {
            // Enables the focal-point/hotspot picker in Sanity Studio.
            hotspot: true,
          },
          // Auto-compresses photos to <1 MB / 1600px / 90% quality
          // before upload. Settings: sanity/lib/imageCompression.ts
          components: {
            input: CompressedImageInput,
          },
        },
      ],
      validation: (Rule) => Rule.max(10),
    }),
  ],
})
