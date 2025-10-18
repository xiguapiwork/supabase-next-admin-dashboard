'use client'

import { useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { X, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

interface ApiKeyCardProps {
  id: string
  title: string
  apiKey: string
  provider: string
  onUpdate: (id: string, apiKey: string, provider: string, title?: string) => void
  onDelete: (id: string) => void
  isNew?: boolean
}

export function ApiKeyCard({ 
  id, 
  title, 
  apiKey, 
  provider, 
  onUpdate, 
  onDelete, 
  isNew = false 
}: ApiKeyCardProps) {
  const [isEditing, setIsEditing] = useState(isNew)
  const [showKey, setShowKey] = useState(false)
  const [keyDraft, setKeyDraft] = useState(apiKey)
  const [titleDraft, setTitleDraft] = useState(title)
  const [isEnabled, setIsEnabled] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const isChanged = keyDraft !== apiKey || titleDraft !== title

  const handleSave = () => {
    if (!keyDraft.trim()) {
      toast.error('API Key 不能为空')
      return
    }
    
    onUpdate(id, keyDraft, provider, titleDraft)
    setIsEditing(false)
    toast.success('API Key 保存成功')
  }

  const handleCancel = () => {
    setKeyDraft(apiKey)
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
    toast.success('API Key 删除成功')
  }

  const maskApiKey = (key: string): string => {
      if (!key) return '';
      const len = key.length;

      if (len < 8) {
        return '*'.repeat(len);
      }

      if (len <= 14) { // 8-14 chars
        const start = key.slice(0, 2);
        const end = key.slice(-2);
        const middle = '*'.repeat(len - 4);
        return `${start}${middle}${end}`;
      }

      if (len <= 24) { // 15-24 chars
        const start = key.slice(0, 4);
        const end = key.slice(-4);
        const middle = '*'.repeat(len - 8);
        return `${start}${middle}${end}`;
      }

      // > 24 chars
      const start = key.slice(0, 4);
      const end = key.slice(-4);
      return `${start}****************${end}`; // 16 asterisks
    }

  return (
    <Card className="relative flex flex-col" style={{ aspectRatio: '3/2' }}>
      {/* 右上角关闭按钮 - 圆形效果，一半在卡片内一半在外 */}
      {isEditing && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-white border border-gray-200 hover:bg-gray-50 shadow-sm z-10"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
      
      <CardHeader className={isEditing ? "pb-1 px-3 pt-2" : "pb-2 px-4 pt-4"}>
        <div className="flex items-start justify-between">
          {isEditing ? (
            <div className="w-full pr-4">
              {/* 编辑模式下标题区域留空，输入框已移到CardContent */}
            </div>
          ) : (
            <CardTitle className="text-lg font-medium leading-tight">{title}</CardTitle>
          )}
          
          {/* 右上角开关 - 仅在非编辑模式显示 */}
          {!isEditing && (
            <div className="flex items-center gap-2 ml-2">
              <Switch
                checked={isEnabled}
                onCheckedChange={setIsEnabled}
                className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300 scale-125"
              />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className={isEditing ? "flex-1 px-4 pb-16 flex flex-col gap-4 justify-center" : "space-y-1.5 px-4 flex-1 flex flex-col justify-center"}>
        {/* 非编辑模式的Key显示 */}
        {!isEditing && (
          <div>
            <div className="space-y-1">
              <Label htmlFor={`apikey-${id}`} className="text-sm">Key</Label>
              <div className="relative">
                <Input
                  value={showKey ? apiKey : maskApiKey(apiKey)}
                  readOnly
                  className="font-mono text-sm h-8 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* 编辑模式下的输入框容器 */}
        {isEditing && (
          <>
            {/* 名称输入行 - 上下布局 */}
            <div className="space-y-1.5">
              <Label htmlFor={`title-${id}`} className="text-sm">名称</Label>
              <Input
                id={`title-${id}`}
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                placeholder="输入 Key 名称"
                className="text-sm font-medium h-8"
              />
            </div>
            {/* Key输入行 - 上下布局 */}
            <div className="space-y-1.5">
              <Label htmlFor={`apikey-${id}`} className="text-sm">Key</Label>
              <Input
                id={`apikey-${id}`}
                type="password"
                value={keyDraft}
                onChange={(e) => setKeyDraft(e.target.value)}
                placeholder="请输入 Key"
                className="text-sm h-8"
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
              保存
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="h-8 px-3 text-sm"
            >
              删除
            </Button>
          </div>
        )}
      </CardContent>

      {!isEditing && (
        <CardFooter className="px-4 py-2 mt-auto">
          <div className="flex items-center gap-2 w-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="w-full h-8 text-sm"
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
              确定要删除 API Key &quot;{title}&quot; 吗？此操作不可撤销。
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