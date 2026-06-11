import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Image 
                src="/logo.png" 
                alt="STM Logo" 
                width={100} 
                height={35} 
                className="h-8 w-auto object-contain opacity-80"
              />
            </div>
            <p className="text-sm text-slate-500 font-body max-w-xs leading-relaxed">
              Independent aggregator of Sarawak government procurement notices. Not affiliated with any government body.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Sources</span>
            <a href="https://etendernotice.sarawak.gov.my" target="_blank" rel="noopener noreferrer"
              className="text-sm text-slate-500 hover:text-red-600 transition-colors font-body">
              Sarawak eTender Portal
            </a>
            <a href="https://sedc.com.my/notice-of-tender/" target="_blank" rel="noopener noreferrer"
              className="text-sm text-slate-500 hover:text-red-600 transition-colors font-body">
              SEDC Sarawak
            </a>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Navigation</span>
            <Link href="/" className="text-sm text-slate-500 hover:text-red-600 transition-colors font-body">Home</Link>
            <Link href="/tenders" className="text-sm text-slate-500 hover:text-red-600 transition-colors font-body">All Tenders</Link>
            <Link href="/about" className="text-sm text-slate-500 hover:text-red-600 transition-colors font-body">About</Link>
          </div>
        </div>

        <div className="border-t border-slate-200 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-400 font-mono">
            © 2026 Sarawak Tender Monitor · Data sourced from public government portals
          </p>
          <p className="text-xs text-slate-400 font-mono">
            Updated every 6 hours via automated monitoring
          </p>
        </div>
      </div>
    </footer>
  )
}
