# Shrirang Mukta — Bird Photography Portfolio

A full-stack bird photography portfolio and database built with **Next.js 14**, **Sanity.io**, and deployed on **Vercel**.

---

## What's in this project

| Page | URL | What it does |
|---|---|---|
| Home | `/` | Hero + filterable bird grid |
| Database | `/database` | Full searchable/sortable table |
| About | `/about` | Bio + contact links |
| Studio | `/studio` | Sanity CMS (password protected) |

---

## One-time setup (do this once, in order)

### Step 1 — Create your Sanity project

1. Go to [sanity.io](https://sanity.io) and log in (or create a free account)
2. Click **"Create new project"** → name it `shrirang-birds` → dataset: `production`
3. From the project dashboard, note your **Project ID** (a short string like `abc123de`) i7r5j0g7
4. Go to **API → Tokens → Add API token**
   - Name: `Import Script`
   - Permissions: **Editor**
   - Copy the token — you only see it once

### Step 2 — Configure environment variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in:

```
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_editor_token_here
```

### Step 3 — Install dependencies

```bash
npm install
```

### Step 4 — Invite your father as a Sanity Editor

1. In [sanity.io/manage](https://sanity.io/manage) → your project → **Members**
2. Click **Invite** → enter his email → role: **Editor**
3. He accepts the invite and sets his own password
4. He can then log in at `https://your-site.vercel.app/studio`

> He can add/edit birds and upload photos. He **cannot** accidentally change the site structure.

---

## Importing the data (one-time bulk import)

### Prepare your images

- Resize all images to **1920px on the longest edge**, JPG at 85% quality
- Keep them all in **one flat folder** (no subfolders)
- Filenames should match the Common Name in the CSV exactly:
  - ✅ `Indian Roller.jpg`
  - ✅ `Klaas's Cuckoo.jpg` (apostrophes in filenames are handled)
  - ✅ `Indian Roller 1.jpg` + `Indian Roller 2.jpg` (for two photos of the same bird)

### Run the import

```bash
node --env-file=.env.local scripts/import-birds.mjs \
  --csv=/path/to/your/birds.csv \
  --images=/path/to/your/images/folder
```

The script will:
- Create all 1,425 bird records in Sanity
- Upload and attach matching images (up to 2 per bird)
- Print progress in the terminal
- Generate two output files when done:

| File | Contents |
|---|---|
| `scripts/missing_images.csv` | Birds in CSV with no matching image found |
| `scripts/unmatched_files.csv` | Image files that didn't match any bird |

Review both files. Missing images just means your father hasn't photographed that species yet — nothing to fix. Unmatched files usually means a filename typo.

---

## Running locally

```bash
npm run dev
```

Site opens at `http://localhost:3000`. Studio at `http://localhost:3000/studio`.

---

## Deploying to Vercel

1. Push this project to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your repo
3. In **Environment Variables**, add the same three variables from your `.env.local`:
   - `NEXT_PUBLIC_SANITY_PROJECT_ID`
   - `NEXT_PUBLIC_SANITY_DATASET`
   - `SANITY_API_TOKEN`
4. Click **Deploy**

Your site will be live at `https://shrirang-birds.vercel.app` (or similar).

### Auto-deploy on content changes (optional but recommended)

Set up a Sanity webhook so the site rebuilds when your father adds a new bird:

1. In [sanity.io/manage](https://sanity.io/manage) → **API → Webhooks → Add webhook**
2. URL: `https://your-site.vercel.app/api/revalidate` *(or use Vercel's deploy hook)*
3. Trigger: On document create/update/delete

Without this, the site rebuilds every hour automatically anyway (`revalidate = 3600`).

---

## How your father adds a new bird (lifer)

1. Go to `https://your-site.vercel.app/studio`
2. Log in with his Sanity account
3. Click **All Birds → + Create**
4. Fill in: Common Name, Scientific Name, Country, Taxonomic Order, Family
5. Click **Generate** next to Slug (auto-fills from the name)
6. Upload up to 2 photos
7. Click **Publish**

The site updates within the hour (or instantly if you set up the webhook).

---

## Option B — Setting hotspots for smart crop (weekend project)

The grid currently uses CSS to bias the crop toward the top of the frame (`object-position: center 20%`). For any bird where this doesn't look right, you can set an exact focal point:

1. Open Sanity Studio → find the bird
2. Click on the image in the **Photos** field
3. Click the **crop/hotspot icon** (looks like a target ⊙) in the image toolbar
4. Drag the **circle** onto the bird's head
5. Click **Done** → **Publish**

The grid thumbnail will now crop to that exact point. The full-size modal view is always uncropped regardless.

Do this over a weekend for the birds that don't look good with the default crop. You don't need to do all 550 — just the ones that bother you.

---

## Before going live — things to update

Search the codebase for these placeholders and replace them:

| File | Placeholder | Replace with |
|---|---|---|
| `app/about/page.tsx` | `your@email.com` | His actual email address |
| `app/about/page.tsx` | Facebook `href` | His actual Facebook URL |
| `app/about/page.tsx` | Bio paragraphs | His actual bio |

---

## Project structure

```
shrirang-birds/
├── app/
│   ├── layout.tsx                 Root layout, fonts, navigation
│   ├── globals.css                Global styles, animations
│   ├── page.tsx                   Home: hero + bird grid
│   ├── database/page.tsx          Full table view
│   ├── about/page.tsx             About + contact
│   └── studio/[[...tool]]/        Embedded Sanity Studio
├── components/
│   ├── Navigation.tsx             Fixed nav, transparent on hero
│   ├── HeroSection.tsx            Full-height hero with stats
│   ├── BirdGrid.tsx               Filterable grid + modal logic
│   ├── BirdCard.tsx               Individual 3:4 card with hover
│   ├── BirdModal.tsx              Full-screen detail view
│   └── BirdTable.tsx              Searchable/sortable data table
├── sanity/
│   ├── schema/bird.ts             Sanity document schema
│   ├── lib/client.ts              Sanity client
│   ├── lib/queries.ts             GROQ queries
│   └── lib/image.ts               Image URL helpers
├── scripts/
│   └── import-birds.mjs           Bulk CSV + image import
├── types/index.ts                 Shared TypeScript types
├── sanity.config.ts               Studio configuration
├── tailwind.config.ts             Design tokens (earthy palette)
└── .env.local.example             Environment variable template
```

---

## Tech stack

| Layer | Tool | Why |
|---|---|---|
| Framework | Next.js 14 (App Router) | ISR, server components, Vercel-optimised |
| CMS | Sanity.io v3 | Schema control, image CDN, embedded Studio |
| Hosting | Vercel | Free tier, auto-deploy from GitHub |
| Styling | Tailwind CSS | Earthy token system, responsive grid |
| Fonts | Josefin Sans + Nunito Sans | Clean, editorial, sans-serif throughout |
| Images | Sanity CDN | Auto-resizes, serves WebP, zero extra cost |
