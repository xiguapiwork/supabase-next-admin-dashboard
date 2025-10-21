'use client'

import { useEffect, useState, useCallback } from 'react'
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
import { createClient } from '@/lib/supabase/client'

type SettingTabType = 'apikey' | 'variables' | 'display' | 'deduction' | 'cleanup'

interface ApiKeyData {
  id: string
  title: string
  key: string
  provider: string
  isNew?: boolean
  enabled?: boolean
  originalTitle?: string // 添加原始标题字段，用于更新时的标识
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
  enabled?: boolean
  isNew?: boolean
  originalTitle?: string // 添加原始标题字段，用于更新时的标识
}

export function Setting() {
  // 标签页状态
  const [activeTab, setActiveTab] = useState<SettingTabType>('apikey')

  // API Key 管理状态
  const [apiKeys, setApiKeys] = useState<ApiKeyData[]>([])
  const [isLoadingApiKeys, setIsLoadingApiKeys] = useState(true)

  // Supabase 客户端
  const supabase = createClient()

  // 模版管理状态（功能设置）
  const [templates, setTemplates] = useState<TemplateData[]>([])
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true)

  // 常用变量管理状态
  const [commonVariables, setCommonVariables] = useState<CommonVariableData[]>([
    {
      id: 'var-1',
      title: '示例变量',
      value: '示例值'
    }
  ])
  const [isLoadingCommonVariables, setIsLoadingCommonVariables] = useState(false)

  // 从数据库加载 API Keys
  const loadApiKeys = useCallback(async () => {
    try {
      setIsLoadingApiKeys(true)
      const { data, error } = await supabase.rpc('get_api_keys_list')
      
      if (error) {
        console.error('加载 API Keys 失败:', error)
        toast.error('加载 API Keys 失败')
        return
      }

      // 转换数据库数据为组件需要的格式
      const formattedApiKeys: ApiKeyData[] = (data || []).map((item: Record<string, unknown>) => ({
        id: String(item.id),
        title: String(item.名称),
        key: String(item.key_masked), // 使用掩码显示的 key
        provider: 'openrouter', // 默认 provider，可以后续扩展
        enabled: Boolean(item.是否启用),
        isNew: false,
        originalTitle: String(item.名称) // 保存原始标题用于更新
      }))

      setApiKeys(formattedApiKeys)
    } catch (error) {
      console.error('加载 API Keys 出错:', error)
      toast.error('加载 API Keys 出错')
    } finally {
      setIsLoadingApiKeys(false)
    }
  }, [supabase])

  // 从数据库加载功能设置（app_config）
  const loadAppConfig = useCallback(async () => {
    try {
      setIsLoadingTemplates(true)
      console.log('开始调用 get_app_config_list RPC...')
      const { data, error } = await supabase.rpc('get_app_config_list')
      
      console.log('RPC 调用结果:', { data, error })
      
      if (error) {
        console.error('加载功能设置失败:', error)
        console.error('错误详情:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        toast.error(`加载功能设置失败: ${error.message}`)
        return
      }

      // 将数据库数据转换为模板格式
      // 按分类分组，每个分类作为一个模板
      const categoryMap = new Map<string, TemplateData>()
      const features: Array<{id: string, name: string, value: number, parentId: string}> = []
      
      // 第一遍：处理所有分类
      ;(data || []).forEach((item: Record<string, unknown>) => {
        const categoryName = String(item.配置名称)
        const parentId = item.parent_id
        
        // 如果是分类（parent_id 为 null）
        if (!parentId) {
          if (!categoryMap.has(categoryName)) {
            categoryMap.set(categoryName, {
              id: String(item.id),
              title: categoryName,
              description: String(item.备注 || ''),
              features: [],
              isNew: false
            })
          }
        } else {
          // 如果是功能项，先收集起来
          features.push({
            id: String(item.id),
            name: categoryName,
            value: Number(item.积分消耗 || 0),
            parentId: String(parentId)
          })
        }
      })
      
      // 第二遍：将功能项分配到对应的分类
      features.forEach(feature => {
        const parentCategory = Array.from(categoryMap.values()).find(cat => cat.id === feature.parentId)
        if (parentCategory) {
          parentCategory.features.push({
            id: feature.id,
            name: feature.name,
            value: feature.value
          })
        } else {
          console.warn(`找不到功能项 ${feature.name} 的父分类，parentId: ${feature.parentId}`)
        }
      })

      setTemplates(Array.from(categoryMap.values()))
    } catch (error) {
      console.error('加载功能设置出错:', error)
      toast.error('加载功能设置出错')
    } finally {
      setIsLoadingTemplates(false)
    }
  }, [supabase])

  // 从数据库加载常用变量
  const loadCommonVariables = useCallback(async () => {
    try {
      setIsLoadingCommonVariables(true)
      const { data, error } = await supabase.rpc('get_variables_list')
      
      if (error) {
        console.error('加载常用变量失败:', error)
        toast.error('加载常用变量失败')
        return
      }

      // 转换数据库数据为组件需要的格式
      const formattedVariables: CommonVariableData[] = (data || []).map((item: Record<string, unknown>) => ({
        id: String(item.id),
        title: String(item.变量名),
        value: String(item.变量值),
        enabled: Boolean(item.是否启用),
        isNew: false,
        originalTitle: String(item.变量名) // 保存原始标题用于更新
      }))

      setCommonVariables(formattedVariables)
    } catch (error) {
      console.error('加载常用变量出错:', error)
      toast.error('加载常用变量出错')
    } finally {
      setIsLoadingCommonVariables(false)
    }
  }, [supabase])

  // 组件挂载时加载数据
  useEffect(() => {
    loadApiKeys()
    loadCommonVariables()
    loadAppConfig()
  }, [loadApiKeys, loadCommonVariables, loadAppConfig])

  // API Key 管理函数
  const handleAddApiKey = () => {
    const newApiKey: ApiKeyData = {
      id: Date.now().toString(),
      title: '',
      key: '',
      provider: 'openrouter',
      isNew: true,
      enabled: true
    }
    setApiKeys(prev => [...prev, newApiKey])
  }

  const handleUpdateApiKey = async (id: string, key: string, provider: string, title?: string) => {
    try {
      // 如果是新的 API Key，需要保存到数据库
      const apiKey = apiKeys.find(item => item.id === id)
      if (apiKey?.isNew) {
        if (!title?.trim()) {
          toast.error('API Key 名称不能为空')
          return
        }
        if (!key?.trim()) {
          toast.error('API Key 不能为空')
          return
        }

        // 调用数据库函数保存新的 API Key
        const { error } = await supabase.rpc('upsert_api_key', {
          p_name: title.trim(),
          p_key: key.trim(),
          p_enabled: true
        })

        if (error) {
          console.error('保存 API Key 失败:', error)
          toast.error('保存 API Key 失败: ' + error.message)
          return
        }

        toast.success('API Key 保存成功')
        // 重新加载数据
        await loadApiKeys()
      } else {
        // 更新现有的 API Key
        const currentApiKey = apiKeys.find(item => item.id === id)
        if (!currentApiKey) {
          toast.error('找不到要更新的 API Key')
          return
        }

        const newTitle = title || currentApiKey.title
        const newKey = key

        if (!newTitle?.trim()) {
          toast.error('API Key 名称不能为空')
          return
        }
        if (!newKey?.trim()) {
          toast.error('API Key 不能为空')
          return
        }

        // 调用数据库函数更新现有的 API Key
        const { error } = await supabase.rpc('update_api_key_by_name', {
          p_original_name: currentApiKey.originalTitle || currentApiKey.title,
          p_new_name: newTitle.trim(),
          p_key: newKey.trim(),
          p_enabled: currentApiKey.enabled ?? true
        })

        if (error) {
          console.error('更新 API Key 失败:', error)
          toast.error('更新 API Key 失败: ' + error.message)
          return
        }

        toast.success('API Key 更新成功')
        // 重新加载数据
        await loadApiKeys()
      }
    } catch (error) {
      console.error('更新 API Key 出错:', error)
      toast.error('更新 API Key 出错')
    }
  }

  const handleDeleteApiKey = async (id: string) => {
    try {
      const apiKey = apiKeys.find(item => item.id === id)
      
      if (apiKey?.isNew) {
        // 如果是新建的还未保存的 API Key，直接从状态中移除
        setApiKeys(prev => prev.filter(item => item.id !== id))
        return
      }

      if (apiKey?.title) {
        // 调用数据库函数删除 API Key
        const { error } = await supabase.rpc('delete_api_key', {
          p_name: apiKey.title
        })

        if (error) {
          console.error('删除 API Key 失败:', error)
          toast.error('删除 API Key 失败: ' + error.message)
          return
        }

        toast.success('API Key 删除成功')
        // 重新加载数据
        await loadApiKeys()
      }
    } catch (error) {
      console.error('删除 API Key 出错:', error)
      toast.error('删除 API Key 出错')
    }
  }

  const handleToggleApiKey = async (name: string, enabled: boolean) => {
    try {
      const { error } = await supabase.rpc('toggle_api_key', {
        p_name: name,
        p_enabled: enabled
      })

      if (error) {
        console.error('切换 API Key 状态失败:', error)
        toast.error('切换 API Key 状态失败: ' + error.message)
        return
      }

      toast.success(`API Key 已${enabled ? '启用' : '禁用'}`)
      // 重新加载数据
      await loadApiKeys()
    } catch (error) {
      console.error('切换 API Key 状态出错:', error)
      toast.error('切换 API Key 状态出错')
    }
  }

  // 模版管理函数（功能设置）
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

  const handleUpdateTemplate = async (template: TemplateData) => {
    try {
      // 如果是新的模板，需要保存到数据库
      if (template.isNew) {
        if (!template.title?.trim()) {
          toast.error('分类名称不能为空')
          return
        }

        // 首先创建分类
        const { data: categoryData, error: categoryError } = await supabase.rpc('upsert_app_config', {
          p_配置名称: template.title.trim(),
          p_配置类型: 'category',
          p_积分消耗: 0,
          p_parent_id: null,
          p_备注: (template.description || '').trim()
        })

        if (categoryError) {
          console.error('保存分类失败:', categoryError)
          toast.error('保存分类失败: ' + categoryError.message)
          return
        }

        // 然后创建功能项
        for (const feature of template.features) {
          if (feature.name?.trim()) {
            const { error: featureError } = await supabase.rpc('upsert_app_config', {
              p_配置名称: feature.name.trim(),
              p_配置类型: 'function',
              p_积分消耗: feature.value || 0,
              p_parent_id: categoryData,
              p_备注: ''
            })

            if (featureError) {
              console.error('保存功能项失败:', featureError)
              toast.error('保存功能项失败: ' + featureError.message)
              return
            }
          }
        }

        toast.success('功能设置保存成功')
        // 重新加载数据
        await loadAppConfig()
      } else {
        // 更新现有的模板
        if (!template.title?.trim()) {
          toast.error('分类名称不能为空')
          return
        }

        // 检查是否是新模板（ID 以 'template' 开头）
        const isNewTemplate = template.id.startsWith('template')
        let categoryId: string

        if (isNewTemplate) {
          // 新模板：先创建分类
          console.log('准备创建新分类，参数:', {
            p_配置名称: template.title,
            p_配置类型: 'category',
            p_积分消耗: 0,
            p_parent_id: null,
            p_备注: template.description || ''
          })
          
          const { data: categoryData, error: categoryError } = await supabase.rpc('upsert_app_config', {
            p_配置名称: template.title.trim(),
            p_配置类型: 'category',
            p_积分消耗: 0,
            p_parent_id: null,
            p_备注: (template.description || '').trim()
          })

          if (categoryError) {
            console.error('创建分类失败:', categoryError)
            console.error('错误类型:', typeof categoryError)
            console.error('错误字符串化:', JSON.stringify(categoryError, null, 2))
            
            let errorMessage = '未知错误'
            if (typeof categoryError === 'string') {
              errorMessage = categoryError
            } else if (categoryError && typeof categoryError === 'object') {
              errorMessage = categoryError.message || 
                            categoryError.details || 
                            categoryError.hint || 
                            JSON.stringify(categoryError)
            }
            
            toast.error('创建分类失败: ' + errorMessage)
            return
          }
          
          categoryId = categoryData
          console.log('分类创建成功，返回ID:', categoryId)
        } else {
          // 现有模板：更新分类
          console.log('准备更新分类，参数:', {
            config_id: template.id,
            p_配置名称: template.title,
            p_配置类型: 'category',
            p_积分消耗: 0,
            p_parent_id: null,
            p_备注: template.description || ''
          })
          
          const { error: categoryError } = await supabase.rpc('upsert_app_config', {
            config_id: template.id,
            p_配置名称: template.title.trim(),
            p_配置类型: 'category',
            p_积分消耗: 0,
            p_parent_id: null,
            p_备注: (template.description || '').trim()
          })

          if (categoryError) {
            console.error('更新分类失败:', categoryError)
            console.error('错误类型:', typeof categoryError)
            console.error('错误字符串化:', JSON.stringify(categoryError, null, 2))
            
            let errorMessage = '未知错误'
            if (typeof categoryError === 'string') {
              errorMessage = categoryError
            } else if (categoryError && typeof categoryError === 'object') {
              errorMessage = categoryError.message || 
                            categoryError.details || 
                            categoryError.hint || 
                            JSON.stringify(categoryError)
            }
            
            toast.error('更新分类失败: ' + errorMessage)
            return
          }
          
          categoryId = template.id // 对于现有模板，使用原有的 ID
          console.log('分类更新成功，使用ID:', categoryId)
        }

        // 获取现有的功能项
        const { error: getFunctionsError } = await supabase.rpc('get_functions_by_category', {
          category_name: template.title
        })

        if (getFunctionsError) {
          console.error('获取现有功能项失败:', getFunctionsError)
        }

        // 更新或创建功能项
        for (const feature of template.features) {
          if (feature.name?.trim()) {
            const isNewFeature = feature.id.startsWith('feature')
            const featureParams = {
              config_id: isNewFeature ? null : feature.id,
              p_配置名称: feature.name.trim(),
              p_配置类型: 'function',
              p_积分消耗: feature.value || 0,
              p_parent_id: categoryId, // 使用正确的 categoryId
              p_备注: ''
            }
            
            console.log(`准备${isNewFeature ? '创建' : '更新'}功能项，参数:`, featureParams)
            
            const { data: featureData, error: featureError } = await supabase.rpc('upsert_app_config', featureParams)

            if (featureError) {
              console.error('更新功能项失败:', featureError)
              console.error('错误类型:', typeof featureError)
              console.error('错误字符串化:', JSON.stringify(featureError, null, 2))
              
              // 尝试不同的错误信息提取方式
              let errorMessage = '未知错误'
              if (typeof featureError === 'string') {
                errorMessage = featureError
              } else if (featureError && typeof featureError === 'object') {
                errorMessage = featureError.message || 
                              featureError.details || 
                              featureError.hint || 
                              JSON.stringify(featureError)
              }
              
              toast.error('更新功能项失败: ' + errorMessage)
              return
            }
            
            console.log(`功能项${isNewFeature ? '创建' : '更新'}成功，返回数据:`, featureData)
          }
        }

        toast.success('功能设置更新成功')
        // 重新加载数据
        await loadAppConfig()
      }
    } catch (error) {
      console.error('更新功能设置出错:', error)
      toast.error('更新功能设置出错')
    }
  }

  const handleDeleteTemplate = async (id: string) => {
    try {
      const template = templates.find(item => item.id === id)
      
      if (template?.isNew) {
        // 如果是新建的还未保存的模板，直接从状态中移除
        setTemplates(prev => prev.filter(item => item.id !== id))
        return
      }

      if (template) {
        // 调用数据库函数删除分类（会级联删除相关功能项）
        const { error } = await supabase.rpc('delete_app_config', {
          config_id: template.id
        })

        if (error) {
          console.error('删除功能设置失败:', error)
          toast.error('删除功能设置失败: ' + error.message)
          return
        }

        toast.success('功能设置删除成功')
        // 重新加载数据
        await loadAppConfig()
      }
    } catch (error) {
      console.error('删除功能设置出错:', error)
      toast.error('删除功能设置出错')
    }
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

  const handleUpdateCommonVariable = async (id: string, value: string, title?: string) => {
    try {
      // 如果是新的常用变量，需要保存到数据库
      const variable = commonVariables.find(item => item.id === id)
      if (variable?.isNew) {
        if (!title?.trim()) {
          toast.error('变量名称不能为空')
          return
        }
        if (!value?.trim()) {
          toast.error('变量值不能为空')
          return
        }

        // 调用数据库函数保存新的常用变量
        const { error } = await supabase.rpc('upsert_variable', {
          p_name: title.trim(),
          p_value: value.trim(),
          p_enabled: true
        })

        if (error) {
          console.error('保存常用变量失败:', error)
          toast.error('保存常用变量失败: ' + error.message)
          return
        }

        toast.success('常用变量保存成功')
        // 重新加载数据
        await loadCommonVariables()
      } else {
        // 更新现有的常用变量
        const currentVariable = commonVariables.find(item => item.id === id)
        if (!currentVariable) {
          toast.error('找不到要更新的变量')
          return
        }

        const newTitle = title || currentVariable.title
        const newValue = value

        if (!newTitle?.trim()) {
          toast.error('变量名称不能为空')
          return
        }
        if (!newValue?.trim()) {
          toast.error('变量值不能为空')
          return
        }

        // 调用数据库函数更新现有的常用变量
        const { error } = await supabase.rpc('update_variable_by_name', {
          p_original_name: currentVariable.originalTitle || currentVariable.title,
          p_new_name: newTitle.trim(),
          p_value: newValue.trim(),
          p_enabled: currentVariable.enabled ?? true
        })

        if (error) {
          console.error('更新常用变量失败:', error)
          toast.error('更新常用变量失败: ' + error.message)
          return
        }

        toast.success('常用变量更新成功')
        // 重新加载数据
        await loadCommonVariables()
      }
    } catch (error) {
      console.error('更新常用变量出错:', error)
      toast.error('更新常用变量出错')
    }
  }

  const handleDeleteCommonVariable = async (id: string) => {
    try {
      const variable = commonVariables.find(item => item.id === id)
      
      if (variable?.isNew) {
        // 如果是新建的还未保存的常用变量，直接从状态中移除
        setCommonVariables(prev => prev.filter(item => item.id !== id))
        return
      }

      if (variable?.title) {
        // 调用数据库函数删除常用变量
        const { error } = await supabase.rpc('delete_variable', {
          p_name: variable.title
        })

        if (error) {
          console.error('删除常用变量失败:', error)
          toast.error('删除常用变量失败: ' + error.message)
          return
        }

        toast.success('常用变量删除成功')
        // 重新加载数据
        await loadCommonVariables()
      }
    } catch (error) {
      console.error('删除常用变量出错:', error)
      toast.error('删除常用变量出错')
    }
  }

  const handleToggleCommonVariable = async (name: string, enabled: boolean) => {
    try {
      const { error } = await supabase.rpc('toggle_variable', {
        p_name: name,
        p_enabled: enabled
      })

      if (error) {
        console.error('切换常用变量状态失败:', error)
        toast.error('切换常用变量状态失败: ' + error.message)
        return
      }

      toast.success(`常用变量已${enabled ? '启用' : '禁用'}`)
      // 重新加载数据
      await loadCommonVariables()
    } catch (error) {
      console.error('切换常用变量状态出错:', error)
      toast.error('切换常用变量状态出错')
    }
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
                    onToggle={handleToggleApiKey}
                    isNew={apiKey.isNew}
                    enabled={apiKey.enabled}
                  />
                ))}
                
                {/* 添加 API Key 卡片 */}
                <AddApiKeyCard onClick={handleAddApiKey} />
              </div>
            </div>

            {/* 加载状态 */}
            {isLoadingApiKeys && (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground text-sm">
                  正在加载 API Keys...
                </p>
              </div>
            )}

            {/* 空状态 */}
            {!isLoadingApiKeys && apiKeys.length === 0 && (
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
                    onToggle={handleToggleCommonVariable}
                    isNew={variable.isNew}
                    enabled={variable.enabled}
                  />
                ))}
                
                {/* 添加常用变量卡片 */}
                <AddCommonVariableCard onClick={handleAddCommonVariable} />
              </div>
            </div>

            {/* 加载状态 */}
            {isLoadingCommonVariables && (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground text-sm">
                  正在加载常用变量...
                </p>
              </div>
            )}

            {/* 空状态 */}
            {!isLoadingCommonVariables && commonVariables.length === 0 && (
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
        return (
          <div className="space-y-6">
            {/* 功能设置卡片列表 */}
            {!isLoadingTemplates && (
              <MasonryLayout
                columns={{ default: 1, md: 2, lg: 4 }}
                gap={16}
                className="w-full"
              >
                {templates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    onUpdate={handleUpdateTemplate}
                    onDelete={handleDeleteTemplate}
                  />
                ))}
                <AddTemplateCard key="add-template" onClick={handleAddTemplate} />
              </MasonryLayout>
            )}

            {/* 加载状态 */}
            {isLoadingTemplates && (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">
                  正在加载功能设置...
                </p>
              </div>
            )}

            {/* 空状态 */}
            {!isLoadingTemplates && templates.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">
                  还没有添加任何功能设置，点击上方卡片开始添加
                </p>
              </div>
            )}
          </div>
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