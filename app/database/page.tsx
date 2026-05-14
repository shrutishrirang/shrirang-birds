import { client } from '@/sanity/lib/client'
import { ALL_BIRDS_QUERY } from '@/sanity/lib/queries'
import BirdTable from '@/components/BirdTable'
import type { Bird } from '@/types'
import type { Metadata } from 'next'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Database — Shrirang Mukta',
  description: 'Full tabular database of all bird species photographed by Shrirang Mukta.',
}

export default async function DatabasePage() {
  const birds: Bird[] = await client.fetch(ALL_BIRDS_QUERY)

  // Country breakdown for the stat strip
  const byCountry = birds.reduce<Record<string, number>>((acc, b) => {
    acc[b.country] = (acc[b.country] ?? 0) + 1
    return acc
  }, {})

  return (
    <main className="min-h-screen">
      {/* Page header */}
      <div className="bg-parchment-200 border-b border-parchment-300 pt-28 pb-10 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="font-display font-light text-[10px] tracking-widest3 uppercase text-forest mb-2">
            Life List
          </p>
          <h1 className="font-display font-thin text-4xl md:text-5xl text-bark-DEFAULT tracking-wide mb-6">
            The Database
          </h1>

          {/* Stats strip */}
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            <div>
              <span className="font-display font-light text-2xl text-bark-DEFAULT">
                {birds.length.toLocaleString()}
              </span>
              <span className="font-body text-xs text-bark-light ml-2 uppercase tracking-wider">
                Total species
              </span>
            </div>
            {Object.entries(byCountry)
              .sort((a, b) => b[1] - a[1])
              .map(([country, n]) => (
                <div key={country}>
                  <span className="font-display font-light text-2xl text-bark-DEFAULT">{n}</span>
                  <span className="font-body text-xs text-bark-light ml-2 uppercase tracking-wider">
                    {country}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 pb-24">
        <BirdTable birds={birds} />
      </div>
    </main>
  )
}
