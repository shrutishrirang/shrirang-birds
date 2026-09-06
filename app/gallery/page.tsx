import { client } from '@/sanity/lib/client'
import { ALL_BIRDS_QUERY } from '@/sanity/lib/queries'
import BirdGrid from '@/components/BirdGrid'
import type { Bird } from '@/types'
import type { Metadata } from 'next'

// Revalidate every hour; Sanity webhook can trigger on-demand revalidation too
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Birds Gallery — Shrirang Mukta',
  description:
    'Browse the full birds gallery by Shrirang Mukta. Filter by country, family, or search by species name.',
  alternates: { canonical: '/gallery' },
}

export default async function GalleryPage() {
  let birds: Bird[] = []

  try {
    birds = await client.fetch(ALL_BIRDS_QUERY)
  } catch (err) {
    console.error('Failed to fetch birds from Sanity:', err)
  }

  return (
    <main>
      {/* Page header */}
      <div className="bg-parchment-200 border-b border-parchment-300 pt-28 pb-10 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="font-display font-light text-[10px] tracking-widest3 uppercase text-forest mb-2">
            Shrirang Mukta
          </p>
          <h1 className="font-display font-thin text-4xl md:text-5xl text-bark-DEFAULT tracking-wide">
            Birds Gallery
          </h1>
        </div>
      </div>

      <BirdGrid birds={birds} />
    </main>
  )
}
