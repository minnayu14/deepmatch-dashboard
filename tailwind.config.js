// INPUT: Tailwind CSS框架
// OUTPUT: Tailwind配置 (content路径, theme, plugins)
// POS: Tailwind CSS配置文件，定义扫描路径和主题
// 一旦我被更新，务必更新我的开头注释，以及根目录README.md

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
