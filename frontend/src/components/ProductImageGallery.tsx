'use client'
import Image, { type StaticImageData } from 'next/image'
import { useState } from 'react'

type Props = {
  productName: string
  images: Array<string | StaticImageData>
}

export default function ProductImageGallery({ productName, images }: Props) {
  const [selectedImage, setSelectedImage] = useState(images[0])

  return (
    <div>
      <div className="relative h-64 sm:h-72 md:h-80 lg:h-[32rem] rounded-xl overflow-hidden border border-royal-sand bg-white shadow-soft">
        <Image
          src={selectedImage}
          alt={productName}
          fill
          className="object-contain p-3 sm:p-4"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="mt-3 sm:mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
          {images.map((image, index) => (
            <button
              key={`${productName}-${index}`}
              type="button"
              onClick={() => setSelectedImage(image)}
              className={`relative h-16 sm:h-20 md:h-24 rounded-lg overflow-hidden border bg-white ${
                selectedImage === image ? 'border-royal-green ring-2 ring-royal-green/30' : 'border-royal-sand'
              }`}
              aria-label={`View ${productName} image ${index + 1}`}
            >
              <Image
                src={image}
                alt={`${productName} view ${index + 1}`}
                fill
                className="object-contain p-1.5 sm:p-2"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
