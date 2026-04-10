import React, { type ReactNode } from 'react'
import styles from './AppLayout.module.css'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.grid} aria-hidden />
      <header className={styles.header}>
        <h1 className={styles.title}>SOURDOUGH</h1>
        <span className={styles.subtitle}>{'// message terminal'}</span>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  )
}
