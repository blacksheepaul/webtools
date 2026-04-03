import { Link } from 'react-router-dom';
import type { Tool } from '../types/tool';
import { ArrowRight } from 'lucide-react';

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const Icon = tool.icon;

  return (
    <Link
      to={`/tools/${tool.id}`}
      className="group block p-5 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-start gap-4">
        <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
          <Icon className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {tool.name}
          </h3>
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">
            {tool.description}
          </p>
        </div>
        <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
      </div>
    </Link>
  );
}
