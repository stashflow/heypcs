import { sql, type User } from './db'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'

const SESSION_COOKIE_NAME = 'heypcs_session'
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateSessionToken(): string {
  return randomBytes(32).toString('hex')
}

export async function createSession(userId: number): Promise<string> {
  const token = generateSessionToken()
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)
  
  await sql`
    INSERT INTO sessions (user_id, token, expires_at)
    VALUES (${userId}, ${token}, ${expiresAt.toISOString()})
  `
  
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  })
  
  return token
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
    
    if (!token) return null
    
    const result = await sql`
      SELECT u.* FROM users u
      INNER JOIN sessions s ON s.user_id = u.id
      WHERE s.token = ${token}
      AND s.expires_at > NOW()
    `
    
    if (result.length === 0) return null
    
    return result[0] as User
  } catch {
    return null
  }
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  
  if (token) {
    await sql`DELETE FROM sessions WHERE token = ${token}`
    cookieStore.delete(SESSION_COOKIE_NAME)
  }
}

export async function signUp(email: string, password: string, name?: string): Promise<{ user?: User; error?: string }> {
  try {
    const existingUser = await sql`SELECT id FROM users WHERE email = ${email.toLowerCase()}`
    
    if (existingUser.length > 0) {
      return { error: 'An account with this email already exists' }
    }
    
    const passwordHash = await hashPassword(password)
    
    const result = await sql`
      INSERT INTO users (email, password_hash, name)
      VALUES (${email.toLowerCase()}, ${passwordHash}, ${name || null})
      RETURNING *
    `
    
    const user = result[0] as User
    await createSession(user.id)
    
    return { user }
  } catch {
    return { error: 'Failed to create account' }
  }
}

export async function signIn(email: string, password: string): Promise<{ user?: User; error?: string }> {
  try {
    const result = await sql`SELECT * FROM users WHERE email = ${email.toLowerCase()}`
    
    if (result.length === 0) {
      return { error: 'Invalid email or password' }
    }
    
    const user = result[0] as User
    const isValid = await verifyPassword(password, user.password_hash)
    
    if (!isValid) {
      return { error: 'Invalid email or password' }
    }
    
    await createSession(user.id)
    
    return { user }
  } catch {
    return { error: 'Failed to sign in' }
  }
}
