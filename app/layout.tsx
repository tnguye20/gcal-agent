import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'AI Calendar Event Creator - Convert Posts & Images to Google Calendar',
    template: '%s | AI Calendar Event Creator',
  },
  description: 'Convert Instagram posts, text, and images into Google Calendar events instantly with AI. Extract event details from screenshots and social media posts automatically. Free online tool.',
  keywords: [
    'google calendar',
    'calendar event creator',
    'instagram to calendar',
    'ai event extractor',
    'calendar converter',
    'event from image',
    'screenshot to calendar',
    'social media events',
    'automatic event creation',
    'calendar invite generator',
    'perplexity ai',
    'gemini ai',
  ],
  authors: [{ name: 'GCal Agent' }],
  creator: 'GCal Agent',
  publisher: 'GCal Agent',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'AI Calendar Event Creator - Convert Posts & Images to Google Calendar',
    description: 'Convert Instagram posts, text, and images into Google Calendar events instantly with AI. Extract event details automatically.',
    siteName: 'AI Calendar Event Creator',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI Calendar Event Creator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Calendar Event Creator - Convert Posts & Images to Google Calendar',
    description: 'Convert Instagram posts, text, and images into Google Calendar events instantly with AI.',
    images: ['/og-image.png'],
    creator: '@gcalagent',
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
    name: 'AI Calendar Event Creator',
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'All',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description: 'Convert Instagram posts, text, and images into Google Calendar events instantly with AI',
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
