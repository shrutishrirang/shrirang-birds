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
      crop,
      "url": asset->url
    }
  }
`

/** Total species count — for the hero stat display. */
export const BIRD_COUNT_QUERY = groq`count(*[_type == "bird"])`

/**
 * Fetches all wildlife entries for the gallery + database pages.
 */
export const ALL_WILDLIFE_QUERY = groq`
  *[_type == "wildlife"] | order(isFeatured desc, commonName asc) {
    _id,
    isFeatured,
    commonName,
    scientificName,
    country,
    animalGroup,
    "slug": slug.current,
    "images": images[]{
      "_key": _key,
      asset,
      hotspot,
      crop,
      "url": asset->url
    }
  }
`

/** Total wildlife count. */
export const WILDLIFE_COUNT_QUERY = groq`count(*[_type == "wildlife"])`

/**
 * Unique countries from BOTH birds and wildlife combined.
 * Used in generateMetadata() to build the dynamic site description.
 */
export const ALL_UNIQUE_COUNTRIES_QUERY = groq`
  array::unique(
    *[_type in ["bird", "wildlife"] && defined(country)].country
  )
`
