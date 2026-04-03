import type { Tool } from '../../types/tool';
import { Fingerprint } from 'lucide-react';

// 懒加载组件
const UuidTool = () => import('./UuidTool');

export const uuidTool: Tool = {
  id: 'uuid-generator',
  name: 'UUID 生成器',
  description: '生成通用唯一识别码，支持 v1/v4/v7 多种版本',
  icon: Fingerprint,
  component: UuidTool,
  category: 'other',
};

export default uuidTool;
