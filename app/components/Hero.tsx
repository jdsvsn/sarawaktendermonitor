'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import Link from 'next/link'
import { ArrowRight, Radio } from 'lucide-react'

export default function Hero({ tenderCount }: { tenderCount: number }) {
  const heroRef = useRef<HTMLDivElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)
  const h1Ref = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      // Entrance sequence
      tl.from(badgeRef.current, { opacity: 0, y: 20, duration: 0.6 }, 0.3)
        .from(h1Ref.current, { opacity: 0, y: 40, duration: 0.9 }, 0.5)
        .from(subtitleRef.current, { opacity: 0, y: 40, duration: 0.9 }, 0.7)
        .from(ctaRef.current, { opacity: 0, y: 20, duration: 0.6 }, 1.1)
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-start justify-center overflow-hidden bg-grid pt-32 md:pt-40"
    >
      {/* Corner decorations */}
      <div className="absolute top-40 left-24 w-20 h-20 border-l-2 border-t-2 border-red-600/20 rounded-tl-lg" />
      <div className="absolute bottom-40 right-24 w-20 h-20 border-r-2 border-b-2 border-red-600/20 rounded-br-lg" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Live badge */}
        <div
          ref={badgeRef}
          className="inline-flex items-center gap-2 bg-red-600/5 border border-red-600/10 rounded-full px-4 py-2 mb-8"
        >
          <Radio size={13} className="text-red-600 urgent-pulse" />
          <span className="text-xs font-mono text-red-600 tracking-widest uppercase">
            {tenderCount} Active Tenders · Updated Every 6 Hours
          </span>
        </div>

        {/* Headline */}
        <h1
          ref={h1Ref}
          className="font-display text-5xl md:text-7xl lg:text-8xl text-slate-900 leading-none mb-6"
        >
          <span className="text-sarawak-gradient">Sarawak</span>{' '}
          <span className="text-black">Tender</span>
          <br />
          Monitor
        </h1>

        <p
          ref={subtitleRef}
          className="font-body text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Real-time government tender notices aggregated from official Sarawak
          procurement portals. Never miss a deadline again.
        </p>

        {/* CTAs */}
        <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/tenders"
            className="group flex items-center gap-2 bg-red-600 text-white font-mono text-sm tracking-wide px-6 py-3 rounded-lg hover:bg-red-700 transition-all duration-200 shadow-lg shadow-red-600/20"
          >
            Browse Tenders
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/about"
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 font-mono text-sm tracking-wide px-6 py-3 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-all duration-200"
          >
            How It Works
          </Link>
        </div>
      </div>
    </section>
  )
}
