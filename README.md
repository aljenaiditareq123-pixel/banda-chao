# Banda Chao - 社交电商平台

Banda Chao 是一个创新的混合平台，结合了社交媒体和电子商务功能，面向中国年轻工作者。

## 功能特性

- ✅ **短视频功能** - 类似 TikTok 的短视频分享
- ✅ **长视频功能** - 类似 YouTube 的长视频内容
- ✅ **电子商务** - 用户可以展示和销售产品
- ✅ **响应式设计** - 完美适配所有设备
- ✅ **中文支持** - 完全支持中文界面

## 技术栈

- **框架**: Next.js 14
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **路由**: App Router

## 开始使用

### 安装依赖

```bash
npm install
```

### 运行开发服务器

```bash
npm run dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看结果。

### 构建生产版本

```bash
npm run build
npm start
```

## 项目结构

```
banda-chao/
├── app/                    # Next.js App Router 页面
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 首页
│   ├── videos/             # 视频相关页面
│   │   ├── short/          # 短视频页面
│   │   └── long/           # 长视频页面
│   └── products/           # 商品页面
├── components/             # React 组件
│   ├── Header.tsx          # 头部导航
│   ├── VideoCard.tsx       # 视频卡片
│   └── ProductCard.tsx    # 商品卡片
└── types/                  # TypeScript 类型定义
    └── index.ts
```

## 下一步开发

- [ ] 添加用户认证系统
- [ ] 集成数据库
- [ ] 实现视频上传功能
- [ ] 实现商品管理功能
- [ ] 添加搜索功能
- [ ] 实现评论和点赞系统
- [ ] 添加支付功能

## 许可证

MIT
