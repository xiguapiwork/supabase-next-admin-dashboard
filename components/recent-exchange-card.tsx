'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ToggleGroupCustom } from '@/components/ui/toggle-group-custom'
import { NumberPagination } from '@/components/ui/number-pagination'
import { useAppSettings } from '@/contexts/AppSettingsContext'
import { formatPoints } from '@/lib/format-points'
import { useRecentExchanges, useMostExchanges } from '@/hooks/use-recent-exchanges'
import { Skeleton } from '@/components/ui/skeleton'



export function RecentExchangeCard() {
  const { cardCount } = useAppSettings()
  const [displayMode, setDisplayMode] = useState('最近兑换')
  const [dateRange, setDateRange] = useState('30日')
  const modeOptions = ['最近兑换', '最多兑换']
  const dateRangeOptions = ['今日', '昨日', '7日', '30日']
  
  // 使用自定义 hooks 获取数据
  const { data: recentData, isLoading: recentLoading } = useRecentExchanges()
  const { data: mostData, isLoading: mostLoading } = useMostExchanges(dateRange)
  
  // 根据显示模式获取对应的数据和加载状态
  const currentData = displayMode === '最近兑换' ? recentData : mostData
  const isLoading = displayMode === '最近兑换' ? recentLoading : mostLoading
  
  // 根据全局设置的条数过滤数据
  const filteredRecords = currentData ? currentData.slice(0, Math.min(cardCount, currentData.length)) : []
  const totalCount = cardCount

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
        {/* 当选择"最多兑换"时显示日期范围切换按钮 */}
        {displayMode === '最多兑换' && (
          <div className="flex items-center">
            <ToggleGroupCustom
              options={dateRangeOptions}
              value={dateRange}
              onValueChange={setDateRange}
              textSize="text-xs"
              className="ml-2"
            />
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-2 flex-1 flex flex-col">
        <div className="space-y-4">
          {isLoading ? (
            // 加载状态显示骨架屏
            Array.from({ length: cardCount }).map((_, index) => (
              <div key={index} className="flex items-center justify-between px-[4%] py-[2%] border border-gray-200 dark:border-gray-700 rounded-lg bg-muted/50 aspect-[5/1]">
                <div className="flex items-center">
                  <Skeleton className="aspect-square w-10 h-10 rounded-full flex-shrink-0" />
                  <div className="flex flex-col ml-4 space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))
          ) : filteredRecords.length > 0 ? (
            // 有数据时显示记录
            filteredRecords.map((record) => (
              <div key={record.id} className="flex items-center justify-between px-[4%] py-[2%] border border-gray-200 dark:border-gray-700 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer aspect-[5/1]">
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
                
                {/* 右侧：积分和时间 */}
                <div className="text-right">
                  <div className={`text-[clamp(0.7rem,1.8vw,0.85rem)] font-medium ${
                    record.points > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {record.points > 0 ? '+' : ''}{formatPoints(record.points)}
                  </div>
                  <div className="text-[clamp(0.6rem,1.5vw,0.75rem)] text-gray-500 dark:text-gray-400">
                    {displayMode === '最多兑换' && 'exchangeCount' in record 
                      ? `兑换${record.exchangeCount}次` 
                      : record.time}
                  </div>
                </div>
              </div>
            ))
          ) : (
            // 无数据时显示空状态
            <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
              <div className="text-sm">暂无兑换记录</div>
            </div>
          )}
        </div>
        <NumberPagination totalItems={totalCount} />
      </CardContent>
    </Card>
  )
}