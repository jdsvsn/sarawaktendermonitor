import { Metadata } from 'next'
import AboutClient from './AboutClient'

export const metadata: Metadata = {
  title: 'About The Project | Sarawak Government Procurement Aggregator',
  description: 'Learn about the Sarawak Tender Monitor, how we aggregate and deduplicate live procurement notices from official public portals.',
  alternates: {
    canonical: 'https://sarawaktendermonitor.com/about',
  }
}

export default function AboutPage() {
  return <AboutClient />
}
