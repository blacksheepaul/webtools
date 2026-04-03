import type { Tool } from '../../types/tool';
import { FileCode } from 'lucide-react';

// 懒加载组件
const Base64Tool = () => import('./Base64Tool');

export const base64Tool: Tool = {
  id: 'base64-codec',
  name: 'Base64 编码/解码',
  description: 'Base64编码解码，支持文件和URL Safe',
  icon: FileCode,
  component: Base64Tool,
  category: 'encoding',
};

export default base64Tool;
