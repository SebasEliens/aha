'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import styles from './ChatSidebar.module.css'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

const MOCK_RESPONSES = [
  'Ik heb uw verzoek bekeken. Ik analyseer de gegevens en bereid een samenvatting voor in het hoofdpaneel.',
  'Op basis van de beschikbare informatie kan ik u helpen dit onderdeel van het rapport te structureren.',
  'Ik genereer de relevante inhoud en toon deze in de werkruimte.',
  'Ik koppel dit terug aan de bestaande projectgegevens.',
  'Uw verzoek wordt verwerkt — de resultaten verschijnen binnenkort in het middenpaneel.',
  'Genoteerd. Wilt u dat ik een deel van de analyse verder uitwerk?',
]

function getNextResponse(index: number): string {
  return MOCK_RESPONSES[index % MOCK_RESPONSES.length]
}

const MIN_WIDTH = 240
const MAX_WIDTH = 640
const DEFAULT_WIDTH = 320

interface ChatSidebarProps {
  className?: string
}

export function ChatSidebar({ className }: ChatSidebarProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [width, setWidth] = useState(DEFAULT_WIDTH)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const responseCountRef = useRef(0)
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

    const responseIndex = responseCountRef.current++
    const delay = 800 + Math.random() * 600

    setTimeout(() => {
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: getNextResponse(responseIndex),
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, assistantMsg])
      setIsTyping(false)
    }, delay)
  }, [input, isTyping])

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
