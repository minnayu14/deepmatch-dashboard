// INPUT: POST请求 (messages), Dashboard数据, OpenRouter API, 环境变量
// OUTPUT: POST /api/chat - 返回AI对话回复
// POS: AI对话功能实现，当前在前端已隐藏但API保留
// 一旦我被更新，务必更新我的开头注释，以及所属文件夹的README.md

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xtwqwkpspphedyktjzoz.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0d3F3a3BzcHBoZWR5a3Rqem96Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjE4MzQ2NCwiZXhwIjoyMDc3NzU5NDY0fQ.iuwQccnnbEIBAP2DjV5jpPmVWz7pgsKnNd5g84ysGiY';

const TTAPI_API_KEY = process.env.TTAPI_API_KEY;
const TTAPI_BASE_URL = process.env.TTAPI_BASE_URL || 'https://api.ttapi.io/v1';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// 获取Dashboard数据摘要（用于AI上下文）
async function getDashboardSummary() {
  const { data: analyses, error } = await supabase
    .from('analyses')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  const uniqueUsers = new Set(analyses.map(a => a.user_id));
  const totalUsers = uniqueUsers.size;
  const totalAnalyses = analyses.length;

  // 计算回访率
  const userAnalysisCount = {};
  analyses.forEach(a => {
    userAnalysisCount[a.user_id] = (userAnalysisCount[a.user_id] || 0) + 1;
  });
  const returningUsers = Object.values(userAnalysisCount).filter(count => count > 1).length;
  const retentionRate = Math.round((returningUsers / totalUsers) * 100);

  // 今日数据
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const todayAnalyses = analyses.filter(a => new Date(a.created_at) > yesterday);
  const todayNewUsers = new Set(
    analyses
      .filter(a => new Date(a.first_visit) > yesterday)
      .map(a => a.user_id)
  ).size;

  // 脈あり度分布
  const scoreDistribution = {
    '0-20': 0,
    '21-40': 0,
    '41-60': 0,
    '61-80': 0,
    '81-100': 0
  };

  analyses.forEach(analysis => {
    const score = analysis.analysis_result?.脈あり度;
    if (score !== undefined) {
      if (score <= 20) scoreDistribution['0-20']++;
      else if (score <= 40) scoreDistribution['21-40']++;
      else if (score <= 60) scoreDistribution['41-60']++;
      else if (score <= 80) scoreDistribution['61-80']++;
      else scoreDistribution['81-100']++;
    }
  });

  // 最近分析
  const recentAnalyses = analyses.slice(0, 5).map(a => ({
    score: a.analysis_result?.脈あり度,
    distance: a.analysis_result?.距離感,
    evaluation: a.analysis_result?.総合評価?.substring(0, 50),
    imageCount: a.image_count,
    createdAt: a.created_at
  }));

  return {
    totalUsers,
    totalAnalyses,
    retentionRate,
    returningUsers,
    avgAnalysesPerUser: (totalAnalyses / totalUsers).toFixed(1),
    today: {
      newUsers: todayNewUsers,
      analyses: todayAnalyses.length,
      activeUsers: new Set(todayAnalyses.map(a => a.user_id)).size
    },
    scoreDistribution,
    recentAnalyses
  };
}

export async function POST(request) {
  try {
    const { messages } = await request.json();

    if (!messages || messages.length === 0) {
      return Response.json({
        success: false,
        error: '请提供对话消息'
      }, { status: 400 });
    }

    if (!TTAPI_API_KEY) {
      return Response.json({
        success: false,
        error: 'TTAPI API Key未配置'
      }, { status: 500 });
    }

    console.log('🤖 AI对话请求:', messages.length, '条消息');

    // 获取Dashboard数据
    const dashboardData = await getDashboardSummary();

    // 构建精简的数据上下文（直接嵌入用户问题中）
    const dataContext = `[数据概览 ${new Date().toLocaleDateString('zh-CN')}]
总用户${dashboardData.totalUsers}人，分析${dashboardData.totalAnalyses}次，回访率${dashboardData.retentionRate}%。
今日: 新增${dashboardData.today.newUsers}人，分析${dashboardData.today.analyses}次。

${messages[messages.length - 1].content}`;

    // 构建完整消息列表（只保留最新用户消息+数据）
    const fullMessages = [
      {
        role: 'user',
        content: dataContext
      }
    ];

    // 调用TTAPI (GPT-4)
    console.log('📡 调用TTAPI (GPT-4)...');
    const response = await fetch(`${TTAPI_BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'TT-API-KEY': TTAPI_API_KEY
      },
      body: JSON.stringify({
        model: 'gpt-4',
        max_tokens: 2048,
        messages: fullMessages
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ TTAPI调用失败:', response.status, errorText);
      throw new Error(`TTAPI调用失败: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ AI回复生成成功');

    // 提取回复内容 (OpenAI格式)
    const assistantMessage = result.choices?.[0]?.message?.content || '抱歉，我无法生成回复。';

    return Response.json({
      success: true,
      message: assistantMessage,
      usage: result.usage
    });

  } catch (error) {
    console.error('❌ AI对话失败:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
