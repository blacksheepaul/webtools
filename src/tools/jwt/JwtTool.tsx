import { useState, useCallback } from 'react';
import { cn } from '../../utils/cn';
import { Copy, Check, RotateCcw, Eye, EyeOff } from 'lucide-react';

interface DecodedJwt {
  header: Record<string, unknown> | null;
  payload: Record<string, unknown> | null;
  signature: string;
  valid: boolean;
}

// Base64Url 解码
function base64UrlDecode(str: string): string {
  // 替换 Base64Url 字符为标准 Base64
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  // 补齐 padding
  const padding = base64.length % 4;
  if (padding) {
    base64 += '='.repeat(4 - padding);
  }
  try {
    return decodeURIComponent(escape(atob(base64)));
  } catch {
    throw new Error('Invalid Base64Url');
  }
}

// 解码 JWT
function decodeJwt(token: string): DecodedJwt {
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }

  const header = JSON.parse(base64UrlDecode(parts[0]));
  const payload = JSON.parse(base64UrlDecode(parts[1]));

  return {
    header,
    payload,
    signature: parts[2],
    valid: true,
  };
}

// 格式化 JSON
function formatJson(obj: unknown): string {
  return JSON.stringify(obj, null, 2);
}

export default function JwtTool() {
  const [input, setInput] = useState('');
  const [decoded, setDecoded] = useState<DecodedJwt | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<'header' | 'payload' | null>(null);
  const [showHeader, setShowHeader] = useState(true);
  const [showPayload, setShowPayload] = useState(true);

  const handleInputChange = useCallback((value: string) => {
    setInput(value);

    if (!value.trim()) {
      setDecoded(null);
      setError('');
      return;
    }

    try {
      const result = decodeJwt(value.trim());
      setDecoded(result);
      setError('');
    } catch {
      setDecoded(null);
      setError('无效的 JWT 格式');
    }
  }, []);

  const handleCopy = async (type: 'header' | 'payload') => {
    if (!decoded) return;
    const text = type === 'header'
      ? formatJson(decoded.header)
      : formatJson(decoded.payload);

    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // 忽略复制失败
    }
  };

  const handleClear = () => {
    setInput('');
    setDecoded(null);
    setError('');
  };

  // 示例 JWT
  const loadExample = () => {
    const example = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    handleInputChange(example);
    setInput(example);
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">JWT 解码</h1>
        <p className="mt-1 text-gray-500">解析和验证 JSON Web Token</p>
      </div>

      {/* 输入区域 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">输入 JWT</label>
          <div className="flex gap-2">
            <button
              onClick={loadExample}
              className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
            >
              加载示例
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
          placeholder="请输入 JWT 字符串..."
          className={cn(
            'w-full h-32 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y font-mono text-sm',
            error ? 'border-red-300 bg-red-50' : 'border-gray-300'
          )}
        />
        {error && (
          <div className="text-xs text-red-500">{error}</div>
        )}
      </div>

      {/* 解析结果 */}
      {decoded && (
        <div className="space-y-4">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Header (头部)</label>
                <button
                  onClick={() => setShowHeader(!showHeader)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showHeader ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                onClick={() => handleCopy('header')}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-all"
              >
                {copied === 'header' ? (
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
            {showHeader && (
              <div className="relative">
                <pre className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm overflow-x-auto">
                  <code>{formatJson(decoded.header)}</code>
                </pre>
              </div>
            )}
          </div>

          {/* Payload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Payload (载荷)</label>
                <button
                  onClick={() => setShowPayload(!showPayload)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showPayload ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                onClick={() => handleCopy('payload')}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-all"
              >
                {copied === 'payload' ? (
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
            {showPayload && (
              <div className="relative">
                <pre className="w-full p-4 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm overflow-x-auto">
                  <code>{formatJson(decoded.payload)}</code>
                </pre>
              </div>
            )}
          </div>

          {/* Signature */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Signature (签名)</label>
            <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 font-mono text-xs text-gray-600 break-all">
              {decoded.signature}
            </div>
          </div>
        </div>
      )}

      {/* 使用说明 */}
      <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
        <h4 className="font-semibold mb-2">使用说明：</h4>
        <ul className="list-disc list-inside space-y-1 text-blue-700">
          <li>JWT 由 Header、Payload 和 Signature 三部分组成，用点号分隔</li>
          <li>本工具可以解码查看 JWT 的内容（Base64Url 解码）</li>
          <li>注意：解码不代表验证签名，验证签名需要密钥</li>
          <li>敏感信息（如密码）不应存放在 JWT 的 Payload 中</li>
        </ul>
      </div>
    </div>
  );
}
