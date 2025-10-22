'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  Filter, 
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Copy,
  RotateCcw,
  Trash2
} from 'lucide-react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { useAppSettings } from '@/contexts/AppSettingsContext'
import { useExchangeCardsRefresh } from '@/contexts/ExchangeCardsContext'
import { formatPoints } from '@/lib/format-points'
import { getTableBorderClasses } from '@/lib/table-border-utils'
import { toast } from 'sonner'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { generateAvatarUrl } from '@/lib/avatar-utils'

// 创建Supabase客户端
const supabase = createClient()

// 更新接口定义以匹配数据库字段
interface ExchangeCard {
  卡号: string;
  卡片名称: string;
  积分数量: number;
  备注: string | null;
  状态: boolean; // true: 未兑换, false: 已兑换
  兑换人: string | null;
  创建时间: string;
  兑换时间: string | null;
  // 额外的用户信息字段
  redeemerEmail?: string;
  redeemerAvatar?: string;
  redeemerUsername?: string;
}

// 获取真实兑换卡数据的函数
const fetchExchangeCards = async (): Promise<ExchangeCard[]> => {
  try {
    const { data, error } = await supabase.rpc('get_exchange_cards_list')
    
    if (error) {
      console.error('获取兑换卡数据失败:', error)
      toast.error('获取兑换卡数据失败')
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('获取兑换卡数据时发生错误:', error)
    toast.error('获取兑换卡数据时发生错误')
    return []
  }
}

// 获取用户信息的函数（用于显示兑换人信息）
const fetchUserInfo = async (userId: string | null) => {
  if (!userId) return null
  
  try {
    // 从 user-management 表获取用户信息
    const { data: userInfo, error: userError } = await supabase
      .from('user-management')
      .select('username, avatar')
      .eq('id', userId)
      .single()
    
    if (userError) {
      console.error('获取用户管理信息失败:', userError)
      return null
    }

    // 获取当前登录用户信息来获取邮箱
    let email = ''
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      // 如果查询的是当前登录用户，则可以获取邮箱
      if (currentUser && currentUser.id === userId) {
        email = currentUser.email || ''
      }
    } catch (authError) {
      console.warn('无法获取当前用户邮箱信息:', authError)
      // 邮箱获取失败不影响其他信息的返回
    }
    
    return {
      username: userInfo?.username || '',
      avatar: userInfo?.avatar || '',
      email: email
    }
  } catch (error) {
    console.error('获取用户信息时发生错误:', error)
    return null
  }
}
const statusColors: Record<string, string> = {
  '已兑换': 'bg-gray-200 text-gray-600',
  '未兑换': 'bg-green-100 text-green-700',
}

type CardStatus = '已兑换' | '未兑换' | 'all';
type SortField = 'points' | 'createdDate' | 'redeemedDate'
type SortOrder = 'asc' | 'desc'

