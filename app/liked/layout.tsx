import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Liked PCs',
  robots: {
    index: false,
    follow: false,
  },
}

export default function LikedLayout({ children }: { children: React.ReactNode }) {
  return children
}
