 'use client'
import { motion } from 'framer-motion'

type Badge = {
  label: string
  Icon: (props: { className?: string }) => JSX.Element
}

function IconLeaf({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 3c5 0 9 4 9 9 0 5-4 9-9 9H7c-2 0-3-2-3-3 0-6 4-12 8-15z" fill="currentColor" />
    </svg>
  )
}
function IconBeaker({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M7 3h10v2l-3 4v8a3 3 0 1 1-6 0V9L7 5V3z" fill="currentColor" />
    </svg>
  )
}
function IconShield({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 3l8 3v6c0 5-3.5 8.7-8 9-4.5-.3-8-4-8-9V6l8-3z" fill="currentColor" />
      <path d="M10.5 12.5l2 2 3.5-3.5" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  )
}
function IconBadge({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="currentColor" />
      <path d="M8 12l2 2 4-4" stroke="#fff" strokeWidth="2" fill="none" />
    </svg>
  )
}
function IconDNA({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M7 5c4 0 6 3 10 3M7 19c4 0 6-3 10-3M7 9c4 0 6 3 10 3M7 15c4 0 6-3 10-3" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  )
}

const badges: Badge[] = [
  { label: 'USDA Organic', Icon: IconBadge },
  { label: 'Non-GMO', Icon: IconDNA },
  { label: 'Vegan', Icon: IconLeaf },
  { label: 'Lab Tested', Icon: IconBeaker },
  { label: 'GMP Certified Facility', Icon: IconShield },
]

export default function TrustBadges() {
  return (
    <div className="mt-6 flex flex-wrap gap-3" aria-label="Trust badges">
      {badges.map((b, i) => (
        <motion.span
          key={b.label}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: i * 0.03 }}
          className="inline-flex items-center gap-2 border border-royal-gold rounded-full px-3 py-1 text-sm bg-royal-beige"
        >
          <b.Icon className="w-4 h-4 text-royal-gold" />
          <span className="text-royal-text">{b.label}</span>
        </motion.span>
      ))}
    </div>
  )
}
