import { useState, useCallback, useEffect } from "react";
import { cn } from "../../utils/cn";
import { Copy, Check, ArrowRightLeft, Clock, Calendar } from "lucide-react";

// 格式化日期为 yyyy-MM-DD hh:mm:ss
function formatDateTime(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 格式化日期为 yyyyMMDDhhmmss
function formatDateTimeCompact(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

export default function UnixTimeTool() {
  const [timestamp, setTimestamp] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [timeInput, setTimeInput] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  // 每秒更新当前时间
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 获取当前时间戳
  const setCurrentTimestamp = () => {
    const now = Date.now();
    setTimestamp(String(Math.floor(now / 1000)));
  };

  // 时间戳转日期
  const convertTimestampToDate = useCallback((value: string) => {
    setTimestamp(value);
    if (!value.trim()) {
      setDateTime("");
      return;
    }

    const num = parseInt(value.trim());
    if (isNaN(num)) {
      setDateTime("");
      return;
    }

    // 判断是秒还是毫秒（毫秒时间戳通常大于 1e12）
    const date = num > 1e12 ? new Date(num) : new Date(num * 1000);

    if (isNaN(date.getTime())) {
      setDateTime("");
      return;
    }

    setDateTime(formatDateTime(date));
  }, []);

  // 日期转时间戳
  const convertDateToTimestamp = useCallback(() => {
    if (!dateInput || !timeInput) {
      setTimestamp("");
      return;
    }

    const date = new Date(`${dateInput}T${timeInput}`);
    if (isNaN(date.getTime())) {
      setTimestamp("");
      return;
    }

    setTimestamp(String(Math.floor(date.getTime() / 1000)));
    setDateTime(formatDateTime(date));
  }, [dateInput, timeInput]);

  // 初始化当前时间
  useEffect(() => {
    const now = new Date();
    setDateInput(formatDateTime(now).split(" ")[0]);
    setTimeInput(formatDateTime(now).split(" ")[1]);
  }, []);

  // 复制功能
  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // 忽略复制失败
    }
  };

  // 计算毫秒时间戳
  const timestampMs = timestamp ? parseInt(timestamp) * 1000 : null;
  const date = timestamp
    ? new Date(
        parseInt(timestamp) > 1e12
          ? parseInt(timestamp)
          : parseInt(timestamp) * 1000,
      )
    : null;

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Unix 时间戳转换</h1>
        <p className="mt-1 text-gray-500">Unix 时间戳与日期时间相互转换</p>
      </div>

      {/* 时间戳 → 日期 */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-gray-900">时间戳转日期</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 时间戳输入 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Unix 时间戳
              </label>
              <button
                onClick={setCurrentTimestamp}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                当前时间
              </button>
            </div>
            <input
              type="text"
              value={timestamp}
              onChange={(e) => convertTimestampToDate(e.target.value)}
              placeholder="输入秒或毫秒时间戳..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
            />
            <p className="text-xs text-gray-500">
              自动识别秒（10位）或毫秒（13位）
            </p>
          </div>

          {/* 日期输出 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              日期时间
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={dateTime}
                  readOnly
                  placeholder="yyyy-MM-DD hh:mm:ss"
                  className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50 font-mono"
                />
                <button
                  onClick={() => dateTime && handleCopy(dateTime, "datetime")}
                  disabled={!dateTime}
                  className={cn(
                    "px-3 py-2 rounded-lg transition-colors",
                    dateTime
                      ? "text-blue-600 hover:bg-blue-50"
                      : "text-gray-300 cursor-not-allowed",
                  )}
                >
                  {copied === "datetime" ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
              {date && (
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-500">紧凑格式：</span>
                    <code className="font-mono">
                      {formatDateTimeCompact(date)}
                    </code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">毫秒时间戳：</span>
                    <code className="font-mono">{date.getTime()}</code>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 分隔线 */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-gray-200" />
        <ArrowRightLeft className="w-5 h-5 text-gray-400" />
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* 日期 → 时间戳 */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-green-600" />
          <h2 className="font-semibold text-gray-900">日期转时间戳</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 日期选择 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              选择日期时间
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={dateInput}
                onChange={(e) => {
                  setDateInput(e.target.value);
                  setTimeout(convertDateToTimestamp, 0);
                }}
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <input
                type="time"
                value={timeInput}
                onChange={(e) => {
                  setTimeInput(e.target.value);
                  setTimeout(convertDateToTimestamp, 0);
                }}
                step="1"
                className="w-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <p className="text-xs text-gray-500">
              选择日期和时间，自动转换为时间戳
            </p>
          </div>

          {/* 时间戳输出 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              转换结果
            </label>
            {timestamp && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="flex-1 p-3 bg-gray-50 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">秒（10位）</div>
                    <div className="flex items-center justify-between">
                      <code className="font-mono text-lg">{timestamp}</code>
                      <button
                        onClick={() => handleCopy(timestamp, "sec")}
                        className="text-blue-600 hover:bg-blue-50 p-1 rounded"
                      >
                        {copied === "sec" ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                {timestampMs && (
                  <div className="flex gap-2">
                    <div className="flex-1 p-3 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">
                        毫秒（13位）
                      </div>
                      <div className="flex items-center justify-between">
                        <code className="font-mono text-lg">{timestampMs}</code>
                        <button
                          onClick={() => handleCopy(String(timestampMs), "ms")}
                          className="text-blue-600 hover:bg-blue-50 p-1 rounded"
                        >
                          {copied === "ms" ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 当前时间显示 */}
      <div className="bg-blue-50 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-4">当前时间</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">秒时间戳</div>
            <code className="font-mono text-blue-700">
              {Math.floor(currentTime / 1000)}
            </code>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">毫秒时间戳</div>
            <code className="font-mono text-blue-700">{currentTime}</code>
          </div>
          <div className="bg-white rounded-lg p-3 col-span-2">
            <div className="text-xs text-gray-500 mb-1">日期时间</div>
            <code className="font-mono text-blue-700">
              {formatDateTime(new Date(currentTime))}
            </code>
          </div>
        </div>
      </div>

      {/* 使用说明 */}
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
        <h4 className="font-semibold mb-2">使用说明：</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>Unix 时间戳是从 1970-01-01 00:00:00 UTC 开始的秒数或毫秒数</li>
          <li>10 位数字表示秒，13 位数字表示毫秒</li>
          <li>支持输入 yyyy-MM-DD hh:mm:ss 或 yyyyMMDDhhmmss 格式解析</li>
        </ul>
      </div>
    </div>
  );
}
