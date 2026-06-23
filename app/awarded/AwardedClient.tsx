'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { gsap } from 'gsap'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { MOCK_AWARDED_TENDERS } from '../types'
import { Search, Building2, Calendar, Award, ChevronDown } from 'lucide-react'

export default function AwardedClient() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All Categories')
  const [orgFilter, setOrgFilter] = useState('All Organizations')
  
  const headerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // GSAP animations
    const ctx = gsap.context(() => {
      gsap.fromTo(headerRef.current, 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      )
      gsap.fromTo('.awarded-card',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out', delay: 0.2 }
      )
    })
    return () => ctx.revert()
  }, [])

  const organizations = useMemo(() => {
    return ['All Organizations', ...Array.from(new Set(MOCK_AWARDED_TENDERS.map(t => t.organization)))]
  }, [])

  const categories = ['All Categories', 'Works', 'Supplies', 'Services']

  const filtered = useMemo(() => {
    return MOCK_AWARDED_TENDERS.filter(tender => {
      const matchSearch = 
        tender.title.toLowerCase().includes(search.toLowerCase()) ||
        tender.ref_no.toLowerCase().includes(search.toLowerCase()) ||
        tender.awarded_to.toLowerCase().includes(search.toLowerCase())
      
      const matchCategory = 
        categoryFilter === 'All Categories' || tender.category === categoryFilter

      const matchOrg = 
        orgFilter === 'All Organizations' || tender.organization === orgFilter

      return matchSearch && matchCategory && matchOrg
    })
  }, [search, categoryFilter, orgFilter])

  return (
    <main className="bg-slate-50 min-h-screen">
      <Navbar />

      {/* Header section with grid */}
      <section className="relative bg-grid overflow-hidden border-b border-slate-200 pt-32 pb-16">
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 70% 30%, rgba(230,30,37,0.03) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />

        <div ref={headerRef} className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-1 h-8 bg-red-600 rounded-full" />
            <span className="text-xs font-mono text-red-600 uppercase tracking-widest">Awarded Contracts</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl text-slate-900 mb-3 leading-tight">Tender Results</h1>
          <p className="text-slate-500 font-body text-lg max-w-2xl leading-relaxed">
            Public records of awarded government tenders, successful bidders, and contract values across Sarawak.
          </p>
        </div>
      </section>

      {/* Filter and Content section */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar Filters */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <h2 className="font-display text-lg text-slate-900 border-b border-slate-100 pb-2 font-bold">Filters</h2>
              
              {/* Search input */}
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-400 uppercase font-bold">Keyword Search</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search bidder or ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 font-body focus:outline-none focus:border-red-600/30 transition-colors"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-400 uppercase font-bold">Category</label>
                <div className="relative">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 font-body focus:outline-none focus:border-red-600/30 transition-colors cursor-pointer"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Organization Filter */}
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-400 uppercase font-bold">Organization</label>
                <div className="relative">
                  <select
                    value={orgFilter}
                    onChange={(e) => setOrgFilter(e.target.value)}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900 font-body focus:outline-none focus:border-red-600/30 transition-colors cursor-pointer"
                  >
                    {organizations.map(org => (
                      <option key={org} value={org}>
                        {org.length > 25 ? org.substring(0, 25) + '…' : org}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Awarded Tenders List */}
          <div ref={listRef} className="lg:col-span-9 space-y-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-mono text-slate-400">
                Showing {filtered.length} record{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>

            {filtered.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="font-display text-xl text-slate-900 font-bold mb-2">No results match your filters</h3>
                <p className="text-slate-500 text-sm font-body">Try clearing search text or resetting filters.</p>
              </div>
            ) : (
              filtered.map((tender) => (
                <div 
                  key={tender.ref_no} 
                  className="awarded-card bg-white border border-slate-100 hover:border-red-600 hover:shadow-lg transition-all duration-300 rounded-2xl p-6 relative overflow-hidden"
                >
                  {/* Category Indicator Accent Line */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                    tender.category === 'Works' ? 'bg-blue-600' :
                    tender.category === 'Supplies' ? 'bg-emerald-600' : 'bg-purple-600'
                  }`} />

                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="flex-1 space-y-3">
                      
                      {/* ID and Category Tag */}
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-slate-400">REF: {tender.ref_no}</span>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                          tender.category === 'Works' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          tender.category === 'Supplies' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          'bg-purple-50 text-purple-700 border-purple-200'
                        }`}>
                          {tender.category}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="font-display text-lg font-bold text-slate-900 leading-snug group-hover:text-red-600 transition-colors duration-300">
                        {tender.title}
                      </h3>

                      {/* Award Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 pt-3 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-xs">
                          <Award size={14} className="text-yellow-600 shrink-0" />
                          <div>
                            <span className="text-slate-400">Awarded To:</span>
                            <span className="ml-1 text-slate-900 font-bold">{tender.awarded_to}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs">
                          <Building2 size={14} className="text-slate-400 shrink-0" />
                          <div>
                            <span className="text-slate-400">Agency:</span>
                            <span className="ml-1 text-slate-600 font-medium">{tender.organization}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Amount & Date Card */}
                    <div className="md:w-60 flex md:flex-col items-start md:items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 gap-3 shrink-0">
                      <div className="md:text-right">
                        <p className="text-xs text-slate-400 font-mono mb-0.5">Contract Value</p>
                        <p className="text-2xl font-display font-bold text-red-600">{tender.amount}</p>
                      </div>
                      <div className="md:text-right flex items-center md:justify-end gap-1.5 text-xs text-slate-500">
                        <Calendar size={12} className="text-slate-400" />
                        <span>Award Date: {tender.award_date}</span>
                      </div>
                    </div>

                  </div>
                </div>
              ))
            )}

          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
