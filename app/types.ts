export interface UPKJRegistration {
  category: string;
  class: string;
  head: string;
  subhead: string;
}

export interface Tender {
  title: string
  organization: string
  location: string
  closing_date: string
  ref_no: string
  description: string
  link: string
  source: string
  posted_date: string
  // Participation Conditions
  registered_with?: string
  registration_status?: string
  registration_category?: string
  registration_classification?: string
  kategori?: string
  kepala?: string
  sub_kepala?: string
  license?: string
  imageUrl?: string
  upkjRegistrations?: UPKJRegistration[]
}

export const MOCK_TENDERS: Tender[] = [
  {
    title: "Proposed Upgrade of Coastal Road Infrastructure, Mukah Division",
    organization: "JKR Sarawak (Public Works Department)",
    location: "Mukah, Sarawak",
    closing_date: "14-06-2026",
    ref_no: "JKR/T/2026/0892",
    description: "Construction and commissioning of enhanced drainage systems and road widening for the Mukah-Balingian stretch under the Coastal Road Project.",
    link: "https://etendernotice.sarawak.gov.my",
    source: "Sarawak eTender",
    posted_date: "19-05-2026"
  },
  {
    title: "Supply and Maintenance of Smart Waste Management Sensors",
    organization: "DBKU (Kuching North City Commission)",
    location: "Kuching, Sarawak",
    closing_date: "28-06-2026",
    ref_no: "DBKU/2026/TEN/015",
    description: "Procurement of IoT-enabled waste monitoring sensors and a centralised monitoring dashboard for Kuching North City Commission.",
    link: "https://etendernotice.sarawak.gov.my",
    source: "Sarawak eTender",
    posted_date: "18-05-2026"
  },
  {
    title: "Digital Transformation Consultancy for Sarawak Energy Berhad",
    organization: "Sarawak Energy Berhad",
    location: "Statewide",
    closing_date: "15-07-2026",
    ref_no: "SEB-T-26-112",
    description: "Consultancy services for the development of a 5-year digital roadmap focusing on grid modernisation and customer service automation.",
    link: "https://sedc.com.my/notice-of-tender/",
    source: "SEDC Sarawak",
    posted_date: "17-05-2026"
  },
  {
    title: "Construction of New Administrative Complex, Bintulu",
    organization: "Bintulu Development Authority (BDA)",
    location: "Bintulu, Sarawak",
    closing_date: "30-07-2026",
    ref_no: "BDA/2026/CON/004",
    description: "Design and build contract for a new 8-storey administrative complex including carpark facilities and landscaping works.",
    link: "https://etendernotice.sarawak.gov.my",
    source: "Sarawak eTender",
    posted_date: "16-05-2026"
  },
  {
    title: "Provision of Security Services for SEDC Properties",
    organization: "Sarawak Economic Development Corporation (SEDC)",
    location: "Kuching, Sarawak",
    closing_date: "25-06-2026",
    ref_no: "SEDC:Q/22/2026",
    description: "SEDC tender notice for security guard services across 12 SEDC-managed properties in Kuching and Miri.",
    link: "https://sedc.com.my/notice-of-tender/",
    source: "SEDC Sarawak",
    posted_date: "15-05-2026"
  },
  {
    title: "Supply of Medical Equipment for Sarawak General Hospital",
    organization: "Ministry of Health Sarawak",
    location: "Kuching, Sarawak",
    closing_date: "20-06-2026",
    ref_no: "MOH/SWK/2026/MED/089",
    description: "Procurement of diagnostic imaging equipment including MRI and CT scanning machines for Sarawak General Hospital.",
    link: "https://etendernotice.sarawak.gov.my",
    source: "Sarawak eTender",
    posted_date: "14-05-2026"
  },
  {
    title: "Riverbank Erosion Control Works, Sarikei District",
    organization: "Department of Irrigation and Drainage Sarawak",
    location: "Sarikei, Sarawak",
    closing_date: "22-06-2026",
    ref_no: "DID/SWK/T/2026/034",
    description: "Civil works for riverbank stabilisation and erosion control along the Sarikei River, including geotextile installation.",
    link: "https://etendernotice.sarawak.gov.my",
    source: "Sarawak eTender",
    posted_date: "13-05-2026"
  },
  {
    title: "IT Infrastructure Upgrade for Sarawak Public Service",
    organization: "State Financial Secretary Sarawak",
    location: "Kuching, Sarawak",
    closing_date: "10-07-2026",
    ref_no: "SFS/ICT/2026/017",
    description: "Supply, installation and commissioning of server infrastructure and network equipment for Sarawak State Government offices.",
    link: "https://etendernotice.sarawak.gov.my",
    source: "Sarawak eTender",
    posted_date: "12-05-2026"
  }
]

export function getDaysUntilClosing(closingDate: string): number {
  const parts = closingDate.includes('/') ? closingDate.split('/') : closingDate.split('-')
  if (parts.length !== 3) return 999
  // Assuming DD-MM-YYYY or DD/MM/YYYY
  const date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
  const now = new Date()
  const diff = date.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function getStatusBadge(daysLeft: number, postedDate: string): 'URGENT' | 'NEW' | 'OPEN' {
  if (daysLeft <= 5) return 'URGENT'
  const parts = postedDate.split('-')
  if (parts.length === 3) {
    const posted = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
    const now = new Date()
    const daysSincePosted = Math.floor((now.getTime() - posted.getTime()) / (1000 * 60 * 60 * 24))
    if (daysSincePosted <= 3) return 'NEW'
  }
  return 'OPEN'
}
