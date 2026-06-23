import type { Metadata } from 'next'
import { DM_Serif_Display, DM_Sans, DM_Mono } from 'next/font/google'
import './globals.css'
import FloatingCTA from './components/FloatingCTA'

const dmSerif = DM_Serif_Display({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-display',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
})

const dmMono = DM_Mono({
  weight: ['400', '500'],
  subsets: ['latin'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: {
    default: 'Sarawak Tender Monitor | Latest Government Procurement & Project Notices',
    template: '%s | Sarawak Tender Monitor'
  },
  description: 'Live, real-time government tender notices, bids, and procurement opportunities aggregated from official Sarawak public portals. Never miss a public sector contract in Sarawak.',
  keywords: ['Sarawak', 'Tender', 'Monitor', 'Notices', 'Sarawak Government Procurement', 'e-Procurement Sarawak', 'Sarawak eTender', 'Sarawak Bids', 'Sarawak Project Tenders', 'Sarawak Tender Bot', 'Sarawak Engineering Tenders'],
  metadataBase: new URL('https://sarawaktendermonitor.com'),
  icons: {
    icon: [
      { url: '/logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo.png', sizes: '192x192', type: 'image/png' },
      { url: '/logo.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/logo.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'Sarawak Tender Monitor | Latest Government Procurement & Project Notices',
    description: 'Live, real-time government tender notices, bids, and procurement opportunities aggregated from official Sarawak public portals.',
    url: 'https://sarawaktendermonitor.com',
    siteName: 'Sarawak Tender Monitor',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'Sarawak Tender Monitor Logo',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sarawak Tender Monitor | Latest Government Procurement & Project Notices',
    description: 'Track and monitor active government procurement notices and project bids in Sarawak in real-time.',
    images: ['/logo.png'],
  },
  alternates: {
    canonical: 'https://sarawaktendermonitor.com',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSerif.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <body className="bg-slate-50 text-slate-900 antialiased">
        {children}
        <FloatingCTA />
      </body>
    </html>
  )
}
