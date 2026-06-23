import Navbar from './components/Navbar'
import Hero from './components/Hero'
import TenderFeed from './components/TenderFeed'
import Footer from './components/Footer'
import { MOCK_TENDERS } from './types'
import { getLiveTenders } from './scraper'

export const dynamic = 'force-dynamic'

async function getTenders() {
  try {
    const liveTenders = await getLiveTenders()
    return liveTenders.length > 0 ? liveTenders : MOCK_TENDERS
  } catch (error) {
    console.error('Scraping failed:', error)
    return MOCK_TENDERS
  }
}

export default async function HomePage() {
  const tenders = await getTenders()

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Sarawak Tender Monitor",
    "url": "https://sarawaktendermonitor.com",
    "description": "Live, real-time government tender notices, bids, and procurement opportunities aggregated from official Sarawak public portals.",
    "applicationCategory": "GovernmentService",
    "operatingSystem": "All",
    "keywords": "Sarawak, Tender, Monitor, Notices, e-Procurement Sarawak, Sarawak eTender, Sarawak Bids, Sarawak Project Tenders"
  }

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <Hero tenderCount={tenders.length} />
      <TenderFeed tenders={tenders} />
      <Footer />
    </main>
  )
}
