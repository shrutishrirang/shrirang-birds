import Image from 'next/image'
import type { Wildlife } from '@/types'
import { gridThumbUrl } from '@/sanity/lib/image'

interface Props {
  wildlife: Wildlife
  onClick: (w: Wildlife) => void
}

// Placeholder shown when a wildlife entry has no photo yet
function NoPhotoCard({ wildlife, onClick }: Props) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(wildlife)}
      onKeyDown={(e) => e.key === 'Enter' && onClick(wildlife)}
      className="wildlife-card relative cursor-pointer overflow-hidden bg-parchment-200 group"
      style={{ aspectRatio: '3/4' }}
      aria-label={`View ${wildlife.commonName}`}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
        <span className="text-4xl opacity-20 mb-3" aria-hidden>🐾</span>
        <p className="font-display font-light text-xs text-bark-light tracking-wide leading-snug">
          {wildlife.commonName}
        </p>
      </div>
    </div>
  )
}

export default function WildlifeCard({ wildlife, onClick }: Props) {
  const firstImage = wildlife.images?.[0]

  if (!firstImage?.asset?._ref && !firstImage?.url) {
    return <NoPhotoCard wildlife={wildlife} onClick={onClick} />
  }

  // Generate thumbnail URL via Sanity CDN
  const thumbUrl = firstImage.asset
    ? gridThumbUrl(firstImage)
    : (firstImage.url ?? '')

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(wildlife)}
      onKeyDown={(e) => e.key === 'Enter' && onClick(wildlife)}
      className="wildlife-card relative cursor-pointer overflow-hidden group"
      style={{ aspectRatio: '3/4' }}
      aria-label={`View ${wildlife.commonName}`}
    >
      {/* Photo */}
      <div className="absolute inset-0">
        <Image
          src={thumbUrl}
          alt={wildlife.commonName}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="wildlife-card-image object-cover"
          loading="lazy"
          unoptimized // Sanity CDN already optimised the image
        />
      </div>

      {/* Hover overlay — gradient + name */}
      <div className="wildlife-card-overlay absolute inset-0 bg-gradient-to-t from-bark-dark/80 via-bark-dark/10 to-transparent flex flex-col justify-end p-3">
        <p className="font-display font-light text-parchment-50 text-xs tracking-wide leading-tight">
          {wildlife.commonName}
          {wildlife.isFeatured && (
            <span className="ml-1.5 text-[10px] text-parchment-300" aria-label="Featured">
              ★
            </span>
          )}
        </p>
        <p className="font-body text-parchment-300 text-[10px] italic leading-tight mt-0.5 opacity-80">
          {wildlife.scientificName}
        </p>
        {wildlife.animalGroup && (
          <p className="font-display font-light text-parchment-300 text-[9px] tracking-widest uppercase leading-tight mt-1 opacity-70">
            {wildlife.animalGroup}
          </p>
        )}
      </div>
    </div>
  )
}
