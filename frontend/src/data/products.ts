import type { Product } from '../types/product'
import moringaCapsulesFront from '../lib/front image.jpeg'
import moringaCapsulesBack from '../lib/back image.jpeg'
import moringaCapsulesSide from '../lib/side image.jpeg'
import moringaPowderFront from '../lib/Moringa powder front.png'
import moringaPowderBack from '../lib/morgina powder back.png'
import moringaPowderSide from '../lib/moringa powder side.png'

export const products: Product[] = [
  {
    id: 'moringa-powder-1',
    slug: 'moringa-powder',
    name: 'Organic Moringa Powder',
    category: 'powder',
    description:
      'Pure, organic moringa leaf powder. Rich in micronutrients and antioxidants to support immunity, energy, and healthy skin.',
    highlights: ['USDA Organic', 'Sustainably Sourced', 'Fine Grind for Smooth Mix'],
    benefits: ['Immunity', 'Energy', 'Digestion', 'Skin'],
    dosage: 'Take 1 tsp daily. Mix into smoothies, water, or oatmeal.',
    ingredients: ['100% Organic Moringa Oleifera Leaf Powder'],
    badges: ['Non-GMO', 'Vegan', 'Lab Tested'],
    image: moringaPowderFront,
    images: [moringaPowderFront, moringaPowderBack, moringaPowderSide],
    price: 15,
    subscriptionPrice: 13.5,
    subscriptionInterval: 'monthly',
    inStock: true,
  },
  {
    id: 'moringa-capsules-1',
    slug: 'moringa-capsules',
    name: 'Organic Moringa Capsules',
    category: 'capsules',
    description:
      'Convenient vegan capsules with lab-tested moringa powder for daily wellness. Easy to take, no taste.',
    highlights: ['Vegan Capsules', '120 Count', 'No Fillers'],
    benefits: ['Immunity', 'Energy', 'Digestion'],
    dosage: 'Take 2 capsules daily with water.',
    ingredients: ['Organic Moringa Oleifera Powder', 'Vegan Capsule (HPMC)'],
    badges: ['Non-GMO', 'Vegan', 'Lab Tested'],
    image: moringaCapsulesFront,
    images: [moringaCapsulesFront, moringaCapsulesBack, moringaCapsulesSide],
    price: 15,
    subscriptionPrice: 13.5,
    subscriptionInterval: 'monthly',
    inStock: true,
  },
]
