import { neon } from '@neondatabase/serverless'
import { getCurrentUser, isAdmin } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { type ListingWithImages } from '@/lib/db'

const sql = neon(process.env.DATABASE_URL!, { fullResults: true })

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const cpu = searchParams.get('cpu')
    const gpu = searchParams.get('gpu')
    const ram = searchParams.get('ram')
    const includeSold = searchParams.get('includeSold') === 'true'

    const user = await getCurrentUser()

    // Build conditions array
    const conditions: string[] = []
    const params: (string | number)[] = []
    let idx = 1

    // By default, don't show sold items unless explicitly requested
    if (!includeSold) {
      conditions.push(`l.is_sold = false`)
    }

    if (minPrice) { conditions.push(`l.price >= $${idx++}`); params.push(parseFloat(minPrice)) }
    if (maxPrice) { conditions.push(`l.price <= $${idx++}`); params.push(parseFloat(maxPrice)) }
    if (cpu)      { conditions.push(`LOWER(l.cpu) LIKE $${idx++}`); params.push(`%${cpu.toLowerCase()}%`) }
    if (gpu)      { conditions.push(`LOWER(l.gpu) LIKE $${idx++}`); params.push(`%${gpu.toLowerCase()}%`) }
    if (ram)      { conditions.push(`LOWER(l.ram) LIKE $${idx++}`); params.push(`%${ram.toLowerCase()}%`) }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const isLikedCol = user
      ? `, EXISTS(SELECT 1 FROM likes WHERE listing_id = l.id AND user_id = ${user.id}) as is_liked`
      : `, false as is_liked`

    const query = `
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
        ${isLikedCol}
      FROM listings l
      LEFT JOIN users u ON l.user_id = u.id
      ${whereClause}
      ORDER BY l.created_at DESC
    `

    const listings = await sql.query(query, params)

    return NextResponse.json({
      listings: listings.rows as ListingWithImages[],
      count: listings.rows.length,
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

    const result = await sql`
      INSERT INTO listings (user_id, title, description, price, cpu, gpu, ram, storage, os, facebook_url)
      VALUES (${user.id}, ${title}, ${description || null}, ${price}, ${cpu || null}, ${gpu || null}, ${ram || null}, ${storage || null}, ${os || null}, ${facebook_url || null})
      RETURNING *
    `

    const listing = result.rows[0]

    // images is now an array of { url, type } objects (MediaItem)
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const item = images[i]
        const url = typeof item === 'string' ? item : item.url
        const mediaType = typeof item === 'string' ? 'image' : (item.type || 'image')
        await sql`
          INSERT INTO images (listing_id, image_url, media_type, display_order)
          VALUES (${listing.id}, ${url}, ${mediaType}, ${i})
        `
      }
    }

    return NextResponse.json({ listing })
  } catch (error) {
    console.error('Error creating listing:', error)
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 })
  }
}
