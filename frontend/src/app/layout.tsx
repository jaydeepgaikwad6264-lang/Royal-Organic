import type { Metadata, Viewport } from 'next'
import '../styles/globals.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { CartProvider } from '../lib/cartContext'
import falconIcon from '../lib/falcon icon.jpeg'
import Script from 'next/script'

const SITE_URL = 'https://theroyalorganics.com'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Royal Organics — Premium Moringa Wellness | 100% Organic India',
    template: '%s | Royal Organics',
  },
  description:
    'Royal Organics offers 100% organic Moringa capsules and powder for immunity, energy and holistic wellness. Lab-tested, Ayush certified, free delivery across India.',
  applicationName: 'Royal Organics',
  keywords: [
    'Royal Organics',
    'Moringa',
    'Moringa Capsules',
    'Moringa Powder',
    'Organic India',
    'Ayurvedic Wellness',
    'Immunity Booster',
    'Premium Moringa',
    'Moringa Products India',
    'Natural Energy Supplement',
    'Plant Based Protein',
    'Ayush Certified',
    'USFDA Moringa',
    'Buy Moringa Online',
    'Moringa for Skin',
    'Moringa for Weight Loss',
    'Daily Wellness India',
    'Holistic Healthcare',
  ],
  authors: [{ name: 'Royal Organics', url: SITE_URL }],
  creator: 'Royal Organics',
  publisher: 'Royal Organics',
  category: 'Health, Wellness & Organic Food',
  classification: 'Health and Wellness',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: '/',
    languages: {
      'en-IN': '/',
      'en-US': '/',
    },
  },
  icons: {
    icon: [
      { url: falconIcon.src, type: 'image/jpeg', sizes: 'any' },
    ],
    shortcut: [{ url: falconIcon.src, type: 'image/jpeg' }],
    apple: [
      { url: falconIcon.src, type: 'image/jpeg' },
    ],
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: falconIcon.src,
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Royal Organics — Premium Moringa Wellness | 100% Organic India',
    description:
      '100% organic Moringa capsules and powder. Lab-tested, Ayush certified. Free delivery across India. Boost immunity and energy naturally.',
    creator: '@royalorganics',
    site: '@royalorganics',
    images: [
      {
        url: falconIcon.src,
        width: 1200,
        height: 630,
        alt: 'Royal Organics — Premium Moringa Wellness Products',
      },
    ],
  },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'Royal Organics',
    title: 'Royal Organics — Premium Moringa Wellness | 100% Organic India',
    description:
      '100% organic Moringa capsules and powder. Lab-tested, Ayush certified. Free delivery across India. Boost immunity and energy naturally.',
    locale: 'en_IN',
    alternateLocale: ['en_US'],
    countryName: 'India',
    emails: ['indicraftroyal@gmail.com'],
    phoneNumbers: ['+919217594902'],
    images: [
      {
        url: falconIcon.src,
        width: 1200,
        height: 630,
        alt: 'Royal Organics — Premium Moringa Wellness Products',
        type: 'image/jpeg',
      },
    ],
  },
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  bookmarks: [SITE_URL],
  other: {
    'contact': 'indicraftroyal@gmail.com',
    'rating': '4.9/5',
    'category': 'shopping',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#064e3b' },
    { media: '(prefers-color-scheme: dark)', color: '#064e3b' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  minimumScale: 1,
  viewportFit: 'cover',
  colorScheme: 'light',
}

const jsonLdOrganization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Royal Organics',
  alternateName: 'Royal Organics India',
  url: SITE_URL,
  logo: `${SITE_URL}${falconIcon.src}`,
  email: 'indicraftroyal@gmail.com',
  telephone: '+919217594902',
  description:
    'Royal Organics offers premium, 100% organic moringa capsules and powder for immunity, energy, and holistic wellness. Ayush licensed, USFDA registered, lab-tested purity with free delivery across India.',
  slogan: 'Wellness, naturally elevated.',
  foundingDate: '2024',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Floor 3, House No. 29/1, Indra Vikas Colony',
    addressLocality: 'New Delhi',
    addressRegion: 'Delhi',
    postalCode: '110033',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '28.7145685',
    longitude: '77.2055485',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    email: 'indicraftroyal@gmail.com',
    telephone: '+919217594902',
    areaServed: 'IN',
    availableLanguage: ['English', 'Hindi'],
  },
  sameAs: [
    'https://www.linkedin.com/in/devesh-rajput-999a601b2',
    'https://www.facebook.com/share/16DKCXnBGiw/',
    'https://www.instagram.com/royalorganics_01',
  ],
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '128',
    bestRating: '5',
    worstRating: '1',
  },
  hasMerchantReturnPolicy: {
    '@type': 'MerchantReturnPolicy',
    applicableCountry: 'IN',
    returnPolicyCategory: 'MerchantReturnFiniteReturnWindow',
    merchantReturnDays: 30,
    returnMethod: 'ReturnByMail',
    returnFees: 'CustomerReturnFees',
  },
  shippingDetails: [
    {
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
          minValue: 1,
          maxValue: 2,
          unitCode: 'DAY',
        },
        transitTime: {
          '@type': 'QuantitativeValue',
          minValue: 3,
          maxValue: 7,
          unitCode: 'DAY',
        },
      },
    },
  ],
}

