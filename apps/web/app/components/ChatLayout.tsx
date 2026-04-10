import React, { type ReactNode } from 'react'
import styles from './ChatLayout.module.css'

interface ChatLayoutProps {
  leftNav: ReactNode
  rightSidebar: ReactNode
  children: ReactNode
}

export function ChatLayout({
  leftNav,
  rightSidebar,
  children,
}: ChatLayoutProps) {
  return (
    <div className={styles.shell}>
      {leftNav}
      <main className={styles.main}>{children}</main>
      {rightSidebar}
    </div>
  )
}
