'use client'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

export default function Section({
  children,
  className = '',
  id,
}: {
  children: ReactNode
  className?: string
  id?: string
}) {
  return (
    <section id={id} className={`section ${className}`}>
      <motion.div
        className="container"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
      >
        {children}
      </motion.div>
    </section>
  )
}
