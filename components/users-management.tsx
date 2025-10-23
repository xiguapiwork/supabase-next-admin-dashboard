'use client'

import { useState, useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, Trash2, RotateCcw, Filter, MoreHorizontal, ArrowUpDown, ArrowUp, ArrowDown, Loader2, Check, X } from 'lucide-react'
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
import { cn } from '@/lib/utils'
import { useAppSettings } from '@/contexts/AppSettingsContext'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { formatPoints } from '@/lib/format-points'
import { getTableBorderClasses } from '@/lib/table-border-utils'
import { useRouter, useSearchParams } from 'next/navigation'
import { UserDetails } from './user-details'
import { useUsersManagement, adjustUserPoints, type UserManagementData } from '@/hooks/use-users-management'

// 模拟数据已移除，现在使用数据库数据

const roleColors: Record<string, string> = {
  '管理员': 'bg-red-100 text-red-700',
  '普通用户': 'bg-gray-200 text-gray-600',
  '付费用户': 'bg-green-100 text-green-700',
}

type UserRole = '普通用户' | '付费用户' | '管理员';
type SortField = 'currentPoints' | 'totalConsumedPoints' | 'totalUsage' | 'todayPoints' | 'weekPoints' | 'joinDate' | 'lastActiveTime'
type SortOrder = 'asc' | 'desc'

