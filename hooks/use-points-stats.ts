'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

interface PointsStats {
  total_redeem_points: number
  total_usage_points: number
  usage_rate: number
  total_users: number
  active_users: number
}

// 获取积分统计数据
const getPointsStats = async (): Promise<PointsStats> => {
  const supabase = createClient()

  // 获取所有用户的积分数据
  const { data: users, error } = await supabase
    .from('user-management')
    .select('total_redeem, total_usage')

  if (error) {
    throw new Error(`获取积分统计失败: ${error.message}`)
  }

  // 计算统计数据
  const totalRedeemPoints = users?.reduce((sum, user) => sum + (user.total_redeem || 0), 0) || 0
  const totalUsagePoints = users?.reduce((sum, user) => sum + (user.total_usage || 0), 0) || 0
  const totalUsers = users?.length || 0
  const activeUsers = users?.filter(user => (user.total_usage || 0) > 0).length || 0
  
  // 计算使用率
  const usageRate = totalRedeemPoints > 0 
    ? Math.round((totalUsagePoints / totalRedeemPoints) * 100 * 100) / 100 // 保留两位小数
    : 0

  return {
    total_redeem_points: totalRedeemPoints,
    total_usage_points: totalUsagePoints,
    usage_rate: usageRate,
    total_users: totalUsers,
    active_users: activeUsers
  }
}

export const usePointsStats = () => {
  return useQuery({
    queryKey: ['points-stats'],
    queryFn: getPointsStats,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5分钟内数据被认为是新鲜的
    refetchInterval: 30 * 1000, // 每30秒自动刷新一次
  })
}