# api/ - API路由目录

> 一旦我所属的文件夹有所变化，请更新我。

## 架构说明
Next.js API Routes目录，所有API端点以文件夹形式组织，每个端点包含`route.js`文件。使用Supabase获取数据，OpenRouter调用AI服务。

## API清单

| 端点 | 地位 | 功能 |
|------|------|------|
| `dashboard-data/` | 核心数据API | 从Supabase查询所有运营数据，计算指标，返回给前端 |
| `daily-insight/` | AI洞察API | 基于过去24h数据调用GPT-4生成运营洞察报告 |
| `chat/` | AI对话API | 处理用户问题，调用AI返回基于数据的回答（当前已隐藏） |

## 技术栈

- **数据库**: Supabase Client (`@supabase/supabase-js`)
- **HTTP**: Axios (用于OpenRouter API调用)
- **AI**: OpenRouter API (GPT-4 Turbo)

## 环境变量依赖

所有API需要以下环境变量：
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase服务密钥
- `OPENROUTER_API_KEY` - OpenRouter API密钥
- `OPENROUTER_BASE_URL` - OpenRouter基础URL
