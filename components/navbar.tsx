'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useState } from 'react'
import { AuthModal } from '@/components/auth-modal'

export function Navbar() {
  const { user, signOut, isLoading } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const openSignIn = () => {
    setAuthMode('signin')
    setShowAuthModal(true)
  }

  const openSignUp = () => {
    setAuthMode('signup')
    setShowAuthModal(true)
  }

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-50 w-full"
      >
        <div className="mx-auto max-w-7xl px-4 py-4">
          <GlassCard className="px-6 py-3">
            <nav className="flex items-center justify-between">

              {/* Logo — full image with hand + "Hey PC's" text */}
              <Link href="/" className="flex items-center">
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative h-12 w-36"
                >
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-IxCTBv0xB3hLnCdoMfDy6xIGlNaYbf.png"
                    alt="Hey PC's"
                    fill
                    className="object-contain object-left"
                    priority
                  />
                </motion.div>
              </Link>

              {/* Desktop Navigation — clean text links, no icons */}
              <div className="hidden md:flex items-center gap-8">
                <Link
                  href="/browse"
                  className="font-serif text-lg font-semibold text-foreground/70 hover:text-foreground transition-colors hover:neon-gradient-text"
                >
                  Browse PCs
                </Link>
                <Link
                  href="/sell"
                  className="font-serif text-lg font-semibold text-foreground/70 hover:text-foreground transition-colors"
                >
                  Sell a PC
                </Link>
                {user && (
                  <Link
                    href="/liked"
                    className="font-serif text-lg font-semibold text-foreground/70 hover:text-foreground transition-colors"
                  >
                    Liked PCs
                  </Link>
                )}
              </div>

              {/* Auth Section */}
              <div className="flex items-center gap-3">
                {isLoading ? (
                  <div className="h-9 w-20 animate-pulse rounded-lg bg-muted" />
                ) : user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-2 font-serif text-base">
                        <div className="h-8 w-8 rounded-full neon-gradient-bg flex items-center justify-center shrink-0">
                          <span className="text-white text-sm font-bold">
                            {(user.name || user.email)[0].toUpperCase()}
                          </span>
                        </div>
                        <span className="hidden sm:block max-w-[120px] truncate">
                          {user.name || user.email.split('@')[0]}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 glass-card border-white/20">
                      <DropdownMenuItem asChild>
                        <Link href="/my-listings" className="font-serif text-base">
                          My Listings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/liked" className="font-serif text-base">
                          Liked PCs
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => signOut()} className="text-destructive font-serif text-base">
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      onClick={openSignIn}
                      className="hidden sm:inline-flex font-serif text-base"
                    >
                      Sign In
                    </Button>
                    <Button
                      onClick={openSignUp}
                      className="neon-gradient-bg text-white border-0 font-serif text-base"
                    >
                      Get Started
                    </Button>
                  </div>
                )}

                {/* Mobile Menu Toggle */}
                <button
                  className="md:hidden glass-card px-3 py-2 rounded-xl font-serif text-sm"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? 'Close' : 'Menu'}
                </button>
              </div>
            </nav>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden pt-4 pb-2 border-t border-white/10 mt-4"
              >
                <div className="flex flex-col gap-1">
                  <Link
                    href="/browse"
                    className="font-serif text-lg px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Browse PCs
                  </Link>
                  <Link
                    href="/sell"
                    className="font-serif text-lg px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sell a PC
                  </Link>
                  {user && (
                    <Link
                      href="/liked"
                      className="font-serif text-lg px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Liked PCs
                    </Link>
                  )}
                </div>
              </motion.div>
            )}
          </GlassCard>
        </div>
      </motion.header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode={authMode}
      />
    </>
  )
}
