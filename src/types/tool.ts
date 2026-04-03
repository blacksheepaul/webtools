import type { ComponentType } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface Tool {
  /** 工具唯一ID */
  id: string;
  /** 工具名称 */
  name: string;
  /** 工具描述 */
  description: string;
  /** 工具图标 */
  icon: LucideIcon;
  /** 工具组件 - 支持懒加载 */
  component: ComponentType | (() => Promise<{ default: ComponentType }>);
  /** 工具分类 */
  category?: string;
  /** 是否隐藏（不在侧边栏显示） */
  hidden?: boolean;
}

export interface ToolCategory {
  id: string;
  name: string;
  icon?: LucideIcon;
}
