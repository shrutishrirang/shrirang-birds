# Shrirang Birds — Bird Photography Portfolio & Database

A premium, full-stack bird photography portfolio and digital lifelist database. This application is custom-built with **Next.js 14** (App Router), **Sanity.io v3** (Headless CMS), and **Tailwind CSS**, designed to showcase a high-fidelity gallery of species encountered across countries.

---

## 📖 Project Vision & Purpose

This portfolio functions as a living digital archive for my father photographer **Shrirang Mukta**. Every entry represents a **"lifer"**—a bird species observed, identified, and photographed in the wild. The application's design is heavily editorial, evoking a premium naturalist scrapbook with an earthy color palette, precise layout ratios, and robust search capabilities. 

The website operates on two distinct levels:
1. **An Editorial Showcase**: An elegant, dynamic gallery designed to stun visitors with fluid hover states, light/dark transition modals, and responsive 3:4 aspect-ratio photographic tiles.
2. **A Scientific Lifelist**: A dense, searchable, and sortable database table built to display complete taxonomic classifications and geographical records.

---

## 🛠️ Architecture & Technical Stack

The architecture is carefully decoupled to leverage the strengths of modern edge-computing and Headless CMS CDNs:

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | **Next.js 14 (App Router)** | Utilizes React Server Components (RSC) to render pages server-side for maximum performance, SEO indexability, and extremely fast initial loads. |
| **Styling** | **Tailwind CSS** | Customised with an organic, earthy design token system (featuring parchment tones, deep forest greens, and dark bark elements) to enforce visual consistency across all viewports. |
| **Database & CMS** | **Sanity.io v3** | A headless content lake that provides full schema flexibility, embedded CMS dashboard (Studio) at `/studio`, real-time content updates, and a powerful image pipeline. |
| **Data Ingestion** | **Node.js + `csv-parse`** | High-performance command-line ingestion script that processes eBird export CSV tables, matches filenames, and bulk-uploads assets securely. |
| **Typography** | **Josefin Sans + Nunito Sans** | Combined via `next/font/google` to create a harmonious editorial atmosphere—Josefin Sans for light, geometric, high-fashion headers, and Nunito Sans for clean, readable sans-serif metadata. |
| **Image CDN** | **Sanity Asset Pipeline** | On-the-fly resizing, format conversion (serving modern WebP based on browser support), and focal-point/hotspot cropping without draining client-side resources. |
| **Hosting** | **Vercel** | Edge hosting with built-in Incremental Static Regeneration (ISR) and automatic continuous deployment via GitHub triggers. |

---

## 🖼️ User Experience & Key Features

### 1. Dynamic Hero Section
The landing page instantly greets visitors with a full-height screen comprising a stunning large-scale hero photo overlay and key metrics:
- **Total Species Counter**: An animated stat showcasing the exact count of unique species in the portfolio, dynamically calculated through a lightweight GROQ aggregate count query.
- **Micro-Animations**: Custom scroll indicators, organic fade-ins, and elegant navigation bars that adapt their transparency when crossing section boundaries.

### 2. Shuffled Gallery Grid
To ensure a fresh and engaging user experience, the gallery grid implements a custom **shuffle-on-mount** algorithm:
- **Prioritised Sorting**: The grid categories are segmented on mount:
  1. **Featured Species**: Marked with `isFeatured: true` by the curator to reside permanently at the top.
  2. **Species with Photos**: Photographed lifers.
  3. **Species without Photos (Placeholders)**: Species listed in the database that do not yet have an uploaded image (rendered as clean, minimalist cards with a bird icon).
- **Fisher-Yates Shuffle**: A true random shuffle runs once when the component mounts to mix up birds within each tier, showing a unique collection layout on every page visit without altering the underlying taxonomic index.

