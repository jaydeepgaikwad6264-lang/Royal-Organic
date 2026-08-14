import Section from '../../components/Section'
import Image from 'next/image'
import { Metadata } from 'next'
import certificateImg from '../../lib/certificate.jpeg'

export const metadata: Metadata = {
  title: 'Science & Quality',
  description:
    'Nutritional science behind moringa, quality assurance, and lab testing transparency.',
}

export default function ScienceQualityPage() {
  return (
    <main>
      <Section>
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Content */}
          <div>
            <h1 className="section-title">Nutritional Science</h1>

            <p className="section-subtitle">
              Moringa is rich in vitamins A, C, and E, plant-based protein,
              and antioxidants.
            </p>

            <div className="mt-6 prose prose-stone max-w-none">
              <p>
                Studies suggest moringa supports immune function, healthy skin,
                energy metabolism, and digestive balance. We prioritize
                bioavailable forms and clean processing.
              </p>

              <h2>Quality Assurance Process</h2>

              <p>
                From sourcing to packaging, we follow strict QA protocols:
              </p>

              <ul>
                <li>Supplier verification and farm audits</li>
                <li>Microbiological safety checks</li>
                <li>Heavy metals testing to USP limits</li>
                <li>Potency verification for key phytonutrients</li>
              </ul>

              <h2>Lab Testing Transparency</h2>

              <p>
                Third-party labs test each batch. Certificates of Analysis
                (COA) are available by request. Contact support for specific
                batch documentation.
              </p>

              <h2>FDA Disclaimer</h2>

              <p>
                Statements have not been evaluated by the Food and Drug
                Administration. Products are not intended to diagnose, treat,
                cure, or prevent any disease.
              </p>
            </div>
          </div>

          {/* Right Certificate Image */}
          <div className="flex justify-center lg:sticky lg:top-24">
            <div className="rounded-xl overflow-hidden border border-royal-sand bg-white shadow-soft p-4">
              <Image
                src={certificateImg}
                alt="Royal Organics Certificate"
                className="w-full h-auto rounded-lg"
                priority
              />
            </div>
          </div>
        </div>
      </Section>
    </main>
  )
}