'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Search, 
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  Trash2,
  MoreHorizontal,
  Edit,
  Copy
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppSettings } from '@/contexts/AppSettingsContext'
import { getTableBorderClasses } from '@/lib/table-border-utils'
import { toast } from 'sonner'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

// 模拟任务日志数据
const taskLogs = [
  {
    id: 1,
    taskTime: '03-15 14:35:12',
    taskId: 'PROC001Xy9Zw4Qn8Tp2',
    operatorUser: '刘小明',
    operatorEmail: 'liuxiaoming@example.com',
    usedFunction: '使用功能',
    status: '处理中',
    usageDetails: '正在使用AI视频生成功能，预计消耗 120 积分',
  },
  {
    id: 2,
    taskTime: '03-15 14:32:45',
    taskId: 'PROC002Mn8Xv1Pr7Uq4',
    operatorUser: '王小红',
    operatorEmail: 'wangxiaohong@example.com',
    usedFunction: '兑换积分卡',
    status: '处理中',
    usageDetails: '正在验证兑换码 PREMIUM500，预计兑换 500 积分',
  },
  {
    id: 3,
    taskTime: '03-15 14:31:18',
    taskId: 'PROC003No2Yw8Qs5Vr6',
    operatorUser: '李小华',
    operatorEmail: 'lixiaohua@example.com',
    usedFunction: '使用功能',
    status: '处理中',
    usageDetails: '正在使用AI音乐生成功能，预计消耗 85 积分',
  },
  {
    id: 4,
    taskTime: '03-15 14:30:25',
    taskId: 'E2x5Lm8Zw4Qn9Tp6',
    operatorUser: '张三',
    operatorEmail: 'zhangsan@example.com',
    usedFunction: '兑换积分卡',
    status: '成功',
    usageDetails: '使用兑换码 NEWUSER100 兑换了 100 积分',
  },
  {
    id: 5,
    taskTime: '03-15 14:25:12',
    taskId: 'F8y3Mn6Xv1Pr5Uq7',
    operatorUser: '李四',
    operatorEmail: 'lisi@example.com',
    usedFunction: '使用功能',
    status: '成功',
    usageDetails: '使用AI文本生成功能，消耗 20 积分',
  },
  {
    id: 6,
    taskTime: '03-15 14:20:45',
    taskId: 'G4z7No2Yw8Qs3Vr9',
    operatorUser: '王五',
    operatorEmail: 'wangwu@example.com',
    usedFunction: '兑换积分卡',
    status: '失败',
    usageDetails: '尝试使用无效兑换码 INVALID123',
  },
  {
    id: 7,
    taskTime: '03-15 14:15:33',
    taskId: 'H1a9Op5Zx4Rt6Ws2',
    operatorUser: '赵六',
    operatorEmail: 'zhaoliu@example.com',
    usedFunction: '功能失败返回',
    status: '成功',
    usageDetails: 'AI图像生成失败，返还 50 积分',
  },
  {
    id: 8,
    taskTime: '03-15 14:10:18',
    taskId: 'I5b3Pq8Zy7Su9Xt4',
    operatorUser: '钱七',
    operatorEmail: 'qianqi@example.com',
    usedFunction: '注册',
    status: '成功',
    usageDetails: '新用户注册并获得新用户礼包 100 积分',
  },
  {
    id: 9,
    taskTime: '03-15 14:05:55',
    taskId: 'J9c6Qr1Az3Tv8Yu5',
    operatorUser: '孙八',
    operatorEmail: 'sunba@example.com',
    usedFunction: '使用功能',
    status: '成功',
    usageDetails: '使用AI代码生成功能，消耗 30 积分',
  },
  {
    id: 10,
    taskTime: '03-15 14:00:42',
    taskId: 'K2d4Rs7By9Uw1Zv6',
    operatorUser: '周九',
    operatorEmail: 'zhoujiu@example.com',
    usedFunction: '兑换积分卡',
    status: '成功',
    usageDetails: '使用兑换码 MONTHLY500 兑换了 500 积分',
  },
]

type LogStatus = '成功' | '失败' | '处理中' | 'all'
type SortField = 'timestamp' | 'user' | 'action' | 'status' | 'taskTime'
type SortOrder = 'asc' | 'desc'

