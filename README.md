# TypeTrans - 边写边译

<div align="center">

![TypeTrans Logo](public/tauri.svg)

**一个轻量级的边写边译工具**

[![Tauri](https://img.shields.io/badge/Tauri-2.0-blue.svg)](https://tauri.app/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6.svg)](https://www.typescriptlang.org/)
[![Rust](https://img.shields.io/badge/Rust-1.70+-orange.svg)](https://www.rust-lang.org/)
[![Shadcn UI](https://img.shields.io/badge/UI-Shadcn-000000.svg)](https://ui.shadcn.com/)

[功能特性](#-功能特性) • [快速开始](#-快速开始) • [使用方法](#-使用方法) • [技术栈](#-技术栈) • [开发指南](#-开发指南)

</div>

---

## 📖 项目简介

TypeTrans 是一个基于 Tauri v2 构建的现代化「边写边译」工具。**无需切换窗口，在任意输入框通过快捷键唤起，输入母语即时翻译并自动上屏。**

### 核心工作流程

1. 光标聚焦在任意应用的输入框 (如 Slack, WeChat, VS Code)
2. 按下全局快捷键 (默认 `Alt + T`)
3. 唤起悬浮翻译窗口，输入你想说的话
4. 实时显示 AI 翻译结果
5. 按下回车键，自动将译文粘贴到原输入框

## ✨ 功能特性

- **边写边译** - 专为写作场景设计，解决"提笔忘词"或"外语写作困难"
- **全局唤起** - 在任何输入状态下快速触发，无缝衔接写作流
- **一键粘贴** - 翻译完成后自动粘贴到原应用程序，无需手动复制粘贴
- **现代化 UI** - 基于 Shadcn UI 的磨砂玻璃界面，支持 **深色模式** 和 **系统主题** 跟随
- **多引擎支持** - 支持 **智谱 AI** 和 **腾讯云翻译**
- **多语气翻译** - 支持 正式 / 随意 / 学术 / 创意 等多种翻译语气

## 🚀 快速开始

### 前置要求

- [Node.js](https://nodejs.org/) 18+ 或 [Bun](https://bun.sh/) (推荐)
- [Rust](https://www.rust-lang.org/) 1.70+
- 翻译服务 API Key (智谱 AI 或 腾讯云)
- **macOS 用户**: 需要授予辅助功能权限 (首次运行会自动引导，用于模拟键盘输入)

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

   - 运行项目后，点击设置图标进入「服务设置」
   - 选择翻译引擎 (智谱 AI 或 腾讯云)
   - 填写对应的 API Key / Secret ID
   - 点击保存即可生效

4. **运行开发环境**

```bash
bun run tauri dev
# 或使用 npm
npm run tauri dev
```

> 💡 **macOS 用户提示**: 首次运行时, 应用会检查辅助功能权限。如果未授予, 请点击应用中的"请求辅助功能权限"按钮, 或在系统设置中手动开启。

5. **构建生产版本**

```bash
bun run tauri build
# 或使用 npm
npm run tauri build
```

## 📱 使用方法

### 写作辅助

1. 在聊天软件或编辑器中，确保光标在输入框内
2. 按下快捷键 `Alt + T` (默认)
3. 在弹出的 TypeTrans 窗口中输入你的**母语** (例如中文)
4. 等待 AI 实时翻译为**目标语言** (例如英文)
5. 按下 `Enter` 键，译文将自动粘贴到你原来的输入框中

### 设置说明

点击窗口右上角的设置图标，可以进入设置页面：

- **通用设置**: 切换语言、切换主题 (浅色/深色/系统)
- **服务设置**: 配置翻译引擎 (智谱AI/腾讯云) 及 API Key
- **快捷键设置**: 自定义全局唤醒快捷键

## 🛠 技术栈

### 前端

- **框架**: React 18
- **语言**: TypeScript 5
- **构建工具**: Vite
- **UI 库**: [Shadcn UI](https://ui.shadcn.com/)
- **样式**: Tailwind CSS v4, Class Variance Authority (CVA)
- **路由**: React Router v7
- **状态管理/国际化**: i18next

### 后端

- **框架**: Tauri 2.0
- **语言**: Rust
- **核心插件**:
  - `tauri-plugin-global-shortcut`: 全局快捷键
  - `tauri-plugin-opener`: 文件/链接打开
  - `tauri-plugin-macos-permissions`: macOS 权限请求
  - `tauri-plugin-updater`: 自动更新
  - `arboard`: 跨平台剪贴板管理
  - `enigo`: 键盘模拟 (用于自动上屏)
  - `reqwest`: HTTP 请求

## 📂 项目结构

```
typetrans/
├── src/
│   ├── components/
│   │   ├── ui/              # Shadcn UI 组件 (Button, Input, etc.)
│   │   ├── effects/         # 视觉特效组件
│   │   └── Sidebar.tsx      # 侧边栏导航
│   ├── pages/
│   │   ├── GeneralSettings.tsx  # 通用设置
│   │   ├── ServiceSettings.tsx  # 服务商设置
│   │   ├── ShortcutSettings.tsx # 快捷键设置
│   │   └── About.tsx            # 关于页面
│   ├── Translator.tsx       # 核心翻译窗口组件
│   ├── App.tsx              # 主应用布局
│   ├── i18n.ts              # 国际化配置
│   └── main.tsx             # 入口文件
├── src-tauri/
│   ├── src/
│   │   ├── main.rs          # Rust 入口
│   │   └── lib.rs           # 核心业务逻辑
│   ├── Cargo.toml           # Rust 依赖
│   └── tauri.conf.json      # Tauri 配置
├── public/                  # 静态资源
└── README.md                # 项目文档
```

## 🗺️ 开发路线图

- [x] 基础翻译功能 (智谱 AI)
- [x] 设置界面 (通用/服务/快捷键)
- [x] 多主题支持 (浅色/深色)
- [x] 自定义快捷键
- [x] 支持腾讯云翻译 (TMT)
- [ ] 更多翻译源支持 (DeepL, OpenAI)
- [ ] 翻译历史记录
- [ ] 离线词典功能
- [ ] 语音朗读 (TTS)

## 🤝 贡献指南

欢迎贡献代码! 请遵循以下步骤：

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/NewFeature`)
3. 提交更改 (`git commit -m 'Add NewFeature'`)
4. 推送到分支 (`git push origin feature/NewFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件
