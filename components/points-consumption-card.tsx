'use client'

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ToggleGroupCustom } from "@/components/ui/toggle-group-custom"
import { NumberPagination } from "@/components/ui/number-pagination"
import { useState } from 'react'
import { useAppSettings } from '@/contexts/AppSettingsContext'

// 最近消耗用户数据
const recentConsumptionUsers = [
  {
    id: 1,
    user: {
      name: '张三',
      email: 'zhangsan@example.com',
      avatar: '/default-avatar/菠萝.png'
    },
    points: 150,
    time: '07-20 14:30'
  },
  {
    id: 2,
    user: {
      name: '李四',
      email: 'lisi@example.com',
      avatar: '/default-avatar/蓝莓.png'
    },
    points: 200,
    time: '07-19 16:45'
  },
  {
    id: 3,
    user: {
      name: '王五',
      email: 'wangwu@example.com',
      avatar: '/default-avatar/西瓜.png'
    },
    points: 80,
    time: '07-19 13:20'
  },
  {
    id: 4,
    user: {
      name: '赵六',
      email: 'zhaoliu@example.com',
      avatar: '/default-avatar/鸭梨.png'
    },
    points: 300,
    time: '07-18 10:15'
  },
  {
    id: 5,
    user: {
      name: '钱七',
      email: 'qianqi@example.com',
      avatar: '/default-avatar/苹果.png'
    },
    points: 120,
    time: '07-18 09:30'
  }
]

// 最多消耗用户数据（30日）
const mostConsumption30DaysUsers = [
  {
    id: 1,
    user: {
      name: '消耗王者',
      email: 'topuser@example.com',
      avatar: '/default-avatar/菠萝.png'
    },
    points: 5200,
    time: '07-15 11:20',
    usageCount: 42
  },
  {
    id: 2,
    user: {
      name: '积分大户',
      email: 'bigspender@example.com',
      avatar: '/default-avatar/蓝莓.png'
    },
    points: 4800,
    time: '07-16 09:45',
    usageCount: 38
  },
  {
    id: 3,
    user: {
      name: '消耗达人',
      email: 'spendmaster@example.com',
      avatar: '/default-avatar/草莓.png'
    },
    points: 4200,
    time: '07-17 15:30',
    usageCount: 35
  },
  {
    id: 4,
    user: {
      name: '高级消费者',
      email: 'premiumuser@example.com',
      avatar: '/default-avatar/苹果.png'
    },
    points: 3800,
    time: '07-14 13:15',
    usageCount: 32
  },
  {
    id: 5,
    user: {
      name: '活跃消费者',
      email: 'activespender@example.com',
      avatar: '/default-avatar/橙子.png'
    },
    points: 3400,
    time: '07-13 16:40',
    usageCount: 28
  }
]

// 最多消耗用户数据（7日）
const mostConsumption7DaysUsers = [
  {
    id: 1,
    user: {
      name: '周消耗王',
      email: 'weekking@example.com',
      avatar: '/default-avatar/菠萝.png'
    },
    points: 2100,
    time: '07-20 11:20',
    usageCount: 18
  },
  {
    id: 2,
    user: {
      name: '周消费达人',
      email: 'weekspender@example.com',
      avatar: '/default-avatar/蓝莓.png'
    },
    points: 1800,
    time: '07-19 09:45',
    usageCount: 15
  },
  {
    id: 3,
    user: {
      name: '周活跃用户',
      email: 'weekactive@example.com',
      avatar: '/default-avatar/草莓.png'
    },
    points: 1500,
    time: '07-18 15:30',
    usageCount: 12
  },
  {
    id: 4,
    user: {
      name: '周高级用户',
      email: 'weekpremium@example.com',
      avatar: '/default-avatar/苹果.png'
    },
    points: 1200,
    time: '07-17 13:15',
    usageCount: 10
  },
  {
    id: 5,
    user: {
      name: '周消费者',
      email: 'weekconsumer@example.com',
      avatar: '/default-avatar/橙子.png'
    },
    points: 1000,
    time: '07-16 16:40',
    usageCount: 8
  }
]

