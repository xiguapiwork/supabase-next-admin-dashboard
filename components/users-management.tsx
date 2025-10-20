'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, Trash2, RotateCcw, Filter, MoreHorizontal, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
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

const users = [
  {
    id: 1,
    avatar: '/api/placeholder/32/32',
    username: '张三',
    email: 'zhangsan@example.com',
    roles: ['付费用户'],
    currentPoints: 1250,
    totalConsumedPoints: 3500,
    todayPoints: 50,
    weekPoints: 280,
    joinDate: '2024-01-15',
    lastActiveTime: '2024-03-15 14:30',
    notes: '活跃用户，经常参与活动'
  },
  {
    id: 2,
    avatar: '/api/placeholder/32/32',
    username: '李四',
    email: 'lisi@example.com',
    roles: ['付费用户'],
    currentPoints: 850,
    totalConsumedPoints: 1200,
    todayPoints: 30,
    weekPoints: 150,
    joinDate: '2024-02-20',
    lastActiveTime: '2024-03-14 09:15',
    notes: '新用户，需要关注'
  },
  {
    id: 3,
    avatar: '/api/placeholder/32/32',
    username: '王五',
    email: 'wangwu@example.com',
    roles: ['管理员'],
    currentPoints: 2100,
    totalConsumedPoints: 5800,
    todayPoints: 100,
    weekPoints: 500,
    joinDate: '2024-01-10',
    lastActiveTime: '2024-03-15 16:45',
    notes: '系统管理员'
  },
  {
    id: 4,
    avatar: '/api/placeholder/32/32',
    username: '赵六',
    email: 'zhaoliu@example.com',
    roles: ['普通用户'],
    currentPoints: 450,
    totalConsumedPoints: 900,
    todayPoints: 10,
    weekPoints: 60,
    joinDate: '2024-03-05',
    lastActiveTime: '2024-03-13 11:20',
    notes: '普通用户，使用频率较低'
  },
  {
    id: 5,
    avatar: '/api/placeholder/32/32',
    username: '钱七',
    email: 'qianqi@example.com',
    roles: ['付费用户'],
    currentPoints: 1800,
    totalConsumedPoints: 4200,
    todayPoints: 80,
    weekPoints: 320,
    joinDate: '2024-02-28',
    lastActiveTime: '2024-03-15 08:30',
    notes: '高价值用户'
  },
  {
    id: 6,
    avatar: '/api/placeholder/32/32',
    username: '孙八',
    email: 'sunba@example.com',
    roles: ['普通用户'],
    currentPoints: 320,
    totalConsumedPoints: 680,
    todayPoints: 15,
    weekPoints: 85,
    joinDate: '2024-03-01',
    lastActiveTime: '2024-03-15 10:20',
    notes: '偶尔使用，潜在付费用户'
  },
  {
    id: 7,
    avatar: '/api/placeholder/32/32',
    username: '周九',
    email: 'zhoujiu@example.com',
    roles: ['付费用户'],
    currentPoints: 2250,
    totalConsumedPoints: 6800,
    todayPoints: 120,
    weekPoints: 650,
    joinDate: '2024-01-05',
    lastActiveTime: '2024-03-15 18:15',
    notes: '超级活跃用户，VIP客户'
  },
  {
    id: 8,
    avatar: '/api/placeholder/32/32',
    username: '吴十',
    email: 'wushi@example.com',
    roles: ['普通用户'],
    currentPoints: 180,
    totalConsumedPoints: 420,
    todayPoints: 5,
    weekPoints: 35,
    joinDate: '2024-03-08',
    lastActiveTime: '2024-03-14 16:30',
    notes: '新注册用户，观察中'
  },
  {
    id: 9,
    avatar: '/api/placeholder/32/32',
    username: '郑十一',
    email: 'zhengshiyi@example.com',
    roles: ['管理员'],
    currentPoints: 1500,
    totalConsumedPoints: 3200,
    todayPoints: 60,
    weekPoints: 300,
    joinDate: '2024-01-20',
    lastActiveTime: '2024-03-15 12:45',
    notes: '技术管理员，负责系统维护'
  },
  {
    id: 10,
    avatar: '/api/placeholder/32/32',
    username: '冯十二',
    email: 'fengshier@example.com',
    roles: ['付费用户'],
    currentPoints: 980,
    totalConsumedPoints: 2100,
    todayPoints: 40,
    weekPoints: 200,
    joinDate: '2024-02-15',
    lastActiveTime: '2024-03-15 09:30',
    notes: '稳定付费用户，使用频率中等'
  },
  {
    id: 11,
    avatar: '/api/placeholder/32/32',
    username: '陈十三',
    email: 'chenshisan@example.com',
    roles: ['普通用户'],
    currentPoints: 650,
    totalConsumedPoints: 1100,
    todayPoints: 25,
    weekPoints: 120,
    joinDate: '2024-02-25',
    lastActiveTime: '2024-03-15 15:20',
    notes: '有升级付费用户的潜力'
  },
  {
    id: 12,
    avatar: '/api/placeholder/32/32',
    username: '褚十四',
    email: 'chushisi@example.com',
    roles: ['付费用户'],
    currentPoints: 1680,
    totalConsumedPoints: 4500,
    todayPoints: 75,
    weekPoints: 380,
    joinDate: '2024-01-25',
    lastActiveTime: '2024-03-15 11:10',
    notes: '长期付费用户，忠诚度高'
  },
  {
    id: 13,
    avatar: '/api/placeholder/32/32',
    username: '卫十五',
    email: 'weishiwu@example.com',
    roles: ['普通用户'],
    currentPoints: 280,
    totalConsumedPoints: 520,
    todayPoints: 8,
    weekPoints: 45,
    joinDate: '2024-03-10',
    lastActiveTime: '2024-03-14 14:50',
    notes: '刚开始使用，需要引导'
  },
  {
    id: 14,
    avatar: '/api/placeholder/32/32',
    username: '蒋十六',
    email: 'jiangshiliu@example.com',
    roles: ['付费用户'],
    currentPoints: 2800,
    totalConsumedPoints: 8200,
    todayPoints: 150,
    weekPoints: 720,
    joinDate: '2023-12-20',
    lastActiveTime: '2024-03-15 19:25',
    notes: '顶级用户，消费能力强'
  },
  {
    id: 15,
    avatar: '/api/placeholder/32/32',
    username: '沈十七',
    email: 'shenshiqi@example.com',
    roles: ['普通用户'],
    currentPoints: 420,
    totalConsumedPoints: 780,
    todayPoints: 18,
    weekPoints: 90,
    joinDate: '2024-02-28',
    lastActiveTime: '2024-03-15 13:40',
    notes: '使用频率逐渐增加'
  },
  {
    id: 16,
    avatar: '/api/placeholder/32/32',
    username: '韩十八',
    email: 'hanshiba@example.com',
    roles: ['管理员'],
    currentPoints: 1200,
    totalConsumedPoints: 2800,
    todayPoints: 45,
    weekPoints: 220,
    joinDate: '2024-01-30',
    lastActiveTime: '2024-03-15 17:15',
    notes: '客服管理员，处理用户问题'
  },
  {
    id: 17,
    avatar: '/api/placeholder/32/32',
    username: '杨十九',
    email: 'yangshijiu@example.com',
    roles: ['付费用户'],
    currentPoints: 1450,
    totalConsumedPoints: 3600,
    todayPoints: 65,
    weekPoints: 310,
    joinDate: '2024-02-05',
    lastActiveTime: '2024-03-15 08:45',
    notes: '早期付费用户，满意度高'
  },
  {
    id: 18,
    avatar: '/api/placeholder/32/32',
    username: '朱二十',
    email: 'zhuershí@example.com',
    roles: ['普通用户'],
    currentPoints: 150,
    totalConsumedPoints: 300,
    todayPoints: 3,
    weekPoints: 20,
    joinDate: '2024-03-12',
    lastActiveTime: '2024-03-14 20:10',
    notes: '新用户，刚开始探索功能'
  },
  {
    id: 19,
    avatar: '/api/placeholder/32/32',
    username: '秦二一',
    email: 'qinershiyi@example.com',
    roles: ['付费用户'],
    currentPoints: 2150,
    totalConsumedPoints: 5900,
    todayPoints: 95,
    weekPoints: 480,
    joinDate: '2024-01-12',
    lastActiveTime: '2024-03-15 16:20',
    notes: '重度使用者，功能专家'
  },
  {
    id: 20,
    avatar: '/api/placeholder/32/32',
    username: '尤二二',
    email: 'youershier@example.com',
    roles: ['普通用户'],
    currentPoints: 380,
    totalConsumedPoints: 650,
    todayPoints: 12,
    weekPoints: 68,
    joinDate: '2024-03-02',
    lastActiveTime: '2024-03-15 12:30',
    notes: '中等活跃度，有付费潜力'
  },
  {
    id: 21,
    avatar: '/api/placeholder/32/32',
    username: '许二三',
    email: 'xuershisan@example.com',
    roles: ['付费用户'],
    currentPoints: 1750,
    totalConsumedPoints: 4100,
    todayPoints: 80,
    weekPoints: 390,
    joinDate: '2024-02-10',
    lastActiveTime: '2024-03-15 14:15',
    notes: '稳定的付费用户群体'
  },
  {
    id: 22,
    avatar: '/api/placeholder/32/32',
    username: '何二四',
    email: 'heershisi@example.com',
    roles: ['普通用户'],
    currentPoints: 520,
    totalConsumedPoints: 890,
    todayPoints: 22,
    weekPoints: 105,
    joinDate: '2024-02-22',
    lastActiveTime: '2024-03-15 11:45',
    notes: '活跃度在提升，关注转化'
  },
  {
    id: 23,
    avatar: '/api/placeholder/32/32',
    username: '吕二五',
    email: 'lvershiwu@example.com',
    roles: ['管理员'],
    currentPoints: 1350,
    totalConsumedPoints: 3100,
    todayPoints: 55,
    weekPoints: 270,
    joinDate: '2024-01-18',
    lastActiveTime: '2024-03-15 15:50',
    notes: '运营管理员，负责用户增长'
  },
  {
    id: 24,
    avatar: '/api/placeholder/32/32',
    username: '施二六',
    email: 'shiershiliu@example.com',
    roles: ['付费用户'],
    currentPoints: 2400,
    totalConsumedPoints: 6500,
    todayPoints: 110,
    weekPoints: 550,
    joinDate: '2023-12-28',
    lastActiveTime: '2024-03-15 18:30',
    notes: '老用户，产品忠实粉丝'
  },
  {
    id: 25,
    avatar: '/api/placeholder/32/32',
    username: '张二七',
    email: 'zhangershiqi@example.com',
    roles: ['普通用户'],
    currentPoints: 240,
    totalConsumedPoints: 480,
    todayPoints: 6,
    weekPoints: 38,
    joinDate: '2024-03-06',
    lastActiveTime: '2024-03-14 13:25',
    notes: '使用频率较低，需要激活'
  },
  {
    id: 26,
    avatar: '/api/placeholder/32/32',
    username: '孔二八',
    email: 'kongershiba@example.com',
    roles: ['付费用户'],
    currentPoints: 1920,
    totalConsumedPoints: 4800,
    todayPoints: 85,
    weekPoints: 420,
    joinDate: '2024-01-28',
    lastActiveTime: '2024-03-15 10:40',
    notes: '高价值用户，推荐给朋友'
  },
  {
    id: 27,
    avatar: '/api/placeholder/32/32',
    username: '曹二九',
    email: 'caoershijiu@example.com',
    roles: ['普通用户'],
    currentPoints: 680,
    totalConsumedPoints: 1200,
    todayPoints: 28,
    weekPoints: 140,
    joinDate: '2024-02-18',
    lastActiveTime: '2024-03-15 16:10',
    notes: '使用体验良好，考虑升级'
  },
  {
    id: 28,
    avatar: '/api/placeholder/32/32',
    username: '严三十',
    email: 'yansanshi@example.com',
    roles: ['付费用户'],
    currentPoints: 3200,
    totalConsumedPoints: 9100,
    todayPoints: 180,
    weekPoints: 850,
    joinDate: '2023-11-15',
    lastActiveTime: '2024-03-15 19:45',
    notes: '超级用户，产品重度依赖者'
  },
  {
    id: 29,
    avatar: '/api/placeholder/32/32',
    username: '华三一',
    email: 'huasanyi@example.com',
    roles: ['普通用户'],
    currentPoints: 360,
    totalConsumedPoints: 620,
    todayPoints: 14,
    weekPoints: 72,
    joinDate: '2024-03-04',
    lastActiveTime: '2024-03-15 09:15',
    notes: '新用户适应期，需要支持'
  },
  {
    id: 30,
    avatar: '/api/placeholder/32/32',
    username: '金三二',
    email: 'jinsaner@example.com',
    roles: ['管理员'],
    currentPoints: 1600,
    totalConsumedPoints: 3800,
    todayPoints: 70,
    weekPoints: 340,
    joinDate: '2024-01-08',
    lastActiveTime: '2024-03-15 17:30',
    notes: '产品管理员，负责功能规划'
  },
  {
    id: 31,
    avatar: '/api/placeholder/32/32',
    username: '魏三三',
    email: 'weisansan@example.com',
    roles: ['付费用户'],
    currentPoints: 1580,
    totalConsumedPoints: 3900,
    todayPoints: 72,
    weekPoints: 360,
    joinDate: '2024-02-12',
    lastActiveTime: '2024-03-15 13:20',
    notes: '付费用户，使用多种功能'
  },
  {
    id: 32,
    avatar: '/api/placeholder/32/32',
    username: '陶三四',
    email: 'taosansi@example.com',
    roles: ['普通用户'],
    currentPoints: 450,
    totalConsumedPoints: 820,
    todayPoints: 19,
    weekPoints: 95,
    joinDate: '2024-02-26',
    lastActiveTime: '2024-03-15 14:40',
    notes: '逐步增加使用频率'
  },
  {
    id: 33,
    avatar: '/api/placeholder/32/32',
    username: '姜三五',
    email: 'jiangsanwu@example.com',
    roles: ['付费用户'],
    currentPoints: 2650,
    totalConsumedPoints: 7200,
    todayPoints: 125,
    weekPoints: 620,
    joinDate: '2023-12-10',
    lastActiveTime: '2024-03-15 18:50',
    notes: '长期付费用户，满意度极高'
  },
  {
    id: 34,
    avatar: '/api/placeholder/32/32',
    username: '戚三六',
    email: 'qisanliu@example.com',
    roles: ['普通用户'],
    currentPoints: 290,
    totalConsumedPoints: 550,
    todayPoints: 11,
    weekPoints: 58,
    joinDate: '2024-03-07',
    lastActiveTime: '2024-03-14 15:30',
    notes: '新用户，正在熟悉产品'
  },
  {
    id: 35,
    avatar: '/api/placeholder/32/32',
    username: '谢三七',
    email: 'xiesanqi@example.com',
    roles: ['付费用户'],
    currentPoints: 2100,
    totalConsumedPoints: 5600,
    todayPoints: 98,
    weekPoints: 490,
    joinDate: '2024-01-22',
    lastActiveTime: '2024-03-15 12:15',
    notes: '高频使用者，产品推广者'
  }
]

