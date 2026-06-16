import { client } from '@/sanity/lib/client'
import { ALL_WILDLIFE_QUERY, WILDLIFE_COUNT_QUERY } from '@/sanity/lib/queries'
import WildlifeGrid from '@/components/WildlifeGrid'
import type { Wildlife } from '@/types'
import type { Metadata } from 'next'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Wildlife — Shrirang Mukta',
  description:
    'Wildlife photography by Shrirang Mukta — mammals, reptiles, amphibians, insects and more documented across India, Kenya, Costa Rica, Colombia, and Vietnam.',
  alternates: { canonical: '/wildlife' },
}

export default async function WildlifePage() {
  let wildlife: Wildlife[] = []
  let count = 0

  try {
    ;[wildlife, count] = await Promise.all([
      client.fetch(ALL_WILDLIFE_QUERY),
      client.fetch(WILDLIFE_COUNT_QUERY),
    ])
  } catch (err) {
    console.error('Failed to fetch wildlife from Sanity:', err)
  }

  return (
    <main className="min-h-screen">
      {/* Page header */}
      <div className="bg-parchment-200 border-b border-parchment-300 pt-28 pb-10 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="font-display font-light text-[10px] tracking-widest3 uppercase text-forest mb-2">
            Nature
          </p>
          <h1 className="font-display font-thin text-4xl md:text-5xl text-bark-DEFAULT tracking-wide mb-6">
            Wildlife
          </h1>

          {/* Stats strip */}
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            <div>
              <span className="font-display font-light text-2xl text-bark-DEFAULT">
                {count.toLocaleString()}
              </span>
              <span className="font-body text-xs text-bark-light ml-2 uppercase tracking-wider">
                Species documented
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery grid */}
      <WildlifeGrid wildlife={wildlife} />
    </main>
  )
}
