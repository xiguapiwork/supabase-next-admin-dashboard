'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAppSettings } from "@/contexts/AppSettingsContext"
import { formatPoints } from "@/lib/format-points"
import { RecentExchangeCard } from "@/components/recent-exchange-card"
import { PointsConsumptionCard } from "@/components/points-consumption-card"
import { 
  Users, 
  Activity, 
  CreditCard, 
  TrendingUp,
  UserPlus,
  Coins,
  Crown
} from 'lucide-react'
import { useState } from "react"

// 总体情况数据
const overallStats = [
  // 第一行：总用户数、总付费用户、付费率、总消耗积分
  {
    title: '总用户数',
    value: '2,847',
    change: '+12.5%',
    changeType: 'positive' as const,
    icon: Users,
    description: '较上月增长'
  },
  {
    title: '总付费用户',
    value: '1,234',
    change: '+8.3%',
    changeType: 'positive' as const,
    icon: Crown,
    description: '较上月增长'
  },
  {
    title: '付费率',
    value: '43.3%',
    change: '+2.1%',
    changeType: 'positive' as const,
    icon: TrendingUp,
    description: '较上月增长'
  },
  {
    title: '总消耗积分',
    value: '125,890',
    change: '+25.6%',
    changeType: 'positive' as const,
    icon: Coins,
    description: '较上月增长'
  },
  // 第二行：今日新注册用户、昨日新注册用户、七日注册用户、30日注册用户
  {
    title: '今日新注册用户',
    value: '31',
    change: '+24.0%',
    changeType: 'positive' as const,
    icon: UserPlus,
    description: '较昨日增长'
  },
  {
    title: '昨日新注册用户',
    value: '23',
    change: '+15.3%',
    changeType: 'positive' as const,
    icon: UserPlus,
    description: '较前日增长'
  },
  {
    title: '七日注册用户',
    value: '156',
    change: '+22.1%',
    changeType: 'positive' as const,
    icon: UserPlus,
    description: '较上周增长'
  },
  {
    title: '30日注册用户',
    value: '567',
    change: '+18.9%',
    changeType: 'positive' as const,
    icon: UserPlus,
    description: '较上月增长'
  },
  // 第三行：今日活跃用户、昨日活跃用户、七日活跃用户、30日活跃用户
  {
    title: '今日活跃用户',
    value: '245',
    change: '+18.2%',
    changeType: 'positive' as const,
    icon: Activity,
    description: '较昨日增长'
  },
  {
    title: '昨日活跃用户',
    value: '187',
    change: '+12.8%',
    changeType: 'positive' as const,
    icon: Activity,
    description: '较前日增长'
  },
  {
    title: '七日活跃用户',
    value: '1,089',
    change: '+14.6%',
    changeType: 'positive' as const,
    icon: Activity,
    description: '较上周增长'
  },
  {
    title: '30日活跃用户',
    value: '2,134',
    change: '+16.2%',
    changeType: 'positive' as const,
    icon: Activity,
    description: '较上月增长'
  },
  // 第四行：今日消耗积分、昨日消耗积分、七日消耗积分、30日消耗积分
  {
    title: '今日消耗积分',
    value: '4,123',
    change: '+21.5%',
    changeType: 'positive' as const,
    icon: Coins,
    description: '较昨日增长'
  },
  {
    title: '昨日消耗积分',
    value: '3,245',
    change: '+18.7%',
    changeType: 'positive' as const,
    icon: Coins,
    description: '较前日增长'
  },
  {
    title: '七日消耗积分',
    value: '18,567',
    change: '+19.4%',
    changeType: 'positive' as const,
    icon: Coins,
    description: '较上周增长'
  },
  {
    title: '30日消耗积分',
    value: '89,456',
    change: '+21.3%',
    changeType: 'positive' as const,
    icon: Coins,
    description: '较上月增长'
  }
]

