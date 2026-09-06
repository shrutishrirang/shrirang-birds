'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import type { Bird, SanityImageAsset } from '@/types'
import { fullImageUrl } from '@/sanity/lib/image'
import { parseFamily } from '@/lib/parseFamily'
import SlideshowConfig, { type SlideshowSettings } from './SlideshowConfig'

// ── Internal slide unit (1 Bird = 1 Slide) ──────────────────────────────────
interface Slide {
  bird: Bird
  imageUrl: string
  secondImageUrl: string | null
}

function getBirdImageUrl(img?: SanityImageAsset | null): string {
  if (!img) return ''
  return img.asset ? fullImageUrl(img) : (img.url ?? '')
}

// ── Helper: build + shuffle slide pool ────────────────────────────────────────
function buildSlides(birds: Bird[], country: string): Slide[] {
  const filtered = birds.filter((b) => {
    if (!b.images || b.images.length === 0) return false
    const firstImg = b.images[0]
    if (!firstImg?.asset?._ref && !firstImg?.url) return false
    if (country !== 'All' && b.country !== country) return false
    return true
  })

  // 1 Bird = 1 Slide (using primary photo, with optional secondary photo)
  const slides: Slide[] = filtered.map((bird) => {
    const firstImg = bird.images[0]
    const secondImg = bird.images.length > 1 && (bird.images[1]?.asset?._ref || bird.images[1]?.url)
      ? bird.images[1]
      : null
    return {
      bird,
      imageUrl: getBirdImageUrl(firstImg),
      secondImageUrl: secondImg ? getBirdImageUrl(secondImg) : null,
    }
  })

  // Fisher-Yates shuffle
  for (let i = slides.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[slides[i], slides[j]] = [slides[j], slides[i]]
  }

  return slides
}

// ── Props ──────────────────────────────────────────────────────────────────────
interface Props {
  birds: Bird[]
  initialSettings: SlideshowSettings
  onClose: () => void
}

type AnimState = 'idle' | 'entering'

