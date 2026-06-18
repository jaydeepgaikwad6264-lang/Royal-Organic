'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image, { type StaticImageData } from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'

type Props = {
  title: string
  description: string
  image: string | StaticImageData
  images?: (string | StaticImageData)[]
  align?: 'left' | 'right'
  viewHref?: string
  buyHref?: string
}

export default function ProductShowcase({ title, description, image, images = [], align = 'left', viewHref = '/shop', buyHref = '/shop' }: Props) {
  const [selectedImage, setSelectedImage] = useState(image)
  const reduce = useReducedMotion()
  const imgMotion = { initial: { opacity: 0, x: reduce ? 0 : (align === 'left' ? -20 : 20) }, whileInView: { opacity: 1, x: 0 } }
  const textMotion = { initial: { opacity: 0, x: reduce ? 0 : (align === 'left' ? 20 : -20) }, whileInView: { opacity: 1, x: 0 } }
  
  const allImages = images.length > 0 ? images : [image]
  
  return (
    <section className="bg-royal-beige">
      <div className="container py-12">
        <div className={`grid md:grid-cols-2 gap-10 items-start ${align === 'right' ? 'md:[&>*:first-child]:order-2' : ''}`}>
          <motion.div {...imgMotion} transition={{ duration: 0.6 }} viewport={{ once: true }} className="space-y-4">
            <div className="relative h-80 md:h-[500px] rounded-xl overflow-hidden border border-royal-sand bg-white shadow-soft">
              <Image
                src={selectedImage}
                alt={title}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
                loading="lazy"
              />
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(img)}
                    className={`relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === img ? 'border-royal-green' : 'border-transparent hover:border-royal-sand'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${title} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
          <motion.div {...textMotion} transition={{ duration: 0.6 }} viewport={{ once: true }} className="pt-4">
            <h3 className="font-heading text-2xl md:text-3xl">{title}</h3>
            <p className="mt-3 text-royal-green/80">{description}</p>
            <div className="mt-6 flex gap-4">
              <motion.div whileHover={{ scale: 1.03 }}>
                <Link href={viewHref} className="btn-outline px-6 py-3">View Product</Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }}>
                <Link href={buyHref} className="btn-primary px-6 py-3">Buy Now</Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
