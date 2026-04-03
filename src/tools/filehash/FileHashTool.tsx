import { useState, useCallback, useRef } from 'react';
import { cn } from '../../utils/cn';
import { Copy, Check, Upload, File, X, Shield, ShieldAlert } from 'lucide-react';

// 计算文件哈希
async function calculateHash(file: File, algorithm: string): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest(algorithm, buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 格式化文件大小
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function FileHashTool() {
  const [file, setFile] = useState<File | null>(null);
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const [calculating, setCalculating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [expectedHash, setExpectedHash] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理文件
  const processFile = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    setCalculating(true);
    setHashes({});

    try {
      const algorithms = ['SHA-256', 'SHA-1', 'SHA-384', 'SHA-512'];
      const results: Record<string, string> = {};

      for (const algo of algorithms) {
        const hash = await calculateHash(selectedFile, algo);
        results[algo.replace('-', '').toLowerCase()] = hash;
      }

      setHashes(results);
    } catch {
      // 忽略错误
    } finally {
      setCalculating(false);
    }
  }, []);

  // 文件选择
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  // 拖拽处理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  // 清除文件
  const handleClear = () => {
    setFile(null);
    setHashes({});
    setExpectedHash('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 复制哈希值
  const handleCopy = async (hash: string, type: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // 忽略复制失败
    }
  };

  // 检查哈希是否匹配
  const checkMatch = (hash: string): 'match' | 'mismatch' | null => {
    if (!expectedHash || !hash) return null;
    const normalizedExpected = expectedHash.toLowerCase().replace(/\s/g, '');
    const normalizedHash = hash.toLowerCase();
    return normalizedExpected === normalizedHash ? 'match' : 'mismatch';
  };

  const hashAlgorithms = [
    { key: 'sha256', name: 'SHA-256', description: '推荐，安全性高' },
    { key: 'sha1', name: 'SHA-1', description: '较旧，兼容性好' },
    { key: 'sha384', name: 'SHA-384', description: '中等长度' },
    { key: 'sha512', name: 'SHA-512', description: '最高安全性' },
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">文件哈希校验</h1>
        <p className="mt-1 text-gray-500">计算文件的哈希值，用于校验文件完整性</p>
      </div>

      {/* 上传区域 */}
      {!file ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all',
            dragOver
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          )}
        >
          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-1">点击或拖拽上传文件</p>
          <p className="text-sm text-gray-500">支持任意类型文件，文件在本地计算，不会上传到服务器</p>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : (
        /* 文件信息 */
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <File className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{file.name}</p>
              <p className="text-sm text-gray-500">
                {formatFileSize(file.size)} · {file.type || '未知类型'}
              </p>
            </div>
            <button
              onClick={handleClear}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* 预期哈希值输入 */}
      {file && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">预期哈希值（可选）</label>
          <input
            type="text"
            value={expectedHash}
            onChange={(e) => setExpectedHash(e.target.value)}
            placeholder="粘贴预期的哈希值进行比对..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
          />
          {expectedHash && (
            <div className="flex gap-2 text-xs">
              {hashAlgorithms.map(({ key, name }) => {
                const hash = hashes[key];
                const match = hash ? checkMatch(hash) : null;
                if (!match) return null;
                return (
                  <span
                    key={key}
                    className={cn(
                      'flex items-center gap-1 px-2 py-1 rounded-full',
                      match === 'match'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    )}
                  >
                    {match === 'match' ? (
                      <Shield className="w-3 h-3" />
                    ) : (
                      <ShieldAlert className="w-3 h-3" />
                    )}
                    {name} {match === 'match' ? '匹配' : '不匹配'}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 哈希结果 */}
      {file && calculating && (
        <div className="text-center py-8">
          <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="mt-2 text-sm text-gray-500">正在计算哈希值...</p>
        </div>
      )}

      {Object.keys(hashes).length > 0 && (
        <div className="space-y-3">
          {hashAlgorithms.map(({ key, name, description }) => {
            const hash = hashes[key];
            const match = checkMatch(hash);
            return (
              <div
                key={key}
                className={cn(
                  'border rounded-xl p-4 transition-colors',
                  match === 'match'
                    ? 'border-green-300 bg-green-50'
                    : match === 'mismatch'
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200 bg-white'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{name}</span>
                    <span className="text-xs text-gray-500">{description}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {match === 'match' && (
                      <span className="flex items-center gap-1 text-xs text-green-600">
                        <Shield className="w-3 h-3" />
                        匹配
                      </span>
                    )}
                    {match === 'mismatch' && (
                      <span className="flex items-center gap-1 text-xs text-red-600">
                        <ShieldAlert className="w-3 h-3" />
                        不匹配
                      </span>
                    )}
                    <button
                      onClick={() => handleCopy(hash, key)}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-100 rounded transition-colors"
                    >
                      {copied === key ? (
                        <>
                          <Check className="w-3 h-3" />
                          已复制
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          复制
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <code className="block font-mono text-xs break-all text-gray-700">
                  {hash}
                </code>
              </div>
            );
          })}
        </div>
      )}

      {/* 使用说明 */}
      <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
        <h4 className="font-semibold mb-2">使用说明：</h4>
        <ul className="list-disc list-inside space-y-1 text-blue-700">
          <li>上传文件后会自动计算多种哈希值（SHA-256、SHA-1、SHA-384、SHA-512）</li>
          <li>文件在浏览器本地计算，不会上传到任何服务器</li>
          <li>可粘贴预期的哈希值进行比对，验证文件是否被篡改</li>
          <li>SHA-256 是推荐的标准哈希算法</li>
        </ul>
      </div>
    </div>
  );
}
