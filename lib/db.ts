import { neon } from '@neondatabase/serverless'

export const sql = neon(process.env.DATABASE_URL!)

export type User = {
  id: number
  email: string
  password_hash: string
  name: string | null
  created_at: Date
}

export type Listing = {
  id: number
  user_id: number
  title: string
  description: string | null
  price: number
  cpu: string | null
  gpu: string | null
  ram: string | null
  storage: string | null
  os: string | null
  facebook_url: string | null
  is_sold: boolean
  likes_count: number
  created_at: Date
  updated_at: Date
}

export type Image = {
  id: number
  listing_id: number
  image_url: string
  media_type: 'image' | 'youtube'
  display_order: number
  created_at: Date
}

export type ListingWithImages = Listing & {
  images: Image[]
  likes_count: number
  user_email?: string
  is_liked?: boolean
  like_count?: number
}

export type Like = {
  id: number
  user_id: number
  listing_id: number
  created_at: Date
}

export type Session = {
  id: number
  user_id: number
  token: string
  expires_at: Date
  created_at: Date
}
