import { neon } from '@neondatabase/serverless'
import { NextResponse } from 'next/server'

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const [cpus, gpus, rams] = await Promise.all([
      sql`SELECT DISTINCT cpu FROM listings WHERE cpu IS NOT NULL AND cpu != '' ORDER BY cpu ASC`,
      sql`SELECT DISTINCT gpu FROM listings WHERE gpu IS NOT NULL AND gpu != '' ORDER BY gpu ASC`,
      sql`SELECT DISTINCT ram FROM listings WHERE ram IS NOT NULL AND ram != '' ORDER BY ram ASC`,
    ])

    return NextResponse.json({
      cpus: cpus.map((r) => r.cpu as string),
      gpus: gpus.map((r) => r.gpu as string),
      rams: rams.map((r) => r.ram as string),
    })
  } catch (error) {
    console.error('Error fetching specs:', error)
    return NextResponse.json({ cpus: [], gpus: [], rams: [] }, { status: 500 })
  }
}
