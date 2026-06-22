import * as cheerio from 'cheerio';
import Tesseract from 'tesseract.js';
import { Tender } from './types';
import * as fs from 'fs';
import * as path from 'path';

const CACHE_PATH = path.join(process.cwd(), 'tenders_cache.json');
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

let isFetchingInProgress = false;

export async function getLiveTenders(): Promise<Tender[]> {
  try {
    if (fs.existsSync(CACHE_PATH)) {
      const stats = fs.statSync(CACHE_PATH);
      const age = Date.now() - stats.mtime.getTime();
      
      const cachedContent = fs.readFileSync(CACHE_PATH, 'utf-8');
      const cachedTenders = JSON.parse(cachedContent) as Tender[];

      if (age < CACHE_TTL) {
        console.log(`Serving ${cachedTenders.length} tenders from fresh cache (Age: ${Math.round(age / 1000)}s)`);
        return cachedTenders;
      }

      if (!isFetchingInProgress) {
        console.log('Cache is stale. Triggering background scrape...');
        triggerBackgroundScrape();
      }

      console.log(`Serving ${cachedTenders.length} tenders from stale cache while refreshing...`);
      return cachedTenders;
    }
  } catch (err) {
    console.error('Error reading cache:', err);
  }

  console.log('No cache found. Running foreground scrape...');
  isFetchingInProgress = true;
  try {
    const tenders = await runFullScrape();
    isFetchingInProgress = false;
    return tenders;
  } catch (err) {
    isFetchingInProgress = false;
    throw err;
  }
}

async function triggerBackgroundScrape() {
  isFetchingInProgress = true;
  try {
    await runFullScrape();
  } catch (err) {
    console.error('Background scrape failed:', err);
  } finally {
    isFetchingInProgress = false;
  }
}

async function runFullScrape(): Promise<Tender[]> {
  const [eTenders, sedcTenders, jkrTenders, recodaTenders, bdaTenders] = await Promise.all([
    fetchETender(),
    fetchSEDCTender(),
    fetchJKRSarawakTender(),
    fetchRECODATender(),
    fetchBDATender(),
  ]);

  const mergedMap = new Map<string, Tender>();

  const addOrMerge = (items: Tender[]) => {
    for (const item of items) {
      const cleanRef = item.ref_no.replace(/[()]/g, '').trim().toUpperCase();
      const key = cleanRef !== 'N/A' ? cleanRef : `${item.title.substring(0, 50).toUpperCase()}`;

      if (mergedMap.has(key)) {
        const existing = mergedMap.get(key)!;
        mergedMap.set(key, {
          ...existing,
          ...item,
          class_qualification: item.class_qualification || existing.class_qualification,
          doc_fee: item.doc_fee || existing.doc_fee,
          doc_deposit: item.doc_deposit || existing.doc_deposit,
          closing_time: item.closing_time || existing.closing_time,
          upkjRegistrations: (item.upkjRegistrations && item.upkjRegistrations.length > 0) ? item.upkjRegistrations : existing.upkjRegistrations
        });
      } else {
        mergedMap.set(key, item);
      }
    }
  };

  addOrMerge(eTenders);
  addOrMerge(sedcTenders);
  addOrMerge(jkrTenders);
  addOrMerge(recodaTenders);
  addOrMerge(bdaTenders);

  const combined = Array.from(mergedMap.values());
  if (combined.length > 0) {
    try {
      fs.writeFileSync(CACHE_PATH, JSON.stringify(combined, null, 2), 'utf-8');
      console.log(`Successfully updated cache file at ${CACHE_PATH} with ${combined.length} tenders.`);
    } catch (err) {
      console.error('Failed to write to cache file:', err);
    }
  }
  return combined;
}

