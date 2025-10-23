require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('缺少 Supabase 环境变量')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTableStructure() {
  console.log('检查 tasks 表的实际结构...')
  
  try {
    // 尝试插入一条测试数据来发现字段名
    console.log('1. 尝试插入数据来发现字段结构...')
    
    // 先获取用户ID
    const { data: users, error: usersError } = await supabase
      .from('user-management')
      .select('id')
      .limit(1)
    
    if (usersError || !users || users.length === 0) {
      console.log('无法获取用户ID，跳过插入测试')
      return
    }
    
    const userId = users[0].id
    console.log('找到用户ID:', userId)
    
    // 尝试不同的字段名组合
    const testCombinations = [
      // 原始中文字段名
      {
        name: '中文字段名',
        data: {
          '用户ID': userId,
          '任务类型': 'test',
          '任务名称': '测试任务',
          '状态': 'pending',
          '积分消耗': 1,
          '任务参数': { test: true },
          '任务结果': null,
          '任务详情': '这是一个测试任务'
        }
      },
      // 英文字段名
      {
        name: '英文字段名',
        data: {
          user_id: userId,
          task_type: 'test',
          task_name: '测试任务',
          status: 'pending',
          points_cost: 1,
          task_params: { test: true },
          task_result: null,
          task_details: '这是一个测试任务'
        }
      },
      // 混合字段名
      {
        name: '混合字段名',
        data: {
          user_id: userId,
          '任务类型': 'test',
          '任务名称': '测试任务',
          status: 'pending',
          '积分消耗': 1,
          '任务参数': { test: true },
          '任务结果': null,
          '任务详情': '这是一个测试任务'
        }
      }
    ]
    
    for (const combination of testCombinations) {
      console.log(`\n尝试 ${combination.name}:`)
      
      const { data: insertData, error: insertError } = await supabase
        .from('tasks')
        .insert(combination.data)
        .select()
      
      if (insertError) {
        console.error(`${combination.name} 失败:`, insertError.message)
      } else {
        console.log(`✓ ${combination.name} 成功!`)
        console.log('插入的数据:', insertData)
        
        // 如果成功，查询一下表中的数据来看字段结构
        const { data: allData, error: selectError } = await supabase
          .from('tasks')
          .select('*')
          .limit(1)
        
        if (!selectError && allData && allData.length > 0) {
          console.log('表中数据的字段结构:')
          console.log(Object.keys(allData[0]))
        }
        
        break
      }
    }

    
  } catch (error) {
    console.error('检查过程中发生错误:', error)
  }
}

checkTableStructure()