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
import { useAuth } from '@/components/providers/auth-provider'
import { AuthModal } from '@/components/auth-modal'
import { ADMIN_EMAIL } from '@/lib/constants'
import { Plus, Loader2 } from 'lucide-react'
import useSWR from 'swr'
import { type ListingWithImages } from '@/lib/db'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function MyListingsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
  const [showAuthModal, setShowAuthModal] = useState(false)

  const { data, isLoading, mutate } = useSWR<{ listings: ListingWithImages[] }>(
    '/api/listings',
    fetcher
  )

  // Filter to only show user's listings
  const myListings = data?.listings?.filter((l) => l.user_id === user?.id) || []

  // Show auth modal if not logged in after auth loading completes
  useEffect(() => {
    if (!authLoading && !user) {
      setShowAuthModal(true)
    }
  }, [authLoading, user])

  if (authLoading) {
    return (
      <div className="min-h-screen relative">
        <GradientBlobs />
        <Navbar />
        <main className="py-8 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    )
  }

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
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          >
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-1">
                My <span className="neon-gradient-text">Listings</span>
              </h1>
              <p className="text-foreground/50 font-serif">
                {user ? 'All PC listings in the marketplace' : 'Sign in to see your listings'}
              </p>
            </div>
            {isAdmin && (
              <Link href="/sell">
                <Button className="neon-gradient-bg text-white border-0 font-serif">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Listing
                </Button>
              </Link>
            )}
          </motion.div>

          {!user ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <GlassCard className="p-12 text-center">
                <p className="font-serif text-5xl font-bold neon-gradient-text mb-4">Hi</p>
                <h3 className="font-serif text-xl font-semibold mb-2">Sign in to continue</h3>
                <p className="text-foreground/50 font-serif mb-6">
                  Sign in to view and manage listings
                </p>
                <Button
                  onClick={() => setShowAuthModal(true)}
                  className="neon-gradient-bg text-white border-0 font-serif"
                >
                  Sign In
                </Button>
              </GlassCard>
            </motion.div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <ListingCardSkeleton />
                  </motion.div>
                ))
              ) : myListings.length > 0 ? (
                myListings.map((listing, index) => (
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
                  className="col-span-full"
                >
                  <GlassCard className="p-12 text-center">
                    <p className="font-serif text-5xl font-bold neon-gradient-text mb-4">Empty</p>
                    <h3 className="font-serif text-xl font-semibold mb-2">No listings yet</h3>
                    <p className="text-foreground/50 font-serif mb-6">
                      No PCs have been listed yet
                    </p>
                    {isAdmin && (
                      <Link href="/sell">
                        <Button className="neon-gradient-bg text-white border-0 font-serif">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Your First Listing
                        </Button>
                      </Link>
                    )}
                  </GlassCard>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode="signin"
      />
    </div>
  )
}
