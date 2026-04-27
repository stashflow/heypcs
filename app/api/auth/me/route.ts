import { getCurrentUser } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const user = await getCurrentUser()
  
  if (!user) {
    return NextResponse.json({ user: null })
  }
  
  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    }
  })
}
