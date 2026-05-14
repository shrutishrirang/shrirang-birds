'use client'

import { useMemo, useState, useCallback, useEffect } from 'react'
import type { Bird } from '@/types'
import BirdCard from './BirdCard'
import BirdModal from './BirdModal'
import { parseFamilyCode } from '@/lib/parseFamily'

interface Props {
  birds: Bird[]
}



const COUNTRIES = ['All', 'India', 'Kenya', 'Costa Rica', 'Colombia', 'Vietnam']

export default function BirdGrid({ birds }: Props) {
  const [country, setCountry] = useState('All')
  const [family,  setFamily]  = useState('All')
  const [search,  setSearch]  = useState('')
  const [active,  setActive]  = useState<Bird | null>(null)

  // Shuffle once on mount: featured birds first, then birds with photos, then the rest
  const [shuffledBirds, setShuffledBirds] = useState<Bird[]>(birds)
  useEffect(() => {
    const featured = birds.filter((b) => b.isFeatured)
    const withPhoto = birds.filter((b) => !b.isFeatured && b.images && b.images.length > 0)
    const withoutPhoto = birds.filter((b) => !b.isFeatured && (!b.images || b.images.length === 0))

    const shuffle = (array: Bird[]) => {
      const arr = [...array]
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]]
      }
      return arr
    }

    setShuffledBirds([...shuffle(featured), ...shuffle(withPhoto), ...shuffle(withoutPhoto)])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally run once on mount only

  // Build sorted family list for the dropdown (from full list, not filtered)
  const families = useMemo(() => {
    const set = new Set(birds.map((b) => b.family))
    return ['All', ...Array.from(set).sort()]
  }, [birds])

  // Filter logic — operates on the shuffled list to preserve random order
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return shuffledBirds.filter((b) => {
      if (country !== 'All' && b.country !== country) return false
      if (family  !== 'All' && b.family  !== family)  return false
      if (q && !b.commonName.toLowerCase().includes(q) &&
               !b.scientificName.toLowerCase().includes(q)) return false
      return true
    })
  }, [shuffledBirds, country, family, search])

  const openModal  = useCallback((b: Bird) => setActive(b), [])
  const closeModal = useCallback(()         => setActive(null), [])

  // Navigate modal prev/next within filtered list
  const navigateModal = useCallback((dir: 'prev' | 'next') => {
    if (!active) return
    const idx = filtered.findIndex((b) => b._id === active._id)
    const next = dir === 'next'
      ? filtered[(idx + 1) % filtered.length]
      : filtered[(idx - 1 + filtered.length) % filtered.length]
    setActive(next)
  }, [active, filtered])

  return (
    <section id="collection" className="max-w-7xl mx-auto px-4 md:px-6 pb-24">

      {/* Section header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-16 pb-10 border-b border-parchment-300">
        <div>
          <p className="font-display font-light text-[10px] tracking-widest3 uppercase text-forest mb-1">
            The Collection
          </p>
          <h2 className="font-display font-thin text-3xl md:text-4xl text-bark-DEFAULT tracking-wide">
            {filtered.length.toLocaleString()}
            <span className="text-bark-light text-2xl ml-2">
              / {birds.length.toLocaleString()} species
            </span>
          </h2>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search species…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              font-body text-sm text-bark-DEFAULT placeholder:text-bark-light
              bg-parchment-50 border border-parchment-300
              rounded-none px-4 py-2.5 w-full md:w-64
              focus:outline-none focus:border-forest
              transition-colors
            "
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-bark-light hover:text-bark-DEFAULT"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-4 py-6">

        {/* Country pills */}
        <div className="flex flex-wrap gap-2">
          {COUNTRIES.map((c) => (
            <button
              key={c}
              onClick={() => setCountry(c)}
              className={`
                font-display font-light text-[11px] tracking-widest uppercase px-4 py-2 leading-none
                border transition-all duration-200
                ${country === c
                  ? 'bg-forest text-parchment-50 border-forest'
                  : 'bg-transparent text-bark-mid border-parchment-300 hover:border-forest hover:text-forest'}
              `}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Family dropdown */}
        <select
          value={family}
          onChange={(e) => setFamily(e.target.value)}
          className="
            font-body text-sm text-bark-DEFAULT bg-parchment-50
            border border-parchment-300 px-4 py-1.5
            focus:outline-none focus:border-forest
            transition-colors sm:ml-auto cursor-pointer
          "
          aria-label="Filter by family"
        >
          <option value="All">All Families</option>
          {families.slice(1).map((f) => {
            const { code, common } = { code: parseFamilyCode(f), common: f.match(/^\w+\s*\((.+)\)$/)?.[1] ?? '' }
            return (
              <option key={f} value={f}>
                {code}{common ? ` — ${common}` : ''}
              </option>
            )
          })}
        </select>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="py-24 text-center">
          <p className="font-display font-light text-2xl text-bark-light tracking-wide">
            No species found
          </p>
          <p className="font-body text-sm text-bark-light mt-2">
            Try adjusting your filters or search term.
          </p>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
        {filtered.map((bird) => (
          <BirdCard key={bird._id} bird={bird} onClick={openModal} />
        ))}
      </div>

      {/* Modal */}
      {active && (
        <BirdModal
          bird={active}
          onClose={closeModal}
          onPrev={() => navigateModal('prev')}
          onNext={() => navigateModal('next')}
        />
      )}
    </section>
  )
}
