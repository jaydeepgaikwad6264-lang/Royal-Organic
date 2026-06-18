'use client'
import Link from 'next/link'
import Image, { type StaticImageData } from 'next/image'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import moringaCapsulesFront from '../lib/front image.jpeg'

export default function MidCTABanner() {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : -10, reduce ? 0 : 10])
  return (
    <section className="bg-royal-beige">
      <div className="container py-12">
        <motion.div
          ref={ref}
          className="relative rounded-xl overflow-hidden border border-royal-sand"
          initial={{ opacity: 0, y: reduce ? 0 : 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-royal-tea/30 to-royal-gold/20" />
          <motion.div style={{ y }} className="absolute inset-0">
            <Image
              src={moringaCapsulesFront}
              alt=""
              fill
              className="object-cover opacity-25"
              sizes="100vw"
              loading="lazy"
            />
          </motion.div>
          <div className="relative p-8 md:p-12">
            <h3 className="font-heading text-2xl md:text-3xl">Feel the Royal Difference in Every Serving</h3>
            <p className="mt-2 text-royal-green/80">Premium organic moringa, crafted for clean daily vitality.</p>
            <motion.div className="mt-6" whileHover={{ scale: 1.03 }}>
              <Link href="/shop" className="btn-primary px-6 py-3">Shop Royal Organics</Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
