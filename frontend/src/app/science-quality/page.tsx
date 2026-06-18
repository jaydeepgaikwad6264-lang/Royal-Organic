import Section from '../../components/Section'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Science & Quality',
  description: 'Nutritional science behind moringa, quality assurance, and lab testing transparency.',
}

export default function ScienceQualityPage() {
  return (
    <main>
      <Section>
        <h1 className="section-title">Nutritional Science</h1>
        <p className="section-subtitle">
          Moringa is rich in vitamins A, C, and E, plant-based protein, and antioxidants.
        </p>
        <div className="mt-6 prose prose-stone max-w-none">
          <p>
            Studies suggest moringa supports immune function, healthy skin, energy metabolism,
            and digestive balance. We prioritize bioavailable forms and clean processing.
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
            Third-party labs test each batch. Certificates of Analysis (COA) are available by request.
            Contact support for specific batch documentation.
          </p>
          <h2>FDA Disclaimer</h2>
          <p>
            Statements have not been evaluated by the Food and Drug Administration. Products are not intended to diagnose,
            treat, cure, or prevent any disease.
          </p>
        </div>
      </Section>
    </main>
  )
}
