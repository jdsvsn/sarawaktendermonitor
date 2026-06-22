'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react'
import TenderCard from './TenderCard'
import { Tender, getDaysUntilClosing } from '../types'

gsap.registerPlugin(ScrollTrigger)

const ITEMS_PER_PAGE = 6

interface TenderFeedProps {
  tenders: Tender[]
  loading?: boolean
}

export default function TenderFeed({ tenders, loading }: TenderFeedProps) {
  const [search, setSearch] = useState('')
  const [orgFilter, setOrgFilter] = useState('All Organizations')
  const [sortBy, setSortBy] = useState('Newest First')
  const [page, setPage] = useState(1)
  const sectionRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const filtersRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headerRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headerRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      )
      gsap.fromTo(
        filtersRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: filtersRef.current,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      )
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  const organizations = useMemo(() => {
    const orgs = ['All Organizations', ...Array.from(new Set(tenders.map((t) => t.organization)))]
    return orgs
  }, [tenders])

  const filtered = useMemo(() => {
    let result = [...tenders]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.organization.toLowerCase().includes(q) ||
          t.ref_no.toLowerCase().includes(q)
      )
    }
    if (orgFilter !== 'All Organizations') {
      result = result.filter((t) => t.organization === orgFilter)
    }
    if (sortBy === 'Closing Soon') {
      result.sort((a, b) => getDaysUntilClosing(a.closing_date) - getDaysUntilClosing(b.closing_date))
    } else {
      result.sort((a, b) => {
        const toDate = (s: string) => {
          if (!s) return 0
          const clean = s.trim().replace(/\//g, '-')
          const p = clean.split('-')
          if (p.length !== 3) return 0
          if (p[0].length === 4) {
            return new Date(`${p[0]}-${p[1]}-${p[2]}`).getTime()
          }
          if (p[2].length === 4) {
            return new Date(`${p[2]}-${p[1]}-${p[0]}`).getTime()
          }
          return 0
        }
        return toDate(b.posted_date) - toDate(a.posted_date)
      })
    }
    return result
  }, [tenders, search, orgFilter, sortBy])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  useEffect(() => { setPage(1) }, [search, orgFilter, sortBy])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton rounded-2xl h-44" />
        ))}
      </div>
    )
  }

  return (
    <section ref={sectionRef} className="relative border-t border-slate-100 max-w-none px-0 py-16">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div ref={headerRef} className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-1 h-8 bg-emerald-600 rounded-full" />
            <span className="text-xs font-mono text-emerald-600 uppercase tracking-widest">Live Feed</span>
          </div>          <h2 className="font-display text-4xl md:text-5xl text-slate-900 mb-3">
            Active Tenders
          </h2>
          <p className="text-slate-500 font-body">
            {filtered.length} tender{filtered.length !== 1 ? 's' : ''} found
            {search && ` for "${search}"`}
          </p>
        </div>

        {/* Filters */}
        <div
          ref={filtersRef}
          className="flex flex-col sm:flex-row gap-3 mb-8 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by keyword or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 font-body focus:outline-none focus:border-red-600/30 transition-colors"
            />
          </div>

          {/* Org filter */}
          <div className="relative">
            <SlidersHorizontal size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={orgFilter}
              onChange={(e) => setOrgFilter(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-8 py-2.5 text-sm text-slate-900 font-body focus:outline-none focus:border-red-600/30 transition-colors cursor-pointer min-w-[180px]"
            >
              {organizations.map((org) => (
                <option key={org} value={org} className="bg-white">
                  {org.length > 28 ? org.substring(0, 28) + '…' : org}
                </option>
              ))}
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 rounded-lg px-4 pr-8 py-2.5 text-sm text-slate-900 font-body focus:outline-none focus:border-red-600/30 transition-colors cursor-pointer"
            >
              <option className="bg-white">Newest First</option>
              <option className="bg-white">Closing Soon</option>
            </select>
            <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Cards */}
        {paginated.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">🔍</div>
            <p className="font-display text-2xl text-slate-300 mb-2">No tenders found</p>
            <p className="text-sm text-slate-200 font-body">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {paginated.map((tender, i) => (
              <TenderCard key={tender.ref_no + tender.title} tender={tender} index={i} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-600/30 disabled:opacity-20 transition-all shadow-sm"
            >
              ‹
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-mono transition-all ${
                  page === i + 1
                    ? 'bg-red-600 text-white font-medium shadow-md shadow-red-600/20'
                    : 'bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-600/30 disabled:opacity-20 transition-all shadow-sm"
            >
              ›
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
