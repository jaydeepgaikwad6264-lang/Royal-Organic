import Section from '../../components/Section'
import { Metadata } from 'next'

const SITE_URL = 'https://royalorganics.in'

const faqs = [
  { q: 'How do I use moringa powder?', a: 'Mix 1 tsp of Royal Organics Moringa Powder into smoothies, water, juices, or food daily.' },
  { q: 'Are your products vegan and non-GMO?', a: 'Yes. All Royal Organics products are 100% vegan, non-GMO, and cruelty-free.' },
  { q: 'How do subscriptions work?', a: 'Monthly delivery with savings. You can pause or cancel anytime from your account.' },
  { q: 'What is your shipping policy?', a: 'Orders ship within 1-2 business days. Free delivery across India on all orders.' },
  { q: 'Do you offer returns?', a: 'Royal Organics offers a 30-day satisfaction guarantee. Contact support to start a return.' },
  { q: 'Are your products lab tested?', a: 'Yes — every batch is third-party lab tested for microbiological safety, heavy metals, and potency.' },
  { q: 'How should I store moringa?', a: 'Store in a cool, dry place away from direct sunlight. Seal tightly after each use.' },
  { q: 'Can pregnant or nursing women use moringa?', a: 'Please consult your doctor before use during pregnancy, nursing, or if you have a medical condition.' },
]

export const metadata: Metadata = {
  title: 'FAQ — Usage, Shipping, Returns & Safety | Royal Organics',
  description:
    'Frequently asked questions about Royal Organics moringa products — usage, dosage, safety, shipping policy, free delivery India, subscriptions, and 30-day returns.',
  keywords: [
    'moringa faq',
    'how to use moringa powder',
    'royal organics shipping policy',
    'moringa safety dosage',
    'subscription management',
    'moringa product returns',
  ],
  alternates: {
    canonical: '/faq',
  },
  openGraph: {
    title: 'FAQ — Royal Organics Moringa Usage & Shipping',
    description:
      'Answers to common questions about usage, dosage, safety, shipping and returns.',
    url: `${SITE_URL}/faq`,
    type: 'website',
    locale: 'en_IN',
  },
}

export default function FAQPage() {
  return (
    <main>
      <Section>
        <h1 className="section-title">Frequently Asked Questions</h1>
        <p className="section-subtitle">Answers to common topics about usage, safety, and subscriptions</p>
        <div className="mt-5 sm:mt-6 space-y-1">
          {faqs.map((f) => (
            <details key={f.q} className="group border-b border-royal-sand py-3 sm:py-4">
              <summary className="cursor-pointer list-none flex items-start sm:items-center justify-between gap-3">
                <span className="font-heading text-sm sm:text-base md:text-lg leading-snug">{f.q}</span>
                <span className="ml-4 w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 rounded-full border border-royal-sand grid place-items-center mt-0.5 sm:mt-0">
                  <span className="block w-3 h-0.5 sm:w-3 bg-royal-green group-open:rotate-90 transition-transform"></span>
                </span>
              </summary>
              <p className="mt-2 sm:mt-3 text-royal-green/80 text-sm sm:text-base leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </Section>
    </main>
  )
}
