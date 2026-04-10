import React from 'react'
import type { LogEntry } from '@/app/types'
import styles from './MessageLog.module.css'

interface MessageLogProps {
  entries: LogEntry[]
}

export function MessageLog({ entries }: MessageLogProps) {
  if (entries.length === 0) {
    return (
      <div className={styles.empty} aria-live="polite">
        <span className={styles.emptyLabel}>{'// no messages yet'}</span>
        <span className={styles.emptyHint}>
          Send a message to see it logged
        </span>
      </div>
    )
  }

  return (
    <ul className={styles.list} aria-live="polite">
      {entries.map((entry) => (
        <li key={entry.id} className={styles.entry}>
          <span className={styles.time}>
            {new Date(entry.timestamp).toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </span>
          <span className={styles.text}>{entry.text}</span>
          {entry.mocked && (
            <span className={styles.badge} title="Mocked (not sent to server)">
              MOCK
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}
