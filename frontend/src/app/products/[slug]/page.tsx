import { products } from '../../../data/products'
import type { Metadata } from 'next'
import BulkPurchaseBox from '../../../components/BulkPurchaseBox'
import TrustComplianceSection from '../../../components/TrustComplianceSection'
import ProductImageGallery from '../../../components/ProductImageGallery'
import { formatINR } from '../../../lib/format'
import Script from 'next/script'
import { notFound } from 'next/navigation'

const SITE_URL = 'https://theroyalorganics.com'

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = products.find((p) => p.slug === params.slug)
  if (!product) return { title: 'Product Not Found' }
  const imageUrl = typeof product.image === 'string' ? product.image : product.image.src
  return {
    title: `${product.name} — Royal Organics`,
    description: `${product.description} Premium ${product.category} from Royal Organics. Lab-tested, Ayush certified, free delivery across India.`,
    keywords: [product.name, `moringa ${product.category}`, ...product.benefits, product.ingredients.join(', '), 'royal organics product'],
    alternates: {
      canonical: `/products/${params.slug}`,
    },
    openGraph: {
      title: `${product.name} — Royal Organics`,
      description: product.description,
      url: `${SITE_URL}/products/${params.slug}`,
      type: 'website',
      locale: 'en_IN',
      siteName: 'Royal Organics',
      images: [{ url: imageUrl, width: 1200, height: 630, alt: product.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description,
      images: [imageUrl],
    },
  }
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = products.find((p) => p.slug === params.slug)
  if (!product) notFound()

  const discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
  const imageUrl = typeof product.image === 'string' ? product.image : product.image.src

  const jsonLdProduct = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: `${SITE_URL}${imageUrl}`,
    description: product.description,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'Royal Organics',
    },
    category: product.category === 'powder' ? 'Dietary Supplement Powder' : 'Dietary Supplement Capsule',
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/products/${product.slug}`,
      priceCurrency: 'INR',
      price: product.price,
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'IN',
        merchantReturnDays: 30,
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '0',
          currency: 'INR',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'IN',
        },
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '128',
      bestRating: '5',
      worstRating: '1',
    },
    nutrition: {
      '@type': 'NutritionInformation',
    },
    keywords: product.benefits.join(', '),
  }

  return (
    <main>
      <Script
        id={`ld-product-${product.id}`}
        type="application/ld+json"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdProduct) }}
      />
      <div className="container py-8 sm:py-10 md:py-20 grid md:grid-cols-2 gap-6 sm:gap-8 md:gap-10 md:gap-16">
        <div className="relative">
          <ProductImageGallery productName={product.name} images={product.images} />
          {!product.inStock && (
            <div className="absolute top-4 left-4 right-4 z-10 bg-red-600 text-white text-center py-2.5 sm:py-3 rounded-xl text-base sm:text-xl font-bold shadow-lg">
              OUT OF STOCK
            </div>
          )}
        </div>
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl">{product.name}</h1>
          <p className="mt-2 sm:mt-3 text-royal-green/80 text-sm sm:text-base">{product.description}</p>
          <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2 sm:gap-3">
            {product.badges.map((b) => (
              <span key={b} className="text-xs sm:text-sm border border-royal-sand rounded-full px-2.5 sm:px-3 py-1 bg-white">
                {b}
              </span>
            ))}
          </div>

          <div className="mt-5 sm:mt-6 flex flex-wrap items-baseline gap-3 sm:gap-4">
            <div className="text-3xl sm:text-4xl font-bold text-emerald-700">{formatINR(product.price)}</div>
            <div className="text-gray-400 line-through text-base sm:text-xl">{formatINR(product.originalPrice)}</div>
            <span className="text-green-600 font-bold bg-green-50 px-2.5 sm:px-3 py-1 rounded-full text-sm sm:text-base">{discountPercent}% OFF</span>
          </div>
          <p className="mt-2 text-xs sm:text-sm text-gray-500">Inclusive of all taxes • Free delivery on orders over {formatINR(499)}</p>

          <TrustComplianceSection />
          <BulkPurchaseBox productSlug={product.slug} unitPrice={product.price} />
          <div className="mt-6 sm:mt-8">
            <h2 className="font-heading text-xl sm:text-2xl">Benefits</h2>
            <ul className="mt-2 sm:mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm sm:text-base">
              {product.benefits.map((b) => (
                <li key={b} className="text-royal-green/80">• {b}</li>
              ))}
            </ul>
          </div>
          <div className="mt-5 sm:mt-6">
            <h2 className="font-heading text-xl sm:text-2xl">Dosage</h2>
            <p className="mt-2 text-royal-green/80 text-sm sm:text-base">{product.dosage}</p>
          </div>
          <div className="mt-5 sm:mt-6">
            <h2 className="font-heading text-xl sm:text-2xl">Ingredients</h2>
            <ul className="mt-2 text-royal-green/80 space-y-1 text-sm sm:text-base">
              {product.ingredients.map((i) => <li key={i}>• {i}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}
