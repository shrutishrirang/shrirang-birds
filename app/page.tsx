import { client } from '@/sanity/lib/client'
import { ALL_BIRDS_QUERY, BIRD_COUNT_QUERY } from '@/sanity/lib/queries'
import HeroSection from '@/components/HeroSection'
import BirdGrid from '@/components/BirdGrid'
import type { Bird } from '@/types'
import type { Metadata } from 'next'

// Revalidate every hour; Sanity webhook can trigger on-demand revalidation too
export const revalidate = 3600

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

export default async function HomePage() {
  let birds: Bird[] = []
  let count = 0

  try {
    ;[birds, count] = await Promise.all([
      client.fetch(ALL_BIRDS_QUERY),
      client.fetch(BIRD_COUNT_QUERY),
    ])
  } catch (err) {
    console.error('Failed to fetch birds from Sanity:', err)
  }

  return (
    <main>
      <HeroSection birdCount={count} />
      <BirdGrid birds={birds} />
    </main>
  )
}
