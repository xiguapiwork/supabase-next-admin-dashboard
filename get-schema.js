require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('缺少 Supabase 环境变量')
  process.exit(1)
}

async function getSchema() {
  console.log('通过 REST API 获取表结构...')
  
  try {
    // 使用 Supabase REST API 的 OPTIONS 请求来获取表结构
    const response = await fetch(`${supabaseUrl}/rest/v1/tasks`, {
      method: 'OPTIONS',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('响应状态:', response.status)
    console.log('响应头:')
    for (const [key, value] of response.headers.entries()) {
      console.log(`  ${key}: ${value}`)
    }
    
    if (response.ok) {
      const text = await response.text()
      console.log('响应内容:', text)
    } else {
      console.log('请求失败')
    }
    
    // 尝试 GET 请求来看看错误信息
    console.log('\n尝试 GET 请求...')
    const getResponse = await fetch(`${supabaseUrl}/rest/v1/tasks?select=*&limit=1`, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
      }
    })
    
    console.log('GET 响应状态:', getResponse.status)
    const getResult = await getResponse.text()
    console.log('GET 响应内容:', getResult)
    
  } catch (error) {
    console.error('获取 schema 时发生错误:', error)
  }
}

getSchema()