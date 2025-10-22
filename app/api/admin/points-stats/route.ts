import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // 获取当前用户信息，验证是否为管理员
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 检查用户是否为管理员
    const { data: userProfile, error: profileError } = await supabase
      .from('user-management')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || userProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 获取积分统计数据
    const { data: pointsStats, error: statsError } = await supabase
      .rpc('get_points_statistics')

    if (statsError) {
      console.error('Error fetching points statistics:', statsError)
      return NextResponse.json({ error: 'Failed to fetch points statistics' }, { status: 500 })
    }

    return NextResponse.json(pointsStats)
  } catch (error) {
    console.error('Error in points-stats API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}