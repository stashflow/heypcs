'use client'

import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function StatsSection() {
  const { data } = useSWR('/api/listings', fetcher, {
    refreshInterval: 30000,
  })

  const listingCount: number = data?.count ?? 0

  return (
    <section className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {listingCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <GlassCard className="py-5 px-8 text-center">
              <div className="flex items-center justify-center gap-3">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-pink opacity-70" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-neon-pink" />
                </span>
                <p className="font-serif text-xl font-semibold text-foreground/80">
                  <span className="neon-gradient-text font-bold text-2xl">{listingCount}</span>
                  {' '}available right now
                </p>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </section>
  )
}
