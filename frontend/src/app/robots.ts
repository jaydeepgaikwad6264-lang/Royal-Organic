import type { MetadataRoute } from 'next'

const SITE_URL = 'https://theroyalorganics.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/shop', '/products/', '/about', '/science-quality', '/faq', '/feedback', '/contact'],
        disallow: ['/cart', '/address', '/payment', '/my-orders', '/thank-you', '/auth/', '/api/'],
      },
      {
        userAgent: 'Googlebot',
        allow: ['/', '/shop', '/products/', '/about', '/science-quality', '/faq', '/feedback', '/contact'],
        disallow: ['/cart', '/address', '/payment', '/my-orders', '/thank-you', '/auth/'],
      },
      {
        userAgent: 'Bingbot',
        allow: ['/', '/shop', '/products/', '/about', '/science-quality', '/faq', '/feedback', '/contact'],
        disallow: ['/cart', '/address', '/payment', '/my-orders', '/thank-you', '/auth/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
