'use client'
import Link from 'next/link'
import Image, { type StaticImageData } from 'next/image'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import cap1 from '../lib/moringa capsules/1.jpeg'

export default function MidCTABanner() {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [reduce ? 0 : -10, reduce ? 0 : 10])
  return (
    <section className="bg-royal-beige">
      <div className="container py-6 sm:py-10 md:py-12">
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
              src={cap1}
              alt=""
              fill
              className="object-cover opacity-25"
              sizes="100vw"
              loading="lazy"
            />
          </motion.div>
          <div className="relative p-5 sm:p-8 md:p-10 md:p-12 text-center sm:text-left">
            <h3 className="font-heading text-xl sm:text-2xl md:text-3xl leading-tight">Feel the Royal Difference in Every Serving</h3>
            <p className="mt-2 text-royal-green/80 text-sm sm:text-base">Premium organic moringa, crafted for clean daily vitality.</p>
            <motion.div className="mt-5 sm:mt-6 w-full sm:w-auto" whileHover={{ scale: 1.03 }}>
              <Link href="/shop" className="btn-primary px-5 sm:px-6 py-3 w-full sm:w-auto inline-flex justify-center min-h-[52px]">Shop Royal Organics</Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
