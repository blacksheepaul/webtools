#!/usr/bin/env node

/**
 * 生成屏保配置文件
 * 扫描 public/assets/screensaver/images/ 目录，自动生成图片列表
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const IMAGES_DIR = path.join(__dirname, "../public/assets/screensaver/images");
const OUTPUT_FILE = path.join(
  __dirname,
  "../public/assets/screensaver/config.json",
);

// 支持的图片格式
const SUPPORTED_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".avif",
];

function generateConfig() {
  // 检查目录是否存在
  if (!fs.existsSync(IMAGES_DIR)) {
    console.log("📁 图片目录不存在，创建中...");
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }

  // 读取目录
  const files = fs.readdirSync(IMAGES_DIR);

  // 过滤图片文件
  const images = files
    .filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return SUPPORTED_EXTENSIONS.includes(ext);
    })
    .map((file) => `/assets/screensaver/images/${file}`)
    .sort(); // 按文件名排序，方便维护

  // 生成配置
  const config = {
    images,
    updatedAt: new Date().toISOString(),
  };

  // 写入文件
  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(config, null, 2));

  console.log(`✅ 已生成屏保配置：${images.length} 张图片`);
  if (images.length > 0) {
    images.forEach((img) => console.log(`   - ${path.basename(img)}`));
  } else {
    console.log(
      "   ⚠️  未找到图片文件，请将图片放入 public/assets/screensaver/images/",
    );
  }
}

generateConfig();
