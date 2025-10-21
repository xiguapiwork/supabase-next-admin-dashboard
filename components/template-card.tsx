'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Minus } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface FeatureItem {
  id: string
  name: string
  value: number
}

interface FeatureDraft {
  id: string
  name: string
  value: string
}

interface TemplateData {
  id: string
  title: string
  description: string
  features: FeatureItem[]
  isNew?: boolean
}

interface TemplateCardProps {
  template: TemplateData
  onUpdate: (template: TemplateData) => void
  onDelete: (id: string) => void
}

export function TemplateCard({ template, onUpdate, onDelete }: TemplateCardProps) {
  // 功能扣分值 - 保存与草稿
  const [featuresSaved, setFeaturesSaved] = useState<FeatureItem[]>(template.features || [
    { id: 'featureA', name: '新用户注册赠送积分', value: 0 },
    { id: 'featureB', name: '功能 B', value: 10 },
    { id: 'featureC', name: '功能 C', value: 15 },
  ])
  
  const [featuresDraft, setFeaturesDraft] = useState<FeatureDraft[]>(
    featuresSaved.map(f => ({ ...f, value: String(f.value) }))
  )

  // 标题和副标题 - 保存与草稿
  const [titleSaved, setTitleSaved] = useState(template.title)
  const [titleDraft, setTitleDraft] = useState(template.title)

  // 编辑模式状态管理
  const [isEditMode, setIsEditMode] = useState(template.isNew || false)
  const [editableFeatures, setEditableFeatures] = useState<Set<string>>(new Set())
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // 初始化新模板时进入编辑模式
  useEffect(() => {
    if (template.isNew) {
      setIsEditMode(true)
    }
  }, [template.isNew])

  // 变化状态判断
  const isFeaturesChanged = featuresDraft.some((draft, index) => {
    const saved = featuresSaved[index]
    return !saved || draft.name !== saved.name || draft.value !== String(saved.value)
  }) || featuresDraft.length !== featuresSaved.length

  const isFeaturesValid = featuresDraft.every(f => {
    const value = parseFloat(f.value)
    return f.name.trim() !== '' && f.value.trim() !== '' && Number.isFinite(value) && value >= 0
  })

  const isTitleChanged = titleDraft !== titleSaved
  const isHeaderChanged = isTitleChanged

  // 编辑模式处理函数
  const handleEditFeatures = () => {
    setIsEditMode(true)
  }

  const handleSaveEditFeatures = () => {
    if (!isFeaturesValid) {
      toast.error('请确保所有功能名称和积分值都已正确填写')
      return
    }

    const newFeatures = featuresDraft.map(f => ({
      id: f.id,
      name: f.name,
      value: parseFloat(f.value)
    }))

    setFeaturesSaved(newFeatures)
    setTitleSaved(titleDraft)
    setIsEditMode(false)
    setEditableFeatures(new Set())

    // 更新模板数据
    const updatedTemplate = {
      ...template,
      title: titleDraft,
      description: template.description, // 保持原有描述
      features: newFeatures,
      isNew: false
    }
    onUpdate(updatedTemplate)

    toast.success('模板已保存')
  }

  const handleCancelEditFeatures = () => {
    // 如果是新模板，直接删除
    if (template.isNew) {
      onDelete(template.id)
      return
    }
    
    // 如果是已有模板，恢复原始数据
    setFeaturesDraft(featuresSaved.map(f => ({ ...f, value: String(f.value) })))
    setTitleDraft(titleSaved)
    setIsEditMode(false)
    setEditableFeatures(new Set())
  }

  const handleAddFeature = () => {
    const newId = `feature${Date.now()}`
    const newFeature = { id: newId, name: '', value: '0' }
    setFeaturesDraft(prev => [...prev, newFeature])
    setEditableFeatures(prev => new Set([...prev, newId]))
  }

  const handleDeleteFeature = (id: string) => {
    setFeaturesDraft(prev => prev.filter(f => f.id !== id))
    setEditableFeatures(prev => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
  }

  const handleUpdateFeature = (id: string, field: 'name' | 'value', value: string) => {
    if (field === 'value') {
      // 处理数字输入
      let processedValue = value
      
      // 将中文句号转换为英文小数点
      processedValue = processedValue.replace(/。/g, '.')
      
      // 只允许数字、小数点和负号
      processedValue = processedValue.replace(/[^0-9.-]/g, '')
      
      // 确保只有一个小数点
      const parts = processedValue.split('.')
      if (parts.length > 2) {
        processedValue = parts[0] + '.' + parts.slice(1).join('')
      }
      
      // 确保负号只在开头
      if (processedValue.includes('-')) {
        const isNegative = processedValue.startsWith('-')
        processedValue = processedValue.replace(/-/g, '')
        if (isNegative) {
          processedValue = '-' + processedValue
        }
      }
      
      setFeaturesDraft(prev => prev.map(f => 
        f.id === id ? { ...f, [field]: processedValue } : f
      ))
    } else {
      setFeaturesDraft(prev => prev.map(f => 
        f.id === id ? { ...f, [field]: value } : f
      ))
    }
  }

  const handleDeleteTemplate = () => {
    onDelete(template.id)
    setShowDeleteDialog(false)
    toast.success('模板已删除')
  }

  return (
    <>
      <Card className="w-full h-fit min-w-[300px]">
        <CardHeader className="px-3 pt-3 pb-1">
          {isEditMode ? (
            <Input
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              className="text-lg font-semibold"
              placeholder="请输入名称"
            />
          ) : (
            <div className="flex h-9 w-full px-3 py-1 text-lg font-semibold">
              {titleSaved || '请输入名称'}
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-2 px-3 pb-3 pt-2">
          {featuresDraft.map((feature, index) => (
            <div key={feature.id} className="flex items-center gap-2">
              {/* 序号 */}
              <span className="text-sm text-muted-foreground font-medium w-6 h-9 flex items-center justify-center">
                {index + 1}.
              </span>
              
              {/* 功能名称 - 条件渲染 */}
              {isEditMode || editableFeatures.has(feature.id) ? (
                <textarea
                  value={feature.name}
                  onChange={(e) => handleUpdateFeature(feature.id, 'name', e.target.value)}
                  className="flex-1 min-w-[100px] rounded-md border border-gray-300 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground resize-none outline-none"
                  placeholder="请输入名称"
                  rows={1}
                  style={{
                    height: '2.25rem',
                    overflow: 'hidden',
                    minHeight: '2.25rem'
                  }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = Math.max(36, target.scrollHeight) + 'px';
                  }}
                  ref={(textarea) => {
                    if (textarea) {
                      // 初始化时也调整高度
                      textarea.style.height = 'auto';
                      textarea.style.height = Math.max(36, textarea.scrollHeight) + 'px';
                    }
                  }}
                />
              ) : (
                <div className="flex-1 min-w-[100px] px-3 py-2 text-sm whitespace-pre-wrap">
                  {feature.name || "请输入名称"}
                </div>
              )}
              
              {/* 扣分值 - 条件渲染 */}
              {isEditMode || editableFeatures.has(feature.id) ? (
                <Input
                  type="text"
                  inputMode="decimal"
                  value={feature.value}
                  onChange={(e) => handleUpdateFeature(feature.id, 'value', e.target.value)}
                  className="w-16 text-right"
                  placeholder="0"
                />
              ) : (
                <div className="w-16 px-3 py-2 text-sm text-right">
                  {feature.value || "0"}
                </div>
              )}
              
              <span className="text-sm text-muted-foreground min-w-[2rem] flex-shrink-0">积分</span>
              
              {/* 删除按钮 - 编辑模式显示按钮，非编辑模式显示占位符 */}
              {(isEditMode || editableFeatures.has(feature.id)) ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteFeature(feature.id)}
                  className="p-0 h-6 w-6 min-w-[1.5rem] min-h-[1.5rem] rounded-full bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 flex items-center justify-center flex-shrink-0"
                >
                  <Minus className="h-3 w-3" />
                </Button>
              ) : (
                <div className="h-6 w-6 min-w-[1.5rem] min-h-[1.5rem] flex-shrink-0"></div>
              )}
            </div>
          ))}
          
          {/* 添加新功能按钮 - 新建卡片时显示，已有卡片编辑时隐藏 */}
          <div 
            className="flex items-center gap-2 pt-1"
            style={{ 
              visibility: (template.isNew || (!isEditMode || editableFeatures.size > 0)) ? 'visible' : 'hidden' 
            }}
          >
            {/* 序号位置对齐 */}
            <div className="w-6 h-9 flex items-center justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleAddFeature}
                className="p-0 h-6 w-6 rounded-full bg-green-100 hover:bg-green-200 text-green-600 hover:text-green-700 flex items-center justify-center"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            <span className="text-sm text-muted-foreground flex-1 min-w-[100px] px-3 py-2">添加功能</span>
            
            {/* 积分输入框位置占位 - 保持对齐 */}
            <div className="w-16"></div>
            
            {/* 积分文字位置占位 - 保持对齐 */}
            <span className="text-sm text-muted-foreground min-w-[2rem] flex-shrink-0"></span>
            
            {/* 删除按钮位置占位 - 保持对齐 */}
            <div className="h-6 w-6 min-w-[1.5rem] min-h-[1.5rem] flex-shrink-0"></div>
          </div>
        </CardContent>
        <CardFooter className="border-t p-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              {!isEditMode && editableFeatures.size === 0 ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditFeatures}
                  className="text-black dark:text-white hover:text-black dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                >
                  编辑
                </Button>
              ) : (
                <>
                  <Button
                    size="sm"
                    onClick={handleSaveEditFeatures}
                    disabled={!isFeaturesValid || (!isFeaturesChanged && !isHeaderChanged)}
                  >
                    {template.isNew ? '添加' : '保存'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEditFeatures}
                  >
                    取消
                  </Button>
                </>
              )}
            </div>
            
            {/* 删除按钮 - 右下角，只在非新建卡片时显示 */}
            {!template.isNew && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 hover:border-red-300 ml-auto"
              >
                删除
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* 删除确认对话框 */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              确定要删除模板 &quot;{titleSaved}&quot; 吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowDeleteDialog(false)}
            >
              取消
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleDeleteTemplate}
            >
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}