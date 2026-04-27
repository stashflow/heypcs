'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/navbar'
import { GradientBlobs } from '@/components/ui/gradient-blobs'
import { FilterBar, type Filters, type SpecOptions } from '@/components/filter-bar'
import { ListingCard, ListingCardSkeleton } from '@/components/listing-card'
import { Footer } from '@/components/footer'
import { useAuth } from '@/components/providers/auth-provider'
import { ADMIN_EMAIL } from '@/lib/constants'
import useSWR from 'swr'
import { type ListingWithImages } from '@/lib/db'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function BrowsePage() {
  const { user } = useAuth()
  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
  
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
    if (f.includeSold) params.set('includeSold', 'true')
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
  const hasActiveFilters = Object.values(appliedFilters).some(Boolean)

  // For empty state messaging
  const isEmpty = !isLoading && listings.length === 0
  const hasFiltersApplied = hasActiveFilters && isEmpty

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
            <p className="text-foreground/50">
              {data?.count !== undefined ? (
                <>
                  {data.count} <span className="text-foreground font-serif">in stock</span>
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
              isAdmin={isAdmin}
            />
          </motion.div>

          {/* Listings Grid or Empty State */}
          {isEmpty ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-20"
            >
              {hasFiltersApplied ? (
                <div className="text-center max-w-md mx-auto">
                  <h3 className="font-serif text-xl font-semibold mb-2">No PCs in stock with those filters</h3>
                  <p className="text-foreground/50 mb-6">
                    Try adjusting your search criteria. Below are other available builds:
                  </p>
                  {/* Fetch and show unfiltered listings */}
                  <BrowseOtherListings />
                </div>
              ) : (
                <div className="text-center max-w-md mx-auto">
                  <h3 className="font-serif text-xl font-semibold mb-2">No PCs in stock</h3>
                  <p className="text-foreground/50">
                    Check back soon for new high-performance builds.
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            <>
              {hasFiltersApplied && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mb-6"
                >
                  <h2 className="font-serif text-lg font-semibold mb-4">Matching Builds</h2>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {listings.map((listing, index) => (
                      <motion.div
                        key={listing.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <ListingCard listing={listing} onLikeChange={() => mutate()} />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {!hasFiltersApplied && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {listings.map((listing, index) => (
                    <motion.div
                      key={listing.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <ListingCard listing={listing} onLikeChange={() => mutate()} />
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Loading skeleton */}
          {isLoading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <ListingCardSkeleton />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

// Component to show other listings when filters are too strict
function BrowseOtherListings() {
  const { data } = useSWR<{ listings: ListingWithImages[] }>('/api/listings', fetcher)
  const listings = data?.listings || []

  if (listings.length === 0) return null

  return (
    <div className="mt-8">
      <h3 className="font-serif text-lg font-semibold mb-4">Other PCs Available</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {listings.slice(0, 6).map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  )
}
