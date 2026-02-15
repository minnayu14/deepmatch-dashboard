// Dashboard数据API - 返回所有运营数据
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xtwqwkpspphedyktjzoz.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh0d3F3a3BzcHBoZWR5a3Rqem96Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjE4MzQ2NCwiZXhwIjoyMDc3NzU5NDY0fQ.iuwQccnnbEIBAP2DjV5jpPmVWz7pgsKnNd5g84ysGiY';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

export async function GET() {
  try {
    console.log('🔄 获取Dashboard数据...');

    // 1. 获取所有分析记录
    const { data: analyses, error: analysesError } = await supabase
      .from('analyses')
      .select('*')
      .order('created_at', { ascending: false });

    if (analysesError) throw analysesError;

    // 2. 获取所有事件记录
    const { data: events, error: eventsError } = await supabase
      .from('user_events')
      .select('*')
      .order('created_at', { ascending: false });

    if (eventsError) throw eventsError;

    // 3. 计算基础指标
    const uniqueUsers = new Set(analyses.map(a => a.user_id));
    const totalUsers = uniqueUsers.size;
    const totalAnalyses = analyses.length;

    // 4. 计算回访用户（分析次数>1）
    const userAnalysisCount = {};
    analyses.forEach(a => {
      userAnalysisCount[a.user_id] = (userAnalysisCount[a.user_id] || 0) + 1;
    });
    const returningUsers = Object.values(userAnalysisCount).filter(count => count > 1).length;
    const retentionRate = Math.round((returningUsers / totalUsers) * 100);

    // 5. 今日数据（过去24小时）
    const now = new Date();
    const yesterday = new Date(now - 24 * 60 * 60 * 1000);
    const todayAnalyses = analyses.filter(a => new Date(a.created_at) > yesterday);
    const todayNewUsers = new Set(
      analyses
        .filter(a => new Date(a.first_visit) > yesterday)
        .map(a => a.user_id)
    ).size;

    // 6. 用户列表详情
    const userDetails = {};
    analyses.forEach(analysis => {
      const userId = analysis.user_id;
      if (!userDetails[userId]) {
        userDetails[userId] = {
          userId: userId,
          analysisCount: 0,
          totalImages: 0,
          scores: [],
          firstVisit: analysis.first_visit,
          lastAnalysis: analysis.created_at,
          analyses: []
        };
      }
      userDetails[userId].analysisCount++;
      userDetails[userId].totalImages += analysis.image_count || 0;

      if (analysis.analysis_result?.脈あり度) {
        userDetails[userId].scores.push(analysis.analysis_result.脈あり度);
      }

      userDetails[userId].analyses.push({
        id: analysis.id,
        score: analysis.analysis_result?.脈あり度,
        evaluation: analysis.analysis_result?.総合評価,
        imageCount: analysis.image_count,
        createdAt: analysis.created_at,
        chatPreview: analysis.chat_content?.substring(0, 100)
      });
    });

    // 计算平均分
    Object.values(userDetails).forEach(user => {
      if (user.scores.length > 0) {
        user.avgScore = Math.round(
          user.scores.reduce((a, b) => a + b, 0) / user.scores.length
        );
      }
    });

    // 按分析次数排序
    const sortedUsers = Object.values(userDetails)
      .sort((a, b) => b.analysisCount - a.analysisCount);

    // 7. 脈あり度分布
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

    // 8. 最近10次分析
    const recentAnalyses = analyses.slice(0, 10).map(a => ({
      id: a.id,
      userId: a.user_id,
      score: a.analysis_result?.脈あり度,
      distance: a.analysis_result?.距離感,
      evaluation: a.analysis_result?.総合評価,
      imageCount: a.image_count,
      createdAt: a.created_at,
      chatPreview: a.chat_content?.substring(0, 100) + '...'
    }));

    // 9. 计算过去7天趋势
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayAnalyses = analyses.filter(a => {
        const createdAt = new Date(a.created_at);
        return createdAt >= date && createdAt < nextDate;
      });

      const dayNewUsers = new Set(
        analyses
          .filter(a => {
            const firstVisit = new Date(a.first_visit);
            return firstVisit >= date && firstVisit < nextDate;
          })
          .map(a => a.user_id)
      ).size;

      last7Days.push({
        date: date.toISOString().split('T')[0],
        analysisCount: dayAnalyses.length,
        newUsers: dayNewUsers
      });
    }

    // 返回完整数据
    const responseData = {
      success: true,
      timestamp: now.toISOString(),

      // 基础指标
      metrics: {
        totalUsers,
        totalAnalyses,
        retentionRate,
        returningUsers,
        avgAnalysesPerUser: (totalAnalyses / totalUsers).toFixed(1)
      },

      // 今日数据
      today: {
        newUsers: todayNewUsers,
        analyses: todayAnalyses.length,
        activeUsers: new Set(todayAnalyses.map(a => a.user_id)).size
      },

      // 用户列表
      users: sortedUsers,

      // 最近分析
      recentAnalyses,

      // 分布数据
      distributions: {
        scoreDistribution
      },

      // 趋势数据
      trends: {
        last7Days
      }
    };

    console.log('✅ Dashboard数据获取成功', {
      用户数: totalUsers,
      分析数: totalAnalyses,
      回访率: retentionRate + '%'
    });

    return Response.json(responseData);

  } catch (error) {
    console.error('❌ Dashboard数据获取失败:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
