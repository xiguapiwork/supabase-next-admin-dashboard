'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

// 最多消耗统计数据类型
export interface TopConsumptionData {
  用户ID: string
  username: string
  user_email: string
  user_avatar: string
  total_consumption: number // 总消耗积分（绝对值）
  consumption_count: number // 消耗次数
  latest_consumption_time: string // 最近一次消耗时间
}

// 获取最多消耗统计数据
const fetchTopConsumption = async (): Promise<TopConsumptionData[]> => {
  try {
    const supabase = createClient()
    
    // 使用RPC函数获取积分日志数据
    const { data, error } = await supabase.rpc('get_points_logs_list')
    
    if (error) {
      console.error('获取消耗数据失败:', error)
      throw error
    }
    
    // 过滤出消耗记录（积分变动量小于0）
    const consumptionLogs = data?.filter((log: any) => log.积分变动量 < 0) || []
    
    // 在客户端进行数据聚合
    const userConsumptionMap = new Map<string, {
      用户ID: string
      username: string
      user_email: string
      user_avatar: string
      total_consumption: number
      consumption_count: number
      latest_consumption_time: string
    }>()
    
    consumptionLogs.forEach((log: any) => {
      const userId = log.用户ID
      const consumption = Math.abs(log.积分变动量) // 转为正值
      
      if (userConsumptionMap.has(userId)) {
        const existing = userConsumptionMap.get(userId)!
        existing.total_consumption += consumption
        existing.consumption_count += 1
        // 更新最近消耗时间（如果当前记录更新）
        if (new Date(log.创建时间) > new Date(existing.latest_consumption_time)) {
          existing.latest_consumption_time = log.创建时间
        }
      } else {
        userConsumptionMap.set(userId, {
          用户ID: userId,
          username: log.username || '未知用户',
          user_email: log.user_email || '',
          user_avatar: log.user_avatar || '',
          total_consumption: consumption,
          consumption_count: 1,
          latest_consumption_time: log.创建时间
        })
      }
    })
    
    // 转换为数组并按总消耗排序
    const result = Array.from(userConsumptionMap.values())
      .sort((a, b) => b.total_consumption - a.total_consumption)
      .slice(0, 5) // 只返回前5名
    
    return result
  } catch (error) {
    console.error('获取最多消耗统计数据时发生错误:', error)
    throw error
  }
}

// 使用最多消耗统计数据的hook
export const useTopConsumption = () => {
  return useQuery({
    queryKey: ['top-consumption'],
    queryFn: fetchTopConsumption,
    staleTime: 5 * 60 * 1000, // 5分钟内数据被认为是新鲜的
    refetchInterval: 10 * 60 * 1000, // 每10分钟自动刷新
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}