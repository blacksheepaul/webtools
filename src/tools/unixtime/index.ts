import type { Tool } from '../../types/tool';
import { Clock } from 'lucide-react';

// 懒加载组件
const UnixTimeTool = () => import('./UnixTimeTool');

export const unixTimeTool: Tool = {
  id: 'unix-time',
  name: 'Unix 时间戳',
  description: 'Unix 时间戳与日期时间相互转换',
  icon: Clock,
  component: UnixTimeTool,
  category: 'other',
};

export default unixTimeTool;
