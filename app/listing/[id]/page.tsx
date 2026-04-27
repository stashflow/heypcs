'use client'

import { useState, use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Navbar } from '@/components/navbar'
import { GradientBlobs } from '@/components/ui/gradient-blobs'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Footer } from '@/components/footer'
import { useAuth } from '@/components/providers/auth-provider'
import {
  Heart,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MessageCircle,
  Cpu,
  Tv,
  MemoryStick,
  HardDrive,
  Monitor,
  ArrowLeft,
  Loader2,
} from 'lucide-react'
import useSWR from 'swr'
import { type ListingWithImages } from '@/lib/db'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuth()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLiking, setIsLiking] = useState(false)

  const { data, isLoading, mutate } = useSWR<{ listing: ListingWithImages }>(
    `/api/listings/${id}`,
    fetcher
  )

  const listing = data?.listing
  const images = listing?.images || []
  const hasMultipleImages = images.length > 1

  const handleLike = async () => {
    if (!user) {
      toast.error('Please sign in to like listings')
      return
    }

    setIsLiking(true)
    try {
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: listing?.id }),
      })

      if (res.ok) {
        mutate()
        toast.success(listing?.is_liked ? 'Removed from likes' : 'Added to likes')
      }
    } catch {
      toast.error('Failed to update like')
    } finally {
      setIsLiking(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen relative">
        <GradientBlobs />
        <Navbar />
        <main className="py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center py-32">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen relative">
        <GradientBlobs />
        <Navbar />
        <main className="py-8 px-4">
          <div className="max-w-6xl mx-auto text-center py-32">
            <h1 className="text-2xl font-bold mb-4">Listing not found</h1>
            <Link href="/browse">
              <Button className="neon-gradient-bg text-white border-0">
                Browse PCs
              </Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const specs = [
    { icon: Cpu, label: 'CPU', value: listing.cpu },
    { icon: Tv, label: 'GPU', value: listing.gpu },
    { icon: MemoryStick, label: 'RAM', value: listing.ram },
    { icon: HardDrive, label: 'Storage', value: listing.storage },
    { icon: Monitor, label: 'OS', value: listing.os },
  ].filter((spec) => spec.value)

  return (
    <div className="min-h-screen relative">
      <GradientBlobs />
      <Navbar />

      <main className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6"
          >
            <Link href="/browse">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Browse
              </Button>
            </Link>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left - Image Gallery */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Main Image */}
              <GlassCard className="overflow-hidden">
                <div className="relative aspect-[4/3]">
                  <AnimatePresence mode="wait">
                    {images.length > 0 ? (
                      <motion.div
                        key={currentImageIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0"
                      >
                        <Image
                          src={images[currentImageIndex].image_url}
                          alt={listing.title}
                          fill
                          className="object-cover"
                        />
                      </motion.div>
                    ) : (
                      <div className="absolute inset-0 bg-muted flex items-center justify-center">
                        <Tv className="h-16 w-16 text-muted-foreground/50" />
                      </div>
                    )}
                  </AnimatePresence>

                  {/* Navigation Arrows */}
                  {hasMultipleImages && (
                    <>
                      <button
                        onClick={() =>
                          setCurrentImageIndex(
                            (prev) => (prev - 1 + images.length) % images.length
                          )
                        }
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() =>
                          setCurrentImageIndex((prev) => (prev + 1) % images.length)
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>
              </GlassCard>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setCurrentImageIndex(index)}
                      className={cn(
                        'relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden transition-all',
                        index === currentImageIndex
                          ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                          : 'opacity-60 hover:opacity-100'
                      )}
                    >
                      <Image
                        src={image.image_url}
                        alt={`${listing.title} ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Right - Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              {/* Title & Price */}
              <GlassCard className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h1 className="text-2xl sm:text-3xl font-bold">{listing.title}</h1>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLike}
                    disabled={isLiking}
                    className={cn(
                      'h-10 w-10 rounded-full flex-shrink-0',
                      listing.is_liked && 'bg-red-500/10 text-red-500'
                    )}
                  >
                    <Heart
                      className={cn(
                        'h-5 w-5',
                        listing.is_liked && 'fill-current'
                      )}
                    />
                  </Button>
                </div>

                <div className="text-3xl font-bold neon-gradient-text mb-6">
                  {formatPrice(Number(listing.price))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {listing.facebook_url && (
                    <a
                      href={listing.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1"
                    >
                      <Button className="w-full neon-gradient-bg text-white border-0 h-12">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View on Facebook
                      </Button>
                    </a>
                  )}
                  <Button
                    variant="outline"
                    className="flex-1 h-12 glass-card border-white/30 hover:bg-white/10"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message Seller
                  </Button>
                </div>

                {/* Like Count */}
                {listing.like_count !== undefined && Number(listing.like_count) > 0 && (
                  <p className="text-sm text-muted-foreground mt-4">
                    {listing.like_count} {Number(listing.like_count) === 1 ? 'person' : 'people'} liked this
                  </p>
                )}
              </GlassCard>

              {/* Specs */}
              {specs.length > 0 && (
                <GlassCard className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Specifications</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {specs.map((spec) => (
                      <div
                        key={spec.label}
                        className="flex items-center gap-3 p-3 rounded-xl bg-muted/30"
                      >
                        <div className="h-10 w-10 rounded-lg neon-gradient-bg flex items-center justify-center flex-shrink-0">
                          <spec.icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{spec.label}</p>
                          <p className="font-medium">{spec.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}

              {/* Description */}
              {listing.description && (
                <GlassCard className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Description</h2>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {listing.description}
                  </p>
                </GlassCard>
              )}

              {/* Seller Info */}
              {listing.user_email && (
                <GlassCard className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Seller</h2>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full neon-gradient-bg flex items-center justify-center">
                      <span className="text-white font-medium">
                        {listing.user_email[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {listing.user_email.split('@')[0]}
                      </p>
                      <p className="text-sm text-muted-foreground">Verified Seller</p>
                    </div>
                  </div>
                </GlassCard>
              )}
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
