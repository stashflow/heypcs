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
import { ImageUpload } from '@/components/image-upload'
import { useAuth } from '@/components/providers/auth-provider'
import { ADMIN_EMAIL } from '@/lib/constants'
import {
  Loader2,
  DollarSign,
  Cpu,
  Tv,
  MemoryStick,
  HardDrive,
  Monitor,
  Link as LinkIcon,
} from 'lucide-react'
import { toast } from 'sonner'

const ADMIN = ADMIN_EMAIL

export default function SellPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [images, setImages] = useState<string[]>([])
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
  })

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast.error('Please enter a title')
      return
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Please enter a valid price')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          images,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create listing')
      }

      const data = await res.json()
      toast.success('Listing created successfully!')
      router.push(`/listing/${data.listing.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create listing')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isAdmin = user?.email?.toLowerCase() === ADMIN.toLowerCase()

  if (authLoading) {
    return (
      <div className="min-h-screen relative">
        <GradientBlobs />
        <Navbar />
        <main className="py-8 px-4">
          <div className="max-w-3xl mx-auto flex items-center justify-center py-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    )
  }

  // Non-admin users (or logged-out) see a 404-style block
  if (!authLoading && (!user || !isAdmin)) {
    return (
      <div className="min-h-screen relative">
        <GradientBlobs />
        <Navbar />
        <main className="py-8 px-4 flex items-center justify-center min-h-[70vh]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md"
          >
            <GlassCard className="p-12">
              <p className="font-serif text-5xl font-bold neon-gradient-text mb-4">404</p>
              <h1 className="font-serif text-2xl font-semibold mb-3">Page not found</h1>
              <p className="text-foreground/50 mb-8 text-sm leading-relaxed">
                This page doesn&apos;t exist or you don&apos;t have access to it.
              </p>
              <Button
                onClick={() => router.push('/browse')}
                className="neon-gradient-bg text-white border-0 font-serif"
              >
                Browse PCs
              </Button>
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

      <main className="py-8 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">
              Sell Your <span className="neon-gradient-text">PC</span>
            </h1>
            <p className="text-muted-foreground">
              List your custom build and reach thousands of potential buyers
            </p>
          </motion.div>



          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSubmit}
            className="space-y-8"
          >
            {/* Images */}
            <GlassCard className="p-6">
              <h2 className="text-lg font-semibold mb-4">Images</h2>
              <ImageUpload images={images} onChange={setImages} />
            </GlassCard>

            {/* Basic Info */}
            <GlassCard className="p-6">
              <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g., High-End Gaming PC - RTX 4090 Build"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="glass-card border-white/20"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe your PC build, its condition, and any other relevant details..."
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="glass-card border-white/20 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price (USD) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      placeholder="0"
                      min="0"
                      step="1"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="pl-10 glass-card border-white/20"
                      required
                    />
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Specs */}
            <GlassCard className="p-6">
              <h2 className="text-lg font-semibold mb-4">Specifications</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cpu">CPU</Label>
                  <div className="relative">
                    <Cpu className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="cpu"
                      name="cpu"
                      placeholder="e.g., Intel Core i9-14900K"
                      value={formData.cpu}
                      onChange={handleInputChange}
                      className="pl-10 glass-card border-white/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gpu">GPU</Label>
                  <div className="relative">
                    <Tv className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="gpu"
                      name="gpu"
                      placeholder="e.g., NVIDIA RTX 4090"
                      value={formData.gpu}
                      onChange={handleInputChange}
                      className="pl-10 glass-card border-white/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ram">RAM</Label>
                  <div className="relative">
                    <MemoryStick className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="ram"
                      name="ram"
                      placeholder="e.g., 64GB DDR5"
                      value={formData.ram}
                      onChange={handleInputChange}
                      className="pl-10 glass-card border-white/20"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storage">Storage</Label>
                  <div className="relative">
                    <HardDrive className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="storage"
                      name="storage"
                      placeholder="e.g., 2TB NVMe SSD"
                      value={formData.storage}
                      onChange={handleInputChange}
                      className="pl-10 glass-card border-white/20"
                    />
                  </div>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="os">Operating System</Label>
                  <div className="relative">
                    <Monitor className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="os"
                      name="os"
                      placeholder="e.g., Windows 11 Pro"
                      value={formData.os}
                      onChange={handleInputChange}
                      className="pl-10 glass-card border-white/20"
                    />
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* External Link */}
            <GlassCard className="p-6">
              <h2 className="text-lg font-semibold mb-4">External Link</h2>
              <div className="space-y-2">
                <Label htmlFor="facebook_url">Facebook Marketplace URL</Label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="facebook_url"
                    name="facebook_url"
                    type="url"
                    placeholder="https://www.facebook.com/marketplace/item/..."
                    value={formData.facebook_url}
                    onChange={handleInputChange}
                    className="pl-10 glass-card border-white/20"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Link to your Facebook Marketplace listing for buyers to contact you
                </p>
              </div>
            </GlassCard>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 text-base neon-gradient-bg text-white border-0"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating Listing...
                </>
              ) : (
                'Create Listing'
              )}
            </Button>
          </motion.form>
        </div>
      </main>

      <Footer />
    </div>
  )
}
