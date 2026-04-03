import { useState, useCallback } from 'react';
import { cn } from '../../utils/cn';
import { ArrowDown, Copy, Check, RotateCcw, Upload, FileText } from 'lucide-react';

type CodecMode = 'encode' | 'decode';

export default function Base64Tool() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<CodecMode>('encode');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [urlSafe, setUrlSafe] = useState(false);

  const processText = useCallback((text: string, currentMode: CodecMode, isUrlSafe: boolean) => {
    if (!text) {
      setOutput('');
      setError('');
      return;
    }

    try {
      if (currentMode === 'encode') {
        // 文本转 Base64
        let encoded = btoa(unescape(encodeURIComponent(text)));
        if (isUrlSafe) {
          // URL Safe Base64: 替换 + 为 -，/ 为 _，去掉 =
          encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
        }
        setOutput(encoded);
      } else {
        // Base64 转文本
        let decodedText = text;
        if (isUrlSafe) {
          // URL Safe Base64 还原
          decodedText = decodedText.replace(/-/g, '+').replace(/_/g, '/');
          // 补齐 =
          const padding = decodedText.length % 4;
          if (padding) {
            decodedText += '='.repeat(4 - padding);
          }
        }
        const decoded = decodeURIComponent(escape(atob(decodedText)));
        setOutput(decoded);
      }
      setError('');
    } catch (e) {
      setError(currentMode === 'decode' ? '无效的 Base64 字符串' : '编码失败');
      setOutput('');
    }
  }, []);

  const handleInputChange = (value: string) => {
    setInput(value);
    processText(value, mode, urlSafe);
  };

  const handleModeChange = (newMode: CodecMode) => {
    setMode(newMode);
    if (output) {
      setInput(output);
      processText(output, newMode, urlSafe);
    } else {
      processText(input, newMode, urlSafe);
    }
  };

  const handleUrlSafeChange = (checked: boolean) => {
    setUrlSafe(checked);
    processText(input, mode, checked);
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

  // 文件转 Base64
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      // Data URL 格式: data:[<mediatype>][;base64],<data>
      const base64 = result.split(',')[1];
      setInput(`[文件: ${file.name}]`);
      setOutput(urlSafe
        ? base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
        : base64
      );
      setMode('encode');
      setError('');
    };
    reader.onerror = () => {
      setError('文件读取失败');
    };
    reader.readAsDataURL(file);
  };

  // Base64 转文件下载
  const handleDownload = () => {
    if (!input.trim() || mode !== 'decode') return;

    try {
      let base64 = input.trim();
      if (urlSafe) {
        base64 = base64.replace(/-/g, '+').replace(/_/g, '/');
        const padding = base64.length % 4;
        if (padding) {
          base64 += '='.repeat(4 - padding);
        }
      }

      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);

      // 尝试检测文件类型
      const blob = new Blob([byteArray]);
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'decoded-file';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError('无法解码为文件');
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Base64 编码/解码</h1>
        <p className="mt-1 text-gray-500">文本与 Base64 格式互相转换，支持文件编码</p>
      </div>

      {/* 模式切换和选项 */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
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

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={urlSafe}
            onChange={(e) => handleUrlSafeChange(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">URL Safe Base64</span>
        </label>
      </div>

      {/* 输入区域 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            {mode === 'encode' ? '输入文本' : '输入 Base64'}
          </label>
          <div className="flex gap-2">
            {mode === 'encode' && (
              <label className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer">
                <Upload className="w-3 h-3" />
                上传文件
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}
            {mode === 'decode' && output && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
              >
                <FileText className="w-3 h-3" />
                下载为文件
              </button>
            )}
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
          placeholder={mode === 'encode' ? '输入要编码的文本...' : '输入要解码的 Base64 字符串...'}
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
            {mode === 'encode' ? 'Base64 结果' : '解码结果'}
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
          <li>编码：将文本转换为 Base64 格式</li>
          <li>解码：将 Base64 还原为原始文本</li>
          <li>URL Safe：使用 URL 安全的 Base64 编码（+ → -, / → _, 去掉 =）</li>
          <li>支持文件编码：上传文件后自动转为 Base64</li>
          <li>支持解码下载：将 Base64 解码后作为文件下载</li>
        </ul>
      </div>
    </div>
  );
}
