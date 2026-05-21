'use client'

import { useState, useMemo } from 'react'
import type { Bird } from '@/types'
import { parseFamilyCode } from '@/lib/parseFamily'

interface Props {
  birds: Bird[]
}

type SortKey = 'taxonomicOrder' | 'commonName' | 'scientificName' | 'country' | 'family'
type SortDir = 'asc' | 'desc'



export default function BirdTable({ birds }: Props) {
  const [search, setSearch]     = useState('')
  const [sortKey, setSortKey]   = useState<SortKey>('taxonomicOrder')
  const [sortDir, setSortDir]   = useState<SortDir>('asc')

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const rows = useMemo(() => {
    const q = search.toLowerCase().trim()
    const filtered = q
      ? birds.filter(
          (b) =>
            b.commonName.toLowerCase().includes(q) ||
            b.scientificName.toLowerCase().includes(q) ||
            b.country.toLowerCase().includes(q) ||
            b.family.toLowerCase().includes(q)
        )
      : birds

    return [...filtered].sort((a, b) => {
      let av: string | number = a[sortKey] ?? ''
      let bv: string | number = b[sortKey] ?? ''
      if (typeof av === 'string') av = av.toLowerCase()
      if (typeof bv === 'string') bv = bv.toLowerCase()
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ?  1 : -1
      return 0
    })
  }, [birds, search, sortKey, sortDir])

  const arrow = (key: SortKey) =>
    sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''

  const downloadCSV = () => {
    // 1. Create the CSV headers
    const headers = ['Taxonomic Order', 'Common Name', 'Scientific Name', 'Family', 'Country', 'Photos Uploaded']
    
    // 2. Map the rows to CSV row strings
    const csvRows = rows.map(bird => [
      bird.taxonomicOrder,
      `"${bird.commonName.replace(/"/g, '""')}"`,
      `"${bird.scientificName.replace(/"/g, '""')}"`,
      `"${parseFamilyCode(bird.family).replace(/"/g, '""')}"`,
      `"${bird.country.replace(/"/g, '""')}"`,
      bird.images?.length ?? 0
    ].join(','))
    
    // 3. Combine headers and rows
    const csvContent = [headers.join(','), ...csvRows].join('\n')
    
    // 4. Create a Blob with a UTF-8 Byte Order Mark (BOM) so Excel decodes accents and special characters beautifully
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `shrirang-birds-database-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const COLS: { key: SortKey; label: string; className?: string }[] = [
    { key: 'taxonomicOrder', label: '#',              className: 'w-12 text-right' },
    { key: 'commonName',     label: 'Common Name',    className: 'min-w-[160px]'   },
    { key: 'scientificName', label: 'Scientific Name',className: 'min-w-[180px]'   },
    { key: 'family',         label: 'Family',         className: 'min-w-[140px]'   },
    { key: 'country',        label: 'Country',        className: 'min-w-[100px]'   },
  ]

  return (
    <div>
      {/* Controls row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <p className="font-body text-sm text-bark-light">
          Showing{' '}
          <span className="text-bark-DEFAULT font-medium">{rows.length.toLocaleString()}</span>
          {' '}of{' '}
          <span className="text-bark-DEFAULT font-medium">{birds.length.toLocaleString()}</span>
          {' '}species
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {/* Download CSV button */}
          <button
            onClick={downloadCSV}
            className="
              flex items-center justify-center gap-2
              font-body text-sm font-medium text-forest hover:text-white
              bg-transparent hover:bg-forest border border-forest/30 hover:border-forest
              px-4 py-2 rounded-none transition-all duration-200
            "
            title="Download database as CSV (Excel)"
          >
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <span>Export to Excel (CSV)</span>
          </button>

          <div className="relative">
            <input
              type="text"
              placeholder="Search any field…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                font-body text-sm text-bark-DEFAULT placeholder:text-bark-light
                bg-parchment-50 border border-parchment-300
                px-4 py-2 w-full sm:w-64
                focus:outline-none focus:border-forest transition-colors
              "
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-bark-light hover:text-bark-DEFAULT"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-parchment-300">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-parchment-300">
              {COLS.map(({ key, label, className }) => (
                <th
                  key={key}
                  onClick={() => handleSort(key)}
                  className={`
                    font-display font-light text-[10px] tracking-widest uppercase
                    text-bark-light hover:text-forest
                    px-4 py-3 text-left cursor-pointer select-none
                    transition-colors bg-parchment-100
                    ${className ?? ''}
                  `}
                >
                  {label}{arrow(key)}
                </th>
              ))}
              <th className="font-display font-light text-[10px] tracking-widest uppercase text-bark-light px-4 py-3 text-center bg-parchment-100 w-24">
                Photos
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((bird, i) => (
              <tr
                key={bird._id}
                className={`db-row border-b border-parchment-200 transition-colors ${
                  i % 2 === 0 ? 'bg-white' : 'bg-parchment-50'
                }`}
              >
                <td className="px-4 py-2.5 text-right font-body text-xs text-bark-light tabular-nums">
                  {bird.taxonomicOrder}
                </td>
                <td className="px-4 py-2.5 font-body font-medium text-bark-DEFAULT">
                  {bird.commonName}
                </td>
                <td className="px-4 py-2.5 font-body italic text-bark-mid text-xs">
                  {bird.scientificName}
                </td>
                <td className="px-4 py-2.5 font-body text-xs text-bark-mid">
                  {parseFamilyCode(bird.family)}
                </td>
                <td className="px-4 py-2.5 font-body text-xs text-bark-mid">
                  <span className="inline-flex items-center gap-1">
                    <span
                      className={`w-1.5 h-1.5 rounded-full`}
                      style={{ backgroundColor: countryColor(bird.country) }}
                    />
                    {bird.country}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-center font-body text-xs font-semibold tabular-nums">
                  {bird.images && bird.images.length > 0 ? (
                    <span className="text-forest">{bird.images.length}</span>
                  ) : (
                    <span className="text-bark-light/40">0</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && (
        <div className="py-16 text-center border border-t-0 border-parchment-300">
          <p className="font-display font-light text-xl text-bark-light tracking-wide">
            No results
          </p>
        </div>
      )}
    </div>
  )
}

function countryColor(country: string): string {
  const map: Record<string, string> = {
    'India':      '#C2603A',
    'Kenya':      '#4A7C59',
    'Costa Rica': '#6B8E3E',
    'Colombia':   '#C2953A',
    'Vietnam':    '#3A6BC2',
  }
  return map[country] ?? '#9E8E7A'
}
