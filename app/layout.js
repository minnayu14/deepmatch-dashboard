// INPUT: globals.css (全局样式)
// OUTPUT: HTML根布局结构，metadata配置
// POS: Next.js根布局组件，包裹所有页面
// 一旦我被更新，务必更新我的开头注释，以及所属文件夹的README.md

import './globals.css'

export const metadata = {
  title: 'Deepmatch 运营看板',
  description: 'DeepMatch运营数据实时监控后台',
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
