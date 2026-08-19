import Section from '../../components/Section'
import Image from 'next/image'
import { Metadata } from 'next'
import certAyush from '../../lib/certificates/Ayush License_New_front only (1)_page-0001.jpg'
import certUsfda from '../../lib/certificates/HERBALFARM LIFECARE_USFDA_page-0001.jpg'
import certIec from '../../lib/certificates/certificateOfIEC_page-0001.jpg'
import certLicense from '../../lib/certificates/license_page-0001.jpg'

export const metadata: Metadata = {
  title: 'Science & Quality',
  description:
    'Nutritional science behind moringa, quality assurance, lab testing transparency, and official certifications.',
}

const certificates = [
  { src: certAyush, alt: 'Ayush License Certificate' },
  { src: certUsfda, alt: 'USFDA Registration Certificate' },
  { src: certIec, alt: 'IEC Certificate' },
  { src: certLicense, alt: 'Manufacturing License Certificate' },
]

export default function ScienceQualityPage() {
  return (
    <main>
      <Section>
        <div className="grid lg:grid-cols-2 gap-12 items-start">
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

          <div className="space-y-5 lg:sticky lg:top-24">
            <h2 className="font-heading text-2xl">Our Certifications</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {certificates.map((cert) => (
                <div
                  key={cert.alt}
                  className="aspect-[4/3] rounded-2xl border border-emerald-900/10 bg-gradient-to-br from-stone-50 via-white to-amber-50/70 shadow-[0_10px_30px_-12px_rgba(6,78,59,0.25)] p-3 relative overflow-hidden"
                >
                  <div className="absolute inset-2 rounded-xl ring-1 ring-inset ring-emerald-900/10 pointer-events-none" />
                  <div className="relative w-full h-full rounded-lg overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.04)] bg-white">
                    <Image
                      src={cert.src}
                      alt={cert.alt}
                      fill
                      className="object-contain p-2"
                      sizes="(max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>
    </main>
  )
}