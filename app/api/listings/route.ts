import { sql, type ListingWithImages } from '@/lib/db'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const cpu = searchParams.get('cpu')
    const gpu = searchParams.get('gpu')
    const ram = searchParams.get('ram')
    
    const user = await getCurrentUser()
    
    // Build dynamic query
    let query = `
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
        ${user ? `, EXISTS(SELECT 1 FROM likes WHERE listing_id = l.id AND user_id = ${user.id}) as is_liked` : ''}
      FROM listings l
      LEFT JOIN users u ON l.user_id = u.id
      WHERE 1=1
    `
    
    const params: (string | number)[] = []
    let paramIndex = 1
    
    if (minPrice) {
      query += ` AND l.price >= $${paramIndex}`
      params.push(parseFloat(minPrice))
      paramIndex++
    }
    
    if (maxPrice) {
      query += ` AND l.price <= $${paramIndex}`
      params.push(parseFloat(maxPrice))
      paramIndex++
    }
    
    if (cpu) {
      query += ` AND LOWER(l.cpu) LIKE $${paramIndex}`
      params.push(`%${cpu.toLowerCase()}%`)
      paramIndex++
    }
    
    if (gpu) {
      query += ` AND LOWER(l.gpu) LIKE $${paramIndex}`
      params.push(`%${gpu.toLowerCase()}%`)
      paramIndex++
    }
    
    if (ram) {
      query += ` AND LOWER(l.ram) LIKE $${paramIndex}`
      params.push(`%${ram.toLowerCase()}%`)
      paramIndex++
    }
    
    query += ` ORDER BY l.created_at DESC`
    
    // Execute raw query with dynamic filters
    const listings = await sql.query(query, params)
    
    return NextResponse.json({ 
      listings: listings.rows as ListingWithImages[],
      count: listings.rows.length
    })
  } catch (error) {
    console.error('Error fetching listings:', error)
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isAdmin(user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    const { title, description, price, cpu, gpu, ram, storage, os, facebook_url, images } = await request.json()
    
    if (!title || !price) {
      return NextResponse.json({ error: 'Title and price are required' }, { status: 400 })
    }
    
    // Create the listing
    const result = await sql`
      INSERT INTO listings (user_id, title, description, price, cpu, gpu, ram, storage, os, facebook_url)
      VALUES (${user.id}, ${title}, ${description || null}, ${price}, ${cpu || null}, ${gpu || null}, ${ram || null}, ${storage || null}, ${os || null}, ${facebook_url || null})
      RETURNING *
    `
    
    const listing = result[0]
    
    // Add images if provided
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        await sql`
          INSERT INTO images (listing_id, image_url, display_order)
          VALUES (${listing.id}, ${images[i]}, ${i})
        `
      }
    }
    
    return NextResponse.json({ listing })
  } catch (error) {
    console.error('Error creating listing:', error)
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 })
  }
}
