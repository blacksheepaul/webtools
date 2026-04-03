import { useParams, Navigate, Link } from "react-router-dom";
import { Suspense, lazy, type ComponentType } from "react";
import { toolRegistry } from "../utils/toolRegistry";
import { ArrowLeft, Loader2 } from "lucide-react";

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

// 静态组件包装器（在模块级别定义，不在 render 中创建）
function StaticToolWrapper({ Component }: { Component: ComponentType }) {
  return <Component />;
}

// 懒加载工具组件 - 每个工具一个固定映射
const toolComponentMap = new Map<string, ComponentType>();

function getToolComponent(
  toolId: string,
  loader: () => Promise<{ default: ComponentType }>,
): ComponentType {
  if (!toolComponentMap.has(toolId)) {
    const LazyComp = lazy(loader);
    const WrappedComponent = () => (
      <Suspense fallback={<ToolLoading />}>
        <LazyComp />
      </Suspense>
    );
    toolComponentMap.set(toolId, WrappedComponent);
  }
  return toolComponentMap.get(toolId)!;
}

export function ToolPage() {
  const { toolId } = useParams<{ toolId: string }>();
  const tool = toolId ? toolRegistry.getTool(toolId) : undefined;

  if (!tool) {
    return <Navigate to="/" replace />;
  }

  const comp = tool.component;

  // 判断是否是懒加载函数（返回Promise的函数）
  const isLazyLoader = typeof comp === "function" && comp.length === 0;

  if (isLazyLoader) {
    const LazyToolComponent = getToolComponent(
      tool.id,
      comp as () => Promise<{ default: ComponentType }>,
    );
    return (
      <div className="space-y-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </Link>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <LazyToolComponent />
        </div>
      </div>
    );
  }

  // 普通组件
  const NormalComponent = comp as ComponentType;

  return (
    <div className="space-y-6">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回首页
      </Link>
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <StaticToolWrapper Component={NormalComponent} />
      </div>
    </div>
  );
}
