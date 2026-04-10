import { NextResponse } from 'next/server'
import { setAdminSession } from '@/app/lib/admin-auth'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { password?: string }
    const secret = process.env.ADMIN_SECRET
    if (!secret || body.password !== secret) {
      return NextResponse.json({ ok: false }, { status: 401 })
    }
    await setAdminSession()
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
