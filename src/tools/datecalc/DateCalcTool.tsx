import { useState, useCallback, useEffect } from "react";
import { cn } from "../../utils/cn";
import { Copy, Check, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

// 格式化日期为 yyyy-MM-DD
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// 获取星期几
function getWeekDay(date: Date): string {
  const days = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  return days[date.getDay()];
}

export default function DateCalcTool() {
  const [baseDate, setBaseDate] = useState(formatDate(new Date()));
  const [days, setDays] = useState(0);
  const [direction, setDirection] = useState<"after" | "before">("after");
  const [result, setResult] = useState("");
  const [resultWeekDay, setResultWeekDay] = useState("");
  const [copied, setCopied] = useState(false);

  // 计算日期
  const calculate = useCallback(() => {
    const base = new Date(baseDate);
    if (isNaN(base.getTime())) {
      setResult("");
      setResultWeekDay("");
      return;
    }

    const targetDate = new Date(base);
    const offset = direction === "after" ? days : -days;
    targetDate.setDate(base.getDate() + offset);

    setResult(formatDate(targetDate));
    setResultWeekDay(getWeekDay(targetDate));
  }, [baseDate, days, direction]);

  // 自动计算
  useEffect(() => {
    calculate();
  }, [calculate]);

  // 复制结果
  const handleCopy = useCallback(async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 忽略复制失败
    }
  }, [result]);

  // 快捷按钮
  const quickSetDays = (value: number) => {
    setDays(value);
  };

  const quickSetToday = () => {
    setBaseDate(formatDate(new Date()));
  };

  // 调整日期
  const adjustDate = (delta: number) => {
    const current = new Date(baseDate);
    if (!isNaN(current.getTime())) {
      current.setDate(current.getDate() + delta);
      setBaseDate(formatDate(current));
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">日期计算</h1>
        <p className="mt-1 text-gray-500">计算 N 天以前或以后的日期</p>
      </div>

      {/* 基准日期 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">基准日期</label>
          <button
            onClick={quickSetToday}
            className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
          >
            <Calendar className="w-3 h-3" />
            今天
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => adjustDate(-1)}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <input
            type="date"
            value={baseDate}
            onChange={(e) => setBaseDate(e.target.value)}
            className="flex-1 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center font-mono"
          />
          <button
            onClick={() => adjustDate(1)}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 方向选择 */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-lg inline-flex">
        <button
          onClick={() => setDirection("after")}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-all",
            direction === "after"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900",
          )}
        >
          N 天以后
        </button>
        <button
          onClick={() => setDirection("before")}
          className={cn(
            "px-4 py-2 rounded-md text-sm font-medium transition-all",
            direction === "before"
              ? "bg-white text-blue-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900",
          )}
        >
          N 天以前
        </button>
      </div>

      {/* 天数输入 */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">天数</label>
        <input
          type="number"
          min={0}
          value={days}
          onChange={(e) => setDays(Math.max(0, parseInt(e.target.value) || 0))}
          className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center font-mono text-lg"
          placeholder="输入天数"
        />
        {/* 快捷按钮 */}
        <div className="flex flex-wrap gap-2">
          {[7, 30, 90, 180, 365].map((d) => (
            <button
              key={d}
              onClick={() => quickSetDays(d)}
              className={cn(
                "px-3 py-1 text-xs rounded-full transition-colors",
                days === d
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200",
              )}
            >
              {d} 天
            </button>
          ))}
        </div>
      </div>

      {/* 结果显示 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">计算结果</label>
          <button
            onClick={handleCopy}
            disabled={!result}
            className={cn(
              "flex items-center gap-1 px-3 py-1.5 text-sm rounded transition-all",
              result
                ? "text-blue-600 hover:bg-blue-50"
                : "text-gray-300 cursor-not-allowed",
            )}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                已复制
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                复制
              </>
            )}
          </button>
        </div>
        <div className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 text-center">
          {result ? (
            <div className="space-y-1">
              <code className="font-mono text-2xl tracking-wider text-gray-800">
                {result}
              </code>
              <div className="text-sm text-gray-500">{resultWeekDay}</div>
            </div>
          ) : (
            <div className="text-gray-400 py-2">请输入有效日期</div>
          )}
        </div>
      </div>

      {/* 计算说明 */}
      {result && (
        <div className="text-center text-sm text-gray-500">
          {baseDate} 的 {days} 天{direction === "after" ? "后" : "前"}是{" "}
          {result}
        </div>
      )}

      {/* 使用说明 */}
      <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
        <h4 className="font-semibold mb-2">使用说明：</h4>
        <ul className="list-disc list-inside space-y-1 text-blue-700">
          <li>选择基准日期，可使用左右箭头快速调整</li>
          <li>输入天数，或点击快捷按钮选择常用天数</li>
          <li>支持计算以前和以后的日期</li>
          <li>结果格式为 yyyy-MM-DD，同时显示星期几</li>
        </ul>
      </div>
    </div>
  );
}
