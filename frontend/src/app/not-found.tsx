import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '404 — Page Not Found',
  description: 'The page you are looking for could not be found at Royal Organics. Browse our shop or return to the home page to continue exploring organic Moringa wellness.',
  robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
  alternates: { canonical: '/404' },
  openGraph: {
    title: 'Page Not Found | Royal Organics',
    description: 'The page you requested could not be found. Explore our organic Moringa products instead.',
    url: 'https://theroyalorganics.com/404',
    type: 'website',
    locale: 'en_IN',
  },
  twitter: { card: 'summary' },
}

export default function NotFound() {
  return (
    <main className="min-h-screen bg-royal-beige">
      <div className="container py-16 sm:py-20 md:py-24 px-4 text-center">
        <div className="text-6xl sm:text-8xl md:text-9xl mb-5 sm:mb-6">🌿</div>
        <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl text-royal-text mb-3 sm:mb-4 px-1">
          Page Not Found
        </h1>
        <p className="text-royal-green/80 mb-7 sm:mb-8 text-base sm:text-lg max-w-xl mx-auto px-2">
          Sorry, the page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4">
          <Link href="/shop" className="btn-primary px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto min-h-[3.25rem] inline-flex items-center justify-center">
            Go to Shop
          </Link>
          <Link href="/" className="btn-outline px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto min-h-[3.25rem] inline-flex items-center justify-center">
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}
