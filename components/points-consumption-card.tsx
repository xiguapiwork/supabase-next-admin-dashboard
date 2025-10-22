'use client'

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ToggleGroupCustom } from "@/components/ui/toggle-group-custom"
import { NumberPagination } from "@/components/ui/number-pagination"
import { useState } from 'react'
import { useAppSettings } from '@/contexts/AppSettingsContext'
import { useRecentConsumption, RecentConsumptionData } from '@/hooks/use-recent-consumption'
import { useTopConsumption, TopConsumptionData } from '@/hooks/use-top-consumption'



export function PointsConsumptionCard() {
  const { cardCount } = useAppSettings()
  const [displayMode, setDisplayMode] = useState('最近消耗')
  const [dateRange, setDateRange] = useState('30日')
  const modeOptions = ['最近消耗', '最多消耗']
  const dateRangeOptions = ['今日', '昨日', '7日', '30日']
  
  // 使用hooks获取真实数据
  const { data: recentData, isLoading: recentLoading, error: recentError } = useRecentConsumption()
  const { data: topData, isLoading: topLoading, error: topError } = useTopConsumption()
  
  // 数据适配器函数 - 将hook返回的数据转换为组件期望的格式
  const adaptRecentData = (data: RecentConsumptionData[]) => {
    return data.map((item, index) => ({
      id: item.积分记录ID || index.toString(),
      user: {
        name: item.username || '未知用户',
        email: item.user_email || '',
        avatar: item.user_avatar || '/default-avatar/菠萝.png'
      },
      points: Math.abs(item.积分变动量 || 0), // 取绝对值，因为是消耗
      time: item.创建时间 || ''
    }))
  }
  
  const adaptTopData = (data: TopConsumptionData[]) => {
    return data.map((item, index) => ({
      id: item.用户ID || index.toString(),
      user: {
        name: item.username || '未知用户',
        email: item.user_email || '',
        avatar: item.user_avatar || '/default-avatar/菠萝.png'
      },
      points: Math.abs(item.total_consumption || 0), // 取绝对值
      time: item.latest_consumption_time || '',
      usageCount: item.consumption_count || 0
    }))
  }
  
  // 根据显示模式获取对应的数据
  const getCurrentRecords = () => {
    if (displayMode === '最近消耗') {
      return recentData ? adaptRecentData(recentData) : []
    } else {
      // 最多消耗模式，暂时返回所有数据，后续可以根据dateRange进行过滤
      return topData ? adaptTopData(topData) : []
    }
  }
  
  // 根据全局设置的数量过滤数据
  const getFilteredRecords = () => {
    const currentRecords = getCurrentRecords()
    return currentRecords.slice(0, Math.min(cardCount, currentRecords.length))
  }
  
  const filteredRecords = getFilteredRecords()
  const totalCount = cardCount
  
  // 检查加载状态
  const isLoading = displayMode === '最近消耗' ? recentLoading : topLoading
  const error = displayMode === '最近消耗' ? recentError : topError

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
        {/* 当选择"最多消耗"时显示日期范围切换按钮 */}
        {displayMode === '最多消耗' && (
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
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-sm text-gray-500">加载中...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-sm text-red-500">加载失败，请重试</div>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-sm text-gray-500">暂无数据</div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecords.map((record) => (
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
              
              {/* 右侧：积分消耗和时间 */}
              <div className="flex flex-col items-end">
                <div className="text-[clamp(0.7rem,1.8vw,0.85rem)] font-medium text-red-600 dark:text-red-400">
                  -{record.points}
                </div>
                <div className="text-[clamp(0.6rem,1.5vw,0.75rem)] text-gray-500 dark:text-gray-400">
                  {displayMode === '最多消耗' && 'usageCount' in record 
                    ? `使用${record.usageCount}次` 
                    : record.time}
                </div>
              </div>
            </div>
            ))}
          </div>
        )}
        <NumberPagination totalItems={totalCount} />
      </CardContent>
    </Card>
  )
}