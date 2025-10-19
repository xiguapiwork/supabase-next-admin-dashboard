'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ToggleGroupCustom } from "@/components/ui/toggle-group-custom"
import { useState } from 'react'

// 功能详情数据
const functionDetailsData = {
  today: [
    { name: '功能A', usage: 156, rate: '85%', trend: '+12%' },
    { name: '功能B', usage: 134, rate: '78%', trend: '+8%' },
    { name: '功能C', usage: 98, rate: '65%', trend: '+5%' },
  ],
  yesterday: [
    { name: '功能A', usage: 142, rate: '82%', trend: '+10%' },
    { name: '功能B', usage: 128, rate: '75%', trend: '+6%' },
    { name: '功能C', usage: 89, rate: '62%', trend: '+3%' },
  ],
  week: [
    { name: '功能A', usage: 1089, rate: '84%', trend: '+15%' },
    { name: '功能B', usage: 945, rate: '76%', trend: '+12%' },
    { name: '功能C', usage: 678, rate: '63%', trend: '+8%' },
  ],
  month: [
    { name: '功能A', usage: 4567, rate: '83%', trend: '+18%' },
    { name: '功能B', usage: 3890, rate: '77%', trend: '+14%' },
    { name: '功能C', usage: 2345, rate: '64%', trend: '+11%' },
  ]
}

export function FunctionDetailsCard() {
  const [timeRange, setTimeRange] = useState('today')

  const getCurrentData = () => {
    switch (timeRange) {
      case 'today':
        return functionDetailsData.today
      case 'yesterday':
        return functionDetailsData.yesterday
      case 'week':
        return functionDetailsData.week
      case 'month':
        return functionDetailsData.month
      default:
        return functionDetailsData.today
    }
  }

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case 'today':
        return '今日'
      case 'yesterday':
        return '昨日'
      case 'week':
        return '本周'
      case 'month':
        return '本月'
      default:
        return '今日'
    }
  }

  return (
    <Card className="w-[320px] h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">功能详情</CardTitle>
          <ToggleGroupCustom
            options={['今日', '昨日', '本周', '本月']}
            value={getTimeRangeLabel()}
            onValueChange={(value) => {
              switch (value) {
                case '今日':
                  setTimeRange('today')
                  break
                case '昨日':
                  setTimeRange('yesterday')
                  break
                case '本周':
                  setTimeRange('week')
                  break
                case '本月':
                  setTimeRange('month')
                  break
              }
            }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {getCurrentData().map((item, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex flex-col">
              <div className="font-medium text-sm">{item.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                使用率: {item.rate}
              </div>
            </div>
            <div className="flex flex-col items-end">
              <div className="font-bold text-lg">{item.usage.toLocaleString()}</div>
              <div className="text-xs text-green-600 dark:text-green-400">
                {item.trend}
              </div>
            </div>
          </div>
        ))}
        
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {getTimeRangeLabel()}功能使用统计
          </div>
        </div>
      </CardContent>
    </Card>
  )
}