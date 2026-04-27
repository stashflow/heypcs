import { Navbar } from '@/components/navbar'
import { GradientBlobs } from '@/components/ui/gradient-blobs'
import { HeroSection } from '@/components/home/hero-section'
import { FeaturedListings } from '@/components/home/featured-listings'
import { StatsSection } from '@/components/home/stats-section'
import { Footer } from '@/components/footer'
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL, absoluteUrl } from '@/lib/seo'

export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: SITE_NAME,
        alternateName: ['Hey PCs', 'heypcs', 'hey pcs'],
        url: SITE_URL,
        logo: absoluteUrl('/logo.jpeg'),
      },
      {
        '@type': 'WebSite',
        name: SITE_NAME,
        alternateName: ['Hey PCs', 'heypcs', 'hey pcs'],
        url: SITE_URL,
        description: DEFAULT_DESCRIPTION,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${SITE_URL}/browse?search={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  }

  return (
    <div className="min-h-screen relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
