'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import styles from './Login.module.css'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('aha_auth')) {
      router.replace('/chat')
    }
  }, [router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username.trim() || !password.trim()) {
      setError('Please enter your username and password.')
      return
    }

    setLoading(true)
    if (username === 'aha' && password === '107km') {
      localStorage.setItem('aha_auth', JSON.stringify({ username }))
      router.replace('/chat')
    } else {
      setLoading(false)
      setError('Invalid username or password.')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <span className={styles.brandMark} aria-hidden>
            ◆
          </span>
          <span className={styles.brandName}>Aha</span>
        </div>
        <h1 className={styles.heading}>Welcome back</h1>
        <p className={styles.subheading}>Sign in with your credentials</p>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label htmlFor="username" className={styles.label}>
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.input}
              placeholder="username"
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p role="alert" className={styles.error}>
              {error}
            </p>
          )}

          <button
            type="submit"
            className={styles.submit}
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className={styles.footer}>
          Don&apos;t have an account?{' '}
          <span className={styles.footerLink}>Contact your administrator.</span>
        </p>
      </div>
    </div>
  )
}
