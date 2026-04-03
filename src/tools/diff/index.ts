import type { Tool } from '../../types/tool';
import { GitCompare } from 'lucide-react';

// 懒加载组件
const DiffTool = () => import('./DiffTool');

export const diffTool: Tool = {
  id: 'text-diff',
  name: '文本对比',
  description: '对比两段文本的差异，标记增删改',
  icon: GitCompare,
  component: DiffTool,
  category: 'text',
};

export default diffTool;
