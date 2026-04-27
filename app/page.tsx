import { Navbar } from '@/components/navbar'
import { GradientBlobs } from '@/components/ui/gradient-blobs'
import { HeroSection } from '@/components/home/hero-section'
import { FeaturedListings } from '@/components/home/featured-listings'
import { StatsSection } from '@/components/home/stats-section'
import { Footer } from '@/components/footer'

export default function HomePage() {
  return (
    <div className="min-h-screen relative">
      <GradientBlobs />
      <Navbar />
      <main>
        <HeroSection />
        <StatsSection />
        <FeaturedListings />
      </main>
      <Footer />
    </div>
  )
}
