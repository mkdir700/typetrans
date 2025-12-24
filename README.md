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

## ✨ 功能特性

- **边写边译** - 专为写作场景设计，解决"提笔忘词"或"外语写作困难"
- **全局唤起** - 在任何输入状态下快速触发，无缝衔接写作流
- **一键粘贴** - 翻译完成后自动粘贴到原应用程序，无需手动复制粘贴
- **现代化 UI** - 基于 Shadcn UI 的磨砂玻璃界面，支持 **深色模式** 和 **系统主题** 跟随
- **多引擎支持** - 支持 **智谱 AI** 和 **腾讯云翻译**
- **多语气翻译** - 支持 正式 / 随意 / 学术 / 创意 等多种翻译语气

## 📱 使用方法

1. 在聊天软件或编辑器中，确保光标在输入框内
2. 按下快捷键 `Alt + T` (默认)
3. 在弹出的 TypeTrans 窗口中输入你的**母语** (例如中文)
4. 等待 AI 实时翻译为**目标语言** (例如英文)
5. 按下 `Alt+Enter` 键，译文将自动粘贴到你原来的输入框中

## 🗺️ 开发路线图

- [x] 基础翻译功能 (智谱 AI)
- [x] 设置界面 (通用/服务/快捷键)
- [x] 多主题支持 (浅色/深色)
- [x] 自定义快捷键
- [x] 支持腾讯云翻译 (TMT)
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
