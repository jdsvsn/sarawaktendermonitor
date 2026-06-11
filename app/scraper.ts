import * as cheerio from 'cheerio';
import Tesseract from 'tesseract.js';
import { Tender } from './types';

export async function getLiveTenders(): Promise<Tender[]> {
  const [eTenders, sedcTenders] = await Promise.all([
    fetchETender(),
    fetchSEDCTender(),
  ]);

  return [...eTenders, ...sedcTenders];
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

async function fetchETender(): Promise<Tender[]> {
  try {
    console.log('Fetching eTender...');
    const response = await fetch('https://etendernotice.sarawak.gov.my/', {
      next: { revalidate: 3600 },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    const html = await response.text();
    const $ = cheerio.load(html);
    const tenders: Tender[] = [];

    const rows = $('table tr').toArray();

    for (const el of rows) {
      const cols = $(el).find('td');
      if (cols.length >= 4) {
        const closingDateText = $(cols[1]).text().trim();
        const linkEl = $(cols[3]).find('a');
        
        if (linkEl.length > 0 && /\d{2}[-\/]\d{2}[-\/]\d{4}/.test(closingDateText)) {
          const organization = $(cols[2]).text().trim();
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
          
          let link = 'https://etendernotice.sarawak.gov.my/';
          if (detailPath) {
            const cleanPath = detailPath.startsWith('/') ? detailPath.substring(1) : detailPath;
            link = `https://etendernotice.sarawak.gov.my/etender/public/${cleanPath.replace('etender/public/', '')}`;
          }

          let upkjInfo: any[] = [];
          try {
            const detailRes = await fetch(link, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            const detailHtml = await detailRes.text();
            upkjInfo = extractUPKJRegistrations(cheerio.load(detailHtml));
          } catch (e) {}

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
            // Map UPKJ info for UI
            upkjRegistrations: upkjInfo
          });
        }
      }
    }
    return tenders;
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
    });
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