function extractUPKJRegistrations($: cheerio.CheerioAPI) {
  const upkjRegistrations: any[] = [];
  
  const labels = {
    category: ['Registration Category', 'Category', 'Kategori Pendaftaran', 'Kategori Kerja', 'Kategori', 'Contractor Category'],
    class: ['Class', 'Classification', 'Kelas', 'Klasifikasi'],
    head: ['Head', 'Kepala'],
    subhead: ['Subhead', 'Sub-head', 'Sub Head', 'Subkepala', 'Sub-kepala', 'Sub Kepala']
  };

  const categoryMap: Record<string, string> = {
    'kerja': 'Works',
    'bekalan': 'Supplies & Services',
    'perkhidmatan': 'Supplies & Services',
    'works': 'Works',
    'supplies': 'Supplies & Services',
    'services': 'Supplies & Services'
  };

  // Scan tables first as they are most structured
  $('tr').each((_, tr) => {
    const rowText = $(tr).text().toLowerCase();
    
    // If a row contains "head" or "kepala", it's likely a registration entry
    if (rowText.includes('head') || rowText.includes('kepala') || rowText.includes('class') || rowText.includes('kelas')) {
      const entry: any = { category: "", class: "", head: "", subhead: "" };
      
      const findVal = (fieldLabels: string[]) => {
        let val = "";
        $(tr).find('td, th').each((i, el) => {
          const cellText = $(el).text().trim().toLowerCase().replace(/[:\s]+/g, ' ');
          if (fieldLabels.some(l => cellText === l.toLowerCase() || cellText.includes(l.toLowerCase()))) {
            let next = $(el).next('td');
            if (next.text().trim() === ':' || !next.text().trim()) next = next.next('td');
            val = next.text().trim().replace(/^[:\s-]+/, '').trim();
            return false;
          }
        });
        return val;
      };

      entry.category = findVal(labels.category);
      entry.class = findVal(labels.class);
      entry.head = findVal(labels.head);
      entry.subhead = findVal(labels.subhead);

      // Normalize Category
      for (const [key, target] of Object.entries(categoryMap)) {
        if (entry.category.toLowerCase().includes(key)) {
          entry.category = target;
          break;
        }
      }

      // If we found at least a head or class, add it
      if (entry.head || entry.class || entry.category) {
        console.log('   - Matched UPKJ Row:', JSON.stringify(entry));
        upkjRegistrations.push(entry);
      }
    }
  });

  // Fallback: Full text regex if table scan failed or missed items
  if (upkjRegistrations.length === 0) {
    const fullText = $.text();
    console.log('   - Falling back to regex scan...');
    // Look for patterns like "Class B Head II Subhead 2(a)"
    const pattern = /(?:Class|Kelas)\s*([A-F])\s*(?:Head|Kepala)\s*([IVX\d]+)\s*(?:Subhead|Sub\s*Kepala)\s*([^\s,;]+)/gi;
    let match;
    while ((match = pattern.exec(fullText)) !== null) {
      console.log('   - Regex match found:', match[0]);
      upkjRegistrations.push({
        category: fullText.toLowerCase().includes('kerja') ? 'Works' : 'Supplies & Services',
        class: match[1].toUpperCase(),
        head: match[2].toUpperCase(),
        subhead: match[3]
      });
    }
  }

  const result = Array.from(new Set(upkjRegistrations.map(r => JSON.stringify(r))))
    .map(s => JSON.parse(s))
    .map(r => ({
      ...r,
      head: r.head.toUpperCase(),
      class: r.class.toUpperCase()
    }));
  
  console.log('   - Final UPKJ Result count:', result.length);
  return result;
}

