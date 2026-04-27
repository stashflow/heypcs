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
import { useAuth } from '@/components/providers/auth-provider'
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLiking, setIsLiking] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editForm, setEditForm] = useState<Partial<ListingWithImages>>({})

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()

  const { data, isLoading, mutate } = useSWR<{ listing: ListingWithImages }>(
    `/api/listings/${id}`,
    fetcher,
    {
      onSuccess: (data) => {
        if (data?.listing && !isEditing) {
          setEditForm(data.listing)
        }
      },
    }
  )

  const listing = data?.listing
  const images = listing?.images || []
  const hasMultipleImages = images.length > 1

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)

  const handleLike = async () => {
    if (!user) { toast.error('Please sign in to like listings'); return }
    setIsLiking(true)
    try {
      const res = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: listing?.id }),
      })
      if (res.ok) { mutate(); toast.success(listing?.is_liked ? 'Removed from likes' : 'Added to likes') }
    } catch { toast.error('Failed to update like') }
    finally { setIsLiking(false) }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/listings/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Listing deleted')
        router.push('/browse')
      } else {
        toast.error('Failed to delete listing')
      }
    } catch { toast.error('Failed to delete listing') }
    finally { setIsDeleting(false); setShowDeleteConfirm(false) }
  }

  const handleSaveEdit = async () => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })
      if (res.ok) {
        await mutate()
        setIsEditing(false)
        toast.success('Listing updated')
      } else {
        toast.error('Failed to save changes')
      }
    } catch { toast.error('Failed to save changes') }
    finally { setIsSaving(false) }
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
            <Link href="/browse">
              <Button className="neon-gradient-bg text-white border-0">Browse PCs</Button>
            </Link>
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
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6 flex items-center justify-between"
          >
            <Link href="/browse">
              <Button variant="ghost" className="gap-2 font-serif">
                <ArrowLeft className="h-4 w-4" />
                Back to Browse
              </Button>
            </Link>

            {isAdmin && !isEditing && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="gap-2 glass-card border-white/30 hover:bg-white/10 font-serif"
                  onClick={() => { setEditForm(listing); setIsEditing(true) }}
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
                {!showDeleteConfirm ? (
                  <Button
                    variant="outline"
                    className="gap-2 glass-card border-red-300/40 text-red-500 hover:bg-red-50/20 font-serif"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground/60 font-serif">Are you sure?</span>
                    <Button
                      size="sm"
                      className="bg-red-500 hover:bg-red-600 text-white border-0 gap-1 font-serif"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                      Delete
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {isAdmin && isEditing && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="gap-2 glass-card border-white/30 hover:bg-white/10 font-serif"
                  onClick={() => setIsEditing(false)}
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  className="gap-2 neon-gradient-bg text-white border-0 font-serif"
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Save
                </Button>
              </div>
            )}
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left — Image Gallery */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
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
                      <div className="absolute inset-0 neon-gradient-bg opacity-10 flex items-center justify-center">
                        <span className="font-serif text-5xl text-foreground/20">PC</span>
                      </div>
                    )}
                  </AnimatePresence>

                  {hasMultipleImages && (
                    <>
                      <button
                        onClick={() => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>
              </GlassCard>

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
                      <Image src={image.image_url} alt={`${listing.title} ${index + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Right — Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
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
                      className="glass-card border-white/30"
                    />
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <h1 className="font-serif text-2xl sm:text-3xl font-bold">{listing.title}</h1>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleLike}
                      disabled={isLiking}
                      className={cn('h-10 w-10 rounded-full flex-shrink-0', listing.is_liked && 'bg-red-500/10 text-red-500')}
                    >
                      <Heart className={cn('h-5 w-5', listing.is_liked && 'fill-current')} />
                    </Button>
                  </div>
                )}

                {!isEditing && (
                  <div className="font-serif text-3xl font-bold neon-gradient-text mb-6">
                    {formatPrice(Number(listing.price))}
                  </div>
                )}

                {/* Facebook link */}
                {isEditing ? (
                  <Input
                    value={editForm.facebook_url ?? ''}
                    onChange={(e) => setEditForm((f) => ({ ...f, facebook_url: e.target.value }))}
                    placeholder="Facebook Marketplace URL"
                    className="glass-card border-white/30"
                  />
                ) : listing.facebook_url ? (
                  <a href={listing.facebook_url} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full neon-gradient-bg text-white border-0 h-12 font-serif">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View on Facebook Marketplace
                    </Button>
                  </a>
                ) : null}

                {!isEditing && listing.like_count !== undefined && Number(listing.like_count) > 0 && (
                  <p className="text-sm text-foreground/50 mt-4 font-serif">
                    {listing.like_count} {Number(listing.like_count) === 1 ? 'person' : 'people'} liked this
                  </p>
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
                          className="glass-card border-white/30"
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
                    <p className="text-foreground/70 font-serif whitespace-pre-wrap leading-relaxed">
                      {listing.description}
                    </p>
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
