#!/usr/bin/env node
/**
 * import-birds.mjs
 *
 * Bulk-imports the eBird CSV into Sanity and attaches matching image files.
 *
 * Usage (from project root, after setting up .env.local):
 *   node --env-file=.env.local scripts/import-birds.mjs \
 *     --csv=/path/to/birds.csv \
 *     --images=/path/to/images/folder
 *
 * Outputs two files next to the script on completion:
 *   missing_images.csv  — birds in CSV that had no matching image file
 *   unmatched_files.csv — image files that didn't match any bird in the CSV
 */

import { createClient } from '@sanity/client'
import { createReadStream, readdirSync, writeFileSync } from 'fs'
import { extname, join, basename } from 'path'
import { parse as csvParse } from 'csv-parse/sync'
import { readFileSync } from 'fs'

// ── Sanity client (needs write token) ────────────────────────────────────────
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',
  token:     process.env.SANITY_API_TOKEN,
  apiVersion: '2024-01-01',
  useCdn: false,
})

// ── CLI arg parsing ───────────────────────────────────────────────────────────
const args    = Object.fromEntries(
  process.argv.slice(2)
    .filter((a) => a.startsWith('--'))
    .map((a) => {
      const [k, ...v] = a.slice(2).split('=')
      return [k, v.join('=')]
    })
)

const CSV_PATH  = args.csv
const IMG_DIR   = args.images

if (!CSV_PATH || !IMG_DIR) {
  console.error('Usage: node import-birds.mjs --csv=<path> --images=<folder>')
  process.exit(1)
}

// ── Name normalisation for fuzzy matching ─────────────────────────────────────
/**
 * Strips apostrophes, dots, and normalises spaces/case.
 * "Klaas's Cuckoo"    → "klaas s cuckoo"
 * "Mrs. Gould's Sunbird" → "mrs goulds sunbird"
 */
function normName(name) {
  return name
    .toLowerCase()
    .replace(/'/g,  '')   // remove apostrophes
    .replace(/\./g, '')   // remove dots
    .replace(/\s+/g, ' ')
    .trim()
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// ── Read CSV ──────────────────────────────────────────────────────────────────
console.log(`\n📋  Reading CSV: ${CSV_PATH}`)
const csvContent = readFileSync(CSV_PATH, 'utf-8')
const records = csvParse(csvContent, {
  columns: true,
  skip_empty_lines: true,
  trim: true,
})
console.log(`    Found ${records.length} birds`)

// ── Index image files ─────────────────────────────────────────────────────────
const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff'])

console.log(`\n📁  Scanning images: ${IMG_DIR}`)
const allFiles = readdirSync(IMG_DIR)
  .filter((f) => IMAGE_EXTS.has(extname(f).toLowerCase()))
console.log(`    Found ${allFiles.length} image files`)

/**
 * Build a map: normalisedName → [filePath, filePath?, ...]
 * Supports up to 2 images per bird named like:
 *   "Indian Roller.jpg"        (single)
 *   "Indian Roller 1.jpg"      (first of two)
 *   "Indian Roller 2.jpg"      (second of two)
 *   "Indian Roller (1).jpg"    (also matched)
 */
const imageIndex = new Map()

for (const file of allFiles) {
  const nameNoExt = basename(file, extname(file))
  // Strip trailing " 1", " 2", " (1)", " (2)" suffixes to get the base name
  const baseName  = nameNoExt.replace(/\s*[\(\[]?\s*[12]\s*[\)\]]?\s*$/, '').trim()
  const normKey   = normName(baseName)

  if (!imageIndex.has(normKey)) imageIndex.set(normKey, [])
  imageIndex.get(normKey).push(join(IMG_DIR, file))
}

// ── Import loop ───────────────────────────────────────────────────────────────
const missingImages  = []   // birds with no matched image
const unmatchedFiles = new Set(allFiles) // files not matched to any bird

let created = 0
let updated  = 0
let noPhoto  = 0
let errors   = 0

console.log('\n🚀  Importing birds into Sanity...\n')

for (let i = 0; i < records.length; i++) {
  const rec     = records[i]
  const name    = rec['Common Name']
  const normKey = normName(name)
  const slug    = slugify(name)

  const matchedPaths = (imageIndex.get(normKey) ?? []).slice(0, 2)

  process.stdout.write(`[${String(i + 1).padStart(4)} / ${records.length}]  ${name.padEnd(50)}`)

  // Upload images
  const uploadedImages = []
  for (const filePath of matchedPaths) {
    try {
      const asset = await client.assets.upload('image', createReadStream(filePath), {
        filename: basename(filePath),
        label:    name,
      })
      uploadedImages.push({
        _type: 'image',
        _key:  `img_${asset._id}`,
        asset: { _type: 'reference', _ref: asset._id },
      })
      // Mark file as matched
      unmatchedFiles.delete(basename(filePath))
    } catch (err) {
      console.error(`\n    ⚠️  Failed to upload ${filePath}: ${err.message}`)
    }
  }

  if (matchedPaths.length === 0) {
    missingImages.push(rec)
    noPhoto++
  }

  // Create or replace the Sanity document
  const doc = {
    _type:          'bird',
    _id:            `bird-${slug}`,
    rowNumber:      parseInt(rec['Row #'], 10) || 0,
    commonName:     name,
    scientificName: rec['Scientific Name'],
    country:        rec['Country'],
    taxonomicOrder: parseFloat(rec['Taxonomic Order']) || 0,
    family:         rec['Family'],
    slug:           { _type: 'slug', current: slug },
    images:         uploadedImages,
  }

  try {
    const result = await client.createOrReplace(doc)
    if (result._createdAt === result._updatedAt) { created++ } else { updated++ }
    process.stdout.write(matchedPaths.length > 0 ? '  ✓\n' : '  — (no photo)\n')
  } catch (err) {
    errors++
    process.stdout.write(`  ✗ ERROR: ${err.message}\n`)
  }
}

// ── Write output files ────────────────────────────────────────────────────────
console.log('\n─────────────────────────────────────────────')
console.log(`✅  Created : ${created}`)
console.log(`♻️   Updated : ${updated}`)
console.log(`📷  No photo: ${noPhoto}`)
console.log(`❌  Errors  : ${errors}`)

// Missing images CSV
const missingCsvPath = new URL('./missing_images.csv', import.meta.url).pathname
const missingLines   = [
  'Row #,Common Name,Scientific Name,Country,Taxonomic Order,Family',
  ...missingImages.map((r) =>
    [r['Row #'], r['Common Name'], r['Scientific Name'], r['Country'],
     r['Taxonomic Order'], `"${r['Family']}"`].join(',')
  ),
]
writeFileSync(missingCsvPath, missingLines.join('\n'), 'utf-8')
console.log(`\n📄  Birds with no image: ${missingImages.length}`)
console.log(`    Saved → ${missingCsvPath}`)

// Unmatched files CSV
const unmatchedCsvPath = new URL('./unmatched_files.csv', import.meta.url).pathname
const unmatchedLines   = ['filename', ...[...unmatchedFiles]]
writeFileSync(unmatchedCsvPath, unmatchedLines.join('\n'), 'utf-8')
console.log(`\n📄  Image files not matched: ${unmatchedFiles.size}`)
console.log(`    Saved → ${unmatchedCsvPath}`)

console.log('\n✨  Import complete!\n')
