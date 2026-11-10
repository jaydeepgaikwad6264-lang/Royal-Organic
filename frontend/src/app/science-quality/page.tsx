import Section from '../../components/Section'
import CertificateGallery from '../../components/CertificateGallery'
import { Metadata } from 'next'
import certAyush from '../../lib/certificates/Ayush License_New_front only (1)_page-0001.jpg'
import certUsfda from '../../lib/certificates/HERBALFARM LIFECARE_USFDA_page-0001.jpg'
import certIec from '../../lib/certificates/certificateOfIEC_page-0001.jpg'
import certLicense from '../../lib/certificates/license_page-0001.jpg'

const SITE_URL = 'https://theroyalorganics.com'

export const metadata: Metadata = {
  title: 'Science & Quality — Lab Testing & Certifications | Royal Organics',
  description:
    'Nutritional science behind moringa, quality assurance protocols, transparent third-party lab testing, and official Ayush, USFDA & manufacturing certifications from Royal Organics.',
  keywords: [
    'moringa nutritional science',
    'moringa lab testing',
    'ayush certified moringa',
    'usfda registered moringa',
    'moringa quality assurance',
    'certificates of analysis coa',
  ],
  alternates: {
    canonical: '/science-quality',
  },
  openGraph: {
    title: 'Science & Quality — Royal Organics Lab Testing',
    description:
      'Nutritional science, QA protocols, lab testing transparency, and official certifications for premium moringa.',
    url: `${SITE_URL}/science-quality`,
    type: 'article',
    locale: 'en_IN',
  },
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
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 items-start">
          <div>
            <h1 className="section-title">Nutritional Science</h1>

            <p className="section-subtitle">
              Moringa is rich in vitamins A, C, and E, plant-based protein,
              and antioxidants.
            </p>

            <div className="mt-5 sm:mt-6 prose prose-stone max-w-none">
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

          <div className="space-y-4 sm:space-y-5 lg:sticky lg:top-24">
            <h2 className="font-heading text-xl sm:text-2xl">Our Certifications</h2>
            <CertificateGallery certificates={certificates} />
            <p className="text-xs text-royal-green/70 sm:text-sm">
              Tap any certificate to open the zoomable viewer and read the fine print.
            </p>
          </div>
        </div>
      </Section>
    </main>
  )
}