export function UsersManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')
  const [sortField, setSortField] = useState<SortField>('joinDate')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserManagementData | null>(null)
  
  // 使用数据库数据
  const { data: users, isLoading, error, refetch } = useUsersManagement()
  // 编辑用户表单状态
  const [editFormData, setEditFormData] = useState({
    pointsAdjustment: 0
  })
  
  // 批量选择状态
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  
  // 删除确认对话框状态
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<UserManagementData | null>(null)
  
  // 备注编辑状态
  const [editingNoteUserId, setEditingNoteUserId] = useState<string | null>(null)
  const [editingNoteValue, setEditingNoteValue] = useState('')
  const [originalNoteValue, setOriginalNoteValue] = useState('')

  const { pageSize, pointsFormat, tableBorder } = useAppSettings()
  const itemsPerPage = pageSize

  // 查询路由参数，决定是否显示详情页
  const router = useRouter()
  const searchParams = useSearchParams()
  const userIdParam = searchParams.get('userId')
  const detailsUser = userIdParam && users ? users.find(u => u.id === userIdParam) : null

  // 组件首次加载时，如果URL中有userId参数但找不到对应用户，自动清除参数
  useEffect(() => {
    if (userIdParam && users && users.length > 0 && !detailsUser) {
      const params = new URLSearchParams(searchParams.toString())
      params.delete('userId')
      router.replace(`?${params.toString()}`)
    }
  }, [userIdParam, users, detailsUser, searchParams, router])

  const handleBackToList = () => {
    // 清除userId参数，保留其他查询参数（搜索、分页、排序等）
    const params = new URLSearchParams(searchParams.toString())
    params.delete('userId')
    router.push(`?${params.toString()}`)
  }

  const handleViewDetails = (user: UserManagementData) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('userId', String(user.id))
    router.push(`?${params.toString()}`)
  }

  // 处理loading状态
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>加载用户数据中...</span>
        </div>
      </div>
    )
  }

  // 处理错误状态
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-red-600 mb-4">加载用户数据失败: {error.message}</p>
          <Button onClick={() => refetch()}>重试</Button>
        </div>
      </div>
    )
  }

  // 处理无数据状态
  if (!users || users.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-gray-600 mb-4">暂无用户数据</p>
          <Button onClick={() => refetch()}>刷新</Button>
        </div>
      </div>
    )
  }

  if (detailsUser) {
    return (
      <div className="flex-1 overflow-auto bg-background">
        <UserDetails user={detailsUser} onBack={handleBackToList} />
      </div>
    )
  }

  // ... existing code ...

  // 过滤和排序用户
  const filteredAndSortedUsers = users
    .filter(user => {
      const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (user.notes || '').toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRole = roleFilter === 'all' || user.roles.includes(roleFilter)
      return matchesSearch && matchesRole
    })
    .sort((a, b) => {
      let aValue: number, bValue: number
      
      switch (sortField) {
        case 'currentPoints':
          aValue = a.currentPoints
          bValue = b.currentPoints
          break
        case 'totalConsumedPoints':
          aValue = a.totalConsumedPoints
          bValue = b.totalConsumedPoints
          break
        case 'totalUsage':
          aValue = a.totalUsage
          bValue = b.totalUsage
          break
        case 'todayPoints':
          aValue = a.todayPoints
          bValue = b.todayPoints
          break
        case 'weekPoints':
          aValue = a.weekPoints
          bValue = b.weekPoints
          break
        case 'joinDate':
          aValue = new Date(a.joinDate).getTime()
          bValue = new Date(b.joinDate).getTime()
          break
        case 'lastActiveTime':
          aValue = new Date(a.lastActiveTime).getTime()
          bValue = new Date(b.lastActiveTime).getTime()
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

  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage)
  const paginatedUsers = filteredAndSortedUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />
    return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

  const handleEditUser = (user: typeof users[0]) => {
    setSelectedUser(user)
    // 初始化表单数据
    const initialData = {
      pointsAdjustment: 0
    }
    setEditFormData(initialData)
    setIsEditDialogOpen(true)
  }

  // 检查是否有修改
  const hasChanges = editFormData.pointsAdjustment !== 0

  // 保存修改
  const handleSaveChanges = async () => {
    if (!selectedUser || editFormData.pointsAdjustment === 0) {
      toast.error("积分调整值不能为0")
      return
    }

    try {
      // 构建变动原因
      const reason = `管理员操作：${editFormData.pointsAdjustment > 0 ? '增加' : '减少'}${Math.abs(editFormData.pointsAdjustment)}积分`
      
      // 调用积分调整API
      await adjustUserPoints(
        selectedUser.id,
        editFormData.pointsAdjustment,
        reason
      )
      
      toast.success(`积分调整成功！${editFormData.pointsAdjustment > 0 ? '增加' : '减少'}了${Math.abs(editFormData.pointsAdjustment)}积分`)
      setIsEditDialogOpen(false)
      
      // 刷新用户数据
      refetch()
    } catch (error) {
      console.error('积分调整失败:', error)
      toast.error(error instanceof Error ? error.message : '积分调整失败')
    }
  }

  // 取消修改
  const handleCancelChanges = () => {
    setEditFormData({ pointsAdjustment: 0 })
  }

  const handleReset = () => {
    setSearchTerm('')
    setRoleFilter('all')
    setSortField('joinDate')
    setSortOrder('desc')
    setCurrentPage(1)
    toast.success("页面排序已重置")
  }

  // 批量操作函数
  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSelectAll = () => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(paginatedUsers.map(user => user.id))
    }
  }

  const handleBatchDelete = () => {
    // 这里应该调用实际的删除API
    console.log('批量删除用户:', selectedUsers)
    // 模拟删除操作
    setSelectedUsers([])
    // 实际项目中应该刷新数据或从状态中移除已删除的用户
  }

  const confirmDeleteUser = (user: UserManagementData) => {
    setUserToDelete(user)
    setIsDeleteDialogOpen(true)
  }

  // 备注编辑处理函数
  const handleNoteDoubleClick = (user: UserManagementData) => {
    setEditingNoteUserId(user.id)
    setEditingNoteValue(user.notes || '')
    setOriginalNoteValue(user.notes || '')
  }

  const handleNoteSave = async () => {
    if (!editingNoteUserId) return
    
    try {
      // 这里应该调用API保存备注
      console.log('保存备注:', { userId: editingNoteUserId, notes: editingNoteValue })
      
      // 模拟API调用成功
      toast.success("备注保存成功！")
      
      // 重置编辑状态
      setEditingNoteUserId(null)
      setEditingNoteValue('')
      setOriginalNoteValue('')
      
      // 刷新数据
      refetch()
    } catch (error) {
      console.error('保存备注失败:', error)
      toast.error("保存备注失败，请重试")
    }
  }

  const handleNoteCancel = () => {
    setEditingNoteUserId(null)
    setEditingNoteValue('')
    setOriginalNoteValue('')
  }

  const hasNoteChanged = editingNoteValue !== originalNoteValue

  const handleDeleteUser = () => {
    if (userToDelete) {
      // 这里应该调用实际的删除API
      console.log('删除用户:', userToDelete.id)
      // 模拟删除操作
      setIsDeleteDialogOpen(false)
      setUserToDelete(null)
      // 实际项目中应该刷新数据或从状态中移除已删除的用户
      toast.success(`用户 ${userToDelete.username} 已删除`)
    }
  }

  return (
    <div className="px-6 pt-1 pb-4 flex flex-col h-full">
      {/* 固定搜索和过滤区域 */}
      <div className="flex-shrink-0 space-y-3 mb-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="搜索用户名、邮箱或备注..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          {selectedUsers.length > 0 && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setSelectedUsers([])}
                className="w-auto"
              >
                取消选择 ({selectedUsers.length})
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleBatchDelete}
                className="w-auto"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                删除
              </Button>
            </div>
          )}
          <Select value={roleFilter} onValueChange={(value: UserRole | 'all') => setRoleFilter(value)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="筛选角色" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有角色</SelectItem>
              <SelectItem value="普通用户">普通用户</SelectItem>
              <SelectItem value="付费用户">付费用户</SelectItem>
              <SelectItem value="管理员">管理员</SelectItem>
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

      {/* 可滚动的表格区域 */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-auto">
          <div className={getTableBorderClasses(tableBorder).row}>
            <Table className="min-w-[1200px] table-fixed border-collapse">
              <TableHeader className="bg-secondary">
                <TableRow className={getTableBorderClasses(tableBorder).row}>
                  <TableHead className={cn("w-[3%]", getTableBorderClasses(tableBorder).headerCell)}>
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </div>
                  </TableHead>
                  <TableHead className={cn("w-[18%] pl-3", getTableBorderClasses(tableBorder).headerCell)}>用户信息</TableHead>
                  <TableHead className={cn("w-[10%] pl-6", getTableBorderClasses(tableBorder).headerCell)}>角色</TableHead>
                  <TableHead className={cn("w-[18%]", getTableBorderClasses(tableBorder).headerCell)}>备注</TableHead>
                  <TableHead className={cn("cursor-pointer w-[10%]", getTableBorderClasses(tableBorder).headerCell)} onClick={() => handleSort('currentPoints')}>
                    <div className="flex items-center gap-2">
                      当前积分
                      {getSortIcon('currentPoints')}
                    </div>
                  </TableHead>
                  <TableHead className={cn("cursor-pointer w-[10%]", getTableBorderClasses(tableBorder).headerCell)} onClick={() => handleSort('totalConsumedPoints')}>
                    <div className="flex items-center gap-2">
                      总消耗积分
                      {getSortIcon('totalConsumedPoints')}
                    </div>
                  </TableHead>
                  <TableHead className={cn("cursor-pointer w-[9%]", getTableBorderClasses(tableBorder).headerCell)} onClick={() => handleSort('todayPoints')}>
                    <div className="flex items-center gap-2">
                      今日消耗
                      {getSortIcon('todayPoints')}
                    </div>
                  </TableHead>
                  <TableHead className={cn("cursor-pointer w-[9%]", getTableBorderClasses(tableBorder).headerCell)} onClick={() => handleSort('weekPoints')}>
                    <div className="flex items-center gap-2">
                      7日消耗
                      {getSortIcon('weekPoints')}
                    </div>
                  </TableHead>
                  <TableHead className={cn("cursor-pointer w-[9%]", getTableBorderClasses(tableBorder).headerCell)} onClick={() => handleSort('lastActiveTime')}>
                    <div className="flex items-center gap-2">
                      最后活跃
                      {getSortIcon('lastActiveTime')}
                    </div>
                  </TableHead>
                  <TableHead className={cn("w-[4%] text-center", getTableBorderClasses(tableBorder).headerCell)}>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow key={user.id} className={getTableBorderClasses(tableBorder).row}>
                    <TableCell className={`w-8 p-0 ${getTableBorderClasses(tableBorder).cell}`}>
                      <div className="flex items-center justify-center h-full">
                        <Checkbox
                          checked={selectedUsers.includes(user.id)}
                          onCheckedChange={() => handleSelectUser(user.id)}
                        />
                      </div>
                    </TableCell>
                    <TableCell className={cn("pl-3", getTableBorderClasses(tableBorder).cell)}>
                      <button
                        onClick={() => handleViewDetails(user)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleViewDetails(user); } }}
                        className="flex w-full items-center gap-3 rounded-md px-2 py-2 hover:bg-accent cursor-pointer"
                        title="查看详情"
                        aria-label="查看用户详情"
                      >
                        <Avatar className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0">
                          <AvatarImage src={user.avatar} alt={user.username} />
                          <AvatarFallback className="text-base md:text-lg font-medium">
                            {user.username[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate text-left leading-tight">{user.username}</div>
                          <div className="text-sm text-muted-foreground truncate text-left leading-tight">{user.email}</div>
                        </div>
                      </button>
                    </TableCell>
                    <TableCell className={cn("w-[10%] pl-6", getTableBorderClasses(tableBorder).cell)}>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <Badge key={role} className={cn("text-xs py-1.5 hover:!bg-transparent", roleColors[role])}>
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className={cn("w-[18%]", getTableBorderClasses(tableBorder).cell)}>
                      {editingNoteUserId === user.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={editingNoteValue}
                            onChange={(e) => setEditingNoteValue(e.target.value)}
                            className="h-8 text-sm"
                            placeholder="输入备注..."
                            autoFocus
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={handleNoteSave}
                            disabled={!hasNoteChanged}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={handleNoteCancel}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div
                          className={cn(
                            "text-sm max-w-32 truncate cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-1 rounded",
                            user.notes ? "text-gray-600 dark:text-gray-300" : "text-gray-400 dark:text-gray-500"
                          )}
                          title={user.notes || "双击编辑备注"}
                          onDoubleClick={() => handleNoteDoubleClick(user)}
                        >
                          {user.notes || "暂无备注"}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className={cn("w-[10.5%]", getTableBorderClasses(tableBorder).cell)}>{formatPoints(user.currentPoints, pointsFormat)}</TableCell>
                    <TableCell className={cn("w-[10.5%]", getTableBorderClasses(tableBorder).cell)}>{formatPoints(user.totalConsumedPoints, pointsFormat)}</TableCell>
                    <TableCell className={cn("w-[8%]", getTableBorderClasses(tableBorder).cell)}>{formatPoints(user.todayPoints, pointsFormat)}</TableCell>
                    <TableCell className={cn("w-[8%]", getTableBorderClasses(tableBorder).cell)}>{formatPoints(user.weekPoints, pointsFormat)}</TableCell>
                    <TableCell className={cn("w-[9%]", getTableBorderClasses(tableBorder).cell)}>{user.lastActiveTime.replace('2024-', '')}</TableCell>
                    <TableCell className={cn("text-center p-0", getTableBorderClasses(tableBorder).cell)}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditUser(user)}>
                            编辑用户
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewDetails(user)}>
                            查看详情
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => confirmDeleteUser(user)} className="text-red-600">
                            删除用户
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
      </div>
      
      {/* 固定在底部的分页栏 */}
      <div className="flex-shrink-0 pt-2 border-t bg-transparent dark:bg-transparent">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            显示 {(currentPage - 1) * itemsPerPage + 1} 到 {Math.min(currentPage * itemsPerPage, filteredAndSortedUsers.length)} 条，共 {filteredAndSortedUsers.length} 条记录
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

      {/* 编辑用户对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>编辑用户</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="grid gap-6 py-4">
              {/* 用户信息展示区域 */}
              <div className="flex flex-col items-center space-y-3 pb-4 border-b border-gray-200 dark:border-gray-700">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={selectedUser.avatar} alt={selectedUser.username} />
                  <AvatarFallback className="text-lg font-medium">
                    {selectedUser.username.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center space-y-1">
                  <div className="font-medium text-lg text-gray-900 dark:text-gray-100">
                    {selectedUser.username}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedUser.email}
                  </div>
                </div>
              </div>
              
              {/* 编辑字段区域 */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="points" className="text-right">
                  当前积分
                </Label>
                <Input
                  id="points"
                  type="number"
                  value={formatPoints(selectedUser.currentPoints, pointsFormat)}
                  className="col-span-3 bg-gray-50 dark:bg-gray-800"
                  readOnly
                  disabled
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="pointsAdjustment" className="text-right">
                  积分调整
                </Label>
                <Input
                  id="pointsAdjustment"
                  type="text"
                  inputMode="numeric"
                  pattern="-?[0-9]*"
                  value={editFormData.pointsAdjustment}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || value === '-' || /^-?\d+$/.test(value)) {
                      setEditFormData(prev => ({ ...prev, pointsAdjustment: Number(value) || 0 }));
                    }
                  }}
                  className="col-span-3 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                  placeholder="输入正数或负数进行积分调整..."
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="finalPoints" className="text-right">
                  最终积分
                </Label>
                <div className="col-span-3 px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md text-gray-700 dark:text-white font-medium">
                  {formatPoints(selectedUser.currentPoints + editFormData.pointsAdjustment, pointsFormat)}
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex gap-2">
            {hasChanges && (
              <Button variant="outline" onClick={handleCancelChanges}>
                取消
              </Button>
            )}
            <Button 
              onClick={handleSaveChanges}
              disabled={!hasChanges}
              className={cn(
                "transition-colors",
                !hasChanges 
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed hover:bg-gray-300" 
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              )}
            >
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>确认删除用户</DialogTitle>
            <DialogDescription>
              您确定要删除用户 &quot;{userToDelete?.username}&quot; 吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}