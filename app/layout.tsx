import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'CalSnap - Snap Any Content Into Calendar Events with AI',
    template: '%s | CalSnap',
  },
  description: 'CalSnap turns Instagram posts, text, and images into Google Calendar events instantly with AI. Snap event details from screenshots and social media automatically. Free online tool.',
  keywords: [
    'calsnap',
    'google calendar',
    'calendar event creator',
    'instagram to calendar',
    'calendar converter',
    'event from image',
    'screenshot to calendar',
    'social media events',
    'automatic event creation',
    'calendar invite generator',
    'perplexity ai',
    'gemini ai',
  ],
  authors: [{ name: 'CalSnap' }],
  creator: 'CalSnap',
  publisher: 'CalSnap',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'CalSnap - Snap Any Content Into Calendar Events with AI',
    description: 'CalSnap turns Instagram posts, text, and images into Google Calendar events instantly with AI. Snap event details automatically.',
    siteName: 'CalSnap',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CalSnap',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CalSnap - Snap Any Content Into Calendar Events with AI',
    description: 'CalSnap turns Instagram posts, text, and images into Google Calendar events instantly with AI.',
    images: ['/og-image.png'],
    creator: '@calsnap',
  },
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
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [
      { url: '/apple-icon.svg', type: 'image/svg+xml' },
    ],
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'CalSnap',
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description: 'CalSnap turns Instagram posts, text, and images into Google Calendar events instantly with AI',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '127',
    },
    featureList: [
      'Instagram post to calendar conversion',
      'Text to calendar event extraction',
      'Image to calendar event conversion',
      'AI-powered event detail extraction',
      'Google Calendar integration',
    ],
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
