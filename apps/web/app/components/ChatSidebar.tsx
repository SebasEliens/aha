'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import type { Report } from '@/app/types'
import { mockReports } from '@/app/lib/mock-reports'
import styles from './ChatSidebar.module.css'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

const REPORT_NAMES = [
  'Marktanalyse Eindhoven (CBRE / Sonneborgh)',
  'Marktpotentie Particuliere Woonzorg Eindhoven (Wilgenboom)',
]

function buildReportResponse(reportIndex: number): string {
  const name = REPORT_NAMES[reportIndex]
  return `Ik heb uw verzoek geanalyseerd en het volgende rapport gegenereerd:\n\n**${name}**\n\nHet rapport is zichtbaar in het Rapport-tabblad. U kunt de secties doorlopen en de bevindingen bekijken.`
}

const MIN_WIDTH = 240
const MAX_WIDTH = 640
const DEFAULT_WIDTH = 320

interface ChatSidebarProps {
  className?: string
  onReportGenerated?: (report: Report) => void
}

export function ChatSidebar({
  className,
  onReportGenerated,
}: ChatSidebarProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [width, setWidth] = useState(DEFAULT_WIDTH)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const reportCountRef = useRef(0)
  const bottomRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const dragStartX = useRef(0)
  const dragStartWidth = useRef(0)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    isDragging.current = true
    dragStartX.current = e.clientX
    dragStartWidth.current = width

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return
      const delta = dragStartX.current - e.clientX
      setWidth(
        Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, dragStartWidth.current + delta))
      )
    }

    const handleMouseUp = () => {
      isDragging.current = false
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleSend = useCallback(() => {
    const text = input.trim()
    if (!text || isTyping) return

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    const reportIndex = reportCountRef.current % mockReports.length
    reportCountRef.current++
    const delay = 1000 + Math.random() * 800

    setTimeout(() => {
      const report = mockReports[reportIndex]
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: buildReportResponse(reportIndex),
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, assistantMsg])
      setIsTyping(false)
      onReportGenerated?.(report)
    }, delay)
  }, [input, isTyping, onReportGenerated])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    })

  if (!isOpen) {
    return (
      <aside
        className={[styles.sidebar, styles.collapsed, className]
          .filter(Boolean)
          .join(' ')}
        aria-label="Assistant (collapsed)"
      >
        <button
          type="button"
          className={styles.expandBtn}
          onClick={() => setIsOpen(true)}
          aria-label="Assistent uitklappen"
        >
          ‹
        </button>
      </aside>
    )
  }

  return (
    <aside
      className={[styles.sidebar, className].filter(Boolean).join(' ')}
      style={{ width }}
      aria-label="Assistant"
    >
      <div
        className={styles.resizeHandle}
        onMouseDown={handleResizeMouseDown}
        aria-hidden
        title="Drag to resize"
      />

      <header className={styles.header}>
        <span className={styles.headerTitle}>Assistent</span>
        <button
          type="button"
          className={styles.collapseBtn}
          onClick={() => setIsOpen(false)}
          aria-label="Assistent inklappen"
        >
          ›
        </button>
      </header>

      <div className={styles.messages} role="log" aria-live="polite">
        {messages.length === 0 && (
          <p className={styles.emptyHint}>
            Beschrijf uw project of stel een vraag om te beginnen met het
            opstellen van uw haalbaarheidsstudie.
          </p>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={[
              styles.messageWrap,
              msg.role === 'user' ? styles.userWrap : styles.assistantWrap,
            ].join(' ')}
          >
            {msg.role === 'assistant' && (
              <div className={styles.msgAvatar} aria-hidden>
                A
              </div>
            )}
            <div className={styles.bubble}>
              <p className={styles.bubbleText}>{msg.content}</p>
              <time className={styles.bubbleTime} dateTime={msg.timestamp}>
                {formatTime(msg.timestamp)}
              </time>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className={[styles.messageWrap, styles.assistantWrap].join(' ')}>
            <div className={styles.msgAvatar} aria-hidden>
              A
            </div>
            <div className={styles.bubble}>
              <div className={styles.typingIndicator} aria-label="Typing…">
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className={styles.inputArea}>
        <div className={styles.inputWrap}>
          <textarea
            className={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Typ een bericht…"
            rows={1}
            aria-label="Chat message"
            disabled={isTyping}
          />
          <button
            type="button"
            className={styles.sendBtn}
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            aria-label="Send message"
          >
            ➤
          </button>
        </div>
        <p className={styles.hint}>
          Enter om te verzenden · Shift+Enter voor nieuwe regel
        </p>
      </div>
    </aside>
  )
}
