'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export interface UserExchangeHistoryRecord {
  time: string
  source: string
  points: number
  cardNumber?: string
  cardName?: string
  type: 'card_redeem' | 'admin_adjust' | 'refund'
}

// 格式化时间为 YYYY-MM-DD HH:mm 格式
const formatDateTime = (dateString: string) => {
  try {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace(/\//g, '-')
  } catch {
    return '未知时间'
  }
}

// 获取用户兑换历史（增加积分的记录）
export function useUserExchangeHistory(userId: string, limit: number = 50) {

  
  const queryResult = useQuery({
    queryKey: ['user-exchange-history', userId, limit],
    queryFn: async (): Promise<UserExchangeHistoryRecord[]> => {
      const supabase = createClient()
      
      try {
        // 使用RPC函数获取积分日志数据，避免中文字段名的URL编码问题
        const { data: allPointsLogs, error } = await supabase.rpc('get_points_logs_list', {
          p_limit: limit * 2, // 获取更多数据，因为需要在客户端过滤
          p_offset: 0,
          p_search_term: null,
          p_action_filter: null,
          p_sort_field: '创建时间',
          p_sort_order: 'desc'
        })

        if (error) {
          console.error('获取用户兑换历史失败:', error)
          return []
        }

        if (!allPointsLogs || allPointsLogs.length === 0) {
          console.log('⚠️ [兑换历史] 没有获取到任何积分日志数据')
          return []
        }

        // 过滤出指定用户的兑换积分卡记录
        const pointsLogs = allPointsLogs
          .filter((log: any) => {
            // 使用正确的字段名
            const isTargetUser = log.用户id === userId  // 注意：是小写的 id
            const isCardRedeem = log.变动类型 === 'card_redeem'
            return isTargetUser && isCardRedeem
          })
          .slice(0, limit) // 限制返回数量

        if (pointsLogs.length === 0) {
          return []
        }

        // 获取相关的兑换卡信息
        const cardNumbers = pointsLogs
          .filter((log: any) => log.兑换卡卡号)
          .map((log: any) => log.兑换卡卡号)

        let cardsInfo: any = {}
        if (cardNumbers.length > 0) {
          const { data: cards } = await supabase
            .from('exchange-cards')
            .select('卡号, 卡片名称')
            .in('卡号', cardNumbers)

          if (cards) {
            cardsInfo = cards.reduce((acc: any, card: any) => {
              acc[card.卡号] = card.卡片名称
              return acc
            }, {})
          }
        }

        // 转换数据格式
        const result: UserExchangeHistoryRecord[] = pointsLogs.map((log: any) => {
          let source = log.变动原因
          
          // 根据变动类型和兑换卡信息生成更友好的来源描述
          if (log.变动类型 === 'card_redeem' && log.兑换卡卡号) {
            const cardName = cardsInfo[log.兑换卡卡号] || '未知卡片'
            source = `兑换卡：${cardName}`
          } else if (log.变动类型 === 'admin_adjust') {
            source = `手动加分：${log.变动原因}`
          } else if (log.变动类型 === 'refund') {
            source = `退款：${log.变动原因}`
          }

          return {
            time: formatDateTime(log.创建时间),
            source,
            points: log.积分变动量,
            cardNumber: log.兑换卡卡号,
            cardName: log.兑换卡卡号 ? cardsInfo[log.兑换卡卡号] : undefined,
            type: log.变动类型 as 'card_redeem' | 'admin_adjust' | 'refund'
          }
        })

        return result
      } catch (error) {
        console.error('获取用户兑换历史时发生错误:', error)
        return []
      }
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5分钟内不重新获取
    retry: 1
  })

  return queryResult
}