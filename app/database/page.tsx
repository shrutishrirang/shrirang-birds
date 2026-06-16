import { client } from '@/sanity/lib/client'
import { ALL_BIRDS_QUERY, ALL_WILDLIFE_QUERY } from '@/sanity/lib/queries'
import DatabaseTabs from '@/components/DatabaseTabs'
import type { Bird, Wildlife } from '@/types'
import type { Metadata } from 'next'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Database — Shrirang Mukta',
  description:
    'Full tabular database of all bird and wildlife species documented by Shrirang Mukta.',
  alternates: { canonical: '/database' },
}

export default async function DatabasePage() {
  const [birds, wildlife]: [Bird[], Wildlife[]] = await Promise.all([
    client.fetch(ALL_BIRDS_QUERY),
    client.fetch(ALL_WILDLIFE_QUERY),
  ])

  return (
    <main className="min-h-screen">
      {/* Page header */}
      <div className="bg-parchment-200 border-b border-parchment-300 pt-28 pb-10 px-6">
        <div className="max-w-7xl mx-auto">
          <p className="font-display font-light text-[10px] tracking-widest3 uppercase text-forest mb-2">
            Life List — Birds &amp; Wildlife
          </p>
          <h1 className="font-display font-thin text-4xl md:text-5xl text-bark-DEFAULT tracking-wide mb-6">
            The Database
          </h1>
        </div>
      </div>

      {/* Tab switcher + tables */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 pb-24">
        <DatabaseTabs birds={birds} wildlife={wildlife} />
      </div>
    </main>
  )
}
