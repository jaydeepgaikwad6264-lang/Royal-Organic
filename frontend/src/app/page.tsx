import Hero from '../components/Hero'
import Section from '../components/Section'
import Benefits from '../components/Benefits'
import TrustBadges from '../components/TrustBadges'
import TrustSummary from '../components/TrustSummary'
import Testimonials from '../components/Testimonials'
import NewsletterSignup from '../components/NewsletterSignup'
import WellnessGoalSelector from '../components/WellnessGoalSelector'
import Link from 'next/link'
import Image from 'next/image'
import TrustValueBanner from '../components/TrustValueBanner'
import ProductShowcase from '../components/ProductShowcase'
import MidCTABanner from '../components/MidCTABanner'
import EducationalImageBlock from '../components/EducationalImageBlock'
import cap1 from '../lib/moringa capsules/1.jpeg'
import cap2 from '../lib/moringa capsules/2.jpeg'
import cap3 from '../lib/moringa capsules/3.jpeg'
import cap4 from '../lib/moringa capsules/4.jpeg'
import cap5 from '../lib/moringa capsules/5.jpeg'
import cap6 from '../lib/moringa capsules/6.jpeg'
import moringaPowderFront from '../lib/Moringa powder front.png'
import moringaPowderBack from '../lib/morgina powder back.png'
import moringaPowderSide from '../lib/moringa powder side.png'
import certAyush from '../lib/certificates/Ayush License_New_front only (1)_page-0001.jpg'
import certUsfda from '../lib/certificates/HERBALFARM LIFECARE_USFDA_page-0001.jpg'
import certIec from '../lib/certificates/certificateOfIEC_page-0001.jpg'
import certLicense from '../lib/certificates/license_page-0001.jpg'
import type { Metadata } from 'next'

const SITE_URL = 'https://theroyalorganics.com'

