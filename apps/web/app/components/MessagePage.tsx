'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { AppLayout } from './AppLayout'
import { MessageLog } from './MessageLog'
import { MessageInput } from './MessageInput'
import { getMessages, postMessage } from '@/app/lib/api'
import type { LogEntry } from '@/app/types'

export function MessagePage() {
  const [entries, setEntries] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMessages()
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => setLoading(false))
  }, [])

  const handleSend = useCallback(async (text: string) => {
    if (!text.trim()) return
    try {
      const entry = await postMessage(text)
      setEntries((prev) => [entry, ...prev])
    } catch {
      // On failure, keep existing entries; could show toast later
    }
  }, [])

  return (
    <AppLayout>
      <MessageInput onSend={handleSend} disabled={loading} />
      <MessageLog entries={entries} />
    </AppLayout>
  )
}
