import Filters from '../../components/Filters'
import Section from '../../components/Section'
import ProductCard from '../../components/ProductCard'
import { products } from '../../data/products'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Shop',
  description: 'Explore premium moringa powder and capsules. One-time and subscription options.',
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

  return (
    <main>
      <Section>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="section-title">Shop Royal Organics</h1>
            <p className="section-subtitle">Clean, lab-tested moringa for modern wellness</p>
          </div>
          <Filters />
        </div>
        <div className="mt-8 grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {data.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </Section>
    </main>
  )
}
