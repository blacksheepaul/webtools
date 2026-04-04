import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { cn } from "../../utils/cn";
import {
  Search,
  ChevronUp,
  ChevronDown,
  X,
  FileText,
  CaseSensitive,
} from "lucide-react";

interface Match {
  index: number;
  text: string;
  start: number;
  end: number;
}

export default function TextSearchTool() {
  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const [currentMatch, setCurrentMatch] = useState(0);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const matchRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // 查找所有匹配
  const matches = useMemo(() => {
    if (!query.trim() || !text) return [];

    const results: Match[] = [];
    const searchText = caseSensitive ? text : text.toLowerCase();
    const searchQuery = caseSensitive ? query : query.toLowerCase();

    let index = 0;
    let pos = searchText.indexOf(searchQuery);

    while (pos !== -1) {
      results.push({
        index,
        text: text.slice(pos, pos + query.length),
        start: pos,
        end: pos + query.length,
      });
      index++;
      pos = searchText.indexOf(searchQuery, pos + 1);
    }

    return results;
  }, [text, query, caseSensitive]);

  // 重置当前匹配索引当查询变化时
  useEffect(() => {
    setCurrentMatch(0);
    matchRefs.current = [];
  }, [query, caseSensitive]);

  // 跳转到指定匹配
  const jumpToMatch = useCallback(
    (index: number) => {
      if (matches.length === 0) return;
      const targetIndex =
        ((index % matches.length) + matches.length) % matches.length;
      setCurrentMatch(targetIndex);

      const element = matchRefs.current[targetIndex];
      if (element && textContainerRef.current) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    },
    [matches.length],
  );

  // 上一个/下一个
  const goToPrev = () => jumpToMatch(currentMatch - 1);
  const goToNext = () => jumpToMatch(currentMatch + 1);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        goToNext();
      } else if (e.key === "Enter" && e.shiftKey) {
        e.preventDefault();
        goToPrev();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrev]);

  // 清空
  const handleClear = () => {
    setText("");
    setQuery("");
    setCurrentMatch(0);
  };

  // 加载示例
  const loadExample = () => {
    setText(`React is a free and open-source front-end JavaScript library for building user interfaces based on components. It is maintained by Meta (formerly Facebook) and a community of individual developers and companies.

React can be used to develop single-page, mobile, or server-rendered applications with frameworks like Next.js. Because React is only concerned with the user interface and rendering components to the DOM, React applications often rely on libraries for routing and other client-side functionality.

The functionality of React applications can be enhanced by using various libraries. React Router is a popular library for routing in React applications. Redux and Zustand are libraries for state management. Axios is used for making HTTP requests.

React uses a virtual DOM to improve performance. When state changes, React first updates the virtual DOM, compares it with the previous version, and then only updates the real DOM where necessary. This process is called reconciliation.`);
    setQuery("React");
  };

  // 渲染高亮文本
  const renderHighlightedText = () => {
    if (!query.trim() || matches.length === 0) {
      return <span className="whitespace-pre-wrap break-words">{text}</span>;
    }

    const parts: React.ReactElement[] = [];
    let lastEnd = 0;

    matches.forEach((match, index) => {
      // 匹配前的文本
      if (match.start > lastEnd) {
        parts.push(
          <span key={`text-${index}`} className="whitespace-pre-wrap">
            {text.slice(lastEnd, match.start)}
          </span>,
        );
      }

      // 高亮匹配文本
      const isCurrent = index === currentMatch;
      parts.push(
        <span
          key={`match-${index}`}
          ref={(el) => {
            matchRefs.current[index] = el;
          }}
          className={cn(
            "rounded px-0.5 transition-all duration-200",
            isCurrent
              ? "bg-orange-400 text-white font-semibold ring-2 ring-orange-400 ring-offset-1"
              : "bg-yellow-200 text-yellow-900",
          )}
        >
          {match.text}
        </span>,
      );

      lastEnd = match.end;
    });

    // 剩余文本
    if (lastEnd < text.length) {
      parts.push(
        <span key="text-end" className="whitespace-pre-wrap">
          {text.slice(lastEnd)}
        </span>,
      );
    }

    return parts;
  };

  // 统计信息
  const charCount = text.length;
  const lineCount = text.split("\n").length;

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">文本搜索</h1>
        <p className="mt-1 text-gray-500">在大段文本中搜索并高亮显示关键词</p>
      </div>

      {/* 搜索栏 */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="输入搜索关键词..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* 选项 */}
        <label className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg cursor-pointer">
          <input
            type="checkbox"
            checked={caseSensitive}
            onChange={(e) => setCaseSensitive(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <CaseSensitive className="w-4 h-4 text-gray-600" />
          <span className="text-sm text-gray-700">区分大小写</span>
        </label>

        {/* 导航按钮 */}
        {matches.length > 0 && (
          <div className="flex items-center gap-2 bg-blue-50 rounded-lg p-1">
            <button
              onClick={goToPrev}
              className="p-2 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
              title="上一个 (Shift+Enter)"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <span className="px-2 text-sm font-medium text-blue-700 min-w-[3rem] text-center">
              {currentMatch + 1} / {matches.length}
            </span>
            <button
              onClick={goToNext}
              className="p-2 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
              title="下一个 (Ctrl/Cmd+Enter)"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 清空按钮 */}
        {(text || query) && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1 px-3 py-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            清空
          </button>
        )}
      </div>

      {/* 文本输入区域 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">文本内容</label>
          <div className="flex gap-2">
            <button
              onClick={loadExample}
              className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
            >
              <FileText className="w-3 h-3" />
              加载示例
            </button>
            <span className="text-xs text-gray-400">
              {charCount} 字符 · {lineCount} 行
            </span>
          </div>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="在此粘贴或输入要搜索的文本..."
          className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y font-mono text-sm"
        />
      </div>

      {/* 搜索结果 */}
      {text && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              搜索结果
              {matches.length > 0 && (
                <span className="ml-2 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  找到 {matches.length} 个匹配
                </span>
              )}
            </label>
          </div>

          <div
            ref={textContainerRef}
            className={cn(
              "w-full min-h-[200px] max-h-96 p-4 border rounded-lg overflow-y-auto font-mono text-sm leading-relaxed break-words",
              matches.length > 0
                ? "border-blue-200 bg-blue-50/30"
                : "border-gray-200 bg-gray-50",
            )}
          >
            {text ? (
              renderHighlightedText()
            ) : (
              <span className="text-gray-400">请输入文本内容...</span>
            )}
          </div>
        </div>
      )}

      {/* 快捷键提示 */}
      {matches.length > 0 && (
        <div className="flex gap-4 text-xs text-gray-500">
          <span>快捷键：</span>
          <span>Ctrl/Cmd + Enter → 下一个</span>
          <span>Shift + Enter ← 上一个</span>
        </div>
      )}

      {/* 使用说明 */}
      <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
        <h4 className="font-semibold mb-2">使用说明：</h4>
        <ul className="list-disc list-inside space-y-1 text-blue-700">
          <li>在上方输入框输入要搜索的关键词</li>
          <li>所有匹配结果会用黄色高亮显示</li>
          <li>当前选中的匹配用橙色高亮，并自动滚动到视野中</li>
          <li>使用导航按钮或快捷键在匹配结果间跳转</li>
          <li>可选择是否区分大小写进行搜索</li>
        </ul>
      </div>
    </div>
  );
}
