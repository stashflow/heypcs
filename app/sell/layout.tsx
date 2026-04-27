import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sell a PC',
  robots: {
    index: false,
    follow: false,
  },
}

export default function SellLayout({ children }: { children: React.ReactNode }) {
  return children
}
