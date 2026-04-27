'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/providers/auth-provider'
import { Heart, ChevronLeft, ChevronRight, Cpu, Tv, MemoryStick } from 'lucide-react'
import { type ListingWithImages } from '@/lib/db'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ListingCardProps {
  listing: ListingWithImages
  onLikeChange?: () => void
}

export function ListingCard({ listing, onLikeChange }: ListingCardProps) {
  const { user } = useAuth()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(listing.is_liked ?? false)
  const [isLiking, setIsLiking] = useState(false)
  
  const images = listing.images || []
  const hasMultipleImages = images.length > 1

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) {
      toast.error('Please sign in to like listings')
      return
    }

    setIsLiking(true)
    try {
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: listing.id }),
      })
      
      if (res.ok) {
        const data = await res.json()
        setIsLiked(data.liked)
        onLikeChange?.()
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

  return (
    <Link href={`/listing/${listing.id}`}>
      <GlassCard hover glow className="overflow-hidden group">
        {/* Image Carousel */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <AnimatePresence mode="wait">
            {images.length > 0 ? (
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0"
              >
                <Image
                  src={images[currentImageIndex].image_url}
                  alt={listing.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </motion.div>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                <Tv className="h-12 w-12 text-muted-foreground/50" />
              </div>
            )}
          </AnimatePresence>

          {/* Image Navigation */}
          {hasMultipleImages && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              
              {/* Image Indicators */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setCurrentImageIndex(index)
                    }}
                    className={cn(
                      'w-1.5 h-1.5 rounded-full transition-all',
                      index === currentImageIndex
                        ? 'bg-white w-3'
                        : 'bg-white/50 hover:bg-white/75'
                    )}
                  />
                ))}
              </div>
            </>
          )}

          {/* Like Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLike}
            disabled={isLiking}
            className={cn(
              'absolute top-3 right-3 h-9 w-9 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all',
              isLiked && 'bg-red-500/80 hover:bg-red-500'
            )}
          >
            <Heart
              className={cn(
                'h-4 w-4 transition-all',
                isLiked ? 'fill-white text-white' : 'text-white'
              )}
            />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {listing.title}
            </h3>
            <span className="text-lg font-bold neon-gradient-text whitespace-nowrap">
              {formatPrice(Number(listing.price))}
            </span>
          </div>

          {/* Specs */}
          <div className="flex flex-wrap gap-2">
            {listing.cpu && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                <Cpu className="h-3 w-3" />
                <span className="truncate max-w-[100px]">{listing.cpu}</span>
              </div>
            )}
            {listing.gpu && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                <Tv className="h-3 w-3" />
                <span className="truncate max-w-[100px]">{listing.gpu}</span>
              </div>
            )}
            {listing.ram && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                <MemoryStick className="h-3 w-3" />
                <span>{listing.ram}</span>
              </div>
            )}
          </div>
        </div>
      </GlassCard>
    </Link>
  )
}

export function ListingCardSkeleton() {
  return (
    <GlassCard className="overflow-hidden">
      <div className="aspect-[4/3] bg-muted animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <div className="h-5 w-2/3 bg-muted rounded animate-pulse" />
          <div className="h-5 w-16 bg-muted rounded animate-pulse" />
        </div>
        <div className="flex gap-2">
          <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
          <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
          <div className="h-6 w-16 bg-muted rounded-full animate-pulse" />
        </div>
      </div>
    </GlassCard>
  )
}
