'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import type { Wildlife } from '@/types'
import { fullImageUrl } from '@/sanity/lib/image'

interface Props {
  wildlife: Wildlife
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}

export default function WildlifeModal({ wildlife, onClose, onPrev, onNext }: Props) {
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const firstImage = wildlife.images?.[0]
  const secondImage = wildlife.images?.[1]
  const activeImage = wildlife.images?.[activeImageIndex] ?? firstImage

  // Reset to first image when entry changes
  useEffect(() => { setActiveImageIndex(0) }, [wildlife._id])

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') onNext()
      if (e.key === 'ArrowLeft') onPrev()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, onNext, onPrev])

  // Lock body scroll while modal open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const imageUrl = activeImage?.asset
    ? fullImageUrl(activeImage)
    : (activeImage?.url ?? null)

  return (
    // Backdrop
    <div
      className={`fixed inset-0 z-50 bg-bark-dark/85 backdrop-blur-sm flex items-center justify-center transition-all ${isFullscreen ? 'p-0' : 'p-4 md:p-8'}`}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={wildlife.commonName}
    >
      {/* Panel */}
      <div
        className={`modal-panel bg-black/80 flex flex-col md:flex-row overflow-hidden shadow-2xl transition-all duration-300 ${isFullscreen
          ? 'w-screen h-screen md:w-screen md:h-screen md:max-w-none md:max-h-none rounded-none'
          : 'w-full h-full md:w-[95vw] md:h-[95vh] max-w-none max-h-none md:rounded-sm'
          }`}
        onClick={(e) => e.stopPropagation()}
      >

        {/* ── Left: image area ───────────────────────────────────────────────── */}
        <div className="relative flex-1 bg-transparent min-h-[50vh] md:min-h-0">
          {/* Fullscreen / Close Controls */}
          <div className="absolute top-3 right-3 flex gap-2 z-10">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="bg-black/30 hover:bg-black/50 text-parchment-50 w-9 h-9 flex items-center justify-center transition-colors"
              aria-label={isFullscreen ? 'Show Details' : 'Hide Details'}
              title={isFullscreen ? 'Show Details' : 'Hide Details'}
            >
              {isFullscreen ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" /></svg>
              )}
            </button>
            {isFullscreen && (
              <button
                onClick={onClose}
                className="bg-black/30 hover:bg-black/50 text-parchment-50 w-9 h-9 flex items-center justify-center transition-colors font-display text-xs"
                aria-label="Close"
              >
                ✕
              </button>
            )}
          </div>

          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={wildlife.commonName}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 65vw"
              priority
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="font-display text-bark-light tracking-wide">No photo yet</p>
            </div>
          )}

          {/* Second image thumbnail (if available) — click to swap */}
          {secondImage && (
            <div
              onClick={() => setActiveImageIndex(activeImageIndex === 0 ? 1 : 0)}
              className="absolute bottom-3 right-3 w-16 h-20 border-2 border-parchment-50 overflow-hidden opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
              title="Click to switch photo"
            >
              <Image
                src={(activeImageIndex === 0 ? secondImage : firstImage)?.asset
                  ? fullImageUrl(activeImageIndex === 0 ? secondImage! : firstImage!)
                  : ((activeImageIndex === 0 ? secondImage : firstImage)?.url ?? '')}
                alt={`${wildlife.commonName} — ${activeImageIndex === 0 ? 'second' : 'first'} photo`}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}

          {/* Prev / Next arrows */}
          <button
            onClick={onPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-parchment-50 w-9 h-9 flex items-center justify-center transition-colors"
            aria-label="Previous"
          >
            ←
          </button>
          <button
            onClick={onNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-parchment-50 w-9 h-9 flex items-center justify-center transition-colors"
            aria-label="Next"
          >
            →
          </button>
        </div>

        {/* ── Right: details panel ───────────────────────────────────────────── */}
        {!isFullscreen && (
          <div className="w-full md:w-80 flex flex-col overflow-y-auto bg-black/80 border-t md:border-t-0 md:border-l border-white/10">

            {/* Close button */}
            <div className="flex justify-end p-4 pb-0">
              <button
                onClick={onClose}
                className="font-display text-xs tracking-widest text-parchment-300 hover:text-parchment-50 transition-colors w-8 h-8 flex items-center justify-center"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Names */}
            <div className="px-6 pt-2 pb-6 border-b border-white/10">
              <h2 className="font-display font-light text-xl text-parchment-50 tracking-wide leading-snug">
                {wildlife.commonName}
              </h2>
              <p className="font-body text-sm italic text-parchment-300 mt-1">
                {wildlife.scientificName}
              </p>
            </div>

            {/* Metadata table */}
            <div className="px-6 py-6 flex-1">
              <table className="w-full">
                <tbody>
                  {[
                    { label: 'Country',      value: wildlife.country },
                    { label: 'Animal Group', value: wildlife.animalGroup },
                    { label: 'Photos',       value: `${wildlife.images?.length ?? 0} / 2` },
                  ].filter((r) => r.value).map(({ label, value }) => (
                    <tr key={`${label}-${value}`} className="align-top">
                      <td className="font-display font-light text-[10px] tracking-widest uppercase text-parchment-300 py-2 pr-4 whitespace-nowrap w-1/2">
                        {label}
                      </td>
                      <td className="font-body text-sm text-parchment-50 py-2">
                        {value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/10 hidden md:block">
              <p className="font-display font-light text-[9px] tracking-widest2 uppercase text-parchment-300">
                Use ← → arrow keys to navigate
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
