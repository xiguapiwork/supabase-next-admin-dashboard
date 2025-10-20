'use client'

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ToggleGroupCustom } from "@/components/ui/toggle-group-custom"
import { NumberPagination } from "@/components/ui/number-pagination"
import { formatPoints } from "@/lib/format-points"
import { useState } from 'react'
import { useAppSettings } from '@/contexts/AppSettingsContext'

// 最近兑换记录数据
const recentExchangeRecords = [
  {
    id: 1,
    user: {
      name: '张三',
      email: 'zhangsan@example.com',
      avatar: '/default-avatar/西瓜.png'
    },
    points: 1500,
    time: '07-20 14:30'
  },
  {
    id: 2,
    user: {
      name: '李四',
      email: 'lisi@example.com',
      avatar: '/default-avatar/鸭梨.png'
    },
    points: 2000,
    time: '07-19 16:45'
  },
  {
    id: 3,
    user: {
      name: '王五',
      email: 'wangwu@example.com',
      avatar: '/default-avatar/苹果.png'
    },
    points: 800,
    time: '07-19 13:20'
  },
  {
    id: 4,
    user: {
      name: '赵六',
      email: 'zhaoliu@example.com',
      avatar: '/default-avatar/橙子.png'
    },
    points: 3000,
    time: '07-18 10:15'
  },
  {
    id: 5,
    user: {
      name: '钱七',
      email: 'qianqi@example.com',
      avatar: '/default-avatar/草莓.png'
    },
    points: 1200,
    time: '07-18 09:30'
  }
]

// 最多兑换记录数据（按积分从高到低排序）
const mostExchangeRecords = [
  {
    id: 1,
    user: {
      name: '兑换王者',
      email: 'topexchanger@example.com',
      avatar: '/default-avatar/菠萝.png'
    },
    points: 8500,
    time: '07-15 11:20',
    exchangeCount: 25
  },
  {
    id: 2,
    user: {
      name: '积分大户',
      email: 'bigpoints@example.com',
      avatar: '/default-avatar/蓝莓.png'
    },
    points: 7200,
    time: '07-16 09:45',
    exchangeCount: 18
  },
  {
    id: 3,
    user: {
      name: '兑换达人',
      email: 'exchangemaster@example.com',
      avatar: '/default-avatar/草莓.png'
    },
    points: 6800,
    time: '07-17 15:30',
    exchangeCount: 16
  },
  {
    id: 4,
    user: {
      name: '高级用户',
      email: 'vipuser@example.com',
      avatar: '/default-avatar/苹果.png'
    },
    points: 5500,
    time: '07-14 13:15',
    exchangeCount: 14
  },
  {
    id: 5,
    user: {
      name: '活跃会员',
      email: 'activemember@example.com',
      avatar: '/default-avatar/橙子.png'
    },
    points: 4900,
    time: '07-13 16:40',
    exchangeCount: 12
  }
]

// 最多兑换记录数据（7日）
const mostExchange7DaysRecords = [
  {
    id: 1,
    user: {
      name: '周榜冠军',
      email: 'weekchampion@example.com',
      avatar: '/default-avatar/菠萝.png'
    },
    points: 4200,
    time: '07-20 11:20',
    exchangeCount: 15
  },
  {
    id: 2,
    user: {
      name: '周活跃王',
      email: 'weekactive@example.com',
      avatar: '/default-avatar/蓝莓.png'
    },
    points: 3800,
    time: '07-19 09:45',
    exchangeCount: 12
  },
  {
    id: 3,
    user: {
      name: '周兑换达人',
      email: 'weekmaster@example.com',
      avatar: '/default-avatar/草莓.png'
    },
    points: 3200,
    time: '07-18 15:30',
    exchangeCount: 10
  },
  {
    id: 4,
    user: {
      name: '周高级用户',
      email: 'weekvip@example.com',
      avatar: '/default-avatar/苹果.png'
    },
    points: 2900,
    time: '07-17 13:15',
    exchangeCount: 8
  },
  {
    id: 5,
    user: {
      name: '周活跃会员',
      email: 'weekmember@example.com',
      avatar: '/default-avatar/橙子.png'
    },
    points: 2500,
    time: '07-16 16:40',
    exchangeCount: 7
  }
]

