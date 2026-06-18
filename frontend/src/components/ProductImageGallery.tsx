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
      <div className="relative h-72 md:h-[32rem] rounded-xl overflow-hidden border border-royal-sand bg-white shadow-soft">
        <Image
          src={selectedImage}
          alt={productName}
          fill
          className="object-contain p-4"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-3 gap-3">
          {images.map((image, index) => (
            <button
              key={`${productName}-${index}`}
              type="button"
              onClick={() => setSelectedImage(image)}
              className={`relative h-24 rounded-lg overflow-hidden border bg-white ${
                selectedImage === image ? 'border-royal-green' : 'border-royal-sand'
              }`}
              aria-label={`View ${productName} image ${index + 1}`}
            >
              <Image
                src={image}
                alt={`${productName} view ${index + 1}`}
                fill
                className="object-contain p-2"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