// 用户情况数据
const userStats = [
  {
    title: '总用户情况',
    value: '0',
    change: '',
    changeType: 'positive' as const,
    icon: Users,
    description: '',
    multipleValues: [
      { label: '总用户数', value: '2,847' },
      { label: '付费用户数', value: '1,234' },
      { label: '付费率', value: '43.3%' }
    ],
    secondRowValues: [
      { label: '总用户数', value: '2,835' },
      { label: '付费用户数', value: '1,210' },
      { label: '付费率', value: '42.7%' }
    ],
    thirdRowValues: [
      { label: '总用户数', value: '2,691' },
      { label: '付费用户数', value: '1,156' },
      { label: '付费率', value: '42.9%' }
    ],
    fourthRowValues: [
      { label: '总用户数', value: '2,280' },
      { label: '付费用户数', value: '987' },
      { label: '付费率', value: '43.3%' }
    ],
    timeLabels: ['今日', '昨日', '7日', '30日']
  },
  {
    title: '活跃情况',
    value: '0',
    change: '',
    changeType: 'positive' as const,
    icon: Activity,
    description: '',
    multipleValues: [
      { label: '注册用户', value: '31' },
      { label: '活跃用户', value: '245' },
      { label: '消耗积分', value: '4,123' }
    ],
    secondRowValues: [
      { label: '注册用户', value: '23' },
      { label: '活跃用户', value: '187' },
      { label: '消耗积分', value: '3,245' }
    ],
    thirdRowValues: [
      { label: '注册用户', value: '156' },
      { label: '活跃用户', value: '1,089' },
      { label: '消耗积分', value: '18,567' }
    ],
    fourthRowValues: [
      { label: '注册用户', value: '567' },
      { label: '活跃用户', value: '2,134' },
      { label: '消耗积分', value: '89,456' }
    ],
    timeLabels: ['今日', '昨日', '7日', '30日']
  }
]

// 积分卡情况数据
const pointsCardStats = [
  {
    title: '总积分卡情况',
    value: '5',
    change: '',
    changeType: 'positive' as const,
    icon: CreditCard,
    description: '',
    multipleValues: [
      { label: '数量', value: '5' },
      { label: '积分', value: '71,500' }
    ],
    secondRowValues: [
      { label: '数量', value: '325' },
      { label: '积分', value: '45,200' }
    ],
    thirdRowValues: [
      { label: '数量', value: '175' },
      { label: '积分', value: '26,300' }
    ],
    timeLabels: ['总卡片', '已兑换', '未兑换']
  },
  {
    title: '兑换情况',
    value: '0',
    change: '',
    changeType: 'positive' as const,
    icon: TrendingUp,
    description: '',
    multipleValues: [
      { label: '兑换数量', value: '15' },
      { label: '兑换积分', value: '2,100' }
    ],
    secondRowValues: [
      { label: '兑换数量', value: '23' },
      { label: '兑换积分', value: '3,450' }
    ],
    thirdRowValues: [
      { label: '兑换数量', value: '156' },
      { label: '兑换积分', value: '18,900' }
    ],
    fourthRowValues: [
      { label: '兑换数量', value: '567' },
      { label: '兑换积分', value: '89,200' }
    ],
    timeLabels: ['今日', '昨日', '7日', '30日']
  }
]

// 使用情况数据
const logStats = [
  {
    title: '稳定情况',
    value: '0',
    change: '',
    changeType: 'positive' as const,
    icon: Activity,
    description: '',
    multipleValues: [
      { label: '使用次数', value: '1,245' },
      { label: '失败次数', value: '23' },
      { label: '成功率', value: '98.2%' }
    ],
    secondRowValues: [
      { label: '使用次数', value: '1,187' },
      { label: '失败次数', value: '31' },
      { label: '成功率', value: '97.4%' }
    ],
    thirdRowValues: [
      { label: '使用次数', value: '8,567' },
      { label: '失败次数', value: '234' },
      { label: '成功率', value: '97.3%' }
    ],
    fourthRowValues: [
      { label: '使用次数', value: '34,890' },
      { label: '失败次数', value: '1,023' },
      { label: '成功率', value: '97.1%' }
    ],
    timeLabels: ['今日', '昨日', '7日', '30日']
  },
  {
    title: '积分情况',
    value: '0',
    change: '',
    changeType: 'positive' as const,
    icon: Coins,
    description: '',
    multipleValues: [
      { label: '使用人数', value: '245' },
      { label: '使用积分', value: '4,123' },
      { label: '人均积分', value: '16.8' }
    ],
    secondRowValues: [
      { label: '使用人数', value: '187' },
      { label: '使用积分', value: '3,245' },
      { label: '人均积分', value: '17.4' }
    ],
    thirdRowValues: [
      { label: '使用人数', value: '1,089' },
      { label: '使用积分', value: '18,567' },
      { label: '人均积分', value: '17.0' }
    ],
    fourthRowValues: [
      { label: '使用人数', value: '2,134' },
      { label: '使用积分', value: '89,456' },
      { label: '人均积分', value: '41.9' }
    ],
    timeLabels: ['今日', '昨日', '7日', '30日']
  }
]

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const recentActivities = [
  {
    id: 1,
    user: '张三',
    action: '注册账户',
    time: '2分钟前',
    type: 'user'
  },
  {
    id: 2,
    user: '李四',
    action: '获得积分卡',
    time: '5分钟前',
    type: 'points'
  },
  {
    id: 3,
    user: '王五',
    action: '更新个人信息',
    time: '10分钟前',
    type: 'profile'
  },
  {
    id: 4,
    user: '赵六',
    action: '登录系统',
    time: '15分钟前',
    type: 'login'
  }
]

