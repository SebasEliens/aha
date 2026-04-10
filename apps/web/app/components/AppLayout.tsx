import React, { type ReactNode } from 'react'
import styles from './AppLayout.module.css'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <h1 className={styles.title}>Aha</h1>
        <span className={styles.subtitle}>{'// workspace terminal'}</span>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  )
}
