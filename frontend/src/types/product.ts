import type { StaticImageData } from 'next/image'

export type PurchaseOption = 'onetime' | 'subscription'

export interface Product {
  id: string
  slug: string
  name: string
  category: 'powder' | 'capsules'
  description: string
  highlights: string[]
  benefits: string[]
  dosage: string
  ingredients: string[]
  badges: ('Non-GMO' | 'Vegan' | 'Lab Tested')[]
  image: string | StaticImageData
  images: (string | StaticImageData)[]
  price: number
  subscriptionPrice: number
  subscriptionInterval: 'monthly'
  inStock: boolean
}

export interface Filter {
  powder?: boolean
  capsules?: boolean
  subscriptions?: boolean
}
