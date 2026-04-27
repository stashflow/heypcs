'use client'

import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface GlassCardProps extends HTMLMotionProps<'div'> {
  hover?: boolean
  glow?: boolean
  glowColor?: 'purple' | 'pink' | 'blue'
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, hover = false, glow = false, glowColor = 'purple', children, ...props }, ref) => {
    const glowClasses = {
      purple: 'hover:shadow-[0_0_60px_rgba(138,75,255,0.25)]',
      pink: 'hover:shadow-[0_0_60px_rgba(255,100,180,0.25)]',
      blue: 'hover:shadow-[0_0_60px_rgba(100,150,255,0.25)]',
    }
    
    return (
      <motion.div
        ref={ref}
        className={cn(
          'glass-card rounded-2xl',
          hover && 'glass-card-hover cursor-pointer',
          glow && glowClasses[glowColor],
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

GlassCard.displayName = 'GlassCard'