export function ExchangeCards() {
  const { pointsFormat, tableBorder } = useAppSettings()
  const { refreshTrigger } = useExchangeCardsRefresh()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<CardStatus>('all')
  const [sortField, setSortField] = useState<SortField>('createdDate')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState<ExchangeCard | null>(null)
  const [selectedCards, setSelectedCards] = useState<string[]>([]) // 改为字符串数组，存储卡号
  const [isBatchDeleteDialogOpen, setIsBatchDeleteDialogOpen] = useState(false)
  
  // 新增状态管理
  const [exchangeCards, setExchangeCards] = useState<ExchangeCard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // 编辑表单状态
  const [editForm, setEditForm] = useState({
    cardName: '',
    points: 0,
    description: ''
  })
  const [isUpdating, setIsUpdating] = useState(false)
  const [editErrors, setEditErrors] = useState({
    cardName: '',
    points: ''
  })

  const { pageSize } = useAppSettings()
  const itemsPerPage = pageSize

  // 获取兑换卡数据并处理用户信息
  const loadExchangeCards = async () => {
    setIsLoading(true)
    try {
      const cards = await fetchExchangeCards()
      
      // 为每个已兑换的卡片获取用户信息
      const cardsWithUserInfo = await Promise.all(
        cards.map(async (card) => {
          if (card.兑换人) {
            const userInfo = await fetchUserInfo(card.兑换人)
            return {
              ...card,
              redeemerEmail: userInfo?.email || '',
              redeemerAvatar: userInfo?.avatar || '',
              redeemerUsername: userInfo?.username || ''
            }
          }
          return card
        })
      )
      
      setExchangeCards(cardsWithUserInfo)
    } catch (error) {
      console.error('加载兑换卡数据失败:', error)
      toast.error('加载兑换卡数据失败')
    } finally {
      setIsLoading(false)
    }
  }

  // 刷新数据
  const refreshData = async () => {
    setIsRefreshing(true)
    await loadExchangeCards()
    setIsRefreshing(false)
    toast.success('数据已刷新')
  }

  // 组件挂载时加载数据
  useEffect(() => {
    loadExchangeCards()
  }, [])

  // 监听刷新触发器
  useEffect(() => {
    if (refreshTrigger > 0) {
      loadExchangeCards()
    }
  }, [refreshTrigger])

  // 格式化时间：显示月日小时分钟
  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-'
    
    // 如果原始数据只有日期，添加默认时间
    const fullDateString = dateString.includes(':') ? dateString : `${dateString} 14:30`
    const date = new Date(fullDateString)
    
    // 格式化为 MM-DD HH:mm
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    
    return `${month}-${day} ${hours}:${minutes}`
  }

  // 格式化兑换时间
  const formatRedeemedDate = (dateString: string | null) => {
    return formatDateTime(dateString)
  }

  // 过滤和排序兑换卡
  const filteredAndSortedCards = exchangeCards
    .filter(card => {
      const matchesSearch = card.卡片名称.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           card.卡号.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (card.备注 && card.备注.toLowerCase().includes(searchTerm.toLowerCase()))
      
      // 转换状态过滤
      let matchesStatus = true
      if (statusFilter === '已兑换') {
        matchesStatus = !card.状态 // false表示已兑换
      } else if (statusFilter === '未兑换') {
        matchesStatus = card.状态 // true表示未兑换
      }
      
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      let aValue: number | Date, bValue: number | Date
      
      switch (sortField) {
        case 'points':
          aValue = a.积分数量
          bValue = b.积分数量
          break
        case 'createdDate':
          aValue = new Date(a.创建时间)
          bValue = new Date(b.创建时间)
          break
        case 'redeemedDate':
          aValue = a.兑换时间 ? new Date(a.兑换时间) : new Date(0)
          bValue = b.兑换时间 ? new Date(b.兑换时间) : new Date(0)
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

  const totalPages = Math.ceil(filteredAndSortedCards.length / itemsPerPage)
  const paginatedCards = filteredAndSortedCards.slice(
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

  const handleEditCard = (card: ExchangeCard) => {
    setSelectedCard(card)
    setEditForm({
      cardName: card.卡片名称,
      points: card.积分数量,
      description: card.备注 || ''
    })
    setEditErrors({ cardName: '', points: '' })
    setIsEditDialogOpen(true)
  }

  // 验证编辑表单
  const validateEditForm = () => {
    const errors = { cardName: '', points: '' }
    let isValid = true

    if (!editForm.cardName.trim()) {
      errors.cardName = '卡片名称不能为空'
      isValid = false
    } else if (editForm.cardName.trim().length > 50) {
      errors.cardName = '卡片名称不能超过50个字符'
      isValid = false
    }

    if (selectedCard?.状态 && editForm.points <= 0) {
      errors.points = '积分数量必须大于0'
      isValid = false
    } else if (selectedCard?.状态 && editForm.points > 999999) {
      errors.points = '积分数量不能超过999999'
      isValid = false
    }

    setEditErrors(errors)
    return isValid
  }

  // 提交编辑表单
  const handleUpdateCard = async () => {
    if (!selectedCard || !validateEditForm()) {
      return
    }

    setIsUpdating(true)
    try {
      const { data, error } = await supabase.rpc('update_exchange_card', {
        p_card_number: selectedCard.卡号,
        p_card_name: editForm.cardName.trim(),
        p_points: editForm.points,
        p_description: editForm.description.trim() || null
      })

      if (error) {
        console.error('更新兑换卡失败:', error)
        toast.error(error.message || '更新兑换卡失败')
        return
      }

      if (data === true) {
        toast.success('兑换卡更新成功')
        setIsEditDialogOpen(false)
        setSelectedCard(null)
        await loadExchangeCards() // 重新加载数据
      } else {
        toast.error('更新兑换卡失败')
      }
    } catch (error) {
      console.error('更新兑换卡时发生错误:', error)
      toast.error('更新兑换卡时发生错误')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteCard = (card: ExchangeCard) => {
    setSelectedCard(card)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteCard = async () => {
    if (selectedCard) {
      try {
        const { error } = await supabase.rpc('delete_exchange_card', {
          p_card_number: selectedCard.卡号
        })
        
        if (error) throw error
        
        toast.success('兑换卡删除成功')
        await loadExchangeCards() // 重新加载数据
      } catch (error) {
        console.error('删除兑换卡失败:', error)
        toast.error('删除兑换卡失败')
      }
    }
    setIsDeleteDialogOpen(false)
    setSelectedCard(null)
  }

  const handleSelectCard = (cardNumber: string) => {
    setSelectedCards(prev => 
      prev.includes(cardNumber) 
        ? prev.filter(id => id !== cardNumber)
        : [...prev, cardNumber]
    )
  }

  const handleSelectAll = () => {
    if (selectedCards.length === paginatedCards.length) {
      setSelectedCards([])
    } else {
      setSelectedCards(paginatedCards.map(card => card.卡号))
    }
  }

  const handleBatchDelete = () => {
    if (selectedCards.length > 0) {
      setIsBatchDeleteDialogOpen(true)
    }
  }

  const confirmBatchDelete = async () => {
    if (selectedCards.length > 0) {
      try {
        const { error } = await supabase.rpc('batch_delete_exchange_cards', {
          p_card_numbers: selectedCards
        })
        
        if (error) throw error
        
        toast.success(`成功删除 ${selectedCards.length} 张兑换卡`)
        await loadExchangeCards() // 重新加载数据
        setSelectedCards([]) // 清空选中的卡片
      } catch (error) {
        console.error('批量删除兑换卡失败:', error)
        toast.error('批量删除兑换卡失败')
      }
    }
    setIsBatchDeleteDialogOpen(false)
  }

  const handleReset = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setSortField('createdDate')
    setSortOrder('desc')
    setCurrentPage(1)
    toast.success("页面排序已重置")
  }

  return (
    <div className="px-6 pt-1 pb-4 flex flex-col h-full">
      {/* 固定的搜索和过滤区域 */}
      <div className="flex-shrink-0 mb-4">
        {/* 搜索和过滤 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="搜索卡片名称、卡号或备注..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* 批量操作按钮 - 动态显示在搜索框和状态筛选之间 */}
          {selectedCards.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">已选择 {selectedCards.length} 项</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCards([])}
                className="h-8 border-0 shadow-none"
              >
                取消选择
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBatchDelete}
                className="h-8 shadow-none"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                批量删除
              </Button>
            </div>
          )}
          
          <Select value={statusFilter} onValueChange={(value: CardStatus) => setStatusFilter(value)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="筛选状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有状态</SelectItem>
              <SelectItem value="已兑换">已兑换</SelectItem>
              <SelectItem value="未兑换">未兑换</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={refreshData} 
            disabled={isRefreshing}
            className="w-full sm:w-auto"
          >
            <RotateCcw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
            {isRefreshing ? '刷新中...' : '刷新数据'}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleReset}
            className="w-full sm:w-auto"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            重置
          </Button>
        </div>
      </div>

      {/* 可滚动的表格区域 */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-auto">
          <div className="border-x border-b dark:border-gray-600">
            <Table className="min-w-[1200px] table-fixed border-collapse">
              <TableHeader className="bg-secondary">
                <TableRow className={getTableBorderClasses(tableBorder).row}>
                  <TableHead className={cn("w-[3%]", getTableBorderClasses(tableBorder).headerCell)}>
                    <div className="flex items-center justify-center">
                      <Checkbox
                        checked={selectedCards.length === paginatedCards.length && paginatedCards.length > 0}
                        onCheckedChange={handleSelectAll}
                        aria-label="全选"
                      />
                    </div>
                  </TableHead>
                  <TableHead className={cn("w-[10%] pl-3", getTableBorderClasses(tableBorder).headerCell)}>卡片名称</TableHead>
                  <TableHead className={cn("w-[17%]", getTableBorderClasses(tableBorder).headerCell)}>卡号</TableHead>
                  <TableHead className={cn("cursor-pointer w-[10%]", getTableBorderClasses(tableBorder).headerCell)} onClick={() => handleSort('points')}>
                    <div className="flex items-center gap-2">
                      积分数量
                      {getSortIcon('points')}
                    </div>
                  </TableHead>
                  <TableHead className={cn("w-[15%]", getTableBorderClasses(tableBorder).headerCell)}>备注</TableHead>
                  <TableHead className={cn("w-[8%]", getTableBorderClasses(tableBorder).headerCell)}>状态</TableHead>
                  <TableHead className={cn("w-[18%] pl-3", getTableBorderClasses(tableBorder).headerCell)}>兑换人</TableHead>
                  <TableHead className={cn("cursor-pointer w-[7.5%]", getTableBorderClasses(tableBorder).headerCell)} onClick={() => handleSort('createdDate')}>
                    <div className="flex items-center gap-2">
                      创建时间
                      {getSortIcon('createdDate')}
                    </div>
                  </TableHead>
                  <TableHead className={cn("cursor-pointer w-[7.5%]", getTableBorderClasses(tableBorder).headerCell)} onClick={() => handleSort('redeemedDate')}>
                    <div className="flex items-center gap-2">
                      兑换时间
                      {getSortIcon('redeemedDate')}
                    </div>
                  </TableHead>
                  <TableHead className="w-[4%] text-center">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <RotateCcw className="h-4 w-4 animate-spin" />
                        <span>加载中...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedCards.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      暂无兑换卡数据
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedCards.map((card) => (
                  <TableRow key={card.卡号} className={getTableBorderClasses(tableBorder).row}>
                    <TableCell className={cn("w-8 p-0", getTableBorderClasses(tableBorder).cell)}>
                      <div className="flex items-center justify-center h-full">
                        <Checkbox
                          checked={selectedCards.includes(card.卡号)}
                          onCheckedChange={() => handleSelectCard(card.卡号)}
                          aria-label={`选择 ${card.卡片名称}`}
                        />
                      </div>
                    </TableCell>

                    <TableCell className={getTableBorderClasses(tableBorder).cell}>
                      <div className="font-medium">{card.卡片名称}</div>
                    </TableCell>
                    <TableCell className={getTableBorderClasses(tableBorder).cell}>
                      <div className="flex items-center gap-3">
                        <div className="font-mono text-sm">{card.卡号}</div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => {
                            navigator.clipboard.writeText(card.卡号)
                            toast.success("卡号复制成功！")
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className={getTableBorderClasses(tableBorder).cell}>
                      <span className="font-medium">{formatPoints(card.积分数量, pointsFormat)}</span>
                    </TableCell>
                    <TableCell className={getTableBorderClasses(tableBorder).cell}>
                      <div className="text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                        {card.备注 || '-'}
                      </div>
                    </TableCell>
                    <TableCell className={getTableBorderClasses(tableBorder).cell}>
                      <div className={cn("inline-flex items-center rounded-md px-3 py-2 text-xs font-semibold", statusColors[card.状态 ? '未兑换' : '已兑换'])}>
                        {card.状态 ? '未兑换' : '已兑换'}
                      </div>
                    </TableCell>
                    <TableCell className={cn("pl-3", getTableBorderClasses(tableBorder).cell)}>
                      <div className="flex w-full items-center gap-3 rounded-md px-2 py-2">
                        {card.redeemerUsername ? (
                          // 有兑换人时显示头像
                          <Avatar className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0">
                            <AvatarImage 
                              src={card.redeemerAvatar && card.redeemerAvatar.trim() !== '' ? generateAvatarUrl({ avatar: card.redeemerAvatar }) || '/default-avatar/苹果.png' : '/default-avatar/苹果.png'} 
                              alt={card.redeemerUsername} 
                            />
                            <AvatarFallback className="text-base md:text-lg font-medium">
                              {card.redeemerUsername[0]}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          // 没有兑换人时显示占位符
                          <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex-shrink-0"></div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className={cn("font-medium truncate text-left leading-tight", !card.redeemerUsername && "text-gray-400")}>{card.redeemerUsername || '-'}</div>
                          <div className={cn("text-sm truncate text-left leading-tight", card.redeemerUsername ? "text-muted-foreground" : "text-gray-400")}>{card.redeemerEmail || '-'}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className={getTableBorderClasses(tableBorder).cell}>{formatDateTime(card.创建时间)}</TableCell>
                    <TableCell className={getTableBorderClasses(tableBorder).cell}>{formatRedeemedDate(card.兑换时间)}</TableCell>
                    <TableCell className="text-center p-0">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditCard(card)}>
                            编辑兑换卡
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteCard(card)}
                          >
                            删除兑换卡
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      
      {/* 固定在底部的分页栏 */}
      <div className="flex-shrink-0 pt-2 border-t dark:border-gray-600 bg-transparent dark:bg-transparent">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            显示 {(currentPage - 1) * itemsPerPage + 1} 到 {Math.min(currentPage * itemsPerPage, filteredAndSortedCards.length)} 条，共 {filteredAndSortedCards.length} 条记录
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

      {/* 编辑兑换卡对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>编辑兑换卡</DialogTitle>
            <DialogDescription>
              修改兑换卡的基本信息
              {selectedCard && !selectedCard.状态 && (
                <span className="block mt-1 text-amber-600 text-sm">
                  注意：已兑换的卡片只能修改名称和备注
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedCard && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cardNumber" className="text-right">
                  卡号
                </Label>
                <Input
                  id="cardNumber"
                  value={selectedCard.卡号}
                  className="col-span-3"
                  readOnly
                  disabled
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cardName" className="text-right">
                  卡片名称 <span className="text-red-500">*</span>
                </Label>
                <div className="col-span-3">
                  <Input
                    id="cardName"
                    value={editForm.cardName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, cardName: e.target.value }))}
                    className={editErrors.cardName ? "border-red-500" : ""}
                    placeholder="请输入卡片名称"
                  />
                  {editErrors.cardName && (
                    <p className="text-red-500 text-sm mt-1">{editErrors.cardName}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="points" className="text-right">
                  积分数量 {selectedCard.状态 && <span className="text-red-500">*</span>}
                </Label>
                <div className="col-span-3">
                  <Input
                    id="points"
                    type="number"
                    value={editForm.points}
                    onChange={(e) => setEditForm(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                    className={editErrors.points ? "border-red-500" : ""}
                    placeholder="请输入积分数量"
                    disabled={!selectedCard.状态} // 已兑换的卡片不能修改积分
                  />
                  {editErrors.points && (
                    <p className="text-red-500 text-sm mt-1">{editErrors.points}</p>
                  )}
                  {!selectedCard.状态 && (
                    <p className="text-gray-500 text-sm mt-1">已兑换的卡片不能修改积分数量</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  备注
                </Label>
                <Textarea
                  id="description"
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  className="col-span-3"
                  placeholder="请输入备注信息（可选）"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isUpdating}
            >
              取消
            </Button>
            <Button 
              onClick={handleUpdateCard}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                  更新中...
                </>
              ) : (
                '确认更新'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              删除无法复原，并且会影响统计。确定要删除兑换卡 &quot;{selectedCard?.卡片名称}&quot; 吗？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={confirmDeleteCard}>
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 批量删除确认对话框 */}
      <Dialog open={isBatchDeleteDialogOpen} onOpenChange={setIsBatchDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认批量删除</DialogTitle>
            <DialogDescription>
              删除无法复原，并且会影响统计。确定要删除选中的 {selectedCards.length} 张兑换卡吗？
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