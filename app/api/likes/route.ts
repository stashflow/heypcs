import { sql, type ListingWithImages } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const listings = await sql`
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
        (SELECT COUNT(*) FROM likes WHERE listing_id = l.id) as like_count,
        true as is_liked
      FROM listings l
      LEFT JOIN users u ON l.user_id = u.id
      INNER JOIN likes lk ON lk.listing_id = l.id AND lk.user_id = ${user.id}
      ORDER BY lk.created_at DESC
    `
    
    return NextResponse.json({ listings: listings as ListingWithImages[] })
  } catch (error) {
    console.error('Error fetching liked listings:', error)
    return NextResponse.json({ error: 'Failed to fetch liked listings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { listingId } = await request.json()
    
    if (!listingId) {
      return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 })
    }
    
    // Check if already liked
    const existing = await sql`
      SELECT id FROM likes WHERE user_id = ${user.id} AND listing_id = ${listingId}
    `
    
    if (existing.length > 0) {
      // Unlike
      await sql`DELETE FROM likes WHERE user_id = ${user.id} AND listing_id = ${listingId}`
      return NextResponse.json({ liked: false })
    } else {
      // Like
      await sql`
        INSERT INTO likes (user_id, listing_id) VALUES (${user.id}, ${listingId})
      `
      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error('Error toggling like:', error)
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 })
  }
}
