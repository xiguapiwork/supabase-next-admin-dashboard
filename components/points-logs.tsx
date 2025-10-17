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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// 模拟日志数据 - 只包含积分相关操作
const logs = [
  {
    id: 1,
    timestamp: '2024-03-15 14:35:12',
    user: '刘小明',
    userEmail: 'liuxiaoming@example.com',
    action: '使用功能',
    details: '正在使用AI视频生成功能，预计消耗 120 积分',
    status: '处理中',
    ipAddress: '192.168.1.200',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    initialPoints: 500,
    pointsChange: -120,
    finalPoints: 380,
    taskId: 'PROC001Xy9Zw4Qn8Tp2'
  },
  {
    id: 2,
    timestamp: '2024-03-15 14:32:45',
    user: '王小红',
    userEmail: 'wangxiaohong@example.com',
    action: '兑换积分卡',
    details: '正在验证兑换码 PREMIUM500，预计兑换 500 积分',
    status: '处理中',
    ipAddress: '192.168.1.201',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    initialPoints: 200,
    pointsChange: 500,
    finalPoints: 700,
    taskId: 'PROC002Mn8Xv1Pr7Uq4'
  },
  {
    id: 3,
    timestamp: '2024-03-15 14:31:18',
    user: '李小华',
    userEmail: 'lixiaohua@example.com',
    action: '使用功能',
    details: '正在使用AI音乐生成功能，预计消耗 85 积分',
    status: '处理中',
    ipAddress: '192.168.1.202',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    initialPoints: 300,
    pointsChange: -85,
    finalPoints: 215,
    taskId: 'PROC003No2Yw8Qs5Vr6'
  },
  {
    id: 4,
    timestamp: '2024-03-15 14:30:25',
    user: '张三',
    userEmail: 'zhangsan@example.com',
    action: '兑换积分卡',
    details: '使用兑换码 NEWUSER100 兑换了 100 积分',
    status: '成功',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    initialPoints: 50,
    pointsChange: 100,
    finalPoints: 150
  },
  {
    id: 45,
    timestamp: '2024-03-15 14:25:12',
    user: '李四',
    userEmail: 'lisi@example.com',
    action: '使用功能',
    details: '使用AI文本生成功能，消耗 20 积分',
    status: '成功',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  },
  {
    id: 46,
    timestamp: '2024-03-15 14:20:45',
    user: '王五',
    userEmail: 'wangwu@example.com',
    action: '兑换积分卡',
    details: '尝试使用无效兑换码 INVALID123',
    status: '失败',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15'
  },
  {
    id: 41,
    timestamp: '2024-03-15 14:15:33',
    user: '赵六',
    userEmail: 'zhaoliu@example.com',
    action: '功能失败返回',
    details: 'AI图像生成失败，返还 50 积分',
    status: '成功',
    ipAddress: '192.168.1.103',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  },
  {
    id: 42,
    timestamp: '2024-03-15 14:10:18',
    user: '钱七',
    userEmail: 'qianqi@example.com',
    action: '注册',
    details: '新用户注册并获得新用户礼包 100 积分',
    status: '成功',
    ipAddress: '192.168.1.104',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    taskId: 'E2x5Lm8Zw4Qn9Tp6'
  },
  {
    id: 43,
    timestamp: '2024-03-15 14:05:55',
    user: '孙八',
    userEmail: 'sunba@example.com',
    action: '使用功能',
    details: '使用AI代码生成功能，消耗 30 积分',
    status: '成功',
    ipAddress: '192.168.1.105',
    userAgent: 'Mozilla/5.0 (Android 14; Mobile; rv:109.0) Gecko/109.0 Firefox/115.0',
    taskId: 'F8y3Mn6Xv1Pr5Uq7'
  },
  {
    id: 44,
    timestamp: '2024-03-15 14:00:42',
    user: '周九',
    userEmail: 'zhoujiu@example.com',
    action: '兑换积分卡',
    details: '使用兑换码 MONTHLY500 兑换了 500 积分',
    status: '成功',
    ipAddress: '192.168.1.106',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    taskId: 'G4z7No2Yw8Qs3Vr9'
  },
  {
    id: 47,
    timestamp: '2024-03-15 13:55:29',
    user: '吴十',
    userEmail: 'wushi@example.com',
    action: '功能失败返回',
    details: 'AI翻译功能超时失败，返还 15 积分',
    status: '成功',
    ipAddress: '192.168.1.107',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    taskId: 'H1a9Op5Zx4Rt6Ws2'
  },
  {
    id: 9,
    timestamp: '2024-03-15 13:50:15',
    user: '郑十一',
    userEmail: 'zhengshiyi@example.com',
    action: '注册',
    details: '新用户注册并获得推荐奖励 50 积分',
    status: '成功',
    ipAddress: '192.168.1.108',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    taskId: 'I5b3Pq8Zy7Su9Xt4'
  },
  {
    id: 10,
    timestamp: '2024-03-15 13:45:33',
    user: '冯十二',
    userEmail: 'fengshier@example.com',
    action: '使用功能',
    details: '使用AI语音合成功能，消耗 25 积分',
    status: '成功',
    ipAddress: '192.168.1.109',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    taskId: 'J9c6Qr1Az3Tv8Yu5'
  },
  {
    id: 11,
    timestamp: '2024-03-15 13:40:22',
    user: '褚十三',
    userEmail: 'chushisan@example.com',
    action: '兑换积分卡',
    details: '使用兑换码 BIRTHDAY300 兑换了 300 积分',
    status: '成功',
    ipAddress: '192.168.1.110',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    taskId: 'K2d4Rs7By9Uw1Zv6'
  },
  {
    id: 12,
    timestamp: '2024-03-15 13:35:18',
    user: '卫十四',
    userEmail: 'weishisi@example.com',
    action: '使用功能',
    details: '使用AI视频生成功能，消耗 100 积分',
    status: '成功',
    ipAddress: '192.168.1.111',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    taskId: 'L6e8St2Cz5Vx4Aw7'
  },
  {
    id: 13,
    timestamp: '2024-03-15 13:30:45',
    user: '蒋十五',
    userEmail: 'jiangshiwu@example.com',
    action: '功能失败返回',
    details: 'AI音乐生成失败，返还 80 积分',
    status: '成功',
    ipAddress: '192.168.1.112',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    taskId: 'M3f1Tu6Dy8Wy2Bx9'
  },
  {
    id: 14,
    timestamp: '2024-03-15 13:25:33',
    user: '沈十六',
    userEmail: 'shenshiliu@example.com',
    action: '兑换积分卡',
    details: '尝试使用过期兑换码 EXPIRED456',
    status: '失败',
    ipAddress: '192.168.1.113',
    userAgent: 'Mozilla/5.0 (Android 14; Mobile; rv:109.0) Gecko/109.0 Firefox/115.0',
    taskId: 'N7g5Uv9Ez4Xz6Cy3'
  },
  {
    id: 15,
    timestamp: '2024-03-15 13:20:12',
    user: '韩十七',
    userEmail: 'hanshiqi@example.com',
    action: '注册',
    details: '新用户注册并获得邀请奖励 150 积分',
    status: '成功',
    ipAddress: '192.168.1.114',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    taskId: 'O4h2Vw7Fa1Ya9Dz5'
  },
  {
    id: 16,
    timestamp: '2024-03-15 13:15:28',
    user: '杨十八',
    userEmail: 'yangshiba@example.com',
    action: '使用功能',
    details: '使用AI数据分析功能，消耗 60 积分',
    status: '成功',
    ipAddress: '192.168.1.115',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    taskId: 'P8i6Wx3Gb5Zb2Ea7'
  },
  {
    id: 17,
    timestamp: '2024-03-15 13:10:55',
    user: '朱十九',
    userEmail: 'zhushijiu@example.com',
    action: '兑换积分卡',
    details: '使用兑换码 ANNIVERSARY800 兑换了 800 积分',
    status: '成功',
    ipAddress: '192.168.1.116',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    taskId: 'Q1j9Xy4Hc8Ac6Fb3'
  },
  {
    id: 18,
    timestamp: '2024-03-15 13:05:42',
    user: '秦二十',
    userEmail: 'qinershi@example.com',
    action: '功能失败返回',
    details: 'AI设计功能网络错误，返还 40 积分',
    status: '成功',
    ipAddress: '192.168.1.117',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    taskId: 'R5k2Yz7Id3Bd9Gc4'
  },
  {
    id: 19,
    timestamp: '2024-03-15 13:00:18',
    user: '尤二一',
    userEmail: 'youershiyi@example.com',
    action: '使用功能',
    details: '使用AI写作助手功能，消耗 35 积分',
    status: '成功',
    ipAddress: '192.168.1.118',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    taskId: 'S9l6Za1Je7Ce2Hd8'
  },
  {
    id: 20,
    timestamp: '2024-03-15 12:55:33',
    user: '许二二',
    userEmail: 'xuershier@example.com',
    action: '兑换积分卡',
    details: '使用兑换码 TASK120 兑换了 120 积分',
    status: '成功',
    ipAddress: '192.168.1.119',
    userAgent: 'Mozilla/5.0 (Android 14; Mobile; rv:109.0) Gecko/109.0 Firefox/115.0',
    taskId: 'T3m4Ab5Kf9Df6Ie1'
  },
  {
    id: 21,
    timestamp: '2024-03-15 12:50:45',
    user: '何二三',
    userEmail: 'heersan@example.com',
    action: '注册',
    details: '新用户注册并获得签到奖励 50 积分',
    status: '成功',
    ipAddress: '192.168.1.120',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    taskId: 'U7n8Bc2Lg4Eg9Jf5'
  },
  {
    id: 22,
    timestamp: '2024-03-15 12:45:22',
    user: '吕二四',
    userEmail: 'lveersi@example.com',
    action: '使用功能',
    details: '使用AI问答功能，消耗 10 积分',
    status: '成功',
    ipAddress: '192.168.1.121',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    taskId: 'V2o1Cd6Mh8Fh3Kg7'
  },
  {
    id: 23,
    timestamp: '2024-03-15 12:40:18',
    user: '施二五',
    userEmail: 'shierwu@example.com',
    action: '兑换积分卡',
    details: '尝试使用已使用兑换码 USED789',
    status: '失败',
    ipAddress: '192.168.1.122',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    taskId: 'W6p5De9Ni2Gi7Lh4'
  },
  {
    id: 24,
    timestamp: '2024-03-15 12:35:55',
    user: '张二六',
    userEmail: 'zhangerliu@example.com',
    action: '功能失败返回',
    details: 'AI摘要功能处理超时，返还 20 积分',
    status: '成功',
    ipAddress: '192.168.1.123',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    taskId: 'X9q3Ef7Oj6Hj1Mi8'
  },
  {
    id: 25,
    timestamp: '2024-03-15 12:30:42',
    user: '孔二七',
    userEmail: 'kongerqi@example.com',
    action: '使用功能',
    details: '使用AI绘画功能，消耗 70 积分',
    status: '成功',
    ipAddress: '192.168.1.124',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    taskId: 'Y4r7Fg1Pk9Ik5Nj2'
  },
  {
    id: 26,
    timestamp: '2024-03-15 12:25:28',
    user: '曹二八',
    userEmail: 'caoerba@example.com',
    action: '兑换积分卡',
    details: '使用兑换码 INVITE250 兑换了 250 积分',
    status: '成功',
    ipAddress: '192.168.1.125',
    userAgent: 'Mozilla/5.0 (Android 14; Mobile; rv:109.0) Gecko/109.0 Firefox/115.0',
    taskId: 'Z8s2Gh5Ql3Jl9Ok6'
  },
  {
    id: 27,
    timestamp: '2024-03-15 12:20:15',
    user: '严二九',
    userEmail: 'yanerjiu@example.com',
    action: '注册',
    details: '新用户注册并获得评价奖励 80 积分',
    status: '成功',
    ipAddress: '192.168.1.126',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    taskId: 'A1t6Hi9Rm7Km2Pl4'
  },
  {
    id: 28,
    timestamp: '2024-03-15 12:15:33',
    user: '华三十',
    userEmail: 'huasanshi@example.com',
    action: '使用功能',
    details: '使用AI编程助手功能，消耗 45 积分',
    status: '成功',
    ipAddress: '192.168.1.127',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    taskId: 'B5u4Ij2Sn1Ln6Qm8'
  },
  {
    id: 29,
    timestamp: '2024-03-15 12:10:45',
    user: '金三一',
    userEmail: 'jinsanyi@example.com',
    action: '功能失败返回',
    details: 'AI对话功能服务异常，返还 30 积分',
    status: '成功',
    ipAddress: '192.168.1.128',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    taskId: 'C9v8Jk6To5Mo9Rn3'
  },
  {
    id: 30,
    timestamp: '2024-03-15 12:05:22',
    user: '魏三二',
    userEmail: 'weisaner@example.com',
    action: '兑换积分卡',
    details: '使用兑换码 SHARE60 兑换了 60 积分',
    status: '成功',
    ipAddress: '192.168.1.129',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    taskId: 'D3w1Kl9Up8Np2So7'
  },
  {
    id: 31,
    timestamp: '2024-03-15 12:00:18',
    user: '陶三三',
    userEmail: 'taosansan@example.com',
    action: '使用功能',
    details: '使用AI表格生成功能，消耗 25 积分',
    status: '成功',
    ipAddress: '192.168.1.130',
    userAgent: 'Mozilla/5.0 (Android 14; Mobile; rv:109.0) Gecko/109.0 Firefox/115.0',
    taskId: 'E7x5Lm3Vq2Oq6Tp1'
  },
  {
    id: 32,
    timestamp: '2024-03-15 11:55:55',
    user: '姜三四',
    userEmail: 'jiangsansi@example.com',
    action: '兑换积分卡',
    details: '使用兑换码 RECHARGE400 兑换了 400 积分',
    status: '成功',
    ipAddress: '192.168.1.131',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    taskId: 'F2y9Mn7Wr6Pr9Uq5'
  },
  {
    id: 33,
    timestamp: '2024-03-15 11:50:42',
    user: '戚三五',
    userEmail: 'qisanwu@example.com',
    action: '注册',
    details: '新用户注册并获得活动参与奖励 180 积分',
    status: '成功',
    ipAddress: '192.168.1.132',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    taskId: 'G6z4No1Xs9Qs3Vr8'
  },
  {
    id: 34,
    timestamp: '2024-03-15 11:45:28',
    user: '谢三六',
    userEmail: 'xiesanliu@example.com',
    action: '功能失败返回',
    details: 'AI翻译功能语言不支持，返还 15 积分',
    status: '成功',
    ipAddress: '192.168.1.133',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    taskId: 'H1a8Op5Yt3Rt7Ws2'
  },
  {
    id: 35,
    timestamp: '2024-03-15 11:40:15',
    user: '邹三七',
    userEmail: 'zousanqi@example.com',
    action: '使用功能',
    details: '使用AI学习助手功能，消耗 90 积分',
    status: '成功',
    ipAddress: '192.168.1.134',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    taskId: 'I5b3Pq9Zu7Su1Xt6'
  },
  {
    id: 36,
    timestamp: '2024-03-15 11:35:33',
    user: '窦三八',
    userEmail: 'dousanba@example.com',
    action: '兑换积分卡',
    details: '使用兑换码 COMMUNITY220 兑换了 220 积分',
    status: '成功',
    ipAddress: '192.168.1.135',
    userAgent: 'Mozilla/5.0 (Android 14; Mobile; rv:109.0) Gecko/109.0 Firefox/115.0',
    taskId: 'J9c7Qr2Av1Tv5Yu9'
  },
  {
    id: 37,
    timestamp: '2024-03-15 11:30:45',
    user: '章三九',
    userEmail: 'zhangsanjiu@example.com',
    action: '使用功能',
    details: '使用AI营销文案功能，消耗 55 积分',
    status: '成功',
    ipAddress: '192.168.1.136',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    taskId: 'K4d1Rs6Bw5Uw9Zv3'
  },
  {
    id: 38,
    timestamp: '2024-03-15 11:25:22',
    user: '云四十',
    userEmail: 'yunsishi@example.com',
    action: '兑换积分卡',
    details: '尝试使用格式错误兑换码 WRONG',
    status: '失败',
    ipAddress: '192.168.1.137',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    taskId: 'L8e5St9Cx3Vx2Aw7'
  },
  {
    id: 39,
    timestamp: '2024-03-15 11:20:18',
    user: '苏四一',
    userEmail: 'susiyi@example.com',
    action: '功能失败返回',
    details: 'AI创意写作功能内容审核失败，返还 65 积分',
    status: '成功',
    ipAddress: '192.168.1.138',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    taskId: 'M3f2Tu4Dy7Wy6Bx1'
  },
  {
    id: 40,
    timestamp: '2024-03-15 11:15:55',
    user: '潘四二',
    userEmail: 'pansier@example.com',
    action: '注册',
    details: '新用户注册并获得年度总结奖励 1000 积分',
    status: '成功',
    ipAddress: '192.168.1.139',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    taskId: 'N7g6Uv8Ez1Xz9Cy5'
  }
]

