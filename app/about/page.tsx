'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Clock, Database, Bell, Shield } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const HOW_IT_WORKS = [
  {
    icon: Clock,
    title: 'Automated Scanning',
    desc: 'Our automated systems run every 6 hours, fetching the latest tender listings from official Sarawak government procurement portals.',
  },
  {
    icon: Database,
    title: 'Deduplication',
    desc: 'Each tender is assigned a unique ID. Already-seen tenders are filtered out so you only get genuinely new notices.',
  },
  {
    icon: Bell,
    title: 'Instant Notification',
    desc: 'New tenders are posted to our Telegram channel in real time, and this website refreshes its data every 6 hours.',
  },
  {
    icon: Shield,
    title: 'Direct Source Links',
    desc: 'Every tender links directly to the official government portal. We never modify or summarise tender documents.',
  },
]

const SOURCES = [
  { name: 'Sarawak eTender Portal', url: 'https://etendernotice.sarawak.gov.my', dept: 'Multiple government departments' },
  { name: 'SEDC Sarawak', url: 'https://sedc.com.my/notice-of-tender/', dept: 'Sarawak Economic Development Corporation' },
  { name: 'JKR Sarawak Portal', url: 'https://jkr.sarawak.gov.my/web/subpage/tender_and_quotation_list/tender', dept: 'JKR Sarawak (Public Works Department)' },
  { name: 'RECODA', url: 'https://recoda.gov.my/tender/', dept: 'Regional Corridor Development Authority' },
  { name: 'Bintulu Development Authority (BDA)', url: 'https://www.bda.gov.my/web/subpage/webpage_view/53', dept: 'Bintulu Development Authority' },
]

export default function AboutPage() {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero text
      gsap.fromTo('.about-hero-text', { opacity: 0, y: 60 }, {
        opacity: 1, y: 0, duration: 1, stagger: 0.15, ease: 'power3.out', delay: 0.3,
      })

      // How it works cards
      gsap.fromTo('.how-card', { opacity: 0, y: 50, scale: 0.95 }, {
        opacity: 1, y: 0, scale: 1, duration: 0.7, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: {
          trigger: '.how-grid',
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      })

      // Sources
      gsap.fromTo('.source-card', { opacity: 0, x: -30 }, {
        opacity: 1, x: 0, duration: 0.7, stagger: 0.15, ease: 'power2.out',
        scrollTrigger: {
          trigger: '.sources-section',
          start: 'top 82%',
          toggleActions: 'play none none none',
        },
      })

      // CTA
      gsap.fromTo('.about-cta', { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
        scrollTrigger: {
          trigger: '.about-cta',
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      })
    }, pageRef)

    return () => ctx.revert()
  }, [])

  return (
    <main ref={pageRef} className="bg-slate-50 min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-end pb-16 pt-32 bg-grid overflow-hidden border-b border-slate-200">
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 70% 30%, rgba(230,30,37,0.03) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <div className="about-hero-text">
            <span className="text-xs font-mono text-red-600 uppercase tracking-widest mb-4 block">About This Project</span>
          </div>
          <h1 className="about-hero-text font-display text-5xl md:text-7xl text-slate-900 leading-none mb-6">
            Enhancing Procurement
            <br />
            <span className="text-sarawak-gradient">Transparency</span>
          </h1>
          <p className="about-hero-text font-body text-xl text-slate-500 max-w-2xl leading-relaxed">
            Sarawak Tender Monitor is an independent tool that aggregates and monitors
            government procurement notices so businesses never miss an opportunity.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 py-20 scroll-mt-24" id="how-it-works">
        <div className="mb-12">
          <span className="text-xs font-mono text-emerald-600 uppercase tracking-widest block mb-3">Process</span>
          <h2 className="font-display text-4xl text-slate-900">How It Works</h2>
        </div>
        <div className="how-grid grid grid-cols-1 md:grid-cols-2 gap-6">
          {HOW_IT_WORKS.map((item, i) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className="how-card bg-white border border-slate-100 rounded-2xl p-6 hover:border-red-600/20 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={18} className="text-emerald-600" />
                </div>
                <div className="text-xs font-mono text-slate-300 mb-2">0{i + 1}</div>
                <h3 className="font-display text-xl text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-500 font-body leading-relaxed">{item.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Sources */}
      <section className="sources-section max-w-5xl mx-auto px-6 py-10 pb-20 scroll-mt-24" id="sources">
        <div className="mb-12">
          <span className="text-xs font-mono text-emerald-600 uppercase tracking-widest block mb-3">Data Sources</span>
          <h2 className="font-display text-4xl text-slate-900">Where We Get Data</h2>
        </div>
        <div className="space-y-4">
          {SOURCES.map((source) => (
            <a
              key={source.name}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="source-card flex items-center justify-between bg-white border border-slate-100 rounded-2xl p-5 hover:border-red-600/30 hover:bg-slate-50 transition-all duration-300 group shadow-sm"
            >
              <div>
                <h3 className="font-display text-lg text-slate-900 group-hover:text-red-600 transition-colors mb-1">
                  {source.name}
                </h3>
                <p className="text-sm text-slate-500 font-body">{source.dept}</p>
              </div>
              <span className="text-xs font-mono text-slate-400 group-hover:text-red-600 transition-colors">
                Visit →
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="about-cta bg-white border border-slate-100 rounded-3xl p-10 md:p-16 text-center shadow-lg">
          <h2 className="font-display text-4xl md:text-5xl text-slate-900 mb-4">
            Ready to Monitor
            <br />
            <span className="text-sarawak-gradient">Sarawak Tender?</span>
          </h2>
          <p className="text-slate-500 font-body mb-8 max-w-md mx-auto">
            Browse all active tenders or join our Telegram channel for instant alerts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/tenders"
              className="bg-red-600 text-white font-mono text-sm px-6 py-3 rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
            >
              Browse Tenders
            </a>
            <a
              href="https://t.me/+gniFz91d8wgyZGY9"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white border border-slate-200 text-slate-600 font-mono text-sm px-6 py-3 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-all"
            >
              Join Telegram Channel
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
