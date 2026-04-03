import type { Tool } from '../../types/tool';
import { Monitor } from 'lucide-react';

// 懒加载组件
const ScreensaverTool = () => import('./ScreensaverTool');

export const screensaverTool: Tool = {
  id: 'screensaver',
  name: '屏保',
  description: '浏览器桌面屏保，支持图片、视频和3D动画',
  icon: Monitor,
  component: ScreensaverTool,
  category: 'other',
};

export default screensaverTool;
