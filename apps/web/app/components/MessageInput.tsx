'use client'

import React, { useState, useCallback, useRef } from 'react'
import styles from './MessageInput.module.css'

interface MessageInputProps {
  onSend: (text: string) => void
  disabled?: boolean
}

export function MessageInput({ onSend, disabled = false }: MessageInputProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const trimmed = value.trim()
      if (trimmed) {
        onSend(trimmed)
        setValue('')
        inputRef.current?.focus()
      }
    },
    [value, onSend]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmit(e as unknown as React.FormEvent)
      }
    },
    [handleSubmit]
  )

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.inputWrap}>
        <span className={styles.prompt}>&gt;</span>
        <textarea
          ref={inputRef}
          className={styles.input}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          aria-label="Message"
          disabled={disabled}
        />
      </div>
      <button
        type="submit"
        className={styles.send}
        disabled={disabled || !value.trim()}
      >
        SEND
      </button>
    </form>
  )
}
