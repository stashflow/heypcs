'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="relative pt-16 pb-24 px-4">
      <div className="max-w-5xl mx-auto text-center">

        {/* Floating logo — the full hand + text mark */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center mb-10"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="relative w-72 h-48 sm:w-96 sm:h-60 drop-shadow-2xl"
          >
            {/* Soft glow behind logo - extends into next section */}
            <div className="absolute -inset-16 neon-gradient-bg opacity-25 blur-3xl rounded-full scale-125" />
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-IxCTBv0xB3hLnCdoMfDy6xIGlNaYbf.png"
              alt="Hey PC's"
              fill
              className="object-contain"
              priority
            />
          </motion.div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="font-serif text-4xl sm:text-5xl lg:text-7xl font-bold text-balance leading-tight mb-5"
        >
          Find Your{' '}
          <span className="neon-gradient-text">Next PC.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-lg sm:text-xl text-foreground/55 max-w-xl mx-auto mb-10 text-pretty leading-relaxed"
        >
          Handcrafted, high-performance custom PCs built to dominate.
          Every machine tested, every build trusted.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="flex justify-center"
        >
          <Link href="/browse">
            <Button
              size="lg"
              className="neon-gradient-bg text-white border-0 h-13 px-10 font-serif text-lg rounded-2xl shadow-lg hover:shadow-purple-200 transition-shadow"
            >
              Browse PCs
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
