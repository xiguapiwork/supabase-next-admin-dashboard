'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface TestResult {
  function: string
  params: Record<string, unknown>
  success: boolean
  data?: unknown
  error?: string | null
  timestamp: string
}

export default function TestDbPage() {
  const [user, setUser] = useState<unknown>(null)
  const [profile, setProfile] = useState<unknown>(null)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(false)
  
  const supabase = createClient()

  const loadUserInfo = useCallback(async () => {
    try {
      // 获取当前用户
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        // 获取用户资料
        const { data: profile } = await supabase
          .from('user-management')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(profile)
      }
    } catch (error) {
      console.error('加载用户信息失败:', error)
    }
  }, [supabase])

  useEffect(() => {
    loadUserInfo()
  }, [loadUserInfo])

  const testFunction = async (functionName: string, params: Record<string, unknown> = {}) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.rpc(functionName, params)
      
      const result: TestResult = {
        function: functionName,
        params,
        success: !error,
        data: data,
        error: error?.message || null,
        timestamp: new Date().toLocaleTimeString()
      }
      
      setTestResults(prev => [result, ...prev])
      return result
    } catch (error: unknown) {
      const result: TestResult = {
        function: functionName,
        params,
        success: false,
        data: null,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toLocaleTimeString()
      }
      setTestResults(prev => [result, ...prev])
      return result
    } finally {
      setLoading(false)
    }
  }

  const testIsAdmin = () => testFunction('is_admin')
  const testGetApiKeysList = () => testFunction('get_api_keys_list')
  const testUpsertApiKey = () => testFunction('upsert_api_key', {
    p_name: '测试Key',
    p_key: 'test-key-12345',
    p_enabled: true
  })

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">数据库函数测试</h1>
      
      {/* 用户信息 */}
      <Card>
        <CardHeader>
          <CardTitle>当前用户信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>用户ID:</strong> {(user as { id?: string })?.id || '未登录'}</p>
            <p><strong>邮箱:</strong> {(user as { email?: string })?.email || '无'}</p>
            <p><strong>角色:</strong> {(profile as { role?: string })?.role || '未知'}</p>
            <p><strong>用户名:</strong> {(profile as { username?: string })?.username || '无'}</p>
          </div>
        </CardContent>
      </Card>

      {/* 测试按钮 */}
      <Card>
        <CardHeader>
          <CardTitle>函数测试</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <Button onClick={testIsAdmin} disabled={loading}>
              测试 is_admin()
            </Button>
            <Button onClick={testGetApiKeysList} disabled={loading}>
              测试 get_api_keys_list()
            </Button>
            <Button onClick={testUpsertApiKey} disabled={loading}>
              测试 upsert_api_key()
            </Button>
            <Button 
              onClick={() => setTestResults([])} 
              variant="outline"
            >
              清空结果
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 测试结果 */}
      <Card>
        <CardHeader>
          <CardTitle>测试结果</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {testResults.length === 0 ? (
              <p className="text-gray-500">暂无测试结果</p>
            ) : (
              testResults.map((result, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded border ${
                    result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{result.function}</h4>
                    <span className="text-sm text-gray-500">{result.timestamp}</span>
                  </div>
                  
                  {Object.keys(result.params).length > 0 && (
                    <div className="mb-2">
                      <strong>参数:</strong>
                      <pre className="text-sm bg-gray-100 p-2 rounded mt-1">
                        {JSON.stringify(result.params, null, 2)}
                      </pre>
                    </div>
                  )}
                  
                  {result.success ? (
                    <div>
                      <strong className="text-green-600">成功:</strong>
                      <pre className="text-sm bg-gray-100 p-2 rounded mt-1">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div>
                      <strong className="text-red-600">错误:</strong>
                      <p className="text-sm text-red-600 mt-1">{result.error}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}