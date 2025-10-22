'use client'

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ToggleGroupCustom } from "@/components/ui/toggle-group-custom"
import { NumberPagination } from "@/components/ui/number-pagination"
import { useState } from 'react'
import { useRecentRegistrations } from '@/hooks/use-recent-registrations'
import { useRecentPayments } from '@/hooks/use-recent-payments'

// 空数据占位符
const createEmptyRecord = (index: number) => ({
  id: `empty-${index}`,
  user: {
    name: '',
    email: '',
    avatar: ''
  },
  time: '',
  isEmpty: true
})

export function RecentRegistrationCard() {
  // 固定显示5个记录以配合数字标签切换
  const cardCount = 5
  const [displayMode, setDisplayMode] = useState('最近注册')
  const modeOptions = ['最近注册', '最近付费']
  
  // 获取真实数据
  const { data: registrationData, isLoading: isLoadingRegistrations } = useRecentRegistrations(cardCount)
  const { data: paymentData, isLoading: isLoadingPayments } = useRecentPayments(cardCount)
  
  // 格式化时间的辅助函数
  const formatTime = (dateString: string) => {
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
  
  // 转换数据格式
  const transformRegistrationData = (data: typeof registrationData) => {
    if (!data) return []
    return data.map(user => ({
      id: user.id,
      user: {
        name: user.username,
        email: user.email,
        avatar: user.avatar
      },
      time: formatTime(user.created_at),
      isEmpty: false
    }))
  }
  
  const transformPaymentData = (data: typeof paymentData) => {
    if (!data) return []
    return data.map(user => ({
      id: user.id,
      user: {
        name: user.username,
        email: user.email,
        avatar: user.avatar
      },
      time: formatTime(user.created_at),
      isEmpty: false
    }))
  }
  
  // 根据显示模式获取对应的数据
  const getCurrentRecords = () => {
    if (displayMode === '最近注册') {
      return transformRegistrationData(registrationData)
    } else {
      return transformPaymentData(paymentData)
    }
  }
  
  // 填充空数据以保持固定排版
  const getDisplayRecords = () => {
    const currentRecords = getCurrentRecords()
    const records = [...currentRecords]
    
    // 如果数据不足，用空记录填充
    while (records.length < cardCount) {
      records.push(createEmptyRecord(records.length))
    }
    
    return records.slice(0, cardCount)
  }
  
  const displayRecords = getDisplayRecords()
  const isLoading = displayMode === '最近注册' ? isLoadingRegistrations : isLoadingPayments

  return (
    <Card style={{ width: '400px' }} className="flex-shrink-0 h-full flex flex-col">
      <CardHeader className="pb-2 pt-6 !flex !flex-row !items-center !justify-between !space-y-0">
        <div className="flex items-center">
          <ToggleGroupCustom
            options={modeOptions}
            value={displayMode}
            onValueChange={setDisplayMode}
            className="text-xs sm:text-sm"
          />
        </div>
      </CardHeader>
      <CardContent className="pt-2 flex-1 flex flex-col">
        <div className="space-y-4">
          {isLoading ? (
            // 加载状态
            Array.from({ length: cardCount }).map((_, index) => (
              <div key={`loading-${index}`} className="flex items-center justify-between px-[4%] py-[1%] border border-gray-200 dark:border-gray-700 rounded-lg bg-muted/50 aspect-[5/1]">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse"></div>
                  <div className="flex flex-col ml-4 space-y-2">
                    <div className="w-20 h-3 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                    <div className="w-32 h-2 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="w-16 h-2 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
              </div>
            ))
          ) : (
            displayRecords.map((record) => (
              <div key={record.id} className={`flex items-center justify-between px-[4%] py-[1%] border border-gray-200 dark:border-gray-700 rounded-lg aspect-[5/1] ${
                record.isEmpty 
                  ? 'bg-gray-50 dark:bg-gray-800/50' 
                  : 'bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer'
              }`}>
                {record.isEmpty ? (
                  // 空数据占位符
                  <div className="flex items-center w-full">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="flex flex-col ml-4 space-y-1">
                      <div className="w-16 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* 左侧：用户头像、用户名、邮箱 */}
                    <div className="flex items-center">
                      <Avatar className="aspect-square flex-shrink-0">
                        <AvatarImage src={record.user.avatar} alt={record.user.name} />
                        <AvatarFallback className="text-[clamp(0.75rem,2.5vw,1rem)]">
                          {record.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col ml-4">
                        <div className="text-[clamp(0.7rem,1.8vw,0.85rem)] font-medium text-gray-900 dark:text-white">
                          {record.user.name}
                        </div>
                        <div className="text-[clamp(0.6rem,1.5vw,0.75rem)] text-gray-500 dark:text-gray-400">
                          {record.user.email}
                        </div>
                      </div>
                    </div>
                    
                    {/* 右侧：时间 */}
                    <div className="text-[clamp(0.6rem,1.5vw,0.75rem)] text-gray-500 dark:text-gray-400">
                      {record.time}
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
        <NumberPagination totalItems={cardCount} />
      </CardContent>
    </Card>
  )
}