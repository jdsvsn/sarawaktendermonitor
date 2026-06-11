import Navbar from '../components/Navbar'
import TenderFeed from '../components/TenderFeed'
import Footer from '../components/Footer'
import { MOCK_TENDERS } from '../types'
import { getLiveTenders } from '../scraper'

export const revalidate = 300 // 5-minute cache

async function getTenders() {
  try {
    const liveTenders = await getLiveTenders()
    return liveTenders.length > 0 ? liveTenders : MOCK_TENDERS
  } catch (error) {
    console.error('Scraping failed:', error)
    return MOCK_TENDERS
  }
}

export default async function TendersPage() {
  const tenders = await getTenders()

  return (
    <main className="bg-slate-50 min-h-screen">
      <Navbar />
      
      {/* Header with Grid Background */}
      <section className="relative bg-grid overflow-hidden border-b border-slate-200 pt-32 pb-16">
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 70% 30%, rgba(230,30,37,0.03) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-1 h-8 bg-red-600 rounded-full" />
            <span className="text-xs font-mono text-red-600 uppercase tracking-widest">Full Database</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl text-slate-900 mb-3 leading-tight">All Tenders</h1>
          <p className="text-slate-500 font-body text-lg max-w-2xl leading-relaxed">
            Complete list of active procurement notices from Sarawak government portals.
          </p>
        </div>
      </section>

      <TenderFeed tenders={tenders} />
      <Footer />
    </main>
  )
}
