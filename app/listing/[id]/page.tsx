import type { Metadata } from 'next'
import { sql } from '@/lib/db'
import { ListingPageClient } from './listing-page-client'

type ListingPageProps = {
  params: Promise<{ id: string }>
}

type ListingShareData = {
  title: string
  description: string | null
  price: string | number
  image_url: string | null
  media_type: 'image' | 'youtube' | null
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://heypcs.com'

const getYoutubeId = (url: string) => {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  return match ? match[1] : null
}

async function getListingShareData(id: string) {
  const listingId = Number.parseInt(id, 10)
  if (!Number.isFinite(listingId)) return null

  const result = await sql`
    SELECT
      l.title,
      l.description,
      l.price,
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
    WHERE l.id = ${listingId}
    LIMIT 1
  `

  return (result[0] as ListingShareData | undefined) ?? null
}

function getShareImage(listing: ListingShareData | null) {
  if (!listing?.image_url) return `${siteUrl}/logo.jpeg`
  if (listing.media_type === 'youtube') {
    const youtubeId = getYoutubeId(listing.image_url)
    return youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : `${siteUrl}/logo.jpeg`
  }

  return listing.image_url
}

function getDescription(listing: ListingShareData | null) {
  if (!listing) return "Find custom gaming PCs on Hey PC's."

  const price = Number(listing.price)
  const formattedPrice = Number.isFinite(price)
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)
    : null
  const description = listing.description?.replace(/\s+/g, ' ').trim()

  return [formattedPrice, description].filter(Boolean).join(' - ') || "Find custom gaming PCs on Hey PC's."
}

export async function generateMetadata({ params }: ListingPageProps): Promise<Metadata> {
  const { id } = await params
  const listing = await getListingShareData(id)
  const title = listing ? `Hey PC's | ${listing.title}` : "Hey PC's | Listing"
  const description = getDescription(listing)
  const image = getShareImage(listing)
  const url = `${siteUrl}/listing/${id}`

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      images: [
        {
          url: image,
          alt: listing?.title || "Hey PC's listing",
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { id } = await params
  return <ListingPageClient id={id} />
}