export function TaskLogs() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case '成功':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case '失败':
        return <XCircle className="h-4 w-4 text-red-500" />
      case '处理中':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }
  const { tableBorder } = useAppSettings()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<LogStatus>('all')
  const [actionFilter, setActionFilter] = useState('all')
  const [sortField, setSortField] = useState<SortField>('timestamp')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  
  // 批量选择状态
  const [selectedLogs, setSelectedLogs] = useState<number[]>([])
  const [isBatchDeleteDialogOpen, setIsBatchDeleteDialogOpen] = useState(false)
  
  // 单个记录操作状态
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const { pageSize } = useAppSettings()
  const itemsPerPage = pageSize

  // 筛选和排序逻辑
  const filteredAndSortedLogs = taskLogs
    .filter(log => {
      const matchesSearch = log.operatorUser.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           log.operatorEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           log.taskId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           log.usageDetails.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || log.status === statusFilter
      const matchesAction = actionFilter === 'all' || log.usedFunction === actionFilter
      return matchesSearch && matchesStatus && matchesAction
    })
    .sort((a, b) => {
      let aValue: number | string, bValue: number | string
      
      switch (sortField) {
        case 'timestamp':
          aValue = new Date(a.taskTime).getTime()
          bValue = new Date(b.taskTime).getTime()
          break
        case 'user':
          aValue = a.operatorUser
          bValue = b.operatorUser
          break
        case 'action':
          aValue = a.usedFunction
          bValue = b.usedFunction
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        default:
          return 0
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  // 分页逻辑
  const totalPages = Math.ceil(filteredAndSortedLogs.length / itemsPerPage)
  const paginatedLogs = filteredAndSortedLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // 获取唯一的操作类型用于筛选
  const uniqueActions = Array.from(new Set(taskLogs.map(log => log.usedFunction)))

  // 排序处理
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  // 获取排序图标
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3" />
    }
    return sortOrder === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
  }

  // 重置筛选
  const handleReset = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setActionFilter('all')
    setSortField('timestamp')
    setSortOrder('desc')
    setCurrentPage(1)
    setSelectedLogs([])
  }

  // 批量选择处理
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLogs(paginatedLogs.map(log => log.id))
    } else {
      setSelectedLogs([])
    }
  }

  const handleSelectLog = (logId: number, checked: boolean) => {
    if (checked) {
      setSelectedLogs([...selectedLogs, logId])
    } else {
      setSelectedLogs(selectedLogs.filter(id => id !== logId))
    }
  }

  // 批量删除处理
  const handleBatchDelete = () => {
    setIsBatchDeleteDialogOpen(true)
  }

  const confirmBatchDelete = () => {
    // 这里应该调用API删除选中的记录
    toast.success(`已删除 ${selectedLogs.length} 条记录`)
    setSelectedLogs([])
    setIsBatchDeleteDialogOpen(false)
  }

  // 单个记录操作
  const handleEdit = () => {
    // 编辑功能待实现
    toast.info('编辑功能待实现')
  }

  const handleDelete = () => {
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    // 这里应该调用API删除记录
    toast.success('记录已删除')
    setIsDeleteDialogOpen(false)
  }

  return (
    <div className="px-6 pt-1 pb-4 flex flex-col h-full">
      {/* 搜索和筛选区域 - 固定不滚动 */}
      <div className="flex-shrink-0 mb-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="搜索用户、任务ID、邮箱或详情..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          {/* 批量操作按钮 - 动态显示在搜索框和筛选器之间 */}
          {selectedLogs.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">已选择 {selectedLogs.length} 项</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedLogs([])}
                className="h-8 border-0 shadow-none"
              >
                取消选择
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBatchDelete}
                className="h-8"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                删除
              </Button>
            </div>
          )}
          
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={(value: LogStatus) => setStatusFilter(value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="状态筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="成功">成功</SelectItem>
                <SelectItem value="失败">失败</SelectItem>
                <SelectItem value="处理中">处理中</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="操作筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部操作</SelectItem>
                {uniqueActions.map(action => (
                  <SelectItem key={action} value={action}>{action}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              onClick={handleReset}
              className="w-auto"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              重置
            </Button>
          </div>
        </div>
      </div>

      {/* 表格区域 - 可滚动 */}
      <div className="flex-1 overflow-auto">
        <div className="border-x border-b">
          <Table className="min-w-[1000px] table-fixed border-collapse">
            <TableHeader className="bg-secondary">
              <TableRow className={getTableBorderClasses(tableBorder).row}>
                <TableHead className={cn("w-[3%]", getTableBorderClasses(tableBorder).headerCell)}>
                  <div className="flex items-center justify-center">
                    <Checkbox
                      checked={selectedLogs.length === paginatedLogs.length && paginatedLogs.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </div>
                </TableHead>
                <TableHead
                  className={cn("w-[10%] cursor-pointer hover:bg-gray-50 transition-colors pl-3", getTableBorderClasses(tableBorder).headerCell)}
                  onClick={() => handleSort('taskTime')}
                >
                  <div className="flex items-center gap-2">
                    任务时间
                    {getSortIcon('taskTime')}
                  </div>
                </TableHead>
                <TableHead className={cn("w-[16%] text-center", getTableBorderClasses(tableBorder).headerCell)}>任务ID</TableHead>
                <TableHead className={cn("w-[18%]", getTableBorderClasses(tableBorder).headerCell)}>操作用户</TableHead>
                <TableHead className={cn("w-[10%]", getTableBorderClasses(tableBorder).headerCell)}>使用功能</TableHead>
                <TableHead className={cn("w-[7%]", getTableBorderClasses(tableBorder).headerCell)}>状态</TableHead>
                <TableHead className={cn("w-[32%]", getTableBorderClasses(tableBorder).headerCell)}>使用详情</TableHead>
                <TableHead className="w-[4%] text-center">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {paginatedLogs.map((log) => (
                  <TableRow key={log.id} className={cn("hover:bg-gray-50/50", getTableBorderClasses(tableBorder).row)}>
                    <TableCell className={cn("w-8 p-0", getTableBorderClasses(tableBorder).cell)}>
                      <div className="flex items-center justify-center h-full">
                        <Checkbox
                          checked={selectedLogs.includes(log.id)}
                          onCheckedChange={(checked) => handleSelectLog(log.id, checked as boolean)}
                          aria-label={`选择日志 ${log.id}`}
                        />
                      </div>
                    </TableCell>
                    <TableCell className={cn("text-sm pl-3", getTableBorderClasses(tableBorder).cell)}>
                      {log.taskTime}
                    </TableCell>
                    <TableCell className={cn("text-center", getTableBorderClasses(tableBorder).cell)}>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-sm font-medium">{log.taskId || 'N/A'}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => {
                            navigator.clipboard.writeText(log.taskId || 'N/A')
                            toast.success("任务ID复制成功！")
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className={cn("", getTableBorderClasses(tableBorder).cell)}>
                      <div className="flex w-full items-center gap-3 rounded-md px-2 py-2">
                        <Avatar className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0">
                          <AvatarImage src={undefined} alt={log.operatorUser} />
                          <AvatarFallback className="text-base md:text-lg font-medium">{log.operatorUser[0]}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate text-left leading-tight">{log.operatorUser}</div>
                          <div className="text-sm text-muted-foreground truncate text-left leading-tight">{log.operatorEmail}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className={cn("", getTableBorderClasses(tableBorder).cell)}>
                      <span className="font-medium">{log.usedFunction}</span>
                    </TableCell>
                    <TableCell className={getTableBorderClasses(tableBorder).cell}>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(log.status)}
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium w-16 text-center inline-block",
                          log.status === '成功' && "bg-green-100 text-green-800",
                          log.status === '失败' && "bg-red-100 text-red-800",
                          log.status === '处理中' && "bg-yellow-100 text-yellow-800"
                        )}>
                          {log.status}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className={cn("text-sm text-gray-600 max-w-xs truncate", getTableBorderClasses(tableBorder).cell)}>
                      {log.usageDetails}
                    </TableCell>
                    <TableCell className="text-center p-0">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit()}>
                            <Edit className="mr-2 h-4 w-4" />
                            编辑记录
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDelete()}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            删除记录
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      
      {/* 分页栏固定在底部 */}
      <div className="flex-shrink-0 pt-2 border-t">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            显示 {(currentPage - 1) * itemsPerPage + 1} 到 {Math.min(currentPage * itemsPerPage, filteredAndSortedLogs.length)} 条，共 {filteredAndSortedLogs.length} 条记录
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              上一页
            </Button>
            <span className="text-sm">
              第 {currentPage} 页，共 {totalPages} 页
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              下一页
            </Button>
          </div>
        </div>
      </div>

      {/* 批量删除确认对话框 */}
      <Dialog open={isBatchDeleteDialogOpen} onOpenChange={setIsBatchDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              您确定要删除选中的 {selectedLogs.length} 条记录吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBatchDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={confirmBatchDelete}>
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 单个删除确认对话框 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              您确定要删除这条记录吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}