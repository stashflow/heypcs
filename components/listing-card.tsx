'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Heart, ChevronLeft, ChevronRight, Play, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type ListingWithImages } from '@/lib/db'
import { useLikes } from '@/hooks/use-likes'
import { getYoutubeId } from '@/components/image-upload'

interface ListingCardProps {
  listing: ListingWithImages
  onLikeChange?: () => void
  onSoldChange?: () => void
  showSoldButton?: boolean
}

type ListingStatus = 'available' | 'pending' | 'sold'

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)

export function ListingCard({ listing, onLikeChange, onSoldChange, showSoldButton }: ListingCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHoveringVideo, setIsHoveringVideo] = useState(false)
  const [isMarkingSold, setIsMarkingSold] = useState(false)
  const [isDuplicating, setIsDuplicating] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const { isLiked, toggleLike } = useLikes()

  const media = listing.images || []
  const hasMultiple = media.length > 1
  const liked = isLiked(listing.id)
  const currentItem = media[currentIndex]
  const isYoutube = currentItem?.media_type === 'youtube'
  const ytId = isYoutube ? getYoutubeId(currentItem.image_url) : null
  const status = (listing.listing_status || (listing.is_sold ? 'sold' : 'available')) as ListingStatus
  const statusStyles = {
    available: 'bg-emerald-500 text-white border-transparent',
    pending: 'bg-amber-500 text-white border-transparent',
    sold: 'bg-black/70 text-white border-transparent',
  } satisfies Record<ListingStatus, string>

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await toggleLike(listing.id)
    onLikeChange?.()
  }

  const updateStatus = async (nextStatus: ListingStatus) => {
    setIsMarkingSold(true)
    try {
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_status: nextStatus }),
      })
      if (res.ok) {
        onSoldChange?.()
      }
    } catch (error) {
      console.error('Error marking as sold:', error)
    } finally {
      setIsMarkingSold(false)
    }
  }

  const duplicateListing = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDuplicating(true)
    try {
      const res = await fetch(`/api/listings/${listing.id}/duplicate`, { method: 'POST' })
      if (res.ok) {
        onSoldChange?.()
      }
    } catch (error) {
      console.error('Error duplicating listing:', error)
    } finally {
      setIsDuplicating(false)
    }
  }

  const prev = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    setCurrentIndex((i) => (i - 1 + media.length) % media.length)
  }
  const next = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    setCurrentIndex((i) => (i + 1) % media.length)
  }

  const handleDragStart = (e: React.TouchEvent | React.DragEvent) => {
    if ('touches' in e) {
      setDragStartX(e.touches[0].clientX)
    }
  }

  const handleDragEnd = (e: React.TouchEvent | React.DragEvent) => {
    let endX = 0
    if ('changedTouches' in e) {
      endX = e.changedTouches[0].clientX
    }
    const diff = dragStartX - endX
    const threshold = 50
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        setCurrentIndex((i) => (i + 1) % media.length)
      } else {
        setCurrentIndex((i) => (i - 1 + media.length) % media.length)
      }
    }
  }

  return (
    <motion.div whileHover={{ y: -4, scale: 1.01 }} transition={{ duration: 0.2 }} className="group h-full">
      <Link href={`/${listing.id}`} className="block h-full">
        <GlassCard className="overflow-hidden h-full flex flex-col hover:shadow-xl hover:shadow-purple-100/40 transition-shadow">
          {/* Media */}
          <div 
            className="relative aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-50 overflow-hidden select-none"
            onTouchStart={hasMultiple ? handleDragStart : undefined}
            onTouchEnd={hasMultiple ? handleDragEnd : undefined}
          >
            {status !== 'available' && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                <span className="font-serif text-3xl font-bold text-white">{status === 'sold' ? 'SOLD' : 'PENDING'}</span>
              </div>
            )}
            {media.length > 0 ? (
              isYoutube && ytId ? (
                <div
                  className="absolute inset-0"
                  onMouseEnter={() => setIsHoveringVideo(true)}
                  onMouseLeave={() => setIsHoveringVideo(false)}
                >
                  {isHoveringVideo ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&rel=0&controls=0`}
                      className="absolute inset-0 w-full h-full"
                      allow="autoplay; encrypted-media"
                    />
                  ) : (
                    <>
                      <Image src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt={listing.title} fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="h-12 w-12 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                          <Play className="h-5 w-5 text-white fill-white ml-1" />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Image
                  src={currentItem.image_url}
                  alt={listing.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  placeholder="blur"
                  blurDataURL="data:image/webp;base64,UklGRlYAAABXRUJQVlA4IEoAAADQAQCdASoIAAYAAkA4JYgCdAEO/hPMAA"
                  loading="lazy"
                />
              )
            ) : (
              <div className="absolute inset-0 neon-gradient-bg opacity-10 flex items-center justify-center">
                <span className="font-serif text-4xl text-foreground/20">PC</span>
              </div>
            )}

            {/* Carousel nav */}
            {hasMultiple && (
              <>
                <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <ChevronRight className="h-4 w-4" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                  {media.map((_, i) => (
                    <div key={i} className={cn('h-1.5 rounded-full transition-all', i === currentIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50')} />
                  ))}
                </div>
              </>
            )}

            {/* Like button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLike}
              className={cn(
                'absolute top-3 right-3 h-9 w-9 rounded-full bg-white/80 backdrop-blur-sm border border-white/40 z-10',
                'opacity-0 group-hover:opacity-100 transition-all duration-200',
                liked && 'opacity-100 bg-red-50/90 border-red-200/40'
              )}
            >
              <Heart className={cn('h-4 w-4 transition-colors', liked ? 'fill-red-500 text-red-500' : 'text-foreground/60')} />
            </Button>

            <Badge className={cn('absolute left-3 top-3 z-10 rounded-full font-serif capitalize', statusStyles[status])}>
              {status}
            </Badge>
          </div>

          {/* Info */}
          <div className="p-4 flex flex-col gap-2 flex-1">
            <div className="space-y-1">
              <h3 className="font-serif text-base font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                {listing.title}
              </h3>
              <span className="block font-serif text-lg font-bold neon-gradient-text">
                {formatPrice(Number(listing.price))}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 min-w-0">
              {listing.gpu && <span className="text-xs text-foreground/60 bg-white/50 border border-white/30 px-2 py-0.5 rounded-full truncate max-w-[calc(50%-4px)]">{listing.gpu}</span>}
              {listing.cpu && <span className="text-xs text-foreground/60 bg-white/50 border border-white/30 px-2 py-0.5 rounded-full truncate max-w-[calc(50%-4px)]">{listing.cpu}</span>}
              {listing.ram && <span className="text-xs text-foreground/60 bg-white/50 border border-white/30 px-2 py-0.5 rounded-full">{listing.ram}</span>}
            </div>
            {listing.likes_count > 0 && (
              <p className="text-xs text-foreground/40 font-serif mt-auto">
                {listing.likes_count} {listing.likes_count === 1 ? 'like' : 'likes'}
              </p>
            )}

            {showSoldButton && (
              <div className="mt-2 grid grid-cols-[1fr_auto] gap-2" onClick={(e) => { e.preventDefault(); e.stopPropagation() }}>
                <Select value={status} onValueChange={(value) => updateStatus(value as ListingStatus)} disabled={isMarkingSold}>
                  <SelectTrigger className="h-9 w-full glass-card border-white/30 font-serif">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={duplicateListing}
                  disabled={isDuplicating}
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 glass-card border-white/30"
                  title="Duplicate listing"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </GlassCard>
      </Link>
    </motion.div>
  )
}

export function ListingCardSkeleton() {
  return (
    <GlassCard className="overflow-hidden">
      <div className="aspect-[4/3] bg-muted animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between gap-2">
          <div className="h-4 bg-muted rounded animate-pulse flex-1" />
          <div className="h-4 bg-muted rounded animate-pulse w-16" />
        </div>
        <div className="flex gap-2">
          <div className="h-6 bg-muted rounded-full animate-pulse w-24" />
          <div className="h-6 bg-muted rounded-full animate-pulse w-20" />
        </div>
      </div>
    </GlassCard>
  )
}
