const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseStructure() {
  try {
    console.log('🔍 测试数据库表结构...\n');
    
    // 测试 points_log 表结构
    console.log('📊 测试 points_log 表结构:');
    const { data: pointsLogData, error: pointsLogError } = await supabase
      .from('points_log')
      .select('*')
      .limit(1);
    
    if (pointsLogError) {
      console.log('❌ points_log 表查询失败:', pointsLogError.message);
    } else {
      console.log('✅ points_log 表结构正常');
    }
    
    // 测试 tasks 表结构
    console.log('\n📋 测试 tasks 表结构:');
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .limit(1);
    
    if (tasksError) {
      console.log('❌ tasks 表查询失败:', tasksError.message);
    } else {
      console.log('✅ tasks 表结构正常');
    }
    
    // 测试 exchange-cards 表结构
    console.log('\n🎫 测试 exchange-cards 表结构:');
    const { data: cardsData, error: cardsError } = await supabase
      .from('exchange-cards')
      .select('*')
      .limit(1);
    
    if (cardsError) {
      console.log('❌ exchange-cards 表查询失败:', cardsError.message);
    } else {
      console.log('✅ exchange-cards 表结构正常');
    }
    
    // 测试 user-management 表结构
    console.log('\n👤 测试 user-management 表结构:');
    const { data: usersData, error: usersError } = await supabase
      .from('user-management')
      .select('*')
      .limit(1);
    
    if (usersError) {
      console.log('❌ user-management 表查询失败:', usersError.message);
    } else {
      console.log('✅ user-management 表结构正常');
    }
    
    console.log('\n🎉 数据库表结构测试完成！');
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
  }
}

testDatabaseStructure();