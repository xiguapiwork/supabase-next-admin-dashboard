'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { generateAvatarUrl } from '@/lib/avatar-utils'

export interface RecentRegistrationUser {
  id: string
  username: string
  email: string
  avatar: string
  created_at: string
  role: string
}

export function useRecentRegistrations(limit: number = 10) {
  return useQuery({
    queryKey: ['recent-registrations', limit],
    queryFn: async (): Promise<RecentRegistrationUser[]> => {
      const supabase = createClient()
      
      try {
        // 使用管理员专用的RPC函数获取用户管理列表，包含完整邮箱信息
        const { data, error } = await supabase.rpc('get_users_management_list')

        if (error) {
          console.error('获取最近注册用户失败:', error)
          throw new Error('获取最近注册用户失败')
        }

        if (!data || data.length === 0) {
          return []
        }

        // 按创建时间倒序排列并限制数量
        const sortedData = data
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, limit)

        // 转换数据格式
        const result = sortedData.map((user: any) => ({
          id: user.id,
          username: user.username || '未知用户',
          email: user.email || '未知邮箱',
          avatar: generateAvatarUrl({ avatar: user.avatar }) || '/default-avatar/苹果.png',
          created_at: user.created_at,
          role: user.role
        }))

        return result
      } catch (error) {
        console.error('获取最近注册用户时发生错误:', error)
        throw error
      }
    },
    staleTime: 30 * 1000, // 30秒内数据被认为是新鲜的
    refetchInterval: 60 * 1000, // 每60秒自动刷新
  })
}