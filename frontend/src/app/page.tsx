import Hero from '../components/Hero'
import Section from '../components/Section'
import Benefits from '../components/Benefits'
import TrustBadges from '../components/TrustBadges'
import TrustSummary from '../components/TrustSummary'
import Testimonials from '../components/Testimonials'
import NewsletterSignup from '../components/NewsletterSignup'
import WellnessGoalSelector from '../components/WellnessGoalSelector'
import Link from 'next/link'
import TrustValueBanner from '../components/TrustValueBanner'
import ProductShowcase from '../components/ProductShowcase'
import MidCTABanner from '../components/MidCTABanner'
import EducationalImageBlock from '../components/EducationalImageBlock'
import moringaCapsulesFront from '../lib/front image.jpeg'
import moringaCapsulesBack from '../lib/back image.jpeg'
import moringaCapsulesSide from '../lib/side image.jpeg'
import moringaPowderFront from '../lib/Moringa powder front.png'
import moringaPowderBack from '../lib/morgina powder back.png'
import moringaPowderSide from '../lib/moringa powder side.png'

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
        title="Moringa Powder"
        description="Fine-milled for smooth mixing in smoothies and recipes."
        image={moringaPowderFront}
        images={[moringaPowderFront, moringaPowderBack, moringaPowderSide]}
        align="left"
        viewHref="/products/moringa-powder"
        buyHref="/shop"
      />
      <ProductShowcase
        title="Moringa Capsules"
        description="Convenient capsules for taste-free daily wellness."
        image={moringaCapsulesFront}
        images={[moringaCapsulesFront, moringaCapsulesBack, moringaCapsulesSide]}
        align="right"
        viewHref="/products/moringa-capsules"
        buyHref="/shop"
      />
      <MidCTABanner />
      <Benefits />
      <EducationalImageBlock />
      <Section>
        <TrustSummary />
      </Section>
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
