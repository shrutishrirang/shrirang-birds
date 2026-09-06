'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Bird } from '@/types'
import SlideshowConfig, { type SlideshowSettings } from './SlideshowConfig'
import BirdSlideshow from './BirdSlideshow'

interface Props {
  birdCount: number
  birds: Bird[]
}

type ScreenState = 'hero' | 'config' | 'slideshow'

export default function HeroSection({ birdCount, birds }: Props) {
  const [screen,           setScreen]           = useState<ScreenState>('hero')
  const [slideshowSettings, setSlideshowSettings] = useState<SlideshowSettings | null>(null)

  const openConfig    = () => setScreen('config')
  const closeConfig   = () => setScreen('hero')
  const startSlideshow = (settings: SlideshowSettings) => {
    setSlideshowSettings(settings)
    setScreen('slideshow')
  }
  const closeSlideshow = () => {
    setScreen('hero')
    setSlideshowSettings(null)
  }

  return (
    <>
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6">

        {/* Bird silhouette vector background */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero-birds.svg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none opacity-35"
          style={{ mixBlendMode: 'multiply' }}
        />

        {/* Main hero text */}
        <div className="text-center max-w-5xl mx-auto">

          {/* Kicker */}
          <p className="hero-line hero-line-1 font-display font-light text-xs tracking-widest3 uppercase text-forest mb-8">
            Photographer | Avid Birder
          </p>

          {/* Name — the centrepiece (single h1 for SEO correctness) */}
          <h1 className="hero-line hero-line-2 font-maiandra font-thin text-[clamp(3rem,10vw,8rem)] leading-none tracking-widest uppercase text-bark-mid mb-10">
            <span className="block mb-2">Shrirang</span>
            <span className="block">Mukta</span>
          </h1>

          {/* Stats row */}
          <div className="hero-line hero-line-3 flex items-center justify-center gap-6 md:gap-12 mb-12">
            {[
              { value: birdCount.toLocaleString(), label: 'Species' },
              { value: '5', label: 'Countries' },
              { value: '∞', label: 'Curiosity' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="font-display font-light text-2xl md:text-3xl text-forest">
                  {value}
                </div>
                <div className="font-body text-[11px] tracking-widest uppercase text-bark-light mt-1">
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* CTAs — vertically stacked & centered */}
          <div className="hero-line hero-line-4 flex flex-col items-center justify-center gap-3.5">
            {/* Gallery button */}
            <Link
              href="/gallery"
              className="w-64 justify-center inline-flex items-center gap-3 font-display font-light text-xs tracking-widest2 uppercase bg-forest text-parchment-50 border border-forest px-8 py-3 hover:bg-forest-dark transition-all duration-300"
            >
              Explore the Gallery
            </Link>

            {/* Slideshow button */}
            <button
              id="open-slideshow-btn"
              onClick={openConfig}
              className="w-64 justify-center inline-flex items-center gap-3 font-display font-light text-xs tracking-widest2 uppercase bg-forest text-parchment-50 border border-forest px-8 py-3 hover:bg-forest-dark transition-all duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
              Slideshow
            </button>
          </div>
        </div>

        {/* Bottom scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40 animate-bounce">
          <div className="w-px h-8 bg-bark-light" />
        </div>
      </section>

      {/* Config popup */}
      {screen === 'config' && (
        <SlideshowConfig
          birds={birds}
          onStart={startSlideshow}
          onClose={closeConfig}
        />
      )}

      {/* Slideshow overlay */}
      {screen === 'slideshow' && slideshowSettings && (
        <BirdSlideshow
          birds={birds}
          initialSettings={slideshowSettings}
          onClose={closeSlideshow}
        />
      )}
    </>
  )
}
