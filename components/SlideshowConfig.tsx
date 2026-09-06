'use client'

import { useState, useMemo } from 'react'
import type { Bird } from '@/types'

export interface SlideshowSettings {
  country: string
  intervalMs: number
  transition: 'crossfade' | 'slide-left' | 'ken-burns'
}

interface Props {
  birds: Bird[]
  onStart: (settings: SlideshowSettings) => void
  onClose: () => void
}

const INTERVALS = [
  { label: '3s',  ms: 3000 },
  { label: '5s',  ms: 5000 },
  { label: '10s', ms: 10000 },
  { label: '30s', ms: 30000 },
]

const TRANSITIONS: { label: string; value: SlideshowSettings['transition'] }[] = [
  { label: 'Crossfade',   value: 'crossfade'  },
  { label: 'Slide Left',  value: 'slide-left' },
  { label: 'Ken Burns',   value: 'ken-burns'  },
]

export default function SlideshowConfig({ birds, onStart, onClose }: Props) {
  const [country,    setCountry]    = useState<string>('All')
  const [intervalMs, setIntervalMs] = useState<number>(5000)
  const [transition, setTransition] = useState<SlideshowSettings['transition']>('crossfade')

  // Build country list from birds that have at least one image
  const countries = useMemo(() => {
    const birdsWithImages = birds.filter((b) => b.images && b.images.length > 0)
    const set = new Set(birdsWithImages.map((b) => b.country).filter(Boolean))
    return ['All', ...Array.from(set).sort()]
  }, [birds])

  // Count of slides that will be in the pool for the selected config
  const slideCount = useMemo(() => {
    const filtered = birds.filter((b) => {
      if (!b.images || b.images.length === 0) return false
      if (country !== 'All' && b.country !== country) return false
      return true
    })
    // Each photo becomes its own slide
    return filtered.reduce((sum, b) => sum + (b.images?.length ?? 0), 0)
  }, [birds, country])

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 bg-bark-dark/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Slideshow configuration"
    >
      {/* Panel */}
      <div
        className="modal-panel bg-parchment-50 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-7 pb-5 border-b border-parchment-300">
          <div>
            <p className="font-display font-light text-[10px] tracking-widest3 uppercase text-forest mb-1">
              Configure
            </p>
            <h2 className="font-display font-thin text-2xl text-bark-DEFAULT tracking-wide">
              Slideshow
            </h2>
          </div>
          <button
            onClick={onClose}
            className="font-display text-xs tracking-widest text-bark-light hover:text-bark-DEFAULT transition-colors w-8 h-8 flex items-center justify-center"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="px-7 py-6 space-y-7">

          {/* Country filter */}
          <div>
            <p className="font-display font-light text-[10px] tracking-widest3 uppercase text-bark-mid mb-3">
              Country
            </p>
            <div className="flex flex-wrap gap-2">
              {countries.map((c) => (
                <button
                  key={c}
                  onClick={() => setCountry(c)}
                  className={`
                    font-display font-light text-[11px] tracking-widest uppercase px-4 py-2 leading-none
                    border transition-all duration-200
                    ${country === c
                      ? 'bg-forest text-parchment-50 border-forest'
                      : 'bg-transparent text-bark-mid border-parchment-300 hover:border-forest hover:text-forest'}
                  `}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Interval */}
          <div>
            <p className="font-display font-light text-[10px] tracking-widest3 uppercase text-bark-mid mb-3">
              Slide Interval
            </p>
            <div className="flex flex-wrap gap-2">
              {INTERVALS.map(({ label, ms }) => (
                <button
                  key={ms}
                  onClick={() => setIntervalMs(ms)}
                  className={`
                    font-display font-light text-[11px] tracking-widest uppercase px-5 py-2 leading-none
                    border transition-all duration-200
                    ${intervalMs === ms
                      ? 'bg-forest text-parchment-50 border-forest'
                      : 'bg-transparent text-bark-mid border-parchment-300 hover:border-forest hover:text-forest'}
                  `}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Transition style */}
          <div>
            <p className="font-display font-light text-[10px] tracking-widest3 uppercase text-bark-mid mb-3">
              Transition
            </p>
            <div className="flex flex-wrap gap-2">
              {TRANSITIONS.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setTransition(value)}
                  className={`
                    font-display font-light text-[11px] tracking-widest uppercase px-4 py-2 leading-none
                    border transition-all duration-200
                    ${transition === value
                      ? 'bg-forest text-parchment-50 border-forest'
                      : 'bg-transparent text-bark-mid border-parchment-300 hover:border-forest hover:text-forest'}
                  `}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Slide count info */}
          <p className="font-body text-xs text-bark-light">
            {slideCount > 0
              ? `${slideCount} slide${slideCount !== 1 ? 's' : ''} in this pool`
              : 'No slides available for this filter — try selecting All'}
          </p>
        </div>

        {/* Footer CTA */}
        <div className="px-7 pb-7">
          <button
            onClick={() => {
              if (slideCount === 0) return
              onStart({ country, intervalMs, transition })
            }}
            disabled={slideCount === 0}
            className="
              w-full inline-flex items-center justify-center gap-3
              font-display font-light text-xs tracking-widest2 uppercase
              bg-forest text-parchment-50 border border-forest
              px-8 py-3.5
              hover:bg-forest-dark transition-all duration-300
              disabled:opacity-40 disabled:cursor-not-allowed
            "
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
            Start Slideshow
          </button>
        </div>
      </div>
    </div>
  )
}
