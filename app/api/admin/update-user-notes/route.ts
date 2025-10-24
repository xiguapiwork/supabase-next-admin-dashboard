import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { userId, notes } = await request.json()

    // 验证请求数据
    if (!userId) {
      return NextResponse.json({ error: '缺少用户ID' }, { status: 400 })
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
      return NextResponse.json({ error: '权限不足，只有管理员可以更新用户备注' }, { status: 403 })
    }

    // 使用admin客户端更新用户备注
    const adminClient = createAdminClient()
    
    const { error: updateError } = await adminClient
      .from('user-management')
      .update({
        备注: notes || null
      })
      .eq('id', userId)

    if (updateError) {
      console.error('更新用户备注失败:', updateError)
      return NextResponse.json({ error: `更新用户备注失败: ${updateError.message}` }, { status: 400 })
    }

    return NextResponse.json({ 
      message: '用户备注更新成功'
    })

  } catch (error) {
    console.error('更新用户备注API错误:', error)
    const errorMessage = error instanceof Error ? error.message : '未知错误'
    return NextResponse.json({ error: `服务器错误: ${errorMessage}` }, { status: 500 })
  }
}