export interface LogEntry {
  id: string
  text: string
  timestamp: string
  mocked: boolean
}

export interface Project {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export type ReportElementType =
  | 'cover_page'
  | 'stat_card'
  | 'data_table'
  | 'bar_chart'
  | 'line_chart'
  | 'area_chart'
  | 'bullet_list'
  | 'text_block'
  | 'comparison_table'
  | 'two_column_layout'
  | 'section_divider'

export interface ReportElementData {
  id: string
  type: ReportElementType
  title?: string
  data: any
}

export type ReportSectionType =
  | 'cover'
  | 'executive_summary'
  | 'content'
  | 'bibliography'

export interface ReportSection {
  id: string
  title: string
  type: ReportSectionType
  elements: ReportElementData[]
}

export interface Report {
  id: string
  name: string
  status: 'draft' | 'published'
  sections: ReportSection[]
}
