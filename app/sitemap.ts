import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://sarawaktendermonitor.com'
  
  const routes = ['', '/tenders', '/about', '/statistics', '/awarded']
  
  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' || route === '/tenders' ? 'hourly' : 'daily',
    priority: route === '' ? 1.0 : route === '/tenders' ? 0.9 : 0.7,
  }))
}
