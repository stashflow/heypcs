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
import { Heart, Menu, Plus, User, LogOut, Monitor } from 'lucide-react'
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
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 w-full"
      >
        <div className="mx-auto max-w-7xl px-4 py-4">
          <GlassCard className="px-6 py-3">
            <nav className="flex items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-3">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative h-10 w-10 overflow-hidden rounded-xl"
                >
                  <Image
                    src="/logo.jpeg"
                    alt="Hey PC's"
                    fill
                    className="object-cover"
                  />
                </motion.div>
                <span className="text-xl font-bold neon-gradient-text hidden sm:block">
                  Hey PC&apos;s
                </span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-6">
                <Link
                  href="/browse"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Monitor className="h-4 w-4" />
                  Browse PCs
                </Link>
                <Link
                  href="/sell"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Sell a PC
                </Link>
                {user && (
                  <Link
                    href="/liked"
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Heart className="h-4 w-4" />
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
                      <Button variant="ghost" className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full neon-gradient-bg flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <span className="hidden sm:block max-w-[120px] truncate">
                          {user.name || user.email.split('@')[0]}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 glass-card border-white/20">
                      <DropdownMenuItem asChild>
                        <Link href="/my-listings" className="flex items-center gap-2">
                          <Monitor className="h-4 w-4" />
                          My Listings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/liked" className="flex items-center gap-2">
                          <Heart className="h-4 w-4" />
                          Liked PCs
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => signOut()} className="text-destructive">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" onClick={openSignIn} className="hidden sm:inline-flex">
                      Sign In
                    </Button>
                    <Button onClick={openSignUp} className="neon-gradient-bg text-white border-0">
                      Get Started
                    </Button>
                  </div>
                )}

                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
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
                <div className="flex flex-col gap-2">
                  <Link
                    href="/browse"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Monitor className="h-4 w-4" />
                    Browse PCs
                  </Link>
                  <Link
                    href="/sell"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Plus className="h-4 w-4" />
                    Sell a PC
                  </Link>
                  {user && (
                    <Link
                      href="/liked"
                      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Heart className="h-4 w-4" />
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
