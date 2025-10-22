'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

interface ExchangeCardRawData {
  积分数量: number
  状态: boolean
  创建时间: string
  兑换时间: string | null
}

export interface ExchangeCardData {
  date: string
  totalCards: number
  exchangedCards: number
  availableCards: number
  totalPoints: number
  exchangedPoints: number
  availablePoints: number
  cardsExchangeRate: number
  pointsExchangeRate: number
}

async function fetchExchangeCardsData(timeRange: number, dataType: 'cumulative' | 'new'): Promise<ExchangeCardData[]> {
  const supabase = createClient()
  
  // 计算日期范围
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - timeRange + 1)
  
  // 获取所有积分卡数据
  const { data: cards, error } = await supabase
    .from('exchange-cards')
    .select('积分数量, 状态, 创建时间, 兑换时间')
    .order('创建时间', { ascending: true }) as { data: ExchangeCardRawData[] | null, error: any }
  
  if (error) {
    throw new Error(`获取积分卡数据失败: ${error.message}`)
  }
  
  if (!cards) {
    return []
  }
  

  
  // 生成日期数组
  const dates: string[] = []
  for (let i = 0; i < timeRange; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    dates.push(date.toISOString().split('T')[0])
  }
  
  // 计算每日数据
  const result: ExchangeCardData[] = dates.map((date, index) => {
    const currentDate = new Date(date)
    const nextDate = new Date(currentDate)
    nextDate.setDate(currentDate.getDate() + 1)
    
    if (dataType === 'cumulative') {
      // 累计数据：计算到当前日期结束为止的总数
      const endOfCurrentDate = new Date(currentDate)
      endOfCurrentDate.setHours(23, 59, 59, 999)
      
      const cardsCreatedByDate = cards.filter(card => 
        new Date(card['创建时间']) <= endOfCurrentDate
      )
      const cardsExchangedByDate = cards.filter(card => 
        card['兑换时间'] && new Date(card['兑换时间']) <= endOfCurrentDate
      )
      

      
      const totalCards = cardsCreatedByDate.length
      const exchangedCards = cardsExchangedByDate.length
      const availableCards = totalCards - exchangedCards
      
      const totalPoints = cardsCreatedByDate.reduce((sum, card) => sum + card['积分数量'], 0)
      const exchangedPoints = cardsExchangedByDate.reduce((sum, card) => sum + card['积分数量'], 0)
      const availablePoints = totalPoints - exchangedPoints
      
      const cardsExchangeRate = totalCards > 0 ? (exchangedCards / totalCards) * 100 : 0
      const pointsExchangeRate = totalPoints > 0 ? (exchangedPoints / totalPoints) * 100 : 0
      
      return {
        date,
        totalCards,
        exchangedCards,
        availableCards,
        totalPoints,
        exchangedPoints,
        availablePoints,
        cardsExchangeRate,
        pointsExchangeRate
      }
    } else {
      // 新增数据：计算当天的新增数量
      const cardsCreatedOnDate = cards.filter(card => {
        const createdDate = new Date(card['创建时间'])
        return createdDate >= currentDate && createdDate < nextDate
      })
      const cardsExchangedOnDate = cards.filter(card => {
        if (!card['兑换时间']) return false
        const exchangedDate = new Date(card['兑换时间'])
        return exchangedDate >= currentDate && exchangedDate < nextDate
      })
      
      const totalCards = cardsCreatedOnDate.length
      const exchangedCards = cardsExchangedOnDate.length
      const availableCards = totalCards - exchangedCards
      
      const totalPoints = cardsCreatedOnDate.reduce((sum, card) => sum + card['积分数量'], 0)
      const exchangedPoints = cardsExchangedOnDate.reduce((sum, card) => sum + card['积分数量'], 0)
      const availablePoints = totalPoints - exchangedPoints
      
      const cardsExchangeRate = totalCards > 0 ? (exchangedCards / totalCards) * 100 : 0
      const pointsExchangeRate = totalPoints > 0 ? (exchangedPoints / totalPoints) * 100 : 0
      
      return {
        date,
        totalCards,
        exchangedCards,
        availableCards,
        totalPoints,
        exchangedPoints,
        availablePoints,
        cardsExchangeRate,
        pointsExchangeRate
      }
    }
  })
  
  return result
}

export function useExchangeCardsData(timeRange: number, dataType: 'cumulative' | 'new') {
  return useQuery({
    queryKey: ['exchange-cards-data', timeRange, dataType],
    queryFn: () => fetchExchangeCardsData(timeRange, dataType),
    staleTime: 10000, // 10秒内认为数据是新鲜的
    refetchInterval: 30000, // 每30秒自动刷新
    retry: 3,
  })
}