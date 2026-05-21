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
  // Derived helpers (computed client-side)
  familyCode?: string
  familyCommonName?: string
}

export type Country = string
