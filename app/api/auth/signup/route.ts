import { signUp } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }
    
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }
    
    const result = await signUp(email, password, name)
    
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
    
    return NextResponse.json({
      user: {
        id: result.user!.id,
        email: result.user!.email,
        name: result.user!.name,
      }
    })
  } catch {
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 })
  }
}
