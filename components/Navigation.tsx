'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Navigation() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  const isStudio = pathname?.startsWith('/studio')
  useEffect(() => {
    if (isStudio) return
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isStudio])
  if (isStudio) return null

  const isHome = pathname === '/'

  return (
    <header
      className={`
        nav-animate fixed top-0 left-0 right-0 z-40
        transition-all duration-500
        bg-[#F4EFE6] border-b border-parchment-300
        ${scrolled || !isHome ? 'py-4' : 'py-6'}
      `}
    >
      <nav className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between gap-4">
        {/* Wordmark — full name on md+, initials on mobile */}
        <Link
          href="/"
          className="font-display font-light text-sm tracking-widest2 uppercase text-bark-DEFAULT hover:text-forest transition-colors shrink-0"
        >
          <span className="hidden sm:inline">Shrirang Mukta</span>
          <span className="sm:hidden">S. Mukta</span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-4 md:gap-8">
          {[
            { href: '/#gallery', label: 'Gallery' },
            { href: '/database', label: 'Database' },
            { href: '/about', label: 'About' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="font-display font-light text-[10px] md:text-xs tracking-widest uppercase text-bark-mid hover:text-forest transition-colors whitespace-nowrap"
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  )
}
