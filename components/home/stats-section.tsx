'use client'

import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/glass-card'
import useSWR from 'swr'
import { Flame, Users, Monitor, TrendingUp } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function StatsSection() {
  const { data } = useSWR('/api/listings', fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
  })

  const listingCount = data?.count || 0

  const stats = [
    {
      icon: Flame,
      value: listingCount,
      label: 'PCs Available',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: Users,
      value: '500+',
      label: 'Happy Buyers',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Monitor,
      value: '99%',
      label: 'Quality Score',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: TrendingUp,
      value: '$2M+',
      label: 'Total Sales',
      color: 'from-green-500 to-emerald-500',
    },
  ]

  return (
    <section className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <GlassCard className="p-6 text-center">
                <div
                  className={`inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-r ${stat.color} mb-4`}
                >
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold neon-gradient-text">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Live Stock Banner */}
        {listingCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mt-8"
          >
            <GlassCard className="p-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500" />
                </span>
                <span className="text-lg font-medium">
                  <span className="text-orange-500">{listingCount}</span> PCs available right now
                </span>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </section>
  )
}
