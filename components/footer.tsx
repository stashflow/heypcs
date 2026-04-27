'use client'

import Link from 'next/link'
import Image from 'next/image'
import { GlassCard } from '@/components/ui/glass-card'
import { Github, Twitter } from 'lucide-react'

export function Footer() {
  return (
    <footer className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <GlassCard className="p-8">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-3 mb-4">
                <div className="relative h-10 w-10 overflow-hidden rounded-xl">
                  <Image src="/logo.jpeg" alt="Hey PC's" fill className="object-cover" />
                </div>
                <span className="text-xl font-bold neon-gradient-text">Hey PC&apos;s</span>
              </Link>
              <p className="text-muted-foreground max-w-sm">
                The premier marketplace for custom PC builds. Find your perfect machine or sell your creation to the world.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold mb-4">Marketplace</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="/browse" className="hover:text-foreground transition-colors">
                    Browse PCs
                  </Link>
                </li>
                <li>
                  <Link href="/sell" className="hover:text-foreground transition-colors">
                    Sell a PC
                  </Link>
                </li>
                <li>
                  <Link href="/liked" className="hover:text-foreground transition-colors">
                    Liked PCs
                  </Link>
                </li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="h-10 w-10 rounded-full glass-card flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <Twitter className="h-4 w-4" />
                </a>
                <a
                  href="#"
                  className="h-10 w-10 rounded-full glass-card flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <Github className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Hey PC&apos;s. All rights reserved.</p>
          </div>
        </GlassCard>
      </div>
    </footer>
  )
}
