import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-royal-sand bg-royal-beige">
      <div className="container py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="font-heading text-2xl">Royal Organics</div>
          <p className="mt-2 text-royal-green/70">
            Wellness, naturally elevated. Premium moringa for modern health.
          </p>
        </div>
        <div>
          <div className="font-heading text-lg">Explore</div>
          <ul className="mt-3 space-y-2">
            <li><Link href="/shop" className="hover:opacity-80">Shop</Link></li>
            <li><Link href="/about" className="hover:opacity-80">About</Link></li>
            <li><Link href="/science-quality" className="hover:opacity-80">Science & Quality</Link></li>
            <li><Link href="/faq" className="hover:opacity-80">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-heading text-lg">Legal</div>
          <ul className="mt-3 space-y-2">
            <li className="text-royal-green/70">FDA Disclaimer: Not evaluated to diagnose, treat, cure, or prevent disease.</li>
            <li className="text-royal-green/70">© {new Date().getFullYear()} Royal Organics</li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
