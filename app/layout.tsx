import type { Metadata } from 'next'
import { Josefin_Sans, Nunito_Sans } from 'next/font/google'
import localFont from 'next/font/local'
import Navigation from '@/components/Navigation'
import './globals.css'

const josefin = Josefin_Sans({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '600'],
  variable: '--font-josefin',
  display: 'swap',
})

const nunito = Nunito_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-nunito',
  display: 'swap',
})

const maiandra = localFont({
  src: '../public/fonts/maiandra.ttf',
  variable: '--font-maiandra',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Shrirang Mukta — Bird Photographer',
  description:
    'A life list in photographs. Over 1,400 species documented across India, Kenya, Costa Rica, Colombia, and Vietnam.',
  openGraph: {
    title: 'Shrirang Mukta — Bird Photographer',
    description: 'A life list in photographs. 1,400+ species, 5 countries.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${josefin.variable} ${nunito.variable} ${maiandra.variable}`}>
      <body className="bg-parchment-100 font-body text-bark-DEFAULT antialiased">
        <Navigation />
        {children}
      </body>
    </html>
  )
}
