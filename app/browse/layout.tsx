import type { Metadata } from 'next'
import { DEFAULT_KEYWORDS, SITE_NAME, SITE_URL, absoluteUrl } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Browse Custom Gaming PCs',
  description: "Browse available custom gaming PCs from Hey PC's. Filter by CPU, GPU, RAM, and price, then message on Facebook to buy.",
  keywords: [
    ...DEFAULT_KEYWORDS,
    'browse gaming PCs',
    'gaming PCs for sale',
    'custom PCs for sale',
    'RTX PCs for sale',
  ],
  alternates: {
    canonical: `${SITE_URL}/browse`,
  },
  openGraph: {
    title: `Browse Custom Gaming PCs | ${SITE_NAME}`,
    description: "Browse available custom gaming PCs from Hey PC's and message on Facebook to buy.",
    url: `${SITE_URL}/browse`,
    type: 'website',
    images: [
      {
        url: absoluteUrl('/logo.jpeg'),
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} custom gaming PCs`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Browse Custom Gaming PCs | ${SITE_NAME}`,
    description: "Browse available custom gaming PCs from Hey PC's and message on Facebook to buy.",
    images: [absoluteUrl('/logo.jpeg')],
  },
}

export default function BrowseLayout({ children }: { children: React.ReactNode }) {
  return children
}
