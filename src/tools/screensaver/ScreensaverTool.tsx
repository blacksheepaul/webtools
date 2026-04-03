import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "../../utils/cn";
import {
  Images,
  Video,
  Box,
  Settings,
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
} from "lucide-react";

// 屏保类型
type ScreensaverType = "images" | "video" | "threejs";

// 随机打乱数组（Fisher-Yates 算法）
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// 加载屏保配置
async function loadScreensaverConfig(): Promise<string[]> {
  try {
    const response = await fetch("/assets/screensaver/config.json");
    if (!response.ok) return [];
    const config = await response.json();
    return config.images || [];
  } catch {
    return [];
  }
}

// 视频资源
const videoFile = "/assets/screensaver/video/loop.mp4";

// 图片屏保组件
function ImageScreensaver({
  interval = 5000,
  onExit,
}: {
  interval?: number;
  onExit: () => void;
}) {
  const [shuffledImages, setShuffledImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 加载配置并打乱
  useEffect(() => {
    loadScreensaverConfig().then((loadedImages) => {
      setShuffledImages(shuffleArray(loadedImages));
    });
  }, []);

  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % shuffledImages.length);
  }, [shuffledImages.length]);

  const prevImage = useCallback(() => {
    setCurrentIndex(
      (prev) => (prev - 1 + shuffledImages.length) % shuffledImages.length,
    );
  }, []);

  // 自动切换
  useEffect(() => {
    if (isPlaying && shuffledImages.length > 0) {
      timeoutRef.current = setInterval(nextImage, interval);
    }
    return () => {
      if (timeoutRef.current) clearInterval(timeoutRef.current);
    };
  }, [isPlaying, interval, nextImage, shuffledImages.length]);

  // 隐藏控制栏
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
  };

  return (
    <div
      className="fixed inset-0 bg-black"
      onMouseMove={handleMouseMove}
      onClick={handleMouseMove}
    >
      {/* 图片显示 */}
      {shuffledImages.length === 0 ? (
        <div className="absolute inset-0 flex items-center justify-center text-white/60">
          <div className="text-center">
            <Images className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">暂无图片</p>
            <p className="text-sm opacity-60 mt-2">
              请将图片放入 public/assets/screensaver/images/
            </p>
          </div>
        </div>
      ) : (
        shuffledImages.map((src, index) => (
          <img
            key={src}
            src={src}
            alt=""
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-opacity duration-1000",
              index === currentIndex ? "opacity-100" : "opacity-0",
            )}
            onError={(e) => {
              // 图片加载失败时隐藏
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ))
      )}

      {/* 控制栏 */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0",
        )}
      >
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={prevImage}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6" />
              )}
            </button>
            <button
              onClick={nextImage}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="text-white/60 text-sm">
            {currentIndex + 1} / {shuffledImages.length}
          </div>

          <button
            onClick={onExit}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

// 视频屏保组件
function VideoScreensaver({ onExit }: { onExit: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
  };

  return (
    <div
      className="fixed inset-0 bg-black"
      onMouseMove={handleMouseMove}
      onClick={handleMouseMove}
    >
      <video
        ref={videoRef}
        src={videoFile}
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        onError={() => {
          // 视频加载失败
        }}
      />

      {/* 控制栏 */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0",
        )}
      >
        <div className="flex items-center justify-center">
          <button
            onClick={onExit}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Three.js 图形屏保组件
function ThreeJSScreensaver({ onExit }: { onExit: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animationRef = useRef<number | null>(null);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // 动态导入 three.js
    const initThree = async () => {
      const THREE = await import("three");

      const container = containerRef.current!;
      const width = container.clientWidth;
      const height = container.clientHeight;

      // 场景
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0a0a0a);

      // 相机
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.z = 5;

      // 渲染器
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(window.devicePixelRatio);
      container.appendChild(renderer.domElement);

      // 创建几何体 - 多个旋转的立方体
      const geometries: import("three").Mesh[] = [];
      const colors = [0x3b82f6, 0x8b5cf6, 0xec4899, 0x10b981, 0xf59e0b];

      for (let i = 0; i < 5; i++) {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({
          color: colors[i],
          wireframe: true,
          transparent: true,
          opacity: 0.8,
        });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.x = (i - 2) * 1.5;
        cube.rotation.x = Math.random() * Math.PI;
        cube.rotation.y = Math.random() * Math.PI;
        scene.add(cube);
        geometries.push(cube);
      }

      // 添加粒子
      const particlesGeometry = new THREE.BufferGeometry();
      const particlesCount = 1000;
      const posArray = new Float32Array(particlesCount * 3);

      for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 20;
      }

      particlesGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(posArray, 3),
      );
      const particlesMaterial = new THREE.PointsMaterial({
        size: 0.02,
        color: 0xffffff,
        transparent: true,
        opacity: 0.6,
      });
      const particlesMesh = new THREE.Points(
        particlesGeometry,
        particlesMaterial,
      );
      scene.add(particlesMesh);

      // 动画循环
      const animate = () => {
        animationRef.current = requestAnimationFrame(animate);

        geometries.forEach((cube, i) => {
          cube.rotation.x += 0.005 * (i + 1);
          cube.rotation.y += 0.01 * (i + 1);
        });

        particlesMesh.rotation.y += 0.001;

        renderer.render(scene, camera);
      };

      animate();

      // 响应式
      const handleResize = () => {
        if (!container) return;
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
      };

      window.addEventListener("resize", handleResize);

      // 清理
      return () => {
        window.removeEventListener("resize", handleResize);
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        geometries.forEach((g) => {
          g.geometry.dispose();
          (g.material as import("three").Material).dispose();
        });
        particlesGeometry.dispose();
        particlesMaterial.dispose();
        renderer.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      };
    };

    const cleanup = initThree();

    return () => {
      cleanup.then((cleanupFn) => cleanupFn?.());
    };
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black"
      onMouseMove={handleMouseMove}
      onClick={handleMouseMove}
    >
      <div ref={containerRef} className="absolute inset-0" />

      {/* 控制栏 */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0",
        )}
      >
        <div className="flex items-center justify-center">
          <button
            onClick={onExit}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}

