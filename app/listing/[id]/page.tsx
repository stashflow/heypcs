import type { Metadata } from 'next'
import { sql } from '@/lib/db'
import { SITE_NAME, SITE_URL, absoluteUrl, buildPcKeywords } from '@/lib/seo'
import { ListingPageClient } from './listing-page-client'

type ListingPageProps = {
  params: Promise<{ id: string }>
}

type ListingShareData = {
  title: string
  description: string | null
  price: string | number
  cpu: string | null
  gpu: string | null
  ram: string | null
  storage: string | null
  os: string | null
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

async function getListingShareData(id: string) {
  const listingId = Number.parseInt(id, 10)
  if (!Number.isFinite(listingId)) return null

  const result = await sql`
    SELECT
      l.title,
      l.description,
      l.price,
      l.cpu,
      l.gpu,
      l.ram,
      l.storage,
      l.os,
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
    WHERE l.id = ${listingId}
    LIMIT 1
  `

  return (result[0] as ListingShareData | undefined) ?? null
}

function getShareImage(listing: ListingShareData | null) {
  if (!listing?.image_url) return absoluteUrl('/logo.jpeg')
  if (listing.media_type === 'youtube') {
    const youtubeId = getYoutubeId(listing.image_url)
    return youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : absoluteUrl('/logo.jpeg')
  }

  return listing.image_url
}

function getDescription(listing: ListingShareData | null) {
  if (!listing) return `Find custom gaming PCs on ${SITE_NAME}.`

  const price = Number(listing.price)
  const formattedPrice = Number.isFinite(price)
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)
    : null
  const description = listing.description?.replace(/\s+/g, ' ').trim()

  return [formattedPrice, description].filter(Boolean).join(' - ') || `Find custom gaming PCs on ${SITE_NAME}.`
}

function getProductJsonLd(listing: ListingShareData, id: string) {
  const image = getShareImage(listing)
  const url = `${SITE_URL}/listing/${id}`
  const price = Number(listing.price)

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: listing.title,
    description: getDescription(listing),
    image,
    url,
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
    category: 'Gaming Computer',
    additionalProperty: [
      listing.cpu && { '@type': 'PropertyValue', name: 'CPU', value: listing.cpu },
      listing.gpu && { '@type': 'PropertyValue', name: 'GPU', value: listing.gpu },
      listing.ram && { '@type': 'PropertyValue', name: 'RAM', value: listing.ram },
      listing.storage && { '@type': 'PropertyValue', name: 'Storage', value: listing.storage },
      listing.os && { '@type': 'PropertyValue', name: 'Operating System', value: listing.os },
    ].filter(Boolean),
    offers: Number.isFinite(price)
      ? {
          '@type': 'Offer',
          price,
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          url,
        }
      : undefined,
  }
}

export async function generateMetadata({ params }: ListingPageProps): Promise<Metadata> {
  const { id } = await params
  const listing = await getListingShareData(id)
  const title = listing ? `${SITE_NAME} | ${listing.title}` : `${SITE_NAME} | Listing`
  const description = getDescription(listing)
  const image = getShareImage(listing)
  const url = `${SITE_URL}/listing/${id}`

  return {
    title,
    description,
    keywords: buildPcKeywords(listing),
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
          width: 1200,
          height: 900,
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
  const listing = await getListingShareData(id)

  return (
    <>
      {listing && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(getProductJsonLd(listing, id)) }}
        />
      )}
      <ListingPageClient id={id} />
    </>
  )
}
