'use client'

import { useState } from 'react'
import type { Bird, Wildlife } from '@/types'
import BirdTable from './BirdTable'
import WildlifeTable from './WildlifeTable'

interface Props {
  birds: Bird[]
  wildlife: Wildlife[]
}

type Tab = 'birds' | 'wildlife'

export default function DatabaseTabs({ birds, wildlife }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('birds')

  const activeData = activeTab === 'birds' ? birds : wildlife
  const activeLabel = activeTab === 'birds' ? 'Birds' : 'Wildlife'

  // Compute country breakdown for the currently active tab
  const byCountry = activeData.reduce<Record<string, number>>((acc, e) => {
    if (e.country) acc[e.country] = (acc[e.country] ?? 0) + 1
    return acc
  }, {})

  return (
    <div>
      {/* Dynamic stats strip — changes with the active tab */}
      <div className="flex flex-wrap gap-x-8 gap-y-2 mb-8 items-end">
        <div>
          <span className="font-display font-light text-2xl text-bark-DEFAULT">
            {activeData.length.toLocaleString()}
          </span>
          <span className="font-body text-xs text-bark-light ml-2 uppercase tracking-wider">
            {activeLabel}
          </span>
        </div>

        {Object.entries(byCountry)
          .sort((a, b) => b[1] - a[1]) // highest count first
          .map(([country, n]) => (
            <div key={country}>
              <span className="font-display font-light text-2xl text-bark-DEFAULT">{n}</span>
              <span className="font-body text-xs text-bark-light ml-2 uppercase tracking-wider">
                {country}
              </span>
            </div>
          ))}
      </div>

      {/* Tab switcher — correct ARIA tablist/tabpanel structure */}
      <div role="tablist" aria-label="Database view" className="flex gap-0 mb-8 border-b border-parchment-300">
        <button
          role="tab"
          id="db-tab-birds"
          aria-selected={activeTab === 'birds'}
          aria-controls="db-panel-birds"
          onClick={() => setActiveTab('birds')}
          className={`
            font-display font-light text-xs tracking-widest uppercase
            px-6 py-3 border-b-2 transition-all duration-200 -mb-px
            ${activeTab === 'birds'
              ? 'border-forest text-forest'
              : 'border-transparent text-bark-light hover:text-bark-DEFAULT hover:border-parchment-400'}
          `}
        >
          🐦 Birds
          <span className={`ml-2 text-[10px] ${activeTab === 'birds' ? 'text-forest' : 'text-bark-light'}`}>
            ({birds.length.toLocaleString()})
          </span>
        </button>

        <button
          role="tab"
          id="db-tab-wildlife"
          aria-selected={activeTab === 'wildlife'}
          aria-controls="db-panel-wildlife"
          onClick={() => setActiveTab('wildlife')}
          className={`
            font-display font-light text-xs tracking-widest uppercase
            px-6 py-3 border-b-2 transition-all duration-200 -mb-px
            ${activeTab === 'wildlife'
              ? 'border-forest text-forest'
              : 'border-transparent text-bark-light hover:text-bark-DEFAULT hover:border-parchment-400'}
          `}
        >
          🐾 Wildlife
          <span className={`ml-2 text-[10px] ${activeTab === 'wildlife' ? 'text-forest' : 'text-bark-light'}`}>
            ({wildlife.length.toLocaleString()})
          </span>
        </button>
      </div>

      {/* Tab panels */}
      <div
        role="tabpanel"
        id="db-panel-birds"
        aria-labelledby="db-tab-birds"
        hidden={activeTab !== 'birds'}
      >
        <BirdTable birds={birds} />
      </div>

      <div
        role="tabpanel"
        id="db-panel-wildlife"
        aria-labelledby="db-tab-wildlife"
        hidden={activeTab !== 'wildlife'}
      >
        <WildlifeTable wildlife={wildlife} />
      </div>
    </div>
  )
}
