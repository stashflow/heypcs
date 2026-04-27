import { sql } from '@/lib/db'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { NextResponse } from 'next/server'

type DuplicateRouteProps = {
  params: Promise<{ id: string }>
}

async function ensureListingColumns() {
  await sql`
    ALTER TABLE listings
      ADD COLUMN IF NOT EXISTS listing_status VARCHAR(20) DEFAULT 'available',
      ADD COLUMN IF NOT EXISTS location_city VARCHAR(120) DEFAULT 'Marietta',
      ADD COLUMN IF NOT EXISTS location_zip VARCHAR(20) DEFAULT '30067',
      ADD COLUMN IF NOT EXISTS is_mobile BOOLEAN DEFAULT true
  `
}

export async function POST(_: Request, { params }: DuplicateRouteProps) {
  try {
    await ensureListingColumns()

    const user = await getCurrentUser()
    if (!user || !isAdmin(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const listingId = Number.parseInt(id, 10)
    if (!Number.isFinite(listingId)) {
      return NextResponse.json({ error: 'Invalid listing id' }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO listings (
        user_id,
        title,
        description,
        price,
        cpu,
        gpu,
        ram,
        storage,
        os,
        facebook_url,
        listing_status,
        location_city,
        location_zip,
        is_mobile,
        is_sold
      )
      SELECT
        ${user.id},
        title || ' (Copy)',
        description,
        price,
        cpu,
        gpu,
        ram,
        storage,
        os,
        facebook_url,
        'available',
        COALESCE(location_city, 'Marietta'),
        COALESCE(location_zip, '30067'),
        COALESCE(is_mobile, true),
        false
      FROM listings
      WHERE id = ${listingId}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    const duplicate = result[0]

    await sql`
      INSERT INTO images (listing_id, image_url, media_type, display_order)
      SELECT ${duplicate.id}, image_url, media_type, display_order
      FROM images
      WHERE listing_id = ${listingId}
      ORDER BY display_order ASC
    `

    return NextResponse.json({ listing: duplicate })
  } catch (error) {
    console.error('Error duplicating listing:', error)
    return NextResponse.json({ error: 'Failed to duplicate listing' }, { status: 500 })
  }
}
