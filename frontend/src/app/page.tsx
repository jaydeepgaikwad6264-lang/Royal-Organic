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

export default function HomePage() {
  return (
    <main>
      <Hero />
      <TrustValueBanner />
      <Section>
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="section-title">Why Royal Organics?</h2>
            <p className="section-subtitle">
              Premium-grade moringa with clean sourcing and transparent quality standards.
            </p>
            <ul className="mt-6 space-y-3 text-royal-green/80">
              <li>• Organic, non-GMO, vegan</li>
              <li>• Third-party lab tested for purity and potency</li>
              <li>• Fine-milled powder for smooth mixing</li>
              <li>• Convenient capsules for taste-free daily wellness</li>
            </ul>
            <TrustBadges />
            <WellnessGoalSelector />
            <div className="mt-8">
              <Link className="btn-primary px-6 py-3" href="/shop">Browse Products</Link>
            </div>
          </div>
          <div className="rounded-xl border border-royal-sand bg-white p-6">
            <h3 className="font-heading text-2xl">Flexible Ordering</h3>
            <ul className="mt-4 space-y-2 text-royal-green/80">
              <li>• Order any quantity</li>
              <li>• Transparent per-unit pricing</li>
              <li>• Lab-tested, GMP-compliant facility</li>
            </ul>
            <div className="mt-6">
              <Link href="/shop" className="btn-outline px-6 py-3">
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
      <section className="py-10 md:py-14 bg-gradient-to-b from-transparent via-emerald-50/40 to-transparent" aria-label="Certificates and Compliance">
        <div className="container text-center mb-6 md:mb-10">
          <h2 className="section-title">Our Certifications</h2>
          <p className="section-subtitle max-w-xl mx-auto">
            Royal Organics products are backed by verified licenses and certifications for complete peace of mind.
          </p>
        </div>
        <div className="relative overflow-hidden" style={{ maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)' }}>
          <div className="marquee-track flex gap-4 sm:gap-6 md:gap-8 w-max">
            {[...Array(2)].flatMap((_, dup) =>
              [
                { src: certAyush, alt: 'Ayush License Certificate' },
                { src: certUsfda, alt: 'USFDA Registration' },
                { src: certIec, alt: 'IEC Certificate' },
                { src: certLicense, alt: 'Manufacturing License' },
              ].map((cert, idx) => (
                <div
                  key={`${dup}-${idx}`}
                  className="flex-shrink-0 w-72 sm:w-80 md:w-96 lg:w-[28rem] aspect-[4/3] rounded-2xl border border-emerald-900/10 bg-gradient-to-br from-stone-50 via-white to-amber-50/70 shadow-[0_10px_30px_-12px_rgba(6,78,59,0.25)] overflow-hidden p-3 sm:p-4 md:p-5 relative"
                >
                  <div className="absolute inset-2 sm:inset-3 rounded-xl ring-1 ring-inset ring-emerald-900/10 pointer-events-none" />
                  <div className="relative w-full h-full rounded-lg overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.04)] bg-white">
                    <Image
                      src={cert.src}
                      alt={cert.alt}
                      fill
                      className="object-contain p-2 sm:p-3"
                      sizes="(max-width: 640px) 18rem, (max-width: 768px) 20rem, (max-width: 1024px) 24rem, 28rem"
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
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="section-title">Join the Royal Newsletter</h2>
            <p className="section-subtitle">Weekly tips, science insights, and subscriber-only perks</p>
            <NewsletterSignup />
          </div>
          <div className="rounded-xl border border-royal-sand bg-white p-6">
            <h3 className="font-heading text-2xl">Science-Backed Standards</h3>
            <p className="text-royal-green/80 mt-2">
              Every batch is tested for heavy metals, microbiological safety, and potency. COA available by request.
            </p>
            <div className="mt-6">
              <Link href="/science-quality" className="btn-primary px-6 py-3">Learn More</Link>
            </div>
          </div>
        </div>
      </Section>
    </main>
  )
}
