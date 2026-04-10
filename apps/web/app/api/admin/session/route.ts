import { NextResponse } from 'next/server'
import { checkAdminSession } from '@/app/lib/admin-auth'

export async function GET() {
  const ok = await checkAdminSession()
  return NextResponse.json({ ok })
}
