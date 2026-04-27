import type { Metadata, Viewport } from 'next'
import { DM_Sans, Caveat } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/components/providers/auth-provider'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600', '700'],
})

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: "Hey PC's",
  description: 'Find your next high-performance PC build. No scams, just quality custom PCs.',
  keywords: ['custom PC', 'gaming PC', 'PC marketplace', 'buy PC', 'sell PC'],
  icons: {
    icon: '/logo.jpeg',
    apple: '/logo.jpeg',
  },
  openGraph: {
    title: "Hey PC's",
    description: 'Find your next high-performance PC build. No scams, just quality custom PCs.',
    type: 'website',
    images: [
      {
        url: '/logo.jpeg',
        width: 1200,
        height: 630,
        alt: "Hey PC's - Custom PC Marketplace",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Hey PC's",
    description: 'Find your next high-performance PC build. No scams, just quality custom PCs.',
    images: ['/logo.jpeg'],
  },
}

export const viewport: Viewport = {
  themeColor: '#8B5CF6',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background">
      <body className={`${dmSans.variable} ${caveat.variable} font-sans antialiased min-h-screen`}>
        <AuthProvider>
          {children}
          <Toaster position="bottom-right" />
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
