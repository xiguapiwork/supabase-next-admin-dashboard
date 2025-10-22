'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

interface ExchangeCardData {
  积分数量: number
  状态: boolean
}

export interface ExchangeCardsStats {
  // 卡片统计
  totalCards: number
  redeemedCards: number
  availableCards: number
  cardRedemptionRate: number
  
  // 积分统计
  totalPoints: number
  redeemedPoints: number
  availablePoints: number
  pointsRedemptionRate: number
}

export function useExchangeCardsStats() {
  return useQuery({
    queryKey: ['exchange-cards-stats'],
    queryFn: async (): Promise<ExchangeCardsStats> => {
      const supabase = createClient()
      
      // 获取所有积分卡数据
      const { data: cards, error } = await supabase
        .from('exchange-cards')
        .select('积分数量, 状态') as { data: ExchangeCardData[] | null, error: any }
      
      if (error) {
        throw new Error(`获取积分卡数据失败: ${error.message}`)
      }
      
      if (!cards) {
        return {
          totalCards: 0,
          redeemedCards: 0,
          availableCards: 0,
          cardRedemptionRate: 0,
          totalPoints: 0,
          redeemedPoints: 0,
          availablePoints: 0,
          pointsRedemptionRate: 0,
        }
      }
      
      // 计算卡片统计
      const totalCards = cards.length
      const redeemedCards = cards.filter(card => !card.状态).length // 状态为false表示已兑换
      const availableCards = cards.filter(card => card.状态).length // 状态为true表示可用
      const cardRedemptionRate = totalCards > 0 ? Math.round((redeemedCards / totalCards) * 100) : 0
      
      // 计算积分统计
      const totalPoints = cards.reduce((sum, card) => sum + card.积分数量, 0)
      const redeemedPoints = cards
        .filter(card => !card.状态) // 已兑换的卡片
        .reduce((sum, card) => sum + card.积分数量, 0)
      const availablePoints = cards
        .filter(card => card.状态) // 可用的卡片
        .reduce((sum, card) => sum + card.积分数量, 0)
      const pointsRedemptionRate = totalPoints > 0 ? Math.round((redeemedPoints / totalPoints) * 100) : 0
      
      return {
        totalCards,
        redeemedCards,
        availableCards,
        cardRedemptionRate,
        totalPoints,
        redeemedPoints,
        availablePoints,
        pointsRedemptionRate,
      }
    },
    refetchInterval: 30000, // 每30秒刷新一次
    staleTime: 10000, // 10秒内认为数据是新鲜的
  })
}