import type { Tool } from '../../types/tool';
import { KeyRound } from 'lucide-react';

// 懒加载组件
const JwtTool = () => import('./JwtTool');

export const jwtTool: Tool = {
  id: 'jwt-decoder',
  name: 'JWT 解码',
  description: '解析和验证 JSON Web Token',
  icon: KeyRound,
  component: JwtTool,
  category: 'encoding',
};

export default jwtTool;
