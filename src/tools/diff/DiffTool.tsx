import { useState } from "react";
import { cn } from "../../utils/cn";
import { Copy, Check, ArrowRightLeft, FileText } from "lucide-react";

// 差异类型
type DiffType = "equal" | "add" | "remove" | "modify";

// 字符级差异
interface CharDiff {
  type: "equal" | "add" | "remove";
  text: string;
}

// 差异行
interface DiffLine {
  type: DiffType;
  oldLineNum: number | null;
  newLineNum: number | null;
  content: string;
  charDiffs?: CharDiff[]; // 字符级差异（仅 modify 类型有）
}

// 计算字符级差异（简化版 LCS）
function computeCharDiff(oldText: string, newText: string): CharDiff[] {
  const m = oldText.length;
  const n = newText.length;

  // 动态规划矩阵
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldText[i - 1] === newText[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // 回溯找出差异
  const result: CharDiff[] = [];
  let i = m,
    j = n;

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldText[i - 1] === newText[j - 1]) {
      // 相同字符
      result.unshift({ type: "equal", text: oldText[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      // 新增字符
      result.unshift({ type: "add", text: newText[j - 1] });
      j--;
    } else if (i > 0) {
      // 删除字符
      result.unshift({ type: "remove", text: oldText[i - 1] });
      i--;
    }
  }

  // 合并连续的相同类型
  const merged: CharDiff[] = [];
  for (const diff of result) {
    if (merged.length > 0 && merged[merged.length - 1].type === diff.type) {
      merged[merged.length - 1].text += diff.text;
    } else {
      merged.push({ ...diff });
    }
  }

  return merged;
}

// 计算行级差异
function computeLineDiff(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText ? oldText.split("\n") : [];
  const newLines = newText ? newText.split("\n") : [];

  const result: DiffLine[] = [];
  let oldIndex = 0;
  let newIndex = 0;

  while (oldIndex < oldLines.length || newIndex < newLines.length) {
    const oldLine = oldLines[oldIndex];
    const newLine = newLines[newIndex];

    if (oldIndex >= oldLines.length) {
      result.push({
        type: "add",
        oldLineNum: null,
        newLineNum: newIndex + 1,
        content: newLine,
      });
      newIndex++;
    } else if (newIndex >= newLines.length) {
      result.push({
        type: "remove",
        oldLineNum: oldIndex + 1,
        newLineNum: null,
        content: oldLine,
      });
      oldIndex++;
    } else if (oldLine === newLine) {
      result.push({
        type: "equal",
        oldLineNum: oldIndex + 1,
        newLineNum: newIndex + 1,
        content: oldLine,
      });
      oldIndex++;
      newIndex++;
    } else {
      // 行内容不同，尝试找后续匹配
      const oldInNew = newLines.indexOf(oldLine, newIndex);
      const newInOld = oldLines.indexOf(newLine, oldIndex);

      if (oldInNew === -1 && newInOld === -1) {
        // 都没有找到，视为修改行，做字符级对比
        const charDiffs = computeCharDiff(oldLine, newLine);
        result.push({
          type: "modify",
          oldLineNum: oldIndex + 1,
          newLineNum: newIndex + 1,
          content: newLine,
          charDiffs,
        });
        oldIndex++;
        newIndex++;
      } else if (
        oldInNew === -1 ||
        (newInOld !== -1 && newInOld - oldIndex <= oldInNew - newIndex)
      ) {
        result.push({
          type: "remove",
          oldLineNum: oldIndex + 1,
          newLineNum: null,
          content: oldLine,
        });
        oldIndex++;
      } else {
        result.push({
          type: "add",
          oldLineNum: null,
          newLineNum: newIndex + 1,
          content: newLine,
        });
        newIndex++;
      }
    }
  }

  return result;
}

// 生成纯文本对比结果
function generateDiffText(diff: DiffLine[]): string {
  return diff
    .map((line) => {
      const prefix =
        line.type === "add" ? "+" : line.type === "remove" ? "-" : " ";
      return prefix + line.content;
    })
    .join("\n");
}

// 渲染字符级差异
function renderCharDiffs(charDiffs: CharDiff[]) {
  return charDiffs.map((diff, index) => {
    if (diff.type === "equal") {
      return <span key={index}>{diff.text}</span>;
    }
    if (diff.type === "remove") {
      return (
        <span
          key={index}
          className="bg-red-200 text-red-900 rounded px-0.5 line-through"
        >
          {diff.text}
        </span>
      );
    }
    if (diff.type === "add") {
      return (
        <span
          key={index}
          className="bg-green-200 text-green-900 rounded px-0.5"
        >
          {diff.text}
        </span>
      );
    }
    return null;
  });
}

export default function DiffTool() {
  const [oldText, setOldText] = useState("");
  const [newText, setNewText] = useState("");
  const [diff, setDiff] = useState<DiffLine[]>([]);
  const [copied, setCopied] = useState(false);

  // 自动对比
  const handleOldChange = (value: string) => {
    setOldText(value);
    setTimeout(() => {
      const result = computeLineDiff(value, newText);
      setDiff(result);
    }, 100);
  };

  const handleNewChange = (value: string) => {
    setNewText(value);
    setTimeout(() => {
      const result = computeLineDiff(oldText, value);
      setDiff(result);
    }, 100);
  };

  // 交换内容
  const handleSwap = () => {
    setOldText(newText);
    setNewText(oldText);
    setTimeout(() => {
      const result = computeLineDiff(newText, oldText);
      setDiff(result);
    }, 0);
  };

  // 复制结果
  const handleCopy = async () => {
    if (diff.length === 0) return;
    try {
      const text = generateDiffText(diff);
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 忽略复制失败
    }
  };

  // 加载示例
  const loadExample = () => {
    const oldExample = `function hello() {
  console.log('Hello');
  return 'world';
}`;
    const newExample = `function hello(name) {
  console.log('Hello, ' + name);
  return 'world!';
}

// 新增函数
function goodbye() {
  console.log('Goodbye');
}`;
    setOldText(oldExample);
    setNewText(newExample);
    setTimeout(() => {
      const result = computeLineDiff(oldExample, newExample);
      setDiff(result);
    }, 0);
  };

  // 统计
  const addCount = diff.filter((d) => d.type === "add").length;
  const removeCount = diff.filter((d) => d.type === "remove").length;
  const modifyCount = diff.filter((d) => d.type === "modify").length;

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">文本对比</h1>
        <p className="mt-1 text-gray-500">
          对比两段文本的差异，支持行内字符高亮
        </p>
      </div>

      {/* 输入区域 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 旧文本 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              原始文本
            </label>
            <span className="text-xs text-gray-400">
              {oldText ? oldText.split("\n").length : 0} 行
            </span>
          </div>
          <textarea
            value={oldText}
            onChange={(e) => handleOldChange(e.target.value)}
            placeholder="输入原始文本..."
            className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y font-mono text-sm"
          />
        </div>

        {/* 新文本 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              对比文本
            </label>
            <span className="text-xs text-gray-400">
              {newText ? newText.split("\n").length : 0} 行
            </span>
          </div>
          <textarea
            value={newText}
            onChange={(e) => handleNewChange(e.target.value)}
            placeholder="输入对比文本..."
            className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y font-mono text-sm"
          />
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleSwap}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
        >
          <ArrowRightLeft className="w-4 h-4" />
          交换
        </button>
        <button
          onClick={loadExample}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
        >
          <FileText className="w-4 h-4" />
          加载示例
        </button>
        {diff.length > 0 && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors ml-auto"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                已复制
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                复制结果
              </>
            )}
          </button>
        )}
      </div>

      {/* 对比结果 */}
      {diff.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              对比结果
            </label>
            <div className="flex gap-3 text-xs">
              <span className="text-green-600">+ {addCount} 新增</span>
              <span className="text-red-600">- {removeCount} 删除</span>
              {modifyCount > 0 && (
                <span className="text-amber-600">~ {modifyCount} 修改</span>
              )}
              <span className="text-gray-400">
                {diff.filter((d) => d.type === "equal").length} 未变
              </span>
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-100">
                  {diff.map((line, index) => (
                    <tr
                      key={index}
                      className={cn(
                        "font-mono",
                        line.type === "add" && "bg-green-50",
                        line.type === "remove" && "bg-red-50",
                        line.type === "modify" && "bg-amber-50",
                      )}
                    >
                      {/* 行号 */}
                      <td className="w-12 py-1 px-2 text-right text-xs text-gray-400 select-none border-r border-gray-100 bg-gray-50">
                        {line.oldLineNum ?? ""}
                      </td>
                      <td className="w-12 py-1 px-2 text-right text-xs text-gray-400 select-none border-r border-gray-100 bg-gray-50">
                        {line.newLineNum ?? ""}
                      </td>
                      {/* 标记 */}
                      <td className="w-6 py-1 px-2 text-center text-xs font-bold select-none">
                        {line.type === "add" && (
                          <span className="text-green-600">+</span>
                        )}
                        {line.type === "remove" && (
                          <span className="text-red-600">-</span>
                        )}
                        {line.type === "modify" && (
                          <span className="text-amber-600">~</span>
                        )}
                        {line.type === "equal" && (
                          <span className="text-gray-300"> </span>
                        )}
                      </td>
                      {/* 内容 */}
                      <td className="py-1 px-3 overflow-x-auto">
                        {line.type === "modify" && line.charDiffs ? (
                          <span className="whitespace-pre">
                            {renderCharDiffs(line.charDiffs)}
                          </span>
                        ) : (
                          <span
                            className={cn(
                              "whitespace-pre",
                              line.type === "add" && "text-green-800",
                              line.type === "remove" && "text-red-800",
                              line.type === "equal" && "text-gray-800",
                            )}
                          >
                            {line.content || " "}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 图例 */}
          <div className="flex gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-red-200 rounded"></span>
              删除
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-green-200 rounded"></span>
              新增
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-amber-200 rounded"></span>
              修改行
            </span>
          </div>
        </div>
      )}

      {/* 使用说明 */}
      <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
        <h4 className="font-semibold mb-2">使用说明：</h4>
        <ul className="list-disc list-inside space-y-1 text-blue-700">
          <li>在左侧输入原始文本，右侧输入对比文本</li>
          <li>自动实时显示差异结果，支持行内字符级高亮</li>
          <li>
            <span className="bg-red-200 px-1 rounded">红色删除线</span>{" "}
            表示删除的字符，
            <span className="bg-green-200 px-1 rounded">绿色高亮</span>{" "}
            表示新增的字符
          </li>
          <li>修改的行用 ~ 标记，背景为黄色</li>
        </ul>
      </div>
    </div>
  );
}
