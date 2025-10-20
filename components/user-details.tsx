'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface UserBasicInfo {
  id: number
  avatar: string
  username: string
  email: string
  joinDate: string
  lastActiveTime: string
  roles: string[]
  currentPoints: number
  totalConsumedPoints: number
}

export function UserDetails({ user, onBack }: { user: UserBasicInfo, onBack?: () => void }) {
  const exchangeHistory = [
    { time: '2024-03-01 10:12', source: '兑换卡：新春礼包', points: +200 },
    { time: '2024-03-08 18:30', source: '手动加分：运营活动', points: +50 },
    { time: '2024-03-10 09:45', source: '兑换卡：会员续费奖励', points: +100 },
  ]

  const usageHistory = [
    { time: '2024-03-12 14:02', feature: '功能一：批量处理', points: -20, status: '成功' },
    { time: '2024-03-13 16:20', feature: '功能二：AI分析', points: -30, status: '成功' },
    { time: '2024-03-14 21:05', feature: '功能一：批量处理', points: -20, status: '失败' },
  ]

  return (
    <div className="p-6 pt-4 lg:p-8 lg:pt-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={user.avatar} alt={user.username} />
            <AvatarFallback>{user.username.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="text-lg font-semibold">{user.username}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
        </div>
        {onBack && (
          <Button variant="outline" onClick={onBack}>返回用户列表</Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>基础信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">用户名</div>
              <div className="text-base">{user.username}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">邮箱</div>
              <div className="text-base">{user.email}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">注册时间</div>
              <div className="text-base">{user.joinDate}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">最近活跃</div>
              <div className="text-base">{user.lastActiveTime}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">当前积分</div>
              <div className="text-base">{user.currentPoints}</div>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">总消耗积分</div>
              <div className="text-base">{user.totalConsumedPoints}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>兑换历史（增加积分）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow>
                  <TableHead>时间</TableHead>
                  <TableHead>来源/动作</TableHead>
                  <TableHead>增加积分</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exchangeHistory.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{item.time}</TableCell>
                    <TableCell>{item.source}</TableCell>
                    <TableCell className="text-green-600">{item.points}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>使用历史（扣分）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <Table className="min-w-[600px]">
              <TableHeader>
                <TableRow>
                  <TableHead>时间</TableHead>
                  <TableHead>功能</TableHead>
                  <TableHead>扣分</TableHead>
                  <TableHead>状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usageHistory.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{item.time}</TableCell>
                    <TableCell>{item.feature}</TableCell>
                    <TableCell className="text-red-600">{item.points}</TableCell>
                    <TableCell>{item.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}