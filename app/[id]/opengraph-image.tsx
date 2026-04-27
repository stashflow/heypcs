import { ImageResponse } from 'next/og'
import { sql } from '@/lib/db'
import { SITE_NAME, absoluteUrl } from '@/lib/seo'

export const runtime = 'nodejs'

export const alt = "Hey PC's listing"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

type OpenGraphImageProps = {
  params: Promise<{ id: string }>
}

type ListingOgData = {
  title: string
  price: string | number
  cpu: string | null
  gpu: string | null
  ram: string | null
  storage: string | null
  image_url: string | null
  media_type: 'image' | 'youtube' | null
}

const getYoutubeId = (url: string) => {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  return match ? match[1] : null
}

async function getListing(id: string) {
  const listingId = Number.parseInt(id, 10)
  if (!Number.isFinite(listingId)) return null

  const result = await sql`
    SELECT
      l.title,
      l.price,
      l.cpu,
      l.gpu,
      l.ram,
      l.storage,
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

  return (result[0] as ListingOgData | undefined) ?? null
}

function getImageUrl(listing: ListingOgData | null) {
  if (!listing?.image_url) return absoluteUrl('/logo.jpeg')
  if (listing.media_type === 'youtube') {
    const youtubeId = getYoutubeId(listing.image_url)
    return youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : absoluteUrl('/logo.jpeg')
  }

  return listing.image_url
}

function formatPrice(price: string | number | null | undefined) {
  const value = Number(price)
  if (!Number.isFinite(value)) return null

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export default async function OpenGraphImage({ params }: OpenGraphImageProps) {
  const { id } = await params
  const listing = await getListing(id)
  const image = getImageUrl(listing)
  const price = formatPrice(listing?.price)
  const specs = [listing?.gpu, listing?.cpu, listing?.ram, listing?.storage].filter(Boolean).join(' / ')

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#f8f7ff',
          fontFamily: 'Arial, Helvetica, sans-serif',
          color: '#15131d',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(circle at 18% 18%, rgba(97, 145, 255, 0.32), transparent 30%), radial-gradient(circle at 82% 22%, rgba(255, 114, 188, 0.28), transparent 32%), radial-gradient(circle at 70% 90%, rgba(255, 177, 82, 0.24), transparent 32%)',
          }}
        />

        <div
          style={{
            width: 690,
            height: 630,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            background: '#111111',
          }}
        >
          <img
            src={image}
            alt=""
            style={{
              width: 630,
              height: 690,
              objectFit: 'cover',
              transform: listing?.media_type === 'image' ? 'rotate(90deg) scale(1.08)' : 'scale(1.08)',
            }}
          />
        </div>

        <div
          style={{
            width: 510,
            height: 630,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '54px 56px',
            background: 'rgba(255, 255, 255, 0.82)',
            borderLeft: '1px solid rgba(255, 255, 255, 0.72)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img src={absoluteUrl('/logo.jpeg')} alt="" width={54} height={54} style={{ borderRadius: 12 }} />
              <div style={{ display: 'flex', fontSize: 30, fontWeight: 800 }}>{SITE_NAME}</div>
            </div>

            <div
              style={{
                display: 'flex',
                fontSize: 45,
                lineHeight: 1.04,
                fontWeight: 900,
                letterSpacing: -1,
              }}
            >
              {listing?.title || 'Custom Gaming PC'}
            </div>

            {specs && (
              <div
                style={{
                  display: 'flex',
                  color: '#575169',
                  fontSize: 24,
                  lineHeight: 1.25,
                  fontWeight: 600,
                }}
              >
                {specs}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {price && (
              <div style={{ display: 'flex', color: '#3478ff', fontSize: 48, fontWeight: 900 }}>
                {price}
              </div>
            )}
            <div style={{ display: 'flex', color: '#5f586d', fontSize: 24, fontWeight: 700 }}>
              Message on Facebook to buy
            </div>
          </div>
        </div>
      </div>
    ),
    size
  )
}
