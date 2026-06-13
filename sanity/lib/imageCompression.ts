/**
 * ─────────────────────────────────────────────────────────────────────────────
 * IMAGE COMPRESSION CONFIG
 * ─────────────────────────────────────────────────────────────────────────────
 * These are the only values you need to change to tune how images are
 * compressed before they are uploaded to Sanity Studio.
 *
 * Applied to every photo uploaded in the Bird document's "Photos" field.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const IMAGE_COMPRESSION_OPTIONS = {
  /**
   * Target maximum file size in megabytes.
   * The compressor will reduce quality until the file is under this size.
   * Example: 1 = "must be smaller than 1 MB"
   */
  maxSizeMB: 1,

  /**
   * Maximum pixel dimension (longest side — width or height).
   * Images larger than this will be scaled down proportionally.
   * Example: 1600 = longest side will be at most 1600 px
   */
  maxWidthOrHeight: 1600,

  /**
   * Starting JPEG/WebP quality. Range: 0.0 (lowest) → 1.0 (lossless).
   * The compressor may reduce this further to hit the maxSizeMB target.
   * Example: 0.9 = 90% quality
   */
  initialQuality: 0.9,

  /**
   * Run compression in a background Web Worker so the Studio UI
   * stays responsive during large uploads.
   */
  useWebWorker: true,

  /**
   * Output file format.
   * 'image/jpeg' gives the best size-to-quality ratio for photos.
   * Use 'image/webp' for slightly better compression with broader browser support.
   */
  fileType: 'image/jpeg' as const,
}
