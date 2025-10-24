import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password, username, points, notes } = await request.json()
    
    // 调试日志：查看接收到的数据
    console.log('创建用户API接收到的数据:', { email, password: '***', username, points, notes })

    // 验证请求数据
    if (!email || !password || !username) {
      return NextResponse.json({ error: '缺少必要的用户信息' }, { status: 400 })
    }

    // 验证当前用户是否为管理员
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    // 检查用户是否为管理员
    const { data: profile, error: profileError } = await supabase
      .from('user-management')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json({ error: '权限不足，只有管理员可以创建用户' }, { status: 403 })
    }

    // 使用admin客户端创建用户
    const adminClient = createAdminClient()
    
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        username,
        notes: notes || null,
        points: points || 0
      },
      email_confirm: true
    })

    if (authError) {
      console.error('创建用户失败:', authError)
      return NextResponse.json({ error: `创建用户失败: ${authError.message}` }, { status: 400 })
    }

    // 用户创建成功，数据库触发器已经处理了备注和积分
    // 不需要再次更新用户资料
    console.log('用户创建成功，触发器已处理备注和积分')

    return NextResponse.json({ 
      user: authData.user,
      message: '用户创建成功'
    })

  } catch (error) {
    console.error('创建用户API错误:', error)
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    return NextResponse.json({ error: `服务器错误: ${errorMessage}` }, { status: 500 })
  }
}