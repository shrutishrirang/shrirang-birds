'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Navigation() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  // Studio gets no nav — it has its own chrome
  if (pathname?.startsWith('/studio')) return null

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
      <nav className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Wordmark */}
        <Link
          href="/"
          className="font-display font-light text-sm tracking-widest2 uppercase text-bark-DEFAULT hover:text-forest transition-colors"
        >
          Shrirang Mukta
        </Link>

        {/* Links */}
        <div className="flex items-center gap-8">
          {[
            { href: '/#collection', label: 'Collection' },
            { href: '/database',    label: 'Database'   },
            { href: '/about',       label: 'About'      },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="font-display font-light text-xs tracking-widest uppercase text-bark-mid hover:text-forest transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  )
}
