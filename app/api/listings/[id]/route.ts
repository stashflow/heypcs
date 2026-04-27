import { sql } from '@/lib/db'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { type ListingWithImages } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

async function ensureListingColumns() {
  await sql`
    ALTER TABLE listings
      ADD COLUMN IF NOT EXISTS listing_status VARCHAR(20) DEFAULT 'available',
      ADD COLUMN IF NOT EXISTS location_city VARCHAR(120) DEFAULT 'Marietta',
      ADD COLUMN IF NOT EXISTS location_zip VARCHAR(20) DEFAULT '30067',
      ADD COLUMN IF NOT EXISTS is_mobile BOOLEAN DEFAULT true
  `
  await sql`
    UPDATE listings
    SET listing_status = CASE WHEN is_sold THEN 'sold' ELSE COALESCE(listing_status, 'available') END,
        location_city = COALESCE(location_city, 'Marietta'),
        location_zip = COALESCE(location_zip, '30067'),
        is_mobile = COALESCE(is_mobile, true)
  `
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureListingColumns()
    const { id } = await params
    const user = await getCurrentUser()

    const result = await sql`
      SELECT
        l.*,
        u.email as user_email,
        COALESCE(
          (SELECT json_agg(
            json_build_object('id', i.id, 'image_url', i.image_url, 'media_type', i.media_type, 'display_order', i.display_order)
            ORDER BY i.display_order
          ) FROM images i WHERE i.listing_id = l.id),
          '[]'::json
        ) as images,
        l.likes_count
        ${user ? sql`, EXISTS(SELECT 1 FROM likes WHERE listing_id = l.id AND user_id = ${user.id}) as is_liked` : sql`, false as is_liked`}
      FROM listings l
      LEFT JOIN users u ON l.user_id = u.id
      WHERE l.id = ${parseInt(id)}
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    return NextResponse.json({ listing: result[0] as ListingWithImages })
  } catch (error) {
    console.error('Error fetching listing:', error)
    return NextResponse.json({ error: 'Failed to fetch listing' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()

    if (!user || !isAdmin(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    await ensureListingColumns()

    const { title, description, price, cpu, gpu, ram, storage, os, facebook_url, images, is_sold, listing_status, location_city, location_zip, is_mobile } = body
    const nextStatus = listing_status || (is_sold === true ? 'sold' : is_sold === false ? 'available' : undefined)

    // If only marking as sold, handle separately
    if ((is_sold !== undefined || listing_status !== undefined) && title === undefined) {
      const result = await sql`
        UPDATE listings SET
          listing_status = ${nextStatus || 'available'},
          is_sold = ${(nextStatus || 'available') === 'sold'},
          updated_at = NOW()
        WHERE id = ${parseInt(id)}
        RETURNING *
      `

      if (result.length === 0) {
        return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
      }

      return NextResponse.json({ listing: result[0] })
    }

    const result = await sql`
      UPDATE listings SET
        title = ${title},
        description = ${description || null},
        price = ${price},
        cpu = ${cpu || null},
        gpu = ${gpu || null},
        ram = ${ram || null},
        storage = ${storage || null},
        os = ${os || null},
        facebook_url = ${facebook_url || null},
        listing_status = COALESCE(${nextStatus || null}, listing_status, 'available'),
        location_city = COALESCE(${location_city || null}, location_city, 'Marietta'),
        location_zip = COALESCE(${location_zip || null}, location_zip, '30067'),
        is_mobile = COALESCE(${is_mobile ?? null}, is_mobile, true),
        is_sold = COALESCE(${nextStatus || null}, listing_status, 'available') = 'sold',
        updated_at = NOW()
      WHERE id = ${parseInt(id)}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Replace images if provided
    if (images !== undefined) {
      await sql`DELETE FROM images WHERE listing_id = ${parseInt(id)}`
      if (images && images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const item = images[i]
          const url = typeof item === 'string' ? item : item.url
          const mediaType = typeof item === 'string' ? 'image' : (item.type || item.media_type || 'image')
          await sql`
            INSERT INTO images (listing_id, image_url, media_type, display_order)
            VALUES (${parseInt(id)}, ${url}, ${mediaType}, ${i})
          `
        }
      }
    }

    // Return updated listing with images
    const updated = await sql`
      SELECT l.*,
        COALESCE(
          (SELECT json_agg(
            json_build_object('id', i.id, 'image_url', i.image_url, 'media_type', i.media_type, 'display_order', i.display_order)
            ORDER BY i.display_order
          ) FROM images i WHERE i.listing_id = l.id),
          '[]'::json
        ) as images,
        l.likes_count
      FROM listings l WHERE l.id = ${parseInt(id)}
    `

    return NextResponse.json({ listing: updated[0] })
  } catch (error) {
    console.error('Error updating listing:', error)
    return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()

    if (!user || !isAdmin(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const listing = await sql`SELECT id FROM listings WHERE id = ${parseInt(id)}`

    if (listing.length === 0) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    await sql`DELETE FROM listings WHERE id = ${parseInt(id)}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting listing:', error)
    return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 })
  }
}
