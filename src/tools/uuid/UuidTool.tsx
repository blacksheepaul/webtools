import { useState, useCallback, useEffect } from "react";
import { cn } from "../../utils/cn";
import { Copy, Check, RefreshCw } from "lucide-react";

type UuidVersion = "v4" | "v1" | "v7";

// 生成 UUID v4（随机）
function generateUuidV4(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// 生成 UUID v1（时间戳+随机）- 模拟实现
function generateUuidV1(): string {
  const now = Date.now();
  const timeHex = now.toString(16).padStart(12, "0");
  const timeLow = timeHex.slice(-8);
  const timeMid = timeHex.slice(-12, -8);
  const timeHigh = "1" + timeHex.slice(0, 3);

  const clockSeq = Math.floor(Math.random() * 0x4000)
    .toString(16)
    .padStart(4, "0");
  const node = Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, "0"),
  ).join("");

  return `${timeLow}-${timeMid}-${timeHigh}-${clockSeq}-${node}`;
}

// 生成 UUID v7（时间戳排序）- 模拟实现
function generateUuidV7(): string {
  const now = Date.now();
  const timeHex = now.toString(16).padStart(12, "0");
  const randA = Math.floor(Math.random() * 0x1000)
    .toString(16)
    .padStart(3, "0");
  const randB = Math.floor((Math.random() * 0x4000) | 0x8000)
    .toString(16)
    .padStart(4, "0");
  const randC = Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, "0"),
  ).join("");

  return `${timeHex.slice(-8)}-${timeHex.slice(0, 4)}-7${randA}-${randB}-${randC}`;
}

// 根据版本生成 UUID
function generateUuid(version: UuidVersion): string {
  switch (version) {
    case "v1":
      return generateUuidV1();
    case "v7":
      return generateUuidV7();
    case "v4":
    default:
      return generateUuidV4();
  }
}

export default function UuidTool() {
  const [uuid, setUuid] = useState("");
  const [version, setVersion] = useState<UuidVersion>("v4");
  const [uppercase, setUppercase] = useState(false);
  const [noDashes, setNoDashes] = useState(false);
  const [copied, setCopied] = useState(false);

  // 生成 UUID
  const handleGenerate = useCallback(() => {
    let newUuid = generateUuid(version);
    if (uppercase) {
      newUuid = newUuid.toUpperCase();
    }
    if (noDashes) {
      newUuid = newUuid.replace(/-/g, "");
    }
    setUuid(newUuid);
  }, [version, uppercase, noDashes]);

  // 初始化时生成一个
  useEffect(() => {
    handleGenerate();
  }, []);

  // 选项变化时自动重新生成
  useEffect(() => {
    handleGenerate();
  }, [version, uppercase, noDashes]);

  // 复制 UUID
  const handleCopy = useCallback(async () => {
    if (!uuid) return;
    try {
      await navigator.clipboard.writeText(uuid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 忽略复制失败
    }
  }, [uuid]);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">UUID 生成器</h1>
        <p className="mt-1 text-gray-500">
          生成通用唯一识别码（UUID），支持多种版本和格式选项
        </p>
      </div>

      {/* 版本切换 */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-lg inline-flex">
        {(["v4", "v1", "v7"] as UuidVersion[]).map((v) => (
          <button
            key={v}
            onClick={() => setVersion(v)}
            className={cn(
              "px-4 py-2 rounded-md text-sm font-medium transition-all",
              version === v
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900",
            )}
          >
            UUID {v.toUpperCase()}
          </button>
        ))}
      </div>

      {/* 格式选项 */}
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={uppercase}
            onChange={(e) => setUppercase(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">大写字母</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={noDashes}
            onChange={(e) => setNoDashes(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">去除横线</span>
        </label>
      </div>

      {/* UUID 显示区域 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            生成的 UUID
          </label>
          <button
            onClick={handleCopy}
            disabled={!uuid}
            className={cn(
              "flex items-center gap-1 px-3 py-1.5 text-sm rounded transition-all",
              uuid
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
        <div className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 text-center overflow-x-auto">
          <code className="font-mono text-lg tracking-wider text-gray-800 whitespace-nowrap">
            {uuid}
          </code>
        </div>
      </div>

      {/* 重新生成按钮 */}
      <div className="flex justify-center">
        <button
          onClick={handleGenerate}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
          重新生成
        </button>
      </div>

      {/* 使用说明 */}
      <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
        <h4 className="font-semibold mb-2">使用说明：</h4>
        <ul className="list-disc list-inside space-y-1 text-blue-700">
          <li>UUID v4：基于随机数生成，是最常用的版本</li>
          <li>UUID v1：基于时间戳和节点标识符生成</li>
          <li>UUID v7：基于时间戳排序，适合用作数据库主键</li>
        </ul>
      </div>
    </div>
  );
}
