'use client'

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ToggleGroupCustom } from "@/components/ui/toggle-group-custom"
import { NumberPagination } from "@/components/ui/number-pagination"
import { useState } from 'react'
import { useAppSettings } from '@/contexts/AppSettingsContext'

// 最近注册用户数据
const recentRegistrationRecords = [
  {
    id: 1,
    user: {
      name: '新用户一',
      email: 'newuser1@example.com',
      avatar: '/default-avatar/苹果.png'
    },
    time: '5分钟前'
  },
  {
    id: 2,
    user: {
      name: '新用户二',
      email: 'newuser2@example.com',
      avatar: '/default-avatar/橙子.png'
    },
    time: '1小时前'
  },
  {
    id: 3,
    user: {
      name: '新用户三',
      email: 'newuser3@example.com',
      avatar: '/default-avatar/草莓.png'
    },
    time: '1天前'
  },
  {
    id: 4,
    user: {
      name: '新用户四',
      email: 'newuser4@example.com',
      avatar: '/default-avatar/菠萝.png'
    },
    time: '2天前'
  },
  {
    id: 5,
    user: {
      name: '新用户五',
      email: 'newuser5@example.com',
      avatar: '/default-avatar/蓝莓.png'
    },
    time: '3天前'
  }
]

// 最近付费用户数据（调整顺序以便看到切换变化）
const recentPaymentRecords = [
  {
    id: 1,
    user: {
      name: '付费用户五',
      email: 'payuser5@example.com',
      avatar: '/default-avatar/西瓜.png'
    },
    time: '2分钟前'
  },
  {
    id: 2,
    user: {
      name: '付费用户一',
      email: 'payuser1@example.com',
      avatar: '/default-avatar/鸭梨.png'
    },
    time: '30分钟前'
  },
  {
    id: 3,
    user: {
      name: '付费用户三',
      email: 'payuser3@example.com',
      avatar: '/default-avatar/菠萝.png'
    },
    time: '2小时前'
  },
  {
    id: 4,
    user: {
      name: '付费用户二',
      email: 'payuser2@example.com',
      avatar: '/default-avatar/蓝莓.png'
    },
    time: '1天前'
  },
  {
    id: 5,
    user: {
      name: '付费用户四',
      email: 'payuser4@example.com',
      avatar: '/default-avatar/草莓.png'
    },
    time: '3天前'
  }
]

export function RecentRegistrationCard() {
  const { cardCount } = useAppSettings()
  const [displayMode, setDisplayMode] = useState('最近注册')
  const modeOptions = ['最近注册', '最近付费']
  
  // 根据显示模式获取对应的数据
  const getCurrentRecords = () => {
    return displayMode === '最近注册' ? recentRegistrationRecords : recentPaymentRecords
  }
  
  // 根据全局设置的条数过滤数据
  const getFilteredRecords = () => {
    const currentRecords = getCurrentRecords()
    return currentRecords.slice(0, Math.min(cardCount, currentRecords.length))
  }
  
  const filteredRecords = getFilteredRecords()
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
      </CardHeader>
      <CardContent className="pt-2 flex-1 flex flex-col">
        <div className="space-y-4">
          {filteredRecords.map((record) => (
            <div key={record.id} className="flex items-center justify-between px-[4%] py-[1%] border border-gray-200 dark:border-gray-700 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer aspect-[5/1]">
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
            </div>
          ))}
        </div>
        <NumberPagination totalItems={totalCount} />
      </CardContent>
    </Card>
  )
}