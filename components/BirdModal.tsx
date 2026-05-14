'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import type { Bird } from '@/types'
import { fullImageUrl } from '@/sanity/lib/image'
import { parseFamily } from '@/lib/parseFamily'

interface Props {
  bird: Bird
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}



export default function BirdModal({ bird, onClose, onPrev, onNext }: Props) {
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const firstImage = bird.images?.[0]
  const secondImage = bird.images?.[1]
  const activeImage = bird.images?.[activeImageIndex] ?? firstImage
  const { code: familyCode, common: familyCommon } = parseFamily(bird.family)

  // Reset to first image when bird changes
  useEffect(() => { setActiveImageIndex(0) }, [bird._id])

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
      aria-label={bird.commonName}
    >
      {/* Panel */}
      <div
        className={`modal-panel bg-parchment-50 flex flex-col md:flex-row overflow-hidden shadow-2xl transition-all duration-300 ${
          isFullscreen 
            ? 'w-screen h-screen md:w-screen md:h-screen md:max-w-none md:max-h-none rounded-none' 
            : 'w-full h-full md:w-[95vw] md:h-[95vh] max-w-none max-h-none md:rounded-sm'
        }`}
        onClick={(e) => e.stopPropagation()}
      >

        {/* ── Left: image area ───────────────────────────────────────────────── */}
        <div className="relative flex-1 bg-parchment-200 min-h-[50vh] md:min-h-0">
          {/* Fullscreen / Close Controls */}
          <div className="absolute top-3 right-3 flex gap-2 z-10">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="bg-parchment-50/80 hover:bg-parchment-50 text-bark-DEFAULT w-9 h-9 flex items-center justify-center transition-colors"
              aria-label={isFullscreen ? "Show Details" : "Hide Details"}
              title={isFullscreen ? "Show Details" : "Hide Details"}
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
                className="bg-parchment-50/80 hover:bg-parchment-50 text-bark-DEFAULT w-9 h-9 flex items-center justify-center transition-colors font-display text-xs"
                aria-label="Close"
              >
                ✕
              </button>
            )}
          </div>

          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={bird.commonName}
              fill
              className="object-contain" // full uncropped view
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
                alt={`${bird.commonName} — ${activeImageIndex === 0 ? 'second' : 'first'} photo`}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          )}

          {/* Prev / Next arrows */}
          <button
            onClick={onPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-parchment-50/80 hover:bg-parchment-50 text-bark-DEFAULT w-9 h-9 flex items-center justify-center transition-colors"
            aria-label="Previous bird"
          >
            ←
          </button>
          <button
            onClick={onNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-parchment-50/80 hover:bg-parchment-50 text-bark-DEFAULT w-9 h-9 flex items-center justify-center transition-colors"
            aria-label="Next bird"
          >
            →
          </button>
        </div>

        {/* ── Right: details panel ───────────────────────────────────────────── */}
        {!isFullscreen && (
        <div className="w-full md:w-80 flex flex-col overflow-y-auto">

          {/* Close button */}
          <div className="flex justify-end p-4 pb-0">
            <button
              onClick={onClose}
              className="font-display text-xs tracking-widest text-bark-light hover:text-bark-DEFAULT transition-colors w-8 h-8 flex items-center justify-center"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* Names */}
          <div className="px-6 pt-2 pb-6 border-b border-parchment-300">
            <h2 className="font-display font-light text-xl text-bark-DEFAULT tracking-wide leading-snug">
              {bird.commonName}
            </h2>
            <p className="font-body text-sm italic text-bark-light mt-1">
              {bird.scientificName}
            </p>
          </div>

          {/* Metadata table */}
          <div className="px-6 py-6 flex-1">
            <table className="w-full">
              <tbody>
                {[
                  { label: 'Country', value: bird.country },
                  { label: 'Family', value: familyCode },
                  { label: '', value: familyCommon ? `(${familyCommon})` : '', italic: true },
                  { label: 'Taxonomic Order', value: bird.taxonomicOrder?.toString() },
                  { label: 'Photos', value: `${bird.images?.length ?? 0} / 2` },
                ].filter(r => r.value).map(({ label, value, italic }) => (
                  <tr key={`${label}-${value}`} className="align-top">
                    {label ? (
                      <td className="font-display font-light text-[10px] tracking-widest uppercase text-bark-light py-2 pr-4 whitespace-nowrap w-1/2">
                        {label}
                      </td>
                    ) : <td />}
                    <td className={`font-body text-sm text-bark-DEFAULT py-2 ${italic ? 'italic text-bark-light text-xs' : ''}`}>
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-parchment-300 hidden md:block">
            <p className="font-display font-light text-[9px] tracking-widest2 uppercase text-bark-light">
              Use ← → arrow keys to navigate
            </p>
          </div>
        </div>
        )}
      </div>
    </div>
  )
}
