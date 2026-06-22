'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { BarChart2, TrendingUp, ShieldCheck, Database, Award, Sparkles } from 'lucide-react'

export default function StatisticsPage() {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fade in entrance
      gsap.fromTo('.stat-title', 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }
      )
      gsap.fromTo('.stat-card',
        { opacity: 0, scale: 0.96, y: 15 },
        { opacity: 1, scale: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out', delay: 0.1 }
      )
      gsap.fromTo('.chart-bar',
        { width: '0%' },
        { width: (i, el) => el.getAttribute('data-width') || '0%', duration: 1.2, ease: 'power3.out', delay: 0.5 }
      )
    }, pageRef)
    return () => ctx.revert()
  }, [])

  return (
    <main ref={pageRef} className="bg-slate-50 min-h-screen">
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

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex items-center gap-3 mb-3 stat-title">
            <div className="w-1 h-8 bg-red-600 rounded-full" />
            <span className="text-xs font-mono text-red-600 uppercase tracking-widest font-bold">Procurement Analytics</span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl text-slate-900 font-bold mb-3 leading-tight stat-title">Statistics</h1>
          <p className="text-slate-500 font-body text-lg max-w-2xl leading-relaxed stat-title">
            Data insights, agency activity rankings, and category distributions derived from monitored Sarawak procurement portals.
          </p>
        </div>
      </section>

      {/* Analytics Content */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        
        {/* KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="stat-card bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono text-slate-400 uppercase font-bold">Total Monitored</span>
              <Database size={18} className="text-red-600" />
            </div>
            <p className="text-3xl font-display font-bold text-slate-900">1,482</p>
            <p className="text-xs text-slate-500 mt-1">Tender notices since launch</p>
          </div>

          <div className="stat-card bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono text-slate-400 uppercase font-bold">Active Right Now</span>
              <Sparkles size={18} className="text-yellow-600" />
            </div>
            <p className="text-3xl font-display font-bold text-white bg-red-600 px-2.5 py-0.5 rounded inline-block">124</p>
            <p className="text-xs text-slate-500 mt-2">Active bidding opportunities</p>
          </div>

          <div className="stat-card bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono text-slate-400 uppercase font-bold">Award Value Tracked</span>
              <Award size={18} className="text-emerald-600" />
            </div>
            <p className="text-3xl font-display font-bold text-red-600">RM 84.6M</p>
            <p className="text-xs text-slate-500 mt-1">Total contract value awarded</p>
          </div>

          <div className="stat-card bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono text-slate-400 uppercase font-bold">Monitored Portals</span>
              <ShieldCheck size={18} className="text-blue-600" />
            </div>
            <p className="text-3xl font-display font-bold text-slate-900">15+</p>
            <p className="text-xs text-slate-500 mt-1">Agencies scanned daily</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          
          {/* Active Tenders by Category */}
          <div className="stat-card bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
              <BarChart2 size={18} className="text-red-600" />
              <h2 className="font-display text-lg text-slate-900 font-bold">Tenders by Category</h2>
            </div>
            
            <div className="space-y-5">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-900 font-medium">Civil Engineering & Works</span>
                  <span className="text-slate-400 font-mono">58% (72 Tenders)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <div className="chart-bar bg-red-600 h-3 rounded-full" data-width="58%"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-900 font-medium">Supplies, Machinery & IT Equipment</span>
                  <span className="text-slate-400 font-mono">27% (33 Tenders)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <div className="chart-bar bg-yellow-500 h-3 rounded-full" data-width="27%"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-900 font-medium">Professional & Consultancy Services</span>
                  <span className="text-slate-400 font-mono">15% (19 Tenders)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <div className="chart-bar bg-slate-800 h-3 rounded-full" data-width="15%"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Top Scanned Procurement Agencies */}
          <div className="stat-card bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-3">
              <TrendingUp size={18} className="text-red-600" />
              <h2 className="font-display text-lg text-slate-900 font-bold">Top Active Issuing Agencies</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm pb-2 border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 flex items-center justify-center bg-red-600 text-white text-xs font-mono font-bold rounded-lg">1</span>
                  <span className="text-slate-900 font-medium">JKR Sarawak (Public Works)</span>
                </div>
                <span className="text-red-600 font-bold font-mono">42 Active</span>
              </div>

              <div className="flex items-center justify-between text-sm pb-2 border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 flex items-center justify-center bg-red-500 text-white text-xs font-mono font-bold rounded-lg">2</span>
                  <span className="text-slate-900 font-medium">SEDC Sarawak (Dev Corp)</span>
                </div>
                <span className="text-red-500 font-bold font-mono">29 Active</span>
              </div>

              <div className="flex items-center justify-between text-sm pb-2 border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 flex items-center justify-center bg-slate-400 text-white text-xs font-mono font-bold rounded-lg">3</span>
                  <span className="text-slate-900 font-medium">DBKU (Kuching North Commission)</span>
                </div>
                <span className="text-slate-500 font-bold font-mono">18 Active</span>
              </div>

              <div className="flex items-center justify-between text-sm pb-2 border-b border-slate-50">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 flex items-center justify-center bg-slate-300 text-slate-700 text-xs font-mono font-bold rounded-lg">4</span>
                  <span className="text-slate-900 font-medium">Sarawak Energy Berhad (SEB)</span>
                </div>
                <span className="text-slate-500 font-bold font-mono">15 Active</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 flex items-center justify-center bg-slate-200 text-slate-600 text-xs font-mono font-bold rounded-lg">5</span>
                  <span className="text-slate-900 font-medium">Miri City Council (MCC)</span>
                </div>
                <span className="text-slate-500 font-bold font-mono">11 Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Source Distribution Card */}
        <div className="stat-card bg-white border border-slate-100 rounded-2xl p-8 shadow-sm">
          <h2 className="font-display text-xl text-slate-900 font-bold mb-4">Portal Data Synchronization</h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-6 max-w-xl">
            We pull notices automatically from Sarawak eTender Portal and SEDC notice boards.
            Here is the current distribution of active scraped tender notices in the dashboard feed:
          </p>

          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <div className="flex-1 w-full space-y-4">
              <div>
                <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                  <span>SARAWAK ETENDER</span>
                  <span>74% (92 Tenders)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="chart-bar bg-red-600 h-2 rounded-full" data-width="74%"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                  <span>SEDC SARAWAK PORTAL</span>
                  <span>26% (32 Tenders)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="chart-bar bg-yellow-500 h-2 rounded-full" data-width="26%"></div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 sm:pl-10 shrink-0">
              <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-3xl font-display font-bold text-slate-900">6h</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Sync Interval</p>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-3xl font-display font-bold text-red-600">100%</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">OCR Match Rate</p>
              </div>
            </div>
          </div>
        </div>

      </section>

      <Footer />
    </main>
  )
}
