'use client'

import { useState, useMemo } from 'react'
import type { Wildlife } from '@/types'

interface Props {
  wildlife: Wildlife[]
}

type SortKey = 'commonName' | 'scientificName' | 'animalGroup' | 'country'
type SortDir = 'asc' | 'desc'

export default function WildlifeTable({ wildlife }: Props) {
  const [search, setSearch]   = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('commonName')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

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
      ? wildlife.filter(
          (w) =>
            w.commonName.toLowerCase().includes(q) ||
            w.scientificName.toLowerCase().includes(q) ||
            (w.country ?? '').toLowerCase().includes(q) ||
            (w.animalGroup ?? '').toLowerCase().includes(q)
        )
      : wildlife

    return [...filtered].sort((a, b) => {
      let av: string = (a[sortKey] ?? '').toLowerCase()
      let bv: string = (b[sortKey] ?? '').toLowerCase()
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ?  1 : -1
      return 0
    })
  }, [wildlife, search, sortKey, sortDir])

  const arrow = (key: SortKey) =>
    sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : ''

  const downloadCSV = () => {
    const headers = ['Common Name', 'Scientific Name', 'Animal Group', 'Country', 'Photos Uploaded']
    const csvRows = rows.map((w) => [
      `"${w.commonName.replace(/"/g, '""')}"`,
      `"${w.scientificName.replace(/"/g, '""')}"`,
      `"${(w.animalGroup ?? '').replace(/"/g, '""')}"`,
      `"${(w.country ?? '').replace(/"/g, '""')}"`,
      w.images?.length ?? 0,
    ].join(','))
    const csvContent = [headers.join(','), ...csvRows].join('\n')
    const blob = new Blob(
      [new Uint8Array([0xef, 0xbb, 0xbf]), csvContent],
      { type: 'text/csv;charset=utf-8;' }
    )
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute(
      'download',
      `shrirang-wildlife-database-${new Date().toISOString().split('T')[0]}.csv`
    )
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const COLS: { key: SortKey; label: string; className?: string }[] = [
    { key: 'commonName',     label: 'Common Name',     className: 'min-w-[160px]' },
    { key: 'scientificName', label: 'Scientific Name',  className: 'min-w-[180px]' },
    { key: 'animalGroup',    label: 'Animal Group',     className: 'min-w-[120px]' },
    { key: 'country',        label: 'Country',          className: 'min-w-[100px]' },
  ]

  return (
    <div>
      {/* Controls row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <p className="font-body text-sm text-bark-light">
          Showing{' '}
          <span className="text-bark-DEFAULT font-medium">{rows.length.toLocaleString()}</span>
          {' '}of{' '}
          <span className="text-bark-DEFAULT font-medium">{wildlife.length.toLocaleString()}</span>
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
            title="Download wildlife database as CSV (Excel)"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            {rows.map((w, i) => (
              <tr
                key={w._id}
                className={`db-row border-b border-parchment-200 transition-colors ${
                  i % 2 === 0 ? 'bg-white' : 'bg-parchment-50'
                }`}
              >
                <td className="px-4 py-2.5 font-body font-medium text-bark-DEFAULT">
                  {w.commonName}
                </td>
                <td className="px-4 py-2.5 font-body italic text-bark-mid text-xs">
                  {w.scientificName}
                </td>
                <td className="px-4 py-2.5 font-body text-xs text-bark-mid">
                  <span className="inline-flex items-center gap-1">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: animalGroupColor(w.animalGroup) }}
                    />
                    {w.animalGroup}
                  </span>
                </td>
                <td className="px-4 py-2.5 font-body text-xs text-bark-mid">
                  {w.country}
                </td>
                <td className="px-4 py-2.5 text-center font-body text-xs font-semibold tabular-nums">
                  {w.images && w.images.length > 0 ? (
                    <span className="text-forest">{w.images.length}</span>
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

function animalGroupColor(group: string): string {
  const map: Record<string, string> = {
    Mammal:    '#C2603A',
    Reptile:   '#4A7C59',
    Amphibian: '#6B8E3E',
    Fish:      '#3A6BC2',
    Insect:    '#C2953A',
    Arachnid:  '#8B6B4A',
    Other:     '#9E8E7A',
  }
  return map[group] ?? '#9E8E7A'
}
