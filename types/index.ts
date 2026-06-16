import type { SanityImageSource } from '@sanity/image-url/lib/types/types'

export interface SanityImageAsset {
  _key?: string
  url?: string
  asset: {
    _ref: string
    url?: string
  }
  hotspot?: {
    x: number
    y: number
    width: number
    height: number
  }
  crop?: {
    top: number
    bottom: number
    left: number
    right: number
  }
}

export interface Bird {
  _id: string
  rowNumber: number
  commonName: string
  scientificName: string
  country: string
  taxonomicOrder: number
  family: string
  slug: string
  images: SanityImageAsset[]
  isFeatured?: boolean
}

/**
 * Enforced union of valid animal groups — matches the options list in
 * sanity/schema/wildlife.ts. TypeScript will catch any typo or unlisted value.
 */
export type AnimalGroup =
  | 'Mammal'
  | 'Reptile'
  | 'Amphibian'
  | 'Fish'
  | 'Insect'
  | 'Arachnid'
  | 'Other'

export interface Wildlife {
  _id: string
  commonName: string
  scientificName: string
  country: string
  animalGroup: AnimalGroup
  slug: string
  images: SanityImageAsset[]
  isFeatured?: boolean
}

// Re-export SanityImageSource for convenience in image utility files
export type { SanityImageSource }
