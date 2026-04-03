import { useState, useCallback } from 'react';
import { cn } from '../../utils/cn';
import { ArrowDown, Copy, Check, RotateCcw, FileJson } from 'lucide-react';

type CodecMode = 'encode' | 'decode';

export default function UrlCodecTool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<CodecMode>('encode');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const processText = useCallback((text: string, currentMode: CodecMode) => {
    if (!text.trim()) {
      setOutput('');
      setError('');
      return;
    }

    try {
      if (currentMode === 'encode') {
        setOutput(encodeURIComponent(text));
      } else {
        setOutput(decodeURIComponent(text));
      }
      setError('');
    } catch (e) {
      setError(currentMode === 'decode' ? '无效的URL编码字符串' : '编码失败');
      setOutput('');
    }
  }, []);

  const handleInputChange = (value: string) => {
    setInput(value);
    processText(value, mode);
  };

  const handleModeChange = (newMode: CodecMode) => {
    setMode(newMode);
    // 切换模式时重新处理
    if (output) {
      // 交换输入输出
      setInput(output);
      processText(output, newMode);
    } else {
      processText(input, newMode);
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 忽略复制失败
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
  };

  // 解析URL参数
  const handleParseParams = () => {
    if (!input.trim()) return;
    try {
      const url = new URL(input);
      const params: Record<string, string> = {};
      url.searchParams.forEach((value, key) => {
        params[key] = value;
      });
      setOutput(JSON.stringify(params, null, 2));
      setError('');
    } catch {
      // 尝试作为查询字符串解析
      try {
        const params = new URLSearchParams(input);
        const result: Record<string, string> = {};
        params.forEach((value, key) => {
          result[key] = value;
        });
        if (Object.keys(result).length > 0) {
          setOutput(JSON.stringify(result, null, 2));
          setError('');
        } else {
          setError('无法解析URL参数');
        }
      } catch {
        setError('无法解析URL参数');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">URL 编码/解码</h1>
        <p className="mt-1 text-gray-500">URL编码、解码以及参数解析工具</p>
      </div>

      {/* 模式切换 */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-lg inline-flex">
        <button
          onClick={() => handleModeChange('encode')}
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium transition-all',
            mode === 'encode'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          编码 (Encode)
        </button>
        <button
          onClick={() => handleModeChange('decode')}
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium transition-all',
            mode === 'decode'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          解码 (Decode)
        </button>
      </div>

      {/* 输入区域 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            {mode === 'encode' ? '输入文本' : '输入URL编码'}
          </label>
          <div className="flex gap-2">
            <button
              onClick={handleParseParams}
              className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="解析URL参数"
            >
              <FileJson className="w-3 h-3" />
              解析参数
            </button>
            <button
              onClick={handleClear}
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 rounded transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              清空
            </button>
          </div>
        </div>
        <textarea
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={mode === 'encode' ? '输入要编码的文本...' : '输入要解码的URL编码字符串...'}
          className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y font-mono text-sm"
        />
        <div className="text-xs text-gray-400 text-right">
          {input.length} 字符
        </div>
      </div>

      {/* 箭头指示 */}
      <div className="flex justify-center">
        <div className="p-2 bg-gray-100 rounded-full">
          <ArrowDown className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* 输出区域 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            {mode === 'encode' ? '编码结果' : '解码结果'}
          </label>
          <button
            onClick={handleCopy}
            disabled={!output}
            className={cn(
              'flex items-center gap-1 px-3 py-1.5 text-sm rounded transition-all',
              output
                ? 'text-blue-600 hover:bg-blue-50'
                : 'text-gray-300 cursor-not-allowed'
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
        <div className="relative">
          <textarea
            value={output}
            readOnly
            placeholder="结果将显示在这里..."
            className={cn(
              'w-full h-40 p-4 border rounded-lg resize-y font-mono text-sm bg-gray-50',
              error ? 'border-red-300 bg-red-50' : 'border-gray-300'
            )}
          />
          {error && (
            <div className="absolute bottom-3 left-4 text-xs text-red-500">
              {error}
            </div>
          )}
        </div>
        <div className="text-xs text-gray-400 text-right">
          {output.length} 字符
        </div>
      </div>

      {/* 使用说明 */}
      <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
        <h4 className="font-semibold mb-2">使用说明：</h4>
        <ul className="list-disc list-inside space-y-1 text-blue-700">
          <li>编码：将普通文本转换为URL安全的编码格式</li>
          <li>解码：将URL编码还原为原始文本</li>
          <li>解析参数：从完整URL或查询字符串中提取参数</li>
        </ul>
      </div>
    </div>
  );
}
