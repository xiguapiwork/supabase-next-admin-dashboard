'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

// 最近消耗数据类型
export interface RecentConsumptionData {
  积分记录ID: string
  用户ID: string
  积分变动量: number
  变动前积分: number
  变动后积分: number
  变动类型: string
  变动原因: string
  任务ID: string
  创建时间: string
  username: string
  user_email: string
  user_avatar: string
}

// 格式化相对时间
export const formatRelativeTime = (timestamp: string): string => {
  const now = new Date()
  const date = new Date(timestamp)
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) {
    return '刚刚'
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}分钟前`
  } else if (diffInMinutes < 1440) { // 24小时
    const hours = Math.floor(diffInMinutes / 60)
    return `${hours}小时前`
  } else {
    const days = Math.floor(diffInMinutes / 1440)
    return `${days}天前`
  }
}

// 获取最近消耗数据
const fetchRecentConsumption = async (): Promise<RecentConsumptionData[]> => {
  const supabase = createClient()
  
  try {
    // 获取最近的负积分变动记录（消耗记录）
    const { data, error } = await supabase.rpc('get_points_logs_list', {
      p_limit: 10, // 获取最近10条记录
      p_offset: 0,
      p_search_term: null,
      p_action_filter: null, // 不过滤类型，在客户端过滤负值
      p_sort_field: '创建时间',
      p_sort_order: 'desc'
    })
    
    if (error) {
      console.error('获取最近消耗数据失败:', error)
      throw error
    }
    
    // 过滤出负积分变动（消耗）记录
    const consumptionData = (data || []).filter((log: RecentConsumptionData) => 
      log.积分变动量 < 0
    )
    
    return consumptionData.slice(0, 5) // 只返回最近5条消耗记录
  } catch (error) {
    console.error('获取最近消耗数据时发生错误:', error)
    throw error
  }
}

// 使用最近消耗数据的hook
export const useRecentConsumption = () => {
  return useQuery({
    queryKey: ['recent-consumption'],
    queryFn: fetchRecentConsumption,
    staleTime: 30 * 1000, // 30秒内数据被认为是新鲜的
    refetchInterval: 60 * 1000, // 每分钟自动刷新
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}