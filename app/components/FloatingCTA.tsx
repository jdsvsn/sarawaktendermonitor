'use client'

import { Send } from 'lucide-react'

export default function FloatingCTA() {
  return (
    <div className="fixed bottom-10 right-10 z-[90] group animate-float-subtle">
      {/* Circular Text */}
      <div className="absolute inset-[-40px] w-[136px] h-[136px] -left-[41px] -top-[41px] pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-full h-full animate-spin-slow">
          <defs>
            <path
              id="circlePath"
              d="M 50, 50 m -38, 0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
            />
          </defs>
          <text className="text-[8px] font-mono fill-slate-400 font-bold uppercase tracking-[4.5px]">
            <textPath xlinkHref="#circlePath">
              join our telegram channel • 
            </textPath>
          </text>
        </svg>
      </div>

      {/* Tooltip (kept for extra clarity on hover) */}
      <div className="absolute bottom-full right-0 mb-6 px-4 py-2 bg-slate-900 text-white text-xs font-mono rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap shadow-xl">
        Click to Open Telegram
        {/* Triangle tip */}
        <div className="absolute top-full right-5 -mt-1 w-2 h-2 bg-slate-900 rotate-45" />
      </div>

      {/* Button */}
      <a
        href="https://t.me/+gniFz91d8wgyZGY9"
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex items-center justify-center w-14 h-14 bg-red-600 text-white rounded-full shadow-lg shadow-red-600/30 hover:bg-red-700 hover:scale-110 transition-all duration-300 active:scale-95 z-10"
        aria-label="Join Telegram Channel"
      >
        <Send size={24} className="-ml-0.5" />
      </a>
    </div>
  )
}
