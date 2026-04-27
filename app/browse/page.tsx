'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/navbar'
import { GradientBlobs } from '@/components/ui/gradient-blobs'
import { FilterBar, type Filters, type SpecOptions } from '@/components/filter-bar'
import { ListingCard, ListingCardSkeleton } from '@/components/listing-card'
import { Footer } from '@/components/footer'
import useSWR from 'swr'
import { type ListingWithImages } from '@/lib/db'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function BrowsePage() {
  const [filters, setFilters] = useState<Filters>({})
  const [appliedFilters, setAppliedFilters] = useState<Filters>({})

  const { data: specsData } = useSWR<SpecOptions>('/api/listings/specs', fetcher)

  const buildQueryString = useCallback((f: Filters) => {
    const params = new URLSearchParams()
    if (f.minPrice) params.set('minPrice', f.minPrice)
    if (f.maxPrice) params.set('maxPrice', f.maxPrice)
    if (f.cpu) params.set('cpu', f.cpu)
    if (f.gpu) params.set('gpu', f.gpu)
    if (f.ram) params.set('ram', f.ram)
    return params.toString()
  }, [])

  const queryString = buildQueryString(appliedFilters)
  const { data, isLoading, mutate } = useSWR<{ listings: ListingWithImages[]; count: number }>(
    `/api/listings${queryString ? `?${queryString}` : ''}`,
    fetcher
  )

  const handleSearch = () => {
    setAppliedFilters(filters)
  }

  const listings = data?.listings || []

  return (
    <div className="min-h-screen relative">
      <GradientBlobs />
      <Navbar />

      <main className="py-8 px-4">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              Browse <span className="neon-gradient-text">PCs</span>
            </h1>
            <p className="text-muted-foreground">
              {data?.count !== undefined ? (
                <>
                  Showing <span className="text-foreground font-medium">{data.count}</span> listings
                </>
              ) : (
                'Find your perfect build'
              )}
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <FilterBar
              filters={filters}
              onFiltersChange={setFilters}
              onSearch={handleSearch}
              specOptions={specsData ?? { cpus: [], gpus: [], rams: [] }}
            />
          </motion.div>

          {/* Listings Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <ListingCardSkeleton />
                </motion.div>
              ))
            ) : listings.length > 0 ? (
              listings.map((listing, index) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <ListingCard listing={listing} onLikeChange={() => mutate()} />
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full text-center py-20"
              >
                <div className="max-w-md mx-auto">
                  <h3 className="text-xl font-semibold mb-2">No PCs found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your filters or check back later for new listings.
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
