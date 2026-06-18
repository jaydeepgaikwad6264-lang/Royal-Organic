'use client'
import { motion } from 'framer-motion'

const testimonials = [
  {
    name: 'Alex M.',
    quote:
      'I feel more balanced and energized. The powder blends so smoothly in my morning smoothie.',
  },
  {
    name: 'Sofia R.',
    quote:
      'Clean ingredients and lab testing give me total confidence. My skin looks amazing.',
  },
  {
    name: 'James K.',
    quote:
      'Capsules are perfect for busy days—steady energy without caffeine. Big fan.',
  },
]

export default function Testimonials() {
  return (
    <section className="section bg-royal-beige/50">
      <div className="container">
        <h2 className="section-title">Loved by Customers</h2>
        <p className="section-subtitle">Real stories from the Royal community</p>
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.blockquote
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
              className="rounded-xl bg-white border border-royal-sand p-6 shadow-soft"
            >
              <p className="text-lg">“{t.quote}”</p>
              <footer className="mt-4 text-royal-green/70">— {t.name}</footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}
