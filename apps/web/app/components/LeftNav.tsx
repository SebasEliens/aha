'use client'

import React from 'react'
import styles from './LeftNav.module.css'

interface NavItem {
  id: string
  label: string
  icon: string
  href?: string
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: '⌂' },
  { id: 'projects', label: 'Projects', icon: '◫' },
  { id: 'analytics', label: 'Analytics', icon: '▦' },
  { id: 'documents', label: 'Documents', icon: '◱' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
]

interface LeftNavProps {
  activeItem?: string
  onSelect?: (id: string) => void
  userEmail?: string
  onLogout?: () => void
}

export function LeftNav({
  activeItem = 'home',
  onSelect,
  userEmail,
  onLogout,
}: LeftNavProps) {
  return (
    <nav className={styles.nav} aria-label="Main navigation">
      <div className={styles.brand}>
        <span className={styles.brandMark} aria-hidden>
          ◆
        </span>
        <span className={styles.brandName}>Aha</span>
      </div>

      <ul className={styles.list}>
        {navItems.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={[
                styles.item,
                activeItem === item.id ? styles.active : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => onSelect?.(item.id)}
              aria-current={activeItem === item.id ? 'page' : undefined}
            >
              <span className={styles.icon} aria-hidden>
                {item.icon}
              </span>
              <span className={styles.label}>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className={styles.footer}>
        {userEmail && (
          <div className={styles.user}>
            <div className={styles.avatar} aria-hidden>
              {userEmail.charAt(0).toUpperCase()}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userEmail} title={userEmail}>
                {userEmail}
              </span>
            </div>
          </div>
        )}
        {onLogout && (
          <button type="button" className={styles.logoutBtn} onClick={onLogout}>
            Sign out
          </button>
        )}
      </div>
    </nav>
  )
}
