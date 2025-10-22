'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
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
  Trash2,
  RotateCcw,
  Copy
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppSettings } from '@/contexts/AppSettingsContext'
import { formatPoints } from '@/lib/format-points'
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
import { generateAvatarUrl } from '@/lib/avatar-utils'

// 创建Supabase客户端
const supabase = createClient()

// 积分日志数据类型
interface PointsLogData {
  积分记录ID: string
  用户ID: string
  积分变动量: number
  变动前积分: number
  变动后积分: number
  变动类型: string
  变动原因: string
  任务ID: string
  创建时间: string
  username: string
  user_email: string
  user_avatar: string
  操作人用户名: string
  操作人邮箱: string
}

// 变动类型映射
const actionTypeMap: Record<string, string> = {
  'card_redeem': '兑换积分卡',
  'feature_usage': '使用功能',
  'refund': '功能失败返回',
  'admin_adjust': '管理员调整'
}

// 格式化时间函数
const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

// 获取积分日志数据的函数
const fetchPointsLogs = async (params: {
  limit: number
  offset: number
  searchTerm: string
  actionFilter: string
  sortField: string
  sortOrder: string
}): Promise<PointsLogData[]> => {
  try {
    console.log('调用 get_points_logs_list，参数:', {
      p_limit: params.limit,
      p_offset: params.offset,
      p_search_term: params.searchTerm || null,
      p_action_filter: params.actionFilter === 'all' ? null : params.actionFilter,
      p_sort_field: params.sortField,
      p_sort_order: params.sortOrder
    })
    
    const { data, error } = await supabase.rpc('get_points_logs_list', {
      p_limit: params.limit,
      p_offset: params.offset,
      p_search_term: params.searchTerm || null,
      p_action_filter: params.actionFilter === 'all' ? null : params.actionFilter,
      p_sort_field: params.sortField,
      p_sort_order: params.sortOrder
    })
    
    console.log('get_points_logs_list 返回结果:', { data, error })
    
    if (error) {
      console.error('获取积分日志数据失败:', error)
      console.error('错误详情:', error.message, error.details, error.hint)
      toast.error(`获取积分日志数据失败: ${error.message}`)
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('获取积分日志数据时发生错误:', error)
    toast.error('获取积分日志数据时发生错误')
    return []
  }
}

// 获取积分日志总数的函数
const fetchPointsLogsCount = async (params: {
  searchTerm: string
  actionFilter: string
}): Promise<number> => {
  try {
    console.log('调用 get_points_logs_count，参数:', {
      p_search_term: params.searchTerm || null,
      p_action_filter: params.actionFilter === 'all' ? null : params.actionFilter
    })
    
    const { data, error } = await supabase.rpc('get_points_logs_count', {
      p_search_term: params.searchTerm || null,
      p_action_filter: params.actionFilter === 'all' ? null : params.actionFilter
    })
    
    console.log('get_points_logs_count 返回结果:', { data, error })
    
    if (error) {
      console.error('获取积分日志总数失败:', error)
      console.error('错误详情:', error.message, error.details, error.hint)
      toast.error(`获取积分日志总数失败: ${error.message}`)
      return 0
    }
    
    return data || 0
  } catch (error) {
    console.error('获取积分日志总数时发生错误:', error)
    toast.error('获取积分日志总数时发生错误')
    return 0
  }
}



type SortField = '创建时间' | 'username' | '变动类型'
type SortOrder = 'asc' | 'desc'

export function PointsLogs() {
  const { pointsFormat, tableBorder, pageSize } = useAppSettings()
  const [searchTerm, setSearchTerm] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [sortField, setSortField] = useState<SortField>('创建时间')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  
  // 数据状态
  const [logs, setLogs] = useState<PointsLogData[]>([])
  const [totalCount, setTotalCount] = useState(0)
  
  // 批量选择状态
  const [selectedLogs, setSelectedLogs] = useState<string[]>([])
  const [isBatchDeleteDialogOpen, setIsBatchDeleteDialogOpen] = useState(false)
  
  // 单个记录操作状态
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null)

  // 加载积分日志数据
  const loadPointsLogs = useCallback(async () => {
    try {
      const queryParams = {
        limit: pageSize,
        offset: (currentPage - 1) * pageSize,
        searchTerm,
        actionFilter,
        sortField,
        sortOrder
      }
      
      const [logsData, countData] = await Promise.all([
        fetchPointsLogs(queryParams),
        fetchPointsLogsCount({ searchTerm, actionFilter })
      ])
      
      setLogs(logsData)
      setTotalCount(countData)
    } catch (error) {
      console.error('加载积分日志数据失败:', error)
      toast.error('加载积分日志数据失败')
    }
  }, [pageSize, currentPage, searchTerm, actionFilter, sortField, sortOrder])

  // 当查询参数变化时重新加载数据
  useEffect(() => {
    loadPointsLogs()
  }, [loadPointsLogs])

  // 处理数据
  const logsArray = logs || []
  const totalCountNumber = totalCount || 0
  const totalPages = Math.ceil(totalCountNumber / pageSize)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
    setCurrentPage(1) // 重置到第一页
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />
    }
    return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

  const getUniqueActions = () => {
    return Object.keys(actionTypeMap)
  }

  const handleReset = async () => {
    setSearchTerm('')
    setActionFilter('all')
    setSortField('创建时间')
    setSortOrder('desc')
    setCurrentPage(1)
    toast.success("页面排序已重置")
    // 重新加载数据
    await loadPointsLogs()
  }

  const handleSelectLog = (logId: string) => {
    setSelectedLogs(prev => 
      prev.includes(logId) 
        ? prev.filter(id => id !== logId)
        : [...prev, logId]
    )
  }

  const handleSelectAll = () => {
    if (selectedLogs.length === logsArray.length) {
      setSelectedLogs([])
    } else {
      setSelectedLogs(logsArray.map((log: PointsLogData) => log.积分记录ID))
    }
  }

  const handleBatchDelete = () => {
    if (selectedLogs.length > 0) {
      setIsBatchDeleteDialogOpen(true)
    }
  }

  // 单个记录操作处理函数

  const confirmDeleteLog = () => {
    if (selectedLogId) {
      // 这里应该调用API删除记录
      console.log('删除记录:', selectedLogId)
      setIsDeleteDialogOpen(false)
      setSelectedLogId(null)
    }
  }

  const confirmBatchDelete = () => {
    // 这里应该调用API批量删除记录
    console.log('批量删除记录:', selectedLogs)
    setIsBatchDeleteDialogOpen(false)
    setSelectedLogs([])
  }

  // 删除未使用的函数
  // const getActionIcon = (action: string) => {
  //   switch (action) {
  //     case '注册':
  //       return <User className="h-4 w-4 text-blue-500" />
  //     case '兑换积分卡':
  //       return <TrendingUp className="h-4 w-4 text-green-500" />
  //     case '使用功能':
  //       return <Activity className="h-4 w-4 text-purple-500" />
  //     case '功能失败返回':
  //       return <RotateCcw className="h-4 w-4 text-orange-500" />
  //     default:
  //       return <FileText className="h-4 w-4 text-gray-500" />
  //   }
  // }

  return (
    <div className="px-6 pt-1 pb-4 flex flex-col h-full">
      {/* 搜索和筛选区域 - 固定不滚动 */}
      <div className="flex-shrink-0 mb-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="搜索用户名、邮箱、详情或任务ID..."
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
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="操作筛选" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部操作</SelectItem>
                {getUniqueActions().map(action => (
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
                    checked={selectedLogs.length === logsArray.length && logsArray.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </div>
              </TableHead>
              <TableHead
                className={cn("w-[10%] cursor-pointer hover:bg-muted/50 transition-colors pl-3", getTableBorderClasses(tableBorder).headerCell)}
                onClick={() => handleSort('创建时间')}
              >
                <div className="flex items-center gap-2">
                  使用时间
                  {getSortIcon('创建时间')}
                </div>
              </TableHead>
              <TableHead
                className={cn("w-[18%] cursor-pointer hover:bg-muted/50 transition-colors", getTableBorderClasses(tableBorder).headerCell)}
                onClick={() => handleSort('username')}
              >
                <div className="flex items-center gap-2">
                  操作用户
                  {getSortIcon('username')}
                </div>
              </TableHead>
              <TableHead
                className={cn("w-[10%] cursor-pointer hover:bg-muted/50 transition-colors", getTableBorderClasses(tableBorder).headerCell)}
                onClick={() => handleSort('变动类型')}
              >
                <div className="flex items-center gap-2">
                  变动类型
                  {getSortIcon('变动类型')}
                </div>
              </TableHead>
              <TableHead className={cn("w-[18%]", getTableBorderClasses(tableBorder).headerCell)}>变动原因</TableHead>
              <TableHead className={cn("w-[8%] text-center", getTableBorderClasses(tableBorder).headerCell)}>初始积分</TableHead>
              <TableHead className={cn("w-[8%] text-center", getTableBorderClasses(tableBorder).headerCell)}>变动积分</TableHead>
              <TableHead className={cn("w-[8%] text-center", getTableBorderClasses(tableBorder).headerCell)}>最终积分</TableHead>
              <TableHead className={cn("w-[20%] text-center", getTableBorderClasses(tableBorder).headerCell)}>任务ID</TableHead>
            </TableRow>
          </TableHeader>
            <TableBody>
                {logsArray.map((log: PointsLogData, index: number) => (
                  <TableRow key={`${log.积分记录ID}-${index}`} className={cn("hover:bg-muted/30", getTableBorderClasses(tableBorder).row)}>
                    <TableCell className={cn("w-8 p-0", getTableBorderClasses(tableBorder).cell)}>
                      <div className="flex items-center justify-center h-full">
                        <Checkbox
                          checked={selectedLogs.includes(log.积分记录ID)}
                          onCheckedChange={() => handleSelectLog(log.积分记录ID)}
                          aria-label={`选择日志 ${log.积分记录ID}`}
                        />
                      </div>
                    </TableCell>
                    <TableCell className={cn("text-sm pl-3", getTableBorderClasses(tableBorder).cell)}>
                      {formatTimestamp(log.创建时间)}
                    </TableCell>
                    <TableCell className={cn("", getTableBorderClasses(tableBorder).cell)}>
                      <div className="flex items-center gap-3 rounded-md px-2 py-2">
                        <Avatar className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0">
                          <AvatarImage src={generateAvatarUrl({ avatar: log.user_avatar }) || '/default-avatar/苹果.png'} alt={log.username || '未知用户'} />
                          <AvatarFallback className="text-base md:text-lg font-medium">
                            {(log.username || '')[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate text-left leading-tight">{log.username}</div>
                          <div className="text-sm text-muted-foreground truncate text-left leading-tight">{log.user_email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className={cn("", getTableBorderClasses(tableBorder).cell)}>
                      <span className="font-medium">{actionTypeMap[log.变动类型] || log.变动类型}</span>
                    </TableCell>
                    <TableCell className={cn("text-sm text-gray-600 max-w-xs truncate", getTableBorderClasses(tableBorder).cell)}>
                      {log.变动原因}
                    </TableCell>
                    <TableCell className={cn("text-center", getTableBorderClasses(tableBorder).cell)}>
                      <span className="text-sm font-medium">{formatPoints(log.变动前积分 || 0, pointsFormat)}</span>
                    </TableCell>
                    <TableCell className={cn("text-center", getTableBorderClasses(tableBorder).cell)}>
                      <span className={cn(
                        "text-sm font-medium",
                        (log.积分变动量 || 0) > 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {(log.积分变动量 || 0) > 0 ? '+' : ''}{formatPoints(Math.abs(log.积分变动量 || 0), pointsFormat)}
                      </span>
                    </TableCell>
                    <TableCell className={cn("text-center", getTableBorderClasses(tableBorder).cell)}>
                      <span className="text-sm font-medium">{formatPoints(log.变动后积分 || 0, pointsFormat)}</span>
                    </TableCell>
                    <TableCell className={cn("text-center", getTableBorderClasses(tableBorder).cell)}>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-sm font-medium">{log.任务ID || 'N/A'}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => {
                            navigator.clipboard.writeText(log.任务ID || 'N/A')
                            toast.success("任务ID复制成功！")
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
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
            显示 {(currentPage - 1) * pageSize + 1} 到 {Math.min(currentPage * pageSize, totalCountNumber)} 条，共 {totalCountNumber} 条记录
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
            <DialogTitle>确认批量删除</DialogTitle>
            <DialogDescription>
              您确定要删除选中的 {selectedLogs.length} 条日志记录吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsBatchDeleteDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={confirmBatchDelete}
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 单个删除确认对话框 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除记录</DialogTitle>
            <DialogDescription>
              您确定要删除这条日志记录吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteLog}
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑记录对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑记录</DialogTitle>
            <DialogDescription>
              编辑日志记录的详细信息。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">操作详情</label>
              <Input 
                placeholder="请输入操作详情" 
                className="mt-1"
              />
            </div>

          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              取消
            </Button>
            <Button onClick={() => setIsEditDialogOpen(false)}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}