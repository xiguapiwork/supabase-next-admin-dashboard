'use client'

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ToggleGroupCustom } from "@/components/ui/toggle-group-custom"
import { NumberPagination } from "@/components/ui/number-pagination"
import { useState } from 'react'
import { useAppSettings } from '@/contexts/AppSettingsContext'

// 使用详情数据
const usageDetailsRecords = [
  {
    id: 1,
    user: {
      name: '用户甲',
      email: 'usera@example.com',
      avatar: '/default-avatar/苹果.png'
    },
    usage: 15,
    time: '07-20 15:30'
  },
  {
    id: 2,
    user: {
      name: '用户乙',
      email: 'userb@example.com',
      avatar: '/default-avatar/橙子.png'
    },
    usage: 8,
    time: '07-20 14:15'
  },
  {
    id: 3,
    user: {
      name: '用户丙',
      email: 'userc@example.com',
      avatar: '/default-avatar/草莓.png'
    },
    usage: 23,
    time: '07-19 18:45'
  },
  {
    id: 4,
    user: {
      name: '用户丁',
      email: 'userd@example.com',
      avatar: '/default-avatar/菠萝.png'
    },
    usage: 12,
    time: '07-19 16:20'
  },
  {
    id: 5,
    user: {
      name: '用户戊',
      email: 'usere@example.com',
      avatar: '/default-avatar/蓝莓.png'
    },
    usage: 6,
    time: '07-19 11:30'
  }
]

// 最多使用数据（按使用次数排序）
const mostUsedRecords = [
  {
    id: 1,
    user: {
      name: '超级用户',
      email: 'superuser@example.com',
      avatar: '/default-avatar/菠萝.png'
    },
    usage: 156,
    time: '07-15 09:20'
  },
  {
    id: 2,
    user: {
      name: '活跃达人',
      email: 'activeuser@example.com',
      avatar: '/default-avatar/蓝莓.png'
    },
    usage: 134,
    time: '07-16 14:30'
  },
  {
    id: 3,
    user: {
      name: '高频用户',
      email: 'frequentuser@example.com',
      avatar: '/default-avatar/西瓜.png'
    },
    usage: 98,
    time: '07-17 11:45'
  },
  {
    id: 4,
    user: {
      name: '忠实用户',
      email: 'loyaluser@example.com',
      avatar: '/default-avatar/草莓.png'
    },
    usage: 87,
    time: '07-14 16:15'
  },
  {
    id: 5,
    user: {
      name: '资深用户',
      email: 'senioruser@example.com',
      avatar: '/default-avatar/苹果.png'
    },
    usage: 76,
    time: '07-13 13:40'
  }
]

// 最多使用数据（7日）
const mostUsed7DaysRecords = [
  {
    id: 1,
    user: {
      name: '周活跃王',
      email: 'weeklyking@example.com',
      avatar: '/default-avatar/菠萝.png'
    },
    usage: 89,
    time: '07-18 16:20'
  },
  {
    id: 2,
    user: {
      name: '七日达人',
      email: 'weeklyuser@example.com',
      avatar: '/default-avatar/蓝莓.png'
    },
    usage: 76,
    time: '07-19 14:30'
  },
  {
    id: 3,
    user: {
      name: '周频用户',
      email: 'weeklyactive@example.com',
      avatar: '/default-avatar/西瓜.png'
    },
    usage: 65,
    time: '07-17 11:45'
  },
  {
    id: 4,
    user: {
      name: '周使用者',
      email: 'weeklyuser2@example.com',
      avatar: '/default-avatar/草莓.png'
    },
    usage: 54,
    time: '07-16 16:15'
  },
  {
    id: 5,
    user: {
      name: '周常客',
      email: 'weeklyregular@example.com',
      avatar: '/default-avatar/苹果.png'
    },
    usage: 43,
    time: '07-15 13:40'
  }
]

// 最多使用数据（今日）
const mostUsedTodayRecords = [
  {
    id: 1,
    user: {
      name: '今日冠军',
      email: 'todaychamp@example.com',
      avatar: '/default-avatar/菠萝.png'
    },
    usage: 25,
    time: '今日 16:20'
  },
  {
    id: 2,
    user: {
      name: '今日活跃',
      email: 'todayactive@example.com',
      avatar: '/default-avatar/蓝莓.png'
    },
    usage: 18,
    time: '今日 14:30'
  },
  {
    id: 3,
    user: {
      name: '今日用户',
      email: 'todayuser@example.com',
      avatar: '/default-avatar/西瓜.png'
    },
    usage: 15,
    time: '今日 11:45'
  },
  {
    id: 4,
    user: {
      name: '今日使用',
      email: 'todayusage@example.com',
      avatar: '/default-avatar/草莓.png'
    },
    usage: 12,
    time: '今日 10:15'
  },
  {
    id: 5,
    user: {
      name: '今日访客',
      email: 'todayvisitor@example.com',
      avatar: '/default-avatar/苹果.png'
    },
    usage: 9,
    time: '今日 08:40'
  }
]

// 最多使用数据（昨日）
const mostUsedYesterdayRecords = [
  {
    id: 1,
    user: {
      name: '昨日之王',
      email: 'yesterdayking@example.com',
      avatar: '/default-avatar/菠萝.png'
    },
    usage: 32,
    time: '昨日 18:20'
  },
  {
    id: 2,
    user: {
      name: '昨日活跃',
      email: 'yesterdayactive@example.com',
      avatar: '/default-avatar/蓝莓.png'
    },
    usage: 28,
    time: '昨日 16:45'
  },
  {
    id: 3,
    user: {
      name: '昨日用户',
      email: 'yesterdayuser@example.com',
      avatar: '/default-avatar/西瓜.png'
    },
    usage: 22,
    time: '昨日 14:30'
  },
  {
    id: 4,
    user: {
      name: '昨日使用',
      email: 'yesterdayusage@example.com',
      avatar: '/default-avatar/草莓.png'
    },
    usage: 19,
    time: '昨日 12:15'
  },
  {
    id: 5,
    user: {
      name: '昨日访客',
      email: 'yesterdayvisitor@example.com',
      avatar: '/default-avatar/苹果.png'
    },
    usage: 16,
    time: '昨日 10:40'
  }
]

export function UsageDetailsCard() {
  const { cardCount } = useAppSettings()
  const [displayMode, setDisplayMode] = useState('最近使用')
  const [dateRange, setDateRange] = useState('30日')
  const modeOptions = ['最近使用', '最多使用']
  const dateRangeOptions = ['今日', '昨日', '7日', '30日']
  
  // 根据显示模式和日期范围获取对应的数据
  const getCurrentRecords = () => {
    if (displayMode === '最近使用') {
      return usageDetailsRecords
    } else {
      // 最多使用模式，根据日期范围返回不同数据
      switch (dateRange) {
        case '今日':
          return mostUsedTodayRecords
        case '昨日':
          return mostUsedYesterdayRecords
        case '7日':
          return mostUsed7DaysRecords
        case '30日':
        default:
          return mostUsedRecords
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
        <div className="space-y-4">
          {filteredRecords.map((record) => (
            <div key={record.id} className="flex items-center justify-between px-[4%] py-[1%] border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50 aspect-[5/1]">
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
              
              {/* 右侧：使用次数和时间 */}
              <div className="text-right">
                <div className="font-semibold text-[clamp(0.6rem,1.5vw,0.7rem)] text-blue-600">
                  {record.usage}次
                </div>
                <div className="text-sm text-muted-foreground text-[clamp(0.5rem,1.2vw,0.6rem)]">
                  {record.time}
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