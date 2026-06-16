import type { Metadata } from 'next'
import { Josefin_Sans, Nunito_Sans } from 'next/font/google'
import localFont from 'next/font/local'
import Navigation from '@/components/Navigation'
import { client } from '@/sanity/lib/client'
import {
  BIRD_COUNT_QUERY,
  WILDLIFE_COUNT_QUERY,
  ALL_UNIQUE_COUNTRIES_QUERY,
} from '@/sanity/lib/queries'
import './globals.css'

const josefin = Josefin_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-josefin',
  display: 'swap',
})

const nunito = Nunito_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-nunito',
  display: 'swap',
})

const maiandra = localFont({
  src: './fonts/maiandra.ttf',
  variable: '--font-maiandra',
  display: 'swap',
})

// ── Cache metadata at the same rate as page data (1 hour)
export const revalidate = 3600

// ── Utility: format ["India", "Kenya", "Costa Rica"] → "India, Kenya and Costa Rica"
function formatCountryList(countries: string[]): string {
  const sorted = [...countries].filter(Boolean).sort()
  if (sorted.length === 0) return 'multiple countries'
  if (sorted.length === 1) return sorted[0]
  return sorted.slice(0, -1).join(', ') + ' and ' + sorted[sorted.length - 1]
}

// ── Dynamic metadata — fetched live from Sanity at build / revalidation time
export async function generateMetadata(): Promise<Metadata> {
  let birdCount = 0
  let wildlifeCount = 0
  let countries: string[] = []

  try {
    ;[birdCount, wildlifeCount, countries] = await Promise.all([
      client.fetch<number>(BIRD_COUNT_QUERY),
      client.fetch<number>(WILDLIFE_COUNT_QUERY),
      client.fetch<string[]>(ALL_UNIQUE_COUNTRIES_QUERY),
    ])
  } catch {
    // Sanity unavailable at build time — fall back to static text
  }

  const total = birdCount + wildlifeCount
  const countryStr = formatCountryList(countries)
  const description =
    total > 0
      ? `A life in photographs. Over ${total.toLocaleString()} species of birds and wildlife documented across ${countryStr}.`
      : 'A life in photographs. Birds and wildlife documented across India, Kenya, Costa Rica, Colombia, and Vietnam.'

  return {
    // metadataBase resolves relative canonical URLs in child pages to absolute ones.
    // Set NEXT_PUBLIC_SITE_URL in your .env.local to your production domain.
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    ),
    title: 'Shrirang Mukta — Photographer',
    description,
    openGraph: {
      title: 'Shrirang Mukta — Photographer',
      description,
      type: 'website',
    },
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${josefin.variable} ${nunito.variable} ${maiandra.variable}`}>
      <body className="bg-parchment-100 font-body text-bark-DEFAULT antialiased">
        <Navigation />
        {children}
      </body>
    </html>
  )
}
