'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface TestResult {
  name: string
  status: 'success' | 'error' | 'pending'
  message: string
  timestamp: Date
}

interface User {
  id: string
  email?: string
}

interface Profile {
  username?: string
  role?: string
}

interface ExchangeCard {
  卡号: string
  卡片名称: string
  积分数量: number
  备注?: string
  状态: boolean
  兑换人?: string
  创建时间: string
  兑换时间?: string
  创建者?: string
}

export function DatabaseTest() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const loadUserInfo = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: profile } = await supabase
          .from('user-management')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(profile)
      }
    } catch (error) {
      console.error('Error loading user info:', error)
    }
  }, [supabase])

  useEffect(() => {
    loadUserInfo()
  }, [loadUserInfo])

  const testFunction = async (name: string, fn: () => Promise<unknown>) => {
    setLoading(true)
    setTestResults(prev => [...prev, { name, status: 'pending', message: '测试中...', timestamp: new Date() }])
    
    try {
      const result = await fn()
      setTestResults(prev => prev.map(test => 
        test.name === name && test.status === 'pending'
          ? { ...test, status: 'success', message: `成功: ${JSON.stringify(result, null, 2)}` }
          : test
      ))
    } catch (error: unknown) {
      let errorMessage: string
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'object' && error !== null) {
        // 处理 Supabase 错误对象
        const supabaseError = error as Record<string, unknown>
        if (typeof supabaseError.message === 'string') {
          errorMessage = supabaseError.message
        } else if (typeof supabaseError.error_description === 'string') {
          errorMessage = supabaseError.error_description
        } else {
          errorMessage = JSON.stringify(error, null, 2)
        }
      } else {
        errorMessage = String(error)
      }
      setTestResults(prev => prev.map(test => 
        test.name === name && test.status === 'pending'
          ? { ...test, status: 'error', message: `错误: ${errorMessage}` }
          : test
      ))
    } finally {
      setLoading(false)
    }
  }

  const testIsAdmin = async () => {
    const { data, error } = await supabase.rpc('is_admin')
    if (error) throw error
    return data
  }

  const testGetApiKeysList = async () => {
    const { data, error } = await supabase.rpc('get_api_keys_list')
    if (error) throw error
    return data
  }

  const testUpsertApiKey = async () => {
    const { data, error } = await supabase.rpc('upsert_api_key', {
      p_key_name: 'test_key',
      p_api_key: 'test_api_key_value',
      p_description: 'Test API key'
    })
    if (error) throw error
    return data
  }

  const testGetAppConfigList = async () => {
    const { data, error } = await supabase.rpc('get_app_config_list')
    if (error) throw error
    return data
  }

  const testUpsertAppConfig = async () => {
    const { data, error } = await supabase.rpc('upsert_app_config', {
      p_config_key: 'test_config',
      p_config_value: 'test_value',
      p_description: 'Test configuration'
    })
    if (error) throw error
    return data
  }

  const testGetFunctionPoints = async () => {
    const { data, error } = await supabase.rpc('get_function_points')
    if (error) throw error
    return data
  }

  const testGetFunctionsByCategory = async () => {
    const { data, error } = await supabase.rpc('get_functions_by_category', {
      p_category: 'test_category'
    })
    if (error) throw error
    return data
  }

  const testAddNewCategory = async () => {
    const { data, error } = await supabase.rpc('upsert_app_config', {
      p_config_key: 'function_categories',
      p_config_value: JSON.stringify(['existing_category', 'new_test_category']),
      p_description: 'Function categories configuration'
    })
    if (error) throw error
    return data
  }

  const testAddFunctionToCategory = async () => {
    const { data, error } = await supabase.rpc('upsert_app_config', {
      p_config_key: 'function_test_category',
      p_config_value: JSON.stringify([
        { name: 'test_function', points: 10, description: 'Test function' }
      ]),
      p_description: 'Test category functions'
    })
    if (error) throw error
    return data
  }

  const testUpdateExistingCategory = async () => {
    const { data, error } = await supabase.rpc('upsert_app_config', {
      p_config_key: 'function_existing_category',
      p_config_value: JSON.stringify([
        { name: 'updated_function', points: 20, description: 'Updated function' }
      ]),
      p_description: 'Updated category functions'
    })
    if (error) throw error
    return data
  }

  const testUpdateExistingFunction = async () => {
    const { data, error } = await supabase.rpc('upsert_app_config', {
      p_config_key: 'function_test_category',
      p_config_value: JSON.stringify([
        { name: 'test_function', points: 15, description: 'Updated test function' }
      ]),
      p_description: 'Updated test category functions'
    })
    if (error) throw error
    return data
  }

  const testDeleteConfig = async () => {
    const { data, error } = await supabase.rpc('delete_app_config', {
      p_config_key: 'test_config_to_delete'
    })
    if (error) throw error
    return data
  }

  // 兑换卡管理测试函数
  const testGenerateCardNumber = async () => {
    const { data, error } = await supabase.rpc('generate_card_number')
    if (error) throw error
    return data
  }

  const testBatchCreateExchangeCards = async () => {
    const { data, error } = await supabase.rpc('batch_create_exchange_cards', {
      p_card_name: '测试兑换卡',
      p_points: 100,
      p_description: '这是一张测试兑换卡',
      p_quantity: 3
    })
    if (error) throw error
    return data
  }

  const testGetExchangeCardsList = async () => {
    const { data, error } = await supabase.rpc('get_exchange_cards_list')
    if (error) throw error
    return data
  }

  const testUpdateExchangeCard = async () => {
    // 首先获取一张卡来更新
    const { data: cards, error: listError } = await supabase.rpc('get_exchange_cards_list')
    if (listError) throw listError
    
    if (!cards || cards.length === 0) {
      throw new Error('没有可更新的兑换卡，请先创建一些测试卡片')
    }

    const cardToUpdate = cards[0]
    const { error } = await supabase.rpc('update_exchange_card', {
      p_card_number: cardToUpdate.卡号,
      p_card_name: '更新后的测试卡',
      p_points: 150,
      p_description: '这是更新后的测试兑换卡'
    })
    if (error) throw error
    return { updated: true, card_number: cardToUpdate.卡号 }
  }

  const testDeleteExchangeCard = async () => {
    // 首先获取一张卡来删除
    const { data: cards, error: listError } = await supabase.rpc('get_exchange_cards_list')
    if (listError) throw listError
    
    if (!cards || cards.length === 0) {
      throw new Error('没有可删除的兑换卡，请先创建一些测试卡片')
    }

    const cardToDelete = cards[0]
    const { error } = await supabase.rpc('delete_exchange_card', {
      p_card_number: cardToDelete.卡号
    })
    if (error) throw error
    return { deleted: true, card_number: cardToDelete.卡号 }
  }

  const testBatchDeleteExchangeCards = async () => {
    // 首先获取一些卡来删除
    const { data: cards, error: listError } = await supabase.rpc('get_exchange_cards_list')
    if (listError) throw listError
    
    if (!cards || cards.length === 0) {
      throw new Error('没有可删除的兑换卡，请先创建一些测试卡片')
    }

    // 取前两张卡进行批量删除测试
    const cardsToDelete = cards.slice(0, Math.min(2, cards.length)).map((card: ExchangeCard) => card.卡号)
    const { data, error } = await supabase.rpc('batch_delete_exchange_cards', {
      p_card_numbers: cardsToDelete
    })
    if (error) throw error
    return { deleted_count: data, card_numbers: cardsToDelete }
  }

  const testRedeemCard = async () => {
    // 首先获取一张未兑换的卡
    const { data: cards, error: listError } = await supabase.rpc('get_exchange_cards_list')
    if (listError) throw listError
    
    const availableCard = cards?.find((card: ExchangeCard) => card.状态 === true)
    if (!availableCard) {
      throw new Error('没有可兑换的卡片，请先创建一些测试卡片')
    }

    const { data, error } = await supabase.rpc('redeem_card', {
      card_number: availableCard.卡号
    })
    if (error) throw error
    return { redeemed: data, card_number: availableCard.卡号 }
  }

  const testGetExchangeCardsStats = async () => {
    const { data, error } = await supabase.rpc('get_exchange_cards_stats')
    if (error) throw error
    return data
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">数据库测试</h1>
        <Button onClick={clearResults} variant="outline">
          清除结果
        </Button>
      </div>

      {/* 用户信息 */}
      <Card>
        <CardHeader>
          <CardTitle>用户信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>用户ID:</strong> {user?.id || '未登录'}</p>
            <p><strong>邮箱:</strong> {user?.email || '未知'}</p>
            <p><strong>用户名:</strong> {profile?.username || '未设置'}</p>
            <p><strong>角色:</strong> {profile?.role || '未知'}</p>
          </div>
        </CardContent>
      </Card>

      {/* 测试按钮 */}
      <Card>
        <CardHeader>
          <CardTitle>数据库函数测试</CardTitle>
          <CardDescription>点击下方按钮测试各种数据库函数</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Button onClick={() => testFunction('管理员权限检查', testIsAdmin)} disabled={loading}>
              测试管理员权限
            </Button>
            <Button onClick={() => testFunction('获取API密钥列表', testGetApiKeysList)} disabled={loading}>
              获取API密钥
            </Button>
            <Button onClick={() => testFunction('添加API密钥', testUpsertApiKey)} disabled={loading}>
              添加API密钥
            </Button>
            <Button onClick={() => testFunction('获取应用配置', testGetAppConfigList)} disabled={loading}>
              获取应用配置
            </Button>
            <Button onClick={() => testFunction('更新应用配置', testUpsertAppConfig)} disabled={loading}>
              更新应用配置
            </Button>
            <Button onClick={() => testFunction('获取功能积分', testGetFunctionPoints)} disabled={loading}>
              获取功能积分
            </Button>
            <Button onClick={() => testFunction('按分类获取功能', testGetFunctionsByCategory)} disabled={loading}>
              按分类获取功能
            </Button>
            <Button onClick={() => testFunction('添加新分类', testAddNewCategory)} disabled={loading}>
              添加新分类
            </Button>
            <Button onClick={() => testFunction('添加功能到分类', testAddFunctionToCategory)} disabled={loading}>
              添加功能到分类
            </Button>
            <Button onClick={() => testFunction('更新现有分类', testUpdateExistingCategory)} disabled={loading}>
              更新现有分类
            </Button>
            <Button onClick={() => testFunction('更新现有功能', testUpdateExistingFunction)} disabled={loading}>
              更新现有功能
            </Button>
            <Button onClick={() => testFunction('删除配置', testDeleteConfig)} disabled={loading}>
              删除配置
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 兑换卡管理测试 */}
      <Card>
        <CardHeader>
          <CardTitle>兑换卡管理测试</CardTitle>
          <CardDescription>测试兑换卡相关的数据库函数</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <Button onClick={() => testFunction('生成卡号', testGenerateCardNumber)} disabled={loading}>
              生成随机卡号
            </Button>
            <Button onClick={() => testFunction('批量创建兑换卡', testBatchCreateExchangeCards)} disabled={loading}>
              批量创建兑换卡
            </Button>
            <Button onClick={() => testFunction('获取兑换卡列表', testGetExchangeCardsList)} disabled={loading}>
              获取兑换卡列表
            </Button>
            <Button onClick={() => testFunction('更新兑换卡', testUpdateExchangeCard)} disabled={loading}>
              更新兑换卡
            </Button>
            <Button onClick={() => testFunction('删除兑换卡', testDeleteExchangeCard)} disabled={loading}>
              删除兑换卡
            </Button>
            <Button onClick={() => testFunction('批量删除兑换卡', testBatchDeleteExchangeCards)} disabled={loading}>
              批量删除兑换卡
            </Button>
            <Button onClick={() => testFunction('兑换卡片', testRedeemCard)} disabled={loading}>
              兑换卡片
            </Button>
            <Button onClick={() => testFunction('获取兑换卡统计', testGetExchangeCardsStats)} disabled={loading}>
              获取兑换卡统计
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 测试结果 */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>测试结果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    result.status === 'success'
                      ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                      : result.status === 'error'
                      ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                      : 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{result.name}</h4>
                    <span className="text-xs text-gray-500">
                      {result.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <pre className="text-sm whitespace-pre-wrap break-words">
                    {result.message}
                  </pre>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}