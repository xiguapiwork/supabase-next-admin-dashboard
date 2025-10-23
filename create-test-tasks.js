// 创建测试任务数据
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('缺少 Supabase 环境变量')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTestTasks() {
  console.log('创建测试任务数据...')
  
  try {
    // 首先获取一个用户ID
    console.log('1. 获取用户信息...')
    const { data: users, error: usersError } = await supabase
      .from('user-management')
      .select('id, username')
      .limit(1)
    
    if (usersError || !users || users.length === 0) {
      console.error('无法获取用户信息:', usersError)
      console.log('请先确保 user-management 表中有用户数据')
      return
    }
    
    const userId = users[0].id
    console.log('✓ 找到用户:', users[0].username, '(ID:', userId, ')')
    
    // 创建测试任务数据
    const testTasks = [
      {
        用户ID: userId,
        任务类型: 'image_generation',
        任务名称: '图像生成任务',
        状态: 'completed',
        积分消耗: 10,
        任务参数: { prompt: '生成一张美丽的风景图', style: 'realistic' },
        任务结果: { image_url: 'https://example.com/image1.jpg', size: '1024x1024' },
        任务详情: '成功生成了一张1024x1024的风景图像'
      },
      {
        用户ID: userId,
        任务类型: 'text_analysis',
        任务名称: '文本分析任务',
        状态: 'pending',
        积分消耗: 5,
        任务参数: { text: '这是一段需要分析的文本', analysis_type: 'sentiment' },
        任务结果: null,
        任务详情: '任务正在等待处理'
      },
      {
        用户ID: userId,
        任务类型: 'api_call',
        任务名称: 'API调用任务',
        状态: 'failed',
        积分消耗: 3,
        任务参数: { endpoint: '/api/translate', data: { text: 'Hello World' } },
        任务结果: null,
        任务详情: '网络连接超时，任务执行失败'
      },
      {
        用户ID: userId,
        任务类型: 'data_processing',
        任务名称: '数据处理任务',
        状态: 'processing',
        积分消耗: 8,
        任务参数: { file_id: 'file123', operation: 'transform' },
        任务结果: null,
        任务详情: '正在处理数据文件'
      },
      {
        用户ID: userId,
        任务类型: 'report_generation',
        任务名称: '报告生成任务',
        状态: 'cancelled',
        积分消耗: 15,
        任务参数: { report_type: 'monthly', date_range: '2024-01' },
        任务结果: null,
        任务详情: '用户取消了任务执行'
      }
    ]
    
    console.log('2. 插入测试任务数据...')
    const { data, error } = await supabase
      .from('tasks')
      .insert(testTasks)
      .select()
    
    if (error) {
      console.error('插入数据失败:', error)
      return
    }
    
    console.log('✓ 成功创建', data.length, '个测试任务')
    
    // 验证数据
    console.log('3. 验证插入的数据...')
    const { count, error: countError } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.error('验证数据失败:', countError)
      return
    }
    
    console.log('✓ 当前 tasks 表中共有', count, '条记录')
    
  } catch (error) {
    console.error('创建测试数据时发生错误:', error)
  }
}

createTestTasks()