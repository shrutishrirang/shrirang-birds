import Image from 'next/image'
import type { Bird } from '@/types'
import { gridThumbUrl } from '@/sanity/lib/image'

interface Props {
  bird: Bird
  onClick: (bird: Bird) => void
}

// Placeholder shown when a bird has no photo yet
function NoPhotoCard({ bird, onClick }: Props) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(bird)}
      onKeyDown={(e) => e.key === 'Enter' && onClick(bird)}
      className="bird-card relative cursor-pointer overflow-hidden bg-parchment-200 group"
      style={{ aspectRatio: '3/4' }}
      aria-label={`View ${bird.commonName}`}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
        <span className="text-4xl opacity-20 mb-3" aria-hidden>🐦</span>
        <p className="font-display font-light text-xs text-bark-light tracking-wide leading-snug">
          {bird.commonName}
        </p>
      </div>
    </div>
  )
}

export default function BirdCard({ bird, onClick }: Props) {
  const firstImage = bird.images?.[0]

  if (!firstImage?.asset?._ref && !firstImage?.url) {
    return <NoPhotoCard bird={bird} onClick={onClick} />
  }

  // Generate thumbnail URL via Sanity CDN
  const thumbUrl = firstImage.asset
    ? gridThumbUrl(firstImage)
    : (firstImage.url ?? '')

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(bird)}
      onKeyDown={(e) => e.key === 'Enter' && onClick(bird)}
      className="bird-card relative cursor-pointer overflow-hidden group"
      style={{ aspectRatio: '3/4' }}
      aria-label={`View ${bird.commonName}`}
    >
      {/* Photo — CSS handles the 3:4 crop (Option A smart crop) */}
      <div className="absolute inset-0">
        <Image
          src={thumbUrl}
          alt={bird.commonName}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="bird-card-image object-cover"
          loading="lazy"
          unoptimized // Sanity CDN already optimized the image
        />
      </div>

      {/* Hover overlay — gradient + name */}
      <div className="bird-card-overlay absolute inset-0 bg-gradient-to-t from-bark-dark/80 via-bark-dark/10 to-transparent flex flex-col justify-end p-3">
        <p className="font-display font-light text-parchment-50 text-xs tracking-wide leading-tight">
          {bird.commonName}
          {bird.isFeatured && (
            <span className="ml-1.5 text-[10px] text-parchment-300" aria-label="Featured">
              ★
            </span>
          )}
        </p>
        <p className="font-body text-parchment-300 text-[10px] italic leading-tight mt-0.5 opacity-80">
          {bird.scientificName}
        </p>
      </div>
    </div>
  )
}
