'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

interface UserStats {
  totalUsers: number
  paidUsers: number
  paymentRate: number
}

// 获取用户统计数据
const getUserStats = async (): Promise<UserStats> => {
  const supabase = createClient()

  // 获取总用户数
  const { count: totalUsers, error: totalError } = await supabase
    .from('user-management')
    .select('*', { count: 'exact', head: true })

  if (totalError) {
    throw new Error(`获取总用户数失败: ${totalError.message}`)
  }

  // 获取付费用户数
  const { count: paidUsers, error: paidError } = await supabase
    .from('user-management')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'paid')

  if (paidError) {
    throw new Error(`获取付费用户数失败: ${paidError.message}`)
  }

  // 计算付费率
  const paymentRate = totalUsers && totalUsers > 0 
    ? Math.round((paidUsers || 0) / totalUsers * 100) 
    : 0

  return {
    totalUsers: totalUsers || 0,
    paidUsers: paidUsers || 0,
    paymentRate
  }
}

export const useUserStats = () => {
  return useQuery({
    queryKey: ['user-stats'],
    queryFn: getUserStats,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5分钟内数据被认为是新鲜的
    refetchInterval: 30 * 1000, // 每30秒自动刷新一次
  })
}