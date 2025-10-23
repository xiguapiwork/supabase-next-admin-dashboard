require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('缺少 Supabase 环境变量')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function discoverFields() {
  console.log('逐步发现 tasks 表的字段结构...')
  
  try {
    // 先获取用户ID
    const { data: users, error: usersError } = await supabase
      .from('user-management')
      .select('id')
      .limit(1)
    
    if (usersError || !users || users.length === 0) {
      console.log('无法获取用户ID，跳过测试')
      return
    }
    
    const userId = users[0].id
    console.log('找到用户ID:', userId)
    
    // 根据迁移文件，尝试正确的字段名
    // 从 005_create_tasks.sql 中我们知道字段名应该是中文的
    const possibleFields = [
      { name: '任务ID', value: null }, // 这应该是自动生成的
      { name: '用户ID', value: userId },
      { name: '任务类型', value: 'test' },
      { name: '任务名称', value: '测试任务' },
      { name: '状态', value: 'pending' },
      { name: '积分消耗', value: 1 },
      { name: '扣除记录ID', value: null },
      { name: '退款记录ID', value: null },
      { name: '任务参数', value: { test: true } },
      { name: '任务结果', value: null },
      { name: '任务详情', value: '这是一个测试任务' },
      { name: '创建时间', value: null }, // 应该有默认值
      { name: '更新时间', value: null }  // 应该有默认值
    ]
    
    // 尝试只插入必需的字段
    const requiredFields = ['用户ID', '任务类型', '任务名称', '状态', '积分消耗']
    
    console.log('\n1. 尝试插入必需字段...')
    let testData = {}
    for (const fieldName of requiredFields) {
      const field = possibleFields.find(f => f.name === fieldName)
      if (field) {
        testData[field.name] = field.value
      }
    }
    
    console.log('测试数据:', testData)
    
    const { data: insertData, error: insertError } = await supabase
      .from('tasks')
      .insert(testData)
      .select()
    
    if (insertError) {
      console.error('插入失败:', insertError.message)
      
      // 如果失败，尝试一个一个字段来找出问题
      console.log('\n2. 逐个字段测试...')
      
      for (const fieldName of requiredFields) {
        const field = possibleFields.find(f => f.name === fieldName)
        if (field) {
          const singleFieldData = { [field.name]: field.value }
          console.log(`\n测试字段: ${field.name}`)
          
          const { data: singleData, error: singleError } = await supabase
            .from('tasks')
            .insert(singleFieldData)
            .select()
          
          if (singleError) {
            console.error(`  ❌ ${field.name}: ${singleError.message}`)
          } else {
            console.log(`  ✅ ${field.name}: 成功`)
            
            // 如果成功，删除这条测试数据
            if (singleData && singleData.length > 0) {
              const taskId = singleData[0]['任务ID'] || singleData[0]['id'] || singleData[0]['task_id']
              if (taskId) {
                await supabase.from('tasks').delete().eq('任务ID', taskId)
              }
            }
          }
        }
      }
    } else {
      console.log('✅ 插入成功!')
      console.log('插入的数据:', insertData)
      
      if (insertData && insertData.length > 0) {
        console.log('\n表的字段结构:')
        console.log(Object.keys(insertData[0]))
        
        // 现在我们知道了字段结构，可以测试查询
        console.log('\n3. 测试查询功能...')
        
        const { data: queryData, error: queryError } = await supabase
          .from('tasks')
          .select('*')
          .limit(5)
        
        if (queryError) {
          console.error('查询失败:', queryError.message)
        } else {
          console.log('✅ 查询成功!')
          console.log('查询结果:', queryData)
        }
        
        // 测试计数查询
        const { count, error: countError } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
        
        if (countError) {
          console.error('计数查询失败:', countError.message)
        } else {
          console.log('✅ 计数查询成功! 总数:', count)
        }
      }
    }
    
  } catch (error) {
    console.error('发现字段过程中发生错误:', error)
  }
}

discoverFields()