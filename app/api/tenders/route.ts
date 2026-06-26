import { NextResponse } from 'next/server'
import { getLiveTenders } from '../../scraper'
import { getDaysUntilClosing, getStatusBadge, MOCK_TENDERS } from '../../types'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    let rawTenders = []
    try {
      rawTenders = await getLiveTenders()
    } catch (err) {
      console.error('Scraping failed in API:', err)
    }

    const tendersData = rawTenders.length > 0 ? rawTenders : MOCK_TENDERS

    const mappedTenders = tendersData.map((t, index) => {
      const daysLeft = getDaysUntilClosing(t.closing_date)
      const status = getStatusBadge(daysLeft, t.posted_date)
      
      // Construct a tender_id similar to the API format: "Source-With-Spaces-Replaced-ref_no-index"
      const cleanSource = t.source.replace(/\s+/g, '-')
      const cleanRef = t.ref_no ? t.ref_no.replace(/\s+/g, '-') : 'N/A'
      const tenderId = `${cleanSource}-${cleanRef}-${index}`
      
      return {
        tender_id: tenderId,
        ref_no: t.ref_no,
        title: t.title,
        description: t.description || t.title,
        organization: t.organization,
        location: t.location,
        source: t.source,
        closing_date: t.closing_date,
        posted_date: t.posted_date,
        days_left: daysLeft,
        status: status,
        upkj: (t.upkjRegistrations && t.upkjRegistrations.length > 0)
          ? t.upkjRegistrations.map(reg => ({
              category: reg.category || '',
              class: reg.class || '',
              head: reg.head || '',
              subhead: reg.subhead || ''
            }))
          : null,
        link: t.link,
        image_url: t.imageUrl || null
      }
    })

    return NextResponse.json({
      tenders: mappedTenders,
      total: mappedTenders.length,
      fetched_at: new Date().toISOString()
    })
  } catch (error) {
    console.error('API /api/tenders error:', error)
    return NextResponse.json({ error: 'Failed to fetch tenders' }, { status: 500 })
  }
}
