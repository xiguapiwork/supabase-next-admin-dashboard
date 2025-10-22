'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { generateAvatarUrl } from '@/lib/avatar-utils'

export interface RecentPaymentUser {
  id: string
  username: string
  email: string
  avatar: string
  created_at: string
  points_change: number
  reason: string
  exchange_card_number?: string
}

export function useRecentPayments(limit: number = 10) {
  return useQuery({
    queryKey: ['recent-payments', limit],
    queryFn: async (): Promise<RecentPaymentUser[]> => {
      const supabase = createClient()
      
      try {
        // 使用RPC函数获取最近的积分变动记录，筛选新用户兑换的记录
        const { data: pointsLogs, error } = await supabase.rpc('get_points_logs_list', {
          p_limit: limit,
          p_offset: 0,
          p_search_term: '',
          p_action_filter: 'card_redeem',
          p_sort_field: '创建时间',
          p_sort_order: 'desc'
        })

        if (error) {
          console.error('获取最近付费用户失败:', error)
          throw new Error('获取最近付费用户失败')
        }

        if (!pointsLogs || pointsLogs.length === 0) {
          return []
        }

        // 筛选出变动原因包含"新用户兑换"的记录
        const newUserRedemptions = pointsLogs.filter((log: any) => 
          log.变动原因 && log.变动原因.includes('新用户兑换')
        )

        // 转换数据格式
        const result = newUserRedemptions.map((log: any) => ({
          id: log.用户ID,
          username: log.username || '未知用户',
          email: log.user_email || '未知邮箱',
          avatar: generateAvatarUrl({ avatar: log.user_avatar }) || '/default-avatar/苹果.png',
          created_at: log.创建时间,
          points_change: log.积分变动量,
          reason: log.变动原因,
          exchange_card_number: log.兑换卡卡号
        }))

        return result.slice(0, limit) // 确保返回的数量不超过限制
      } catch (error) {
        console.error('获取最近付费用户时发生错误:', error)
        throw error
      }
    },
    staleTime: 30 * 1000, // 30秒内数据被认为是新鲜的
    refetchInterval: 60 * 1000, // 每60秒自动刷新
  })
}