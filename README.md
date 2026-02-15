# Deepmatch 运营看板

> 独立的运营数据监控后台，集成AI智能分析功能

## 🚀 快速启动

```bash
cd /Users/yuzhi/Desktop/deepmatch_jp/dashboard
npm install
npm run dev
```

访问: **http://localhost:3001**

## 📁 项目结构

```
dashboard/
├── app/
│   ├── page.js                    # Dashboard主页面
│   ├── layout.js                  # 全局布局
│   ├── globals.css                # 全局样式
│   └── api/
│       ├── dashboard-data/        # 数据API
│       │   └── route.js
│       ├── chat/                  # AI对话API
│       │   └── route.js
│       └── daily-insight/         # 每日洞察API
│           └── route.js
├── package.json
├── next.config.js
├── tailwind.config.js
├── .env.local                     # 环境变量（已配置）
└── check-schema.js                # 数据库探查工具
```

## ✨ 功能特性

### 1. 实时数据展示
- ✅ 总用户数
- ✅ 总分析次数
- ✅ 用户回访率
- ✅ 最近10位用户列表
- ✅ 今日数据统计（过去24小时）

### 2. AI每日洞察 ✨
- 🤖 AI自动生成运营洞察报告
- 📊 数据亮点分析
- 👥 用户行为洞察
- ⚠️ 潜在问题识别
- 💡 运营改进建议

### 3. AI对话助手 ✨
- 💬 多轮对话能力
- 📈 基于实时Supabase数据回答问题
- 🎯 提供运营建议和数据洞察
- 🔄 保持上下文

## 🔧 环境配置

已在 `.env.local` 配置：

```bash
# Supabase
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# TTAPI (Claude API代理)
TTAPI_API_KEY=d7f10316-2c64-e114-f51e-6e9e9f75feb1
TTAPI_BASE_URL=https://api.ttapi.io/v1
```

## 📡 API端点

### 1. 获取Dashboard数据
```bash
GET /api/dashboard-data
```

返回所有运营指标、用户列表、趋势数据等。

### 2. AI对话
```bash
POST /api/chat
Content-Type: application/json

{
  "messages": [
    { "role": "user", "content": "今天的数据表现如何？" }
  ]
}
```

返回AI回复和上下文保持。

### 3. 每日洞察
```bash
GET /api/daily-insight
```

自动生成AI分析报告。

## 🎨 技术栈

- **框架**: Next.js 16.0.10 (App Router)
- **React**: 19.2.0
- **样式**: Tailwind CSS 4
- **数据库**: Supabase PostgreSQL
- **AI**: Claude via TTAPI

## 💻 开发命令

```bash
# 安装依赖
npm install

# 启动开发服务器（端口3001）
npm run dev

# 构建生产版本
npm build

# 启动生产服务器
npm start

# 检查数据库Schema
npm run check-schema
```

## 📊 数据说明

### 当前数据（2026-02-15）
- 总用户: 64人
- 总分析: 290次
- 回访率: 45%
- 今日新增: 8人

### 数据来源
所有数据来自Supabase数据库：
- `analyses` 表 - 分析记录
- `user_events` 表 - 用户事件

## 🔐 权限说明

Dashboard使用 `SUPABASE_SERVICE_ROLE_KEY` 访问数据库，绕过RLS规则，确保完整数据访问。

## 🎯 与主项目隔离

**重要**: Dashboard是完全独立的项目，与 `/web` 主网站分离：

- Dashboard端口: **3001**
- 主网站端口: **3000**
- 代码完全隔离，不影响主项目
- 独立的依赖管理
- 独立的Git管理（可选）

## 📝 使用示例

### AI对话示例问题

1. "今天的数据表现如何？"
2. "用户回访率为什么这么低？"
3. "如何提升用户活跃度？"
4. "最近的用户行为有什么趋势？"
5. "给我一些运营建议"

### 每日洞察

点击"重新生成"按钮，AI会基于最新数据生成：
- 数据亮点（2-3条）
- 用户行为洞察（3-4条）
- 潜在问题（2-3条）
- 运营建议（3-5条）

## 🐛 常见问题

**Q: 端口3001被占用？**
```bash
lsof -i :3001
kill -9 <PID>
```

**Q: AI回复失败？**
- 检查TTAPI_API_KEY是否正确
- 检查网络连接
- 查看浏览器Console错误

**Q: 数据不更新？**
- 点击"刷新数据"按钮
- 检查Supabase连接

## 📮 下一步计划

- [ ] 邮件报告系统（Resend + Vercel Cron）
- [ ] 图表可视化（7天趋势）
- [ ] 详情弹窗（点击指标查看详情）
- [ ] 密码保护
- [ ] 移动端适配

## 📞 联系方式

**项目路径**: `/Users/yuzhi/Desktop/deepmatch_jp/dashboard/`
**访问地址**: http://localhost:3001
**文档**: 见 `DASHBOARD-PROJECT.md`

---

最后更新: 2026-02-15
版本: v2.0 (AI集成完成)
