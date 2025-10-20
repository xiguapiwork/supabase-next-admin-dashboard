'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { X } from 'lucide-react'
import { toast } from 'sonner'

interface CommonVariableCardProps {
  id: string
  title: string
  value: string
  onUpdate: (id: string, value: string, title?: string) => void
  onDelete: (id: string) => void
  onToggle?: (name: string, enabled: boolean) => void
  isNew?: boolean
  enabled?: boolean
}

export function CommonVariableCard({ 
  id, 
  title, 
  value, 
  onUpdate, 
  onDelete, 
  onToggle,
  isNew = false,
  enabled = true
}: CommonVariableCardProps) {
  const [isEditing, setIsEditing] = useState(isNew)
  const [valueDraft, setValueDraft] = useState(value)
  const [titleDraft, setTitleDraft] = useState(title)
  const [isEnabled, setIsEnabled] = useState(enabled)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // 同步外部enabled状态
  useEffect(() => {
    setIsEnabled(enabled)
  }, [enabled])

  const handleToggleEnabled = () => {
    const newEnabled = !isEnabled
    setIsEnabled(newEnabled)
    if (onToggle) {
      onToggle(title, newEnabled)
    }
  }

  const isChanged = valueDraft !== value || titleDraft !== title

  const handleSave = () => {
    if (!valueDraft.trim()) {
      toast.error('变量值不能为空')
      return
    }
    
    onUpdate(id, valueDraft, titleDraft)
    setIsEditing(false)
    toast.success('常用变量保存成功')
  }

  const handleCancel = () => {
    setValueDraft(value)
    setTitleDraft(title)
    setIsEditing(false)
    
    if (isNew) {
      onDelete(id)
    }
  }

  const handleDelete = () => {
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    onDelete(id)
    setShowDeleteDialog(false)
    toast.success('常用变量删除成功')
  }

  return (
    <Card className="relative flex flex-col h-[270px]">
      {/* 右上角关闭按钮 - 圆形效果，一半在卡片内一半在外 */}
      {isEditing && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm z-10"
        >
          <X className="h-3 w-3 text-black dark:text-white" />
        </Button>
      )}
      
      <CardHeader className={isEditing ? "pb-2 px-4 pt-4" : "pb-2 px-4 pt-4"}>
        <div className="flex items-start justify-between">
          {isEditing ? (
            <div className="w-full pr-4">
              {/* 编辑模式下的名称输入框，与显示模式标题高度一致 */}
              <Input
                id={`title-${id}`}
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                placeholder="输入变量名称"
                className="text-lg font-medium leading-tight h-auto px-3 py-1 border border-input bg-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
          ) : (
            <CardTitle className="text-lg font-medium leading-tight">{title}</CardTitle>
          )}
          
          {/* 右上角开关 - 仅在非编辑模式显示 */}
          {!isEditing && (
            <div className="flex items-center gap-2 ml-2">
              <Switch
                checked={isEnabled}
                onCheckedChange={handleToggleEnabled}
                className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600 scale-125"
              />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className={isEditing ? "flex-1 px-4 pb-16 flex flex-col gap-4 justify-end" : "px-4 flex-1 flex flex-col justify-end pb-4"}>
        {/* 非编辑模式的值显示 */}
        {!isEditing && (
          <div className="flex flex-col h-full justify-end space-y-1">
            <Label htmlFor={`variable-${id}`} className="text-sm">值</Label>
            <div className="relative">
              <Textarea
                value={value}
                readOnly
                className="font-mono text-sm min-h-[120px] resize-none"
                rows={5}
              />
            </div>
          </div>
        )}
        
        {/* 编辑模式下的输入框容器 */}
        {isEditing && (
          <>
            {/* 值输入行 - 上下布局 */}
            <div className="space-y-1.5">
              <Label htmlFor={`variable-${id}`} className="text-sm">值</Label>
              <Textarea
                id={`variable-${id}`}
                value={valueDraft}
                onChange={(e) => setValueDraft(e.target.value)}
                placeholder="请输入变量值"
                className="font-mono text-sm min-h-[120px] resize-none"
                rows={5}
              />
            </div>
          </>
        )}
        
        {/* 编辑模式下的右下角按钮 */}
        {isEditing && (
          <div className="absolute bottom-3 right-3 flex gap-2">
            <Button
              onClick={handleSave}
              disabled={!isChanged && !isNew}
              className="h-8 px-3 text-sm"
            >
              {isNew ? '添加' : '保存'}
            </Button>
            {!isNew && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="h-8 px-3 text-sm"
              >
                删除
              </Button>
            )}
          </div>
        )}
      </CardContent>

      {!isEditing && (
        <CardFooter className="px-4 pb-3 pt-0 mt-auto">
          <div className="flex items-center gap-2 w-full">
            <Button
              variant="ghost"
              onClick={() => setIsEditing(true)}
              className="w-full h-8 px-3 text-sm"
            >
              编辑
            </Button>
          </div>
        </CardFooter>
      )}

      {/* 删除确认对话框 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除常用变量 &quot;{title}&quot; 吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}