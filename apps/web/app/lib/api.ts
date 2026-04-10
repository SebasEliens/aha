import type { LogEntry } from '@/app/types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function getMessages(): Promise<LogEntry[]> {
  const res = await fetch(`${API_BASE}/messages`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Failed to fetch messages: ${res.status}`)
  return res.json() as Promise<LogEntry[]>
}

export async function postMessage(text: string): Promise<LogEntry> {
  const res = await fetch(`${API_BASE}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })
  if (!res.ok) throw new Error(`Failed to post message: ${res.status}`)
  return res.json() as Promise<LogEntry>
}
