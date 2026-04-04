import type { Tool } from '../../types/tool';
import { Search } from 'lucide-react';

// 懒加载组件
const TextSearchTool = () => import('./TextSearchTool');

export const textSearchTool: Tool = {
  id: 'text-search',
  name: '文本搜索',
  description: '在文本中搜索关键词并高亮显示',
  icon: Search,
  component: TextSearchTool,
  category: 'text',
};

export default textSearchTool;
