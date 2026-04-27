export const ADMIN_EMAIL = 'ejdarkbark17@gmail.com'

export function isAdmin(email: string): boolean {
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
}
