// INPUT: /api/dashboard-data, /api/daily-insight (数据API)
// OUTPUT: Dashboard主页面UI，展示运营数据和AI洞察
// POS: 应用唯一页面组件，用户访问的主界面
// 一旦我被更新，务必更新我的开头注释，以及所属文件夹的README.md

'use client';

import { useState, useEffect, useRef } from 'react';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  // AI聊天相关
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  // 每日洞察相关
  const [dailyInsight, setDailyInsight] = useState(null);
  const [insightLoading, setInsightLoading] = useState(false);

  // 加载Dashboard数据
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard-data');
      const result = await res.json();

      if (result.success) {
        setData(result);
        setLastUpdate(new Date(result.timestamp));
      } else {
        console.error('数据加载失败:', result.error);
      }
    } catch (error) {
      console.error('API调用失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 加载每日洞察
  const loadDailyInsight = async () => {
    setInsightLoading(true);
    try {
      const res = await fetch('/api/daily-insight');
      const result = await res.json();

      if (result.success) {
        setDailyInsight(result.insight);
      } else {
        console.error('洞察加载失败:', result.error);
      }
    } catch (error) {
      console.error('洞察API调用失败:', error);
    } finally {
      setInsightLoading(false);
    }
  };

  // 发送聊天消息
  const handleSendMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');

    // 添加用户消息
    const newHistory = [...chatHistory, { role: 'user', content: userMessage }];
    setChatHistory(newHistory);
    setChatLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newHistory })
      });

      const result = await res.json();

      if (result.success) {
        setChatHistory([...newHistory, { role: 'assistant', content: result.message }]);
      } else {
        console.error('AI回复失败:', result.error);
        setChatHistory([...newHistory, { role: 'assistant', content: `❌ 错误: ${result.error}` }]);
      }
    } catch (error) {
      console.error('聊天API调用失败:', error);
      setChatHistory([...newHistory, { role: 'assistant', content: '❌ 网络错误，请重试' }]);
    } finally {
      setChatLoading(false);
    }
  };

  // 页面加载时获取数据和洞察
  useEffect(() => {
    loadData();
    loadDailyInsight(); // 已改用GPT-4，重新启用
  }, []);

  // 自动滚动到聊天底部
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // 刷新数据
  const handleRefresh = () => {
    loadData();
  };

  if (loading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-semibold">正在加载数据...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-red-600 font-semibold">数据加载失败</p>
          <button onClick={handleRefresh} className="mt-4 px-4 py-2 bg-pink-500 text-white rounded-lg">
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Background Ornaments */}
      <div className="fixed top-[-10%] left-[-5%] w-[40%] h-[40%] bg-pink-100/30 blur-[120px] rounded-full -z-10"></div>
      <div className="fixed bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-blue-100/30 blur-[100px] rounded-full -z-10"></div>

      <div className="max-w-[1600px] mx-auto p-6 md:p-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-pink-100 text-pink-600 text-[10px] font-black rounded uppercase tracking-widest">Live</span>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Real-time Data from Supabase</p>
            </div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">
              Deepmatch <span className="text-slate-400 font-light">运营看板</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors border border-slate-200 shadow-sm disabled:opacity-50"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              刷新数据
            </button>
            <div className="flex items-center gap-4 bg-white p-2 pr-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="relative">
                <img src="https://picsum.photos/seed/admin/80/80" className="w-12 h-12 rounded-xl border-2 border-pink-50 object-cover" alt="Admin" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <p className="text-sm font-black text-slate-800">运营总监</p>
                <p className="text-[10px] text-slate-400 font-bold">
                  {lastUpdate ? `更新于 ${lastUpdate.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}` : '加载中...'}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* 每日洞察区域 */}
        <section className="bg-gradient-to-br from-purple-500 to-pink-500 p-6 rounded-3xl shadow-lg border border-purple-200 mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/20">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h2 className="text-white font-black text-lg">今日AI洞察</h2>
                <p className="text-purple-100 text-xs">基于实时数据的智能分析</p>
              </div>
            </div>
            <button
              onClick={loadDailyInsight}
              disabled={insightLoading}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
            >
              {insightLoading ? '生成中...' : '重新生成'}
            </button>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5">
            {insightLoading ? (
              <div className="flex items-center gap-3 text-white">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <p>AI正在分析数据...</p>
              </div>
            ) : dailyInsight ? (
              <div className="prose prose-sm prose-invert max-w-none">
                <div className="text-white whitespace-pre-wrap">{dailyInsight}</div>
              </div>
            ) : (
              <p className="text-white/80">暂无洞察数据</p>
            )}
          </div>
        </section>

        {/* Metrics Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* 总用户数 */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-2xl bg-pink-500 bg-opacity-10 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600">
                  实时
                </div>
              </div>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">总用户数</p>
            <h3 className="text-3xl font-black text-slate-800">{data.metrics.totalUsers}</h3>
            <p className="text-xs text-slate-400 mt-2">平均 {data.metrics.avgAnalysesPerUser} 次分析/用户</p>
          </div>

          {/* 总分析次数 */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-2xl bg-blue-500 bg-opacity-10 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600">
                  实时
                </div>
              </div>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">总分析次数</p>
            <h3 className="text-3xl font-black text-slate-800">{data.metrics.totalAnalyses}</h3>
            <p className="text-xs text-slate-400 mt-2">今日 {data.today.analyses} 次</p>
          </div>

          {/* 回访率 */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-2xl bg-purple-500 bg-opacity-10 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600">
                  实时
                </div>
              </div>
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">用户回访率</p>
            <h3 className="text-3xl font-black text-slate-800">{data.metrics.retentionRate}%</h3>
            <p className="text-xs text-slate-400 mt-2">{data.metrics.returningUsers} 人回访</p>
          </div>
        </section>

        {/* 最近用户 - 全宽 */}
        <div className="mb-10">
          {/* AI聊天助手 - 已隐藏 */}
          <section className="bg-white rounded-3xl shadow-sm border border-slate-100 hidden">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">AI运营助手</h2>
                  <p className="text-xs text-slate-400">问我任何关于数据的问题</p>
                </div>
              </div>
            </div>

            {/* 聊天历史 */}
            <div className="h-[400px] overflow-y-auto p-6 space-y-4">
              {chatHistory.length === 0 ? (
                <div className="text-center text-slate-400 mt-20">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-sm">开始提问吧！比如："今天的数据表现如何？"</p>
                </div>
              ) : (
                chatHistory.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white'
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 rounded-2xl px-4 py-3">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* 输入框 */}
            <div className="p-6 border-t border-slate-200">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="输入你的问题..."
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={chatLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={chatLoading || !chatInput.trim()}
                  className="px-6 py-3 bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  发送
                </button>
              </div>
            </div>
          </section>

          {/* 最近用户 */}
          <section className="bg-white rounded-3xl shadow-sm border border-slate-100">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">最近用户</h2>
              <span className="text-xs text-slate-500">显示前10位</span>
            </div>
            <div className="p-6 space-y-3 h-[520px] overflow-y-auto">
              {data.recentAnalyses.slice(0, 10).map((analysis, idx) => (
                <div key={analysis.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${
                      idx % 3 === 0 ? 'from-pink-400 to-rose-400' :
                      idx % 3 === 1 ? 'from-blue-400 to-cyan-400' :
                      'from-purple-400 to-indigo-400'
                    } rounded-xl flex items-center justify-center text-white font-bold text-sm`}>
                      {idx + 1}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">{analysis.userId.substring(0, 16)}...</div>
                      <div className="text-xs text-slate-400">
                        {new Date(analysis.createdAt).toLocaleString('zh-CN')} · {analysis.imageCount}张图片
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      analysis.score >= 80 ? 'bg-green-100 text-green-700' :
                      analysis.score >= 60 ? 'bg-blue-100 text-blue-700' :
                      analysis.score >= 40 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {analysis.score}分
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
