import type { Metadata, Viewport } from 'next'
import '../styles/globals.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { CartProvider } from '../lib/cartContext'
import falconIcon from '../lib/falcon icon.jpeg'

export const metadata: Metadata = {
  metadataBase: undefined,
  title: {
    default: 'Royal Organics — Premium Moringa Wellness',
    template: '%s | Royal Organics',
  },
  description:
    'Royal Organics offers 100% organic Moringa capsules and powder for immunity, energy and holistic wellness. Free delivery across India.',
  applicationName: 'Royal Organics',
  keywords: ['Royal Organics', 'Moringa', 'Moringa Capsules', 'Moringa Powder', 'Organic India', 'Ayurvedic Wellness', 'Immunity Booster'],
  authors: [{ name: 'Royal Organics' }],
  creator: 'Royal Organics',
  category: 'Health, Wellness & Organic Food',
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
    title: 'Royal Organics — Premium Moringa Wellness',
    description:
      '100% organic Moringa capsules and powder. Free delivery across India. Boost immunity and energy naturally.',
    creator: '@royalorganics',
    images: [falconIcon.src],
  },
  openGraph: {
    type: 'website',
    siteName: 'Royal Organics',
    title: 'Royal Organics — Premium Moringa Wellness',
    description:
      '100% organic Moringa capsules and powder. Free delivery across India. Boost immunity and energy naturally.',
    locale: 'en_IN',
    images: [falconIcon.src],
  },
}

export const viewport: Viewport = {
  themeColor: '#064e3b',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/jpeg" href={falconIcon.src} />
        <link rel="shortcut icon" type="image/jpeg" href={falconIcon.src} />
        <link rel="apple-touch-icon" type="image/jpeg" href={falconIcon.src} />
        <meta name="theme-color" content="#064e3b" />
      </head>
      <body className="font-body bg-royal-beige text-royal-text">
        <CartProvider>
          <Navbar />
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  )
}
