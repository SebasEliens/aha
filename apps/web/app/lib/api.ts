import type { LogEntry, Project } from '@/app/types'

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

export async function getProjects(): Promise<Project[]> {
  const res = await fetch(`${API_BASE}/projects`, { cache: 'no-store' })
  if (res.status === 404) return []
  if (!res.ok) throw new Error(`Failed to fetch projects: ${res.status}`)
  return res.json() as Promise<Project[]>
}

export async function createProject(name: string): Promise<Project> {
  const res = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) throw new Error(`Failed to create project: ${res.status}`)
  return res.json() as Promise<Project>
}

export async function getProject(id: string): Promise<Project> {
  const res = await fetch(`${API_BASE}/projects/${id}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Failed to fetch project ${id}: ${res.status}`)
  return res.json() as Promise<Project>
}

export async function patchProject(id: string, name: string): Promise<Project> {
  const res = await fetch(`${API_BASE}/projects/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) throw new Error(`Failed to patch project ${id}: ${res.status}`)
  return res.json() as Promise<Project>
}
