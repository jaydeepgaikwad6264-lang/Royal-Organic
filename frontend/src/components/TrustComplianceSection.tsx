'use client'
import { motion } from 'framer-motion'
import TrustBadges from './TrustBadges'

export default function TrustComplianceSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mt-6 rounded-xl border border-royal-sand bg-royal-beige p-5"
      aria-label="Trust & Compliance"
    >
      <div className="font-heading text-xl">Trust & Compliance</div>
      <TrustBadges />
      <div className="mt-4 grid gap-3 text-sm">
        <div className="rounded-lg bg-white border border-royal-sand p-4">
          <div className="font-heading text-base">FDA Disclaimer</div>
          <p className="mt-2 text-royal-muted">
            These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose,
            treat, cure, or prevent any disease.
          </p>
        </div>
        <div className="rounded-lg bg-white border border-royal-sand p-4">
          <div className="font-heading text-base">COA / Lab Test Reports</div>
          <p className="mt-2 text-royal-muted">Certificate of Analysis (COA) and lab results available upon request.</p>
        </div>
        <div className="rounded-lg bg-white border border-royal-sand p-4">
          <div className="font-heading text-base">Facility</div>
          <p className="mt-2 text-royal-muted">Made in FDA-registered facility. GMP-certified manufacturing.</p>
        </div>
      </div>
    </motion.section>
  )
}
