'use client'
import { motion, useReducedMotion } from 'framer-motion'

const items = [
  { label: '100% Organic', icon: 'leaf' },
  { label: 'Lab Tested', icon: 'beaker' },
  { label: 'US Quality Standards', icon: 'flag' },
  { label: 'Fast & Secure Shipping', icon: 'truck' },
]

function Icon({ name, className }: { name: string; className?: string }) {
  if (name === 'leaf')
    return (
      <svg viewBox="0 0 24 24" className={className}><path d="M12 3c5 0 9 4 9 9 0 5-4 9-9 9H7c-2 0-3-2-3-3 0-6 4-12 8-15z" fill="currentColor"/></svg>
    )
  if (name === 'beaker')
    return (
      <svg viewBox="0 0 24 24" className={className}><path d="M7 3h10v2l-3 4v8a3 3 0 1 1-6 0V9L7 5V3z" fill="currentColor"/></svg>
    )
  if (name === 'flag')
    return (
      <svg viewBox="0 0 24 24" className={className}><path d="M4 3h2v18H4V3zm2 2h10l-2 3 2 3H6V5z" fill="currentColor"/></svg>
    )
  return (
    <svg viewBox="0 0 24 24" className={className}><path d="M3 6h13l5 5v8H3V6zm8 4h4l4 4" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
  )
}

export default function TrustValueBanner() {
  const reduce = useReducedMotion()
  return (
    <section className="bg-royal-beige">
      <div className="container py-4 sm:py-6 px-0 sm:px-0">
        <div className="rounded-xl border border-royal-sand bg-white p-3 sm:p-4 md:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            {items.map((it, i) => (
              <motion.div
                key={it.label}
                initial={{ opacity: 0, y: reduce ? 0 : 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="flex items-center gap-2 sm:gap-3 rounded-lg p-2 sm:p-3 hover:shadow-soft"
              >
                <Icon name={it.icon} className="w-5 h-5 sm:w-6 sm:h-6 text-royal-gold flex-shrink-0" />
                <div className="text-royal-text text-xs sm:text-sm md:text-base leading-snug">{it.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
