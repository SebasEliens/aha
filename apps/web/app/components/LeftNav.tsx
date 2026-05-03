'use client'

import React, { useState } from 'react'
import type { Project } from '@/app/types'
import styles from './LeftNav.module.css'

interface NavItem {
  id: string
  label: string
  icon: string
}

const navItems: NavItem[] = [
  { id: 'reports', label: 'Reports', icon: '▤' },
  { id: 'analytics', label: 'Analytics', icon: '▦' },
  { id: 'documents', label: 'Documents', icon: '◱' },
  { id: 'data', label: 'Data', icon: '⊞' },
]

interface LeftNavProps {
  activeItem?: string
  onSelect?: (id: string) => void
  projects?: Project[]
  activeProject?: Project | null
  onProjectChange?: (project: Project) => void
  onAddProject?: () => void
  onRenameProject?: (name: string) => void
  userEmail?: string
  onLogout?: () => void
}

export function LeftNav({
  activeItem = 'reports',
  onSelect,
  projects = [],
  activeProject = null,
  onProjectChange,
  onAddProject,
  onRenameProject,
  userEmail,
  onLogout,
}: LeftNavProps) {
  const [listOpen, setListOpen] = useState(false)
  const [editingName, setEditingName] = useState<string | null>(null)

  const handleNameSave = () => {
    if (editingName === null) return
    const trimmed = editingName.trim()
    setEditingName(null)
    if (trimmed && trimmed !== activeProject?.name) {
      onRenameProject?.(trimmed)
    }
  }

  const handleProjectClick = (project: Project) => {
    onProjectChange?.(project)
    setListOpen(false)
  }

  return (
    <nav className={styles.nav} aria-label="Main navigation">
      <div className={styles.brand}>
        <span className={styles.brandMark} aria-hidden>
          ◆
        </span>
        {editingName !== null ? (
          <input
            className={styles.brandNameInput}
            value={editingName}
            autoFocus
            onChange={(e) => setEditingName(e.target.value)}
            onBlur={handleNameSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.currentTarget.blur()
              if (e.key === 'Escape') setEditingName(null)
            }}
          />
        ) : (
          <span
            className={styles.brandName}
            role="button"
            tabIndex={0}
            title="Click to rename project"
            onClick={() => setEditingName(activeProject?.name ?? '')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ')
                setEditingName(activeProject?.name ?? '')
            }}
          >
            {activeProject?.name ?? 'Laden…'}
          </span>
        )}
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
        <div className={styles.projectSwitcher}>
          {listOpen && (
            <div
              className={styles.projectList}
              role="listbox"
              aria-label="Projects"
            >
              {projects.map((project) => (
                <button
                  key={project.id}
                  type="button"
                  role="option"
                  aria-selected={activeProject?.id === project.id}
                  className={[
                    styles.projectListItem,
                    activeProject?.id === project.id
                      ? styles.projectListItemActive
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => handleProjectClick(project)}
                >
                  <span className={styles.projectListItemName}>
                    {project.name}
                  </span>
                </button>
              ))}
              {projects.length > 0 && (
                <div className={styles.projectListDivider} role="separator" />
              )}
              <button
                type="button"
                className={styles.addProjectBtn}
                onClick={() => {
                  onAddProject?.()
                  setListOpen(false)
                }}
              >
                ＋ Nieuw project
              </button>
            </div>
          )}

          <button
            type="button"
            className={styles.projectBtn}
            onClick={() => setListOpen((v) => !v)}
            aria-expanded={listOpen}
            aria-haspopup="listbox"
          >
            <span className={styles.projectBtnMark} aria-hidden>
              ◆
            </span>
            <span className={styles.projectBtnName}>
              {activeProject?.name ?? 'Laden…'}
            </span>
            <span
              className={[
                styles.projectBtnChevron,
                listOpen ? styles.projectBtnChevronOpen : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-hidden
            >
              ▼
            </span>
          </button>
        </div>

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
            {onLogout && (
              <button
                type="button"
                className={styles.logoutBtn}
                onClick={onLogout}
              >
                Sign out
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