### 3. Advanced Filtering & Family Parsing
Users can instantly slice through 1,400+ potential entries using a client-side filter engine:
- **Country Filter**: Pills to filter records by the country of capture (India, Kenya, Costa Rica, Colombia, or Vietnam).
- **Scientific Family Dropdown**: Displays a sorted list of unique bird families present in the database.
- **Fuzzy Name Search**: Instant typing matches against both common and scientific names.
- **Dynamic Family Parsing**: A modular utility (`parseFamily.ts`) parses raw eBird/Sanity family strings (e.g. `"Anatidae (Ducks, Geese, and Waterfowl)"`) to display the concise scientific classification (e.g., `"Anatidae"`) on compact components while keeping descriptive common translations available for the details view.

### 4. High-Fidelity Detail Modal
Clicking any bird card opens a dark, theatrical fullscreen modal panel with high-utility features:
- **Dual-Image Carousel**: Supports up to two high-resolution photos per species. A corner thumbnail provides instant swapping with smooth transition animations.
- **Focal-Point Viewport**: Uses `object-contain` to preserve the original, uncropped aspect ratio of the photograph as composed by the photographer in the field.
- **Seamless Navigation**: Supports fluid keyboard listeners (ArrowLeft to go back, ArrowRight to advance, Escape to close) and click triggers to browse the filtered grid sequence continuously without opening and closing the window.
- **Scroll Locking**: Prevents background body scrolling during exploration.

### 5. Searchable Tabular Database
For birding enthusiasts, `/database` hosts a highly optimized spreadsheet-style directory:
- **Taxonomic Sort Order**: Default alignment conforms to standard eBird taxonomic orders.
- **Multi-Column Sorting**: Users can click table headers to sort dynamically in ascending or descending sequences (taxonomic order, common name, scientific name, family, and country).
- **Country Code Pills**: Displays unique background-colored visual markers matching each country.

---

## ⚡ Technical Pipelines & Algorithms

### 1. Bulk Data Ingestion (`import-birds.mjs`)
Populating a catalog of 1,400+ species manually would be exhaustive. The project solves this through a customized CLI script (`npm run import`).

```
[CSV File] + [Raw Images Folder]
      │
      ├──► Normalise Bird Common Names (e.g. "Klaas's Cuckoo" -> "klaas s cuckoo")
      ├──► Scan Image Filenames & Strip Numerical Suffixes ("Indian Roller 2.jpg" -> "indian roller")
      ├──► Fuzzy Match Filename with CSV Bird Record
      │
      ├───► [Match Found?]
      │         │
      │         ├──► YES: Upload & link up to 2 assets to Sanity document
      │         └──► NO : Add record to "missing_images.csv"
      │
      └───► [Orphan Images?] ──► Save filenames to "unmatched_files.csv"
```

#### The Fuzzy Name Normaliser
To map photographer files directly to eBird rows, the importer runs names through a strict normalization regex:
```javascript
function normName(name) {
  return name
    .toLowerCase()
    .replace(/'/g,  '')   // removes apostrophes (e.g., "Klaas's" -> "klaass")
    .replace(/\./g, '')   // removes dots (e.g., "Mrs. Gould's" -> "mrs goulds")
    .replace(/\s+/g, ' ') // shrinks double spaces
    .trim()
}
```
It also strips numeric and bracket suffixes (`" 1"`, `" 2"`, `" (1)"`) to correctly associate multi-shot folders with a single species record.

#### Safe Output Verification
After execution, the script generates two local CSV reports to help audit files:
* `missing_images.csv`: Species in the master list that did not have matching photos.
* `unmatched_files.csv`: Image files in the folder that failed to map to any bird. This helps identify typological errors or incorrect species naming conventions in image metadata.

---

### 2. Dual-Path Image Pipeline
To balance fast load speeds with high visual quality, the application splits image rendering into two pathways based on context:

```
                  ┌─────────────────┐
                  │  Sanity Image   │
                  └────────┬────────┘
                           │
            ┌──────────────┴──────────────┐
            ▼                             ▼
   [ 3:4 Grid Thumbnail ]        [ Full Detail Modal ]
            │                             │
   • Downsized to 600x800px      • Resized to 1400px width
   • Format: Auto-WebP           • Format: Auto-WebP
   • Quality: 78%                • Quality: 88%
   • Crop: Sanity Hotspot        • Crop: None (Original Ratio)
```

