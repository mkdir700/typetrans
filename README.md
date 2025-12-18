# TypeTrans - 边写边译

<div align="center">

![TypeTrans Logo](public/tauri.svg)

**一个轻量级的跨平台实时翻译桌面工具**

[![Tauri](https://img.shields.io/badge/Tauri-2.0-blue.svg)](https://tauri.app/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6.svg)](https://www.typescriptlang.org/)
[![Rust](https://img.shields.io/badge/Rust-1.70+-orange.svg)](https://www.rust-lang.org/)

[功能特性](#-功能特性) • [快速开始](#-快速开始) • [使用方法](#-使用方法) • [技术栈](#-技术栈) • [开发指南](#-开发指南)

</div>

---

## 📖 项目简介

TypeTrans 是一个基于 Tauri v2、React 和 TypeScript 构建的跨平台桌面翻译工具。它能够让你在任何应用程序中快速翻译选中的文本，无需在翻译软件和工作窗口之间频繁切换，提供无缝、沉浸式的翻译体验。

### 核心工作流程

1. 📝 在任何应用中选中文本
2. ⌨️ 按下全局快捷键 `Alt + T`
3. 🪟 自动弹出悬浮翻译窗口
4. 🌐 实时显示翻译结果
5. 📋 一键复制译文到剪贴板

## ✨ 功能特性

- 🚀 **全局快捷键** - 在任何应用中快速触发翻译
- 🎯 **智能文本获取** - 自动获取选中文本
- 🪟 **悬浮窗口** - 无边框、透明、置顶的优雅界面
- 🌍 **多语言支持** - 支持中文、英文、日文等多种语言
- ⚡ **实时翻译** - 基于 智谱 AI (GLM-4.6) 的高质量翻译
- 📋 **快速复制** - 一键复制翻译结果
- 🎨 **现代化 UI** - 简洁美观的用户界面
- 🔒 **轻量安全** - 基于 Rust 的高性能后端

## 🚀 快速开始

### 前置要求

- [Node.js](https://nodejs.org/) 18+ 或 [Bun](https://bun.sh/)
- [Rust](https://www.rust-lang.org/) 1.70+
- [智谱 AI API Key](https://open.bigmodel.cn/) (用于调用 GLM-4.6)
- **macOS 用户**: 需要授予辅助功能权限(应用会自动引导)

### 安装步骤

1. **克隆项目**

```bash
git clone <your-repo-url>
cd typetrans
```

2. **安装依赖**

```bash
bun install
# 或使用 npm
npm install
```

3. **配置 API Key**

- 打开翻译窗口右上角的设置按钮，填写并保存「智谱 AI API Key」
- （可选）开发环境也可以使用环境变量 `ZHIPU_API_KEY`

4. **运行开发环境**

```bash
bun run tauri dev
# 或使用 npm
npm run tauri dev
```

> 💡 **macOS 用户提示**: 首次运行时,应用会检查辅助功能权限。如果未授予,请点击应用中的"请求辅助功能权限"按钮,或查看 [macOS 权限配置指南](MACOS_PERMISSIONS.md)。

5. **构建生产版本**

```bash
bun run tauri build
# 或使用 npm
npm run tauri build
```

## 📱 使用方法

### 基本使用

1. 启动 TypeTrans 应用
2. 在任意应用程序中选中需要翻译的文本
3. 按下快捷键 `Alt + T`
4. 在弹出的悬浮窗口中查看翻译结果
5. 点击 "Copy Translation" 按钮复制译文
6. 点击右上角 ✕ 关闭窗口

### 切换目标语言

在翻译窗口顶部可以选择目标语言:

- 🇨🇳 中文 (ZH)
- 🇬🇧 英文 (EN)
- 🇯🇵 日文 (JA)

### 自定义快捷键

编辑 `src-tauri/src/lib.rs` 文件:

```rust
let shortcut = "Alt+T"; // 修改为你想要的快捷键
```

支持的快捷键格式:

- `Alt+T`
- `Ctrl+Shift+T`
- `Cmd+T` (macOS)
- `Super+T` (Linux)

## 🛠 技术栈

### 前端

- **框架**: React 18
- **语言**: TypeScript 5
- **构建工具**: Vite
- **UI**: 自定义 CSS (现代化设计)

### 后端

- **框架**: Tauri 2.0
- **语言**: Rust
- **核心库**:
  - `tauri-plugin-global-shortcut` - 全局快捷键支持
  - `arboard` - 跨平台剪贴板操作
  - `reqwest` - HTTP 客户端
  - `enigo` - 键盘输入模拟
  - `serde` - 序列化/反序列化

### API 服务

- **翻译服务**: 智谱 AI GLM-4.6

## 📂 项目结构

```
typetrans/
├── src/                      # 前端源码
│   ├── App.tsx              # 主应用组件
│   ├── App.css              # 主应用样式
│   ├── Translator.tsx       # 翻译窗口组件
│   ├── Translator.css       # 翻译窗口样式
│   └── main.tsx             # 入口文件
├── src-tauri/               # Rust 后端
│   ├── src/
│   │   ├── main.rs         # 程序入口
│   │   └── lib.rs          # 核心业务逻辑
│   ├── Cargo.toml          # Rust 依赖配置
│   └── tauri.conf.json     # Tauri 配置文件
├── public/                  # 静态资源
├── SETUP.md                 # 详细安装指南
├── QUICKSTART.md            # 快速启动指南
└── README.md                # 项目说明文档
```

## 🔧 开发指南

### 开发环境设置

1. **安装推荐的 IDE 扩展**

   - [VS Code](https://code.visualstudio.com/)
   - [Tauri Extension](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
   - [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

2. **启动开发服务器**

```bash
bun run tauri dev
```

3. **热重载**
   - 前端代码修改会自动热重载
   - Rust 代码修改需要重新编译

### 核心功能实现

#### 全局快捷键监听

使用 `tauri-plugin-global-shortcut` 注册全局快捷键:

```rust
app.global_shortcut()
    .on_shortcut(shortcut, move |_app, _event, _shortcut| {
        handle.emit("global-shortcut-triggered", ()).unwrap();
    })
    .unwrap();
```

#### 获取选中文本

通过模拟 `Ctrl+C` 复制选中文本到剪贴板:

```rust
// Simulate Ctrl+C
enigo.key(Key::Control, Direction::Press)?;
enigo.key(Key::Unicode('c'), Direction::Click)?;
enigo.key(Key::Control, Direction::Release)?;

// Read from clipboard
clipboard.get_text()?
```

#### 调用翻译 API

使用 `reqwest` 调用智谱 AI Chat Completions API:

```rust
let res = client
    .post("https://open.bigmodel.cn/api/paas/v4/chat/completions")
    .header("Authorization", format!("Bearer {}", api_key))
    .json(&payload)
    .send()
    .await?;
```

## ⚙️ 配置说明

### 窗口配置

在 `src-tauri/tauri.conf.json` 中配置窗口属性:

```json
{
  "label": "translator",
  "visible": false,
  "decorations": false,
  "transparent": true,
  "alwaysOnTop": true,
  "skipTaskbar": true,
  "width": 400,
  "height": 300
}
```

### API 配置

支持的翻译语言代码:

- `ZH` - 中文
- `EN` - 英文
- `JA` - 日文
> 💡 其他语言也可以直接传入目标语言代码/名称，模型会尽量按目标语言输出。

## ❓ 常见问题

### 快捷键不工作?

- ✅ 检查是否与其他应用的快捷键冲突
- ✅ 确认应用已获得必要的系统权限
- ✅ 尝试重启应用

### 无法获取选中文本?

- ✅ **macOS**: 系统偏好设置 → 安全性与隐私 → 辅助功能 → 添加 TypeTrans
- ✅ **Linux**: 某些发行版可能需要额外的权限配置
- ✅ **Windows**: 通常无需额外配置,如有问题请以管理员身份运行

### 翻译失败?

- ✅ 检查设置页中是否已保存「智谱 AI API Key」（或环境变量 `ZHIPU_API_KEY`）
- ✅ 检查网络连接是否正常
- ✅ 确认智谱 AI 账号额度/配额未超限
- ✅ 查看控制台错误日志

### 如何更换翻译服务?

目前支持智谱 AI GLM-4.6。如需接入其他翻译服务，需要修改 `src-tauri/src/lib.rs` 中的 `get_translation` 函数。

## 🗺️ 开发路线图

- [ ] 支持更多翻译服务 (Google Translate, Azure Translator)
- [ ] 添加翻译历史记录
- [ ] 支持自定义快捷键 (通过 UI 配置)
- [x] 添加设置界面
- [ ] 支持更多语言
- [ ] 添加发音功能
- [ ] 支持批量翻译
- [ ] 添加词典功能

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出建议!

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [Tauri](https://tauri.app/) - 强大的桌面应用框架
- [React](https://reactjs.org/) - 优秀的前端框架
- [Rust](https://www.rust-lang.org/) - 安全高效的系统编程语言

## 📞 联系方式

如有问题或建议,欢迎通过以下方式联系:

- 提交 [Issue](https://github.com/mkdir700/typetrans/issues)
- 发送邮件至: mkdir700@gmail.com

---

<div align="center">

**如果这个项目对你有帮助,请给它一个 ⭐️**

Made with ❤️ by mkdir700

</div>
