'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/navbar'
import { GradientBlobs } from '@/components/ui/gradient-blobs'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Footer } from '@/components/footer'
import { MediaUpload, type MediaItem } from '@/components/image-upload'
import { SpecInput } from '@/components/spec-input'
import { useAuth } from '@/components/providers/auth-provider'
import { ADMIN_EMAIL } from '@/lib/constants'
import { Loader2, DollarSign, Link as LinkIcon } from 'lucide-react'
import { toast } from 'sonner'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function SellPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [media, setMedia] = useState<MediaItem[]>([])
  const { data: specsData } = useSWR('/api/listings/specs', fetcher)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    cpu: '',
    gpu: '',
    ram: '',
    storage: '',
    os: '',
    facebook_url: '',
    location_city: 'Marietta',
    location_zip: '30067',
    is_mobile: true,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = type === 'checkbox' && 'checked' in e.target ? e.target.checked : undefined
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) { toast.error('Please enter a title'); return }
    if (!formData.price || parseFloat(formData.price) <= 0) { toast.error('Please enter a valid price'); return }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          images: media.map((m) => ({ url: m.url, type: m.type })),
        }),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed to create listing') }
      const data = await res.json()
      toast.success('Listing created!')
      router.push(`/${data.listing.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create listing')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()

  if (authLoading) {
    return (
      <div className="min-h-screen relative">
        <GradientBlobs /><Navbar />
        <main className="py-8 px-4">
          <div className="max-w-3xl mx-auto flex items-center justify-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen relative">
        <GradientBlobs /><Navbar />
        <main className="py-8 px-4 flex items-center justify-center min-h-[70vh]">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
            <GlassCard className="p-12">
              <p className="font-serif text-5xl font-bold neon-gradient-text mb-4">404</p>
              <h1 className="font-serif text-2xl font-semibold mb-3">Page not found</h1>
              <p className="text-foreground/50 mb-8 text-sm leading-relaxed">
                This page doesn&apos;t exist or you don&apos;t have access to it.
              </p>
              <Button onClick={() => router.push('/browse')} className="neon-gradient-bg text-white border-0 font-serif">Browse PCs</Button>
            </GlassCard>
          </motion.div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      <GradientBlobs />
      <Navbar />
      <main className="py-4 sm:py-8 px-3 sm:px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6 sm:mb-10">
            <h1 className="font-serif text-2xl sm:text-4xl font-bold mb-3">
              Create a <span className="neon-gradient-text">Listing</span>
            </h1>
            <p className="text-foreground/50 font-serif">Add a new PC build to the marketplace</p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="space-y-8"
          >
            {/* Media */}
            <GlassCard className="p-6">
              <h2 className="font-serif text-lg font-semibold mb-4">Images & Videos</h2>
              <MediaUpload items={media} onChange={setMedia} />
            </GlassCard>

            {/* Basic Info */}
            <GlassCard className="p-6">
              <h2 className="font-serif text-lg font-semibold mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="font-serif">Title *</Label>
                  <Input id="title" name="title" placeholder="e.g., RTX 4090 Ultimate Gaming Build" value={formData.title} onChange={handleInputChange} className="glass-card border-white/20 font-serif" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="font-serif">Description</Label>
                  <Textarea id="description" name="description" placeholder="Describe the build, condition, included accessories..." value={formData.description} onChange={handleInputChange} rows={4} className="glass-card border-white/20 resize-none font-serif" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price" className="font-serif">Price (USD) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
                    <Input id="price" name="price" type="number" placeholder="0" min="0" step="1" value={formData.price} onChange={handleInputChange} className="pl-10 glass-card border-white/20 font-serif" required />
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Specs */}
            <GlassCard className="p-6">
              <h2 className="font-serif text-lg font-semibold mb-4">Specifications</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpu" className="font-serif">CPU</Label>
                  <SpecInput
                    id="cpu" name="cpu"
                    value={formData.cpu}
                    onChange={(v) => setFormData((p) => ({ ...p, cpu: v }))}
                    suggestions={specsData?.cpus ?? []}
                    placeholder="e.g., Intel Core i9-14900K"
                    className="glass-card border-white/20 font-serif"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gpu" className="font-serif">GPU</Label>
                  <SpecInput
                    id="gpu" name="gpu"
                    value={formData.gpu}
                    onChange={(v) => setFormData((p) => ({ ...p, gpu: v }))}
                    suggestions={specsData?.gpus ?? []}
                    placeholder="e.g., NVIDIA RTX 4090"
                    className="glass-card border-white/20 font-serif"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ram" className="font-serif">RAM</Label>
                  <SpecInput
                    id="ram" name="ram"
                    value={formData.ram}
                    onChange={(v) => setFormData((p) => ({ ...p, ram: v }))}
                    suggestions={specsData?.rams ?? []}
                    placeholder="e.g., 64GB DDR5"
                    className="glass-card border-white/20 font-serif"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storage" className="font-serif">Storage</Label>
                  <Input
                    id="storage" name="storage"
                    placeholder="e.g., 2TB NVMe SSD"
                    value={formData.storage}
                    onChange={handleInputChange}
                    className="glass-card border-white/20 font-serif"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="os" className="font-serif">Operating System</Label>
                  <Input
                    id="os" name="os"
                    placeholder="e.g., Windows 11 Pro"
                    value={formData.os}
                    onChange={handleInputChange}
                    className="glass-card border-white/20 font-serif"
                  />
                </div>
              </div>
            </GlassCard>

            {/* External Link */}
            <GlassCard className="p-6">
              <h2 className="font-serif text-lg font-semibold mb-4">External Link</h2>
              <div className="space-y-2">
                <Label htmlFor="facebook_url" className="font-serif">Facebook Marketplace URL</Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
                  <Input id="facebook_url" name="facebook_url" type="url" placeholder="https://www.facebook.com/marketplace/item/..." value={formData.facebook_url} onChange={handleInputChange} className="pl-10 glass-card border-white/20 font-serif" />
                </div>
              </div>
              <div className="grid gap-4 pt-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location_city" className="font-serif">Location</Label>
                  <Input id="location_city" name="location_city" value={formData.location_city} onChange={handleInputChange} className="glass-card border-white/20 font-serif" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location_zip" className="font-serif">ZIP</Label>
                  <Input id="location_zip" name="location_zip" value={formData.location_zip} onChange={handleInputChange} className="glass-card border-white/20 font-serif" />
                </div>
              </div>
              <label className="flex items-center gap-2 pt-2 font-serif text-sm text-foreground/70">
                <input
                  type="checkbox"
                  name="is_mobile"
                  checked={formData.is_mobile}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-white/30"
                />
                Mobile around Marietta / 30067
              </label>
            </GlassCard>

            <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-base neon-gradient-bg text-white border-0 font-serif">
              {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Creating...</> : 'Create Listing'}
            </Button>
          </motion.form>
        </div>
      </main>
      <Footer />
    </div>
  )
}
