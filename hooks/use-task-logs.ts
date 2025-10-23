'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { generateAvatarUrl } from '@/lib/avatar-utils'

// 任务日志数据类型
export interface TaskLogData {
  id: string
  taskTime: string
  taskId: string
  operatorUser: string
  operatorEmail: string
  operatorAvatar: string
  usedFunction: string
  status: string
  usageDetails: string
  userId: string
  createdAt: string
  updatedAt: string
}

// 状态映射
const statusMap: Record<string, string> = {
  'pending': '等待中',
  'processing': '处理中',
  'completed': '已完成',
  'failed': '失败',
  'cancelled': '已取消'
}

// 格式化时间函数（不显示年份）
const formatTaskTime = (timestamp: string) => {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

// 获取任务日志数据的函数
const fetchTaskLogs = async (params: {
  limit: number
  offset: number
  searchTerm: string
  statusFilter: string
  sortField: string
  sortOrder: string
}): Promise<TaskLogData[]> => {
  const supabase = createClient()

  try {
    // 构建查询
    let query = supabase
      .from('tasks')
      .select('*')

    // 添加搜索条件
    if (params.searchTerm) {
      query = query.or(`任务名称.ilike.%${params.searchTerm}%,任务详情.ilike.%${params.searchTerm}%`)
    }

    // 添加状态筛选
    if (params.statusFilter && params.statusFilter !== 'all') {
      query = query.eq('状态', params.statusFilter)
    }

    // 添加排序
    const sortField = params.sortField === 'taskTime' ? '创建时间' : 
                     params.sortField === 'status' ? '状态' :
                     params.sortField === 'function' ? '任务名称' : '创建时间'
    
    query = query.order(sortField, { ascending: params.sortOrder === 'asc' })

    // 添加分页
    query = query.range(params.offset, params.offset + params.limit - 1)

    const { data: tasks, error } = await query

    if (error) {
      console.error('获取任务日志失败:', error)
      throw error
    }

    if (!tasks || tasks.length === 0) {
      return []
    }

    // 获取当前登录用户信息
    const { data: { user: currentUser } } = await supabase.auth.getUser()

    // 获取所有相关用户的信息
    const userIds = [...new Set(tasks.map((task: any) => task.用户id))]
    const { data: users, error: usersError } = await supabase
      .from('user-management')
      .select('id, username, avatar')
      .in('id', userIds)

    if (usersError) {
      console.warn('获取用户信息失败:', usersError)
    }

    // 创建用户信息映射
    const userMap = new Map()
    users?.forEach(user => {
      userMap.set(user.id, {
        username: user.username || '未知用户',
        avatar: generateAvatarUrl({ avatar: user.avatar }) || '/default-avatar/苹果.png',
        email: user.id === currentUser?.id ? (currentUser?.email || '') : '***@***.com'
      })
    })

    // 转换数据格式
    const result: TaskLogData[] = tasks.map((task: any) => {
      const userInfo = userMap.get(task.用户id) || {
        username: '未知用户',
        avatar: '/default-avatar/苹果.png',
        email: '***@***.com'
      }

      return {
        id: task.任务id,
        taskTime: formatTaskTime(task.创建时间),
        taskId: task.任务id,
        operatorUser: userInfo.username,
        operatorEmail: userInfo.email,
        operatorAvatar: userInfo.avatar,
        usedFunction: task.任务名称,
        status: statusMap[task.状态] || task.状态,
        usageDetails: task.任务详情 || '无详情',
        userId: task.用户id,
        createdAt: task.创建时间,
        updatedAt: task.更新时间
      }
    })

    return result
  } catch (error) {
    console.error('获取任务日志时发生错误:', error)
    throw error
  }
}

// 获取任务日志总数的函数
const fetchTaskLogsCount = async (params: {
  searchTerm: string
  statusFilter: string
}): Promise<number> => {
  const supabase = createClient()

  try {
    let query = supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })

    // 添加搜索条件
    if (params.searchTerm) {
      query = query.or(`任务名称.ilike.%${params.searchTerm}%,任务详情.ilike.%${params.searchTerm}%`)
    }

    // 添加状态筛选
    if (params.statusFilter && params.statusFilter !== 'all') {
      query = query.eq('状态', params.statusFilter)
    }

    const { count, error } = await query

    if (error) {
      console.error('获取任务日志总数失败:', error)
      throw error
    }

    return count || 0
  } catch (error) {
    console.error('获取任务日志总数时发生错误:', error)
    throw error
  }
}

// 自定义hook
export function useTaskLogs(params: {
  limit: number
  offset: number
  searchTerm: string
  statusFilter: string
  sortField: string
  sortOrder: string
}) {
  return useQuery({
    queryKey: ['task-logs', params],
    queryFn: () => fetchTaskLogs(params),
    retry: 2,
    staleTime: 30 * 1000, // 30秒内数据被认为是新鲜的
    refetchInterval: 60 * 1000, // 每60秒自动刷新
  })
}

// 获取任务日志总数的hook
export function useTaskLogsCount(params: {
  searchTerm: string
  statusFilter: string
}) {
  return useQuery({
    queryKey: ['task-logs-count', params],
    queryFn: () => fetchTaskLogsCount(params),
    retry: 2,
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  })
}