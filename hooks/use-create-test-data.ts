'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export function useCreateTestData() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  return useMutation({
    mutationFn: async () => {
      // 先清除现有的测试数据
      await supabase
        .from('exchange-cards')
        .delete()
        .like('卡号', 'TEST%')

      // 插入测试数据
      const testData = []
      const now = new Date()
      
      // 生成过去7天的测试数据
      for (let i = 7; i >= 0; i--) {
        const createDate = new Date(now)
        createDate.setDate(now.getDate() - i)
        
        // 每天创建2-3张卡片
        const cardsPerDay = Math.floor(Math.random() * 2) + 2
        
        for (let j = 0; j < cardsPerDay; j++) {
          const cardNumber = `TEST${String(i * 10 + j).padStart(3, '0')}`
          const points = Math.floor(Math.random() * 200) + 100
          const isExchanged = Math.random() > 0.5
          
          let exchangeDate = null
          if (isExchanged && i < 7) { // 不让今天的卡片被兑换
            exchangeDate = new Date(createDate)
            exchangeDate.setHours(createDate.getHours() + Math.floor(Math.random() * 12) + 1)
          }
          
          testData.push({
            卡号: cardNumber,
            卡片名称: `测试卡片${cardNumber}`,
            积分数量: points,
            备注: '测试数据',
            状态: isExchanged,
            创建时间: createDate.toISOString(),
            兑换时间: exchangeDate?.toISOString() || null
          })
        }
      }

      const { error } = await supabase
        .from('exchange-cards')
        .insert(testData)

      if (error) {
        throw new Error(`创建测试数据失败: ${error.message}`)
      }

      return testData
    },
    onSuccess: () => {
      // 刷新相关查询
      queryClient.invalidateQueries({ queryKey: ['exchange-cards-data'] })
      queryClient.invalidateQueries({ queryKey: ['exchange-cards-stats'] })
    }
  })
}