import Filters from '../../components/Filters'
import Section from '../../components/Section'
import ProductCard from '../../components/ProductCard'
import { products } from '../../data/products'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

const SITE_URL = 'https://theroyalorganics.com'

export const metadata: Metadata = {
  title: 'Shop — Moringa Capsules & Powder | Royal Organics',
  description:
    'Explore premium Royal Organics moringa powder and capsules. 100% organic, lab-tested, Ayush certified. One-time purchase options with free delivery across India.',
  keywords: [
    'shop moringa capsules',
    'buy moringa powder india',
    'organic wellness products',
    'royal organics shop',
    'ayurvedic supplements online',
  ],
  alternates: {
    canonical: '/shop',
  },
  openGraph: {
    title: 'Shop — Royal Organics Moringa Capsules & Powder',
    description:
      '100% organic moringa products. Lab-tested, Ayush certified. Free delivery across India.',
    url: `${SITE_URL}/shop`,
    type: 'website',
    locale: 'en_IN',
  },
}

function filterProducts(filter: string | null) {
  if (!filter) return products
  if (filter === 'powder') return products.filter((p) => p.category === 'powder')
  if (filter === 'capsules') return products.filter((p) => p.category === 'capsules')
  return products
}

export default function ShopPage({ searchParams }: { searchParams: { filter?: string } }) {
  const data = filterProducts(searchParams.filter ?? null)
  if (!data.length) notFound()

  // Generate Google Merchant-compliant JSON-LD schema for listed products
  const schemaList = data.map((p) => {
    const imageUrl = typeof p.image === 'string'
      ? (p.image.startsWith('http') ? p.image : `${SITE_URL}${p.image}`)
      : `${SITE_URL}${p.image.src}`

    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: p.name,
      description: p.description,
      image: [imageUrl],
      sku: p.id,
      brand: {
        '@type': 'Brand',
        name: 'Royal Organics',
      },
      offers: {
        '@type': 'Offer',
        url: `${SITE_URL}/shop`,
        priceCurrency: 'INR',
        price: p.price.toString(),
        priceValidUntil: '2027-12-31',
        availability: p.inStock
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
        itemCondition: 'https://schema.org/NewCondition',
        seller: {
          '@type': 'Organization',
          name: 'Royal Organics',
        },
        hasMerchantReturnPolicy: {
          '@type': 'MerchantReturnPolicy',
          applicableCountry: 'IN',
          returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
          merchantReturnDays: 7,
          returnMethod: 'https://schema.org/ReturnByMail',
          returnFees: 'https://schema.org/FreeReturn',
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
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            handlingTime: {
              '@type': 'QuantitativeValue',
              minValue: 0,
              maxValue: 1,
              unitCode: 'DAY',
            },
            transitTime: {
              '@type': 'QuantitativeValue',
              minValue: 2,
              maxValue: 5,
              unitCode: 'DAY',
            },
          },
        },
      },
    }
  })

  return (
    <>
      {/* Google Merchant Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemaList),
        }}
      />

      <main>
        <Section>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 sm:gap-6">
            <div className="text-center sm:text-left">
              <h1 className="section-title text-2xl sm:text-3xl md:text-4xl">Shop Royal Organics</h1>
              <p className="section-subtitle text-sm sm:text-base md:text-lg">Clean, lab-tested moringa for modern wellness</p>
            </div>
            <div className="w-full sm:w-auto flex justify-center sm:justify-start">
              <Filters />
            </div>
          </div>
          <div className="mt-5 sm:mt-6 md:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {data.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </Section>
      </main>
    </>
  )
}