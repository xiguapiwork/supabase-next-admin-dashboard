'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useRecentConsumption, formatRelativeTime, type RecentConsumptionData } from '@/hooks/use-recent-consumption'
import { useTopConsumption, type TopConsumptionData } from '@/hooks/use-top-consumption'
import { generateAvatarUrl } from '@/lib/avatar-utils'
import { formatPoints } from '@/lib/format-points'
import { useAppSettings } from '@/contexts/AppSettingsContext'

interface PointsConsumptionDetailsProps {
  onClick?: () => void
  isSelected?: boolean
}

export function PointsConsumptionDetails({ onClick, isSelected }: PointsConsumptionDetailsProps) {
  const [activeTab, setActiveTab] = useState<'recent' | 'top'>('recent')
  const { pointsFormat } = useAppSettings()
  
  const { data: recentData, isLoading: recentLoading, error: recentError } = useRecentConsumption()
  const { data: topData, isLoading: topLoading, error: topError } = useTopConsumption()

  // 渲染最近消耗列表
  const renderRecentConsumption = () => {
    if (recentLoading) {
      return (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        </div>
      )
    }

    if (recentError) {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="text-xs text-red-500 text-center">
            数据加载失败
          </div>
        </div>
      )
    }

    if (!recentData || recentData.length === 0) {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="text-xs text-gray-500 text-center">
            暂无消耗记录
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {recentData.map((log: RecentConsumptionData) => (
          <div key={log.积分记录ID} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarImage 
                src={generateAvatarUrl({ avatar: log.user_avatar }) || '/default-avatar/苹果.png'} 
                alt={log.username || '未知用户'} 
              />
              <AvatarFallback className="text-xs font-medium">
                {(log.username || '')[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="font-medium text-sm truncate">{log.username}</div>
                <div className="text-red-500 font-bold text-sm">
                  {formatPoints(log.积分变动量, pointsFormat)}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500 truncate">{log.user_email}</div>
                <div className="text-xs text-gray-400">
                  {formatRelativeTime(log.创建时间)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // 渲染最多消耗列表
  const renderTopConsumption = () => {
    if (topLoading) {
      return (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        </div>
      )
    }

    if (topError) {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="text-xs text-red-500 text-center">
            数据加载失败
          </div>
        </div>
      )
    }

    if (!topData || topData.length === 0) {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="text-xs text-gray-500 text-center">
            暂无消耗统计
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {topData.map((user: TopConsumptionData) => (
          <div key={user.用户ID} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarImage 
                src={generateAvatarUrl({ avatar: user.user_avatar }) || '/default-avatar/苹果.png'} 
                alt={user.username || '未知用户'} 
              />
              <AvatarFallback className="text-xs font-medium">
                {(user.username || '')[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="font-medium text-sm truncate">{user.username}</div>
                <div className="text-red-500 font-bold text-sm">
                  -{formatPoints(user.total_consumption, pointsFormat)}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500 truncate">{user.user_email}</div>
                <div className="text-xs text-gray-400">
                  {user.consumption_count}次
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Card
      onClick={onClick}
      className={`cursor-pointer ${isSelected ? 'border-2 border-black dark:border-white' : 'border border-gray-200 dark:border-gray-600'} flex flex-col h-full`}
      style={{ minHeight: '400px' }}
    >
      <CardHeader className="pb-3 px-4 pt-4">
        <CardTitle className="text-base font-bold">
          积分消耗详情
        </CardTitle>
        
        {/* 标签页切换 */}
        <div className="flex gap-1 mt-2">
          <Button
            variant={activeTab === 'recent' ? 'default' : 'ghost'}
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setActiveTab('recent')
            }}
            className="text-xs h-7 px-3"
          >
            最近消耗
          </Button>
          <Button
            variant={activeTab === 'top' ? 'default' : 'ghost'}
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setActiveTab('top')
            }}
            className="text-xs h-7 px-3"
          >
            最多消耗
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 px-4 pb-4">
        {activeTab === 'recent' ? renderRecentConsumption() : renderTopConsumption()}
      </CardContent>
    </Card>
  )
}