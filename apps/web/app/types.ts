export interface LogEntry {
  id: string
  text: string
  timestamp: string
  mocked: boolean
}

export interface Project {
  id: string
  name: string
  created_at: string
  updated_at: string
}
