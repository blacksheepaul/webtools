import { Link, useLocation } from 'react-router-dom';
import { toolRegistry } from '../utils/toolRegistry';
import { cn } from '../utils/cn';
import { Wrench } from 'lucide-react';

export function Sidebar() {
  const location = useLocation();
  const tools = toolRegistry.getAllTools();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors">
          <Wrench className="w-6 h-6" />
          <span>Web工具站</span>
        </Link>
      </div>

      <nav className="p-2">
        <ul className="space-y-1">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = location.pathname === `/tools/${tool.id}`;

            return (
              <li key={tool.id}>
                <Link
                  to={`/tools/${tool.id}`}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{tool.name}</div>
                    <div className="text-xs text-gray-400 truncate">{tool.description}</div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {tools.length === 0 && (
        <div className="p-4 text-center text-gray-400 text-sm">
          暂无工具
        </div>
      )}
    </aside>
  );
}
