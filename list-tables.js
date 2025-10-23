require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('缺少 Supabase 环境变量')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function listTables() {
  console.log('列出所有可用的表...')
  
  // 尝试查询一些常见的表名
  const tableNames = [
    'tasks',
    'task',
    'task_logs',
    'task-logs',
    'user-management',
    'users',
    'points-log',
    'exchange-cards'
  ]
  
  for (const tableName of tableNames) {
    try {
      console.log(`\n检查表: ${tableName}`)
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1)
      
      if (error) {
        console.log(`❌ ${tableName}: ${error.message}`)
      } else {
        console.log(`✅ ${tableName}: 存在`)
        if (data && data.length > 0) {
          console.log(`   字段: ${Object.keys(data[0]).join(', ')}`)
        } else {
          console.log(`   表为空`)
        }
      }
    } catch (err) {
      console.log(`❌ ${tableName}: ${err.message}`)
    }
  }
  
  // 尝试查询 tasks 表的不同变体
  console.log('\n\n尝试 tasks 表的不同查询方式...')
  
  const queries = [
    { name: 'select *', query: () => supabase.from('tasks').select('*').limit(1) },
    { name: 'select count', query: () => supabase.from('tasks').select('*', { count: 'exact', head: true }) },
    { name: 'select 任务ID', query: () => supabase.from('tasks').select('任务ID').limit(1) },
    { name: 'select id', query: () => supabase.from('tasks').select('id').limit(1) },
    { name: 'select task_id', query: () => supabase.from('tasks').select('task_id').limit(1) }
  ]
  
  for (const { name, query } of queries) {
    try {
      console.log(`\n尝试: ${name}`)
      const result = await query()
      
      if (result.error) {
        console.log(`❌ ${name}: ${result.error.message}`)
      } else {
        console.log(`✅ ${name}: 成功`)
        if (result.data) {
          console.log(`   数据: ${JSON.stringify(result.data)}`)
        }
        if (result.count !== undefined) {
          console.log(`   计数: ${result.count}`)
        }
      }
    } catch (err) {
      console.log(`❌ ${name}: ${err.message}`)
    }
  }
}

listTables()