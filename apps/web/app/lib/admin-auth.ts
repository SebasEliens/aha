import { cookies } from 'next/headers'

const SESSION_COOKIE = 'admin_session'
const SESSION_VALUE = 'authenticated'

export async function setAdminSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, SESSION_VALUE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours
  })
}

export async function checkAdminSession(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE)?.value === SESSION_VALUE
}
