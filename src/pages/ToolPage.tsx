import { useParams, Navigate, Link } from 'react-router-dom';
import { Suspense, lazy, type ComponentType } from 'react';
import { toolRegistry } from '../utils/toolRegistry';
import { ArrowLeft, Loader2 } from 'lucide-react';

// 工具加载状态
function ToolLoading() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex items-center gap-3 text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>加载中...</span>
      </div>
    </div>
  );
}

export function ToolPage() {
  const { toolId } = useParams<{ toolId: string }>();
  const tool = toolId ? toolRegistry.getTool(toolId) : undefined;

  if (!tool) {
    return <Navigate to="/" replace />;
  }

  // 处理懒加载组件
  let ToolComponent: ComponentType;

  const comp = tool.component;

  // 判断是否是懒加载函数（返回Promise的函数）
  if (typeof comp === 'function' && comp.length === 0) {
    // 尝试作为懒加载函数处理
    const LazyComponent = lazy(comp as () => Promise<{ default: ComponentType }>);
    ToolComponent = () => (
      <Suspense fallback={<ToolLoading />}>
        <LazyComponent />
      </Suspense>
    );
  } else {
    // 如果是普通组件
    ToolComponent = comp as ComponentType;
  }

  return (
    <div className="space-y-6">
      {/* 返回按钮 */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回首页
      </Link>

      {/* 工具组件 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <ToolComponent />
      </div>
    </div>
  );
}
