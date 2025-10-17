'use client'

import { createContext, useContext, useEffect, useMemo, useState, ReactNode, useCallback } from 'react'

export type TableBorderType = 'horizontal' | 'vertical' | 'both'

interface AppSettings {
  pageSize: number
  setPageSize: (size: number) => void
  pointsFormat: 'integer' | 'decimal'
  setPointsFormat: (format: 'integer' | 'decimal') => void
  tableBorder: TableBorderType
  setTableBorder: (border: TableBorderType) => void
}

const DEFAULT_PAGE_SIZE = 10
const DEFAULT_POINTS_FORMAT: 'integer' | 'decimal' = 'integer'
const DEFAULT_TABLE_BORDER: TableBorderType = 'horizontal'
const STORAGE_KEY = 'app.pageSize'
const POINTS_FORMAT_STORAGE_KEY = 'app.pointsFormat'
const TABLE_BORDER_STORAGE_KEY = 'app.tableBorder'

const AppSettingsContext = createContext<AppSettings | undefined>(undefined)

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [pageSize, setPageSizeState] = useState<number>(DEFAULT_PAGE_SIZE)
  const [pointsFormat, setPointsFormatState] = useState<'integer' | 'decimal'>(DEFAULT_POINTS_FORMAT)
  const [tableBorder, setTableBorderState] = useState<TableBorderType>(DEFAULT_TABLE_BORDER)

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null
      if (raw) {
        const parsed = parseInt(raw, 10)
        if (!Number.isNaN(parsed) && parsed > 0) {
          setPageSizeState(parsed)
        }
      }
    } catch {}

    try {
      const pointsFormatRaw = typeof window !== 'undefined' ? window.localStorage.getItem(POINTS_FORMAT_STORAGE_KEY) : null
      if (pointsFormatRaw && (pointsFormatRaw === 'integer' || pointsFormatRaw === 'decimal')) {
        setPointsFormatState(pointsFormatRaw)
      }
    } catch {}

    try {
      const tableBorderRaw = typeof window !== 'undefined' ? window.localStorage.getItem(TABLE_BORDER_STORAGE_KEY) : null
      if (tableBorderRaw && (tableBorderRaw === 'horizontal' || tableBorderRaw === 'vertical' || tableBorderRaw === 'both')) {
        setTableBorderState(tableBorderRaw)
      }
    } catch {}
  }, [])

  const setPageSize = useCallback((n: number) => {
    const value = Number.isFinite(n) && n > 0 ? Math.floor(n) : DEFAULT_PAGE_SIZE
    setPageSizeState(value)
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, String(value))
      }
    } catch {}
  }, [])

  const setPointsFormat = useCallback((format: 'integer' | 'decimal') => {
    setPointsFormatState(format)
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(POINTS_FORMAT_STORAGE_KEY, format)
      }
    } catch {}
  }, [])

  const setTableBorder = useCallback((border: TableBorderType) => {
    setTableBorderState(border)
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(TABLE_BORDER_STORAGE_KEY, border)
      }
    } catch {}
  }, [])

  const value = useMemo<AppSettings>(() => ({ pageSize, setPageSize, pointsFormat, setPointsFormat, tableBorder, setTableBorder }), [pageSize, setPageSize, pointsFormat, setPointsFormat, tableBorder, setTableBorder])

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>
}

export function useAppSettings(): AppSettings {
  const ctx = useContext(AppSettingsContext)
  if (!ctx) throw new Error('useAppSettings must be used within AppSettingsProvider')
  return ctx
}