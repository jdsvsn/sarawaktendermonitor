import { Metadata } from 'next'
import StatisticsClient from './StatisticsClient'

export const metadata: Metadata = {
  title: 'Sarawak Government Procurement Statistics & Bid Trends',
  description: 'Procurement data insights, active tender category distributions, and agency rankings aggregated from official Sarawak public sectors.',
  alternates: {
    canonical: 'https://sarawaktendermonitor.com/statistics',
  }
}

export default function StatisticsPage() {
  return <StatisticsClient />
}