// 主组件
export default function ScreensaverTool() {
  const [activeMode, setActiveMode] = useState<ScreensaverType | null>(null);
  const [imageInterval, setImageInterval] = useState(5000);

  // 全屏
  const enterFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // 忽略全屏错误
    }
  };

  // 退出全屏
  const exitFullscreen = async () => {
    try {
      if (document.exitFullscreen && document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {
      // 忽略错误
    }
  };

  const handleStart = (mode: ScreensaverType) => {
    setActiveMode(mode);
    enterFullscreen();
  };

  const handleExit = () => {
    setActiveMode(null);
    exitFullscreen();
  };

  // ESC 键退出
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeMode) {
        handleExit();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeMode]);

  // 渲染屏保
  if (activeMode === "images") {
    return <ImageScreensaver interval={imageInterval} onExit={handleExit} />;
  }

  if (activeMode === "video") {
    return <VideoScreensaver onExit={handleExit} />;
  }

  if (activeMode === "threejs") {
    return <ThreeJSScreensaver onExit={handleExit} />;
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">屏保</h1>
        <p className="mt-1 text-gray-500">选择一种屏保模式，按 ESC 退出</p>
      </div>

      {/* 屏保选择 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 图片屏保 */}
        <button
          onClick={() => handleStart("images")}
          className="group p-6 bg-white border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all text-left"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500 transition-colors">
            <Images className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">图片轮播</h3>
          <p className="text-sm text-gray-500">
            自动切换图片，支持自定义切换间隔
          </p>
        </button>

        {/* 视频屏保 */}
        <button
          onClick={() => handleStart("video")}
          className="group p-6 bg-white border border-gray-200 rounded-xl hover:border-purple-500 hover:shadow-lg transition-all text-left"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-500 transition-colors">
            <Video className="w-6 h-6 text-purple-600 group-hover:text-white transition-colors" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">视频循环</h3>
          <p className="text-sm text-gray-500">播放短视频并无限循环</p>
        </button>

        {/* Three.js 屏保 */}
        <button
          onClick={() => handleStart("threejs")}
          className="group p-6 bg-white border border-gray-200 rounded-xl hover:border-emerald-500 hover:shadow-lg transition-all text-left"
        >
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-500 transition-colors">
            <Box className="w-6 h-6 text-emerald-600 group-hover:text-white transition-colors" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">3D 动画</h3>
          <p className="text-sm text-gray-500">Three.js 制作的动态 3D 图形</p>
        </button>
      </div>

      {/* 设置 */}
      <div className="bg-gray-50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-gray-500" />
          <h3 className="font-medium text-gray-900">设置</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-700 block mb-2">
              图片切换间隔: {(imageInterval / 1000).toFixed(0)} 秒
            </label>
            <input
              type="range"
              min={1000}
              max={30000}
              step={1000}
              value={imageInterval}
              onChange={(e) => setImageInterval(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1秒</span>
              <span>30秒</span>
            </div>
          </div>
        </div>
      </div>

      {/* 说明 */}
      <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
        <h4 className="font-semibold mb-2">使用说明：</h4>
        <ul className="list-disc list-inside space-y-1 text-blue-700">
          <li>点击上方卡片进入全屏屏保模式</li>
          <li>按 ESC 键或点击控制栏的 X 按钮退出屏保</li>
          <li>图片屏保支持暂停、切换上一张/下一张</li>
          <li>3D 动画屏保使用 Three.js 渲染</li>
        </ul>
      </div>
    </div>
  );
}
