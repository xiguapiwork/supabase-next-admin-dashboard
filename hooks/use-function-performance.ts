'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface FunctionPerformance {
  id: string
  name: string
  type: string
  successRate: number
  totalCalls: number
  successCalls: number
}

export interface DateRangeStats {
  today: FunctionPerformance[]
  yesterday: FunctionPerformance[]
  week: FunctionPerformance[]
  month: FunctionPerformance[]
}

interface TaskRecord {
  任务名称: string
  任务类型: string
  状态: string
}

export function useFunctionPerformance() {
  const [data, setData] = useState<DateRangeStats>({
    today: [],
    yesterday: [],
    week: [],
    month: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const calculateDateRange = (days: number) => {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - days)
    return { start, end }
  }

  const getDateRangeForPeriod = (period: 'today' | 'yesterday' | 'week' | 'month') => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    switch (period) {
      case 'today':
        return {
          start: today,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      case 'yesterday':
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
        return {
          start: yesterday,
          end: today
        }
      case 'week':
        const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        return {
          start: weekStart,
          end: today
        }
      case 'month':
        const monthStart = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
        return {
          start: monthStart,
          end: today
        }
    }
  }

  const fetchFunctionPerformance = async (period: 'today' | 'yesterday' | 'week' | 'month'): Promise<FunctionPerformance[]> => {
    const supabase = createClient()
    const { start, end } = getDateRangeForPeriod(period)

    try {
      // 获取指定时间范围内的任务数据
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('任务名称, 任务类型, 状态')
        .gte('创建时间', start.toISOString())
        .lt('创建时间', end.toISOString()) as { data: TaskRecord[] | null, error: any }

      if (error) {
        throw error
      }

      if (!tasks || tasks.length === 0) {
        return []
      }

      // 按任务名称和类型分组统计
      const statsMap = new Map<string, {
        name: string
        type: string
        total: number
        success: number
      }>()

      tasks.forEach(task => {
        const key = `${task.任务名称}-${task.任务类型}`
        const existing = statsMap.get(key) || {
          name: task.任务名称,
          type: task.任务类型,
          total: 0,
          success: 0
        }

        existing.total += 1
        if (task.状态 === 'completed') {
          existing.success += 1
        }

        statsMap.set(key, existing)
      })

      // 转换为结果格式
      const results: FunctionPerformance[] = Array.from(statsMap.entries()).map(([key, stats]) => ({
        id: key,
        name: stats.name,
        type: stats.type,
        totalCalls: stats.total,
        successCalls: stats.success,
        successRate: stats.total > 0 ? Math.round((stats.success / stats.total) * 100 * 10) / 10 : 0
      }))

      // 按成功率排序
      return results.sort((a, b) => b.successRate - a.successRate)

    } catch (err) {
      console.error(`获取${period}功能性能数据失败:`, err)
      throw err
    }
  }

  const fetchAllData = async () => {
    setLoading(true)
    setError(null)

    try {
      const [todayData, yesterdayData, weekData, monthData] = await Promise.all([
        fetchFunctionPerformance('today'),
        fetchFunctionPerformance('yesterday'),
        fetchFunctionPerformance('week'),
        fetchFunctionPerformance('month')
      ])

      setData({
        today: todayData,
        yesterday: yesterdayData,
        week: weekData,
        month: monthData
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  return {
    data,
    loading,
    error,
    refetch: fetchAllData
  }
}