import { NextResponse } from 'next/server'
import { checkAdminSession } from '@/app/lib/admin-auth'

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  'http://localhost:8000'
const ADMIN_SECRET = process.env.ADMIN_SECRET

export async function POST() {
  if (!ADMIN_SECRET) {
    return NextResponse.json(
      { error: 'Server misconfiguration' },
      { status: 500 }
    )
  }
  const ok = await checkAdminSession()
  if (!ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const res = await fetch(`${API_BASE}/messages`, {
    method: 'DELETE',
    headers: { 'X-Admin-Secret': ADMIN_SECRET },
  })
  if (!res.ok) {
    return NextResponse.json(
      { error: 'Backend request failed' },
      { status: res.status }
    )
  }
  return NextResponse.json({ ok: true })
}
