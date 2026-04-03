import type { Tool } from '../../types/tool';
import { CalendarDays } from 'lucide-react';

// 懒加载组件
const DateCalcTool = () => import('./DateCalcTool');

export const dateCalcTool: Tool = {
  id: 'date-calculator',
  name: '日期计算',
  description: '计算 N 天以前或以后的日期',
  icon: CalendarDays,
  component: DateCalcTool,
  category: 'other',
};

export default dateCalcTool;
