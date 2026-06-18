'use client'
import { motion } from 'framer-motion'
import TrustBadges from './TrustBadges'

export default function TrustSummary() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="rounded-xl border border-royal-sand bg-white p-6"
      aria-label="Trust & Compliance Summary"
    >
      <div className="font-heading text-2xl">Trust & Compliance</div>
      <TrustBadges />
      <p className="mt-4 text-sm text-royal-muted">
        These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose,
        treat, cure, or prevent any disease. COA/lab reports available upon request. Made in FDA-registered facility.
      </p>
    </motion.section>
  )
}
