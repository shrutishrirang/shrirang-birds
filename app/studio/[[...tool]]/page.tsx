'use client'

/**
 * Sanity Studio — embedded at /studio
 *
 * Only accessible to users who know the URL AND are logged in to Sanity.
 * Sanity handles authentication automatically.
 *
 * Your father can bookmark this URL to manage the database:
 *   https://your-site.vercel.app/studio
 */

import { NextStudio } from 'next-sanity/studio'
import config from '@/sanity.config'

export const dynamic = 'force-dynamic'

export default function StudioPage() {
  return <NextStudio config={config} />
}
