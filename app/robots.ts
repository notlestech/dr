import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/forms/', '/upgrade', '/billing', '/settings', '/api/'],
      },
    ],
    sitemap: 'https://drawvault.site/sitemap.xml',
  }
}
