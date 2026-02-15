# app/ - Next.js应用目录

> 一旦我所属的文件夹有所变化，请更新我。

## 架构说明
Next.js App Router应用主目录，包含页面、布局、样式和API路由。采用文件系统路由，`page.js`为页面入口，`layout.js`为全局布局，`api/`为后端API。

## 文件清单

| 文件名 | 地位 | 功能 |
|--------|------|------|
| `page.js` | 主页面组件 | Dashboard主界面，展示所有运营数据和AI洞察 |
| `layout.js` | 根布局组件 | 全局HTML结构，导入全局样式，定义metadata |
| `globals.css` | 全局样式表 | Tailwind CSS配置和自定义全局样式 |
| `api/` | API路由目录 | 包含所有后端API端点（详见`api/README.md`） |

## 目录结构

```
app/
├── page.js           # Dashboard主页面
├── layout.js         # 全局布局
├── globals.css       # 全局样式
└── api/              # API路由
    ├── chat/         # AI对话API
    ├── daily-insight/ # AI每日洞察API
    └── dashboard-data/ # Dashboard数据API
```
