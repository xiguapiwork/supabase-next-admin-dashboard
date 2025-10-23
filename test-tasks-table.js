// 测试 tasks 表结构和连接
require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

// 从环境变量获取 Supabase 配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('缺少 Supabase 环境变量')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testTasksTable() {
  console.log('测试 tasks 表结构和连接...')
  
  try {
    // 测试基本连接
    console.log('1. 测试基本连接...')
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('连接错误:', error)
      
      // 尝试获取表的元数据信息
      console.log('2. 尝试获取表信息...')
      const { data: tableInfo, error: tableError } = await supabase
        .rpc('get_table_columns', { table_name: 'tasks' })
      
      if (tableError) {
        console.error('获取表信息失败:', tableError)
      } else {
        console.log('表信息:', tableInfo)
      }
      
      return
    }
    
    console.log('✓ 连接成功')
    
    // 测试计数查询
    console.log('2. 测试计数查询...')
    const { count, error: countError } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.error('计数查询错误:', countError)
      return
    }
    
    console.log('✓ 计数查询成功，总记录数:', count)
    
    // 如果有数据，显示第一条记录的结构
    if (data && data.length > 0) {
      console.log('3. 第一条记录的字段结构:')
      console.log(Object.keys(data[0]))
      console.log('4. 第一条记录的内容:')
      console.log(data[0])
    } else {
      console.log('3. 表中暂无数据')
      
      // 尝试插入一条简单的测试数据来检查字段名
      console.log('4. 尝试插入测试数据来检查字段名...')
      
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
      
      // 尝试插入测试数据
      const testData = {
        '用户ID': userId,
        '任务类型': 'test',
        '任务名称': '测试任务',
        '状态': 'pending',
        '积分消耗': 1
      }
      
      const { data: insertData, error: insertError } = await supabase
        .from('tasks')
        .insert(testData)
        .select()
      
      if (insertError) {
        console.error('插入测试数据失败:', insertError)
        
        // 尝试不同的字段名格式
        console.log('5. 尝试不同的字段名格式...')
        const testData2 = {
          user_id: userId,
          task_type: 'test',
          task_name: '测试任务',
          status: 'pending',
          points_cost: 1
        }
        
        const { data: insertData2, error: insertError2 } = await supabase
          .from('tasks')
          .insert(testData2)
          .select()
        
        if (insertError2) {
          console.error('使用英文字段名也失败:', insertError2)
        } else {
          console.log('✓ 使用英文字段名成功插入:', insertData2)
        }
      } else {
        console.log('✓ 使用中文字段名成功插入:', insertData)
      }
    }
    
  } catch (error) {
    console.error('测试过程中发生错误:', error)
  }
}

testTasksTable()