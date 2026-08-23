import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-royal-sand bg-royal-beige">
      <div className="container py-8 sm:py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
        <div className="sm:col-span-2 md:col-span-1">
          <div className="font-heading text-xl sm:text-2xl">Royal Organics</div>
          <p className="mt-2 text-royal-green/70 text-sm sm:text-base leading-relaxed">
            Wellness, naturally elevated. Premium moringa for modern health.
          </p>
        </div>
        <div>
          <div className="font-heading text-base sm:text-lg">Explore</div>
          <ul className="mt-2 sm:mt-3 space-y-1.5 sm:space-y-2 text-sm sm:text-base">
            <li><Link href="/shop" className="hover:opacity-80">Shop</Link></li>
            <li><Link href="/about" className="hover:opacity-80">About</Link></li>
            <li><Link href="/science-quality" className="hover:opacity-80">Science & Quality</Link></li>
            <li><Link href="/faq" className="hover:opacity-80">FAQ</Link></li>
            <li><Link href="/feedback" className="hover:opacity-80">Feedback</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-heading text-base sm:text-lg">Legal</div>
          <ul className="mt-2 sm:mt-3 space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
            <li className="text-royal-green/70 leading-relaxed">FDA Disclaimer: Not evaluated to diagnose, treat, cure, or prevent disease.</li>
            <li className="text-royal-green/70">© {new Date().getFullYear()} Royal Organics</li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
