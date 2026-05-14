import { groq } from 'next-sanity'

/**
 * Fetches all birds for the grid + database pages.
 * Images return both asset reference (for @sanity/image-url) and raw url.
 */
export const ALL_BIRDS_QUERY = groq`
  *[_type == "bird"] | order(isFeatured desc, taxonomicOrder asc) {
    _id,
    rowNumber,
    isFeatured,
    commonName,
    scientificName,
    country,
    taxonomicOrder,
    family,
    "slug": slug.current,
    "images": images[]{
      "_key": _key,
      asset,
      hotspot,
      "url": asset->url
    }
  }
`

/**
 * Fetches a single bird by slug (used for potential future individual pages).
 */
export const BIRD_BY_SLUG_QUERY = groq`
  *[_type == "bird" && slug.current == $slug][0] {
    _id,
    rowNumber,
    isFeatured,
    commonName,
    scientificName,
    country,
    taxonomicOrder,
    family,
    "slug": slug.current,
    "images": images[]{
      "_key": _key,
      asset,
      hotspot,
      "url": asset->url
    }
  }
`

/** Total species count — for the hero stat display. */
export const BIRD_COUNT_QUERY = groq`count(*[_type == "bird"])`
