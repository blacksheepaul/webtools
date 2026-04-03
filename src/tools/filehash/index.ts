import type { Tool } from '../../types/tool';
import { ShieldCheck } from 'lucide-react';

// 懒加载组件
const FileHashTool = () => import('./FileHashTool');

export const fileHashTool: Tool = {
  id: 'file-hash',
  name: '文件哈希校验',
  description: '计算文件哈希值，校验文件完整性',
  icon: ShieldCheck,
  component: FileHashTool,
  category: 'security',
};

export default fileHashTool;
