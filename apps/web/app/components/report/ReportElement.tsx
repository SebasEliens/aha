'use client'

import React from 'react'
import type { ReportElementData } from '@/app/types'
import styles from './report.module.css'

// ── Chart colours (matching CSS vars resolved to hex) ─────────────────────────
const CHART_COLORS = ['#2a9d8f', '#8b6f47', '#c4a882', '#21867a', '#3d2b1a']

// ── Inline SVG helpers ────────────────────────────────────────────────────────

interface ChartData {
  series: { label: string; values: number[] }[]
  labels: string[]
  yLabel?: string
}

const CHART_W = 720
const CHART_H = 220
const PAD = { top: 16, right: 24, bottom: 40, left: 56 }
const INNER_W = CHART_W - PAD.left - PAD.right
const INNER_H = CHART_H - PAD.top - PAD.bottom

function gridLines(min: number, max: number, ticks = 5) {
  const step = (max - min) / ticks
  return Array.from({ length: ticks + 1 }, (_, i) => min + i * step)
}

function fmt(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'k'
  return String(Math.round(n))
}

function LineChart({ data }: { data: ChartData }) {
  const allVals = data.series.flatMap((s) => s.values)
  const minV = 0
  const maxV = Math.max(...allVals) * 1.1

  const toX = (i: number) => PAD.left + (i / (data.labels.length - 1)) * INNER_W
  const toY = (v: number) =>
    PAD.top + INNER_H - ((v - minV) / (maxV - minV)) * INNER_H

  const lines = gridLines(minV, maxV)

  return (
    <svg
      className={styles.chartSvg}
      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      aria-label="Lijndiagram"
    >
      {/* Grid */}
      {lines.map((v, i) => (
        <g key={i}>
          <line
            x1={PAD.left}
            x2={PAD.left + INNER_W}
            y1={toY(v)}
            y2={toY(v)}
            className={styles.chartGridLine}
          />
          <text
            x={PAD.left - 6}
            y={toY(v) + 4}
            textAnchor="end"
            className={styles.chartAxisLabel}
          >
            {fmt(v)}
          </text>
        </g>
      ))}

      {/* X-axis labels */}
      {data.labels.map((lbl, i) => (
        <text
          key={i}
          x={toX(i)}
          y={CHART_H - 8}
          textAnchor="middle"
          className={styles.chartAxisLabel}
        >
          {lbl}
        </text>
      ))}

      {/* Series */}
      {data.series.map((s, si) => {
        const color = CHART_COLORS[si % CHART_COLORS.length]
        const pts = s.values.map((v, i) => `${toX(i)},${toY(v)}`).join(' ')
        return (
          <polyline
            key={si}
            points={pts}
            fill="none"
            stroke={color}
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )
      })}

      {/* Dots */}
      {data.series.map((s, si) => {
        const color = CHART_COLORS[si % CHART_COLORS.length]
        return s.values.map((v, i) => (
          <circle
            key={`${si}-${i}`}
            cx={toX(i)}
            cy={toY(v)}
            r={3.5}
            fill={color}
          />
        ))
      })}
    </svg>
  )
}

