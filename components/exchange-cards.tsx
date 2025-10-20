'use client'

import { useState } from 'react'
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
import { formatPoints } from '@/lib/format-points'
import { getTableBorderClasses } from '@/lib/table-border-utils'
import { toast } from 'sonner'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

// 模拟兑换卡数据
interface ExchangeCard {
  id: number;
  name: string;
  cardNumber: string;
  points: number;
  status: "已兑换" | "未兑换";
  redeemer: string;
  redeemerEmail: string;
  description: string;
  createdDate: string;
  redeemedDate: string;
  redeemerAvatar?: string;
}
const exchangeCards: ExchangeCard[] = [
  {
    id: 1,
    name: '新用户礼包',
    cardNumber: 'A1B2C3D4E5F6G7H8',
    points: 100,
    status: '已兑换',
    redeemer: '张三',
    redeemerEmail: 'zhangsan@example.com',
    description: '新用户注册专享积分卡',
    createdDate: '2024-01-15',
    redeemedDate: '2024-01-20',
  },
  {
    id: 2,
    name: '月度会员奖励',
    cardNumber: 'M9N8O7P6Q5R4S3T2',
    points: 500,
    status: '已兑换',
    redeemer: '李四',
    redeemerEmail: 'lisi@example.com',
    description: '月度会员专享积分奖励',
    createdDate: '2024-02-01',
    redeemedDate: '2024-02-05',
  },
  {
    id: 3,
    name: '节日特惠',
    cardNumber: 'H1J2K3L4M5N6O7P8',
    points: 200,
    status: '未兑换',
    redeemer: '',
    redeemerEmail: '',
    description: '节日期间限时特惠积分卡',
    createdDate: '2024-02-10',
    redeemedDate: '',
  },
  {
    id: 4,
    name: '推荐好友',
    cardNumber: 'R9S8T7U6V5W4X3Y2',
    points: 150,
    status: '已兑换',
    redeemer: '王五',
    redeemerEmail: 'wangwu@example.com',
    description: '成功推荐好友注册获得积分',
    createdDate: '2024-03-01',
    redeemedDate: '2024-03-05',
  },
  {
    id: 5,
    name: '签到奖励',
    cardNumber: 'Z1A2B3C4D5E6F7G8',
    points: 50,
    status: '未兑换',
    redeemer: '',
    redeemerEmail: '',
    description: '连续签到7天获得积分奖励',
    createdDate: '2024-01-20',
    redeemedDate: '',
  },
  {
    id: 6,
    name: '生日特惠',
    cardNumber: 'B6C7D8E9F0G1H2I3',
    points: 300,
    status: '已兑换',
    redeemer: '孙八',
    redeemerEmail: 'sunba@example.com',
    description: '生日月专享积分卡',
    createdDate: '2024-01-25',
    redeemedDate: '2024-01-28',
  },
  {
    id: 7,
    name: '周年庆典',
    cardNumber: 'W7X8Y9Z0A1B2C3D4',
    points: 800,
    status: '未兑换',
    redeemer: '',
    redeemerEmail: '',
    description: '平台周年庆典限量积分卡',
    createdDate: '2024-02-15',
    redeemedDate: '',
  },
  {
    id: 8,
    name: '任务完成',
    cardNumber: 'T8U9V0W1X2Y3Z4A5',
    points: 120,
    status: '已兑换',
    redeemer: '周九',
    redeemerEmail: 'zhoujiu@example.com',
    description: '完成每日任务获得积分',
    createdDate: '2024-02-20',
    redeemedDate: '2024-02-22',
  },
  {
    id: 9,
    name: '邀请奖励',
    cardNumber: 'I9J0K1L2M3N4O5P6',
    points: 250,
    status: '未兑换',
    redeemer: '',
    redeemerEmail: '',
    description: '邀请新用户注册奖励',
    createdDate: '2024-03-02',
    redeemedDate: '',
  },
  {
    id: 10,
    name: '评价奖励',
    cardNumber: 'E0F1G2H3I4J5K6L7',
    points: 80,
    status: '已兑换',
    redeemer: '吴十',
    redeemerEmail: 'wushi@example.com',
    description: '完成产品评价获得积分',
    createdDate: '2024-02-28',
    redeemedDate: '2024-03-01',
  },
  {
    id: 11,
    name: '分享奖励',
    cardNumber: 'S1T2U3V4W5X6Y7Z8',
    points: 60,
    status: '未兑换',
    redeemer: '',
    redeemerEmail: '',
    description: '分享产品到社交媒体奖励',
    createdDate: '2024-03-05',
    redeemedDate: '',
  },
  {
    id: 12,
    name: '充值返利',
    cardNumber: 'C2D3E4F5G6H7I8J9',
    points: 400,
    status: '已兑换',
    redeemer: '郑十一',
    redeemerEmail: 'zhengshiyi@example.com',
    description: '首次充值返利积分卡',
    createdDate: '2024-01-30',
    redeemedDate: '2024-02-02',
  },
  {
    id: 13,
    name: '活动参与',
    cardNumber: 'A3B4C5D6E7F8G9H0',
    points: 180,
    status: '未兑换',
    redeemer: '',
    redeemerEmail: '',
    description: '参与线上活动获得积分',
    createdDate: '2024-03-08',
    redeemedDate: '',
  },
  {
    id: 14,
    name: '学习奖励',
    cardNumber: 'L4M5N6O7P8Q9R0S1',
    points: 90,
    status: '已兑换',
    redeemer: '冯十二',
    redeemerEmail: 'fengshier@example.com',
    description: '完成学习课程获得积分',
    createdDate: '2024-02-12',
    redeemedDate: '2024-02-15',
  },
  {
    id: 15,
    name: '社区贡献',
    cardNumber: 'Q5R6S7T8U9V0W1X2',
    points: 220,
    status: '未兑换',
    redeemer: '',
    redeemerEmail: '',
    description: '社区活跃贡献奖励',
    createdDate: '2024-03-10',
    redeemedDate: '',
  },
  {
    id: 16,
    name: '测试参与',
    cardNumber: 'T6U7V8W9X0Y1Z2A3',
    points: 150,
    status: '已兑换',
    redeemer: '陈十三',
    redeemerEmail: 'chenshisan@example.com',
    description: '参与产品测试获得积分',
    createdDate: '2024-02-18',
    redeemedDate: '2024-02-20',
  },
  {
    id: 17,
    name: '忠诚用户',
    cardNumber: 'F7G8H9I0J1K2L3M4',
    points: 600,
    status: '未兑换',
    redeemer: '',
    redeemerEmail: '',
    description: '忠诚用户专享高额积分',
    createdDate: '2024-01-12',
    redeemedDate: '',
  },
  {
    id: 18,
    name: '节能环保',
    cardNumber: 'N8O9P0Q1R2S3T4U5',
    points: 110,
    status: '已兑换',
    redeemer: '褚十四',
    redeemerEmail: 'chushisi@example.com',
    description: '参与环保活动获得积分',
    createdDate: '2024-02-25',
    redeemedDate: '2024-02-28',
  },
  {
    id: 19,
    name: '创意投稿',
    cardNumber: 'C9D0E1F2G3H4I5J6',
    points: 350,
    status: '未兑换',
    redeemer: '',
    redeemerEmail: '',
    description: '创意内容投稿奖励',
    createdDate: '2024-03-12',
    redeemedDate: '',
  },
  {
    id: 20,
    name: '早鸟优惠',
    cardNumber: 'E0F1G2H3I4J5K6L7',
    points: 280,
    status: '已兑换',
    redeemer: '卫十五',
    redeemerEmail: 'weishiwu@example.com',
    description: '早鸟用户专享优惠积分',
    createdDate: '2024-01-08',
    redeemedDate: '2024-01-10',
  },
  {
    id: 21,
    name: '问卷调研',
    cardNumber: 'Q1R2S3T4U5V6W7X8',
    points: 70,
    status: '未兑换',
    redeemer: '',
    redeemerEmail: '',
    description: '完成问卷调研获得积分',
    createdDate: '2024-03-15',
    redeemedDate: '',
  },
  {
    id: 22,
    name: '技能认证',
    cardNumber: 'S2T3U4V5W6X7Y8Z9',
    points: 450,
    status: '已兑换',
    redeemer: '蒋十六',
    redeemerEmail: 'jiangshiliu@example.com',
    description: '通过技能认证获得积分',
    createdDate: '2024-01-18',
    redeemedDate: '2024-01-22',
  },
  {
    id: 23,
    name: '团队协作',
    cardNumber: 'T3U4V5W6X7Y8Z9A0',
    points: 320,
    status: '未兑换',
    redeemer: '',
    redeemerEmail: '',
    description: '团队协作项目完成奖励',
    createdDate: '2024-03-18',
    redeemedDate: '',
  },
  {
    id: 24,
    name: '创新提案',
    cardNumber: 'I4J5K6L7M8N9O0P1',
    points: 500,
    status: '已兑换',
    redeemer: '沈十七',
    redeemerEmail: 'shenshiqi@example.com',
    description: '提交创新提案获得积分',
    createdDate: '2024-02-08',
    redeemedDate: '2024-02-12',
  },
  {
    id: 25,
    name: '客服好评',
    cardNumber: 'K5L6M7N8O9P0Q1R2',
    points: 130,
    status: '未兑换',
    redeemer: '',
    redeemerEmail: '',
    description: '客服服务好评奖励',
    createdDate: '2024-03-20',
    redeemedDate: '',
  },
  {
    id: 26,
    name: '数据分析',
    cardNumber: 'D6E7F8G9H0I1J2K3',
    points: 380,
    status: '已兑换',
    redeemer: '韩十八',
    redeemerEmail: 'hanshiba@example.com',
    description: '数据分析报告提交奖励',
    createdDate: '2024-01-28',
    redeemedDate: '2024-02-01',
  },
  {
    id: 27,
    name: '安全贡献',
    cardNumber: 'S7T8U9V0W1X2Y3Z4',
    points: 250,
    status: '未兑换',
    redeemer: '',
    redeemerEmail: '',
    description: '发现安全漏洞奖励',
    createdDate: '2024-03-22',
    redeemedDate: '',
  },
  {
    id: 28,
    name: '用户体验',
    cardNumber: 'U8V9W0X1Y2Z3A4B5',
    points: 160,
    status: '已兑换',
    redeemer: '杨十九',
    redeemerEmail: 'yangshijiu@example.com',
    description: '用户体验优化建议奖励',
    createdDate: '2024-02-14',
    redeemedDate: '2024-02-18',
  },
  {
    id: 29,
    name: '内容创作',
    cardNumber: 'C9D0E1F2G3H4I5J6',
    points: 420,
    status: '未兑换',
    redeemer: '',
    redeemerEmail: '',
    description: '优质内容创作奖励',
    createdDate: '2024-03-25',
    redeemedDate: '',
  },
  {
    id: 30,
    name: '社交推广',
    cardNumber: 'S0T1U2V3W4X5Y6Z7',
    points: 190,
    status: '已兑换',
    redeemer: '朱二十',
    redeemerEmail: 'zhuershí@example.com',
    description: '社交媒体推广奖励',
    createdDate: '2024-02-22',
    redeemedDate: '2024-02-25',
  },
  {
    id: 31,
    name: '产品反馈',
    cardNumber: 'P1Q2R3S4T5U6V7W8',
    points: 140,
    status: '未兑换',
    redeemer: '',
    redeemerEmail: '',
    description: '产品使用反馈奖励',
    createdDate: '2024-03-28',
    redeemedDate: '',
  },
  {
    id: 32,
    name: '学习分享',
    cardNumber: 'L2M3N4O5P6Q7R8S9',
    points: 200,
    status: '已兑换',
    redeemer: '秦二一',
    redeemerEmail: 'qinershiyi@example.com',
    description: '学习心得分享奖励',
    createdDate: '2024-02-05',
    redeemedDate: '2024-02-08',
  },
  {
    id: 33,
    name: '技术支持',
    cardNumber: 'T3U4V5W6X7Y8Z9A0',
    points: 300,
    status: '未兑换',
    redeemer: '',
    redeemerEmail: '',
    description: '提供技术支持奖励',
    createdDate: '2024-03-30',
    redeemedDate: '',
  },
  {
    id: 34,
    name: '品牌宣传',
    cardNumber: 'B4C5D6E7F8G9H0I1',
    points: 350,
    status: '已兑换',
    redeemer: '尤二二',
    redeemerEmail: 'youershier@example.com',
    description: '品牌宣传活动参与奖励',
    createdDate: '2024-01-22',
    redeemedDate: '2024-01-25',
  },
  {
    id: 35,
    name: '年度总结',
    cardNumber: 'Y5Z6A7B8C9D0E1F2',
    points: 1000,
    status: '未兑换',
    redeemer: '',
    redeemerEmail: '',
    description: '年度活跃用户特别奖励',
    createdDate: '2024-01-01',
    redeemedDate: '',
  }
]

