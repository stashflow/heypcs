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
  minPrice?: string
  maxPrice?: string
  cpu?: string
  gpu?: string
  ram?: string
}

interface FilterBarProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  onSearch: () => void
}

const cpuOptions = [
  'Intel Core i9',
  'Intel Core i7',
  'Intel Core i5',
  'AMD Ryzen 9',
  'AMD Ryzen 7',
  'AMD Ryzen 5',
]

const gpuOptions = [
  'NVIDIA RTX 4090',
  'NVIDIA RTX 4080',
  'NVIDIA RTX 4070',
  'NVIDIA RTX 3080',
  'NVIDIA RTX 3070',
  'AMD RX 7900',
  'AMD RX 7800',
]

const ramOptions = ['8GB', '16GB', '32GB', '64GB', '128GB']

export function FilterBar({ filters, onFiltersChange, onSearch }: FilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const updateFilter = (key: keyof Filters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined,
    })
  }

  const clearFilters = () => {
    onFiltersChange({})
  }

  const hasActiveFilters = Object.values(filters).some(Boolean)

  return (
    <GlassCard className="p-4">
      {/* Toggle Row */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="h-5 w-5 rounded-full neon-gradient-bg text-white text-xs flex items-center justify-center">
              {Object.values(filters).filter(Boolean).length}
            </span>
          )}
        </Button>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
          <Button onClick={onSearch} className="neon-gradient-bg text-white border-0">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
      </div>

      {/* Expanded Filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Price Range */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Min Price</Label>
                <Input
                  type="number"
                  placeholder="$0"
                  value={filters.minPrice || ''}
                  onChange={(e) => updateFilter('minPrice', e.target.value)}
                  className="glass-card border-white/20"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Max Price</Label>
                <Input
                  type="number"
                  placeholder="$10,000"
                  value={filters.maxPrice || ''}
                  onChange={(e) => updateFilter('maxPrice', e.target.value)}
                  className="glass-card border-white/20"
                />
              </div>

              {/* CPU */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">CPU</Label>
                <Select
                  value={filters.cpu || ''}
                  onValueChange={(value) => updateFilter('cpu', value)}
                >
                  <SelectTrigger className="glass-card border-white/20">
                    <SelectValue placeholder="Any CPU" />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/20">
                    {cpuOptions.map((cpu) => (
                      <SelectItem key={cpu} value={cpu}>
                        {cpu}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* GPU */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">GPU</Label>
                <Select
                  value={filters.gpu || ''}
                  onValueChange={(value) => updateFilter('gpu', value)}
                >
                  <SelectTrigger className="glass-card border-white/20">
                    <SelectValue placeholder="Any GPU" />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/20">
                    {gpuOptions.map((gpu) => (
                      <SelectItem key={gpu} value={gpu}>
                        {gpu}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* RAM */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">RAM</Label>
                <Select
                  value={filters.ram || ''}
                  onValueChange={(value) => updateFilter('ram', value)}
                >
                  <SelectTrigger className="glass-card border-white/20">
                    <SelectValue placeholder="Any RAM" />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-white/20">
                    {ramOptions.map((ram) => (
                      <SelectItem key={ram} value={ram}>
                        {ram}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  )
}
