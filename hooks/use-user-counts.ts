'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export interface UserCountData {
  date: string
  totalUsers: number
  paidUsers: number
  paymentRate: number
}

// 获取用户数量历史数据
const fetchUserCounts = async (timeRange: number, dataType: 'cumulative' | 'new'): Promise<UserCountData[]> => {
  const supabase = createClient()
  
  try {
    // 计算日期范围
    const days = timeRange
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days + 1)
    
    // 生成日期数组
    const dateArray: string[] = []
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dateArray.push(d.toISOString().split('T')[0])
    }
    
    if (dataType === 'cumulative') {
      // 累计数据：计算每天的总用户数和付费用户数
      const result: UserCountData[] = []
      
      for (const date of dateArray) {
        const nextDay = new Date(date)
        nextDay.setDate(nextDay.getDate() + 1)
        const nextDayStr = nextDay.toISOString().split('T')[0]
        
        // 获取截止到当天的总用户数
        const { count: totalUsers, error: totalError } = await supabase
          .from('user-management')
          .select('*', { count: 'exact', head: true })
          .lt('created_at', nextDayStr)
        
        if (totalError) {
          console.error('获取总用户数失败:', totalError)
          continue
        }
        
        // 获取截止到当天的付费用户数
        const { count: paidUsers, error: paidError } = await supabase
          .from('user-management')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'paid')
          .lt('created_at', nextDayStr)
        
        if (paidError) {
          console.error('获取付费用户数失败:', paidError)
          continue
        }
        
        const paymentRate = totalUsers && totalUsers > 0 
          ? Number(((paidUsers || 0) / totalUsers * 100).toFixed(2))
          : 0
        
        result.push({
          date,
          totalUsers: totalUsers || 0,
          paidUsers: paidUsers || 0,
          paymentRate
        })
      }
      
      return result
    } else {
      // 新增数据：计算每天新注册的用户数和新付费用户数
      const result: UserCountData[] = []
      
      for (const date of dateArray) {
        const nextDay = new Date(date)
        nextDay.setDate(nextDay.getDate() + 1)
        const nextDayStr = nextDay.toISOString().split('T')[0]
        
        // 获取当天新注册的用户数
        const { count: newUsers, error: newUsersError } = await supabase
          .from('user-management')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', date)
          .lt('created_at', nextDayStr)
        
        if (newUsersError) {
          console.error('获取新用户数失败:', newUsersError)
          continue
        }
        
        // 获取当天新增的付费用户数（首次付费时间在当天）
        const { count: newPaidUsers, error: newPaidError } = await supabase
          .from('user-management')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'paid')
          .gte('first_payment_time', date)
          .lt('first_payment_time', nextDayStr)
        
        if (newPaidError) {
          console.error('获取新付费用户数失败:', newPaidError)
          continue
        }
        
        const paymentRate = newUsers && newUsers > 0 
          ? Number(((newPaidUsers || 0) / newUsers * 100).toFixed(2))
          : 0
        
        result.push({
          date,
          totalUsers: newUsers || 0,
          paidUsers: newPaidUsers || 0,
          paymentRate
        })
      }
      
      return result
    }
  } catch (error) {
    console.error('获取用户数量数据时发生错误:', error)
    throw error
  }
}

export const useUserCounts = (timeRange: number, dataType: 'cumulative' | 'new') => {
  return useQuery({
    queryKey: ['user-counts', timeRange, dataType],
    queryFn: () => fetchUserCounts(timeRange, dataType),
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5分钟内数据被认为是新鲜的
    refetchInterval: 30 * 1000, // 每30秒自动刷新一次
  })
}
