import { toolRegistry } from '../utils/toolRegistry';
import { ToolCard } from '../components/ToolCard';
import { Wrench, Sparkles } from 'lucide-react';

export function HomePage() {
  const tools = toolRegistry.getAllTools();

  return (
    <div className="space-y-8">
      {/* Hero 区域 */}
      <div className="text-center py-12 px-4">
        <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-2xl mb-6">
          <Wrench className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Web 工具站
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          简洁实用的在线工具集合，帮助您提高工作效率
        </p>
      </div>

      {/* 工具列表 */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-900">所有工具</h2>
          <span className="text-sm text-gray-400">({tools.length})</span>
        </div>

        {tools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-400">暂无工具，敬请期待...</p>
          </div>
        )}
      </div>
    </div>
  );
}
