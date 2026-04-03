import type { Tool } from '../../types/tool';
import { Link } from 'lucide-react';

// 懒加载组件
const UrlCodecTool = () => import('./UrlCodecTool');

export const urlCodecTool: Tool = {
  id: 'url-codec',
  name: 'URL 编码/解码',
  description: 'URL编码、解码及参数解析',
  icon: Link,
  component: UrlCodecTool,
  category: 'encoding',
};

export default urlCodecTool;
