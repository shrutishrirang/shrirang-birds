'use client'

import { useMemo, useState, useCallback, useEffect } from 'react'
import type { Wildlife } from '@/types'
import WildlifeCard from './WildlifeCard'
import WildlifeModal from './WildlifeModal'

interface Props {
  wildlife: Wildlife[]
}

export default function WildlifeGrid({ wildlife }: Props) {
  const [country,  setCountry]  = useState('All')
  const [group,    setGroup]    = useState('All')
  const [search,   setSearch]   = useState('')
  const [active,   setActive]   = useState<Wildlife | null>(null)

  // Build sorted country list dynamically from the actual entries in the database
  const countries = useMemo(() => {
    const set = new Set(wildlife.map((w) => w.country).filter(Boolean))
    return ['All', ...Array.from(set).sort()]
  }, [wildlife])

  // Build sorted animal group list
  const groups = useMemo(() => {
    const set = new Set(wildlife.map((w) => w.animalGroup).filter(Boolean))
    return ['All', ...Array.from(set).sort()]
  }, [wildlife])

  // Shuffle once on mount: featured first, then with photos, then without
  const [shuffled, setShuffled] = useState<Wildlife[]>(wildlife)
  useEffect(() => {
    const featured    = wildlife.filter((w) => w.isFeatured)
    const withPhoto   = wildlife.filter((w) => !w.isFeatured && w.images && w.images.length > 0)
    const withoutPhoto = wildlife.filter((w) => !w.isFeatured && (!w.images || w.images.length === 0))

    const shuffle = (arr: Wildlife[]) => {
      const a = [...arr]
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]]
      }
      return a
    }
    setShuffled([...shuffle(featured), ...shuffle(withPhoto), ...shuffle(withoutPhoto)])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally run once on mount only

  // Filter logic
  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return shuffled.filter((w) => {
      if (country !== 'All' && w.country    !== country) return false
      if (group   !== 'All' && w.animalGroup !== group)  return false
      if (q && !w.commonName.toLowerCase().includes(q) &&
               !w.scientificName.toLowerCase().includes(q)) return false
      return true
    })
  }, [shuffled, country, group, search])

  const openModal   = useCallback((w: Wildlife) => setActive(w), [])
  const closeModal  = useCallback(() => setActive(null), [])

  const navigateModal = useCallback((dir: 'prev' | 'next') => {
    if (!active) return
    const idx = filtered.findIndex((w) => w._id === active._id)
    const next = dir === 'next'
      ? filtered[(idx + 1) % filtered.length]
      : filtered[(idx - 1 + filtered.length) % filtered.length]
    setActive(next)
  }, [active, filtered])

  return (
    <section id="wildlife-gallery" className="max-w-7xl mx-auto px-4 md:px-6 pb-24">

      {/* Section header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-16 pb-10 border-b border-parchment-300">
        <div>
          <p className="font-display font-light text-[10px] tracking-widest3 uppercase text-forest mb-1">
            Wildlife Gallery
          </p>
          <h2 className="font-display font-thin text-3xl md:text-4xl text-bark-DEFAULT tracking-wide">
            {filtered.length.toLocaleString()}
            <span className="text-bark-light text-2xl ml-2">
              / {wildlife.length.toLocaleString()} species
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
          {countries.map((c) => (
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

        {/* Animal Group dropdown */}
        <select
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          className="
            font-body text-sm text-bark-DEFAULT bg-parchment-50
            border border-parchment-300 px-4 py-1.5
            focus:outline-none focus:border-forest
            transition-colors sm:ml-auto cursor-pointer
          "
          aria-label="Filter by animal group"
        >
          <option value="All">All Groups</option>
          {groups.slice(1).map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
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
        {filtered.map((w) => (
          <WildlifeCard key={w._id} wildlife={w} onClick={openModal} />
        ))}
      </div>

      {/* Modal */}
      {active && (
        <WildlifeModal
          wildlife={active}
          onClose={closeModal}
          onPrev={() => navigateModal('prev')}
          onNext={() => navigateModal('next')}
        />
      )}
    </section>
  )
}
