'use client'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import logoImage from '../lib/logo.png'

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-royal-beige">
      <div className="container grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 md:gap-16 items-center py-8 sm:py-10 sm:py-14 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center md:text-left order-2 md:order-1"
        >
          <span className="inline-block text-[11px] sm:text-xs font-semibold tracking-widest uppercase text-royal-green bg-emerald-100/70 px-2.5 sm:px-3 py-1 rounded-full mb-3 sm:mb-4 sm:mb-6">
            Premium Ayurvedic Wellness
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl md:text-5xl md:text-6xl tracking-tight leading-[1.15] md:leading-tight">
            Pure Organic Wellness, Delivered Naturally
          </h1>
          <p className="mt-2 sm:mt-3 sm:mt-4 text-sm sm:text-base md:text-lg text-royal-green/80 max-w-xl mx-auto md:mx-0">
            Premium moringa products sourced sustainably and crafted for daily vitality.
          </p>
          <div className="mt-5 sm:mt-6 sm:mt-8 flex flex-col sm:flex-row flex-wrap gap-2.5 sm:gap-3 sm:gap-4 justify-center md:justify-start">
            <motion.div whileHover={{ scale: 1.03 }} className="w-full sm:w-auto">
              <Link href="/shop" className="btn-primary px-4 sm:px-5 sm:px-6 py-2.5 sm:py-3 w-full sm:w-auto inline-flex justify-center min-h-[52px] text-sm sm:text-base" aria-label="Shop Royal Organics">
                Shop Now
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} className="w-full sm:w-auto">
              <Link href="/#benefits" className="btn-outline px-4 sm:px-5 sm:px-6 py-2.5 sm:py-3 w-full sm:w-auto inline-flex justify-center min-h-[52px] text-sm sm:text-base" aria-label="Explore benefits">
                Explore Benefits
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} className="w-full sm:w-auto">
              <Link href="/login" className="btn-outline px-4 sm:px-5 sm:px-6 py-2.5 sm:py-3 w-full sm:w-auto inline-flex justify-center min-h-[52px] text-sm sm:text-base" aria-label="Login to your account">
                Login
              </Link>
            </motion.div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative h-48 sm:h-56 sm:h-72 md:h-[28rem] lg:h-[30rem] lg:h-[34rem] rounded-xl shadow-soft mt-2 md:mt-0 order-1 md:order-2"
        >
          <Image
            src={logoImage}
            alt="Royal Organics — Premium Moringa Wellness logo and brand"
            fill
            className="object-contain rounded-xl bg-white p-0 scale-110 sm:scale-125"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </motion.div>
      </div>
    </section>
  )
}