async function fetchETenderPage(url: string, cookieHeader: string): Promise<Tender[]> {
  try {
    console.log(`Fetching eTender page: ${url}`);
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Cookie': cookieHeader
      }
    });
    if (!response.ok) {
      console.warn(`Failed to fetch page ${url}: ${response.statusText}`);
      return [];
    }
    const html = await response.text();
    const $ = cheerio.load(html);
    const tenders: Tender[] = [];
    const rows = $('table tr').toArray();

    for (const el of rows) {
      if ($(el).find('table').length > 0) continue;
      const cols = $(el).find('td');
      if (cols.length >= 4) {
        let linkEl: any = null;
        let titleColIdx = -1;
        
        cols.each((i, td) => {
          const a = $(td).find('a');
          if (a.length > 0) {
            const href = a.attr('href') || '';
            if (href.includes('public_tender_view.jsp') || href.includes('MedWindow')) {
              linkEl = a;
              titleColIdx = i;
              return false; // break loop
            }
          }
        });

        if (linkEl && titleColIdx !== -1) {
          const closingDateText = $(cols[1]).text().trim();
          if (/\d{2}[-\/]\d{2}[-\/]\d{4}/.test(closingDateText)) {
            const organization = $(cols[titleColIdx - 1]).text().trim();
            let fullText = linkEl.text().trim();
            const boldText = linkEl.find('b').text().trim();
            const refMatch = fullText.match(/\(([^)]+)\)$/);
            const refNo = boldText || (refMatch ? refMatch[1] : 'N/A');
            
            let title = fullText;
            if (boldText) title = title.replace(boldText, '').trim();
            if (refMatch) title = title.replace(refMatch[0], '').trim();
            title = title.replace(/^[\s\-:]+/, '');

            const rawHref = linkEl.attr('href') || '';
            const urlMatch = rawHref.match(/'([^']+)'/);
            let detailPath = urlMatch ? urlMatch[1] : '';
            if (!detailPath && rawHref.includes('public_tender_view.jsp')) {
              detailPath = rawHref;
            }
            
            let link = 'https://etendernotice.sarawak.gov.my/';
            if (detailPath) {
              const cleanPath = detailPath.startsWith('/') ? detailPath.substring(1) : detailPath;
              link = `https://etendernotice.sarawak.gov.my/etender/public/${cleanPath.replace('etender/public/', '')}`;
            }

            tenders.push({
              title,
              organization,
              location: 'Sarawak',
              closing_date: closingDateText.split(' ')[0],
              ref_no: refNo,
              description: title,
              link: link,
              source: 'Sarawak eTender',
              posted_date: new Date().toISOString().split('T')[0],
              upkjRegistrations: []
            });
          }
        }
      }
    }
    return tenders;
  } catch (error) {
    console.error(`Error fetching page ${url}:`, error);
    return [];
  }
}

