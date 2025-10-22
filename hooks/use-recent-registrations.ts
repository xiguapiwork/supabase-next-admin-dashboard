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
      
      // 获取最近注册的用户，按注册时间倒序排列
      const { data, error } = await supabase
        .from('user-management')
        .select(`
          id,
          username,
          avatar,
          created_at,
          role
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('获取最近注册用户失败:', error)
        throw new Error('获取最近注册用户失败')
      }

      // 由于Supabase的安全限制，无法直接查询auth.users表获取其他用户的邮箱
      // 只能获取当前登录用户的邮箱信息
      let currentUserEmail = ''
      let currentUserId = ''
      
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser()
        if (currentUser) {
          currentUserEmail = currentUser.email || ''
          currentUserId = currentUser.id
        }
      } catch (authError) {
        console.warn('无法获取当前用户信息:', authError)
      }

      // 合并用户数据和邮箱信息
      const result = data?.map(user => {
        return {
          id: user.id,
          username: user.username || '未知用户',
          // 只有当前登录用户才能显示邮箱，其他用户显示脱敏邮箱
          email: user.id === currentUserId ? currentUserEmail : '***@***.com',
          avatar: generateAvatarUrl({ avatar: user.avatar }) || '/default-avatar/苹果.png',
          created_at: user.created_at,
          role: user.role
        }
      }) || []

      return result
    },
    staleTime: 30 * 1000, // 30秒内数据被认为是新鲜的
    refetchInterval: 60 * 1000, // 每60秒自动刷新
  })
}