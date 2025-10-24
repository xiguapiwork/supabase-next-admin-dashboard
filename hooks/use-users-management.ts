'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export interface UserManagementData {
  id: string
  avatar: string
  username: string
  email: string
  roles: string[]
  currentPoints: number
  totalConsumedPoints: number
  totalUsage: number
  todayPoints: number
  weekPoints: number
  joinDate: string
  lastActiveTime: string
  notes: string
}

// 获取用户管理数据
const fetchUsersManagement = async (): Promise<UserManagementData[]> => {
  const supabase = createClient()

  try {
    // 使用新的RPC函数获取用户基础信息（包含完整邮箱）
    const { data: users, error: usersError } = await supabase
      .rpc('get_users_management_list')

    if (usersError) {
      throw new Error(`获取用户数据失败: ${usersError.message}`)
    }

    if (!users || users.length === 0) {
      return []
    }

    // 获取积分日志数据用于计算今日和7日消耗
    const { data: pointsLogs, error: logsError } = await supabase
      .rpc('get_points_logs_list', {
        p_limit: 10000,
        p_offset: 0,
        p_search_term: '',
        p_action_filter: '',
        p_sort_field: '创建时间',
        p_sort_order: 'desc'
      })

    if (logsError) {
      console.warn('获取积分日志失败:', logsError)
    }

    // 计算日期范围
    const today = new Date()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const weekAgo = new Date(todayStart)
    weekAgo.setDate(weekAgo.getDate() - 7)

    // 处理用户数据
    const processedUsers: UserManagementData[] = users.map((user: any) => {
      // 计算今日消耗
      const todayConsumption = pointsLogs
        ?.filter((log: any) => 
          log.用户ID === user.id && 
          log.积分变动量 < 0 && 
          new Date(log.创建时间) >= todayStart
        )
        ?.reduce((sum: number, log: any) => sum + Math.abs(log.积分变动量), 0) || 0

      // 计算7日消耗
      const weekConsumption = pointsLogs
        ?.filter((log: any) => 
          log.用户ID === user.id && 
          log.积分变动量 < 0 && 
          new Date(log.创建时间) >= weekAgo
        )
        ?.reduce((sum: number, log: any) => sum + Math.abs(log.积分变动量), 0) || 0

      // 角色映射
      const roleMapping: Record<string, string> = {
        'admin': '管理员',
        'paid': '付费用户',
        'user': '普通用户'
      }

      // 生成头像URL
      const avatarUrl = user.avatar ? 
        (user.avatar.startsWith('http') ? user.avatar : 
         user.avatar.endsWith('.png') ? `/default-avatar/${user.avatar}` : `/default-avatar/${user.avatar}.png`) : 
        '/default-avatar/苹果.png'

      // 获取用户邮箱（现在直接从RPC函数返回完整邮箱）
      const email = user.email || '未知邮箱'

      return {
        id: user.id,
        avatar: avatarUrl,
        username: user.username || '未知用户',
        email: email,
        roles: [roleMapping[user.role] || '普通用户'],
        currentPoints: user.points || 0,
        totalConsumedPoints: user.total_usage || 0,
        totalUsage: user.total_usage || 0,
        todayPoints: todayConsumption,
        weekPoints: weekConsumption,
        joinDate: user.created_at ? new Date(user.created_at).toISOString().split('T')[0] : '',
        lastActiveTime: user.updated_at ? 
          new Date(user.updated_at).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          }).replace(/\//g, '-') : '',
        notes: user.备注 || ''
      }
    })

    return processedUsers
  } catch (error) {
    console.error('获取用户管理数据时发生错误:', error)
    throw error
  }
}

// 积分调整功能
export const adjustUserPoints = async (
  userId: string, 
  pointsChange: number, 
  reason: string
): Promise<void> => {
  const supabase = createClient()
  
  // 获取当前登录用户（操作人）
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  if (!currentUser) {
    throw new Error('未登录，无法执行积分调整')
  }
  
  // 调用积分变动函数
  const { data, error } = await supabase.rpc('add_points_log', {
    p_user_id: userId,
    p_points_change: pointsChange,
    p_change_type: 'admin_adjust',
    p_reason: reason,
    p_exchange_card_number: null,
    p_task_id: null,
    p_operator_id: currentUser.id
  })
  
  if (error) {
    throw new Error(`积分调整失败: ${error.message}`)
  }
  
  return data
}

export const useUsersManagement = () => {
  return useQuery({
    queryKey: ['users-management'],
    queryFn: fetchUsersManagement,
    retry: 2,
    staleTime: 2 * 60 * 1000, // 2分钟内数据被认为是新鲜的
    refetchInterval: 30 * 1000, // 每30秒自动刷新一次
  })
}