export default function BirdSlideshow({ birds, initialSettings, onClose }: Props) {
  const [settings, setSettings]         = useState<SlideshowSettings>(initialSettings)
  const [showConfig, setShowConfig]     = useState(false)
  const [slides, setSlides]             = useState<Slide[]>(() => buildSlides(birds, initialSettings.country))
  const [index, setIndex]               = useState(0)
  const [activePhotoIndex, setActivePhotoIndex] = useState(0) // 0: primary, 1: secondary
  const [paused, setPaused]             = useState(false)
  const [progress, setProgress]         = useState(0) // 0-100
  const [animState, setAnimState]       = useState<AnimState>('idle')
  const [prevIndex, setPrevIndex]       = useState<number | null>(null)

  const slidesRef       = useRef(slides)
  slidesRef.current     = slides
  const indexRef        = useRef(index)
  indexRef.current      = index

  const timerRef        = useRef<ReturnType<typeof setInterval> | null>(null)
  const progressRef     = useRef<ReturnType<typeof setInterval> | null>(null)
  const animTimeoutRef  = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Rebuild slides when country filter changes ───────────────────────────────
  useEffect(() => {
    const newSlides = buildSlides(birds, settings.country)
    setSlides(newSlides)
    setIndex(0)
    setActivePhotoIndex(0)
    setPrevIndex(null)
    setProgress(0)
    setAnimState('idle')
  }, [birds, settings.country])

  // ── Clean advance handler (decoupled, strict-mode safe) ───────────────────────
  const advance = useCallback((dir: 'next' | 'prev' = 'next') => {
    const sl = slidesRef.current
    if (sl.length === 0) return

    const cur = indexRef.current
    const next = dir === 'next'
      ? (cur + 1) % sl.length
      : (cur - 1 + sl.length) % sl.length

    if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current)

    setPrevIndex(cur)
    setIndex(next)
    setActivePhotoIndex(0) // Reset to primary photo on slide change
    setAnimState('entering')
    setProgress(0)

    animTimeoutRef.current = setTimeout(() => {
      setAnimState('idle')
    }, 750)
  }, [])

  // ── Auto-advance interval ─────────────────────────────────────────────────────
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (progressRef.current) clearInterval(progressRef.current)

    const { intervalMs } = settings
    setProgress(0)

    timerRef.current = setInterval(() => {
      advance('next')
    }, intervalMs)

    // Progress ticks every ~50ms for smooth animation
    const ticks = intervalMs / 50
    let tick = 0
    progressRef.current = setInterval(() => {
      tick++
      setProgress(Math.min((tick / ticks) * 100, 100))
    }, 50)
  }, [advance, settings])

  const stopTimer = useCallback(() => {
    if (timerRef.current)    clearInterval(timerRef.current)
    if (progressRef.current) clearInterval(progressRef.current)
  }, [])

  // ── Start/stop timer based on paused state ────────────────────────────────────
  useEffect(() => {
    if (paused || slides.length === 0) {
      stopTimer()
    } else {
      startTimer()
    }
    return stopTimer
  }, [paused, slides.length, settings.intervalMs, startTimer, stopTimer])

  // ── Cleanup animation timeout on unmount ──────────────────────────────────────
  useEffect(() => {
    return () => {
      if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current)
    }
  }, [])

  // ── Keyboard shortcuts ────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (showConfig) return
      switch (e.key) {
        case 'Escape':      onClose(); break
        case ' ':           e.preventDefault(); setPaused((p) => !p); break
        case 'ArrowRight':  advance('next'); break
        case 'ArrowLeft':   advance('prev'); break
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, advance, showConfig])

  // ── Lock body scroll ──────────────────────────────────────────────────────────
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // ── Apply new settings from config modal ──────────────────────────────────────
  const handleSettingsUpdate = useCallback((newSettings: SlideshowSettings) => {
    setSettings(newSettings)
    setShowConfig(false)
    setPaused(false)
  }, [])

  // ── Current, previous, and next slides ───────────────────────────────────────
  const current = slides[index] ?? null
  const previous = prevIndex !== null ? slides[prevIndex] : null
  const nextSlide = slides.length > 1 ? slides[(index + 1) % slides.length] : null

  const currentImageUrl = activePhotoIndex === 1 && current?.secondImageUrl
    ? current.secondImageUrl
    : current?.imageUrl ?? ''

  const previousImageUrl = previous?.imageUrl ?? ''

  const { code: familyCode, common: familyCommon } = current
    ? parseFamily(current.bird.family)
    : { code: '', common: '' }

  const t = settings.transition

  const metaRows = current ? [
    { label: 'Country',         value: current.bird.country },
    { label: 'Family',          value: familyCode },
    { label: '',                value: familyCommon ? `(${familyCommon})` : '', italic: true },
    { label: 'Taxonomic Order', value: current.bird.taxonomicOrder?.toString() },
  ].filter((r) => r.value) : []

  if (slides.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-bark-dark/95 flex items-center justify-center">
        <div className="text-center">
          <p className="font-display font-light text-xl text-parchment-300 tracking-wide">
            No slides available
          </p>
          <p className="font-body text-sm text-parchment-300/60 mt-2 mb-8">
            No birds with photos match the selected filter.
          </p>
          <button
            onClick={onClose}
            className="font-display font-light text-xs tracking-widest2 uppercase text-parchment-50 border border-parchment-300 px-6 py-2.5 hover:border-parchment-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* ── Main slideshow overlay ─────────────────────────────────────────────── */}
      <div
        className="fixed inset-0 z-50 bg-bark-dark flex flex-col md:flex-row overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Bird slideshow"
      >

        {/* ── Left: image area ───────────────────────────────────────────────── */}
        <div className="relative flex-1 bg-black min-h-[50vh] md:min-h-0 overflow-hidden">

          {/* Previous slide layer (fades out underneath) */}
          {previous && animState === 'entering' && previousImageUrl && (
            <div
              key={`prev-${previousImageUrl}-${prevIndex}`}
              className="absolute inset-0 slideshow-leave pointer-events-none z-0"
            >
              <Image
                src={previousImageUrl}
                alt={previous.bird.commonName}
                fill
                className="object-contain"
                unoptimized
                priority
              />
            </div>
          )}

          {/* Current slide layer (fades / slides in on top with unique key) */}
          {current && currentImageUrl && (
            <div
              key={`curr-${currentImageUrl}-${index}`}
              className={`absolute inset-0 z-[1] ${
                animState === 'entering'
                  ? t === 'crossfade'
                    ? 'slideshow-enter-crossfade'
                    : t === 'slide-left'
                    ? 'slideshow-enter-slide'
                    : 'slideshow-enter-crossfade'
                  : 'opacity-100'
              }`}
            >
              <Image
                src={currentImageUrl}
                alt={current.bird.commonName}
                fill
                className={`object-contain ${t === 'ken-burns' ? 'ken-burns-img' : ''}`}
                sizes="(max-width: 768px) 100vw, 65vw"
                unoptimized
                priority
              />
            </div>
          )}

          {/* Silently pre-load the upcoming slide so it transitions with zero delay */}
          {nextSlide && nextSlide.imageUrl && (
            <div className="hidden" aria-hidden="true">
              <Image
                src={nextSlide.imageUrl}
                alt=""
                width={1}
                height={1}
                priority
                unoptimized
              />
            </div>
          )}

          {/* Second photo thumbnail toggle (if this bird has 2 photos) */}
          {current && current.secondImageUrl && (
            <button
              onClick={() => setActivePhotoIndex((cur) => (cur === 0 ? 1 : 0))}
              className="absolute bottom-4 right-4 w-16 h-20 border-2 border-parchment-50/80 hover:border-parchment-50 overflow-hidden opacity-85 hover:opacity-100 transition-all cursor-pointer shadow-xl z-20"
              title="Click to toggle between first and second photo"
              aria-label="Toggle photo"
            >
              <Image
                src={activePhotoIndex === 0 ? current.secondImageUrl : current.imageUrl}
                alt={`${current.bird.commonName} — alternate view`}
                fill
                className="object-cover"
                unoptimized
              />
            </button>
          )}

          {/* Top-right controls */}
          <div className="absolute top-3 right-3 flex gap-2 z-20">
            {/* Settings */}
            <button
              onClick={() => { setPaused(true); setShowConfig(true) }}
              className="bg-black/30 hover:bg-black/50 text-parchment-50 w-9 h-9 flex items-center justify-center transition-colors"
              aria-label="Slideshow settings"
              title="Settings"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
            {/* Close */}
            <button
              onClick={onClose}
              className="bg-black/30 hover:bg-black/50 text-parchment-50 w-9 h-9 flex items-center justify-center transition-colors font-display text-xs"
              aria-label="Close slideshow"
            >
              ✕
            </button>
          </div>

          {/* Prev arrow */}
          <button
            onClick={() => advance('prev')}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-parchment-50 w-9 h-9 flex items-center justify-center transition-colors z-20"
            aria-label="Previous slide"
          >
            ←
          </button>

          {/* Play/Pause centre button */}
          <button
            onClick={() => setPaused((p) => !p)}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-parchment-50 w-12 h-12 flex items-center justify-center transition-all duration-300 opacity-0 hover:opacity-100 focus:opacity-100 rounded-full z-20"
            aria-label={paused ? 'Resume slideshow' : 'Pause slideshow'}
          >
            {paused ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            )}
          </button>

          {/* Next arrow */}
          <button
            onClick={() => advance('next')}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-parchment-50 w-9 h-9 flex items-center justify-center transition-colors z-20"
            aria-label="Next slide"
          >
            →
          </button>

          {/* Pause indicator badge */}
          {paused && (
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black/50 text-parchment-300 font-display font-light text-[10px] tracking-widest uppercase px-3 py-1.5 z-20">
              Paused
            </div>
          )}

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10 z-20">
            <div
              className="h-full bg-forest transition-none"
              style={{ width: `${progress}%`, transition: paused ? 'none' : 'width 50ms linear' }}
            />
          </div>
        </div>

        {/* ── Right: details panel ───────────────────────────────────────────── */}
        <div className="w-full md:w-80 flex flex-col overflow-y-auto bg-black/80 border-t md:border-t-0 md:border-l border-white/10">

          {/* Slide counter */}
          <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-white/10">
            <p className="font-display font-light text-[9px] tracking-widest2 uppercase text-parchment-300">
              {index + 1} / {slides.length}
            </p>
            {/* Pause/play in panel */}
            <button
              onClick={() => setPaused((p) => !p)}
              className="text-parchment-300 hover:text-parchment-50 transition-colors"
              aria-label={paused ? 'Resume' : 'Pause'}
            >
              {paused ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              )}
            </button>
          </div>

          {/* Names */}
          {current && (
            <>
              <div className="px-6 pt-4 pb-5 border-b border-white/10">
                <h2 className="font-display font-light text-xl text-parchment-50 tracking-wide leading-snug">
                  {current.bird.commonName}
                </h2>
                <p className="font-body text-sm italic text-parchment-300 mt-1">
                  {current.bird.scientificName}
                </p>
              </div>

              {/* Metadata table */}
              <div className="px-6 py-5 flex-1">
                <table className="w-full">
                  <tbody>
                    {metaRows.map(({ label, value, italic }) => (
                      <tr key={`${label}-${value}`} className="align-top">
                        {label ? (
                          <td className="font-display font-light text-[10px] tracking-widest uppercase text-parchment-300 py-2 pr-4 whitespace-nowrap w-1/2">
                            {label}
                          </td>
                        ) : <td />}
                        <td className={`font-body text-sm text-parchment-50 py-2 ${italic ? 'italic text-parchment-300 text-xs' : ''}`}>
                          {value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Footer hint */}
          <div className="px-6 py-4 border-t border-white/10 hidden md:block">
            <p className="font-display font-light text-[9px] tracking-widest2 uppercase text-parchment-300">
              Space to pause · ← → to navigate · Esc to exit
            </p>
          </div>
        </div>
      </div>

      {/* ── Config popup (re-configure mid-session) ───────────────────────────── */}
      {showConfig && (
        <div className="relative z-[60]">
          <SlideshowConfig
            birds={birds}
            onStart={handleSettingsUpdate}
            onClose={() => { setShowConfig(false); setPaused(false) }}
          />
        </div>
      )}
    </>
  )
}
