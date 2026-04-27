import { sql } from '@/lib/db'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { type ListingWithImages } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()

    const result = await sql`
      SELECT
        l.*,
        u.email as user_email,
        COALESCE(
          (SELECT json_agg(
            json_build_object('id', i.id, 'image_url', i.image_url, 'display_order', i.display_order)
            ORDER BY i.display_order
          ) FROM images i WHERE i.listing_id = l.id),
          '[]'::json
        ) as images,
        (SELECT COUNT(*) FROM likes WHERE listing_id = l.id) as like_count
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

    const { title, description, price, cpu, gpu, ram, storage, os, facebook_url } = await request.json()

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
        updated_at = NOW()
      WHERE id = ${parseInt(id)}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    return NextResponse.json({ listing: result[0] })
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
