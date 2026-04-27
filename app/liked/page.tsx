'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/navbar'
import { GradientBlobs } from '@/components/ui/gradient-blobs'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { ListingCard, ListingCardSkeleton } from '@/components/listing-card'
import { Footer } from '@/components/footer'
import { Heart } from 'lucide-react'
import useSWR from 'swr'
import { type ListingWithImages } from '@/lib/db'
import { useLikes } from '@/hooks/use-likes'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function LikedPage() {
  const { liked } = useLikes()
  const [likedIds, setLikedIds] = useState<number[]>([])

  // Sync liked ids from localStorage after mount
  useEffect(() => {
    setLikedIds(Array.from(liked))
  }, [liked])

  // Fetch all listings and filter locally based on localStorage
  const { data, isLoading } = useSWR<{ listings: ListingWithImages[] }>('/api/listings', fetcher)

  const allListings = data?.listings || []
  const likedListings = allListings.filter((l) => likedIds.includes(l.id))

  return (
    <div className="min-h-screen relative">
      <GradientBlobs />
      <Navbar />

      <main className="py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-1">
              Liked <span className="neon-gradient-text">PCs</span>
            </h1>
            <p className="text-foreground/50 font-serif">Your saved builds</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <ListingCardSkeleton />
                </motion.div>
              ))
            ) : likedListings.length > 0 ? (
              likedListings.map((listing, index) => (
                <motion.div key={listing.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
                  <ListingCard listing={listing} />
                </motion.div>
              ))
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full">
                <GlassCard className="p-12 text-center">
                  <Heart className="h-12 w-12 text-foreground/20 mx-auto mb-4" />
                  <h3 className="font-serif text-xl font-semibold mb-2">No liked PCs yet</h3>
                  <p className="text-foreground/50 font-serif mb-6">
                    Tap the heart on any listing to save it here
                  </p>
                  <Link href="/browse">
                    <Button className="neon-gradient-bg text-white border-0 font-serif">Browse PCs</Button>
                  </Link>
                </GlassCard>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
