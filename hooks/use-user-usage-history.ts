'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export interface UserUsageHistoryRecord {
  time: string
  feature: string
  points: number
  status: string
  taskId?: string
  type: 'feature_usage' | 'admin_adjust'
}

// 格式化时间为 YYYY-MM-DD HH:mm 格式
const formatDateTime = (dateString: string) => {
  try {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace(/\//g, '-')
  } catch {
    return '未知时间'
  }
}

// 根据变动原因推断功能名称
const inferFeatureName = (reason: string, type: string) => {
  if (type === 'admin_adjust') {
    return `管理员调整：${reason}`
  }
  
  // 尝试从变动原因中提取功能名称
  if (reason.includes('功能')) {
    return reason
  }
  
  // 根据常见的使用场景推断
  if (reason.includes('批量') || reason.includes('处理')) {
    return '功能一：批量处理'
  } else if (reason.includes('AI') || reason.includes('分析')) {
    return '功能二：AI分析'
  } else if (reason.includes('导出') || reason.includes('下载')) {
    return '功能三：数据导出'
  } else if (reason.includes('查询') || reason.includes('搜索')) {
    return '功能四：高级查询'
  }
  
  return `功能使用：${reason}`
}

// 推断使用状态
const inferUsageStatus = (reason: string, points: number) => {
  // 如果变动原因中包含失败相关的词汇
  if (reason.includes('失败') || reason.includes('错误') || reason.includes('异常')) {
    return '失败'
  }
  
  // 如果是负数积分变动，通常表示成功使用
  if (points < 0) {
    return '成功'
  }
  
  return '成功'
}

// 获取用户使用历史（扣除积分的记录）
export function useUserUsageHistory(userId: string, limit: number = 50) {
  return useQuery({
    queryKey: ['user-usage-history', userId, limit],
    queryFn: async (): Promise<UserUsageHistoryRecord[]> => {
      const supabase = createClient()
      
      try {
        // 使用RPC函数获取积分日志数据，避免中文字段名的URL编码问题
        const { data: pointsLogs, error } = await supabase.rpc('get_points_logs_list', {
          p_limit: limit * 2, // 获取更多数据，因为需要在客户端过滤
          p_offset: 0,
          p_search_term: null,
          p_action_filter: null,
          p_sort_field: '创建时间',
          p_sort_order: 'desc'
        })

        if (error) {
          console.error('获取用户使用历史失败:', error)
          return []
        }

        if (!pointsLogs || pointsLogs.length === 0) {
          return []
        }

        // 过滤出指定用户的扣除积分记录
        const userUsageLogs = pointsLogs
          .filter((log: any) => log.用户id === userId && log.积分变动量 < 0)  // 修复：使用小写的 id
          .slice(0, limit) // 限制返回数量

        // 转换数据格式
        const result: UserUsageHistoryRecord[] = userUsageLogs.map((log: any) => {
          const featureName = inferFeatureName(log.变动原因, log.变动类型)
          const status = inferUsageStatus(log.变动原因, log.积分变动量)

          return {
            time: formatDateTime(log.创建时间),
            feature: featureName,
            points: log.积分变动量, // 保持负数，表示扣除
            status,
            taskId: log.任务ID,
            type: log.变动类型 as 'feature_usage' | 'admin_adjust'
          }
        })

        return result
      } catch (error) {
        console.error('获取用户使用历史时发生错误:', error)
        return []
      }
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5分钟内不重新获取
    retry: 1
  })
}