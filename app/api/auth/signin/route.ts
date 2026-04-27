import { signIn } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }
    
    const result = await signIn(email, password)
    
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 401 })
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
