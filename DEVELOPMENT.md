# 开发文档

本文档面向开发者，介绍项目的开发规范、架构设计和如何添加新工具。

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

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
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

## 开发规范

1. **组件命名**：使用 PascalCase，如 `UrlCodecTool.tsx`
2. **工具 ID**：使用 kebab-case，如 `url-codec`
3. **样式**：使用 Tailwind CSS，避免自定义 CSS
4. **图标**：使用 [Lucide Icons](https://lucide.dev/icons/)
5. **类型**：所有组件和函数都需要添加类型定义

## 工具资源配置

### 屏保工具资源

屏保工具需要以下资源文件：

- **图片轮播**：将图片放入 `public/assets/screensaver/images/` 目录，运行 `npm run screensaver:config` 自动生成配置即可轮播（图片会随机打乱顺序展示）
- **视频循环**：将视频文件放入 `public/assets/screensaver/video/loop.mp4` 即可播放

**添加新图片流程**：
```bash
# 1. 将图片放入目录
cp your-image.jpg public/assets/screensaver/images/

# 2. 重新生成配置（dev/build 会自动执行）
npm run screensaver:config
```

支持的格式：jpg, jpeg, png, gif, webp, avif