const statusColors: Record<string, string> = {
  '已兑换': 'bg-gray-200 text-gray-600',
  '未兑换': 'bg-green-100 text-green-700',
}

type CardStatus = '已兑换' | '未兑换' | 'all';
type SortField = 'points' | 'createdDate' | 'redeemedDate'
type SortOrder = 'asc' | 'desc'

export function ExchangeCards() {
  const { pointsFormat, tableBorder } = useAppSettings()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<CardStatus>('all')
  const [sortField, setSortField] = useState<SortField>('createdDate')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState<typeof exchangeCards[0] | null>(null)
  const [selectedCards, setSelectedCards] = useState<number[]>([])
  const [isBatchDeleteDialogOpen, setIsBatchDeleteDialogOpen] = useState(false)

  const { pageSize } = useAppSettings()
  const itemsPerPage = pageSize

  // 格式化兑换时间：去掉年份，增加小时和分钟
  const formatRedeemedDate = (dateString: string) => {
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

  // 过滤和排序兑换卡
  const filteredAndSortedCards = exchangeCards
    .filter(card => {
      const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           card.cardNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           card.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || card.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      let aValue: number | Date, bValue: number | Date
      
      switch (sortField) {
        case 'points':
          aValue = a.points
          bValue = b.points
          break
        case 'createdDate':
          aValue = new Date(a.createdDate)
          bValue = new Date(b.createdDate)
          break
        case 'redeemedDate':
          aValue = a.redeemedDate ? new Date(a.redeemedDate) : new Date(0)
          bValue = b.redeemedDate ? new Date(b.redeemedDate) : new Date(0)
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

  const handleEditCard = (card: typeof exchangeCards[0]) => {
    setSelectedCard(card)
    setIsEditDialogOpen(true)
  }

  const handleDeleteCard = (card: typeof exchangeCards[0]) => {
    setSelectedCard(card)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteCard = () => {
    if (selectedCard) {
      // 这里实现实际的删除逻辑
      console.log('删除兑换卡:', selectedCard.name)
      // 实际项目中应该调用API删除数据
    }
    setIsDeleteDialogOpen(false)
    setSelectedCard(null)
  }

  const handleSelectCard = (cardId: number) => {
    setSelectedCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    )
  }

  const handleSelectAll = () => {
    if (selectedCards.length === paginatedCards.length) {
      setSelectedCards([])
    } else {
      setSelectedCards(paginatedCards.map(card => card.id))
    }
  }

  const handleBatchDelete = () => {
    if (selectedCards.length > 0) {
      setIsBatchDeleteDialogOpen(true)
    }
  }

  const confirmBatchDelete = () => {
    if (selectedCards.length > 0) {
      // 这里实现实际的批量删除逻辑
      console.log('批量删除兑换卡:', selectedCards)
      // 实际项目中应该调用API批量删除数据
      setSelectedCards([])
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
                {paginatedCards.map((card) => (
                  <TableRow key={card.id} className={getTableBorderClasses(tableBorder).row}>
                    <TableCell className={cn("w-8 p-0", getTableBorderClasses(tableBorder).cell)}>
                      <div className="flex items-center justify-center h-full">
                        <Checkbox
                          checked={selectedCards.includes(card.id)}
                          onCheckedChange={() => handleSelectCard(card.id)}
                          aria-label={`选择 ${card.name}`}
                        />
                      </div>
                    </TableCell>

                    <TableCell className={getTableBorderClasses(tableBorder).cell}>
                      <div className="font-medium">{card.name}</div>
                    </TableCell>
                    <TableCell className={getTableBorderClasses(tableBorder).cell}>
                      <div className="flex items-center gap-3">
                        <div className="font-mono text-sm">{card.cardNumber}</div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => {
                            navigator.clipboard.writeText(card.cardNumber)
                            toast.success("卡号复制成功！")
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className={getTableBorderClasses(tableBorder).cell}>
                      <span className="font-medium">{formatPoints(card.points, pointsFormat)}</span>
                    </TableCell>
                    <TableCell className={getTableBorderClasses(tableBorder).cell}>
                      <div className="text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                        {card.description}
                      </div>
                    </TableCell>
                    <TableCell className={getTableBorderClasses(tableBorder).cell}>
                      <div className={cn("inline-flex items-center rounded-md px-3 py-2 text-xs font-semibold", statusColors[card.status])}>
                        {card.status}
                      </div>
                    </TableCell>
                    <TableCell className={cn("pl-3", getTableBorderClasses(tableBorder).cell)}>
                      <div className="flex w-full items-center gap-3 rounded-md px-2 py-2">
                        <Avatar className="w-8 h-8 md:w-10 md:h-10 flex-shrink-0">
                          <AvatarImage src={card.redeemerAvatar} alt={card.redeemer || '未兑换'} />
                          <AvatarFallback className="text-base md:text-lg font-medium">
                            {card.redeemer ? card.redeemer[0] : '-'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className={cn("font-medium truncate text-left leading-tight", !card.redeemer && "text-gray-400")}>{card.redeemer || '-'}</div>
                          <div className={cn("text-sm truncate text-left leading-tight", card.redeemer ? "text-muted-foreground" : "text-gray-400")}>{card.redeemerEmail || '-'}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className={getTableBorderClasses(tableBorder).cell}>{card.createdDate}</TableCell>
                    <TableCell className={getTableBorderClasses(tableBorder).cell}>{formatRedeemedDate(card.redeemedDate)}</TableCell>
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
                ))}
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
                  defaultValue={selectedCard.cardNumber}
                  className="col-span-3"
                  readOnly
                  disabled
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cardName" className="text-right">
                  卡片名称
                </Label>
                <Input
                  id="cardName"
                  defaultValue={selectedCard.name}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="points" className="text-right">
                  积分数量
                </Label>
                <Input
                  id="points"
                  type="number"
                  defaultValue={formatPoints(selectedCard.points, pointsFormat)}
                  className="col-span-3 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                  readOnly={selectedCard.status === '已兑换'}
                  disabled={selectedCard.status === '已兑换'}
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">
                  备注
                </Label>
                <Textarea
                  id="description"
                  defaultValue={selectedCard.description}
                  placeholder="输入卡片备注"
                  className="col-span-3 min-h-[80px]"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              取消
            </Button>
            <Button type="submit">确认</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              删除无法复原，并且会影响统计。确定要删除兑换卡 &quot;{selectedCard?.name}&quot; 吗？
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