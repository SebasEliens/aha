'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ChatLayout } from '../components/ChatLayout'
import { LeftNav } from '../components/LeftNav'
import { ChatSidebar } from '../components/ChatSidebar'
import { ReportView } from '../components/report/ReportView'
import {
  getProjects,
  createProject,
  getProject,
  patchProject,
} from '../lib/api'
import type { Project, Report } from '../types'
import styles from './chat.module.css'

const LS_AUTH = 'aha_auth'
const LS_PROJECT = 'aha_last_project'
const DEFAULT_PROJECT_NAME = 'Project 1'

const NAV_CONTENT: Record<string, { title: string; description: string }> = {
  reports: {
    title: 'Rapport',
    description: 'Bekijk rapporten gegenereerd door de assistent.',
  },
  analytics: {
    title: 'Analyse',
    description:
      'Bekijk statistieken en inzichten gegenereerd door de assistent.',
  },
  documents: {
    title: 'Documenten',
    description: 'Toegang tot en beheer van documenten en bijlagen.',
  },
  data: {
    title: 'Data',
    description: 'Verken en bevraag de databronnen van uw project.',
  },
}

export default function ChatPage() {
  const router = useRouter()
  const [activeNav, setActiveNav] = useState('reports')
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined)
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [activeReport, setActiveReport] = useState<Report | null>(null)

  // Auth check
  useEffect(() => {
    if (typeof window === 'undefined') return
    const raw = localStorage.getItem(LS_AUTH)
    if (!raw) {
      router.replace('/login')
      return
    }
    try {
      const data = JSON.parse(raw) as { username?: string; email?: string }
      setUserEmail(data.email ?? data.username)
    } catch {
      router.replace('/login')
    }
  }, [router])

  // Project loading
  const loadProjects = useCallback(async () => {
    try {
      const cachedId =
        typeof window !== 'undefined' ? localStorage.getItem(LS_PROJECT) : null

      if (cachedId) {
        try {
          const cached = await getProject(cachedId)
          setActiveProject(cached)
          const all = await getProjects()
          setProjects(all)
          return
        } catch {
          // stale ID or network error — fall through to full list fetch
        }
      }

      const all = await getProjects()
      setProjects(all)

      if (all.length > 0) {
        const first = all[0]
        setActiveProject(first)
        localStorage.setItem(LS_PROJECT, first.id)
      } else {
        const created = await createProject(DEFAULT_PROJECT_NAME)
        setActiveProject(created)
        setProjects([created])
        localStorage.setItem(LS_PROJECT, created.id)
      }
    } catch (err) {
      console.error('Could not load projects — is the API running?', err)
    }
  }, [])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const handleReportGenerated = (report: Report) => {
    setActiveReport(report)
    setActiveNav('reports')
  }

  const handleLogout = () => {
    localStorage.removeItem(LS_AUTH)
    router.replace('/login')
  }

  const handleProjectChange = (project: Project) => {
    setActiveProject(project)
    localStorage.setItem(LS_PROJECT, project.id)
  }

  const handleRenameProject = async (name: string) => {
    if (!activeProject) return
    try {
      const updated = await patchProject(activeProject.id, name)
      setActiveProject(updated)
      setProjects((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      )
    } catch (err) {
      console.error('Could not rename project', err)
    }
  }

  const handleAddProject = async () => {
    const name = window.prompt('Naam van het project:', DEFAULT_PROJECT_NAME)
    if (!name?.trim()) return
    try {
      const created = await createProject(name.trim())
      setProjects((prev) => [...prev, created])
      setActiveProject(created)
      localStorage.setItem(LS_PROJECT, created.id)
    } catch (err) {
      console.error('Could not create project', err)
    }
  }

  const content = NAV_CONTENT[activeNav] ?? NAV_CONTENT.reports

  return (
    <ChatLayout
      leftNav={
        <LeftNav
          activeItem={activeNav}
          onSelect={setActiveNav}
          projects={projects}
          activeProject={activeProject}
          onProjectChange={handleProjectChange}
          onAddProject={handleAddProject}
          onRenameProject={handleRenameProject}
          userEmail={userEmail}
          onLogout={handleLogout}
        />
      }
      rightSidebar={<ChatSidebar onReportGenerated={handleReportGenerated} />}
    >
      <div className={styles.content}>
        <header className={styles.topbar}>
          <h2 className={styles.pageTitle}>{content.title}</h2>
        </header>

        <div
          className={
            activeReport && activeNav === 'reports'
              ? styles.reportArea
              : styles.artifactArea
          }
        >
          {activeReport && activeNav === 'reports' ? (
            <ReportView report={activeReport} />
          ) : (
            <div className={styles.artifactPlaceholder}>
              <div className={styles.placeholderIcon} aria-hidden>
                ◫
              </div>
              <h3 className={styles.placeholderTitle}>Werkruimte</h3>
              <p className={styles.placeholderDesc}>{content.description}</p>
              <p className={styles.placeholderHint}>
                Stel de assistent een vraag om hier inhoud te genereren.
              </p>
            </div>
          )}
        </div>
      </div>
    </ChatLayout>
  )
}
