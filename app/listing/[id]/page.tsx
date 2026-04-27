'use client'

import { useState, use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Navbar } from '@/components/navbar'
import { GradientBlobs } from '@/components/ui/gradient-blobs'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Footer } from '@/components/footer'
import { MediaUpload, type MediaItem, getYoutubeId } from '@/components/image-upload'
import { useAuth } from '@/components/providers/auth-provider'
import { useLikes } from '@/hooks/use-likes'
import { ADMIN_EMAIL } from '@/lib/constants'
import {
  Heart,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ArrowLeft,
  Loader2,
  Pencil,
  Trash2,
  X,
  Check,
  Play,
} from 'lucide-react'
import useSWR from 'swr'
import { type ListingWithImages } from '@/lib/db'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
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

  const listing = data?.listing
  const media = listing?.images || []
  const hasMultiple = media.length > 1
  const liked = listing ? isLiked(listing.id) : false
  const currentItem = media[currentIndex]
  const isYoutube = currentItem?.media_type === 'youtube'
  const ytId = isYoutube ? getYoutubeId(currentItem.image_url) : null

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)

  const handleLike = async () => {
    if (!listing) return
    await toggleLike(listing.id)
    mutate()
  }

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
    { key: 'cpu', label: 'CPU' },
    { key: 'gpu', label: 'GPU' },
    { key: 'ram', label: 'RAM' },
    { key: 'storage', label: 'Storage' },
    { key: 'os', label: 'OS' },
  ] as const

  const specs = specFields.filter((s) => listing[s.key])

  return (
    <div className="min-h-screen relative">
      <GradientBlobs />
      <Navbar />

      <main className="py-8 px-4">
        <div className="max-w-6xl mx-auto">

          {/* Back + Admin Controls */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-6 flex items-center justify-between flex-wrap gap-3">
            <Link href="/browse">
              <Button variant="ghost" className="gap-2 font-serif">
                <ArrowLeft className="h-4 w-4" />
                Back to Browse
              </Button>
            </Link>

            {isAdmin && !isEditing && (
              <div className="flex items-center gap-2">
                <Button variant="outline" className="gap-2 glass-card border-white/30 hover:bg-white/10 font-serif" onClick={handleStartEdit}>
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
                {!showDeleteConfirm ? (
                  <Button variant="outline" className="gap-2 glass-card border-red-300/40 text-red-500 hover:bg-red-50/20 font-serif" onClick={() => setShowDeleteConfirm(true)}>
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground/60 font-serif">Are you sure?</span>
                    <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white border-0 gap-1 font-serif" onClick={handleDelete} disabled={isDeleting}>
                      {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                      Delete
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowDeleteConfirm(false)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {isAdmin && isEditing && (
              <div className="flex items-center gap-2">
                <Button variant="outline" className="gap-2 glass-card border-white/30 hover:bg-white/10 font-serif" onClick={() => setIsEditing(false)}>
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button className="gap-2 neon-gradient-bg text-white border-0 font-serif" onClick={handleSaveEdit} disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Save
                </Button>
              </div>
            )}
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left — Media Gallery */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {isEditing ? (
                <GlassCard className="p-4">
                  <h2 className="font-serif text-base font-semibold mb-3">Images & Videos</h2>
                  <MediaUpload
                    items={editForm.mediaItems || []}
                    onChange={(items) => setEditForm((f) => ({ ...f, mediaItems: items }))}
                  />
                </GlassCard>
              ) : (
                <>
                  <GlassCard className="overflow-hidden">
                    <div className="relative aspect-[4/3]">
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
                                  <Image src={`https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`} alt={listing.title} fill className="object-cover" />
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
                              className="absolute inset-0"
                            >
                              <Image src={currentItem.image_url} alt={listing.title} fill className="object-cover" />
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
                            onClick={() => { setCurrentIndex((i) => (i - 1 + media.length) % media.length); setIsPlayingVideo(false) }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors z-10"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => { setCurrentIndex((i) => (i + 1) % media.length); setIsPlayingVideo(false) }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors z-10"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </GlassCard>

                  {media.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
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
                                <Image src={`https://img.youtube.com/vi/${thumbYtId}/hqdefault.jpg`} alt="video" fill className="object-cover" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                  <div className="h-6 w-6 rounded-full bg-red-600 flex items-center justify-center">
                                    <Play className="h-3 w-3 text-white fill-white ml-0.5" />
                                  </div>
                                </div>
                              </>
                            ) : (
                              <Image src={item.image_url} alt={`${listing.title} ${index + 1}`} fill className="object-cover" />
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
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-6">
              {/* Title, Price & Actions */}
              <GlassCard className="p-6">
                {isEditing ? (
                  <div className="space-y-3 mb-4">
                    <Input
                      value={editForm.title ?? ''}
                      onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                      placeholder="Title"
                      className="glass-card border-white/30 font-serif text-lg font-semibold"
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
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <h1 className="font-serif text-2xl sm:text-3xl font-bold">{listing.title}</h1>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleLike}
                        className={cn('h-10 w-10 rounded-full flex-shrink-0', liked && 'bg-red-500/10 text-red-500')}
                      >
                        <Heart className={cn('h-5 w-5', liked && 'fill-current')} />
                      </Button>
                    </div>
                    <div className="font-serif text-3xl font-bold neon-gradient-text mb-6">
                      {formatPrice(Number(listing.price))}
                    </div>
                    {listing.facebook_url && (
                      <a href={listing.facebook_url} target="_blank" rel="noopener noreferrer">
                        <Button className="w-full neon-gradient-bg text-white border-0 h-12 font-serif">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View on Facebook Marketplace
                        </Button>
                      </a>
                    )}
                    {listing.likes_count > 0 && (
                      <p className="text-sm text-foreground/50 mt-4 font-serif">
                        {listing.likes_count} {listing.likes_count === 1 ? 'person likes' : 'people like'} this
                      </p>
                    )}
                  </>
                )}
              </GlassCard>

              {/* Specs */}
              <GlassCard className="p-6">
                <h2 className="font-serif text-lg font-semibold mb-4">Specifications</h2>
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {specs.map(({ key, label }) => (
                      <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-white/30 border border-white/20">
                        <div className="min-w-0">
                          <p className="text-xs text-foreground/50 font-serif">{label}</p>
                          <p className="font-serif font-medium truncate">{listing[key]}</p>
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
                <GlassCard className="p-6">
                  <h2 className="font-serif text-lg font-semibold mb-4">Description</h2>
                  {isEditing ? (
                    <Textarea
                      value={editForm.description ?? ''}
                      onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                      placeholder="Description"
                      rows={5}
                      className="glass-card border-white/30 font-serif resize-none"
                    />
                  ) : (
                    <p className="text-foreground/70 font-serif whitespace-pre-wrap leading-relaxed">{listing.description}</p>
                  )}
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
