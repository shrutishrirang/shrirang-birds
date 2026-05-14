import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'
import { client } from './client'

const builder = imageUrlBuilder(client)

export function urlForImage(source: SanityImageSource) {
  return builder.image(source)
}

/**
 * Returns a thumbnail URL for the grid view.
 * Sanity CDN handles resizing — no Next.js optimizer needed.
 * CSS handles the 3:4 crop (object-fit + object-position).
 */
export function gridThumbUrl(source: SanityImageSource): string {
  return urlForImage(source)
    .width(600)
    .height(800)
    .quality(78)
    .auto('format') // serves WebP where supported
    .url()
}

/**
 * Returns the full-quality image URL for the modal detail view.
 * No crop applied — shows the full original composition.
 */
export function fullImageUrl(source: SanityImageSource): string {
  return urlForImage(source)
    .width(1400)
    .quality(88)
    .auto('format')
    .url()
}
