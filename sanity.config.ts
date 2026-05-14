import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { bird } from './sanity/schema/bird'

export default defineConfig({
  name: 'shrirang-birds-studio',
  title: 'Shrirang Birds — Studio',

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',

  plugins: [
    structureTool({
      // Custom sidebar structure: one list, sorted by Taxonomic Order
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('All Birds')
              .schemaType('bird')
              .child(
                S.documentList()
                  .title('All Birds')
                  .schemaType('bird')
                  .filter('_type == "bird"')
                  .defaultOrdering([
                    { field: 'taxonomicOrder', direction: 'asc' },
                  ])
              ),
            S.divider(),
            S.listItem()
              .title('By Country')
              .child(
                S.list()
                  .title('By Country')
                  .items(
                    ['India', 'Kenya', 'Costa Rica', 'Colombia', 'Vietnam'].map((c) =>
                      S.listItem()
                        .title(c)
                        .child(
                          S.documentList()
                            .title(c)
                            .schemaType('bird')
                            .filter('_type == "bird" && country == $country')
                            .params({ country: c })
                            .defaultOrdering([{ field: 'commonName', direction: 'asc' }])
                        )
                    )
                  )
              ),
          ]),
    }),
    visionTool(), // lets you run GROQ queries directly — useful for debugging
  ],

  schema: {
    types: [bird],
  },
})
