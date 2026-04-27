import { neon } from '@neondatabase/serverless'
import { NextResponse } from 'next/server'

const sql = neon(process.env.DATABASE_URL!)

// POST — toggle like (anonymous, no auth needed)
export async function POST(request: Request) {
  try {
    const { listing_id, action } = await request.json()

    if (!listing_id || !['like', 'unlike'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const delta = action === 'like' ? 1 : -1

    const result = await sql`
      UPDATE listings
      SET likes_count = GREATEST(0, likes_count + ${delta})
      WHERE id = ${listing_id}
      RETURNING likes_count
    `

    return NextResponse.json({ likes_count: result[0]?.likes_count ?? 0 })
  } catch (error) {
    console.error('Likes error:', error)
    return NextResponse.json({ error: 'Failed to update like' }, { status: 500 })
  }
}
