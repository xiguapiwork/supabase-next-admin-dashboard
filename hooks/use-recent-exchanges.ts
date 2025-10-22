'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { generateAvatarUrl } from '@/lib/avatar-utils'

export interface RecentExchangeRecord {
  id: string
  user: {
    name: string
    email: string
    avatar: string
  }
  points: number
  time: string
  exchangeTime: string // 原始兑换时间
  cardNumber: string
  cardName: string
}

export interface MostExchangeRecord {
  id: string
  user: {
    name: string
    email: string
    avatar: string
  }
  points: number
  time: string
  exchangeCount: number
  totalPoints: number
}

// 格式化相对时间
const formatRelativeTime = (dateString: string) => {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return '刚刚'
    if (diffInMinutes < 60) return `${diffInMinutes}分钟前`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}小时前`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 30) return `${diffInDays}天前`
    
    const diffInMonths = Math.floor(diffInDays / 30)
    return `${diffInMonths}个月前`
  } catch {
    return '未知时间'
  }
}

// 获取最近兑换记录
export function useRecentExchanges(limit: number = 10) {
  return useQuery({
    queryKey: ['recent-exchanges', limit],
    queryFn: async (): Promise<RecentExchangeRecord[]> => {
      const supabase = createClient()
      
      try {
        // 首先获取兑换卡数据
        const { data: exchangeData, error } = await supabase.rpc('get_exchange_cards_list')

        if (error) {
          console.error('获取兑换卡数据失败:', error)
          return await fallbackRecentExchanges(supabase, limit)
        }

        if (!exchangeData || exchangeData.length === 0) {
          return []
        }

        // 过滤已兑换的记录并按兑换时间排序
        const recentExchanges = exchangeData
          .filter((card: any) => card.状态 === false && card.兑换时间)
          .sort((a: any, b: any) => new Date(b.兑换时间).getTime() - new Date(a.兑换时间).getTime())
          .slice(0, limit)

        // 获取当前用户信息以确定是否可以显示邮箱
        const { data: { user: currentUser } } = await supabase.auth.getUser()

        // 为每个兑换记录获取用户信息
        const result = await Promise.all(
          recentExchanges.map(async (record: any, index: number) => {
            let userInfo = {
              name: '未知用户',
              email: '',
              avatar: '/default-avatar/苹果.png'
            }

            if (record.兑换人) {
              try {
                // 从 user-management 表获取用户信息
                const { data: userManagementData } = await supabase
                  .from('user-management')
                  .select('username, avatar')
                  .eq('id', record.兑换人)
                  .single()

                if (userManagementData) {
                  userInfo.name = userManagementData.username || '未知用户'
                  userInfo.avatar = generateAvatarUrl({ avatar: userManagementData.avatar }) || '/default-avatar/苹果.png'
                }

                // 如果是当前登录用户，可以获取邮箱
                if (currentUser && currentUser.id === record.兑换人) {
                  userInfo.email = currentUser.email || ''
                } else {
                  // 对于其他用户，生成示例邮箱（基于用户名）
                  userInfo.email = userInfo.name ? `${userInfo.name}@example.com` : ''
                }
              } catch (userError) {
                console.warn('获取用户信息失败:', userError)
                // 使用默认值
              }
            }

            return {
              id: `${record.卡号}-${index}`,
              user: userInfo,
              points: record.积分数量 || 0,
              time: formatRelativeTime(record.兑换时间),
              exchangeTime: record.兑换时间,
              cardNumber: record.卡号,
              cardName: record.卡片名称 || ''
            }
          })
        )

        return result
      } catch (error) {
        console.error('获取最近兑换记录时发生错误:', error)
        return await fallbackRecentExchanges(supabase, limit)
      }
    },
    staleTime: 30 * 1000, // 30秒内数据被认为是新鲜的
    refetchInterval: 60 * 1000, // 每60秒自动刷新
  })
}

// 回退函数：如果RPC不存在，使用原始查询方式但移除邮箱隐私保护
async function fallbackRecentExchanges(supabase: any, limit: number): Promise<RecentExchangeRecord[]> {
  try {
    // 获取已兑换的卡片，按兑换时间倒序排列
    const { data: exchangeCards, error } = await supabase
      .from('exchange-cards')
      .select(`
        卡号,
        卡片名称,
        积分数量,
        兑换时间,
        兑换人,
        user_management:兑换人 (
          id,
          username,
          avatar
        )
      `)
      .eq('状态', false) // 只获取已兑换的卡片
      .not('兑换时间', 'is', null) // 确保有兑换时间
      .order('兑换时间', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('获取最近兑换记录失败:', error)
      throw new Error('获取最近兑换记录失败')
    }

    if (!exchangeCards || exchangeCards.length === 0) {
      return []
    }

    // 转换数据格式，生成示例邮箱
    const result = exchangeCards.map((card: any, index: number) => ({
      id: `${card.卡号}-${index}`,
      user: {
        name: card.user_management?.username || '未知用户',
        email: `${card.user_management?.username || 'user'}@example.com`, // 生成示例邮箱
        avatar: generateAvatarUrl({ avatar: card.user_management?.avatar }) || '/default-avatar/苹果.png'
      },
      points: card.积分数量,
      time: formatRelativeTime(card.兑换时间),
      exchangeTime: card.兑换时间,
      cardNumber: card.卡号,
      cardName: card.卡片名称
    }))

    return result
  } catch (error) {
    console.error('获取最近兑换记录时发生错误:', error)
    throw error
  }
}

// 获取最多兑换记录（按时间范围）
export function useMostExchanges(dateRange: string, limit: number = 10) {
  return useQuery({
    queryKey: ['most-exchanges', dateRange, limit],
    queryFn: async (): Promise<MostExchangeRecord[]> => {
      const supabase = createClient()
      
      try {
        // 首先获取兑换卡数据
        const { data: exchangeData, error } = await supabase.rpc('get_exchange_cards_list')

        if (error) {
          console.error('获取兑换卡数据失败:', error)
          return []
        }

        if (!exchangeData || exchangeData.length === 0) {
          return []
        }

        // 计算时间范围
        const now = new Date()
        let startDate: Date
        let endDate: Date | null = null
        
        switch (dateRange) {
          case '今日':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            break
          case '昨日':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            break
          case '7日':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
          case '30日':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            break
          default:
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        }

        // 过滤指定时间范围内已兑换的记录
        const exchangesInRange = exchangeData.filter((card: any) => {
          if (card.状态 !== false || !card.兑换时间 || !card.兑换人) return false
          const exchangeDate = new Date(card.兑换时间)
          if (endDate) {
            return exchangeDate >= startDate && exchangeDate < endDate
          }
          return exchangeDate >= startDate && exchangeDate <= now
        })

        // 按用户分组并统计兑换次数和总积分
        const userStats = new Map<string, {
          userId: string
          count: number
          totalPoints: number
          latestExchange: string
        }>()

        exchangesInRange.forEach((card: any) => {
          const userId = card.兑换人
          const existing = userStats.get(userId)
          
          if (existing) {
            existing.count += 1
            existing.totalPoints += card.积分数量 || 0
            // 更新最新兑换时间
            if (new Date(card.兑换时间) > new Date(existing.latestExchange)) {
              existing.latestExchange = card.兑换时间
            }
          } else {
            userStats.set(userId, {
              userId,
              count: 1,
              totalPoints: card.积分数量 || 0,
              latestExchange: card.兑换时间
            })
          }
        })

        // 转换为数组并排序（优先按兑换次数，次要按总积分）
        const sortedStats = Array.from(userStats.values())
          .sort((a, b) => {
            if (b.count !== a.count) return b.count - a.count
            return b.totalPoints - a.totalPoints
          })
          .slice(0, limit)

        // 获取当前用户信息以确定是否可以显示邮箱
        const { data: { user: currentUser } } = await supabase.auth.getUser()

        // 获取用户信息
        const result = await Promise.all(
          sortedStats.map(async (stat, index) => {
            let userInfo = {
              name: '未知用户',
              email: '',
              avatar: '/default-avatar/苹果.png'
            }

            try {
              const { data: userManagementData } = await supabase
                .from('user-management')
                .select('username, avatar')
                .eq('id', stat.userId)
                .single()

              if (userManagementData) {
                userInfo.name = userManagementData.username || '未知用户'
                userInfo.avatar = generateAvatarUrl({ avatar: userManagementData.avatar }) || '/default-avatar/苹果.png'
                
                // 如果是当前登录用户，可以获取邮箱
                if (currentUser && currentUser.id === stat.userId) {
                  userInfo.email = currentUser.email || ''
                } else {
                  // 对于其他用户，生成示例邮箱（基于用户名）
                  userInfo.email = userInfo.name ? `${userInfo.name}@example.com` : ''
                }
              }
            } catch (userError) {
              console.warn('获取用户信息失败:', userError)
            }

            return {
              id: `most-${stat.userId}-${index}`,
              user: userInfo,
              points: stat.totalPoints,
              time: formatRelativeTime(stat.latestExchange),
              exchangeCount: stat.count,
              totalPoints: stat.totalPoints
            }
          })
        )

        return result
      } catch (error) {
        console.error('获取最多兑换记录时发生错误:', error)
        return []
      }
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  })
}