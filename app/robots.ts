import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/dashboard', '/api/', '/checkout', '/success', '/editor', '/preview'],
    },
    sitemap: 'https://eternalmemories.ro/sitemap.xml',
  }
}
