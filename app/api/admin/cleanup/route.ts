import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// 定义数据库记录类型
interface ExchangeCard {
  卡号: string
  卡片名称: string
  状态: boolean
  创建时间: string
}

interface PointsLog {
  积分记录ID: string
  创建时间: string
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY!

// 使用服务角色密钥创建客户端，绕过RLS
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { type, ...params } = await request.json()

    // 验证请求来源和权限
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: '未授权' }, { status: 401 })
    }

    // 创建普通客户端验证用户权限
    const supabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    
    if (authError || !user) {
      return NextResponse.json({ error: '用户验证失败' }, { status: 401 })
    }

    // 检查用户是否为管理员
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user-management')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json({ error: '权限不足，只有管理员可以执行数据清理' }, { status: 403 })
    }

    let result
    switch (type) {
      case 'inactive_users':
        result = await cleanupInactiveUsers(params.days, params.maxPoints)
        break
      case 'exchange_cards':
        result = await cleanupExchangeCards(params.days, params.status)
        break
      case 'points_logs':
        result = await cleanupPointsLogs(params.days)
        break
      default:
        return NextResponse.json({ error: '无效的清理类型' }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('数据清理API错误:', error)
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 })
  }
}

// 清理长时间未登录用户
async function cleanupInactiveUsers(days: number, maxPoints: number) {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)

  // 查找符合条件的用户
  const { data: usersToDelete, error: findError } = await supabaseAdmin
    .from('user-management')
    .select('id, username, points, updated_at')
    .lte('points', maxPoints)
    .lt('updated_at', cutoffDate.toISOString())
    .neq('role', 'admin') // 不删除管理员

  if (findError) {
    throw new Error(`查找用户失败: ${findError.message}`)
  }

  if (!usersToDelete || usersToDelete.length === 0) {
    return { success: true, deletedCount: 0, message: '没有找到符合条件的用户' }
  }

  // 删除用户（级联删除会自动处理相关数据）
  const userIds = usersToDelete.map(user => user.id)
  const { error: deleteError } = await supabaseAdmin
    .from('user-management')
    .delete()
    .in('id', userIds)

  if (deleteError) {
    throw new Error(`删除用户失败: ${deleteError.message}`)
  }

  return {
    success: true,
    deletedCount: usersToDelete.length,
    message: `成功清除 ${usersToDelete.length} 个长时间未登录用户`,
    deletedUsers: usersToDelete.map(u => ({ id: u.id, username: u.username, points: u.points }))
  }
}

// 清理兑换卡
async function cleanupExchangeCards(days: number, status: string) {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)

  let query = supabaseAdmin
    .from('exchange-cards')
    .select('卡号, 卡片名称, 状态, 创建时间')
    .lt('创建时间', cutoffDate.toISOString())

  // 根据状态过滤：已兑换 = false，可用 = true
  if (status === '已兑换') {
    query = query.eq('状态', false)
  } else if (status === '可用') {
    query = query.eq('状态', true)
  }
  // 如果是"所有状态"，则不添加状态过滤

  const { data: cardsToDelete, error: findError } = await query

  if (findError) {
    throw new Error(`查找兑换卡失败: ${findError.message}`)
  }

  if (!cardsToDelete || cardsToDelete.length === 0) {
    return { success: true, deletedCount: 0, message: '没有找到符合条件的兑换卡' }
  }

  // 删除兑换卡
  const cardNumbers = (cardsToDelete as unknown as ExchangeCard[]).map((card) => card['卡号'])
  const { error: deleteError } = await supabaseAdmin
    .from('exchange-cards')
    .delete()
    .in('卡号', cardNumbers)

  if (deleteError) {
    throw new Error(`删除兑换卡失败: ${deleteError.message}`)
  }

  return {
    success: true,
    deletedCount: cardsToDelete.length,
    message: `成功清除 ${cardsToDelete.length} 张兑换卡`,
    deletedCards: (cardsToDelete as unknown as ExchangeCard[]).map((c) => ({ 
      卡号: c['卡号'], 
      卡片名称: c['卡片名称'], 
      状态: c['状态'] ? '可用' : '已兑换' 
    }))
  }
}

// 清理积分日志
async function cleanupPointsLogs(days: number) {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)

  // 查找符合条件的积分日志
  const { data: logsToDelete, error: findError } = await supabaseAdmin
    .from('points_log')
    .select('积分记录ID, 创建时间')
    .lt('创建时间', cutoffDate.toISOString())

  if (findError) {
    throw new Error(`查找积分日志失败: ${findError.message}`)
  }

  if (!logsToDelete || logsToDelete.length === 0) {
    return { success: true, deletedCount: 0, message: '没有找到符合条件的积分日志' }
  }

  // 删除积分日志
  const logIds = (logsToDelete as unknown as PointsLog[]).map((log) => log['积分记录ID'])
  const { error: deleteError } = await supabaseAdmin
    .from('points_log')
    .delete()
    .in('积分记录ID', logIds)

  if (deleteError) {
    throw new Error(`删除积分日志失败: ${deleteError.message}`)
  }

  return {
    success: true,
    deletedCount: logsToDelete.length,
    message: `成功清除 ${logsToDelete.length} 条积分日志记录`
  }
}