// 最多消耗用户数据（今日）
const mostConsumptionTodayUsers = [
  {
    id: 1,
    user: {
      name: '今日消耗王',
      email: 'todayking@example.com',
      avatar: '/default-avatar/菠萝.png'
    },
    points: 680,
    time: '今日 15:20',
    usageCount: 12
  },
  {
    id: 2,
    user: {
      name: '今日消费者',
      email: 'todayspender@example.com',
      avatar: '/default-avatar/蓝莓.png'
    },
    points: 520,
    time: '今日 12:45',
    usageCount: 9
  },
  {
    id: 3,
    user: {
      name: '今日活跃',
      email: 'todayactive@example.com',
      avatar: '/default-avatar/草莓.png'
    },
    points: 450,
    time: '今日 10:30',
    usageCount: 8
  },
  {
    id: 4,
    user: {
      name: '今日用户',
      email: 'todayuser@example.com',
      avatar: '/default-avatar/苹果.png'
    },
    points: 380,
    time: '今日 09:15',
    usageCount: 6
  },
  {
    id: 5,
    user: {
      name: '今日消费',
      email: 'todayconsumer@example.com',
      avatar: '/default-avatar/橙子.png'
    },
    points: 320,
    time: '今日 08:40',
    usageCount: 5
  }
]

// 最多消耗用户数据（昨日）
const mostConsumptionYesterdayUsers = [
  {
    id: 1,
    user: {
      name: '昨日消耗王',
      email: 'yesterdayking@example.com',
      avatar: '/default-avatar/菠萝.png'
    },
    points: 850,
    time: '昨日 18:20',
    usageCount: 15
  },
  {
    id: 2,
    user: {
      name: '昨日消费者',
      email: 'yesterdayspender@example.com',
      avatar: '/default-avatar/蓝莓.png'
    },
    points: 720,
    time: '昨日 16:45',
    usageCount: 12
  },
  {
    id: 3,
    user: {
      name: '昨日活跃',
      email: 'yesterdayactive@example.com',
      avatar: '/default-avatar/草莓.png'
    },
    points: 650,
    time: '昨日 14:30',
    usageCount: 11
  },
  {
    id: 4,
    user: {
      name: '昨日用户',
      email: 'yesterdayuser@example.com',
      avatar: '/default-avatar/苹果.png'
    },
    points: 580,
    time: '昨日 12:15',
    usageCount: 9
  },
  {
    id: 5,
    user: {
      name: '昨日消费',
      email: 'yesterdayconsumer@example.com',
      avatar: '/default-avatar/橙子.png'
    },
    points: 520,
    time: '昨日 10:40',
    usageCount: 8
  }
]

export function PointsConsumptionCard() {
  const { cardCount } = useAppSettings()
  const [displayMode, setDisplayMode] = useState('最近消耗')
  const [dateRange, setDateRange] = useState('30日')
  const modeOptions = ['最近消耗', '最多消耗']
  const dateRangeOptions = ['今日', '昨日', '7日', '30日']
  
  // 根据显示模式和日期范围获取对应的数据
  const getCurrentRecords = () => {
    if (displayMode === '最近消耗') {
      return recentConsumptionUsers
    } else {
      // 最多消耗模式下根据日期范围返回不同数据
      if (dateRange === '今日') {
        return mostConsumptionTodayUsers
      } else if (dateRange === '昨日') {
        return mostConsumptionYesterdayUsers
      } else if (dateRange === '7日') {
        return mostConsumption7DaysUsers
      } else {
        return mostConsumption30DaysUsers
      }
    }
  }
  
  // 根据全局设置的数量过滤数据
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
        <NumberPagination totalItems={totalCount} />
      </CardContent>
    </Card>
  )
}