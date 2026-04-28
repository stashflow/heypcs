'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, type PanInfo } from 'framer-motion'
import { Navbar } from '@/components/navbar'
import { GradientBlobs } from '@/components/ui/gradient-blobs'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Footer } from '@/components/footer'
import { MediaUpload, type MediaItem, getYoutubeId } from '@/components/image-upload'
import { ListingCard } from '@/components/listing-card'
import { useAuth } from '@/components/providers/auth-provider'
import { useLikes } from '@/hooks/use-likes'
import { ADMIN_EMAIL } from '@/lib/constants'
import {
  Heart,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Loader2,
  Pencil,
  Trash2,
  X,
  Check,
  Play,
  Cpu,
  CircuitBoard,
  MemoryStick,
  HardDrive,
  Monitor,
  MessageCircle,
  MapPin,
  Share2,
  ShieldCheck,
} from 'lucide-react'
import useSWR from 'swr'
import { type ListingWithImages } from '@/lib/db'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function ListingPageClient({ id }: { id: string }) {
  const { user } = useAuth()
  const router = useRouter()
  const { isLiked, toggleLike } = useLikes()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editForm, setEditForm] = useState<Partial<ListingWithImages> & { mediaItems?: MediaItem[] }>({})
  const [isPlayingVideo, setIsPlayingVideo] = useState(false)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [lightboxZoom, setLightboxZoom] = useState(1)
  const pinchDistanceRef = useRef<number | null>(null)

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()

  const { data, isLoading, mutate } = useSWR<{ listing: ListingWithImages }>(
    `/api/listings/${id}`,
    fetcher,
    {
      onSuccess: (data) => {
        if (data?.listing && !isEditing) {
          // Convert images to MediaItem[] for the edit form
          const mediaItems: MediaItem[] = (data.listing.images || []).map((img) => ({
            url: img.image_url,
            type: img.media_type === 'youtube' ? 'youtube' : 'image',
          }))
          setEditForm({ ...data.listing, mediaItems })
        }
      },
    }
  )
  const { data: relatedData } = useSWR<{ listings: ListingWithImages[] }>('/api/listings', fetcher)

  const listing = data?.listing
  const media = listing?.images || []
  const hasMultiple = media.length > 1
  const liked = listing ? isLiked(listing.id) : false
  const currentItem = media[currentIndex]
  const isYoutube = currentItem?.media_type === 'youtube'
  const ytId = isYoutube ? getYoutubeId(currentItem.image_url) : null
  const relatedListings = (relatedData?.listings || []).filter((item) => item.id !== listing?.id).slice(0, 3)

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)

  const handleLike = async () => {
    if (!listing) return
    await toggleLike(listing.id)
    mutate()
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/${id}`
    try {
      if (navigator.share) {
        await navigator.share({ title: listing?.title || "Hey PC's listing", url })
      } else {
        await navigator.clipboard.writeText(url)
        toast.success('Listing link copied')
      }
    } catch {
      // User cancelled native sharing.
    }
  }

  const showPreviousMedia = () => {
    if (!media.length) return
    setCurrentIndex((i) => (i - 1 + media.length) % media.length)
    setIsPlayingVideo(false)
    setLightboxZoom(1)
  }

  const showNextMedia = () => {
    if (!media.length) return
    setCurrentIndex((i) => (i + 1) % media.length)
    setIsPlayingVideo(false)
    setLightboxZoom(1)
  }

  const handleGalleryDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!hasMultiple || isPlayingVideo) return

    const swipeDistance = info.offset.x
    const swipeVelocity = info.velocity.x
    const swipeThreshold = 60
    const velocityThreshold = 500

    if (swipeDistance < -swipeThreshold || swipeVelocity < -velocityThreshold) {
      showNextMedia()
    } else if (swipeDistance > swipeThreshold || swipeVelocity > velocityThreshold) {
      showPreviousMedia()
    }
  }

  const openLightbox = () => {
    if (!media.length) return
    setIsPlayingVideo(false)
    setLightboxZoom(1)
    setIsLightboxOpen(true)
  }

  const closeLightbox = () => {
    setIsLightboxOpen(false)
    setLightboxZoom(1)
    pinchDistanceRef.current = null
  }

  const handleLightboxDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!hasMultiple || lightboxZoom > 1.05) return

    const swipeDistance = info.offset.x
    const swipeVelocity = info.velocity.x
    const swipeThreshold = 60
    const velocityThreshold = 500

    if (swipeDistance < -swipeThreshold || swipeVelocity < -velocityThreshold) {
      showNextMedia()
    } else if (swipeDistance > swipeThreshold || swipeVelocity > velocityThreshold) {
      showPreviousMedia()
    }
  }

  const getTouchDistance = (touches: React.TouchList) => {
    const [first, second] = [touches[0], touches[1]]
    return Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY)
  }

  const handleLightboxTouchStart = (event: React.TouchEvent) => {
    if (event.touches.length === 2) {
      pinchDistanceRef.current = getTouchDistance(event.touches)
    }
  }

  const handleLightboxTouchMove = (event: React.TouchEvent) => {
    if (event.touches.length !== 2 || !pinchDistanceRef.current) return

    event.preventDefault()
    const nextDistance = getTouchDistance(event.touches)
    const scaleChange = nextDistance / pinchDistanceRef.current
    pinchDistanceRef.current = nextDistance
    setLightboxZoom((zoom) => Math.min(3, Math.max(1, zoom * scaleChange)))
  }

  const handleLightboxWheel = (event: React.WheelEvent) => {
    if (currentItem?.media_type === 'youtube') return

    event.preventDefault()
    const direction = event.deltaY > 0 ? -0.15 : 0.15
    setLightboxZoom((zoom) => Math.min(3, Math.max(1, zoom + direction)))
  }

  useEffect(() => {
    if (!isLightboxOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeLightbox()
      if (event.key === 'ArrowLeft') showPreviousMedia()
      if (event.key === 'ArrowRight') showNextMedia()
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [isLightboxOpen, media.length])

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/listings/${id}`, { method: 'DELETE' })
      if (res.ok) { toast.success('Listing deleted'); router.push('/browse') }
      else toast.error('Failed to delete listing')
    } catch { toast.error('Failed to delete listing') }
    finally { setIsDeleting(false); setShowDeleteConfirm(false) }
  }

  const handleSaveEdit = async () => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description,
          price: editForm.price,
          cpu: editForm.cpu,
          gpu: editForm.gpu,
          ram: editForm.ram,
          storage: editForm.storage,
          os: editForm.os,
          facebook_url: editForm.facebook_url,
          images: editForm.mediaItems?.map((m) => ({ url: m.url, type: m.type })),
        }),
      })
      if (res.ok) {
        await mutate()
        setIsEditing(false)
        setIsPlayingVideo(false)
        setCurrentIndex(0)
        toast.success('Listing updated')
      } else {
        toast.error('Failed to save changes')
      }
    } catch { toast.error('Failed to save changes') }
    finally { setIsSaving(false) }
  }

  const handleStartEdit = () => {
    if (!listing) return
    const mediaItems: MediaItem[] = (listing.images || []).map((img) => ({
      url: img.image_url,
      type: img.media_type === 'youtube' ? 'youtube' : 'image',
    }))
    setEditForm({ ...listing, mediaItems })
    setIsEditing(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen relative">
        <GradientBlobs />
        <Navbar />
        <main className="py-8 px-4">
          <div className="max-w-6xl mx-auto flex items-center justify-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
            <h1 className="font-serif text-2xl font-bold mb-4">Listing not found</h1>
            <Link href="/browse"><Button className="neon-gradient-bg text-white border-0 font-serif">Browse PCs</Button></Link>
          </div>
        </main>
      </div>
    )
  }

  const specFields = [
    {
      key: 'cpu',
      label: 'CPU',
      icon: Cpu,
      accent: 'from-sky-500 to-blue-600',
    },
    {
      key: 'gpu',
      label: 'GPU',
      icon: CircuitBoard,
      accent: 'from-violet-500 to-fuchsia-500',
    },
    {
      key: 'ram',
      label: 'RAM',
      icon: MemoryStick,
      accent: 'from-emerald-500 to-teal-500',
    },
    {
      key: 'storage',
      label: 'Storage',
      icon: HardDrive,
      accent: 'from-amber-500 to-orange-500',
    },
    {
      key: 'os',
      label: 'OS',
      icon: Monitor,
      accent: 'from-slate-600 to-zinc-800',
    },
  ] as const

  const specs = specFields.filter((s) => listing[s.key])

  return (
    <div className="min-h-screen relative overflow-x-clip">
      <GradientBlobs />
      <Navbar />

      <main className="px-3 py-4 sm:px-4 sm:py-8">
        <div className="max-w-6xl mx-auto min-w-0">

          {/* Back + Admin Controls */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-4 sm:mb-6 flex items-center justify-between flex-wrap gap-2">
            <Link href="/browse">
              <Button variant="ghost" size="sm" className="gap-1.5 font-serif text-sm">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>

            {isAdmin && !isEditing && (
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="gap-1.5 glass-card border-white/30 hover:bg-white/10 font-serif text-sm" onClick={handleStartEdit}>
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
                {!showDeleteConfirm ? (
                  <Button size="sm" variant="outline" className="gap-1.5 glass-card border-red-300/40 text-red-500 hover:bg-red-50/20 font-serif text-sm" onClick={() => setShowDeleteConfirm(true)}>
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-foreground/60 font-serif hidden sm:inline">Are you sure?</span>
                    <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white border-0 gap-1 font-serif text-xs" onClick={handleDelete} disabled={isDeleting}>
                      {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                      Confirm
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setShowDeleteConfirm(false)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {isAdmin && isEditing && (
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="gap-1.5 glass-card border-white/30 hover:bg-white/10 font-serif text-sm" onClick={() => setIsEditing(false)}>
                  <X className="h-3.5 w-3.5" />
                  Cancel
                </Button>
                <Button size="sm" className="gap-1.5 neon-gradient-bg text-white border-0 font-serif text-sm" onClick={handleSaveEdit} disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  Save
                </Button>
              </div>
            )}
          </motion.div>

          <div className="grid min-w-0 grid-cols-1 gap-4 sm:gap-8 lg:grid-cols-2">
            {/* Left — Media Gallery */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="min-w-0 space-y-3">
              {isEditing ? (
                <GlassCard className="p-3 sm:p-4">
                  <h2 className="font-serif text-base font-semibold mb-3">Images & Videos</h2>
                  <MediaUpload
                    items={editForm.mediaItems || []}
                    onChange={(items) => setEditForm((f) => ({ ...f, mediaItems: items }))}
                  />
                </GlassCard>
              ) : (
                <>
                  <GlassCard className="overflow-hidden">
                    <motion.div
                      className="relative aspect-[4/3] touch-pan-y"
                      drag={hasMultiple && !isPlayingVideo ? 'x' : false}
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={0.12}
                      onDragEnd={handleGalleryDragEnd}
                    >
                      <AnimatePresence mode="wait">
                        {media.length > 0 ? (
                          isYoutube && ytId ? (
                            <div className="absolute inset-0">
                              {isPlayingVideo ? (
                                <iframe
                                  src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
                                  className="absolute inset-0 w-full h-full"
                                  allow="autoplay; encrypted-media"
                                  allowFullScreen
                                />
                              ) : (
                                <div className="absolute inset-0 cursor-pointer" onClick={() => setIsPlayingVideo(true)}>
                                  <Image src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt={listing.title} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" priority />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/10 transition-colors">
                                    <div className="h-20 w-20 rounded-full bg-red-600 flex items-center justify-center shadow-2xl">
                                      <Play className="h-9 w-9 text-white fill-white ml-1" />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <motion.div
                              key={currentIndex}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 cursor-zoom-in"
                              onClick={openLightbox}
                            >
                              <Image
                                src={currentItem.image_url}
                                alt={listing.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                priority
                                placeholder="blur"
                                blurDataURL="data:image/webp;base64,UklGRlYAAABXRUJQVlA4IEoAAADQAQCdASoIAAYAAkA4JYgCdAEO/hPMAA"
                              />
                            </motion.div>
                          )
                        ) : (
                          <div className="absolute inset-0 neon-gradient-bg opacity-10 flex items-center justify-center">
                            <span className="font-serif text-5xl text-foreground/20">PC</span>
                          </div>
                        )}
                      </AnimatePresence>

                      {hasMultiple && (
                        <>
                          <button
                            onClick={showPreviousMedia}
                            aria-label="Previous image"
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors z-10"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>
                          <button
                            onClick={showNextMedia}
                            aria-label="Next image"
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors z-10"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </>
                      )}

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleLike}
                        aria-label={liked ? 'Unlike this PC' : 'Like this PC'}
                        className={cn(
                          'absolute right-3 top-3 z-20 h-9 w-9 rounded-full border border-white/70 bg-white/90 text-foreground/70 shadow-sm backdrop-blur-md transition-all hover:bg-white',
                          liked && 'border-red-200/70 bg-red-50/95 text-red-500'
                        )}
                      >
                        <Heart className={cn('h-4 w-4', liked && 'fill-current')} />
                      </Button>
                    </motion.div>
                  </GlassCard>

                  {media.length > 1 && (
                    <div className="flex max-w-full gap-2 overflow-x-auto pb-2">
                      {media.map((item, index) => {
                        const thumbYtId = item.media_type === 'youtube' ? getYoutubeId(item.image_url) : null
                        return (
                          <button
                            key={item.id}
                            onClick={() => { setCurrentIndex(index); setIsPlayingVideo(false) }}
                            className={cn(
                              'relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden transition-all',
                              index === currentIndex ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : 'opacity-60 hover:opacity-100'
                            )}
                          >
                            {thumbYtId ? (
                              <>
                                <Image src={`https://img.youtube.com/vi/${thumbYtId}/mqdefault.jpg`} alt="video" fill className="object-cover" sizes="80px" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                  <div className="h-6 w-6 rounded-full bg-red-600 flex items-center justify-center">
                                    <Play className="h-3 w-3 text-white fill-white ml-0.5" />
                                  </div>
                                </div>
                              </>
                            ) : (
                              <Image src={item.image_url} alt={`${listing.title} ${index + 1}`} fill className="object-cover" sizes="80px" loading="lazy" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </>
              )}
            </motion.div>

            {/* Right — Details */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="min-w-0 space-y-3 sm:space-y-6">
              {/* Title, Price & Actions */}
              <GlassCard className="p-4 sm:p-6">
                {isEditing ? (
                  <div className="space-y-3 mb-4">
                    <Input
                      value={editForm.title ?? ''}
                      onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                      placeholder="Title"
                      className="glass-card border-white/30 font-serif text-base font-semibold"
                    />
                    <Input
                      type="number"
                      value={editForm.price ?? ''}
                      onChange={(e) => setEditForm((f) => ({ ...f, price: parseFloat(e.target.value) }))}
                      placeholder="Price"
                      className="glass-card border-white/30 font-serif"
                    />
                    <Input
                      value={editForm.facebook_url ?? ''}
                      onChange={(e) => setEditForm((f) => ({ ...f, facebook_url: e.target.value }))}
                      placeholder="Facebook Marketplace URL"
                      className="glass-card border-white/30 font-serif"
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex min-w-0 items-start justify-between gap-3 mb-3">
                      <h1 className="min-w-0 flex-1 break-words font-serif text-xl sm:text-2xl lg:text-3xl font-bold leading-tight">{listing.title}</h1>
                    </div>
                    <div className="font-serif text-2xl sm:text-3xl font-bold neon-gradient-text mb-4">
                      {formatPrice(Number(listing.price))}
                    </div>
                    <div className="mb-4 flex items-center gap-2 text-sm text-foreground/55">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>
                        Based in {listing.location_city || 'Marietta'}, GA {listing.location_zip || '30067'}
                        {listing.is_mobile ? ' • mobile' : ''}
                      </span>
                    </div>
                    <div className="mb-4 flex items-center gap-2 rounded-2xl border border-emerald-200/60 bg-emerald-50/70 px-3 py-2 text-sm font-serif text-emerald-700">
                      <ShieldCheck className="h-4 w-4 shrink-0" />
                      <span>Includes a 7 day warranty</span>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                      {listing.facebook_url && (
                        <a href={listing.facebook_url} target="_blank" rel="noopener noreferrer">
                          <Button className="h-12 w-full border-0 neon-gradient-bg font-serif text-base text-white shadow-lg shadow-purple-200/40 transition-shadow hover:shadow-purple-300/50">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Message Seller
                          </Button>
                        </a>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleShare}
                        className="h-12 glass-card border-white/30 font-serif text-foreground hover:bg-white/55 hover:text-foreground"
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                    {listing.likes_count > 0 && (
                      <p className="text-xs sm:text-sm text-foreground/50 mt-3 font-serif">
                        {listing.likes_count} {listing.likes_count === 1 ? 'person likes' : 'people like'} this
                      </p>
                    )}
                  </>
                )}
              </GlassCard>

              {/* Specs */}
              <GlassCard className="p-4 sm:p-6">
                <h2 className="font-serif text-xl font-bold mb-4 sm:text-2xl">Specifications</h2>
                {isEditing ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {specFields.map(({ key, label }) => (
                      <div key={key}>
                        <label className="text-xs text-foreground/50 font-serif mb-1 block">{label}</label>
                        <Input
                          value={(editForm[key] as string) ?? ''}
                          onChange={(e) => setEditForm((f) => ({ ...f, [key]: e.target.value }))}
                          placeholder={label}
                          className="glass-card border-white/30 font-serif"
                        />
                      </div>
                    ))}
                  </div>
                ) : specs.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {specs.map(({ key, label, icon: Icon, accent }) => (
                      <div
                        key={label}
                        className="flex items-center gap-3 rounded-2xl border border-white/40 bg-white/40 p-3.5"
                      >
                        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm', accent)}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-wide text-foreground/45">{label}</p>
                          <p className="break-words font-serif text-base font-semibold leading-tight text-foreground">{listing[key]}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-foreground/40 font-serif text-sm">No specs listed</p>
                )}
              </GlassCard>

              {/* Description */}
              {(listing.description || isEditing) && (
                <GlassCard className="p-4 sm:p-6">
                  <h2 className="font-serif text-base sm:text-lg font-semibold mb-3 sm:mb-4">Description</h2>
                  {isEditing ? (
                    <Textarea
                      value={editForm.description ?? ''}
                      onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                      placeholder="Description"
                      rows={5}
                      className="glass-card border-white/30 font-serif resize-none"
                    />
                  ) : (
                    <p className="text-sm sm:text-base text-foreground/70 font-serif whitespace-pre-wrap leading-relaxed">{listing.description}</p>
                  )}
                </GlassCard>
              )}
            </motion.div>
          </div>

          {!isEditing && relatedListings.length > 0 && (
            <section className="mt-8 sm:mt-12">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="font-serif text-2xl font-bold">Related PCs</h2>
                <Link href="/browse" className="font-serif text-sm font-semibold text-primary hover:underline">
                  View all
                </Link>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {relatedListings.map((item) => (
                  <ListingCard key={item.id} listing={item} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <AnimatePresence>
        {isLightboxOpen && currentItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 text-white"
          >
            <button
              type="button"
              onClick={closeLightbox}
              aria-label="Close full screen image"
              className="absolute right-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-white/12 text-white backdrop-blur-md transition-colors hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </button>

            {media.length > 1 && (
              <div className="absolute left-4 top-4 z-30 rounded-full bg-white/12 px-3 py-1.5 font-serif text-sm text-white backdrop-blur-md">
                {currentIndex + 1} / {media.length}
              </div>
            )}

            <motion.div
              className="flex h-full w-full touch-none items-center justify-center overflow-hidden px-2 py-16 sm:px-12"
              drag={lightboxZoom > 1.05 ? true : hasMultiple ? 'x' : false}
              dragConstraints={lightboxZoom > 1.05 ? undefined : { left: 0, right: 0 }}
              dragElastic={lightboxZoom > 1.05 ? 0.08 : 0.14}
              dragMomentum={false}
              onDragEnd={handleLightboxDragEnd}
              onTouchStart={handleLightboxTouchStart}
              onTouchMove={handleLightboxTouchMove}
              onTouchEnd={() => { pinchDistanceRef.current = null }}
              onWheel={handleLightboxWheel}
              onDoubleClick={() => setLightboxZoom((zoom) => zoom > 1 ? 1 : 2)}
            >
              {currentItem.media_type === 'youtube' && ytId ? (
                <div className="relative aspect-video w-full max-w-5xl overflow-hidden rounded-2xl bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
                    className="absolute inset-0 h-full w-full"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                </div>
              ) : (
                <motion.div
                  key={currentItem.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, scale: lightboxZoom }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className={cn(
                    'relative h-full max-h-[calc(100svh-8rem)] w-full max-w-6xl',
                    lightboxZoom > 1.05 ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'
                  )}
                >
                  <Image
                    src={currentItem.image_url}
                    alt={listing.title}
                    fill
                    className="object-contain"
                    sizes="100vw"
                    priority
                  />
                </motion.div>
              )}
            </motion.div>

            {hasMultiple && (
              <>
                <button
                  type="button"
                  onClick={showPreviousMedia}
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 z-30 hidden -translate-y-1/2 rounded-full bg-white/12 p-3 text-white backdrop-blur-md transition-colors hover:bg-white/20 sm:block"
                >
                  <ChevronLeft className="h-7 w-7" />
                </button>
                <button
                  type="button"
                  onClick={showNextMedia}
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 z-30 hidden -translate-y-1/2 rounded-full bg-white/12 p-3 text-white backdrop-blur-md transition-colors hover:bg-white/20 sm:block"
                >
                  <ChevronRight className="h-7 w-7" />
                </button>
                <div className="absolute bottom-5 left-1/2 z-30 flex max-w-[80vw] -translate-x-1/2 gap-1.5 overflow-hidden">
                  {media.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => { setCurrentIndex(index); setLightboxZoom(1); setIsPlayingVideo(false) }}
                      aria-label={`View image ${index + 1}`}
                      className={cn(
                        'h-1.5 rounded-full transition-all',
                        index === currentIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/45 hover:bg-white/75'
                      )}
                    />
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!isEditing && listing.facebook_url && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/60 bg-white/85 px-3 py-3 shadow-[0_-12px_40px_rgba(80,55,140,0.12)] backdrop-blur-xl md:hidden">
          <div className="mx-auto flex max-w-6xl items-center gap-3">
            <p className="min-w-0 flex-1 font-serif text-lg font-bold text-foreground">{formatPrice(Number(listing.price))}</p>
            <a href={listing.facebook_url} target="_blank" rel="noopener noreferrer" className="shrink-0">
              <Button className="h-11 border-0 neon-gradient-bg px-5 font-serif text-sm text-white">
                <MessageCircle className="mr-2 h-4 w-4" />
                Message Seller
              </Button>
            </a>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
