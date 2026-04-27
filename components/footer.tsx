'use client'

import Link from 'next/link'
import Image from 'next/image'
import { GlassCard } from '@/components/ui/glass-card'

export function Footer() {
  return (
    <footer className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <GlassCard className="p-8">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center mb-5">
                <div className="relative h-12 w-44">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-IxCTBv0xB3hLnCdoMfDy6xIGlNaYbf.png"
                    alt="Hey PC's"
                    fill
                    className="object-contain object-left"
                  />
                </div>
              </Link>
              <p className="text-foreground/55 max-w-sm text-sm leading-relaxed">
                Curated custom PC builds you can trust. Find your perfect machine.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-serif text-lg font-semibold mb-4">Explore</h4>
              <ul className="space-y-3 text-foreground/55 text-sm">
                <li>
                  <Link href="/browse" className="hover:text-foreground transition-colors">
                    Browse PCs
                  </Link>
                </li>
                <li>
                  <Link href="/liked" className="hover:text-foreground transition-colors">
                    Liked PCs
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-serif text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-3 text-foreground/55 text-sm">
                <li>
                  <a href="mailto:ejdarkbark17@gmail.com" className="hover:text-foreground transition-colors">
                    Get in Touch
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-8 pt-6 text-center text-xs text-foreground/40">
            <p>&copy; {new Date().getFullYear()} Hey PC&apos;s. All rights reserved.</p>
          </div>
        </GlassCard>
      </div>
    </footer>
  )
}
