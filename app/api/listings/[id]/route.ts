import { sql, type ListingWithImages } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
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
        ${user ? sql`, EXISTS(SELECT 1 FROM likes WHERE listing_id = l.id AND user_id = ${user.id}) as is_liked` : sql``}
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check if user owns the listing
    const listing = await sql`SELECT user_id FROM listings WHERE id = ${parseInt(id)}`
    
    if (listing.length === 0) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }
    
    if (listing[0].user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    await sql`DELETE FROM listings WHERE id = ${parseInt(id)}`
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting listing:', error)
    return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 })
  }
}