const jsonLdWebSite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Royal Organics',
  alternateName: 'Royal Organics — Premium Moringa Wellness',
  url: SITE_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/shop?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Royal Organics',
    url: SITE_URL,
  },
}

const jsonLdProductGroup = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  itemListElement: [
    {
      '@type': 'Product',
      position: 1,
      name: 'Royal Organics Moringa Capsules',
      image: `${SITE_URL}${falconIcon.src}`,
      description:
        'Convenient 500mg 10:1 concentrated moringa leaf extract capsules for taste-free daily wellness. Boost immunity, energy, and vitality.',
      brand: { '@type': 'Brand', name: 'Royal Organics' },
      offers: {
        '@type': 'Offer',
        url: `${SITE_URL}/products/moringa-capsules`,
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/NewCondition',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        reviewCount: '128',
        bestRating: '5',
        worstRating: '1',
      },
    },
    {
      '@type': 'Product',
      position: 2,
      name: 'Royal Organics Moringa Powder',
      image: `${SITE_URL}${falconIcon.src}`,
      description:
        'Fine-milled, lab-tested pure moringa leaf powder for smoothies, recipes, and beverages. 100% organic, non-GMO, vegan wellness.',
      brand: { '@type': 'Brand', name: 'Royal Organics' },
      offers: {
        '@type': 'Offer',
        url: `${SITE_URL}/products/moringa-powder`,
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/NewCondition',
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        reviewCount: '128',
        bestRating: '5',
        worstRating: '1',
      },
    },
  ],
}

const jsonLdFAQ = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do I use moringa powder?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Mix 1 tsp of Royal Organics Moringa Powder into smoothies, water, juices, or food daily for best results.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are Royal Organics products vegan and non-GMO?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. All Royal Organics products are 100% vegan, non-GMO, and cruelty-free.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is your shipping policy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Orders ship within 1-2 business days. Free delivery across India on all orders.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you offer returns?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Royal Organics offers a 30-day satisfaction guarantee. Contact support to start a return.',
      },
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" dir="ltr">
      <head>
        <link rel="icon" type="image/jpeg" href={falconIcon.src} />
        <link rel="shortcut icon" type="image/jpeg" href={falconIcon.src} />
        <link rel="apple-touch-icon" type="image/jpeg" href={falconIcon.src} />
        <meta name="theme-color" content="#064e3b" />
        <meta name="google-site-verification" content="" />
        <link rel="canonical" href={SITE_URL} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://checkout.razorpay.com" />
        <meta name="business-contact" content="indicraftroyal@gmail.com, +91 9217594902" />
        <meta name="pinterest-rich-pin" content="true" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Royal Organics" />
        <meta name="mobile-web-app-capable" content="yes" />
        <Script
          id="ld-org"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
        <Script
          id="ld-website"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
        />
        <Script
          id="ld-products"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdProductGroup) }}
        />
        <Script
          id="ld-faq"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFAQ) }}
        />
      </head>
      <body className="font-body bg-royal-beige text-royal-text">
        <CartProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-royal-green focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg"
          >
            Skip to main content
          </a>
          <Navbar />
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  )
}
