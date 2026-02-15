// 临时脚本：检查Supabase数据库schema
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xtwqwkpspphedyktjzoz.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0d3F3a3BzcHBoZWR5a3Rqem96Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjE4MzQ2NCwiZXhwIjoyMDc3NzU5NDY0fQ.iuwQccnnbEIBAP2DjV5jpPmVWz7pgsKnNd5g84ysGiY';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function checkSchema() {
  console.log('🔍 检查数据库schema...\n');

  // 1. 查看 analyses 表
  console.log('📊 === ANALYSES 表 ===');
  const { data: analysesData, error: analysesError } = await supabase
    .from('analyses')
    .select('*')
    .limit(3);

  if (analysesError) {
    console.error('❌ 读取analyses表失败:', analysesError);
  } else {
    console.log(`✅ 成功读取，当前有 ${analysesData?.length || 0} 条记录（显示前3条）`);
    if (analysesData && analysesData.length > 0) {
      console.log('\n字段结构示例:');
      console.log(JSON.stringify(analysesData[0], null, 2));
    }
  }

  // 2. 查看 user_events 表
  console.log('\n\n📊 === USER_EVENTS 表 ===');
  const { data: eventsData, error: eventsError } = await supabase
    .from('user_events')
    .select('*')
    .limit(3);

  if (eventsError) {
    console.error('❌ 读取user_events表失败:', eventsError);
  } else {
    console.log(`✅ 成功读取，当前有 ${eventsData?.length || 0} 条记录（显示前3条）`);
    if (eventsData && eventsData.length > 0) {
      console.log('\n字段结构示例:');
      console.log(JSON.stringify(eventsData[0], null, 2));
    }
  }

  // 3. 统计数据
  console.log('\n\n📊 === 数据统计 ===');

  const { count: totalAnalyses } = await supabase
    .from('analyses')
    .select('*', { count: 'exact', head: true });

  const { count: totalEvents } = await supabase
    .from('user_events')
    .select('*', { count: 'exact', head: true });

  console.log(`总分析记录: ${totalAnalyses} 条`);
  console.log(`总事件记录: ${totalEvents} 条`);

  // 4. 获取唯一用户数
  const { data: uniqueUsers } = await supabase
    .from('analyses')
    .select('user_id');

  if (uniqueUsers) {
    const userIds = new Set(uniqueUsers.map(u => u.user_id));
    console.log(`唯一用户数: ${userIds.size} 人`);
  }
}

checkSchema().catch(console.error);
