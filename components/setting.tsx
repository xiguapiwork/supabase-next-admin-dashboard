'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAppSettings } from '@/contexts/AppSettingsContext'
import type { TableBorderType } from '@/contexts/AppSettingsContext'
import { toast } from 'sonner'

export function Setting() {
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
  const [apiKeySaved, setApiKeySaved] = useState('')
  const [apiKeyDraft, setApiKeyDraft] = useState('')

  // 显示设置 - 分页数量（使用全局设置作为已保存值），草稿允许空值
  const { pageSize, setPageSize, pointsFormat, setPointsFormat, tableBorder, setTableBorder } = useAppSettings()
  const [pageSizeDraft, setPageSizeDraft] = useState<string>(String(pageSize))
  const [pointsFormatDraft, setPointsFormatDraft] = useState<'integer' | 'decimal'>(pointsFormat)
  const [tableBorderDraft, setTableBorderDraft] = useState<TableBorderType>('horizontal')

  // 功能扣分值 - 保存与草稿
  type DeductionValues = { featureA: number; featureB: number; featureC: number }
  const [deductionSaved, setDeductionSaved] = useState<DeductionValues>({
    featureA: 0,
    featureB: 10,
    featureC: 15,
  })
  const [deductionDraft, setDeductionDraft] = useState<{ featureA: string; featureB: string; featureC: string }>({
    featureA: String(0),
    featureB: String(10),
    featureC: String(15),
  })

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

  // 初始化从本地存储读取已保存的 API Key 与扣分值
  useEffect(() => {
    try {
      const savedApiKey = localStorage.getItem('appSettings.apiKey') || ''
      setApiKeySaved(savedApiKey)
      setApiKeyDraft(savedApiKey)
    } catch {}

    try {
      const raw = localStorage.getItem('appSettings.deductionValues')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (
          typeof parsed === 'object' && parsed &&
          ['featureA','featureB','featureC'].every(k => typeof parsed[k] === 'number')
        ) {
          setDeductionSaved(parsed)
          setDeductionDraft({
            featureA: String(parsed.featureA),
            featureB: String(parsed.featureB),
            featureC: String(parsed.featureC),
          })
        }
      } else {
        setDeductionDraft({
          featureA: String(deductionSaved.featureA),
          featureB: String(deductionSaved.featureB),
          featureC: String(deductionSaved.featureC),
        })
      }
    } catch {}
  }, [deductionSaved.featureA, deductionSaved.featureB, deductionSaved.featureC])

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

  // 变化状态判断
  const isApiChanged = apiKeyDraft !== apiKeySaved
  const isPageSizeChanged = pageSizeDraft !== String(pageSize)
  const isPageSizeValid = (() => {
    const v = parseInt(pageSizeDraft, 10)
    return pageSizeDraft.trim() !== '' && Number.isFinite(v) && v > 0
  })()
  const isPointsFormatChanged = pointsFormatDraft !== pointsFormat
  const isTableBorderChanged = tableBorderDraft !== tableBorder
  const isDisplaySettingsChanged = isPageSizeChanged || isPointsFormatChanged || isTableBorderChanged
  const isDisplaySettingsValid = isPageSizeValid
  const isDeductionChanged = (
    deductionDraft.featureA !== String(deductionSaved.featureA) ||
    deductionDraft.featureB !== String(deductionSaved.featureB) ||
    deductionDraft.featureC !== String(deductionSaved.featureC)
  )
  const isDeductionValid = (() => {
    const a = parseFloat(deductionDraft.featureA)
    const b = parseFloat(deductionDraft.featureB)
    const c = parseFloat(deductionDraft.featureC)
    const allFilled = [deductionDraft.featureA, deductionDraft.featureB, deductionDraft.featureC].every(v => v.trim() !== '')
    const allValid = [a, b, c].every(v => Number.isFinite(v) && v >= 0)
    return allFilled && allValid
  })()

  // 保存与取消操作
  const handleSaveApiKey = () => {
    try {
      localStorage.setItem('appSettings.apiKey', apiKeyDraft)
      setApiKeySaved(apiKeyDraft)
    } catch {}
  }

  const handleCancelApiKey = () => {
    setApiKeyDraft(apiKeySaved)
  }

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
    toast.success('显示设置已保存')
  }

  const handleCancelDisplaySettings = () => {
    setPageSizeDraft(String(pageSize))
    setPointsFormatDraft(pointsFormat)
    setTableBorderDraft(tableBorder)
  }

  const handleSaveDeduction = () => {
    try {
      const saved = {
        featureA: parseFloat(deductionDraft.featureA),
        featureB: parseFloat(deductionDraft.featureB),
        featureC: parseFloat(deductionDraft.featureC),
      }
      localStorage.setItem('appSettings.deductionValues', JSON.stringify(saved))
      setDeductionSaved(saved)
    } catch {}
  }

  const handleCancelDeduction = () => {
    setDeductionDraft({
      featureA: String(deductionSaved.featureA),
      featureB: String(deductionSaved.featureB),
      featureC: String(deductionSaved.featureC),
    })
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

  return (
    <div className="px-6 pt-1 pb-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Key 设置</CardTitle>
          <CardDescription>管理您的第三方服务 API Key。</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Label htmlFor="apiKey" className="min-w-[100px]">服务 API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKeyDraft}
              onChange={(e) => setApiKeyDraft(e.target.value)}
              className="max-w-md"
            />
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={handleSaveApiKey}
              disabled={!isApiChanged}
              className="w-full sm:w-auto"
            >
              保存更改
            </Button>
            {isApiChanged && (
              <Button
                variant="outline"
                onClick={handleCancelApiKey}
                className="w-full sm:w-auto"
              >
                取消
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      <Card>
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
            <Select
              value={pointsFormatDraft}
              onValueChange={(value: 'integer' | 'decimal') => setPointsFormatDraft(value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="integer">整数</SelectItem>
                <SelectItem value="decimal">2位小数</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-4">
            <Label htmlFor="tableBorder" className="min-w-[100px]">表格边框选择</Label>
            <Select
              value={tableBorderDraft}
              onValueChange={(value: TableBorderType) => setTableBorderDraft(value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="horizontal">横线</SelectItem>
                <SelectItem value="vertical">竖线</SelectItem>
                <SelectItem value="both">横线和竖线</SelectItem>
              </SelectContent>
            </Select>
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

      <Card>
        <CardHeader>
          <CardTitle>功能扣分值设置</CardTitle>
          <CardDescription>为不同功能设置基础的积分扣除值。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="featureA" className="min-w-[180px] flex-shrink-0">新用户注册赠送积分</Label>
            <Input
              id="featureA"
              type="text"
              inputMode="decimal"
              value={deductionDraft.featureA}
              onChange={(e) => setDeductionDraft(prev => ({ ...prev, featureA: normalizeNumericInput(e.target.value, { allowDecimal: true }) }))}
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">分/次</span>
          </div>
          <div className="flex items-center gap-4">
            <Label htmlFor="featureB" className="min-w-[180px] flex-shrink-0">功能 B</Label>
            <Input
              id="featureB"
              type="text"
              inputMode="decimal"
              value={deductionDraft.featureB}
              onChange={(e) => setDeductionDraft(prev => ({ ...prev, featureB: normalizeNumericInput(e.target.value, { allowDecimal: true }) }))}
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">分/次</span>
          </div>
          <div className="flex items-center gap-4">
            <Label htmlFor="featureC" className="min-w-[180px] flex-shrink-0">功能 C</Label>
            <Input
              id="featureC"
              type="text"
              inputMode="decimal"
              value={deductionDraft.featureC}
              onChange={(e) => setDeductionDraft(prev => ({ ...prev, featureC: normalizeNumericInput(e.target.value, { allowDecimal: true }) }))}
              className="w-24"
            />
            <span className="text-sm text-muted-foreground">分/次</span>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={handleSaveDeduction}
              disabled={!isDeductionChanged || !isDeductionValid}
              className="w-full sm:w-auto"
            >
              保存更改
            </Button>
            {isDeductionChanged && (
              <Button
                variant="outline"
                onClick={handleCancelDeduction}
                className="w-full sm:w-auto"
              >
                取消
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* 清除数据设置 */}
      <Card>
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
    </div>
  )
}