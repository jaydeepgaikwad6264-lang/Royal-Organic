import type { Product } from '../types/product'
import cap1 from '../lib/moringa capsules/1.jpeg'
import cap2 from '../lib/moringa capsules/2.jpeg'
import cap3 from '../lib/moringa capsules/3.jpeg'
import cap4 from '../lib/moringa capsules/4.jpeg'
import cap5 from '../lib/moringa capsules/5.jpeg'
import cap6 from '../lib/moringa capsules/6.jpeg'
import moringaPowderFront from '../lib/Moringa powder front.png'
import moringaPowderBack from '../lib/morgina powder back.png'
import moringaPowderSide from '../lib/moringa powder side.png'

export const products: Product[] = [
  {
    id: 'moringa-capsules-1',
    slug: 'moringa-capsules',
    name: 'Royal Organics Moringa Capsules 500 mg, 10:1 Leaf Extract, 60 Veggie Capsules, Non-GMO, Gluten Free, Lab Tested, Plant-Based Dietary Supplement, Naturally Rich in Antioxidants',
    category: 'capsules',
    description:
      '500 mg of potent 10:1 Moringa leaf extract in 60 easy-to-swallow veggie capsules. Non-GMO, gluten-free, lab-tested plant-based supplement naturally rich in antioxidants for daily immunity, energy, and wellness.',
    highlights: ['500 mg per Capsule', '10:1 Leaf Extract', '60 Veggie Capsules', 'Non-GMO & Gluten Free'],
    benefits: ['Immunity', 'Energy', 'Digestion', 'Antioxidant Support'],
    dosage: 'Take 1\u20132 capsules daily with water.',
    ingredients: ['Moringa Oleifera 10:1 Leaf Extract (500 mg)', 'Vegan Capsule (HPMC)'],
    badges: ['Non-GMO', 'Gluten Free', 'Lab Tested', 'Plant-Based', 'Vegan'],
    image: cap1,
    images: [cap1, cap2, cap3, cap4, cap5, cap6],
    price: 399,
    originalPrice: 999,
    subscriptionPrice: 359,
    subscriptionInterval: 'monthly',
    inStock: true,
  },
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
    price: 399,
    originalPrice: 999,
    subscriptionPrice: 359,
    subscriptionInterval: 'monthly',
    inStock: false,
  },
]
