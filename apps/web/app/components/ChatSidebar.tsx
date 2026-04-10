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
  "I've reviewed your request. Let me analyze the data and prepare a summary for the main panel.",
  "That's a great question. Based on the available information, I can help you with that.",
  "I understand. I'll generate the relevant artifacts and display them in the workspace.",
  'Sure! I can help you explore that topic. What specific aspect would you like to focus on?',
  "Processing your request now. You'll see the results in the center panel shortly.",
  "I've noted that. Is there anything else you'd like me to look into?",
  'Interesting perspective. Let me cross-reference that with the existing data.',
]

function getNextResponse(index: number): string {
  return MOCK_RESPONSES[index % MOCK_RESPONSES.length]
}

interface ChatSidebarProps {
  className?: string
}

export function ChatSidebar({ className }: ChatSidebarProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      role: 'assistant',
      content:
        "Hello! I'm your Aha assistant. How can I help you today? You can ask me anything and I'll display relevant information in the workspace.",
      timestamp: new Date().toISOString(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const responseCountRef = useRef(0)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

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

  return (
    <aside
      className={[styles.sidebar, className].filter(Boolean).join(' ')}
      aria-label="Assistant chat"
    >
      <header className={styles.header}>
        <div className={styles.headerInfo}>
          <div className={styles.assistantAvatar} aria-hidden>
            A
          </div>
          <div>
            <div className={styles.assistantName}>Aha Assistant</div>
            <div className={styles.assistantStatus}>
              <span className={styles.statusDot} aria-hidden />
              Online
            </div>
          </div>
        </div>
      </header>

      <div className={styles.messages} role="log" aria-live="polite">
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
            ref={textareaRef}
            className={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
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
          Press Enter to send · Shift+Enter for newline
        </p>
      </div>
    </aside>
  )
}
