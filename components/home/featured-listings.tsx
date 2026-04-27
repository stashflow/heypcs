'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ListingCard, ListingCardSkeleton } from '@/components/listing-card'
import useSWR from 'swr'
import { type ListingWithImages } from '@/lib/db'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function FeaturedListings() {
  const { data, isLoading, mutate } = useSWR<{ listings: ListingWithImages[] }>(
    '/api/listings',
    fetcher
  )

  const listings = data?.listings?.slice(0, 6) || []

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10"
        >
          <div>
            <h2 className="font-serif text-4xl font-bold">
              Featured <span className="neon-gradient-text">Builds</span>
            </h2>
            <p className="text-foreground/55 mt-2 text-base">
              Hand-picked high-performance custom builds
            </p>
          </div>
          <Link href="/browse">
            <Button variant="outline" className="glass-card border-white/30 hover:bg-white/10 font-serif text-base rounded-xl">
              View All
            </Button>
          </Link>
        </motion.div>

        {/* Listings Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <ListingCardSkeleton />
              </motion.div>
            ))
          ) : listings.length > 0 ? (
            listings.map((listing, index) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <ListingCard listing={listing} onLikeChange={() => mutate()} />
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-16"
            >
              <p className="font-serif text-lg text-foreground/50">
                No PCs available yet. Check back soon!
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
