import { Metadata } from 'next'
import AwardedClient from './AwardedClient'

export const metadata: Metadata = {
  title: 'Awarded Sarawak Government Tenders & Contract Value Results',
  description: 'View public records of successfully awarded government contracts, winning bidders, and project values across Sarawak.',
  alternates: {
    canonical: 'https://sarawaktendermonitor.com/awarded',
  }
}

export default function AwardedPage() {
  return <AwardedClient />
}