1. **The Grid Thumbnail Pathway (`gridThumbUrl`)**:
   - Resized strictly to `600px x 800px` at `78%` quality to reduce bandwidth.
   - Evaluates Sanity's crop configuration. In Sanity Studio, the photographer can click a focal point (e.g., the bird's head). The CDN automatically centers the 3:4 crop around this target hotspot.
2. **The Modal Pathway (`fullImageUrl`)**:
   - The full original photo is retrieved without a crop (`object-contain`).
   - Fetched by passing only the direct asset ID pointer (`source.asset._ref`), completely stripping away bounding boxes and crops to showcase the landscape context of the bird's habitat.
   - Scaled to a max of `1400px` wide at `88%` quality to remain visually crisp on desktop screens.

---

### 3. Static Generation & Revalidation
To maintain serverless efficiency while retaining immediate content updates:
- **Incremental Static Regeneration (ISR)**: All main route files feature `export const revalidate = 3600`. The website builds static pages on deployment and lazily updates them in the background at most once per hour.
- **On-Demand Webhook Triggering**: Sanity is configured with a webhook pointing to the Vercel API revalidation endpoint. When the photographer publishes a new bird in Sanity Studio, it issues a POST request to rebuild relevant pages instantly, resulting in zero-wait updates.

---

## 📁 Codebase Directory Map

```
shrirang-birds/
├── app/
│   ├── layout.tsx                 # Root template, global typography, global header & navigation
│   ├── globals.css                # Custom global styles, CSS variables, hover transition parameters
│   ├── page.tsx                   # HomePage: Fetches full dataset via concurrent Server Component requests
│   ├── database/                  # Lifelist Table View: Handles country aggregation stats and displays table
│   │   └── page.tsx
│   ├── about/                     # Biography: Static personal profile page, responsive layout, and links
│   │   └── page.tsx
│   └── studio/[[...tool]]/        # Sanity Studio CMS router: Embeds the administrative CMS dashboard
├── components/
│   ├── Navigation.tsx             # Sticky navigational layout, dynamic transparencies and transitions
│   ├── HeroSection.tsx            # Impactful full-screen entrance layout displaying live species counts
│   ├── BirdGrid.tsx               # Primary interface orchestrating search, shuffled cards, filters, and modal
│   ├── BirdCard.tsx               # Discrete card unit rendering thumbnails and hover indicators
│   ├── BirdModal.tsx              # Overlay panel containing keyboards bindings, carousels, and taxonomy tables
│   └── BirdTable.tsx              # Multi-column searchable/sortable lifelist spreadsheet component
├── lib/
│   └── parseFamily.ts             # String tokenizer utility extracting scientific codes and common terms
├── sanity/
│   ├── schema/
│   │   └── bird.ts                # Strict Sanity Schema declaring eBird properties and hotspots
│   ├── lib/
│   │   ├── client.ts              # Pre-configured, cached next-sanity client connection
│   │   ├── queries.ts             # High-efficiency GROQ query definitions
│   │   └── image.ts               # Custom URL crop transformers mapping grid vs modal requirements
│   └── env.ts                     # Environment variable validation wrapper
├── scripts/
│   └── import-birds.mjs           # CSV & Image filesystem ingest CLI script
├── types/
│   └── index.ts                   # Strict shared TypeScript interfaces representing bird schemas
├── sanity.config.ts               # Global configurations for Sanity Studio, schemas, and plugins
├── tailwind.config.ts             # Visual design tokens, custom font-family maps, and earthy color palettes
└── .env.local.example             # Clean template showcasing required system credentials
```

---

## 🔒 Security & Data Integrity

- **Environment Variables**: Confidential API tokens (`SANITY_API_TOKEN`) remain locked securely in `.env.local` or Vercel's encrypted repository settings. Only public-facing Project IDs are exposed to the client.
- **Embedded Studio Role Protections**: The CMS at `/studio` requires valid Sanity account authorization. Inviting new collaborators under custom **Editor** permissions ensures they can create documents and upload images but cannot alter underlying schema patterns.
- **Read-Only Fields**: Core database items such as `rowNumber` are flagged as `readOnly: true` within the schema to prevent accidental modification of official eBird record indices during manual edits.
