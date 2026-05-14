import type { Metadata } from 'next'
import { client } from '@/sanity/lib/client'
import { BIRD_COUNT_QUERY } from '@/sanity/lib/queries'

export const metadata: Metadata = {
  title: 'About — Shrirang Mukta',
  description: 'About Shrirang Mukta — bird photographer and curious birder.',
}

export const revalidate = 3600

export default async function AboutPage() {
  let count = 0
  try {
    count = await client.fetch(BIRD_COUNT_QUERY)
  } catch (err) {
    console.error('Failed to fetch bird count:', err)
  }
  return (
    <main className="min-h-screen">
      {/* Header */}
      <div className="bg-parchment-200 border-b border-parchment-300 pt-28 pb-10 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="font-display font-light text-[10px] tracking-widest3 uppercase text-forest mb-2">
            The Photographer
          </p>
          <h1 className="font-display font-thin text-4xl md:text-5xl text-bark-DEFAULT tracking-wide">
            About
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-16 pb-24">

        {/* Bio */}
        <div className="mb-16">
          <div className="w-12 h-px bg-forest mb-8" />
          <p className="font-body text-base text-bark-mid leading-relaxed mb-4">
            Shrirang Mukta is a bird photographer and passionate naturalist whose lens has followed
            over {count.toLocaleString()} species across five countries — India, Kenya, Costa Rica,
            Colombia, and Vietnam.
          </p>
          <p className="font-body text-base text-bark-mid leading-relaxed mb-4">
            Every photograph here is a lifer — a species encountered for the first time, each one
            a small triumph of patience, timing, and an enduring curiosity about the natural world.
            This database is a living record of that curiosity.
          </p>
          <p className="font-body text-base text-bark-mid leading-relaxed">
            What began as quiet mornings in the field has grown into a body of work spanning
            continents, habitats, and thousands of hours of watching.
          </p>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-16">
          <div className="flex-1 h-px bg-parchment-300" />
          <span className="font-display font-light text-[10px] tracking-widest3 uppercase text-bark-light">
            Get in touch
          </span>
          <div className="flex-1 h-px bg-parchment-300" />
        </div>

        {/* Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Email */}
          <ContactCard
            label="Email"
            href="mailto:thatsmeshri@live.com"
            display="thatsmeshri@live.com"
            description="For prints, collaborations, or just to talk birds."
          />

          {/* Instagram */}
          <ContactCard
            label="Instagram"
            href="https://instagram.com/thatsmeshrirang"
            display="@thatsmeshrirang"
            description="Field notes and photographs from recent trips."
          />

          {/* Facebook */}
          <ContactCard
            label="Facebook"
            href="https://www.facebook.com/thatsmeshri"
            display="Shrirang Mukta"
            description="Updates, albums, and birding stories."
          />
        </div>

        {/* Footer note */}
        <div className="mt-16 pt-8 border-t border-parchment-300 flex items-center gap-4">
          <div className="w-6 h-px bg-forest" />
          <p className="font-display font-light text-[10px] tracking-widest uppercase text-bark-light">
            All photographs © Shrirang Mukta. All rights reserved.
          </p>
        </div>
      </div>
    </main>
  )
}

function ContactCard({
  label,
  href,
  display,
  description,
}: {
  label: string
  href: string
  display: string
  description: string
}) {
  return (
    <a
      href={href}
      target={href.startsWith('mailto') ? undefined : '_blank'}
      rel="noopener noreferrer"
      className="group block border border-parchment-300 p-6 hover:border-forest transition-colors duration-300"
    >
      <p className="font-display font-light text-[9px] tracking-widest3 uppercase text-forest mb-3">
        {label}
      </p>
      <p className="font-display font-light text-sm text-bark-DEFAULT group-hover:text-forest transition-colors mb-2 break-all">
        {display}
      </p>
      <p className="font-body text-xs text-bark-light leading-relaxed">
        {description}
      </p>
    </a>
  )
}
