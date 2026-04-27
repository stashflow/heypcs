'use client'

import { useCallback, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Upload, X, ImageIcon, Loader2, GripVertical } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
}

export function ImageUpload({ images, onChange, maxImages = 6 }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Upload failed')
      }

      const data = await res.json()
      return data.url
    } catch (error) {
      console.error('Upload error:', error)
      return null
    }
  }

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files)
      const remainingSlots = maxImages - images.length
      const filesToUpload = fileArray.slice(0, remainingSlots)

      if (filesToUpload.length === 0) {
        toast.error(`Maximum ${maxImages} images allowed`)
        return
      }

      setIsUploading(true)
      const uploadedUrls: string[] = []

      for (const file of filesToUpload) {
        const url = await uploadFile(file)
        if (url) {
          uploadedUrls.push(url)
        }
      }

      if (uploadedUrls.length > 0) {
        onChange([...images, ...uploadedUrls])
        toast.success(`${uploadedUrls.length} image(s) uploaded`)
      }

      if (uploadedUrls.length < filesToUpload.length) {
        toast.error('Some images failed to upload')
      }

      setIsUploading(false)
    },
    [images, maxImages, onChange]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles]
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <GlassCard
        className={cn(
          'border-2 border-dashed transition-colors cursor-pointer',
          isDragging ? 'border-primary bg-primary/5' : 'border-white/20 hover:border-white/40',
          isUploading && 'pointer-events-none opacity-60'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <label className="flex flex-col items-center justify-center p-8 cursor-pointer">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="hidden"
            disabled={isUploading}
          />
          
          {isUploading ? (
            <>
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-3" />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </>
          ) : (
            <>
              <div className="h-14 w-14 rounded-full neon-gradient-bg flex items-center justify-center mb-4">
                <Upload className="h-6 w-6 text-white" />
              </div>
              <p className="font-medium text-foreground">Drop images here or click to upload</p>
              <p className="text-sm text-muted-foreground mt-1">
                PNG, JPG, WebP up to 5MB ({images.length}/{maxImages})
              </p>
            </>
          )}
        </label>
      </GlassCard>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <Reorder.Group
          axis="x"
          values={images}
          onReorder={onChange}
          className="flex flex-wrap gap-3"
        >
          <AnimatePresence>
            {images.map((url, index) => (
              <Reorder.Item
                key={url}
                value={url}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <div className="relative group">
                  <GlassCard className="overflow-hidden w-24 h-24 cursor-grab active:cursor-grabbing">
                    <Image
                      src={url}
                      alt={`Upload ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <GripVertical className="h-5 w-5 text-white" />
                    </div>
                    
                    {/* First image badge */}
                    {index === 0 && (
                      <div className="absolute bottom-1 left-1 px-1.5 py-0.5 text-[10px] font-medium bg-primary text-white rounded">
                        Cover
                      </div>
                    )}
                  </GlassCard>

                  {/* Remove Button */}
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>
      )}

      {images.length === 0 && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <ImageIcon className="h-4 w-4" />
          <span>No images uploaded yet</span>
        </div>
      )}
    </div>
  )
}
