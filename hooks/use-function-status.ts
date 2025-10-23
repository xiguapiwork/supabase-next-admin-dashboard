'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export interface FunctionStatusData {
  totalTasks: number
  successfulTasks: number
  successRate: number
  functionStats: {
    name: string
    count: number
    successCount: number
    successRate: number
  }[]
}

export function useFunctionStatus() {
  return useQuery({
    queryKey: ['function-status'],
    queryFn: async (): Promise<FunctionStatusData> => {
      const supabase = createClient()
      
      // 获取所有任务数据
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('"任务类型", "状态"')
      
      if (error) {
        throw new Error(`获取任务数据失败: ${error.message}`)
      }
      
      if (!tasks || tasks.length === 0) {
        return {
          totalTasks: 0,
          successfulTasks: 0,
          successRate: 0,
          functionStats: []
        }
      }
      
      // 计算总体统计
      const totalTasks = tasks.length
      const successfulTasks = tasks.filter((task: any) => task['状态'] === 'completed').length
      const successRate = totalTasks > 0 ? Math.round((successfulTasks / totalTasks) * 100) : 0
      
      // 按功能类型分组统计
      const functionMap = new Map<string, { total: number; success: number }>()
      
      tasks.forEach((task: any) => {
        const functionType = task['任务类型'] || '未知功能'
        const isSuccess = task['状态'] === 'completed'
        
        if (!functionMap.has(functionType)) {
          functionMap.set(functionType, { total: 0, success: 0 })
        }
        
        const stats = functionMap.get(functionType)!
        stats.total += 1
        if (isSuccess) {
          stats.success += 1
        }
      })
      
      // 转换为数组并按使用次数排序
      const functionStats = Array.from(functionMap.entries())
        .map(([name, stats]) => ({
          name: getFunctionDisplayName(name),
          count: stats.total,
          successCount: stats.success,
          successRate: stats.total > 0 ? Math.round((stats.success / stats.total) * 100) : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3) // 只取前3个
      
      return {
        totalTasks,
        successfulTasks,
        successRate,
        functionStats
      }
    },
    refetchInterval: 30000, // 30秒刷新一次
  })
}

// 将任务类型转换为显示名称
function getFunctionDisplayName(taskType: string): string {
  const displayNames: Record<string, string> = {
    'image_generation': '图像生成',
    'text_analysis': '文本分析',
    'api_call': 'API调用',
    'data_processing': '数据处理',
    'report_generation': '报告生成',
    'translation': '翻译服务',
    'ocr': '文字识别',
    'voice_synthesis': '语音合成'
  }
  
  return displayNames[taskType] || taskType || '未知功能'
}