export const metadata: Metadata = {
  title: 'Royal Organics — Premium Moringa Capsules & Powder | 100% Organic India',
  description:
    'Buy 100% organic Moringa capsules and powder online in India. Premium grade, lab-tested, Ayush certified. Immunity booster, natural energy. Free delivery across India.',
  keywords: [
    'buy moringa capsules india',
    'organic moringa powder online',
    'moringa products india',
    'immunity booster ayurvedic',
    'royal organics moringa',
    'best moringa brand india',
    'moringa for immunity energy',
    'ayush certified supplements',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Royal Organics — Premium Moringa Capsules & Powder | 100% Organic India',
    description:
      '100% organic Moringa capsules and powder. Lab-tested, Ayush certified. Free delivery across India. Boost immunity and energy naturally.',
    url: SITE_URL,
    type: 'website',
    locale: 'en_IN',
    images: [{ url: cap1.src, width: 1200, height: 630, alt: 'Royal Organics Premium Moringa Products' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Royal Organics — Premium Moringa Capsules & Powder',
    description:
      '100% organic Moringa capsules and powder. Lab-tested, Ayush certified. Free delivery across India.',
    images: [cap1.src],
  },
}

export default function HomePage() {
  return (
    <main>
      <Hero />
      <TrustValueBanner />
      <Section>
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-10 items-center">
          <div>
            <h2 className="section-title">Why Royal Organics?</h2>
            <p className="section-subtitle">
              Premium-grade moringa with clean sourcing and transparent quality standards.
            </p>
            <ul className="mt-5 sm:mt-6 space-y-2 sm:space-y-3 text-royal-green/80 text-sm sm:text-base">
              <li>• Organic, non-GMO, vegan</li>
              <li>• Third-party lab tested for purity and potency</li>
              <li>• Fine-milled powder for smooth mixing</li>
              <li>• Convenient capsules for taste-free daily wellness</li>
            </ul>
            <TrustBadges />
            <WellnessGoalSelector />
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link className="btn-primary px-5 sm:px-6 py-3 w-full sm:w-auto justify-center" href="/shop">Browse Products</Link>
            </div>
          </div>
          <div className="rounded-xl border border-royal-sand bg-white p-4 sm:p-6">
            <h3 className="font-heading text-xl sm:text-2xl">Flexible Ordering</h3>
            <ul className="mt-3 sm:mt-4 space-y-2 text-royal-green/80 text-sm sm:text-base">
              <li>• Order any quantity</li>
              <li>• Transparent per-unit pricing</li>
              <li>• Lab-tested, GMP-compliant facility</li>
            </ul>
            <div className="mt-5 sm:mt-6">
              <Link href="/shop" className="btn-outline px-5 sm:px-6 py-3 w-full sm:w-auto justify-center">
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </Section>
      <ProductShowcase
        title="Moringa Capsules"
        description="Convenient capsules for taste-free daily wellness."
        image={cap1}
        images={[cap1, cap2, cap3, cap4, cap5, cap6]}
        align="left"
        viewHref="/products/moringa-capsules"
        buyHref="/shop"
      />
      <ProductShowcase
        title="Moringa Powder"
        description="Fine-milled for smooth mixing in smoothies and recipes."
        image={moringaPowderFront}
        images={[moringaPowderFront, moringaPowderBack, moringaPowderSide]}
        align="right"
        viewHref="/products/moringa-powder"
        buyHref="/shop"
      />
      <MidCTABanner />
      <Benefits />
      <EducationalImageBlock />
      <Section>
        <TrustSummary />
      </Section>
      <section className="py-8 sm:py-10 md:py-14 bg-gradient-to-b from-transparent via-emerald-50/40 to-transparent" aria-label="Certificates and Compliance">
        <div className="container text-center mb-5 sm:mb-8 md:mb-10">
          <h2 className="section-title">Our Certifications</h2>
          <p className="section-subtitle max-w-xl mx-auto text-sm sm:text-base">
            Royal Organics products are backed by verified licenses and certifications for complete peace of mind.
          </p>
        </div>
        <div className="relative overflow-hidden" style={{ maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)' }}>
          <div className="marquee-track flex gap-3 sm:gap-4 sm:gap-6 md:gap-8 w-max">
            {[...Array(2)].flatMap((_, dup) =>
              [
                { src: certAyush, alt: 'Ayush License Certificate' },
                { src: certUsfda, alt: 'USFDA Registration' },
                { src: certIec, alt: 'IEC Certificate' },
                { src: certLicense, alt: 'Manufacturing License' },
              ].map((cert, idx) => (
                <div
                  key={`${dup}-${idx}`}
                  className="flex-shrink-0 w-60 sm:w-72 sm:w-80 md:w-96 lg:w-[28rem] aspect-[4/3] rounded-2xl border border-emerald-900/10 bg-gradient-to-br from-stone-50 via-white to-amber-50/70 shadow-[0_10px_30px_-12px_rgba(6,78,59,0.25)] overflow-hidden p-2.5 sm:p-3 sm:p-4 md:p-5 relative"
                >
                  <div className="absolute inset-2 sm:inset-3 rounded-xl ring-1 ring-inset ring-emerald-900/10 pointer-events-none" />
                  <div className="relative w-full h-full rounded-lg overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.04)] bg-white">
                    <Image
                      src={cert.src}
                      alt={cert.alt}
                      fill
                      className="object-contain p-2 sm:p-3"
                      sizes="(max-width: 640px) 15rem, (max-width: 768px) 18rem, (max-width: 1024px) 24rem, 28rem"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
      <Testimonials />
      <Section>
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-10 items-center">
          <div>
            <h2 className="section-title">Join the Royal Newsletter</h2>
            <p className="section-subtitle text-sm sm:text-base">Weekly tips, science insights, and subscriber-only perks</p>
            <NewsletterSignup />
          </div>
          <div className="rounded-xl border border-royal-sand bg-white p-4 sm:p-6">
            <h3 className="font-heading text-xl sm:text-2xl">Science-Backed Standards</h3>
            <p className="text-royal-green/80 mt-2 text-sm sm:text-base">
              Every batch is tested for heavy metals, microbiological safety, and potency. COA available by request.
            </p>
            <div className="mt-5 sm:mt-6">
              <Link href="/science-quality" className="btn-primary px-5 sm:px-6 py-3 w-full sm:w-auto justify-center">Learn More</Link>
            </div>
          </div>
        </div>
      </Section>
    </main>
  )
}
