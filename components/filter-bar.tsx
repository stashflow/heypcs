'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SlidersHorizontal, X, Search } from 'lucide-react'

export interface Filters {
  search?: string
  minPrice?: string
  maxPrice?: string
  cpu?: string
  gpu?: string
  ram?: string
  includeSold?: boolean
}

export interface SpecOptions {
  cpus: string[]
  gpus: string[]
  rams: string[]
}

interface FilterBarProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  onSearch: () => void
  specOptions: SpecOptions
  isAdmin?: boolean
}

export function FilterBar({ filters, onFiltersChange, onSearch, specOptions, isAdmin }: FilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const updateFilter = (key: keyof Filters, value: string) => {
    onFiltersChange({ ...filters, [key]: value || undefined })
  }

  const clearFilters = () => onFiltersChange({})

  const hasActiveFilters = Object.values(filters).some(Boolean)

  const hasAnySpecs =
    specOptions.cpus.length > 0 ||
    specOptions.gpus.length > 0 ||
    specOptions.rams.length > 0

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch()
    }
  }

  return (
    <GlassCard className="p-4">
      {/* Search bar - always visible */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
          <Input
            type="text"
            placeholder="Search PCs by name, specs, or description..."
            value={filters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10 glass-card border-white/20 font-serif h-11"
          />
        </div>
        <Button onClick={onSearch} className="neon-gradient-bg text-white border-0 font-serif h-11 px-6">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 font-serif"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="h-5 w-5 rounded-full neon-gradient-bg text-white text-xs flex items-center justify-center">
              {Object.values(filters).filter(Boolean).length}
            </span>
          )}
        </Button>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="font-serif">
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-4 border-t border-white/20">
              {/* Price always shown */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label className="font-serif text-sm text-foreground/60">Min Price</Label>
                  <Input
                    type="number"
                    placeholder="$0"
                    value={filters.minPrice || ''}
                    onChange={(e) => updateFilter('minPrice', e.target.value)}
                    className="glass-card border-white/20 font-serif"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-serif text-sm text-foreground/60">Max Price</Label>
                  <Input
                    type="number"
                    placeholder="No limit"
                    value={filters.maxPrice || ''}
                    onChange={(e) => updateFilter('maxPrice', e.target.value)}
                    className="glass-card border-white/20 font-serif"
                  />
                </div>
              </div>

              {/* Spec filters — only shown if listings exist with those specs */}
              {!hasAnySpecs ? (
                <p className="font-serif text-sm text-foreground/40 text-center py-2">
                  Spec filters will appear once PCs are listed.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {specOptions.cpus.length > 0 && (
                    <div className="space-y-2">
                      <Label className="font-serif text-sm text-foreground/60">CPU</Label>
                      <Select
                        value={filters.cpu || ''}
                        onValueChange={(v) => updateFilter('cpu', v === '__all__' ? '' : v)}
                      >
                        <SelectTrigger className="glass-card border-white/20 font-serif">
                          <SelectValue placeholder="Any CPU" />
                        </SelectTrigger>
                        <SelectContent
                          className="font-serif rounded-xl border-white/20"
                          style={{
                            background: 'rgba(255,255,255,0.97)',
                            backdropFilter: 'blur(20px)',
                            boxShadow: '0 8px 32px rgba(138,75,255,0.15)',
                          }}
                        >
                          <SelectItem value="__all__">Any CPU</SelectItem>
                          {specOptions.cpus.map((cpu) => (
                            <SelectItem key={cpu} value={cpu}>{cpu}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {specOptions.gpus.length > 0 && (
                    <div className="space-y-2">
                      <Label className="font-serif text-sm text-foreground/60">GPU</Label>
                      <Select
                        value={filters.gpu || ''}
                        onValueChange={(v) => updateFilter('gpu', v === '__all__' ? '' : v)}
                      >
                        <SelectTrigger className="glass-card border-white/20 font-serif">
                          <SelectValue placeholder="Any GPU" />
                        </SelectTrigger>
                        <SelectContent
                          className="font-serif rounded-xl border-white/20"
                          style={{
                            background: 'rgba(255,255,255,0.97)',
                            backdropFilter: 'blur(20px)',
                            boxShadow: '0 8px 32px rgba(138,75,255,0.15)',
                          }}
                        >
                          <SelectItem value="__all__">Any GPU</SelectItem>
                          {specOptions.gpus.map((gpu) => (
                            <SelectItem key={gpu} value={gpu}>{gpu}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {specOptions.rams.length > 0 && (
                    <div className="space-y-2">
                      <Label className="font-serif text-sm text-foreground/60">RAM</Label>
                      <Select
                        value={filters.ram || ''}
                        onValueChange={(v) => updateFilter('ram', v === '__all__' ? '' : v)}
                      >
                        <SelectTrigger className="glass-card border-white/20 font-serif">
                          <SelectValue placeholder="Any RAM" />
                        </SelectTrigger>
                        <SelectContent
                          className="font-serif rounded-xl border-white/20"
                          style={{
                            background: 'rgba(255,255,255,0.97)',
                            backdropFilter: 'blur(20px)',
                            boxShadow: '0 8px 32px rgba(138,75,255,0.15)',
                          }}
                        >
                          <SelectItem value="__all__">Any RAM</SelectItem>
                          {specOptions.rams.map((ram) => (
                            <SelectItem key={ram} value={ram}>{ram}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              )}

              {/* Sold toggle for admin */}
              {isAdmin && (
                <div className="mt-4 pt-4 border-t border-white/20">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.includeSold ?? false}
                      onChange={(e) => updateFilter('includeSold', e.target.checked ? 'true' : '')}
                      className="w-4 h-4 rounded accent-purple-500"
                    />
                    <span className="font-serif text-sm text-foreground/70">Show Sold Items</span>
                  </label>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  )
}