async function fetchETender(): Promise<Tender[]> {
  try {
    console.log('Establishing eTender session...');
    
    // Step 1: Request landing page to initialize session cookie (JSESSIONID)
    const landingRes = await fetch('https://etendernotice.sarawak.gov.my/etender/public/public_tender.jsp', {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!landingRes.ok) {
      console.warn(`Failed to connect to eTender landing page: ${landingRes.statusText}`);
      return [];
    }

    // Extract JSESSIONID and associated cookies
    const rawCookies = landingRes.headers.getSetCookie();
    let cookieHeader = '';
    if (rawCookies && rawCookies.length > 0) {
      cookieHeader = rawCookies.map(c => c.split(';')[0].trim()).join('; ');
    } else {
      const cookiesStr = landingRes.headers.get('set-cookie');
      if (cookiesStr) {
        cookieHeader = cookiesStr.split(',').map(c => c.split(';')[0].trim()).join('; ');
      }
    }
    console.log(`Established eTender session successfully. Header length: ${cookieHeader.length}`);

    // Indices requested by the user
    const indices = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95];
    const pageUrls = indices.map(idx => 
      idx === 0 
        ? 'https://etendernotice.sarawak.gov.my/' 
        : `https://etendernotice.sarawak.gov.my/etender/public/public_tender_list.jsp?current_index=${idx}`
    );

    // Scrape all index list pages sequentially to prevent session race conditions on the JSP server
    const pageResults: Tender[][] = [];
    for (const url of pageUrls) {
      const pageTenders = await fetchETenderPage(url, cookieHeader);
      pageResults.push(pageTenders);
    }
    const allTenders = pageResults.flat();

    // Deduplicate by ref_no + title
    const uniqueMap = new Map<string, Tender>();
    for (const item of allTenders) {
      const key = `${item.ref_no}-${item.title}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, item);
      }
    }
    const finalTenders = Array.from(uniqueMap.values());
    console.log(`Found ${finalTenders.length} unique eTender listings across all pages. Fetching details...`);

    // Fetch UPKJ detail information in batches of 5 to prevent rate limits
    const batchSize = 5;
    for (let i = 0; i < finalTenders.length; i += batchSize) {
      const batch = finalTenders.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (item) => {
          try {
            const detailRes = await fetch(item.link, { 
              cache: 'no-store',
              headers: { 
                'User-Agent': 'Mozilla/5.0',
                'Cookie': cookieHeader
              }
            });
            if (detailRes.ok) {
              const detailHtml = await detailRes.text();
              item.upkjRegistrations = extractUPKJRegistrations(cheerio.load(detailHtml));
            }
          } catch (e) {
            console.error(`Failed to fetch detail for eTender: ${item.ref_no}`);
          }
        })
      );
    }

    return finalTenders;
  } catch (error) {
    console.error('Error fetching eTender:', error);
    return [];
  }
}

async function fetchSEDCTender(): Promise<Tender[]> {
  try {
    console.log('Fetching SEDC...');
    const response = await fetch('https://sedc.com.my/notice-of-tender/', {
      next: { revalidate: 3600 },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    } as any);
    const html = await response.text();
    const $ = cheerio.load(html);
    const tenders: Tender[] = [];

    const links = $('a').toArray();
    for (const el of links) {
      const linkText = $(el).text().trim();
      const link = $(el).attr('href') || '';
      
      const categories = [
        'food based', 'agro based', 'tourism', 'construction', 
        'manufacturing', 'services', 'property development', 'mining', 'logging',
        'food-based', 'agro-based'
      ];
      if (categories.includes(linkText.toLowerCase())) continue;

      const navTerms = /^(notice of tender|home|about us|contact us|careers|gallery|archive|view all|tender notice)$/i;
      if (navTerms.test(linkText)) continue;

      const hasSeparator = linkText.includes('–') || linkText.includes(':') || linkText.includes('-');
      
      if (linkText.length > 15 && link && hasSeparator) {
        let refNo = 'N/A';
        let title = linkText;

        if (linkText.includes('–')) {
          const parts = linkText.split('–');
          if (parts.length >= 2) {
            if (parts.length > 2 && (linkText.toLowerCase().includes('notis') || linkText.toLowerCase().includes('ralat'))) {
              refNo = parts[1].trim();
              title = parts.slice(2).join(' – ').trim();
            } else {
              refNo = parts[0].trim();
              title = parts.slice(1).join(' – ').trim();
            }
          }
        } else if (linkText.includes(':')) {
          const parts = linkText.split(':');
          refNo = parts[0].trim();
          title = parts.slice(1).join(':').trim();
        } else {
          const parts = linkText.split('-');
          refNo = parts[0].trim();
          title = parts.slice(1).join('-').trim();
        }

        if (title.length > 20) {
          const absoluteLink = link.startsWith('http') ? link : `https://sedc.com.my${link.startsWith('/') ? '' : '/'}${link}`;
          
          // Scrape image and UPKJ from detail page
          let imageUrl = '';
          let upkjInfo: any[] = [];
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            const detailRes = await fetch(absoluteLink, { 
                headers: { 'User-Agent': 'Mozilla/5.0' },
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (detailRes.ok) {
              const detailHtml = await detailRes.text();
              const $d = cheerio.load(detailHtml);
              
              // Extract Image
              const img = $d('.entry-content img').first();
              let ocrText = '';
              if (img.length > 0) {
                imageUrl = img.attr('src') || '';
                if (imageUrl && !imageUrl.startsWith('http')) {
                    imageUrl = `https://sedc.com.my${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
                }
                
                // OCR Processing
                if (imageUrl) {
                  try {
                    console.log(`Running OCR on image for ${refNo}...`);
                    const imgRes = await fetch(imageUrl);
                    const imgBuffer = await imgRes.arrayBuffer();
                    const { data: { text } } = await Tesseract.recognize(Buffer.from(imgBuffer), 'eng');
                    console.log(`OCR complete for ${refNo}. Extracted ${text.length} characters.`);
                    ocrText = text;
                  } catch (ocrErr) {
                    console.error('OCR Failed for', refNo, ocrErr);
                  }
                }
              }

              // Extract UPKJ
              if (ocrText) {
                $d('body').append(`<div>${ocrText}</div>`);
              }
              upkjInfo = extractUPKJRegistrations($d);
            }
          } catch (e) {
            console.error(`Failed to fetch detail for SEDC ${refNo}`);
          }

          tenders.push({
            title: title.toUpperCase(),
            organization: 'SEDC Sarawak',
            location: 'Sarawak',
            closing_date: 'See Link',
            link: absoluteLink,
            ref_no: refNo.toUpperCase(),
            description: title,
            source: 'SEDC Sarawak',
            posted_date: new Date().toISOString().split('T')[0],
            imageUrl: imageUrl || undefined,
            upkjRegistrations: upkjInfo
          });
        }
      }
    }

    console.log('SEDC processed count:', tenders.length);
    return tenders;
  } catch (error) {
    console.error('Error fetching SEDC:', error);
    return [];
  }
}

async function fetchJKRSarawakTender(): Promise<Tender[]> {
  try {
    console.log('Fetching JKR Sarawak Portal tenders...');
    const res = await fetch('https://jkr.sarawak.gov.my/web/subpage/tender_and_quotation_list_ajax/?tms_type=tender', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!res.ok) {
      console.warn(`Failed to fetch JKR Sarawak Portal tenders: ${res.statusText}`);
      return [];
    }
    const html = await res.text();
    const $ = cheerio.load(html);
    const tenders: Tender[] = [];

    $('.resp-table-row').each((_, el) => {
      if ($(el).parent().attr('id') === 'resp-table-header' || $(el).hasClass('table-head-row')) {
        return;
      }
      
      const cells = $(el).find('.table-body-cell');
      if (cells.length >= 6) {
        const titleCell = $(cells[1]);
        const refNoRaw = titleCell.find('b').first().text().trim();
        const refNo = refNoRaw.replace(/[()]/g, '').trim().toUpperCase() || 'N/A';

        let fullText = titleCell.text().trim();
        let title = fullText;
        if (refNoRaw) {
          title = title.replace(refNoRaw, '').trim();
        }
        
        let location = 'Sarawak';
        const locMatch = fullText.match(/Project Location\s*:\s*([^\n\r]+)/i);
        if (locMatch) location = locMatch[1].trim();
        
        const metaIndex = title.indexOf('Project Location');
        if (metaIndex !== -1) {
          title = title.substring(0, metaIndex).trim();
        }
        const notesIndex = title.indexOf('Notes:');
        let description = title;
        if (notesIndex !== -1) {
          title = title.substring(0, notesIndex).trim();
        }
        
        title = title.replace(/^[\s\-:]+/, '').trim();
        description = description.replace(/^[\s\-:]+/, '').trim();

        const classQual = $(cells[2]).text().trim().replace(/\r/g, '').replace(/\n+/g, ' ');
        const closingDateTime = $(cells[3]).text().trim();
        const closingDate = closingDateTime.split(' ')[0];
        const docFee = $(cells[4]).text().trim();
        const docDeposit = $(cells[5]).text().trim();

        tenders.push({
          title: title.toUpperCase(),
          organization: 'JKR Sarawak (Public Works Department)',
          location: location,
          closing_date: closingDate,
          closing_time: closingDateTime,
          ref_no: refNo,
          description: description,
          class_qualification: classQual,
          doc_fee: docFee,
          doc_deposit: docDeposit,
          link: 'https://jkr.sarawak.gov.my/web/subpage/tender_and_quotation_list/tender',
          source: 'JKR Sarawak Portal',
          posted_date: new Date().toISOString().split('T')[0],
          upkjRegistrations: extractUPKJRegistrations(cheerio.load($(cells[2]).html() || ''))
        });
      }
    });

    console.log(`Successfully scraped ${tenders.length} tenders from JKR Sarawak Portal.`);
    return tenders;
  } catch (error) {
    console.error('Error fetching JKR Sarawak Portal:', error);
    return [];
  }
}

export async function fetchRECODATender(): Promise<Tender[]> {
  try {
    console.log('Fetching RECODA tenders...');
    const res = await fetch('https://recoda.gov.my/tender/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      }
    });
    if (!res.ok) {
      console.warn(`Failed to fetch RECODA tenders: ${res.statusText}`);
      return [];
    }
    const html = await res.text();
    const $ = cheerio.load(html);
    const tenders: Tender[] = [];

    $('table').each((tIdx, table) => {
      const rows = $(table).find('tr');
      rows.each((rIdx, tr) => {
        if (rIdx === 0) return;

        const cells = $(tr).find('td');
        if (cells.length >= 4) {
          const refNo = $(cells[0]).text().trim();
          const title = $(cells[1]).text().trim().replace(/\r/g, '').replace(/\n+/g, ' ');
          const closingDateRaw = $(cells[2]).text().trim();
          const docCell = $(cells[3]);
          const link = docCell.find('a').attr('href') || '';

          if (!refNo && !title) return;

          const closingDate = parseMalayDate(closingDateRaw);
          
          tenders.push({
            title: title.toUpperCase(),
            organization: 'RECODA (Regional Corridor Development Authority)',
            location: 'Sarawak',
            closing_date: closingDate,
            ref_no: refNo,
            description: title,
            link: link,
            source: 'RECODA',
            posted_date: new Date().toISOString().split('T')[0],
            upkjRegistrations: []
          });
        }
      });
    });

    console.log(`Successfully scraped ${tenders.length} tenders from RECODA.`);
    return tenders;
  } catch (error) {
    console.error('Error fetching RECODA:', error);
    return [];
  }
}

function parseMalayDate(dateStr: string): string {
  const cleanStr = dateStr.split('\n')[0].trim().toLowerCase();
  const match = cleanStr.match(/^(\d{1,2})\s+([a-z]+)\s+(\d{4})/i);
  if (!match) return dateStr;

  const day = match[1].padStart(2, '0');
  const monthWord = match[2];
  const year = match[3];

  const monthMap: Record<string, string> = {
    januari: '01', jan: '01',
    februari: '02', feb: '02',
    mac: '03',
    april: '04', apr: '04',
    mei: '05', may: '05',
    jun: '06', june: '06',
    julai: '07', jul: '07', july: '07',
    ogos: '08', aug: '08',
    september: '09', sep: '09', sept: '09',
    oktober: '10', okt: '10', oct: '10',
    november: '11', nov: '11',
    disember: '12', dis: '12', dec: '12'
  };

  const month = monthMap[monthWord] || '01';
  return `${day}-${month}-${year}`;
}

export async function fetchBDATender(): Promise<Tender[]> {
  try {
    const pdfModule = eval("require('pdf-parse')");
    
    // Polyfill or wrap to handle both older pdf-parse (function) and modern Mehmet Kozan's pdf-parse (object)
    const parsePDF = async (dataBuffer: Buffer) => {
      if (typeof pdfModule === 'function') {
        return await pdfModule(dataBuffer);
      } else {
        const PDFParseClass = pdfModule.PDFParse;
        const inst = new PDFParseClass(new Uint8Array(dataBuffer));
        return await inst.getText();
      }
    };

    console.log('Fetching BDA webpage...');
    const res = await fetch('https://www.bda.gov.my/web/subpage/webpage_view/53', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      }
    });
    if (!res.ok) {
      console.warn(`Failed to fetch BDA webpage: ${res.statusText}`);
      return [];
    }
    const html = await res.text();
    const $ = cheerio.load(html);
    const pdfLinks: string[] = [];

    $('a[href*="attachment/show"]').each((i, el) => {
      const href = $(el).attr('href') || '';
      const fullUrl = href.startsWith('http') ? href : `https://www.bda.gov.my${href}`;
      const parentText = $(el).parent().text() || '';
      const text = $(el).text().trim();
      
      if (parentText.includes('Tender closing on') || /\b(june|july|jun|jul)\b/i.test(text) || /^\d+$/.test(text)) {
        if (!pdfLinks.includes(fullUrl)) {
          pdfLinks.push(fullUrl);
        }
      }
    });

    console.log(`Found BDA PDF Links:`, pdfLinks);
    const tenders: Tender[] = [];

    for (const url of pdfLinks) {
      try {
        console.log(`Downloading and parsing BDA PDF: ${url}`);
        const pdfRes = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0'
          }
        });
        if (!pdfRes.ok) {
          console.warn(`Failed to download PDF: ${url}`);
          continue;
        }
        const buffer = await pdfRes.arrayBuffer();
        const data = await parsePDF(Buffer.from(buffer));
        const text = data.text;

        const refPattern = /\b(BDA\/CT\/\d+\/\d+|BDA\/QT\/\d+\/\d+|ITB\/\d+\/\d+)/g;
        const refMatches: { ref: string; index: number }[] = [];
        let match;
        while ((match = refPattern.exec(text)) !== null) {
          refMatches.push({
            ref: match[1],
            index: match.index
          });
        }

        for (let i = 0; i < refMatches.length; i++) {
          const currentRef = refMatches[i];
          const nextRef = refMatches[i + 1];
          const startIdx = currentRef.index;
          const endIdx = nextRef ? nextRef.index : text.length;
          const block = text.substring(startIdx, endIdx);
          
          const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0);
          
          let closingDate = 'See Link';
          let dateIdx = -1;
          const dateRegex = /(\d{1,2}\s+(Julai|Jun|Jul|June|Ogos|August|Mei|May|April|Mac|Februari|Januari)\s+\d{4})/i;
          for (let j = lines.length - 1; j >= 0; j--) {
            const dateMatch = lines[j].match(dateRegex);
            if (dateMatch) {
              closingDate = parseMalayDate(dateMatch[1]);
              dateIdx = j;
              break;
            }
          }

          let docFee = 'N/A';
          let feeIdx = -1;
          const feeRegex = /RM\s*\d+(\.\d{2})?/i;
          for (let j = lines.length - 1; j >= 0; j--) {
            const feeMatch = lines[j].match(feeRegex);
            if (feeMatch) {
              docFee = feeMatch[0].replace(/RM\s*/i, '').trim();
              feeIdx = j;
              break;
            }
          }

          let regIdx = -1;
          for (let j = 1; j < lines.length; j++) {
            if (lines[j].toUpperCase().includes('UPKJ') || lines[j].toUpperCase().includes('CIDB') || lines[j].toUpperCase().includes('KONTRAKTOR')) {
              regIdx = j;
              break;
            }
          }

          let titleLines: string[] = [];
          const titleEndIdx = regIdx !== -1 ? regIdx : (feeIdx !== -1 ? feeIdx : (dateIdx !== -1 ? dateIdx : lines.length));
          for (let j = 1; j < titleEndIdx; j++) {
            titleLines.push(lines[j]);
          }
          const title = titleLines.join(' ');

          let classQual = 'N/A';
          if (regIdx !== -1) {
            const regEndIdx = feeIdx !== -1 ? feeIdx : (dateIdx !== -1 ? dateIdx : lines.length);
            const regLines: string[] = [];
            for (let j = regIdx; j < regEndIdx; j++) {
              regLines.push(lines[j]);
            }
            classQual = regLines.join('\n');
          }

          tenders.push({
            title: title.toUpperCase(),
            organization: 'Bintulu Development Authority (BDA)',
            location: 'Bintulu, Sarawak',
            closing_date: closingDate,
            ref_no: currentRef.ref,
            description: title,
            link: url,
            source: 'BDA Portal',
            posted_date: new Date().toISOString().split('T')[0],
            class_qualification: classQual,
            doc_fee: docFee,
            upkjRegistrations: []
          });
        }
      } catch (err: any) {
        console.error(`Error parsing BDA PDF at ${url}:`, err.message);
      }
    }

    console.log(`Successfully scraped ${tenders.length} tenders from BDA.`);
    return tenders;
  } catch (error) {
    console.error('Error fetching BDA:', error);
    return [];
  }
}

