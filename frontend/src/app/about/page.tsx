import Section from '../../components/Section'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Royal Organics',
  description: 'Our story, mission, ethical sourcing, and commitment to quality.',
}

export default function AboutPage() {
  return (
    <main>
      <Section>
        <h1 className="section-title">Our Story & Mission</h1>
        <p className="section-subtitle">
          Wellness, naturally elevated. We make clean, science-backed nutrition simple and beautiful.
        </p>
        <div className="mt-6 prose prose-stone max-w-none">
          <p>
            Royal Organics was born from a simple belief: premium nutrition should be clean, transparent,
            and delightful to use. We partner with ethical growers and maintain rigorous lab testing standards
            to ensure purity in every batch.
          </p>
          <h2>Ethical Sourcing & Sustainability</h2>
          <p>
            Our moringa is sourced from sustainable farms that prioritize soil health and fair labor.
            We minimize packaging, use recyclable materials, and continuously improve our footprint.
          </p>
          <h2>Commitment to Quality</h2>
          <p>
            Each batch is third-party tested for microbiological safety, heavy metals, and potency.
            We publish testing standards and make COAs available upon request.
          </p>
        </div>
      </Section>
    </main>
  )
}
