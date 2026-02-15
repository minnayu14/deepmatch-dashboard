# Deepmatch 运营看板

> 独立的运营数据监控后台，集成AI智能分析功能

## ⚠️ 重要：文档更新规范

**任何功能、架构、写法更新后，必须同步更新以下内容：**

1. ✅ **更新文件开头的三行注释**（Input/Output/Pos）
2. ✅ **更新所在文件夹的README.md**
3. ✅ **更新本README.md中的相关章节**

**这不是建议，是强制要求。** 保持文档同步是代码质量的一部分。

## 📁 项目结构

```
dashboard/
├── app/                        # Next.js App Router应用目录
│   ├── api/                    # API路由目录
│   │   ├── chat/              # AI对话API
│   │   ├── daily-insight/     # AI每日洞察API
│   │   └── dashboard-data/    # Dashboard数据API
│   ├── page.js                # 主页面组件
│   ├── layout.js              # 根布局组件
│   └── globals.css            # 全局样式
├── package.json               # 项目依赖配置
├── postcss.config.js          # PostCSS配置
├── tailwind.config.js         # Tailwind CSS配置
└── README.md                  # 本文档
```

详细结构说明请查看各子目录的README.md文件。

## 🚀 快速启动

```bash
# 1. 安装依赖
npm install

# 2. 配置环境变量（如未配置）
# 编辑 .env.local 文件，添加必要的API密钥

# 3. 启动开发服务器
npm run dev

# 4. 访问Dashboard
# http://localhost:3001
```

## 🔧 环境变量

需要在 `.env.local` 中配置以下变量：

```bash
# Supabase配置
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenRouter配置（AI功能）
OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
```

## ✨ 核心功能

### 1. 实时数据展示
- 总用户数、总分析次数、用户回访率
- 最近用户列表（前10位）
- 今日数据统计（过去24小时）

### 2. AI每日洞察
- 基于过去24小时数据生成洞察报告
- 使用OpenRouter API调用GPT-4 Turbo
- 分析用户行为、发现趋势、提供建议

### 3. AI对话助手（已隐藏）
- 多轮对话能力
- 基于实时数据回答问题

## 🎨 技术栈

- **框架**: Next.js 16.0.10 (App Router)
- **UI**: React 19.2.0
- **样式**: Tailwind CSS 3.4.0
- **数据库**: Supabase PostgreSQL
- **AI**: OpenRouter (GPT-4 Turbo)
- **HTTP**: Axios 1.13.5
- **部署**: Vercel

## 📡 API端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/dashboard-data` | GET | 获取Dashboard所有数据 |
| `/api/daily-insight` | GET | 生成AI每日洞察报告 |
| `/api/chat` | POST | AI对话接口（已隐藏） |

详细API文档请查看 `app/api/README.md`

## 💻 开发命令

```bash
npm run dev      # 启动开发服务器（端口3001）
npm run build    # 构建生产版本
npm run start    # 启动生产服务器
npm run lint     # 代码检查
```

## 🚢 部署

本项目已部署到Vercel：
- **生产环境**: https://deepmatch-dashboard.vercel.app/
- **GitHub仓库**: https://github.com/minnayu14/deepmatch-dashboard.git

部署时需在Vercel中配置环境变量。

## 🎯 与主项目隔离

Dashboard是完全独立的项目：
- 独立端口：**3001**（主网站3000）
- 独立依赖管理
- 独立Git仓库
- 不影响主项目代码

## 📝 开发指南

1. **添加新功能前**：阅读相关目录的README.md了解架构
2. **开发过程中**：遵循现有代码风格和文件结构
3. **完成开发后**：更新所有相关文档（见顶部规范）

## 🐛 常见问题

**Q: 端口3001被占用？**
```bash
lsof -i :3001
kill -9 <PID>
```

**Q: AI功能失败？**
- 检查OpenRouter API Key是否正确配置
- 检查网络连接（Vercel部署可绕过中国地区限制）

**Q: 样式显示异常？**
- 确保使用Tailwind CSS 3.4.0（不是4.x）
- 清除构建缓存：`rm -rf .next && npm run dev`

## 📮 后续计划

- [ ] 优化数据展示逻辑
- [ ] 调整样式细节
- [ ] 添加更多运营指标
- [ ] 图表可视化
- [ ] 移动端优化

---

**最后更新**: 2026-02-15
**版本**: v3.0 (Vercel部署完成，文档规范化)
