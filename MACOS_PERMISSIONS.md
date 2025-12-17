# macOS 辅助功能权限配置指南

## 概述

TypeTrans 在 macOS 上需要辅助功能权限才能正常工作,因为应用需要:
- 监听全局快捷键 (Alt + T)
- 自动获取选中的文本
- 模拟键盘操作 (Cmd + C)

## 已实现的功能

### 1. 自动权限检查和请求

应用已集成 `tauri-plugin-macos-permissions` 插件,可以在开发和生产环境中自动检查和请求辅助功能权限。

### 2. 用户界面提示

主窗口会显示权限状态:
- ✓ **已授予**: 显示绿色提示,表示权限已授予
- ⚠️ **未授予**: 显示警告界面,提供"请求权限"按钮

### 3. 一键请求权限

用户可以点击"请求辅助功能权限"按钮,系统会自动弹出权限请求对话框。

## 开发环境使用

### 方法 1: 使用应用内权限请求(推荐)

1. 启动开发服务器:
   ```bash
   bun run tauri dev
   # 或
   npm run tauri dev
   ```

2. 应用启动后,主窗口会自动检查权限状态

3. 如果未授予权限,点击"请求辅助功能权限"按钮

4. 在系统弹出的对话框中点击"打开系统设置"

5. 在"隐私与安全 → 辅助功能"中勾选 TypeTrans

### 方法 2: 手动添加权限

如果自动请求失败,可以手动添加:

1. 打开"系统设置"
2. 进入"隐私与安全" → "辅助功能"
3. 点击左下角的锁图标解锁
4. 点击 "+" 按钮
5. 找到并添加开发版可执行文件:
   ```
   /Users/你的用户名/MyProjects/typetrans/src-tauri/target/debug/typetrans
   ```
6. 勾选旁边的开关

### 方法 3: 使用 Entitlements(已配置)

项目已包含 `src-tauri/Entitlements.plist` 文件,声明了必要的权限:
- `com.apple.security.automation.apple-events` - 自动化事件
- `com.apple.security.network.client` - 网络访问
- `com.apple.security.cs.allow-jit` - JIT 编译
- `com.apple.security.cs.disable-library-validation` - 开发环境库验证

## 生产环境(打包后)

### 构建应用

```bash
bun run tauri build
# 或
npm run tauri build
```

### 首次运行

1. 打开构建好的应用(位于 `src-tauri/target/release/bundle/`)
2. 应用会自动检查权限
3. 如果未授予,点击"请求辅助功能权限"按钮
4. 按照系统提示授予权限

### 手动授予权限

如果需要手动授予:
1. 系统设置 → 隐私与安全 → 辅助功能
2. 添加 TypeTrans.app
3. 勾选开关

## 技术实现

### Rust 端

在 `src-tauri/src/lib.rs` 中初始化插件:

```rust
tauri::Builder::default()
    .plugin(tauri_plugin_macos_permissions::init())
    // ...
```

### 前端

在 `src/PermissionCheck.tsx` 中检查和请求权限:

```typescript
import { check, request } from "tauri-plugin-macos-permissions-api";

// 检查权限
const status = await check("accessibility");

// 请求权限
const granted = await request("accessibility");
```

## 故障排除

### 问题 1: 权限请求对话框没有弹出

**解决方案**:
- 手动前往系统设置添加应用
- 确保应用有正确的签名(生产环境)

### 问题 2: 全局快捷键不工作

**解决方案**:
1. 检查辅助功能权限是否已授予
2. 重启应用
3. 检查快捷键是否与其他应用冲突

### 问题 3: 开发环境每次重新编译后需要重新授权

**原因**: 每次编译后二进制文件会改变,macOS 会将其视为新应用

**解决方案**:
- 使用应用内权限请求功能,每次启动时自动检查
- 或者在系统设置中保持开发版路径的权限

## 相关文件

- `src-tauri/src/lib.rs` - Rust 端插件初始化
- `src/PermissionCheck.tsx` - 权限检查组件
- `src/PermissionCheck.css` - 权限界面样式
- `src-tauri/Entitlements.plist` - macOS 权限声明
- `src-tauri/Cargo.toml` - Rust 依赖配置
- `package.json` - 前端依赖配置

## 参考资料

- [tauri-plugin-macos-permissions](https://github.com/tauri-apps/plugins-workspace/tree/v2/plugins/macos-permissions)
- [Tauri v2 文档](https://v2.tauri.app/)
- [macOS 辅助功能权限](https://support.apple.com/zh-cn/guide/mac-help/mh43185/mac)

