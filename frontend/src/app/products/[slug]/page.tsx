import { products } from '../../../data/products'
import type { Metadata } from 'next'
import BulkPurchaseBox from '../../../components/BulkPurchaseBox'
import TrustComplianceSection from '../../../components/TrustComplianceSection'
import ProductImageGallery from '../../../components/ProductImageGallery'
import { formatINR } from '../../../lib/format'

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = products.find((p) => p.slug === params.slug)
  if (!product) return { title: 'Product Not Found' }
  const imageUrl = typeof product.image === 'string' ? product.image : product.image.src
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: imageUrl }],
    },
  }
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = products.find((p) => p.slug === params.slug)
  if (!product) return <div className="container py-20">Not found</div>

  const discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)

  return (
    <main>
      <div className="container py-12 md:py-20 grid md:grid-cols-2 gap-10 md:gap-16">
        <div className="relative">
          <ProductImageGallery productName={product.name} images={product.images} />
          {!product.inStock && (
            <div className="absolute top-4 left-4 right-4 z-10 bg-red-600 text-white text-center py-3 rounded-xl text-xl font-bold shadow-lg">
              OUT OF STOCK
            </div>
          )}
        </div>
        <div>
          <h1 className="font-heading text-3xl md:text-4xl">{product.name}</h1>
          <p className="mt-3 text-royal-green/80">{product.description}</p>
          <div className="mt-4 flex items-center gap-3">
            {product.badges.map((b) => (
              <span key={b} className="text-sm border border-royal-sand rounded-full px-3 py-1 bg-white">
                {b}
              </span>
            ))}
          </div>

          <div className="mt-6 flex items-baseline gap-4">
            <div className="text-4xl font-bold text-emerald-700">{formatINR(product.price)}</div>
            <div className="text-gray-400 line-through text-xl">{formatINR(product.originalPrice)}</div>
            <span className="text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full">{discountPercent}% OFF</span>
          </div>
          <p className="mt-2 text-sm text-gray-500">Inclusive of all taxes • Free delivery on orders over {formatINR(499)}</p>

          <TrustComplianceSection />
          <BulkPurchaseBox productSlug={product.slug} unitPrice={product.price} />
          <div className="mt-8">
            <h2 className="font-heading text-2xl">Benefits</h2>
            <ul className="mt-3 grid grid-cols-2 gap-2">
              {product.benefits.map((b) => (
                <li key={b} className="text-royal-green/80">• {b}</li>
              ))}
            </ul>
          </div>
          <div className="mt-6">
            <h2 className="font-heading text-2xl">Dosage</h2>
            <p className="mt-2 text-royal-green/80">{product.dosage}</p>
          </div>
          <div className="mt-6">
            <h2 className="font-heading text-2xl">Ingredients</h2>
            <ul className="mt-2 text-royal-green/80">
              {product.ingredients.map((i) => <li key={i}>• {i}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}
