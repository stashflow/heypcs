'use client'

import { useCallback, useState, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, X, ImageIcon, Loader2, GripVertical, Youtube, Play } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export type MediaItem = { url: string; type: 'image' | 'youtube' }

interface MediaUploadProps {
  items: MediaItem[]
  onChange: (items: MediaItem[]) => void
  maxItems?: number
}

function getYoutubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  return match ? match[1] : null
}

function YoutubeThumbnail({ url, isSelected }: { url: string; isSelected: boolean }) {
  const ytId = getYoutubeId(url)
  const [playing, setPlaying] = useState(false)

  if (!ytId) return <div className="absolute inset-0 bg-black flex items-center justify-center"><Youtube className="h-8 w-8 text-red-500" /></div>

  if (playing || isSelected) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`}
        className="absolute inset-0 w-full h-full"
        allow="autoplay; encrypted-media"
        allowFullScreen
      />
    )
  }

  return (
    <div className="absolute inset-0 group/yt" onMouseEnter={() => setPlaying(true)}>
      <Image
        src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
        alt="YouTube thumbnail"
        fill
        className="object-cover"
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover/yt:bg-black/10 transition-colors">
        <div className="h-14 w-14 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
          <Play className="h-6 w-6 text-white fill-white ml-1" />
        </div>
      </div>
    </div>
  )
}

export function MediaUpload({ items, onChange, maxItems = 8 }: MediaUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [youtubeInput, setYoutubeInput] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()
      return data.url
    } catch {
      return null
    }
  }

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const remaining = maxItems - items.length
    const toUpload = Array.from(files).slice(0, remaining)
    if (toUpload.length === 0) { toast.error(`Maximum ${maxItems} media items allowed`); return }
    setIsUploading(true)
    const uploaded: MediaItem[] = []
    for (const file of toUpload) {
      const url = await uploadFile(file)
      if (url) uploaded.push({ url, type: 'image' })
    }
    if (uploaded.length > 0) { onChange([...items, ...uploaded]); toast.success(`${uploaded.length} image(s) uploaded`) }
    if (uploaded.length < toUpload.length) toast.error('Some images failed to upload')
    setIsUploading(false)
  }, [items, maxItems, onChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const addYoutube = () => {
    const id = getYoutubeId(youtubeInput.trim())
    if (!id) { toast.error('Invalid YouTube URL'); return }
    if (items.length >= maxItems) { toast.error(`Maximum ${maxItems} media items`); return }
    const normalised = `https://www.youtube.com/watch?v=${id}`
    if (items.find(i => i.url === normalised)) { toast.error('Video already added'); return }
    onChange([...items, { url: normalised, type: 'youtube' }])
    setYoutubeInput('')
    toast.success('YouTube video added')
  }

  const remove = (index: number) => onChange(items.filter((_, i) => i !== index))
  const makeCover = (index: number) => {
    if (index === 0) return
    const next = [...items]
    const [cover] = next.splice(index, 1)
    onChange([cover, ...next])
    toast.success('Cover image updated')
  }

  return (
    <div className="space-y-4">
      {/* Image drop zone */}
      <GlassCard
        className={cn(
          'border-2 border-dashed transition-colors cursor-pointer',
          isDragging ? 'border-primary bg-primary/5' : 'border-white/20 hover:border-white/40',
          isUploading && 'pointer-events-none opacity-60'
        )}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
      >
        <label className="flex flex-col items-center justify-center p-8 cursor-pointer">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="hidden"
            disabled={isUploading}
          />
          {isUploading ? (
            <><Loader2 className="h-10 w-10 text-primary animate-spin mb-3" /><p className="text-sm text-foreground/60 font-serif">Uploading...</p></>
          ) : (
            <>
              <div className="h-14 w-14 rounded-full neon-gradient-bg flex items-center justify-center mb-4">
                <Upload className="h-6 w-6 text-white" />
              </div>
              <p className="font-serif font-medium text-foreground">Drop images here or click to upload</p>
              <p className="text-sm text-foreground/50 mt-1 font-serif">PNG, JPG, WebP ({items.length}/{maxItems})</p>
            </>
          )}
        </label>
      </GlassCard>

      {/* YouTube URL input */}
      <GlassCard className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Youtube className="h-4 w-4 text-red-500 shrink-0" />
          <span className="font-serif text-sm font-semibold">Add YouTube Benchmark Video</span>
        </div>
        <div className="flex gap-2">
          <Input
            value={youtubeInput}
            onChange={(e) => setYoutubeInput(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="glass-card border-white/20 font-serif text-sm"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addYoutube())}
          />
          <Button
            type="button"
            onClick={addYoutube}
            className="neon-gradient-bg text-white border-0 font-serif shrink-0"
          >
            Add
          </Button>
        </div>
        <p className="text-xs text-foreground/40 mt-2 font-serif">Videos auto-play on hover in listings</p>
      </GlassCard>

      {/* Media preview grid */}
      {items.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-foreground/45 font-serif">
            Drag tiles left or right to reorder. The first tile is the cover used on cards and shared links.
          </p>
        <Reorder.Group axis="x" values={items} onReorder={onChange} className="flex gap-3 overflow-x-auto pb-2">
          <AnimatePresence>
            {items.map((item, index) => (
              <Reorder.Item
                key={item.url}
                value={item}
                dragListener
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="shrink-0"
              >
                <div className="relative group">
                  <GlassCard className="overflow-hidden w-28 h-32 cursor-grab active:cursor-grabbing select-none">
                    <div className="absolute inset-0">
                      {item.type === 'youtube' ? (
                        <div className="relative w-full h-full">
                          {(() => {
                            const ytId = getYoutubeId(item.url)
                            return ytId ? (
                              <>
                                <Image src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt="video" fill className="object-cover" />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                  <div className="h-7 w-7 rounded-full bg-red-600 flex items-center justify-center">
                                    <Play className="h-3 w-3 text-white fill-white ml-0.5" />
                                  </div>
                                </div>
                              </>
                            ) : <div className="flex items-center justify-center h-full"><Youtube className="h-6 w-6 text-red-500" /></div>
                          })()}
                        </div>
                      ) : (
                        <Image src={item.url} alt={`Upload ${index + 1}`} fill className="object-cover" />
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute left-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm">
                      <GripVertical className="h-4 w-4" />
                    </div>
                    {index === 0 && (
                      <div className="absolute bottom-1 left-1 px-1.5 py-0.5 text-[10px] font-serif font-medium bg-primary text-white rounded">
                        Cover
                      </div>
                    )}
                    {index !== 0 && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); makeCover(index) }}
                        className="absolute bottom-1 left-1 rounded bg-white/95 px-1.5 py-0.5 text-[10px] font-serif font-medium text-foreground shadow-sm"
                      >
                        Make cover
                      </button>
                    )}
                    {item.type === 'youtube' && (
                      <div className="absolute top-1 right-1 px-1 py-0.5 text-[10px] font-serif bg-red-600 text-white rounded">
                        YT
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); remove(index) }}
                      className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow-sm"
                      aria-label="Delete media"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </GlassCard>
                </div>
              </Reorder.Item>
            ))}
          </AnimatePresence>
        </Reorder.Group>
        </div>
      )}

      {items.length === 0 && (
        <div className="flex items-center justify-center gap-2 text-sm text-foreground/50 font-serif">
          <ImageIcon className="h-4 w-4" />
          <span>No media uploaded yet</span>
        </div>
      )}
    </div>
  )
}

// Viewer used on listing detail page
export function MediaViewer({ items, selectedIndex }: { items: MediaItem[]; selectedIndex: number }) {
  const item = items[selectedIndex]
  if (!item) return null
  if (item.type === 'youtube') {
    return <YoutubeThumbnail url={item.url} isSelected={true} />
  }
  return (
    <div className="absolute inset-0">
      <Image src={item.url} alt="listing media" fill className="object-cover" />
    </div>
  )
}

export { YoutubeThumbnail, getYoutubeId }
