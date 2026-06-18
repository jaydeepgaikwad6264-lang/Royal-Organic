import Section from '../../components/Section'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Usage, dosage, safety, shipping & returns, subscription management.',
}

export default function FAQPage() {
  const faqs = [
    { q: 'How do I use moringa powder?', a: 'Mix 1 tsp into smoothies, water, or food daily.' },
    { q: 'Are your products vegan and non-GMO?', a: 'Yes. All products are vegan and non-GMO.' },
    { q: 'How do subscriptions work?', a: 'Monthly delivery with savings. You can pause or cancel anytime.' },
    { q: 'What is your shipping policy?', a: 'Orders ship within 2 business days. Free US shipping over $50.' },
    { q: 'Do you offer returns?', a: '30-day satisfaction guarantee. Contact support to start a return.' },
  ]

  return (
    <main>
      <Section>
        <h1 className="section-title">Frequently Asked Questions</h1>
        <p className="section-subtitle">Answers to common topics about usage, safety, and subscriptions</p>
        <div className="mt-6">
          {faqs.map((f) => (
            <details key={f.q} className="group border-b border-royal-sand py-4">
              <summary className="cursor-pointer list-none flex items-center justify-between">
                <span className="font-heading">{f.q}</span>
                <span className="ml-4 w-5 h-5 rounded-full border border-royal-sand grid place-items-center">
                  <span className="block w-3 h-0.5 bg-royal-green group-open:rotate-90 transition-transform"></span>
                </span>
              </summary>
              <p className="mt-3 text-royal-green/80">{f.a}</p>
            </details>
          ))}
        </div>
      </Section>
    </main>
  )
}