type TabType = 'overall' | 'users' | 'points' | 'logs'

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overall')
  const { pointsFormat } = useAppSettings()

  const formatPointsValue = (value: string) => {
    // 移除逗号并转换为数字
    const numValue = parseFloat(value.replace(/,/g, ''))
    if (isNaN(numValue)) return value
    
    // 使用积分格式化函数
    return formatPoints(numValue, pointsFormat)
  }

  // 格式化积分相关的数据值
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const formatStatValue = (value: string, isPointsRelated: boolean = false) => {
    if (!isPointsRelated) return value
    return formatPointsValue(value)
  }

  // 判断是否为积分相关的数据
  const isPointsRelatedValue = (title: string, label?: string) => {
    const pointsKeywords = ['积分', 'points', '消耗积分', '使用积分', '兑换积分']
    return pointsKeywords.some(keyword => 
      title.includes(keyword) || (label && label.includes(keyword))
    )
  }

  const tabs = [
    { id: 'overall' as TabType, label: '总体情况' },
    { id: 'users' as TabType, label: '用户情况' },
    { id: 'points' as TabType, label: '积分卡情况' },
    { id: 'logs' as TabType, label: '使用情况' }
  ]

  const getStatsForTab = (tab: TabType) => {
    switch (tab) {
      case 'overall':
        return overallStats
      case 'users':
        return userStats
      case 'points':
        return pointsCardStats
      case 'logs':
        return logStats
      default:
        return overallStats
    }
  }

  return (
    <div className="px-6 pt-1 pb-4 space-y-6">
      {/* 标签页导航 */}
      <div className="border-b dark:border-gray-600">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:border-white dark:text-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* 统计卡片 */}
      {activeTab === 'overall' ? (
        <div className="space-y-6">
          {/* 第一行卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {overallStats.slice(0, 4).map((stat, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isPointsRelatedValue(stat.title) ? formatPointsValue(stat.value) : stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className={stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}>
                      {stat.change}
                    </span>
                    {stat.description && (
                      <>
                        {' '}
                        {stat.description}
                      </>
                    )}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* 第二行卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {overallStats.slice(4, 8).map((stat, index) => (
              <Card key={index + 4}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className={stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}>
                      {stat.change}
                    </span>
                    {stat.description && (
                      <>
                        {' '}
                        {stat.description}
                      </>
                    )}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* 第三行卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {overallStats.slice(8, 12).map((stat, index) => (
              <Card key={index + 8}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className={stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}>
                      {stat.change}
                    </span>
                    {stat.description && (
                      <>
                        {' '}
                        {stat.description}
                      </>
                    )}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* 第四行卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {overallStats.slice(12, 16).map((stat, index) => (
              <Card key={index + 12}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className={stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}>
                      {stat.change}
                    </span>
                    {stat.description && (
                      <>
                        {' '}
                        {stat.description}
                      </>
                    )}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 用户情况卡片 */}
          <div className={`grid gap-6 ${(activeTab === 'points' || activeTab === 'users' || activeTab === 'logs') ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
            {getStatsForTab(activeTab).map((stat, index) => (
              <Card key={index} className={activeTab === 'points' && index === 0 ? 'md:col-span-2 lg:col-span-1' : ''}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="pt-6">
                {/* 特殊处理积分卡情况和用户情况的卡片 */}
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {((activeTab === 'points' && (index === 0 || index === 1)) || (activeTab === 'users' && (index === 0 || index === 1)) || (activeTab === 'logs' && (index === 0 || index === 1))) && (stat as any).multipleValues ? (
                  <div className="space-y-8">
                    {/* 积分卡情况和用户情况卡片特殊处理 - 带时间标签 */}
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {((activeTab === 'users' && (stat as any).timeLabels) || (activeTab === 'points' && (stat as any).timeLabels) || (activeTab === 'logs' && (stat as any).timeLabels)) ? (
                      <div className="space-y-4">
                        {/* 表头 */}
                        <div className={`grid gap-4 border-b pb-2 ${
                          activeTab === 'points' ? 'grid-cols-3' : 
                          'grid-cols-4'
                        }`}>
                          <div className="text-center">
                            {/* 第一列空 */}
                          </div>
                          {activeTab === 'points' && index === 0 ? (
                            <>
                              <div className="text-center">
                                <div className="text-sm font-semibold text-gray-700 dark:text-white">数量</div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm font-semibold text-gray-700 dark:text-white">积分</div>
                              </div>
                            </>
                          ) : activeTab === 'points' && index === 1 ? (
                            <>
                              <div className="text-center">
                                <div className="text-sm font-semibold text-gray-700 dark:text-white">兑换数量</div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm font-semibold text-gray-700 dark:text-white">兑换积分</div>
                              </div>
                            </>
                          ) : activeTab === 'logs' ? (
                            <>
                              <div className="text-center">
                                <div className="text-sm font-semibold text-gray-700 dark:text-white">
                                  {index === 0 ? '使用次数' : '使用人数'}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm font-semibold text-gray-700 dark:text-white">
                                  {index === 0 ? '失败次数' : '使用积分'}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm font-semibold text-gray-700 dark:text-white">
                                  {index === 0 ? '成功率' : '人均积分'}
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="text-center">
                                <div className="text-sm font-semibold text-gray-700 dark:text-white">
                                  {index === 0 ? '总用户数' : '注册用户'}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm font-semibold text-gray-700 dark:text-white">
                                  {index === 0 ? '付费用户数' : '活跃用户'}
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm font-semibold text-gray-700 dark:text-white">
                                  {index === 0 ? '付费率' : '消耗积分'}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                        {/* 第一行数据 */}
                        <div className={`grid gap-4 ${
                          activeTab === 'points' ? 'grid-cols-3' : 
                          'grid-cols-4'
                        }`}>
                          <div className="text-center flex items-center justify-center">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            <div className="text-sm font-bold text-blue-600 dark:text-white">{(stat as any).timeLabels[0]}</div>
                          </div>
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {(stat as any).multipleValues.map((item: any, idx: number) => (
                              <div key={idx} className="text-center">
                                <div className="text-sm font-bold text-gray-600 dark:text-gray-400">
                                  {isPointsRelatedValue(stat.title, item.label) ? formatPointsValue(item.value) : item.value}
                                </div>
                              </div>
                            ))}
                        </div>
                        {/* 第二行数据 */}
                        <div className={`grid gap-4 ${
                          activeTab === 'points' ? 'grid-cols-3' : 
                          'grid-cols-4'
                        }`}>
                          <div className="text-center flex items-center justify-center">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            <div className="text-sm font-bold text-blue-600 dark:text-white">{(stat as any).timeLabels[1]}</div>
                          </div>
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {(stat as any).secondRowValues.map((item: any, idx: number) => (
                              <div key={idx} className="text-center">
                                <div className="text-sm font-bold text-gray-600 dark:text-gray-400">
                                  {isPointsRelatedValue(stat.title, item.label) ? formatPointsValue(item.value) : item.value}
                                </div>
                              </div>
                            ))}
                        </div>
                        {/* 第三行数据 */}
                        <div className={`grid gap-4 ${
                          activeTab === 'points' ? 'grid-cols-3' : 
                          'grid-cols-4'
                        }`}>
                          <div className="text-center flex items-center justify-center">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            <div className="text-sm font-bold text-blue-600 dark:text-white">{(stat as any).timeLabels[2]}</div>
                          </div>
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {(stat as any).thirdRowValues.map((item: any, idx: number) => (
                              <div key={idx} className="text-center">
                                <div className="text-sm font-bold text-gray-600 dark:text-gray-400">
                                  {isPointsRelatedValue(stat.title, item.label) ? formatPointsValue(item.value) : item.value}
                                </div>
                              </div>
                            ))}
                        </div>
                        {/* 第四行数据 */}
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {(stat as any).fourthRowValues && (
                          <div className={`grid gap-4 ${
                            activeTab === 'points' ? 'grid-cols-3' : 
                            'grid-cols-4'
                          }`}>
                            <div className="text-center flex items-center justify-center">
                              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                              <div className="text-sm font-bold text-blue-600 dark:text-white">{(stat as any).timeLabels[3]}</div>
                            </div>
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {(stat as any).fourthRowValues.map((item: any, idx: number) => (
                                <div key={idx} className="text-center">
                                  <div className="text-sm font-bold text-gray-600 dark:text-gray-400">
                                    {isPointsRelatedValue(stat.title, item.label) ? formatPointsValue(item.value) : item.value}
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      /* 其他卡片的原有布局 */
                      <div>
                        {/* 第一行数据 */}
                        <div className="grid grid-cols-3 gap-4">
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {(stat as any).multipleValues.map((item: any, idx: number) => (
                            <div key={idx} className="text-center">
                              <div className="text-xl font-bold text-blue-600">
                                {isPointsRelatedValue(stat.title, item.label) ? formatPointsValue(item.value) : item.value}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">{item.label}</div>
                            </div>
                          ))}
                        </div>
                        {/* 第二行数据 */}
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {(stat as any).secondRowValues && (
                          <div className="grid grid-cols-3 gap-4 mt-8">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {(stat as any).secondRowValues.map((item: any, idx: number) => (
                              <div key={idx} className="text-center">
                                <div className="text-xl font-bold text-blue-600">
                                  {isPointsRelatedValue(stat.title, item.label) ? formatPointsValue(item.value) : item.value}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">{item.label}</div>
                              </div>
                            ))}
                          </div>
                        )}
                        {/* 第三行数据 - 仅用户情况页面显示 */}
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {activeTab === 'users' && (stat as any).thirdRowValues && (
                          <div className="grid grid-cols-3 gap-4 mt-8">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {(stat as any).thirdRowValues.map((item: any, idx: number) => (
                              <div key={idx} className="text-center">
                                <div className="text-xl font-bold text-blue-600">
                                  {isPointsRelatedValue(stat.title, item.label) ? formatPointsValue(item.value) : item.value}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">{item.label}</div>
                              </div>
                            ))}
                          </div>
                        )}
                        {/* 第四行数据 - 用户情况页面和积分卡看板显示 */}
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {((activeTab === 'users' && (stat as any).fourthRowValues) || (activeTab === 'points' && index === 1 && (stat as any).fourthRowValues)) && (
                          <div className={`grid gap-4 ${
                            activeTab === 'points' && index === 0 ? 'grid-cols-4' : 
                            activeTab === 'points' && index === 1 ? 'grid-cols-3' : 
                            'grid-cols-4'
                          }`}>
                            <div className="text-center flex items-center justify-center">
                              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                              <div className="text-sm font-bold text-blue-600">{(stat as any).timeLabels[3]}</div>
                            </div>
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {(stat as any).fourthRowValues.map((item: any, idx: number) => (
                              <div key={idx} className="text-center">
                                <div className="text-sm font-bold text-gray-600 dark:text-gray-300">
                                  {isPointsRelatedValue(stat.title, item.label) ? formatPointsValue(item.value) : item.value}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold">
                      {isPointsRelatedValue(stat.title) ? formatPointsValue(stat.value) : stat.value}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <span className={stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}>
                        {stat.change}
                      </span>
                      {stat.description && (
                        <>
                          {' '}
                          {stat.description}
                        </>
                      )}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
          </div>
          
          {/* 最近兑换记录和积分消耗卡片 - 仅在用户情况标签页显示 */}
          {activeTab === 'users' && (
            <div className="mt-6 flex gap-6">
              <div className="w-1/3 min-w-[400px]">
                <RecentExchangeCard />
              </div>
              <div className="w-1/3 min-w-[400px]">
                <PointsConsumptionCard />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}