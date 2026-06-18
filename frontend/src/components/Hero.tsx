'use client'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import logoImage from '../lib/logo.jpeg'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-royal-beige">
      <div className="container grid md:grid-cols-2 gap-10 md:gap-16 items-center py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-heading text-4xl md:text-6xl tracking-tight">
            Pure Organic Wellness, Delivered Naturally
          </h1>
          <p className="mt-4 text-lg text-royal-green/80">
            Premium moringa products sourced sustainably and crafted for daily vitality.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <motion.div whileHover={{ scale: 1.03 }}>
              <Link href="/shop" className="btn-primary px-6 py-3" aria-label="Shop Royal Organics">
                Shop Now
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }}>
              <Link href="/#benefits" className="btn-outline px-6 py-3" aria-label="Explore benefits">
                Explore Benefits
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }}>
              <Link href="/login" className="btn-outline px-6 py-3" aria-label="Login to your account">
                Login
              </Link>
            </motion.div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative h-64 md:h-[28rem] rounded-xl shadow-soft"
        >
          <Image
            src={logoImage}
            alt="Royal Organics logo"
            fill
            className="object-contain rounded-xl bg-white p-6"
            priority
          />
        </motion.div>
      </div>
    </section>
  )
}
