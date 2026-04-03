import type { Tool, ToolCategory } from '../types/tool';

class ToolRegistry {
  private tools: Map<string, Tool> = new Map();
  private categories: Map<string, ToolCategory> = new Map();

  /** 注册工具 */
  register(tool: Tool): void {
    if (this.tools.has(tool.id)) {
      console.warn(`Tool with id "${tool.id}" already exists. It will be overwritten.`);
    }
    this.tools.set(tool.id, tool);
  }

  /** 批量注册工具 */
  registerBatch(tools: Tool[]): void {
    tools.forEach(tool => this.register(tool));
  }

  /** 获取工具 */
  getTool(id: string): Tool | undefined {
    return this.tools.get(id);
  }

  /** 获取所有工具 */
  getAllTools(): Tool[] {
    return Array.from(this.tools.values()).filter(tool => !tool.hidden);
  }

  /** 按分类获取工具 */
  getToolsByCategory(categoryId: string): Tool[] {
    return this.getAllTools().filter(tool => tool.category === categoryId);
  }

  /** 注册分类 */
  registerCategory(category: ToolCategory): void {
    this.categories.set(category.id, category);
  }

  /** 批量注册分类 */
  registerCategories(categories: ToolCategory[]): void {
    categories.forEach(category => this.registerCategory(category));
  }

  /** 获取分类 */
  getCategory(id: string): ToolCategory | undefined {
    return this.categories.get(id);
  }

  /** 获取所有分类 */
  getAllCategories(): ToolCategory[] {
    return Array.from(this.categories.values());
  }

  /** 清空所有工具（用于测试） */
  clear(): void {
    this.tools.clear();
    this.categories.clear();
  }
}

// 导出单例实例
export const toolRegistry = new ToolRegistry();

// 导出便捷方法
export const registerTool = (tool: Tool) => toolRegistry.register(tool);
export const registerTools = (tools: Tool[]) => toolRegistry.registerBatch(tools);
export const registerCategory = (category: ToolCategory) => toolRegistry.registerCategory(category);
export const registerCategories = (categories: ToolCategory[]) => toolRegistry.registerCategories(categories);
