'use client'

import { motion } from 'framer-motion'

export function GradientBlobs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Blue blob - top left */}
      <motion.div
        className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-40 blur-3xl animate-float"
        style={{
          background: 'radial-gradient(circle, oklch(0.65 0.22 250) 0%, transparent 70%)',
        }}
      />
      
      {/* Purple blob - top right */}
      <motion.div
        className="absolute -top-20 right-0 w-[500px] h-[500px] rounded-full opacity-30 blur-3xl animate-float-delayed"
        style={{
          background: 'radial-gradient(circle, oklch(0.55 0.25 280) 0%, transparent 70%)',
        }}
      />
      
      {/* Pink blob - middle right */}
      <motion.div
        className="absolute top-1/3 -right-20 w-80 h-80 rounded-full opacity-35 blur-3xl animate-float-slow"
        style={{
          background: 'radial-gradient(circle, oklch(0.65 0.25 330) 0%, transparent 70%)',
        }}
      />
      
      {/* Orange blob - bottom left */}
      <motion.div
        className="absolute bottom-20 -left-20 w-72 h-72 rounded-full opacity-30 blur-3xl animate-float-delayed"
        style={{
          background: 'radial-gradient(circle, oklch(0.75 0.2 50) 0%, transparent 70%)',
        }}
      />
      
      {/* Yellow blob - bottom right */}
      <motion.div
        className="absolute -bottom-20 right-1/4 w-64 h-64 rounded-full opacity-25 blur-3xl animate-float"
        style={{
          background: 'radial-gradient(circle, oklch(0.85 0.18 85) 0%, transparent 70%)',
        }}
      />
      
      {/* Extra purple blob - center */}
      <motion.div
        className="absolute top-1/2 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl animate-float-slow"
        style={{
          background: 'radial-gradient(circle, oklch(0.55 0.25 280) 0%, transparent 70%)',
        }}
      />
    </div>
  )
}
