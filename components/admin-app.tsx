'use client'

import { useState } from 'react'
import { AdminLayout } from '@/components/admin-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Download, Plus } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'


import { Dashboard } from './dashboard'
import { UsersManagement } from './users-management'
import { ExchangeCards } from './exchange-cards'
import { PointsLogs } from './points-logs'
import { TaskLogs } from './task-logs'
import { Setting } from './setting'
import { DatabaseTest } from './database-test'
import { AppSettingsProvider } from '@/contexts/AppSettingsContext'
import { ExchangeCardsProvider, useExchangeCardsRefresh } from '@/contexts/ExchangeCardsContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface AdminAppProps {
  initialPage?: string
}

const queryClient = new QueryClient()

function AdminAppInner({ initialPage = '/dashboard' }: AdminAppProps) {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const { triggerRefresh } = useExchangeCardsRefresh()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [exportDataType, setExportDataType] = useState('all')
  const [exportColumns, setExportColumns] = useState({
    name: true,
    cardNumber: true,
    points: true,
    status: true,
    username: false,
    userEmail: false,
    description: true,
    createdDate: true,
    redeemedDate: true
  })
  
  // 用户导出功能状态
  const [isUserExportDialogOpen, setIsUserExportDialogOpen] = useState(false)
  const [exportRoleFilter, setExportRoleFilter] = useState<'普通用户' | '付费用户' | '管理员' | 'all'>('all')
  const [userExportColumns, setUserExportColumns] = useState({
    username: true,
    email: true,
    roles: true,
    currentPoints: true,
    totalConsumedPoints: false,
    todayPoints: false,
    weekPoints: false,
    joinDate: true,
    lastActiveTime: false,
    notes: true
  })

  // 使用记录导出功能状态
  const [isLogsExportDialogOpen, setIsLogsExportDialogOpen] = useState(false)
  const [logsExportStatusFilter, setLogsExportStatusFilter] = useState<'all' | '成功' | '失败' | '处理中'>('all')
  const [logsExportColumns, setLogsExportColumns] = useState({
    timestamp: true,
    username: true,
    userEmail: true,
    action: true,
    status: true,
    details: true,
    initialPoints: true,
    pointsChange: true,
    finalPoints: true,
    taskId: false
  })

  // Task Logs导出功能状态
  const [isTaskLogsExportDialogOpen, setIsTaskLogsExportDialogOpen] = useState(false)
  const [taskLogsExportStatusFilter, setTaskLogsExportStatusFilter] = useState<'all' | '成功' | '失败' | '处理中'>('all')
  const [taskLogsExportColumns, setTaskLogsExportColumns] = useState({
    timestamp: true,
    taskId: true,
    username: true,
    userEmail: true,
    action: true,
    status: true,
    details: true,
    ipAddress: false,
    userAgent: false
  })

  // 创建兑换卡表单状态
  const [createCardForm, setCreateCardForm] = useState({
    name: '',
    points: '',
    description: '',
    quantity: '1'
  })
  const [isCreatingCard, setIsCreatingCard] = useState(false)
  const [createCardErrors, setCreateCardErrors] = useState({
    name: '',
    points: '',
    quantity: ''
  })

  // 表单验证函数
  const validateCreateCardForm = () => {
    const errors = { name: '', points: '', quantity: '' }
    let isValid = true

    if (!createCardForm.name.trim()) {
      errors.name = '卡片名称不能为空'
      isValid = false
    }

    const points = parseInt(createCardForm.points)
    if (!createCardForm.points || isNaN(points) || points <= 0) {
      errors.points = '积分数量必须是大于0的数字'
      isValid = false
    }

    const quantity = parseInt(createCardForm.quantity)
    if (!createCardForm.quantity || isNaN(quantity) || quantity <= 0 || quantity > 100) {
      errors.quantity = '创建数量必须是1-100之间的数字'
      isValid = false
    }

    setCreateCardErrors(errors)
    return isValid
  }

  // 重置表单
  const resetCreateCardForm = () => {
    setCreateCardForm({
      name: '',
      points: '',
      description: '',
      quantity: '1'
    })
    setCreateCardErrors({
      name: '',
      points: '',
      quantity: ''
    })
  }

  // 处理表单输入变化
  const handleCreateCardFormChange = (field: string, value: string) => {
    setCreateCardForm(prev => ({ ...prev, [field]: value }))
    // 清除对应字段的错误信息
    if (createCardErrors[field as keyof typeof createCardErrors]) {
      setCreateCardErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // 提交创建兑换卡表单
  const handleCreateCard = async () => {
    if (!validateCreateCardForm()) {
      return
    }

    setIsCreatingCard(true)
    try {
      const supabase = createClient()
      
      // 直接调用数据库函数
      const { data, error } = await supabase.rpc('batch_create_exchange_cards', {
        p_card_name: createCardForm.name,
        p_points: parseInt(createCardForm.points),
        p_description: createCardForm.description || null,
        p_quantity: parseInt(createCardForm.quantity)
      })

      if (error) {
        throw error
      }

      console.log('创建成功:', data)
      
      // 重置表单并关闭对话框
      resetCreateCardForm()
      setIsCreateDialogOpen(false)
      
      // 显示成功提示
      toast.success(`成功创建 ${createCardForm.quantity} 张兑换卡！`)
      
      // 触发兑换卡列表刷新
      triggerRefresh()
      
    } catch (error: unknown) {
      console.error('创建兑换卡失败:', error)
      const errorMessage = error instanceof Error ? error.message : '请重试'
      toast.error(`创建兑换卡失败：${errorMessage}`)
    } finally {
      setIsCreatingCard(false)
    }
  }

  // 处理兑换卡导出
  const handleExportExchangeCards = async () => {
    try {
      const supabase = createClient()
      
      // 获取兑换卡数据
      const { data: exchangeCards, error } = await supabase.rpc('get_exchange_cards_list')
      
      if (error) {
        throw error
      }

      if (!exchangeCards || exchangeCards.length === 0) {
        toast.error('没有可导出的数据')
        return
      }

      // 根据筛选条件过滤数据
      let filteredData = exchangeCards
      if (exportDataType !== 'all') {
        filteredData = exchangeCards.filter((card: { 状态: boolean }) => {
          if (exportDataType === '已兑换') {
            return !card.状态
          } else if (exportDataType === '未兑换') {
            return card.状态
          }
          return true
        })
      }

      if (filteredData.length === 0) {
        toast.error('筛选条件下没有可导出的数据')
        return
      }

      // 获取用户信息以便显示用户名和邮箱
      const userIds = filteredData
        .filter((card: { 兑换人: string | null }) => card.兑换人)
        .map((card: { 兑换人: string | null }) => card.兑换人)
      
      let usersData: Array<{id: string, username: string, email: string}> = []
      if (userIds.length > 0) {
        const { data: users } = await supabase
          .from('user-management')
          .select('id, username, email')
          .in('id', userIds)
        usersData = users || []
      }

      // 构建CSV数据
      const headers: string[] = []
      const fieldMap: { [key: string]: string } = {
        name: '卡片名称',
        cardNumber: '卡号',
        points: '积分数量',
        status: '状态',
        username: '用户名',
        userEmail: '用户邮箱',
        description: '备注',
        createdDate: '创建日期',
        redeemedDate: '兑换日期'
      }

      // 根据选择的字段构建表头
      Object.keys(exportColumns).forEach(key => {
        if (exportColumns[key as keyof typeof exportColumns]) {
          headers.push(fieldMap[key])
        }
      })

      // 构建数据行
      const rows = filteredData.map((card: {
        卡片名称: string;
        卡号: string;
        积分数量: number;
        状态: boolean;
        兑换人: string | null;
        备注: string | null;
        创建时间: string;
        兑换时间: string | null;
      }) => {
        const user = usersData.find(u => u.id === card.兑换人)
        const row: string[] = []
        
        Object.keys(exportColumns).forEach(key => {
          if (exportColumns[key as keyof typeof exportColumns]) {
            switch (key) {
              case 'name':
                row.push(card.卡片名称 || '')
                break
              case 'cardNumber':
                row.push(card.卡号 || '')
                break
              case 'points':
                row.push(card.积分数量?.toString() || '')
                break
              case 'status':
                row.push(card.状态 ? '未兑换' : '已兑换')
                break
              case 'username':
                row.push(user?.username || '')
                break
              case 'userEmail':
                row.push(user?.email || '')
                break
              case 'description':
                row.push(card.备注 || '')
                break
              case 'createdDate':
                row.push(card.创建时间 ? new Date(card.创建时间).toLocaleString('zh-CN') : '')
                break
              case 'redeemedDate':
                row.push(card.兑换时间 ? new Date(card.兑换时间).toLocaleString('zh-CN') : '')
                break
              default:
                row.push('')
            }
          }
        })
        
        return row
      })

      // 生成CSV内容
      const csvContent = [
        headers.join(','),
        ...rows.map((row: string[]) => row.map((cell: string) => `"${cell.replace(/"/g, '""')}"`).join(','))
      ].join('\n')

      // 创建并下载文件
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
      const filename = `兑换卡数据_${exportDataType}_${timestamp}.csv`
      link.setAttribute('download', filename)
      
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success(`成功导出 ${filteredData.length} 条记录`)
      setIsExportDialogOpen(false)
      
    } catch (error: unknown) {
      console.error('导出失败:', error)
      const errorMessage = error instanceof Error ? error.message : '请重试'
      toast.error(`导出失败：${errorMessage}`)
    }
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case '/dashboard':
        return <Dashboard />
      case '/users':
        return <UsersManagement />
      case '/exchange-cards':
        return <ExchangeCards />
      case '/points-logs':
        return <PointsLogs />
      case '/task-logs':
        return <TaskLogs />
      case '/setting':
        return <Setting />
      case '/database-test':
        return <DatabaseTest />
      default:
        return <Dashboard />
    }
  }

  const renderHeaderActions = () => {
    switch (currentPage) {
      case '/users':
        return (
          <Dialog open={isUserExportDialogOpen} onOpenChange={setIsUserExportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 border-0 shadow-none">
                <Download className="h-4 w-4 mr-2" />
                导出
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>导出用户数据</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">角色筛选</Label>
                  <Select value={exportRoleFilter} onValueChange={(value: '普通用户' | '付费用户' | '管理员' | 'all') => setExportRoleFilter(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择要导出的角色" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">所有角色</SelectItem>
                      <SelectItem value="普通用户">普通用户</SelectItem>
                      <SelectItem value="付费用户">付费用户</SelectItem>
                      <SelectItem value="管理员">管理员</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <Label className="text-sm font-medium">选择导出字段</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="username" 
                        checked={userExportColumns.username}
                        onCheckedChange={(checked) => 
                          setUserExportColumns(prev => ({ ...prev, username: checked as boolean }))
                        }
                      />
                      <Label htmlFor="username" className="text-sm">用户名</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="email" 
                        checked={userExportColumns.email}
                        onCheckedChange={(checked) => 
                          setUserExportColumns(prev => ({ ...prev, email: checked as boolean }))
                        }
                      />
                      <Label htmlFor="email" className="text-sm">邮箱</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="roles" 
                        checked={userExportColumns.roles}
                        onCheckedChange={(checked) => 
                          setUserExportColumns(prev => ({ ...prev, roles: checked as boolean }))
                        }
                      />
                      <Label htmlFor="roles" className="text-sm">角色</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="currentPoints" 
                        checked={userExportColumns.currentPoints}
                        onCheckedChange={(checked) => 
                          setUserExportColumns(prev => ({ ...prev, currentPoints: checked as boolean }))
                        }
                      />
                      <Label htmlFor="currentPoints" className="text-sm">当前积分</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="totalConsumedPoints" 
                        checked={userExportColumns.totalConsumedPoints}
                        onCheckedChange={(checked) => 
                          setUserExportColumns(prev => ({ ...prev, totalConsumedPoints: checked as boolean }))
                        }
                      />
                      <Label htmlFor="totalConsumedPoints" className="text-sm">总消耗积分</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="todayPoints" 
                        checked={userExportColumns.todayPoints}
                        onCheckedChange={(checked) => 
                          setUserExportColumns(prev => ({ ...prev, todayPoints: checked as boolean }))
                        }
                      />
                      <Label htmlFor="todayPoints" className="text-sm">今日积分</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="weekPoints" 
                        checked={userExportColumns.weekPoints}
                        onCheckedChange={(checked) => 
                          setUserExportColumns(prev => ({ ...prev, weekPoints: checked as boolean }))
                        }
                      />
                      <Label htmlFor="weekPoints" className="text-sm">7日积分</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="joinDate" 
                        checked={userExportColumns.joinDate}
                        onCheckedChange={(checked) => 
                          setUserExportColumns(prev => ({ ...prev, joinDate: checked as boolean }))
                        }
                      />
                      <Label htmlFor="joinDate" className="text-sm">注册时间</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="lastActiveTime" 
                        checked={userExportColumns.lastActiveTime}
                        onCheckedChange={(checked) => 
                          setUserExportColumns(prev => ({ ...prev, lastActiveTime: checked as boolean }))
                        }
                      />
                      <Label htmlFor="lastActiveTime" className="text-sm">最后活跃</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="notes" 
                        checked={userExportColumns.notes}
                        onCheckedChange={(checked) => 
                          setUserExportColumns(prev => ({ ...prev, notes: checked as boolean }))
                        }
                      />
                      <Label htmlFor="notes" className="text-sm">备注</Label>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsUserExportDialogOpen(false)}>
                  取消
                </Button>
                <Button type="submit">导出</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )
      case '/points-logs':
        return (
          <Dialog open={isLogsExportDialogOpen} onOpenChange={setIsLogsExportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 border-0 shadow-none">
                <Download className="h-4 w-4 mr-2" />
                导出
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>导出积分变动日志</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">状态筛选</Label>
                  <Select value={logsExportStatusFilter} onValueChange={(value: 'all' | '成功' | '失败' | '处理中') => setLogsExportStatusFilter(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">所有状态</SelectItem>
                      <SelectItem value="成功">成功</SelectItem>
                      <SelectItem value="失败">失败</SelectItem>
                      <SelectItem value="处理中">处理中</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-medium">选择导出字段</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="timestamp" 
                        checked={logsExportColumns.timestamp}
                        onCheckedChange={(checked) => 
                          setLogsExportColumns(prev => ({ ...prev, timestamp: checked as boolean }))
                        }
                      />
                      <Label htmlFor="timestamp" className="text-sm">使用时间</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="username" 
                        checked={logsExportColumns.username}
                        onCheckedChange={(checked) => 
                          setLogsExportColumns(prev => ({ ...prev, username: checked as boolean }))
                        }
                      />
                      <Label htmlFor="username" className="text-sm">用户名</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="userEmail" 
                        checked={logsExportColumns.userEmail}
                        onCheckedChange={(checked) => 
                          setLogsExportColumns(prev => ({ ...prev, userEmail: checked as boolean }))
                        }
                      />
                      <Label htmlFor="userEmail" className="text-sm">邮箱</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="action" 
                        checked={logsExportColumns.action}
                        onCheckedChange={(checked) => 
                          setLogsExportColumns(prev => ({ ...prev, action: checked as boolean }))
                        }
                      />
                      <Label htmlFor="action" className="text-sm">使用功能</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="status" 
                        checked={logsExportColumns.status}
                        onCheckedChange={(checked) => 
                          setLogsExportColumns(prev => ({ ...prev, status: checked as boolean }))
                        }
                      />
                      <Label htmlFor="status" className="text-sm">状态</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="details" 
                        checked={logsExportColumns.details}
                        onCheckedChange={(checked) => 
                          setLogsExportColumns(prev => ({ ...prev, details: checked as boolean }))
                        }
                      />
                      <Label htmlFor="details" className="text-sm">使用详情</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="initialPoints" 
                        checked={logsExportColumns.initialPoints}
                        onCheckedChange={(checked) => 
                          setLogsExportColumns(prev => ({ ...prev, initialPoints: checked as boolean }))
                        }
                      />
                      <Label htmlFor="initialPoints" className="text-sm">初始积分</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="pointsChange" 
                        checked={logsExportColumns.pointsChange}
                        onCheckedChange={(checked) => 
                          setLogsExportColumns(prev => ({ ...prev, pointsChange: checked as boolean }))
                        }
                      />
                      <Label htmlFor="pointsChange" className="text-sm">变动积分</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="finalPoints" 
                        checked={logsExportColumns.finalPoints}
                        onCheckedChange={(checked) => 
                          setLogsExportColumns(prev => ({ ...prev, finalPoints: checked as boolean }))
                        }
                      />
                      <Label htmlFor="finalPoints" className="text-sm">最终积分</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="taskId" 
                        checked={logsExportColumns.taskId}
                        onCheckedChange={(checked) => 
                          setLogsExportColumns(prev => ({ ...prev, taskId: checked as boolean }))
                        }
                      />
                      <Label htmlFor="taskId" className="text-sm">任务ID</Label>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsLogsExportDialogOpen(false)}>
                  取消
                </Button>
                <Button type="submit">导出</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )
      case '/exchange-cards':
        return (
          <div className="flex gap-2">
            <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 border-0 shadow-none">
                  <Download className="h-4 w-4 mr-2" />
                  导出
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[375px]">
                <DialogHeader>
                  <DialogTitle>导出兑换卡数据</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">数据筛选</Label>
                    <Select value={exportDataType} onValueChange={setExportDataType}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择要导出的数据" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">所有数据</SelectItem>
                        <SelectItem value="已兑换">已兑换</SelectItem>
                        <SelectItem value="未兑换">未兑换</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">选择导出字段</Label>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="name" 
                          checked={exportColumns.name}
                          onCheckedChange={(checked) => 
                            setExportColumns(prev => ({ ...prev, name: checked as boolean }))
                          }
                        />
                        <Label htmlFor="name" className="text-sm">卡片名称</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="cardNumber" 
                          checked={exportColumns.cardNumber}
                          onCheckedChange={(checked) => 
                            setExportColumns(prev => ({ ...prev, cardNumber: checked as boolean }))
                          }
                        />
                        <Label htmlFor="cardNumber" className="text-sm">卡号</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="points" 
                          checked={exportColumns.points}
                          onCheckedChange={(checked) => 
                            setExportColumns(prev => ({ ...prev, points: checked as boolean }))
                          }
                        />
                        <Label htmlFor="points" className="text-sm">积分数量</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="status" 
                          checked={exportColumns.status}
                          onCheckedChange={(checked) => 
                            setExportColumns(prev => ({ ...prev, status: checked as boolean }))
                          }
                        />
                        <Label htmlFor="status" className="text-sm">状态</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="username" 
                          checked={exportColumns.username}
                          onCheckedChange={(checked) => 
                            setExportColumns(prev => ({ ...prev, username: checked as boolean }))
                          }
                        />
                        <Label htmlFor="username" className="text-sm">用户名</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="userEmail" 
                          checked={exportColumns.userEmail}
                          onCheckedChange={(checked) => 
                            setExportColumns(prev => ({ ...prev, userEmail: checked as boolean }))
                          }
                        />
                        <Label htmlFor="userEmail" className="text-sm">用户邮箱</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="description" 
                          checked={exportColumns.description}
                          onCheckedChange={(checked) => 
                            setExportColumns(prev => ({ ...prev, description: checked as boolean }))
                          }
                        />
                        <Label htmlFor="description" className="text-sm">备注</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="createdDate" 
                          checked={exportColumns.createdDate}
                          onCheckedChange={(checked) => 
                            setExportColumns(prev => ({ ...prev, createdDate: checked as boolean }))
                          }
                        />
                        <Label htmlFor="createdDate" className="text-sm">创建日期</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="redeemedDate" 
                          checked={exportColumns.redeemedDate}
                          onCheckedChange={(checked) => 
                            setExportColumns(prev => ({ ...prev, redeemedDate: checked as boolean }))
                          }
                        />
                        <Label htmlFor="redeemedDate" className="text-sm">兑换日期</Label>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
                    取消
                  </Button>
                  <Button onClick={handleExportExchangeCards}>
                    导出
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* 使用记录导出对话框 */}
            <Dialog open={isLogsExportDialogOpen} onOpenChange={setIsLogsExportDialogOpen}>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>导出使用记录</DialogTitle>
                  <DialogDescription>
                    选择要导出的字段，系统将生成CSV文件供您下载。
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">选择导出字段</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="timestamp" 
                          checked={logsExportColumns.timestamp}
                          onCheckedChange={(checked) => 
                            setLogsExportColumns(prev => ({ ...prev, timestamp: checked as boolean }))
                          }
                        />
                        <Label htmlFor="timestamp" className="text-sm">时间</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="username" 
                          checked={logsExportColumns.username}
                          onCheckedChange={(checked) => 
                            setLogsExportColumns(prev => ({ ...prev, username: checked as boolean }))
                          }
                        />
                        <Label htmlFor="username" className="text-sm">用户名</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="action" 
                          checked={logsExportColumns.action}
                          onCheckedChange={(checked) => 
                            setLogsExportColumns(prev => ({ ...prev, action: checked as boolean }))
                          }
                        />
                        <Label htmlFor="action" className="text-sm">操作</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="status" 
                          checked={logsExportColumns.status}
                          onCheckedChange={(checked) => 
                            setLogsExportColumns(prev => ({ ...prev, status: checked as boolean }))
                          }
                        />
                        <Label htmlFor="status" className="text-sm">状态</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="details" 
                          checked={logsExportColumns.details}
                          onCheckedChange={(checked) => 
                            setLogsExportColumns(prev => ({ ...prev, details: checked as boolean }))
                          }
                        />
                        <Label htmlFor="details" className="text-sm">详情</Label>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsLogsExportDialogOpen(false)}>
                    取消
                  </Button>
                  <Button onClick={() => {
                    // 这里实现导出逻辑
                    console.log('导出使用记录字段:', logsExportColumns)
                    setIsLogsExportDialogOpen(false)
                  }}>
                    导出
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-8 shadow-none">
                  <Plus className="h-4 w-4 mr-2" />
                  创建兑换卡
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>创建新兑换卡</DialogTitle>
                  <DialogDescription>
                    批量创建兑换卡，用户可以使用卡号进行兑换。
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      卡片名称
                    </Label>
                    <Input
                      id="name"
                      placeholder="输入卡片名称"
                      className="col-span-3"
                      value={createCardForm.name}
                      onChange={(e) => handleCreateCardFormChange('name', e.target.value)}
                    />
                    {createCardErrors.name && (
                      <div className="col-span-4 text-sm text-red-500 text-right">
                        {createCardErrors.name}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="points" className="text-right">
                      积分数量
                    </Label>
                    <Input
                      id="points"
                      type="number"
                      placeholder="输入积分数量"
                      className="col-span-3 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                      value={createCardForm.points}
                      onChange={(e) => handleCreateCardFormChange('points', e.target.value)}
                    />
                    {createCardErrors.points && (
                      <div className="col-span-4 text-sm text-red-500 text-right">
                        {createCardErrors.points}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">
                      备注
                    </Label>
                    <Input
                      id="description"
                      placeholder="输入卡片备注（可选）"
                      className="col-span-3"
                      value={createCardForm.description}
                      onChange={(e) => handleCreateCardFormChange('description', e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="quantity" className="text-right">
                      创建数量
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="输入创建数量"
                      min="1"
                      max="100"
                      className="col-span-3 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                      value={createCardForm.quantity}
                      onChange={(e) => handleCreateCardFormChange('quantity', e.target.value)}
                    />
                    {createCardErrors.quantity && (
                      <div className="col-span-4 text-sm text-red-500 text-right">
                        {createCardErrors.quantity}
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                    disabled={isCreatingCard}
                  >
                    取消
                  </Button>
                  <Button 
                    type="submit" 
                    onClick={handleCreateCard}
                    disabled={isCreatingCard}
                  >
                    {isCreatingCard ? '创建中...' : '创建兑换卡'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )
      case '/task-logs':
        return (
          <Dialog open={isTaskLogsExportDialogOpen} onOpenChange={setIsTaskLogsExportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 border-0 shadow-none">
                <Download className="h-4 w-4 mr-2" />
                导出
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>导出任务日志</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">状态筛选</Label>
                  <Select value={taskLogsExportStatusFilter} onValueChange={(value: 'all' | '成功' | '失败' | '处理中') => setTaskLogsExportStatusFilter(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">所有状态</SelectItem>
                      <SelectItem value="成功">成功</SelectItem>
                      <SelectItem value="失败">失败</SelectItem>
                      <SelectItem value="处理中">处理中</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-medium">选择导出字段</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="task-timestamp" 
                        checked={taskLogsExportColumns.timestamp}
                        onCheckedChange={(checked) => 
                          setTaskLogsExportColumns(prev => ({ ...prev, timestamp: checked as boolean }))
                        }
                      />
                      <Label htmlFor="task-timestamp" className="text-sm">时间</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="task-taskId" 
                        checked={taskLogsExportColumns.taskId}
                        onCheckedChange={(checked) => 
                          setTaskLogsExportColumns(prev => ({ ...prev, taskId: checked as boolean }))
                        }
                      />
                      <Label htmlFor="task-taskId" className="text-sm">任务ID</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="task-username" 
                        checked={taskLogsExportColumns.username}
                        onCheckedChange={(checked) => 
                          setTaskLogsExportColumns(prev => ({ ...prev, username: checked as boolean }))
                        }
                      />
                      <Label htmlFor="task-username" className="text-sm">用户名</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="task-userEmail" 
                        checked={taskLogsExportColumns.userEmail}
                        onCheckedChange={(checked) => 
                          setTaskLogsExportColumns(prev => ({ ...prev, userEmail: checked as boolean }))
                        }
                      />
                      <Label htmlFor="task-userEmail" className="text-sm">邮箱</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="task-action" 
                        checked={taskLogsExportColumns.action}
                        onCheckedChange={(checked) => 
                          setTaskLogsExportColumns(prev => ({ ...prev, action: checked as boolean }))
                        }
                      />
                      <Label htmlFor="task-action" className="text-sm">操作</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="task-status" 
                        checked={taskLogsExportColumns.status}
                        onCheckedChange={(checked) => 
                          setTaskLogsExportColumns(prev => ({ ...prev, status: checked as boolean }))
                        }
                      />
                      <Label htmlFor="task-status" className="text-sm">状态</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="task-details" 
                        checked={taskLogsExportColumns.details}
                        onCheckedChange={(checked) => 
                          setTaskLogsExportColumns(prev => ({ ...prev, details: checked as boolean }))
                        }
                      />
                      <Label htmlFor="task-details" className="text-sm">详情</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="task-ipAddress" 
                        checked={taskLogsExportColumns.ipAddress}
                        onCheckedChange={(checked) => 
                          setTaskLogsExportColumns(prev => ({ ...prev, ipAddress: checked as boolean }))
                        }
                      />
                      <Label htmlFor="task-ipAddress" className="text-sm">IP地址</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="task-userAgent" 
                        checked={taskLogsExportColumns.userAgent}
                        onCheckedChange={(checked) => 
                          setTaskLogsExportColumns(prev => ({ ...prev, userAgent: checked as boolean }))
                        }
                      />
                      <Label htmlFor="task-userAgent" className="text-sm">用户代理</Label>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsTaskLogsExportDialogOpen(false)}>
                  取消
                </Button>
                <Button type="submit">导出</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )
      default:
        return null
    }
  }

  return (
    <AdminLayout
      currentPath={currentPage}
      onPageChange={setCurrentPage}
      headerActions={renderHeaderActions()}
    >
      {renderCurrentPage()}
    </AdminLayout>
  )
}

export function AdminApp({ initialPage = '/dashboard' }: AdminAppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AppSettingsProvider>
        <ExchangeCardsProvider>
          <AdminAppInner initialPage={initialPage} />
        </ExchangeCardsProvider>
      </AppSettingsProvider>
    </QueryClientProvider>
  )
}