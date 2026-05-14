import { client } from '@/sanity/lib/client'
import { ALL_BIRDS_QUERY, BIRD_COUNT_QUERY } from '@/sanity/lib/queries'
import HeroSection from '@/components/HeroSection'
import BirdGrid from '@/components/BirdGrid'
import type { Bird } from '@/types'

// Revalidate every hour; Sanity webhook can trigger on-demand revalidation too
export const revalidate = 3600

export default async function HomePage() {
  const [birds, count]: [Bird[], number] = await Promise.all([
    client.fetch(ALL_BIRDS_QUERY),
    client.fetch(BIRD_COUNT_QUERY),
  ])

  return (
    <main>
      <HeroSection birdCount={count} />
      <BirdGrid birds={birds} />
    </main>
  )
}
