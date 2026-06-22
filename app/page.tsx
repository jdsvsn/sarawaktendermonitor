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

  return (
    <main>
      <Navbar />
      <Hero tenderCount={tenders.length} />
      <TenderFeed tenders={tenders} />
      <Footer />
    </main>
  )
}
