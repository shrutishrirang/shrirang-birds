import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { bird } from './sanity/schema/bird'
import { wildlife } from './sanity/schema/wildlife'
import { dashboardTool } from '@sanity/dashboard'
import { vercelAnalyticsWidget } from './sanity/widgets/VercelAnalyticsWidget'

export default defineConfig({
  name: 'shrirang-birds-studio',
  title: 'Shrirang Birds — Studio',

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',

  plugins: [
    structureTool({
      // Custom sidebar structure: dynamically fetched, sorted by Taxonomic Order
      structure: async (S, context) => {
        const client = context.getClient({ apiVersion: '2024-01-01' })

        // Fetch countries for both birds and wildlife for their "By Country" views
        const [birdCountries, wildlifeCountries]: [string[], string[]] = await Promise.all([
          client.fetch(`array::unique(*[_type == "bird" && defined(country)].country)`),
          client.fetch(`array::unique(*[_type == "wildlife" && defined(country)].country)`),
        ])
        const sortedBirdCountries = (birdCountries || []).filter(Boolean).sort()
        const sortedWildlifeCountries = (wildlifeCountries || []).filter(Boolean).sort()

        return S.list()
          .title('Content')
          .items([
            // ── Birds ────────────────────────────────────────────────────────
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
              .title('Birds by Country')
              .child(
                S.list()
                  .title('Birds by Country')
                  .items(
                    sortedBirdCountries.map((c) =>
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

            S.divider(),

            // ── Wildlife ─────────────────────────────────────────────────────
            S.listItem()
              .title('All Wildlife')
              .schemaType('wildlife')
              .child(
                S.documentList()
                  .title('All Wildlife')
                  .schemaType('wildlife')
                  .filter('_type == "wildlife"')
                  .defaultOrdering([{ field: 'commonName', direction: 'asc' }])
              ),
            S.divider(),
            S.listItem()
              .title('Wildlife by Country')
              .child(
                S.list()
                  .title('Wildlife by Country')
                  .items(
                    sortedWildlifeCountries.map((c) =>
                      S.listItem()
                        .title(c)
                        .child(
                          S.documentList()
                            .title(c)
                            .schemaType('wildlife')
                            .filter('_type == "wildlife" && country == $country')
                            .params({ country: c })
                            .defaultOrdering([{ field: 'commonName', direction: 'asc' }])
                        )
                    )
                  )
              ),
          ])
      },
    }),
    visionTool(), // lets you run GROQ queries directly — useful for debugging
    dashboardTool({
      widgets: [
        vercelAnalyticsWidget(),
      ],
    }),
  ],

  schema: {
    types: [bird, wildlife],
  },
})
