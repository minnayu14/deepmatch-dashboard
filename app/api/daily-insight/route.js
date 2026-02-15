// 每日洞察API - AI自动生成运营洞察报告
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const SUPABASE_URL = 'https://xtwqwkpspphedyktjzoz.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0d3F3a3BzcHBoZWR5a3Rqem96Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjE4MzQ2NCwiZXhwIjoyMDc3NzU5NDY0fQ.iuwQccnnbEIBAP2DjV5jpPmVWz7pgsKnNd5g84ysGiY';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// 获取今日数据（只分析过去24小时）
async function getTodayData() {
  // 获取过去24小时的数据
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: todayAnalyses, error } = await supabase
    .from('analyses')
    .select('*')
    .gte('created_at', yesterday)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // 获取总体统计（用于对比）
  const { count: totalUsers } = await supabase
    .from('analyses')
    .select('user_id', { count: 'exact', head: true });

  const { count: totalAnalyses } = await supabase
    .from('analyses')
    .select('*', { count: 'exact', head: true });

  // 今日新增用户
  const todayNewUsers = new Set(
    todayAnalyses
      .filter(a => new Date(a.first_visit) >= new Date(yesterday))
      .map(a => a.user_id)
  );

  // 今日脈あり度分布
  const scoreDistribution = {
    '高分(61-100)': 0,
    '中等(41-60)': 0,
    '低分(0-40)': 0
  };

  todayAnalyses.forEach(analysis => {
    const score = analysis.analysis_result?.脈あり度;
    if (score !== undefined) {
      if (score >= 61) scoreDistribution['高分(61-100)']++;
      else if (score >= 41) scoreDistribution['中等(41-60)']++;
      else scoreDistribution['低分(0-40)']++;
    }
  });

  // 今日活跃用户
  const todayActiveUsers = new Set(todayAnalyses.map(a => a.user_id));

  return {
    totalUsers,
    totalAnalyses,
    today: {
      newUsers: todayNewUsers.size,
      analyses: todayAnalyses.length,
      activeUsers: todayActiveUsers.size,
      scoreDistribution
    }
  };
}

export async function GET() {
  try {
    if (!OPENROUTER_API_KEY) {
      return Response.json({
        success: false,
        error: 'OpenRouter API Key未配置'
      }, { status: 500 });
    }

    console.log('📊 生成每日洞察报告...');

    // 获取今日数据
    const data = await getTodayData();

    // 构建精简的分析提示词
    const analysisPrompt = `你是DeepMatch运营分析师。分析今日数据并给出洞察。

**今日数据 (过去24h)**
- 新增用户: ${data.today.newUsers}人
- 分析次数: ${data.today.analyses}次
- 活跃用户: ${data.today.activeUsers}人
- 高分(61-100): ${data.today.scoreDistribution['高分(61-100)']}次
- 中等(41-60): ${data.today.scoreDistribution['中等(41-60)']}次
- 低分(0-40): ${data.today.scoreDistribution['低分(0-40)']}次

**对比**
- 累计用户: ${data.totalUsers}人
- 累计分析: ${data.totalAnalyses}次

请简要分析（200字内）：
1. 今日表现如何？
2. 有什么值得关注的？
3. 给1-2条运营建议

用简洁中文，直接输出分析。`;

    // 调用OpenRouter (Claude Sonnet) - 使用fetch
    const apiUrl = `${OPENROUTER_BASE_URL}/chat/completions`;
    console.log('📡 调用OpenRouter:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`
      },
      body: JSON.stringify({
        model: 'openai/gpt-4-turbo',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: analysisPrompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenRouter调用失败:', response.status, errorText);
      throw new Error(`OpenRouter调用失败: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ 每日洞察生成成功');

    // 提取分析内容 (OpenAI格式)
    const insight = result.choices?.[0]?.message?.content || '无法生成洞察报告';

    return Response.json({
      success: true,
      insight,
      data,
      generatedAt: new Date().toISOString(),
      usage: result.usage
    });

  } catch (error) {
    console.error('❌ 每日洞察生成失败:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
