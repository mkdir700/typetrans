# TypeTrans 快速启动指南

## 🚀 快速开始

### 1. 设置 API Key

```bash
# Linux/macOS
export DEEPL_API_KEY="your-deepl-api-key"

# Windows PowerShell
$env:DEEPL_API_KEY="your-deepl-api-key"
```

获取 DeepL API Key: https://www.deepl.com/pro-api

### 2. 安装依赖

```bash
bun install
```

### 3. 运行开发环境

```bash
bun run tauri dev
```

### 4. 使用方法

1. 在任意应用中选中文本
2. 按 `Alt + T`
3. 查看翻译结果
4. 点击 "Copy Translation" 复制

## 📝 注意事项

- **首次运行**: 可能需要授予应用辅助功能权限
- **macOS**: 系统偏好设置 → 安全性与隐私 → 辅助功能
- **Linux**: 某些发行版可能需要额外配置
- **Windows**: 通常无需额外配置

## 🔧 自定义快捷键

编辑 `src-tauri/src/lib.rs` 第 120 行:

```rust
let shortcut = "Alt+T"; // 改为你想要的快捷键
```

支持的快捷键格式:
- `Alt+T`
- `Ctrl+Shift+T`
- `Cmd+T` (macOS)
- `Super+T` (Linux)

## 🌍 支持的语言

- 中文 (ZH)
- 英文 (EN)
- 日文 (JA)

可在翻译窗口中切换目标语言。

## ❓ 常见问题

### 快捷键不工作?
- 检查是否与其他应用冲突
- 确认应用有必要的系统权限

### 无法获取选中文本?
- 确认已授予辅助功能权限
- 某些应用可能阻止剪贴板访问

### 翻译失败?
- 检查 API Key 是否正确
- 检查网络连接
- 确认 API 配额未超限

## 📚 更多信息

详细文档请查看 [SETUP.md](./SETUP.md)

