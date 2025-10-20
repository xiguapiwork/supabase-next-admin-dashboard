'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ToggleGroupCustom } from '@/components/ui/toggle-group-custom'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAppSettings } from '@/contexts/AppSettingsContext'
import type { TableBorderType, CardCountType } from '@/contexts/AppSettingsContext'
import { toast } from 'sonner'
import { ApiKeyCard } from '@/components/api-key-card'
import { AddApiKeyCard } from '@/components/add-api-key-card'
import { TemplateCard } from '@/components/template-card'
import { CommonVariableCard } from '@/components/common-variable-card'
import { AddCommonVariableCard } from '@/components/add-common-variable-card'
import { AddTemplateCard } from '@/components/add-template-card'
import { MasonryLayout } from '@/components/masonry-layout'

type SettingTabType = 'apikey' | 'variables' | 'display' | 'deduction' | 'cleanup'

interface ApiKeyData {
  id: string
  title: string
  key: string
  provider: string
  isNew?: boolean
}

interface FeatureItem {
  id: string
  name: string
  value: number
}

interface TemplateData {
  id: string
  title: string
  description: string
  features: FeatureItem[]
  isNew?: boolean
}

interface CommonVariableData {
  id: string
  title: string
  value: string
  isNew?: boolean
}

export function Setting() {
  // 标签页状态
  const [activeTab, setActiveTab] = useState<SettingTabType>('apikey')

  // API Key 管理状态
  const [apiKeys, setApiKeys] = useState<ApiKeyData[]>([
    {
      id: '1',
      title: 'Openrouter',
      key: 'sk-1234567890abcdef1234567890abcdef',
      provider: 'openrouter'
    }
  ])

  // 模版管理状态
  const [templates, setTemplates] = useState<TemplateData[]>([
    {
      id: 'template-1',
      title: '基础功能',
      description: '通用基础功能',
      features: [
        { id: 'feature1', name: '新用户注册', value: 0 }
      ]
    },
    {
      id: 'template-2', 
      title: '测试数据',
      description: '测试功能',
      features: [
        { id: 'feature1', name: '1', value: 0 },
        { id: 'feature2', name: '2', value: 0 },
        { id: 'feature3', name: '3', value: 0 }
      ]
    },
    {
      id: 'template-3',
      title: '请输入名称',
      description: '请输入备注',
      features: [
        { id: 'feature1', name: '请输入名称', value: 0 }
      ]
    }
  ])

  // 常用变量管理状态
  const [commonVariables, setCommonVariables] = useState<CommonVariableData[]>([
    {
      id: 'var-1',
      title: '示例变量',
      value: '示例值'
    }
  ])

  // API Key 管理函数
  const handleAddApiKey = () => {
    const newApiKey: ApiKeyData = {
      id: Date.now().toString(),
      title: '',
      key: '',
      provider: 'openrouter',
      isNew: true
    }
    setApiKeys(prev => [...prev, newApiKey])
  }

  const handleUpdateApiKey = (id: string, key: string, provider: string, title?: string) => {
    setApiKeys(prev => prev.map(item => 
      item.id === id ? { ...item, key, provider, title: title || item.title, isNew: false } : item
    ))
  }

  const handleDeleteApiKey = (id: string) => {
    setApiKeys(prev => prev.filter(item => item.id !== id))
  }

  // 模版管理函数
  const handleAddTemplate = () => {
    const newTemplate: TemplateData = {
      id: `template-${Date.now()}`,
      title: '',
      description: '',
      features: [
        { id: 'feature1', name: '', value: 0 }
      ],
      isNew: true
    }
    setTemplates(prev => [...prev, newTemplate])
  }

  const handleUpdateTemplate = (template: TemplateData) => {
    setTemplates(prev => prev.map(item => 
      item.id === template.id ? template : item
    ))
  }

  const handleDeleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(item => item.id !== id))
  }

  // 常用变量管理函数
  const handleAddCommonVariable = () => {
    const newVariable: CommonVariableData = {
      id: `variable-${Date.now()}`,
      title: '',
      value: '',
      isNew: true
    }
    setCommonVariables(prev => [...prev, newVariable])
  }

  const handleUpdateCommonVariable = (id: string, value: string, title?: string) => {
    setCommonVariables(prev => prev.map(item => 
      item.id === id ? { ...item, value, title: title || item.title, isNew: false } : item
    ))
  }

  const handleDeleteCommonVariable = (id: string) => {
    setCommonVariables(prev => prev.filter(item => item.id !== id))
  }

  // 输入归一化：支持中文输入法下的全角数字与小数点转换
  const normalizeNumericInput = (
    raw: string,
    options: { allowDecimal?: boolean; allowNegative?: boolean } = { allowDecimal: true, allowNegative: false }
  ) => {
    const { allowDecimal = true, allowNegative = false } = options
    // 将全角数字转半角
    const toHalfWidthDigits = (s: string) => s.replace(/[０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xFF10 + 48))
    let v = raw
    // 常见全角/中文句号替换为 '.'
    v = v.replace(/[．。｡]/g, '.')
    // 各种横线替换为 '-'
    v = v.replace(/[－—–−]/g, '-')
    // 转半角数字
    v = toHalfWidthDigits(v)
    // 过滤允许字符
    const allowed = allowDecimal ? '0-9\\.' : '0-9'
    const minus = allowNegative ? '-' : ''
    v = v.replace(new RegExp(`[^${allowed}${minus}]`, 'g'), '')
    // 仅允许一个小数点
    if (allowDecimal) {
      const parts = v.split('.')
      if (parts.length > 2) {
        v = parts[0] + '.' + parts.slice(1).join('')
      }
    } else {
      v = v.replace(/\./g, '')
    }
    // 负号只允许前置且最多一个
    if (allowNegative) {
      const hasMinus = v.includes('-')
      v = v.replace(/-/g, '')
      if (hasMinus) v = '-' + v
    } else {
      v = v.replace(/-/g, '')
    }
    return v
  }
  // API Key - 保存与草稿
  // const [apiKeySaved, setApiKeySaved] = useState('')
  // const [apiKeyDraft, setApiKeyDraft] = useState('')

  // 显示设置 - 分页数量（使用全局设置作为已保存值），草稿允许空值
  const { pageSize, setPageSize, pointsFormat, setPointsFormat, tableBorder, setTableBorder, cardCount, setCardCount } = useAppSettings()
  const [pageSizeDraft, setPageSizeDraft] = useState<string>(String(pageSize))
  const [pointsFormatDraft, setPointsFormatDraft] = useState<'integer' | 'decimal'>(pointsFormat)
  const [tableBorderDraft, setTableBorderDraft] = useState<TableBorderType>('horizontal')
  const [cardCountDraft, setCardCountDraft] = useState<CardCountType>(cardCount)



  // 清除数据功能状态
  const [isCleanupDialogOpen, setIsCleanupDialogOpen] = useState(false)
  const [cleanupType, setCleanupType] = useState<'users' | 'cards' | 'logs' | null>(null)
  const [cleanupSettings, setCleanupSettings] = useState({
    userDays: '180',
    userPointsLimit: '0',
    cardDays: '90',
    cardStatus: 'redeemed', // 'all' | 'redeemed'
    logDays: '90'
  })

  // 初始化从本地存储读取已保存的 API Key
  useEffect(() => {
    try {
      // const savedApiKey = localStorage.getItem('appSettings.apiKey') || ''
      // setApiKeySaved(savedApiKey)
      // setApiKeyDraft(savedApiKey)
    } catch {}
  }, [])

  // 当全局 pageSize 更新时，同步草稿初始值
  useEffect(() => {
    setPageSizeDraft(String(pageSize))
  }, [pageSize])

  // 当全局 pointsFormat 更新时，同步草稿初始值
  useEffect(() => {
    setPointsFormatDraft(pointsFormat)
  }, [pointsFormat])

  // 当全局 tableBorder 更新时，同步草稿初始值
  useEffect(() => {
    setTableBorderDraft(tableBorder)
  }, [tableBorder])

  // 当全局 cardCount 更新时，同步草稿初始值
  useEffect(() => {
    setCardCountDraft(cardCount)
  }, [cardCount])

  // 变化状态判断
  // const isApiChanged = apiKeyDraft !== apiKeySaved // 未使用，已注释
  const isPageSizeChanged = pageSizeDraft !== String(pageSize)
  const isPageSizeValid = (() => {
    const v = parseInt(pageSizeDraft, 10)
    return pageSizeDraft.trim() !== '' && Number.isFinite(v) && v > 0
  })()
  const isPointsFormatChanged = pointsFormatDraft !== pointsFormat
  const isTableBorderChanged = tableBorderDraft !== tableBorder
  const isCardCountChanged = cardCountDraft !== cardCount
  const isDisplaySettingsChanged = isPageSizeChanged || isPointsFormatChanged || isTableBorderChanged || isCardCountChanged
  const isDisplaySettingsValid = isPageSizeValid

  // 保存与取消操作 - 未使用的函数已注释
  // const handleSaveApiKey = () => {
  //   try {
  //     localStorage.setItem('appSettings.apiKey', apiKeyDraft)
  //     setApiKeySaved(apiKeyDraft)
  //   } catch {}
  // }

  // const handleCancelApiKey = () => {
  //   setApiKeyDraft(apiKeySaved)
  // }

  // 删除未使用的函数
  // const handleSavePageSize = () => {
  //   const v = parseInt(pageSizeDraft, 10)
  //   if (!Number.isFinite(v) || v <= 0) return
  //   setPageSize(v)
  // }

  // const handleCancelPageSize = () => {
  //   setPageSizeDraft(String(pageSize))
  // }

  // const handleSavePointsFormat = () => {
  //   setPointsFormat(pointsFormatDraft)
  //   toast.success('积分显示格式已保存')
  // }

  // const handleCancelPointsFormat = () => {
  //   setPointsFormatDraft(pointsFormat)
  // }

  // 统一的显示设置保存和取消函数
  const handleSaveDisplaySettings = () => {
    if (isPageSizeChanged && isPageSizeValid) {
      const v = parseInt(pageSizeDraft, 10)
      setPageSize(v)
    }
    if (isPointsFormatChanged) {
      setPointsFormat(pointsFormatDraft)
    }
    if (isTableBorderChanged) {
      setTableBorder(tableBorderDraft)
    }
    if (isCardCountChanged) {
      setCardCount(cardCountDraft)
    }
    toast.success('显示设置已保存')
  }

  const handleCancelDisplaySettings = () => {
    setPageSizeDraft(String(pageSize))
    setPointsFormatDraft(pointsFormat)
    setTableBorderDraft(tableBorder)
    setCardCountDraft(cardCount)
  }

  // 清除数据功能处理函数
  const handleCleanupConfirm = (type: 'users' | 'cards' | 'logs') => {
    setCleanupType(type)
    setIsCleanupDialogOpen(true)
  }

  const handleCleanupExecute = async () => {
    if (!cleanupType) return

    try {
      // 模拟清除操作
      let message = ''
      switch (cleanupType) {
        case 'users':
          message = `已清除 ${cleanupSettings.userDays} 天未登录且积分 ≤ ${cleanupSettings.userPointsLimit} 的用户`
          break
        case 'cards':
          const cardStatusText = cleanupSettings.cardStatus === 'all' ? '所有状态' : '已兑换'
          message = `已清除 ${cleanupSettings.cardDays} 天前创建且状态为${cardStatusText}的兑换卡`
          break
        case 'logs':
          message = `已清除 ${cleanupSettings.logDays} 天前的积分日志记录`
          break
      }
      
      // 这里应该调用实际的API
      console.log(`执行清除操作: ${cleanupType}`, cleanupSettings)
      
      toast.success(message)
      setIsCleanupDialogOpen(false)
      setCleanupType(null)
    } catch {
      toast.error('清除操作失败，请重试')
    }
  }

  // 标签页配置
  const tabs = [
    { id: 'apikey' as SettingTabType, label: 'API Key 设置' },
    { id: 'variables' as SettingTabType, label: '常用变量' },
    { id: 'display' as SettingTabType, label: '显示设置' },
    { id: 'deduction' as SettingTabType, label: '功能设置' },
    { id: 'cleanup' as SettingTabType, label: '清除数据' }
  ]

  // 渲染标签页内容
  const renderTabContent = () => {
    switch (activeTab) {
      case 'apikey':
        return (
          <div className="space-y-6">
            {/* API Key 卡片列表 */}
            <div className="w-full px-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4 w-full">
                {/* 现有 API Key 卡片 */}
                {apiKeys.map((apiKey) => (
                  <ApiKeyCard
                    key={apiKey.id}
                    id={apiKey.id}
                    title={apiKey.title}
                    apiKey={apiKey.key}
                    provider={apiKey.provider}
                    onUpdate={handleUpdateApiKey}
                    onDelete={handleDeleteApiKey}
                    isNew={apiKey.isNew}
                  />
                ))}
                
                {/* 添加 API Key 卡片 */}
                <AddApiKeyCard onClick={handleAddApiKey} />
              </div>
            </div>

            {/* 空状态 */}
            {apiKeys.length === 0 && (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground text-sm">
                  还没有添加任何 API Key，点击上方卡片开始添加
                </p>
              </div>
            )}
          </div>
        )

      case 'variables':
        return (
          <div className="space-y-6">
            {/* 常用变量卡片列表 */}
            <div className="w-full px-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4 w-full">
                {/* 现有常用变量卡片 */}
                {commonVariables.map((variable) => (
                  <CommonVariableCard
                    key={variable.id}
                    id={variable.id}
                    title={variable.title}
                    value={variable.value}
                    onUpdate={handleUpdateCommonVariable}
                    onDelete={handleDeleteCommonVariable}
                    isNew={variable.isNew}
                  />
                ))}
                
                {/* 添加常用变量卡片 */}
                <AddCommonVariableCard onClick={handleAddCommonVariable} />
              </div>
            </div>

            {/* 空状态 */}
            {commonVariables.length === 0 && (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground text-sm">
                  还没有添加任何常用变量，点击上方卡片开始添加
                </p>
              </div>
            )}
          </div>
        )

      case 'display':
        return (
          <Card className="w-full max-w-4xl min-w-[300px]">
            <CardHeader>
              <CardTitle>显示设置</CardTitle>
              <CardDescription>自定义数据表格的显示方式。</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Label htmlFor="pageSize" className="min-w-[100px]">单页显示数量</Label>
                <Input
                  id="pageSize"
                  type="number"
                  value={pageSizeDraft}
                  onChange={(e) => setPageSizeDraft(normalizeNumericInput(e.target.value, { allowDecimal: false }))}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">条</span>
              </div>
              <div className="flex items-center gap-4">
                <Label htmlFor="pointsFormat" className="min-w-[100px]">积分显示格式</Label>
                <ToggleGroupCustom
                  options={['整数', '两位小数']}
                  value={pointsFormatDraft === 'integer' ? '整数' : '两位小数'}
                  onValueChange={(value: string) => setPointsFormatDraft(value === '整数' ? 'integer' : 'decimal')}
                  className="h-10"
                  textSize="text-sm"
                />
              </div>
              <div className="flex items-center gap-4">
                <Label htmlFor="tableBorder" className="min-w-[100px]">表格边框选择</Label>
                <ToggleGroupCustom
                  options={['横线', '竖线', '横竖线']}
                  value={tableBorderDraft === 'horizontal' ? '横线' : tableBorderDraft === 'vertical' ? '竖线' : '横竖线'}
                  onValueChange={(value: string) => setTableBorderDraft(value === '横线' ? 'horizontal' : value === '竖线' ? 'vertical' : 'both')}
                  className="h-10"
                  textSize="text-sm"
                />
              </div>
              <div className="flex items-center gap-4">
                <Label htmlFor="cardCount" className="min-w-[100px]">看板显示数量</Label>
                <ToggleGroupCustom
                  options={['10条', '20条', '30条', '40条']}
                  value={`${cardCountDraft}条`}
                  onValueChange={(value: string) => setCardCountDraft(parseInt(value.replace('条', '')) as CardCountType)}
                  className="h-10"
                  textSize="text-sm"
                />
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <div className="flex items-center gap-4">
                <Button
                  onClick={handleSaveDisplaySettings}
                  disabled={!isDisplaySettingsChanged || !isDisplaySettingsValid}
                  className="w-full sm:w-auto"
                >
                  保存显示设置
                </Button>
                {isDisplaySettingsChanged && (
                  <Button
                    variant="outline"
                    onClick={handleCancelDisplaySettings}
                    className="w-full sm:w-auto"
                  >
                    取消
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        )

      case 'deduction':
        const templateCards = [
          ...templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onUpdate={handleUpdateTemplate}
              onDelete={handleDeleteTemplate}
            />
          )),
          <AddTemplateCard key="add-template" onClick={handleAddTemplate} />
        ]
        
        return (
          <MasonryLayout
            columns={{ default: 1, md: 2, lg: 4 }}
            gap={16}
            className="w-full"
          >
            {templateCards}
          </MasonryLayout>
        )

      case 'cleanup':
        return (
          <>
            <Card className="w-full max-w-4xl min-w-[600px]">
              <CardHeader>
                <CardTitle>清除数据</CardTitle>
                <CardDescription>清理系统中的过期数据，释放存储空间。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 清除长时间未登录用户 */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">清除长时间未登录用户</h4>
                      <p className="text-sm text-muted-foreground">删除长时间未登录且积分较低的用户账号</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="userDays" className="text-sm">未登录天数</Label>
                      <Input
                        id="userDays"
                        type="number"
                        value={cleanupSettings.userDays}
                        onChange={(e) => setCleanupSettings(prev => ({ ...prev, userDays: e.target.value }))}
                        className="w-20"
                        min="1"
                      />
                      <span className="text-sm text-muted-foreground">天</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="userPointsLimit" className="text-sm">且积分 ≤</Label>
                      <Input
                        id="userPointsLimit"
                        type="number"
                        value={cleanupSettings.userPointsLimit}
                        onChange={(e) => setCleanupSettings(prev => ({ ...prev, userPointsLimit: e.target.value }))}
                        className="w-20"
                        min="0"
                      />
                      <span className="text-sm text-muted-foreground">分</span>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleCleanupConfirm('users')}
                    >
                      清除用户
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* 清除兑换卡 */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">清除兑换卡</h4>
                      <p className="text-sm text-muted-foreground">删除指定天数前创建的兑换卡</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="cardDays" className="text-sm">创建时间超过</Label>
                      <Input
                        id="cardDays"
                        type="number"
                        value={cleanupSettings.cardDays}
                        onChange={(e) => setCleanupSettings(prev => ({ ...prev, cardDays: e.target.value }))}
                        className="w-20"
                        min="1"
                      />
                      <span className="text-sm text-muted-foreground">天</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor="cardStatus" className="text-sm">状态为</Label>
                      <Select
                        value={cleanupSettings.cardStatus}
                        onValueChange={(value) => setCleanupSettings(prev => ({ ...prev, cardStatus: value }))}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="redeemed">已兑换</SelectItem>
                          <SelectItem value="all">所有状态</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleCleanupConfirm('cards')}
                    >
                      清除兑换卡
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* 清除积分日志 */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">清除积分日志</h4>
                      <p className="text-sm text-muted-foreground">删除指定天数前的积分变动记录</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="logDays" className="text-sm">记录时间超过</Label>
                      <Input
                        id="logDays"
                        type="number"
                        value={cleanupSettings.logDays}
                        onChange={(e) => setCleanupSettings(prev => ({ ...prev, logDays: e.target.value }))}
                        className="w-20"
                        min="1"
                      />
                      <span className="text-sm text-muted-foreground">天</span>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleCleanupConfirm('logs')}
                    >
                      清除日志
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 清除确认对话框 */}
            <Dialog open={isCleanupDialogOpen} onOpenChange={setIsCleanupDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>确认清除操作</DialogTitle>
                  <DialogDescription>
                     {cleanupType === 'users' && `即将清除 ${cleanupSettings.userDays} 天未登录且积分 ≤ ${cleanupSettings.userPointsLimit} 的用户账号。`}
                     {cleanupType === 'cards' && `即将清除 ${cleanupSettings.cardDays} 天前创建且状态为${cleanupSettings.cardStatus === 'all' ? '所有状态' : '已兑换'}的兑换卡。`}
                     {cleanupType === 'logs' && `即将清除 ${cleanupSettings.logDays} 天前的积分日志记录。`}
                     <br />
                     <strong className="text-red-600">此操作不可撤销，请谨慎操作！</strong>
                   </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCleanupDialogOpen(false)}
                  >
                    取消
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleCleanupExecute}
                  >
                    确认清除
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        )

      default:
        return null
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

      {/* 标签页内容 */}
      {renderTabContent()}


    </div>
  )
}