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

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useTaskLogs, useTaskLogsCount } from '@/hooks/use-task-logs'

type LogStatus = '成功' | '失败' | '处理中' | 'all'
type SortField = 'taskTime' | 'user' | 'function' | 'status'
type SortOrder = 'asc' | 'desc'

export function TaskLogs() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case '成功':
      case '已完成':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case '失败':
        return <XCircle className="h-4 w-4 text-red-500" />
      case '处理中':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const { tableBorder, pageSize } = useAppSettings()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<LogStatus>('all')
  const [actionFilter, setActionFilter] = useState('all')
  const [sortField, setSortField] = useState<SortField>('taskTime')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  
  // 批量选择状态
  const [selectedLogs, setSelectedLogs] = useState<string[]>([])
  const [isBatchDeleteDialogOpen, setIsBatchDeleteDialogOpen] = useState(false)

  // 使用数据库查询
  const { data: taskLogs = [], isLoading, error } = useTaskLogs({
    searchTerm,
    statusFilter: statusFilter === 'all' ? '' : statusFilter,
    sortField,
    sortOrder,
    offset: (currentPage - 1) * pageSize,
    limit: pageSize
  })

  const { data: totalCount = 0 } = useTaskLogsCount({
    searchTerm,
    statusFilter: statusFilter === 'all' ? '' : statusFilter
  })

  // 计算总页数
  const totalPages = Math.ceil(totalCount / pageSize)

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
    setCurrentPage(1) // 重置到第一页
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
    setSortField('taskTime')
    setSortOrder('desc')
    setCurrentPage(1)
    setSelectedLogs([])
  }

  // 批量选择处理
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLogs(taskLogs.map(log => log.taskId))
    } else {
      setSelectedLogs([])
    }
  }

  const handleSelectLog = (logId: string, checked: boolean) => {
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

  // 处理搜索变化
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1) // 重置到第一页
  }

  // 处理状态筛选变化
  const handleStatusFilterChange = (value: LogStatus) => {
    setStatusFilter(value)
    setCurrentPage(1) // 重置到第一页
  }

  // 处理操作筛选变化
  const handleActionFilterChange = (value: string) => {
    setActionFilter(value)
    setCurrentPage(1) // 重置到第一页
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
                onChange={(e) => handleSearchChange(e.target.value)}
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
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
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
            
            <Select value={actionFilter} onValueChange={handleActionFilterChange}>
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
                      checked={selectedLogs.length === taskLogs.length && taskLogs.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </div>
                </TableHead>
                <TableHead
                  className={cn("w-[10%] cursor-pointer hover:bg-muted/50 transition-colors pl-3", getTableBorderClasses(tableBorder).headerCell)}
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
                <TableHead className={cn("w-[36%]", getTableBorderClasses(tableBorder).headerCell)}>使用详情</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <Clock className="h-4 w-4 animate-spin" />
                      加载中...
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2 text-red-500">
                      <AlertCircle className="h-4 w-4" />
                      加载失败，请重试
                    </div>
                  </TableCell>
                </TableRow>
              ) : taskLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                taskLogs.map((log) => (
                  <TableRow key={log.taskId} className={cn("hover:bg-muted/30", getTableBorderClasses(tableBorder).row)}>
                    <TableCell className={cn("w-8 p-0", getTableBorderClasses(tableBorder).cell)}>
                      <div className="flex items-center justify-center h-full">
                        <Checkbox
                          checked={selectedLogs.includes(log.taskId)}
                          onCheckedChange={(checked) => handleSelectLog(log.taskId, checked as boolean)}
                          aria-label={`选择日志 ${log.taskId}`}
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
                          <AvatarImage src={log.operatorAvatar} alt={log.operatorUser} />
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
                          (log.status === '已完成' || log.status === '成功') && "bg-green-100 text-green-800",
                          log.status === '失败' && "bg-red-100 text-red-800",
                          log.status === '处理中' && "bg-yellow-100 text-yellow-800"
                        )}>
                          {log.status}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className={cn("text-sm text-gray-600", getTableBorderClasses(tableBorder).cell)}>
                      {log.usageDetails}
                    </TableCell>
                  </TableRow>
                ))
              )}
              </TableBody>
            </Table>
          </div>
        </div>
      
      {/* 分页栏固定在底部 */}
      <div className="flex-shrink-0 pt-2 border-t">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            显示 {(currentPage - 1) * pageSize + 1} 到 {Math.min(currentPage * pageSize, totalCount)} 条，共 {totalCount} 条记录
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


    </div>
  )
}