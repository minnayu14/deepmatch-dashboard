# dashboard-data/ - Dashboard数据API

> 一旦我所属的文件夹有所变化，请更新我。

## 架构说明
核心数据API，从Supabase查询所有运营指标，计算统计数据，返回给前端Dashboard。单一文件`route.js`实现GET端点。

## 文件清单

| 文件名 | 地位 | 功能 |
|--------|------|------|
| `route.js` | 数据API实现 | 查询analyses表，计算用户数/分析数/回访率等指标，返回JSON |
