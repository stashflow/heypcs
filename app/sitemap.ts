import type { MetadataRoute } from 'next'
import { sql } from '@/lib/db'
import { SITE_URL } from '@/lib/seo'

type SitemapListing = {
  id: number
  updated_at: Date | string | null
  image_url: string | null
  media_type: 'image' | 'youtube' | null
}

const getYoutubeId = (url: string) => {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  return match ? match[1] : null
}

const getImageUrl = (listing: SitemapListing) => {
  if (!listing.image_url) return undefined
  if (listing.media_type === 'youtube') {
    const youtubeId = getYoutubeId(listing.image_url)
    return youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : undefined
  }

  return listing.image_url
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/browse`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
  ]

  const listings = await sql`
    SELECT
      l.id,
      l.updated_at,
      cover.image_url,
      cover.media_type
    FROM listings l
    LEFT JOIN LATERAL (
      SELECT image_url, media_type
      FROM images
      WHERE listing_id = l.id
      ORDER BY display_order ASC
      LIMIT 1
    ) cover ON true
    WHERE l.is_sold = false
    ORDER BY l.updated_at DESC
  `

  const listingRoutes = (listings as SitemapListing[]).map((listing) => {
    const image = getImageUrl(listing)

    return {
      url: `${SITE_URL}/${listing.id}`,
      lastModified: listing.updated_at ? new Date(listing.updated_at) : now,
      changeFrequency: 'daily' as const,
      priority: 0.8,
      images: image ? [image] : undefined,
    }
  })

  return [...staticRoutes, ...listingRoutes]
}
