# Web 工具站

基于 React + TypeScript + Tailwind CSS 构建的 Web 工具集合。

## 特性

- 🚀 基于 React 18 + Vite + TypeScript
- 🎨 使用 Tailwind CSS 进行样式设计
- 📦 工具懒加载，按需加载
- 🔧 易于扩展的工具架构
- 📱 响应式设计

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 项目结构

```
src/
├── components/       # 共享组件
│   ├── Sidebar.tsx   # 侧边栏
│   └── ToolCard.tsx  # 工具卡片
├── layouts/          # 布局组件
│   └── MainLayout.tsx
├── pages/            # 页面组件
│   ├── HomePage.tsx  # 首页
│   └── ToolPage.tsx  # 工具详情页
├── tools/            # 工具目录
│   ├── index.ts      # 工具注册入口
│   └── urlcodec/     # URL编码解码工具
│       ├── index.ts  # 工具配置
│       └── UrlCodecTool.tsx
├── types/            # TypeScript 类型定义
│   └── tool.ts
├── utils/            # 工具函数
│   ├── cn.ts         # 类名合并
│   └── toolRegistry.ts # 工具注册中心
└── ...
```

## 如何添加新工具

### 1. 创建工具目录

在 `src/tools/` 下创建新工具的目录：

```bash
mkdir src/tools/my-tool
```

### 2. 创建工具组件

```tsx
// src/tools/my-tool/MyTool.tsx
export default function MyTool() {
  return (
    <div>
      <h1>我的工具</h1>
      {/* 工具实现 */}
    </div>
  );
}
```

### 3. 创建工具配置

```tsx
// src/tools/my-tool/index.ts
import type { Tool } from '../../types/tool';
import { MyIcon } from 'lucide-react';

export const myTool: Tool = {
  id: 'my-tool',           // 唯一标识（URL中使用）
  name: '我的工具',         // 显示名称
  description: '工具描述', // 简短描述
  icon: MyIcon,            // Lucide 图标
  component: () => import('./MyTool'), // 懒加载
  category: 'other',       // 分类ID
};

export default myTool;
```

### 4. 注册工具

在 `src/tools/index.ts` 中导入并注册：

```ts
import { myTool } from './my-tool';

const tools = [
  // ... 现有工具
  myTool,
];
```

### 5. 添加分类（可选）

如果需要新的分类，在 `src/tools/index.ts` 中添加：

```ts
const categories: ToolCategory[] = [
  // ... 现有分类
  { id: 'my-category', name: '我的分类', icon: MyIcon },
];
```

## 现有工具

| 工具 | 描述 | 路径 |
|------|------|------|
| URL 编码/解码 | URL编码、解码及参数解析 | `/tools/url-codec` |
| Base64 编码/解码 | Base64编码解码，支持文件和URL Safe | `/tools/base64-codec` |
| UUID 生成器 | 生成通用唯一识别码 | `/tools/uuid-generator` |
| JWT 解码 | 解析和验证 JSON Web Token | `/tools/jwt-decoder` |
| 日期计算 | 计算 N 天以前或以后的日期 | `/tools/date-calculator` |
| 文本对比 | 对比两段文本的差异 | `/tools/text-diff` |
| 文件哈希校验 | 计算文件哈希值，校验完整性 | `/tools/file-hash` |
| 屏保 | 浏览器桌面屏保，支持图片/视频/3D动画 | `/tools/screensaver` |

## 开发规范

1. **组件命名**：使用 PascalCase，如 `UrlCodecTool.tsx`
2. **工具 ID**：使用 kebab-case，如 `url-codec`
3. **样式**：使用 Tailwind CSS，避免自定义 CSS
4. **图标**：使用 [Lucide Icons](https://lucide.dev/icons/)
5. **类型**：所有组件和函数都需要添加类型定义

## 工具配置

### 屏保工具资源

屏保工具需要以下资源文件：

- **图片轮播**：将图片放入 `public/assets/screensaver/images/` 目录，命名为 `1.jpg`, `2.jpg`... 即可自动轮播
- **视频循环**：将视频文件放入 `public/assets/screensaver/video/loop.mp4` 即可播放
