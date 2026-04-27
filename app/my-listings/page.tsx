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
import { Monitor, Plus, Loader2 } from 'lucide-react'
import useSWR from 'swr'
import { type ListingWithImages } from '@/lib/db'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function MyListingsPage() {
  const { user, isLoading: authLoading } = useAuth()
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
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full neon-gradient-bg flex items-center justify-center">
                  <Monitor className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold">
                  My <span className="neon-gradient-text">Listings</span>
                </h1>
              </div>
              <p className="text-muted-foreground">
                {user ? 'Manage your PC listings' : 'Sign in to see your listings'}
              </p>
            </div>
            {user && (
              <Link href="/sell">
                <Button className="neon-gradient-bg text-white border-0">
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
                <Monitor className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Sign in to see your listings</h3>
                <p className="text-muted-foreground mb-6">
                  Create and manage your PC listings by signing in
                </p>
                <Button
                  onClick={() => setShowAuthModal(true)}
                  className="neon-gradient-bg text-white border-0"
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
                    <Monitor className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No listings yet</h3>
                    <p className="text-muted-foreground mb-6">
                      Create your first PC listing and start selling
                    </p>
                    <Link href="/sell">
                      <Button className="neon-gradient-bg text-white border-0">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Listing
                      </Button>
                    </Link>
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
