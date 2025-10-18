'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ToggleGroupCustom } from "@/components/ui/toggle-group-custom"
import { NumberPagination } from "@/components/ui/number-pagination"
import { useState } from 'react'

// 最近活跃用户数据
const recentActiveUsers = [
  {
    id: 1,
    user: {
      name: '张三',
      email: 'zhangsan@example.com',
      avatar: '/avatars/zhangsan.jpg'
    },
    points: 150,
    time: '07-20 14:30'
  },
  {
    id: 2,
    user: {
      name: '李四',
      email: 'lisi@example.com',
      avatar: '/avatars/lisi.jpg'
    },
    points: 200,
    time: '07-19 16:45'
  },
  {
    id: 3,
    user: {
      name: '王五',
      email: 'wangwu@example.com',
      avatar: '/avatars/wangwu.jpg'
    },
    points: 80,
    time: '07-19 13:20'
  },
  {
    id: 4,
    user: {
      name: '赵六',
      email: 'zhaoliu@example.com',
      avatar: '/avatars/zhaoliu.jpg'
    },
    points: 300,
    time: '07-18 10:15'
  },
  {
    id: 5,
    user: {
      name: '钱七',
      email: 'qianqi@example.com',
      avatar: '/avatars/qianqi.jpg'
    },
    points: 120,
    time: '07-18 09:30'
  }
]

export function PointsConsumptionCard() {
  const [selectedPeriod, setSelectedPeriod] = useState('今日')
  const [selectedCount, setSelectedCount] = useState('10条')
  const periodOptions = ['今日', '7日', '30日']
  const countOptions = ['10条', '30条']
  
  // 根据选择的数量过滤数据
  const getFilteredRecords = () => {
    const count = selectedCount === '10条' ? 10 : 30
    return recentActiveUsers.slice(0, Math.min(count, recentActiveUsers.length))
  }
  
  const filteredRecords = getFilteredRecords()
  const totalCount = selectedCount === '10条' ? 10 : 30

  return (
    <Card>
      <CardHeader className="pb-4 !flex !flex-row !items-center !justify-between !space-y-0">
        <CardTitle className="text-base sm:text-lg md:text-xl lg:text-2xl flex items-center">积分消耗记录</CardTitle>
        <div className="flex gap-2 items-center">
          <ToggleGroupCustom
            options={periodOptions}
            value={selectedPeriod}
            onValueChange={setSelectedPeriod}
            className="text-xs sm:text-sm md:text-base"
          />
          <ToggleGroupCustom
            options={countOptions}
            value={selectedCount}
            onValueChange={setSelectedCount}
            className="text-xs sm:text-sm md:text-base"
          />
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="space-y-4">
          {filteredRecords.map((record) => (
            <div key={record.id} className="flex items-center justify-between px-[4%] py-[2%] border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50 aspect-[5/1]">
              {/* 左侧：用户头像、用户名、邮箱 */}
              <div className="flex items-center">
                <Avatar className="aspect-square h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 flex-shrink-0">
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
                <div className="text-[clamp(0.7rem,1.8vw,0.85rem)] font-bold text-red-600 dark:text-red-400">
                  -{record.points}
                </div>
                <div className="text-[clamp(0.6rem,1.5vw,0.75rem)] text-gray-500 dark:text-gray-400">
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