// 最多兑换记录数据（今日）
const mostExchangeTodayRecords = [
  {
    id: 1,
    user: {
      name: '今日之星',
      email: 'todaystar@example.com',
      avatar: '/default-avatar/菠萝.png'
    },
    points: 1800,
    time: '今日 15:20',
    exchangeCount: 8
  },
  {
    id: 2,
    user: {
      name: '日榜第二',
      email: 'todaysecond@example.com',
      avatar: '/default-avatar/蓝莓.png'
    },
    points: 1500,
    time: '今日 12:45',
    exchangeCount: 6
  },
  {
    id: 3,
    user: {
      name: '今日活跃',
      email: 'todayactive@example.com',
      avatar: '/default-avatar/草莓.png'
    },
    points: 1200,
    time: '今日 10:30',
    exchangeCount: 5
  },
  {
    id: 4,
    user: {
      name: '日榜用户',
      email: 'todayuser@example.com',
      avatar: '/default-avatar/苹果.png'
    },
    points: 1000,
    time: '今日 09:15',
    exchangeCount: 4
  },
  {
    id: 5,
    user: {
      name: '今日会员',
      email: 'todaymember@example.com',
      avatar: '/default-avatar/橙子.png'
    },
    points: 800,
    time: '今日 08:40',
    exchangeCount: 3
  }
]

// 最多兑换记录数据（昨日）
const mostExchangeYesterdayRecords = [
  {
    id: 1,
    user: {
      name: '昨日兑换王',
      email: 'yesterdayking@example.com',
      avatar: '/default-avatar/菠萝.png'
    },
    points: 750,
    time: '昨日 18:20',
    exchangeCount: 10
  },
  {
    id: 2,
    user: {
      name: '昨日兑换者',
      email: 'yesterdayexchanger@example.com',
      avatar: '/default-avatar/蓝莓.png'
    },
    points: 620,
    time: '昨日 16:45',
    exchangeCount: 8
  },
  {
    id: 3,
    user: {
      name: '昨日活跃',
      email: 'yesterdayactive@example.com',
      avatar: '/default-avatar/草莓.png'
    },
    points: 580,
    time: '昨日 14:30',
    exchangeCount: 7
  },
  {
    id: 4,
    user: {
      name: '昨日用户',
      email: 'yesterdayuser@example.com',
      avatar: '/default-avatar/苹果.png'
    },
    points: 480,
    time: '昨日 12:15',
    exchangeCount: 6
  },
  {
    id: 5,
    user: {
      name: '昨日兑换',
      email: 'yesterdayexchange@example.com',
      avatar: '/default-avatar/橙子.png'
    },
    points: 420,
    time: '昨日 10:40',
    exchangeCount: 5
  }
]

export function RecentExchangeCard() {
  const { cardCount } = useAppSettings()
  const [displayMode, setDisplayMode] = useState('最近兑换')
  const [dateRange, setDateRange] = useState('30日')
  const modeOptions = ['最近兑换', '最多兑换']
  const dateRangeOptions = ['今日', '昨日', '7日', '30日']
  
  // 根据显示模式和日期范围获取对应的数据
  const getCurrentRecords = () => {
    if (displayMode === '最近兑换') {
      return recentExchangeRecords
    } else {
      // 最多兑换模式下根据日期范围返回不同数据
      if (dateRange === '今日') {
        return mostExchangeTodayRecords
      } else if (dateRange === '昨日') {
        return mostExchangeYesterdayRecords
      } else if (dateRange === '7日') {
        return mostExchange7DaysRecords
      } else {
        return mostExchangeRecords
      }
    }
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
          ))}
        </div>
        <NumberPagination totalItems={totalCount} />
      </CardContent>
    </Card>
  )
}