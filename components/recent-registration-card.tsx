'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ToggleGroupCustom } from "@/components/ui/toggle-group-custom"
import { NumberPagination } from "@/components/ui/number-pagination"
import { formatPoints } from "@/lib/format-points"
import { useState } from 'react'

// 最近注册用户数据
const recentRegistrationRecords = [
  {
    id: 1,
    user: {
      name: '新用户一',
      email: 'newuser1@example.com',
      avatar: '/default-avatar/苹果.png'
    },
    points: 100,
    time: '07-20 15:30'
  },
  {
    id: 2,
    user: {
      name: '新用户二',
      email: 'newuser2@example.com',
      avatar: '/default-avatar/橙子.png'
    },
    points: 100,
    time: '07-20 14:15'
  },
  {
    id: 3,
    user: {
      name: '新用户三',
      email: 'newuser3@example.com',
      avatar: '/default-avatar/草莓.png'
    },
    points: 100,
    time: '07-19 18:45'
  },
  {
    id: 4,
    user: {
      name: '新用户四',
      email: 'newuser4@example.com',
      avatar: '/default-avatar/菠萝.png'
    },
    points: 100,
    time: '07-19 16:20'
  },
  {
    id: 5,
    user: {
      name: '新用户五',
      email: 'newuser5@example.com',
      avatar: '/default-avatar/蓝莓.png'
    },
    points: 100,
    time: '07-19 11:30'
  }
]

export function RecentRegistrationCard() {
  const [selectedCount, setSelectedCount] = useState('10条')
  const options = ['10条', '30条']
  
  // 根据选择的条数过滤数据
  const getFilteredRecords = () => {
    const count = selectedCount === '10条' ? 10 : 30
    return recentRegistrationRecords.slice(0, Math.min(count, recentRegistrationRecords.length))
  }
  
  const filteredRecords = getFilteredRecords()
  const totalCount = parseInt(selectedCount.replace('条', ''))

  return (
    <Card style={{ width: '400px' }} className="flex-shrink-0">
      <CardHeader className="pb-2 pt-4 !flex !flex-row !items-center !justify-between !space-y-0">
        <CardTitle className="text-xs sm:text-sm md:text-base lg:text-lg flex items-center">最近注册用户</CardTitle>
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