function BarChart({ data }: { data: ChartData }) {
  const allVals = data.series.flatMap((s) => s.values)
  const maxV = Math.max(...allVals) * 1.1
  const nLabels = data.labels.length
  const nSeries = data.series.length
  const groupW = INNER_W / nLabels
  const barW = Math.min((groupW * 0.6) / nSeries, 48)
  const lines = gridLines(0, maxV)

  const toY = (v: number) => PAD.top + INNER_H - (v / maxV) * INNER_H
  const toBarH = (v: number) => (v / maxV) * INNER_H

  return (
    <svg
      className={styles.chartSvg}
      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      aria-label="Staafdiagram"
    >
      {lines.map((v, i) => (
        <g key={i}>
          <line
            x1={PAD.left}
            x2={PAD.left + INNER_W}
            y1={toY(v)}
            y2={toY(v)}
            className={styles.chartGridLine}
          />
          <text
            x={PAD.left - 6}
            y={toY(v) + 4}
            textAnchor="end"
            className={styles.chartAxisLabel}
          >
            {fmt(v)}
          </text>
        </g>
      ))}

      {data.labels.map((lbl, i) => {
        const groupX = PAD.left + i * groupW + groupW * 0.2
        return (
          <g key={i}>
            {data.series.map((s, si) => {
              const color = CHART_COLORS[si % CHART_COLORS.length]
              const x = groupX + si * (barW + 3)
              const v = s.values[i]
              return (
                <rect
                  key={si}
                  x={x}
                  y={toY(v)}
                  width={barW}
                  height={toBarH(v)}
                  fill={color}
                  rx={2}
                />
              )
            })}
            <text
              x={PAD.left + i * groupW + groupW / 2}
              y={CHART_H - 8}
              textAnchor="middle"
              className={styles.chartAxisLabel}
            >
              {lbl}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function AreaChart({ data }: { data: ChartData }) {
  const allVals = data.series.flatMap((s) => s.values)
  const maxV = Math.max(...allVals) * 1.1
  const nPoints = data.labels.length

  const toX = (i: number) => PAD.left + (i / (nPoints - 1)) * INNER_W
  const toY = (v: number) => PAD.top + INNER_H - (v / maxV) * INNER_H
  const baseY = PAD.top + INNER_H
  const lines = gridLines(0, maxV)

  return (
    <svg
      className={styles.chartSvg}
      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      aria-label="Vlakdiagram"
    >
      <defs>
        {data.series.map((_, si) => {
          const color = CHART_COLORS[si % CHART_COLORS.length]
          return (
            <linearGradient
              key={si}
              id={`area-grad-${si}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          )
        })}
      </defs>

      {lines.map((v, i) => (
        <g key={i}>
          <line
            x1={PAD.left}
            x2={PAD.left + INNER_W}
            y1={toY(v)}
            y2={toY(v)}
            className={styles.chartGridLine}
          />
          <text
            x={PAD.left - 6}
            y={toY(v) + 4}
            textAnchor="end"
            className={styles.chartAxisLabel}
          >
            {fmt(v)}
          </text>
        </g>
      ))}

      {data.labels.map((lbl, i) => (
        <text
          key={i}
          x={toX(i)}
          y={CHART_H - 8}
          textAnchor="middle"
          className={styles.chartAxisLabel}
        >
          {lbl}
        </text>
      ))}

      {/* Render in reverse so first series is on top */}
      {[...data.series].reverse().map((s, rsi) => {
        const si = data.series.length - 1 - rsi
        const color = CHART_COLORS[si % CHART_COLORS.length]
        const linePoints = s.values
          .map((v, i) => `${toX(i)},${toY(v)}`)
          .join(' ')
        const areaPoints = [
          `${toX(0)},${baseY}`,
          ...s.values.map((v, i) => `${toX(i)},${toY(v)}`),
          `${toX(nPoints - 1)},${baseY}`,
        ].join(' ')

        return (
          <g key={si}>
            <polygon points={areaPoints} fill={`url(#area-grad-${si})`} />
            <polyline
              points={linePoints}
              fill="none"
              stroke={color}
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {s.values.map((v, i) => (
              <circle key={i} cx={toX(i)} cy={toY(v)} r={3.5} fill={color} />
            ))}
          </g>
        )
      })}
    </svg>
  )
}

// ── Main element renderer ─────────────────────────────────────────────────────

interface Props {
  element: ReportElementData
}

export function ReportElement({ element }: Props) {
  const { type, data, title } = element

  switch (type) {
    case 'stat_card': {
      const items: {
        label: string
        value: string
        unit?: string
        trendPositive?: boolean
      }[] = data.items ?? []
      return (
        <div className={styles.element}>
          <div className={styles.statCards}>
            {items.map((item, i) => (
              <div key={i} className={styles.statCard}>
                <div className={styles.statValueRow}>
                  <span
                    className={[
                      styles.statValue,
                      item.trendPositive === false && item.value.startsWith('+')
                        ? styles.statTrendNeg
                        : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {item.value}
                  </span>
                  {item.unit && (
                    <span className={styles.statUnit}>{item.unit}</span>
                  )}
                </div>
                <span className={styles.statLabel}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )
    }

    case 'text_block': {
      return (
        <div className={styles.element}>
          {title && <p className={styles.elementTitle}>{title}</p>}
          <div className={styles.textBlock}>{data.content}</div>
        </div>
      )
    }

    case 'data_table':
    case 'comparison_table': {
      const columns: string[] = data.columns ?? []
      const rows: (string[] | { cells: string[]; highlight?: boolean })[] =
        data.rows ?? []
      return (
        <div className={styles.element}>
          {title && <p className={styles.elementTitle}>{title}</p>}
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {columns.map((col, i) => (
                    <th key={i}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => {
                  const cells = Array.isArray(row) ? row : row.cells
                  const highlight = !Array.isArray(row) && row.highlight
                  return (
                    <tr
                      key={ri}
                      className={
                        highlight ? styles.tableRowHighlight : undefined
                      }
                    >
                      {cells.map((cell, ci) => (
                        <td key={ci}>{cell}</td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {data.note && <p className={styles.tableNote}>{data.note}</p>}
          </div>
        </div>
      )
    }

    case 'bullet_list': {
      const items: string[] = data.items ?? []
      return (
        <div className={styles.element}>
          {title && <p className={styles.elementTitle}>{title}</p>}
          <ul className={styles.bulletList}>
            {items.map((item, i) => (
              <li key={i} className={styles.bulletItem}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )
    }

    case 'line_chart': {
      const chartData: ChartData = {
        series: data.series,
        labels: data.labels,
        yLabel: data.yLabel,
      }
      const colors = data.series.map(
        (_: unknown, i: number) => CHART_COLORS[i % CHART_COLORS.length]
      )
      return (
        <div className={styles.element}>
          {title && <p className={styles.elementTitle}>{title}</p>}
          <div className={styles.chartWrap}>
            <LineChart data={chartData} />
            {data.series.length > 1 && (
              <div className={styles.chartLegend}>
                {data.series.map((s: { label: string }, i: number) => (
                  <div key={i} className={styles.chartLegendItem}>
                    <span
                      className={styles.chartLegendDot}
                      style={{ background: colors[i] }}
                    />
                    {s.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )
    }

    case 'bar_chart': {
      const chartData: ChartData = {
        series: data.series,
        labels: data.labels,
        yLabel: data.yLabel,
      }
      const colors = data.series.map(
        (_: unknown, i: number) => CHART_COLORS[i % CHART_COLORS.length]
      )
      return (
        <div className={styles.element}>
          {title && <p className={styles.elementTitle}>{title}</p>}
          <div className={styles.chartWrap}>
            <BarChart data={chartData} />
            {data.series.length > 1 && (
              <div className={styles.chartLegend}>
                {data.series.map((s: { label: string }, i: number) => (
                  <div key={i} className={styles.chartLegendItem}>
                    <span
                      className={styles.chartLegendDot}
                      style={{ background: colors[i] }}
                    />
                    {s.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )
    }

    case 'area_chart': {
      const chartData: ChartData = {
        series: data.series,
        labels: data.labels,
        yLabel: data.yLabel,
      }
      const colors = data.series.map(
        (_: unknown, i: number) => CHART_COLORS[i % CHART_COLORS.length]
      )
      return (
        <div className={styles.element}>
          {title && <p className={styles.elementTitle}>{title}</p>}
          <div className={styles.chartWrap}>
            <AreaChart data={chartData} />
            {data.series.length > 1 && (
              <div className={styles.chartLegend}>
                {data.series.map((s: { label: string }, i: number) => (
                  <div key={i} className={styles.chartLegendItem}>
                    <span
                      className={styles.chartLegendDot}
                      style={{ background: colors[i] }}
                    />
                    {s.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )
    }

    case 'two_column_layout': {
      const left: ReportElementData[] = data.left ?? []
      const right: ReportElementData[] = data.right ?? []
      return (
        <div className={styles.twoCol}>
          <div className={styles.elements}>
            {left.map((el) => (
              <ReportElement key={el.id} element={el} />
            ))}
          </div>
          <div className={styles.elements}>
            {right.map((el) => (
              <ReportElement key={el.id} element={el} />
            ))}
          </div>
        </div>
      )
    }

    case 'section_divider': {
      return <hr className={styles.sectionDivider} />
    }

    default:
      return null
  }
}
