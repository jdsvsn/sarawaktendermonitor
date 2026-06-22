'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Building2, MapPin, Calendar, Hash, ExternalLink, ShieldCheck, CheckCircle2, Layers, Briefcase, Eye, X, Award } from 'lucide-react'
import { Tender, getDaysUntilClosing, getStatusBadge } from '../types'
import { useState } from 'react'

gsap.registerPlugin(ScrollTrigger)

interface TenderCardProps {
  tender: Tender
  index: number
}

export default function TenderCard({ tender, index }: TenderCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [showImage, setShowImage] = useState(false)
  const daysLeft = getDaysUntilClosing(tender.closing_date)
  const status = getStatusBadge(daysLeft, tender.posted_date)

  useEffect(() => {
    const el = cardRef.current
    if (!el) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 50, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          ease: 'power3.out',
          delay: index * 0.08,
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      )
    })

    return () => ctx.revert()
  }, [index])

  const statusColors = {
    URGENT: 'bg-red-50 text-red-600 border-red-200',
    NEW: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    OPEN: 'bg-blue-50 text-blue-600 border-blue-200',
  }

  const closingColor =
    daysLeft <= 3 ? 'text-red-600' : daysLeft <= 7 ? 'text-yellow-600' : 'text-slate-900'

  return (
    <div
      ref={cardRef}
      className="gsap-animate group relative bg-white border border-slate-100 rounded-2xl p-6 hover:border-red-600 transition-all duration-400 cursor-pointer shadow-sm hover:shadow-xl"
    >
      {/* Hover glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-600/0 to-red-600/0 group-hover:from-red-600/[0.03] group-hover:to-transparent transition-all duration-500 pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-start gap-4">
        {/* Left content */}
        <div className="flex-1 min-w-0">
          {/* Status + Ref */}
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <span
              className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${statusColors[status]} ${
                status === 'URGENT' ? 'urgent-pulse' : ''
              }`}
            >
              {status}
            </span>
            <span className="text-xs font-mono text-slate-400">
              REF: {tender.ref_no}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-display text-lg text-slate-900 leading-snug mb-2 group-hover:text-red-600 transition-colors duration-300">
            {tender.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-slate-500 line-clamp-2 mb-4 font-body leading-relaxed">
            {tender.description}
          </p>

          {/* Notice Image Preview */}
          {tender.imageUrl && (
            <div className="mb-6 relative group/img cursor-zoom-in" onClick={() => setShowImage(true)}>
              <div className="aspect-[16/9] w-full overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                <img 
                  src={tender.imageUrl} 
                  alt="Tender Notice" 
                  className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                <div className="bg-white/90 p-2 rounded-full shadow-lg flex items-center gap-2 text-xs font-bold text-slate-900">
                  <Eye size={14} /> Preview Notice
                </div>
              </div>
            </div>
          )}

          {/* Full Image Modal */}
          {showImage && tender.imageUrl && (
            <div 
                className="fixed inset-0 z-[1000] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 md:p-10"
                onClick={() => setShowImage(false)}
            >
                <button 
                    className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
                    onClick={() => setShowImage(false)}
                >
                    <X size={32} />
                </button>
                <div 
                    className="relative max-w-5xl w-full max-h-full overflow-auto bg-white rounded-2xl shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    <img 
                        src={tender.imageUrl} 
                        alt="Tender Notice Full" 
                        className="w-full h-auto"
                    />
                </div>
            </div>
          )}

          {/* UPKJ Registrations */}
          {tender.upkjRegistrations && tender.upkjRegistrations.length > 0 && (
            <div className="mb-6 p-4 bg-slate-50/50 border border-slate-100 rounded-xl space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <ShieldCheck size={12} className="text-red-600" />
                UPKJ Requirements
              </div>
              
              <div className="space-y-3">
                {tender.upkjRegistrations.map((upkj, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 pb-3 border-b border-slate-200/60 last:border-0 last:pb-0">
                    {upkj.category && (
                      <div className="flex items-center gap-2">
                        <Layers size={12} className="text-blue-500 shrink-0" />
                        <div className="text-xs">
                          <span className="text-slate-400">Cat:</span>
                          <span className="ml-1 text-slate-700 font-medium">{upkj.category}</span>
                        </div>
                      </div>
                    )}
                    {upkj.class && (
                      <div className="flex items-center gap-2">
                        <Award size={12} className="text-purple-500 shrink-0" />
                        <div className="text-xs">
                          <span className="text-slate-400">Class:</span>
                          <span className="ml-1 text-slate-700 font-medium">{upkj.class}</span>
                        </div>
                      </div>
                    )}
                    {(upkj.head || upkj.subhead) && (
                      <div className="flex items-center gap-2">
                        <Hash size={12} className="text-emerald-500 shrink-0" />
                        <div className="text-xs">
                          <span className="text-slate-400">Head/Sub:</span>
                          <span className="ml-1 text-slate-700 font-medium">
                            {upkj.head || '-'}{upkj.subhead ? ` / ${upkj.subhead}` : ''}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SEB Specific Details */}
          {(tender.eligible_tenderers || tender.instructions_to_tenderers || (tender.mandatory_requirements && tender.mandatory_requirements.length > 0)) && (
            <div className="mb-6 p-4 bg-slate-50/50 border border-slate-100 rounded-xl space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <CheckCircle2 size={12} className="text-red-600" />
                Tender Details & Requirements
              </div>
              
              <div className="space-y-3">
                {tender.eligible_tenderers && (
                  <div className="text-xs pb-3 border-b border-slate-200/60 last:border-0 last:pb-0">
                    <span className="text-slate-400 font-bold block mb-1">Eligible Tenderers</span>
                    <p className="text-slate-700 font-body leading-relaxed">{tender.eligible_tenderers}</p>
                  </div>
                )}
                {tender.instructions_to_tenderers && (
                  <div className="text-xs pb-3 border-b border-slate-200/60 last:border-0 last:pb-0">
                    <span className="text-slate-400 font-bold block mb-1">Instructions to Tenderers</span>
                    <p className="text-slate-700 font-body leading-relaxed">{tender.instructions_to_tenderers}</p>
                  </div>
                )}
                {tender.mandatory_requirements && tender.mandatory_requirements.length > 0 && (
                  <div className="text-xs pb-3 border-b border-slate-200/60 last:border-0 last:pb-0">
                    <span className="text-slate-400 font-bold block mb-1">Mandatory Requirements to Submit the Tender</span>
                    <ul className="list-disc pl-4 space-y-1 text-slate-700 font-body leading-relaxed">
                      {tender.mandatory_requirements.map((req, rIdx) => (
                        <li key={rIdx}>{req}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* JKR Specific Class & Qualification */}
          {tender.class_qualification && (
            <div className="mb-6 p-4 bg-slate-50/50 border border-slate-100 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <ShieldCheck size={12} className="text-red-600" />
                Class / Qualification
              </div>
              <p className="text-xs text-slate-700 font-mono whitespace-pre-line leading-relaxed">
                {tender.class_qualification}
              </p>
            </div>
          )}

          {/* Meta */}
          <div className="flex flex-wrap gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Building2 size={12} className="text-emerald-600/60" />
              {tender.organization}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin size={12} className="text-emerald-600/60" />
              {tender.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Hash size={12} className="text-emerald-600/60" />
              {tender.source}
            </span>
          </div>
        </div>

        {/* Right: closing date + button */}
        <div className="md:text-right flex md:flex-col items-center md:items-end justify-between md:justify-start gap-4 md:min-w-[160px]">
          <div>
            <div className="flex items-center md:justify-end gap-1.5 text-xs text-slate-400 mb-1">
              <Calendar size={11} />
              <span>Closing Date</span>
            </div>
            <div className={`font-display text-xl ${closingColor}`}>
              {tender.closing_date}
            </div>
            {tender.closing_time && (
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                {tender.closing_time.includes(' ')
                  ? tender.closing_time.substring(tender.closing_time.indexOf(' ') + 1)
                  : ''}
              </div>
            )}
            <div className={`text-xs mt-0.5 ${daysLeft <= 3 ? 'text-red-600' : 'text-slate-400'}`}>
              {daysLeft <= 0
                ? 'Closed'
                : daysLeft === 1
                ? '1 day left'
                : `${daysLeft} days left`}
            </div>

            {/* Doc Fee / Deposit */}
            {(tender.doc_fee || tender.doc_deposit) && (
              <div className="text-[11px] text-slate-500 mt-3 space-y-1 md:text-right">
                {tender.doc_fee && (
                  <div>
                    <span className="text-slate-400">Doc Fee:</span>{' '}
                    <span className="font-mono font-medium text-slate-700">RM {tender.doc_fee}</span>
                  </div>
                )}
                {tender.doc_deposit && tender.doc_deposit !== '0.00' && (
                  <div>
                    <span className="text-slate-400">Deposit:</span>{' '}
                    <span className="font-mono font-medium text-slate-700">RM {tender.doc_deposit}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <a
            href={tender.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-xs font-mono tracking-wide hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-200 whitespace-nowrap shadow-sm"
          >
            View Tender <ExternalLink size={11} />
          </a>
        </div>
      </div>
    </div>
  )
}