// 删除未使用的变量
// const statusColors: Record<string, string> = {
//   '成功': 'bg-green-100 text-green-700',
//   '失败': 'bg-red-100 text-red-700',
//   '处理中': 'bg-yellow-100 text-yellow-700',
// }

// const statusIcons: Record<string, React.ReactNode> = {
//   '成功': <CheckCircle className="h-4 w-4" />,
//   '失败': <XCircle className="h-4 w-4" />,
//   '处理中': <Clock className="h-4 w-4" />,
// }

type LogStatus = '成功' | '失败' | '处理中' | 'all';
type SortField = 'timestamp' | 'user' | 'action' | 'status'
type SortOrder = 'asc' | 'desc'

export function PointsLogs() {
  const { pointsFormat, tableBorder } = useAppSettings()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<LogStatus>('all')
  const [actionFilter, setActionFilter] = useState('all')
  const [sortField, setSortField] = useState<SortField>('timestamp')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  
  // 导出功能状态
  // const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  
  // 批量选择状态
  const [selectedLogs, setSelectedLogs] = useState<number[]>([])
  const [isBatchDeleteDialogOpen, setIsBatchDeleteDialogOpen] = useState(false)
  
  // 单个记录操作状态
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedLogId, setSelectedLogId] = useState<number | null>(null)

  const { pageSize } = useAppSettings()
  const itemsPerPage = pageSize

  // 筛选和排序逻辑
  const filteredAndSortedLogs = logs
    .filter(log => {
      const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           log.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           log.taskId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           log.action.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || log.status === statusFilter
      const matchesAction = actionFilter === 'all' || log.action === actionFilter
      return matchesSearch && matchesStatus && matchesAction
    })
    .sort((a, b) => {
      let aValue: string | number = a[sortField]
      let bValue: string | number = b[sortField]
      
      if (sortField === 'timestamp') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

  const totalPages = Math.ceil(filteredAndSortedLogs.length / itemsPerPage)
  const paginatedLogs = filteredAndSortedLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />
    }
    return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

  const getUniqueActions = () => {
    const actions = logs.map(log => log.action)
    return [...new Set(actions)]
  }

  const handleReset = () => {
    setSearchTerm('')
    setStatusFilter('all')
    setActionFilter('all')
    setSortField('timestamp')
    setSortOrder('desc')
    setCurrentPage(1)
    toast.success("页面排序已重置")
  }

  const handleSelectLog = (logId: number) => {
    setSelectedLogs(prev => 
      prev.includes(logId) 
        ? prev.filter(id => id !== logId)
        : [...prev, logId]
    )
  }

  const handleSelectAll = () => {
    if (selectedLogs.length === paginatedLogs.length) {
      setSelectedLogs([])
    } else {
      setSelectedLogs(paginatedLogs.map(log => log.id))
    }
  }

  const handleBatchDelete = () => {
    if (selectedLogs.length > 0) {
      setIsBatchDeleteDialogOpen(true)
    }
  }

  // 单个记录操作处理函数
  const handleEditLog = (logId: number) => {
    setSelectedLogId(logId)
    setIsEditDialogOpen(true)
  }

  const handleDeleteLog = (logId: number) => {
    setSelectedLogId(logId)
    setIsDeleteDialogOpen(true)
  }

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
            <Select value={statusFilter} onValueChange={(value: LogStatus) => setStatusFilter(value)}>
              <SelectTrigger className="w-[120px]">
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
                    checked={selectedLogs.length === paginatedLogs.length && paginatedLogs.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </div>
              </TableHead>
              <TableHead
                className={cn("w-[10%] cursor-pointer hover:bg-gray-50 transition-colors pl-3", getTableBorderClasses(tableBorder).headerCell)}
                onClick={() => handleSort('timestamp')}
              >
                <div className="flex items-center gap-2">
                  使用时间
                  {getSortIcon('timestamp')}
                </div>
              </TableHead>
              <TableHead className={cn("w-[18%]", getTableBorderClasses(tableBorder).headerCell)}>操作用户</TableHead>
              <TableHead className={cn("w-[10%]", getTableBorderClasses(tableBorder).headerCell)}>使用功能</TableHead>
              <TableHead className={cn("w-[7%]", getTableBorderClasses(tableBorder).headerCell)}>状态</TableHead>
              <TableHead className={cn("w-[11%]", getTableBorderClasses(tableBorder).headerCell)}>使用详情</TableHead>
              <TableHead className={cn("w-[8%] text-center", getTableBorderClasses(tableBorder).headerCell)}>初始积分</TableHead>
              <TableHead className={cn("w-[8%] text-center", getTableBorderClasses(tableBorder).headerCell)}>变动积分</TableHead>
              <TableHead className={cn("w-[8%] text-center", getTableBorderClasses(tableBorder).headerCell)}>最终积分</TableHead>
              <TableHead className={cn("w-[16%] text-center", getTableBorderClasses(tableBorder).headerCell)}>任务ID</TableHead>
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
                          onCheckedChange={() => handleSelectLog(log.id)}
                          aria-label={`选择日志 ${log.id}`}
                        />
                      </div>
                    </TableCell>
                    <TableCell className={cn("text-sm pl-3", getTableBorderClasses(tableBorder).cell)}>
                      {new Date(log.timestamp).toLocaleString('zh-CN', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </TableCell>
                    <TableCell className={cn("", getTableBorderClasses(tableBorder).cell)}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-medium">{log.user[0]}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">{log.user}</div>
                          <div className="text-sm text-gray-500 truncate">{log.userEmail}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className={cn("", getTableBorderClasses(tableBorder).cell)}>
                      <span className="font-medium">{log.action}</span>
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
                      {log.details}
                    </TableCell>
                    <TableCell className={cn("text-center", getTableBorderClasses(tableBorder).cell)}>
                      <span className="text-sm font-medium">{formatPoints(log.initialPoints || 0, pointsFormat)}</span>
                    </TableCell>
                    <TableCell className={cn("text-center", getTableBorderClasses(tableBorder).cell)}>
                      <span className={cn(
                        "text-sm font-medium",
                        (log.pointsChange || 0) > 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {(log.pointsChange || 0) > 0 ? '+' : ''}{formatPoints(Math.abs(log.pointsChange || 0), pointsFormat)}
                      </span>
                    </TableCell>
                    <TableCell className={cn("text-center", getTableBorderClasses(tableBorder).cell)}>
                      <span className="text-sm font-medium">{formatPoints(log.finalPoints || 0, pointsFormat)}</span>
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
                    <TableCell className="text-center p-0">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditLog(log.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            编辑记录
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteLog(log.id)}
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
            <div>
              <label className="text-sm font-medium">状态</label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="成功">成功</SelectItem>
                  <SelectItem value="失败">失败</SelectItem>
                  <SelectItem value="处理中">处理中</SelectItem>
                </SelectContent>
              </Select>
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