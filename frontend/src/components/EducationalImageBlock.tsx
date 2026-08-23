'use client'
import Image, { type StaticImageData } from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import moringaPowderFront from '../lib/Moringa powder front.png'
import cap2 from '../lib/moringa capsules/2.jpeg'

const bullets = [
  'Rich in antioxidants',
  'Supports immunity',
  'Naturally energizing',
]

export default function EducationalImageBlock() {
  const reduce = useReducedMotion()
  return (
    <section className="bg-royal-beige">
      <div className="container py-6 sm:py-8 md:py-10 md:py-12">
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-10 items-center">
          <motion.div
            initial={{ opacity: 0, y: reduce ? 0 : 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 gap-2.5 sm:gap-4 order-2 md:order-none"
          >
            <div className="relative h-36 sm:h-44 md:h-56 rounded-xl overflow-hidden border border-royal-sand bg-white shadow-soft">
              <Image
                src={moringaPowderFront}
                alt="Moringa leaf close-up"
                fill
                className="object-contain p-2 sm:p-3"
                sizes="(max-width: 768px) 50vw, 25vw"
                loading="lazy"
              />
            </div>
            <div className="relative h-36 sm:h-44 md:h-56 rounded-xl overflow-hidden border border-royal-sand bg-white shadow-soft">
              <Image
                src={cap2}
                alt="Capsule macro shot"
                fill
                className="object-contain p-2 sm:p-3"
                sizes="(max-width: 768px) 50vw, 25vw"
                loading="lazy"
              />
            </div>
          </motion.div>
          <div className="order-1 md:order-none text-center md:text-left">
            <h3 className="font-heading text-2xl sm:text-3xl md:text-3xl leading-tight">Why Moringa Works</h3>
            <ul className="mt-3 sm:mt-4 space-y-2 text-sm sm:text-base">
              {bullets.map((b, i) => (
                <motion.li
                  key={b}
                  initial={{ opacity: 0, x: reduce ? 0 : 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="text-royal-green/80"
                >
                  • {b}
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
