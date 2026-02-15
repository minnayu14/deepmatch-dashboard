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
