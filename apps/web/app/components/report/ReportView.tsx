'use client'

import React from 'react'
import type { Report, ReportSectionType } from '@/app/types'
import { ReportElement } from './ReportElement'
import styles from './report.module.css'

const SECTION_BADGE: Record<ReportSectionType, string> = {
  cover: 'Voorpagina',
  executive_summary: 'Samenvatting',
  content: 'Inhoud',
  bibliography: 'Bronnen',
}

interface ReportViewProps {
  report: Report
}

export function ReportView({ report }: ReportViewProps) {
  return (
    <article className={styles.reportView}>
      <h1 className={styles.reportTitle}>{report.name}</h1>
      <p className={styles.reportMeta}>
        {report.status === 'published' ? 'Gepubliceerd' : 'Concept'} &middot;{' '}
        {report.sections.length} secties
      </p>

      {report.sections.map((section) => (
        <section key={section.id} className={styles.section}>
          <header className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{section.title}</h2>
            <span className={styles.sectionBadge}>
              {SECTION_BADGE[section.type]}
            </span>
          </header>
          <div className={styles.elements}>
            {section.elements.map((el) => (
              <ReportElement key={el.id} element={el} />
            ))}
          </div>
        </section>
      ))}
    </article>
  )
}
