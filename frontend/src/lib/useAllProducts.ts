'use client'

import { useEffect, useState } from 'react'
import type { Product } from '../types/product'
import { products as staticProducts } from '../data/products'
import { getAllProducts } from './productCatalog'

let clientProductsPromise: Promise<Product[]> | null = null

/** Built-in products merged with admin-created ones, fetched once per page load. */
export function useAllProducts(): Product[] {
  const [items, setItems] = useState<Product[]>(staticProducts)

  useEffect(() => {
    let active = true
    if (!clientProductsPromise) clientProductsPromise = getAllProducts()
    clientProductsPromise.then((list) => {
      if (active) setItems(list)
    })
    return () => {
      active = false
    }
  }, [])

  return items
}
