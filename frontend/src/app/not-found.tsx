import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen bg-royal-beige">
      <div className="container py-20 text-center">
        <div className="text-9xl mb-6">🌿</div>
        <h1 className="font-heading text-4xl text-royal-text mb-4">Page Not Found</h1>
        <p className="text-royal-green/80 mb-8 text-lg">
          Sorry, the page you&apos;re looking for doesn&apos;t exist.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/shop" className="btn-primary px-8 py-4">
            Go to Shop
          </Link>
          <Link href="/" className="btn-outline px-8 py-4">
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}
