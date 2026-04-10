'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { AppLayout } from '../components/AppLayout'
import styles from './admin.module.css'

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [clearLoading, setClearLoading] = useState(false)
  const [clearDone, setClearDone] = useState(false)

  const checkSession = useCallback(async () => {
    const res = await fetch('/api/admin/session')
    const data = (await res.json()) as { ok: boolean }
    setLoggedIn(data.ok)
  }, [])

  useEffect(() => {
    checkSession()
  }, [checkSession])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    const data = (await res.json()) as { ok: boolean }
    if (data.ok) {
      setLoggedIn(true)
      setPassword('')
    } else {
      setLoginError('Invalid password')
    }
  }

  const handleClear = async () => {
    setClearLoading(true)
    setClearDone(false)
    try {
      const res = await fetch('/api/admin/clear-messages', { method: 'POST' })
      if (res.ok) setClearDone(true)
    } finally {
      setClearLoading(false)
    }
  }

  if (loggedIn === null) {
    return (
      <AppLayout>
        <p className={styles.status}>Checking…</p>
      </AppLayout>
    )
  }

  if (!loggedIn) {
    return (
      <AppLayout>
        <div className={styles.panel}>
          <h2 className={styles.heading}>Admin login</h2>
          <form onSubmit={handleLogin} className={styles.form}>
            <label htmlFor="admin-password" className={styles.label}>
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              autoComplete="current-password"
              required
            />
            {loginError && <p className={styles.error}>{loginError}</p>}
            <button type="submit" className={styles.button}>
              Log in
            </button>
          </form>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className={styles.panel}>
        <h2 className={styles.heading}>Admin</h2>
        <p className={styles.hint}>Clear all messages from the backend.</p>
        <button
          type="button"
          onClick={handleClear}
          disabled={clearLoading}
          className={styles.buttonDanger}
        >
          {clearLoading ? 'Clearing…' : 'Clear all messages'}
        </button>
        {clearDone && <p className={styles.success}>Messages cleared.</p>}
        <Link href="/" className={styles.link}>
          ← Back to terminal
        </Link>
      </div>
    </AppLayout>
  )
}