const roleColors: Record<string, string> = {
  '管理员': 'bg-red-100 text-red-700',
  '普通用户': 'bg-gray-200 text-gray-600',
  '付费用户': 'bg-green-100 text-green-700',
}

type UserRole = '普通用户' | '付费用户' | '管理员';
type SortField = 'currentPoints' | 'totalConsumedPoints' | 'todayPoints' | 'weekPoints' | 'joinDate' | 'lastActiveTime'
type SortOrder = 'asc' | 'desc'

export function UsersManagement() {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')
  const [sortField, setSortField] = useState<SortField>('joinDate')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<typeof users[0] | null>(null)
  // 编辑用户表单状态
  const [editFormData, setEditFormData] = useState({
    notes: '',
    pointsAdjustment: 0
  })
  const [originalFormData, setOriginalFormData] = useState({
    notes: '',
    pointsAdjustment: 0
  })
  
  // 批量选择状态
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  
  // 删除确认对话框状态
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<typeof users[0] | null>(null)

  const { pageSize, pointsFormat, tableBorder } = useAppSettings()
  const itemsPerPage = pageSize

  // 查询路由参数，决定是否显示详情页
  const router = useRouter()
  const searchParams = useSearchParams()
  const userIdParam = searchParams.get('userId')
  const detailsUser = userIdParam ? users.find(u => u.id === Number(userIdParam)) : null

  const handleBackToList = () => {
    // 使用浏览器历史后退，保留上一页面的状态（搜索、分页、排序等）
    router.back()
  }

  const handleViewDetails = (user: typeof users[0]) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('userId', String(user.id))
    router.push(`?${params.toString()}`)
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
                           user.notes.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRole = roleFilter === 'all' || user.roles.includes(roleFilter)
      return matchesSearch && matchesRole
    })
    .sort((a, b) => {
      let aValue: number | Date, bValue: number | Date
      
      switch (sortField) {
        case 'currentPoints':
          aValue = a.currentPoints
          bValue = b.currentPoints
          break
        case 'totalConsumedPoints':
          aValue = a.totalConsumedPoints
          bValue = b.totalConsumedPoints
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
          aValue = new Date(a.joinDate)
          bValue = new Date(b.joinDate)
          break
        case 'lastActiveTime':
          aValue = new Date(a.lastActiveTime)
          bValue = new Date(b.lastActiveTime)
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
      notes: user.notes,
      pointsAdjustment: 0
    }
    setEditFormData(initialData)
    setOriginalFormData(initialData)
    setIsEditDialogOpen(true)
  }

  // 检查是否有修改
  const hasChanges = editFormData.notes !== originalFormData.notes || 
                     editFormData.pointsAdjustment !== originalFormData.pointsAdjustment

  // 保存修改
  const handleSaveChanges = () => {
    // 这里应该是保存逻辑
    console.log('保存修改:', editFormData)
    toast.success("用户信息修改成功！")
    setIsEditDialogOpen(false)
  }

  // 取消修改
  const handleCancelChanges = () => {
    setEditFormData(originalFormData)
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
  const handleSelectUser = (userId: number) => {
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

  const confirmDeleteUser = (user: typeof users[0]) => {
    setUserToDelete(user)
    setIsDeleteDialogOpen(true)
  }

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
                  <TableHead className={cn("w-[9%] pl-6", getTableBorderClasses(tableBorder).headerCell)}>角色</TableHead>
                  <TableHead className={cn("w-[15%]", getTableBorderClasses(tableBorder).headerCell)}>备注</TableHead>
                  <TableHead className={cn("cursor-pointer w-[9%]", getTableBorderClasses(tableBorder).headerCell)} onClick={() => handleSort('currentPoints')}>
                    <div className="flex items-center gap-2">
                      当前积分
                      {getSortIcon('currentPoints')}
                    </div>
                  </TableHead>
                  <TableHead className={cn("cursor-pointer w-[9%]", getTableBorderClasses(tableBorder).headerCell)} onClick={() => handleSort('totalConsumedPoints')}>
                    <div className="flex items-center gap-2">
                      总消耗积分
                      {getSortIcon('totalConsumedPoints')}
                    </div>
                  </TableHead>
                  <TableHead className={cn("cursor-pointer w-[8%]", getTableBorderClasses(tableBorder).headerCell)} onClick={() => handleSort('todayPoints')}>
                    <div className="flex items-center gap-2">
                      今日消耗
                      {getSortIcon('todayPoints')}
                    </div>
                  </TableHead>
                  <TableHead className={cn("cursor-pointer w-[8%]", getTableBorderClasses(tableBorder).headerCell)} onClick={() => handleSort('weekPoints')}>
                    <div className="flex items-center gap-2">
                      7日消耗
                      {getSortIcon('weekPoints')}
                    </div>
                  </TableHead>
                  <TableHead className={cn("cursor-pointer w-[8.5%]", getTableBorderClasses(tableBorder).headerCell)} onClick={() => handleSort('joinDate')}>
                    <div className="flex items-center gap-2">
                      注册时间
                      {getSortIcon('joinDate')}
                    </div>
                  </TableHead>
                  <TableHead className={cn("cursor-pointer w-[8.5%]", getTableBorderClasses(tableBorder).headerCell)} onClick={() => handleSort('lastActiveTime')}>
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
                    <TableCell className={cn("pl-6", getTableBorderClasses(tableBorder).cell)}>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <Badge key={role} className={cn("text-xs py-1.5 hover:!bg-transparent", roleColors[role])}>
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className={cn("text-sm text-gray-600 dark:text-gray-300 max-w-32 truncate", getTableBorderClasses(tableBorder).cell)} title={user.notes}>
                      {user.notes}
                    </TableCell>
                    <TableCell className={getTableBorderClasses(tableBorder).cell}>{formatPoints(user.currentPoints, pointsFormat)}</TableCell>
                    <TableCell className={getTableBorderClasses(tableBorder).cell}>{formatPoints(user.totalConsumedPoints, pointsFormat)}</TableCell>
                    <TableCell className={getTableBorderClasses(tableBorder).cell}>{formatPoints(user.todayPoints, pointsFormat)}</TableCell>
                    <TableCell className={getTableBorderClasses(tableBorder).cell}>{formatPoints(user.weekPoints, pointsFormat)}</TableCell>
                    <TableCell className={getTableBorderClasses(tableBorder).cell}>{user.joinDate}</TableCell>
                    <TableCell className={getTableBorderClasses(tableBorder).cell}>{user.lastActiveTime.replace('2024-', '')}</TableCell>
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
                <Label htmlFor="notes" className="text-right">
                  备注
                </Label>
                <Input
                  id="notes"
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="col-span-3"
                  placeholder="输入用户备注信息..."
                />
              </div>
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