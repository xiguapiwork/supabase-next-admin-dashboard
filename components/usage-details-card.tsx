'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ToggleGroupCustom } from '@/components/ui/toggle-group-custom'
import { NumberPagination } from '@/components/ui/number-pagination'
import { useFunctionPerformance, type FunctionPerformance } from '@/hooks/use-function-performance'



export function UsageDetailsCard() {
  const [dateRange, setDateRange] = useState('30日')
  const { data, loading, error } = useFunctionPerformance()

  const dateRangeOptions = ['今日', '昨日', '7日', '30日']

  const getCurrentRecords = (): FunctionPerformance[] => {
    if (loading || error) return []
    
    switch (dateRange) {
      case '今日':
        return data.today
      case '昨日':
        return data.yesterday
      case '7日':
        return data.week
      case '30日':
        return data.month
      default:
        return data.month
    }
  }

  const currentRecords = getCurrentRecords()

  return (
    <Card style={{ width: '400px' }} className="flex-shrink-0 h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">性能</CardTitle>
        <div className="flex items-center space-x-2">
          <div></div>
          <ToggleGroupCustom
            options={dateRangeOptions}
            value={dateRange}
            onValueChange={(value) => value && setDateRange(value)}
          />
        </div>
      </CardHeader>
      <CardContent className="pt-2 flex-1 flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-sm text-gray-500">加载中...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-sm text-red-500">加载失败，请重试</div>
          </div>
        ) : currentRecords.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-sm text-gray-500">暂无数据</div>
          </div>
        ) : (
          <div className="space-y-8">
            {currentRecords.map((record) => (
              <div key={record.id} className="flex items-center">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="" alt="Function" />
                  <AvatarFallback>{record.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">{record.name}</p>
                  <p className="text-sm text-muted-foreground">{record.type}</p>
                </div>
                <div className="ml-auto font-medium">
                  <div className="text-right">
                    <div className="text-sm font-medium">{record.successRate}%</div>
                    <div className="text-xs text-muted-foreground">
                      {record.successCalls}/{record.totalCalls}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <NumberPagination totalItems={currentRecords.length} />
      </CardContent>
    </Card>
  )
}