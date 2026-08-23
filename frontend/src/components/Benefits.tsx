'use client'
import { motion } from 'framer-motion'

const items = [
  { title: 'Immunity', desc: 'Rich micronutrients support immune resilience.' },
  { title: 'Energy', desc: 'Natural phytonutrients for steady daily energy.' },
  { title: 'Digestion', desc: 'Fiber supports healthy gut and digestion.' },
  { title: 'Skin', desc: 'Antioxidants promote luminous, healthy skin.' },
]

export default function Benefits() {
  return (
    <section className="section" id="benefits">
      <div className="container">
        <h2 className="section-title text-2xl sm:text-3xl md:text-4xl">Benefits</h2>
        <p className="section-subtitle text-base sm:text-lg">Science-backed nutrients for whole-body wellness</p>
        <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
          {items.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="rounded-lg border border-royal-sand p-4 sm:p-5 bg-white hover:shadow-soft"
            >
              <div className="font-heading text-lg sm:text-xl">{b.title}</div>
              <p className="text-royal-green/70 mt-2 text-sm sm:text-base leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
