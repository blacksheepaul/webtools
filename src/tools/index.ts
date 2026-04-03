import { urlCodecTool } from "./urlcodec";
import { base64Tool } from "./base64";
import { uuidTool } from "./uuid";
import { jwtTool } from "./jwt";
import { dateCalcTool } from "./datecalc";
import { diffTool } from "./diff";
import { fileHashTool } from "./filehash";
import { registerTools, registerCategories } from "../utils/toolRegistry";
import type { ToolCategory } from "../types/tool";
import { Code, Hash, Shield, Image, FileText, Wrench } from "lucide-react";

// 定义分类
const categories: ToolCategory[] = [
  { id: "encoding", name: "编码解码", icon: Code },
  { id: "hash", name: "哈希加密", icon: Hash },
  { id: "security", name: "安全工具", icon: Shield },
  { id: "image", name: "图片工具", icon: Image },
  { id: "text", name: "文本工具", icon: FileText },
  { id: "other", name: "其他工具", icon: Wrench },
];

// 注册所有工具
const tools = [
  urlCodecTool,
  base64Tool,
  uuidTool,
  jwtTool,
  dateCalcTool,
  diffTool,
  fileHashTool,
  // 未来在这里添加更多工具...
];

export function initTools() {
  registerCategories(categories);
  registerTools(tools);
}

export * from "./urlcodec";
export * from "./base64";
export * from "./uuid";
export * from "./jwt";
export * from "./datecalc";
export * from "./diff";
export * from "./filehash";
