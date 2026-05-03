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
      setError('Vul uw gebruikersnaam en wachtwoord in.')
      return
    }

    setLoading(true)
    if (username === 'aha' && password === '107km') {
      localStorage.setItem('aha_auth', JSON.stringify({ username }))
      router.replace('/chat')
    } else {
      setLoading(false)
      setError('Ongeldige gebruikersnaam of wachtwoord.')
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
        <h1 className={styles.heading}>Welkom terug</h1>
        <p className={styles.subheading}>Meld u aan met uw gegevens</p>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label htmlFor="username" className={styles.label}>
              Gebruikersnaam
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.input}
              placeholder="gebruikersnaam"
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>
              Wachtwoord
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
            {loading ? 'Bezig met aanmelden…' : 'Aanmelden'}
          </button>
        </form>

        <p className={styles.footer}>
          Geen account?{' '}
          <span className={styles.footerLink}>
            Neem contact op met uw beheerder.
          </span>
        </p>
      </div>
    </div>
  )
}
