'use client'

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ToggleGroupCustom } from "@/components/ui/toggle-group-custom"
import { NumberPagination } from "@/components/ui/number-pagination"
import { useState } from 'react'
import { useAppSettings } from '@/contexts/AppSettingsContext'

// 最近使用功能的数据
const recentFunctionUsage = [
  {
    id: 1,
    user: {
      name: '用户甲',
      email: 'usera@example.com',
      avatar: '/default-avatar/苹果.png'
    },
    function: '功能A',
    time: '2分钟前'
  },
  {
    id: 2,
    user: {
      name: '用户乙',
      email: 'userb@example.com',
      avatar: '/default-avatar/橙子.png'
    },
    function: '功能B',
    time: '5分钟前'
  },
  {
    id: 3,
    user: {
      name: '用户丙',
      email: 'userc@example.com',
      avatar: '/default-avatar/草莓.png'
    },
    function: '功能C',
    time: '10分钟前'
  },
  {
    id: 4,
    user: {
      name: '用户丁',
      email: 'userd@example.com',
      avatar: '/default-avatar/菠萝.png'
    },
    function: '功能A',
    time: '15分钟前'
  },
  {
    id: 5,
    user: {
      name: '用户戊',
      email: 'usere@example.com',
      avatar: '/default-avatar/蓝莓.png'
    },
    function: '功能B',
    time: '1小时前'
  }
]

// 最多使用功能的数据 - 今日
const mostUsedTodayRecords = [
  {
    id: 1,
    function: '功能A',
    usage: 156,
    rate: '85%',
    trend: '+12%'
  },
  {
    id: 2,
    function: '功能B',
    usage: 134,
    rate: '78%',
    trend: '+8%'
  },
  {
    id: 3,
    function: '功能C',
    usage: 98,
    rate: '65%',
    trend: '+5%'
  }
]

// 最多使用功能的数据 - 昨日
const mostUsedYesterdayRecords = [
  {
    id: 1,
    function: '功能A',
    usage: 142,
    rate: '82%',
    trend: '+10%'
  },
  {
    id: 2,
    function: '功能B',
    usage: 128,
    rate: '75%',
    trend: '+6%'
  },
  {
    id: 3,
    function: '功能C',
    usage: 89,
    rate: '62%',
    trend: '+3%'
  }
]

// 最多使用功能的数据 - 本周
const mostUsedWeekRecords = [
  {
    id: 1,
    function: '功能A',
    usage: 1089,
    rate: '84%',
    trend: '+15%'
  },
  {
    id: 2,
    function: '功能B',
    usage: 945,
    rate: '76%',
    trend: '+12%'
  },
  {
    id: 3,
    function: '功能C',
    usage: 678,
    rate: '63%',
    trend: '+8%'
  }
]

// 最多使用功能的数据 - 本月
const mostUsedMonthRecords = [
  {
    id: 1,
    function: '功能A',
    usage: 4567,
    rate: '83%',
    trend: '+18%'
  },
  {
    id: 2,
    function: '功能B',
    usage: 3890,
    rate: '77%',
    trend: '+14%'
  },
  {
    id: 3,
    function: '功能C',
    usage: 2345,
    rate: '64%',
    trend: '+11%'
  }
]

export function FunctionDetailsCard() {
  const { cardCount } = useAppSettings()
  const [displayMode, setDisplayMode] = useState('最近使用')
  const [dateRange, setDateRange] = useState('今日')
  const modeOptions = ['最近使用', '最多使用']
  const dateRangeOptions = ['今日', '昨日', '7日', '30日']
  
  // 根据显示模式和日期范围获取对应的数据
  const getRecentUsageRecords = () => {
    return recentFunctionUsage.slice(0, Math.min(cardCount, recentFunctionUsage.length))
  }
  
  const getMostUsedRecords = () => {
     let records
     switch (dateRange) {
       case '今日':
         records = mostUsedTodayRecords
         break
       case '昨日':
         records = mostUsedYesterdayRecords
         break
       case '7日':
         records = mostUsedWeekRecords
         break
       case '30日':
       default:
         records = mostUsedMonthRecords
         break
     }
     return records.slice(0, Math.min(cardCount, records.length))
   }
  
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
        {/* 当选择"最多使用"时显示日期范围切换按钮 */}
        {displayMode === '最多使用' && (
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
        {displayMode === '最近使用' ? (
          // 最近使用模式：显示用户信息和功能使用时间
          <div className="space-y-4">
            {getRecentUsageRecords().map((record) => (
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
                
                {/* 右侧：功能名称和使用时间 */}
                <div className="text-right">
                  <div className="font-semibold text-[clamp(0.6rem,1.5vw,0.7rem)] text-blue-600">
                    {record.function}
                  </div>
                  <div className="text-sm text-muted-foreground text-[clamp(0.5rem,1.2vw,0.6rem)]">
                    {record.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // 最多使用模式：显示功能统计信息
          <div className="space-y-4">
            {getMostUsedRecords().map((record) => (
              <div key={record.id} className="flex items-center justify-between px-[4%] py-[2%] border border-gray-200 dark:border-gray-700 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer">
                {/* 左侧：功能名称和使用率 */}
                <div className="flex flex-col">
                  <div className="text-[clamp(0.7rem,1.8vw,0.85rem)] font-medium text-gray-900 dark:text-white">
                    {record.function}
                  </div>
                  <div className="text-[clamp(0.6rem,1.5vw,0.75rem)] text-gray-500 dark:text-gray-400">
                    使用率: {record.rate}
                  </div>
                </div>
                
                {/* 右侧：使用次数和趋势 */}
                <div className="text-right">
                  <div className="font-bold text-lg">
                    {record.usage.toLocaleString()}
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400">
                    {record.trend}
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