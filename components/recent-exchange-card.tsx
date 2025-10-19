'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ToggleGroupCustom } from "@/components/ui/toggle-group-custom"
import { NumberPagination } from "@/components/ui/number-pagination"
import { formatPoints } from "@/lib/format-points"
import { useState } from 'react'

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

export function RecentExchangeCard() {
  const [selectedCount, setSelectedCount] = useState('10条')
  const options = ['10条', '30条']
  
  // 根据选择的条数过滤数据
  const getFilteredRecords = () => {
    const count = selectedCount === '10条' ? 10 : 30
    return recentExchangeRecords.slice(0, Math.min(count, recentExchangeRecords.length))
  }
  
  const filteredRecords = getFilteredRecords()
  const totalCount = parseInt(selectedCount.replace('条', ''))

  return (
    <Card style={{ width: '400px' }} className="flex-shrink-0">
      <CardHeader className="pb-2 pt-4 !flex !flex-row !items-center !justify-between !space-y-0">
        <CardTitle className="text-xs sm:text-sm md:text-base lg:text-lg flex items-center">最近兑换记录</CardTitle>
        <div className="flex items-center">
          <ToggleGroupCustom
            options={options}
            value={selectedCount}
            onValueChange={setSelectedCount}
            className="text-xs sm:text-sm md:text-base"
          />
        </div>
      </CardHeader>
      <CardContent className="pt-1">
        <div className="space-y-4">
          {filteredRecords.map((record) => (
            <div key={record.id} className="flex items-center justify-between px-[4%] py-[2%] border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50 aspect-[5/1]">
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
                <div className={`font-semibold text-[clamp(0.6rem,1.5vw,0.7rem)] ${
                  record.points > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {record.points > 0 ? '+' : ''}{formatPoints(record.points)}
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