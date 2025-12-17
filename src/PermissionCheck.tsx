import { useEffect, useState } from "react";
import "./PermissionCheck.css";

// Import the macOS permissions plugin
import {
  checkAccessibilityPermission,
  requestAccessibilityPermission,
} from "tauri-plugin-macos-permissions-api";

type PermissionStatus = "granted" | "denied" | "unknown" | "checking";

function PermissionCheck() {
  const [accessibilityStatus, setAccessibilityStatus] =
    useState<PermissionStatus>("checking");
  const [isRequesting, setIsRequesting] = useState(false);

  // Check if we're on macOS
  const isMacOS = navigator.userAgent.includes("Mac");

  useEffect(() => {
    if (isMacOS) {
      checkPermissions();
    }
  }, [isMacOS]);

  const checkPermissions = async () => {
    try {
      setAccessibilityStatus("checking");
      const status = await checkAccessibilityPermission();
      setAccessibilityStatus(status ? "granted" : "denied");
    } catch (error) {
      console.error("Failed to check accessibility permission:", error);
      setAccessibilityStatus("unknown");
    }
  };

  const requestPermission = async () => {
    try {
      setIsRequesting(true);
      await requestAccessibilityPermission();
      // Re-check permission after request
      const granted = await checkAccessibilityPermission();
      setAccessibilityStatus(granted ? "granted" : "denied");
    } catch (error) {
      console.error("Failed to request accessibility permission:", error);
      setAccessibilityStatus("denied");
    } finally {
      setIsRequesting(false);
    }
  };

  // Don't show anything if not on macOS
  if (!isMacOS) {
    return null;
  }

  // Don't show if permission is already granted
  if (accessibilityStatus === "granted") {
    return (
      <div className="permission-status success">
        <span className="status-icon">✓</span>
        <span>辅助功能权限已授予</span>
      </div>
    );
  }

  // Show loading state
  if (accessibilityStatus === "checking") {
    return (
      <div className="permission-status checking">
        <span className="status-icon">⏳</span>
        <span>正在检查权限...</span>
      </div>
    );
  }

  // Show permission request UI
  return (
    <div className="permission-container">
      <div className="permission-warning">
        <h3>⚠️ 需要辅助功能权限</h3>
        <p>TypeTrans 需要辅助功能权限才能:</p>
        <ul>
          <li>监听全局快捷键 (Alt + T)</li>
          <li>自动获取选中的文本</li>
          <li>模拟键盘操作 (Cmd + C)</li>
        </ul>

        <div className="permission-actions">
          <button
            className="request-button"
            onClick={requestPermission}
            disabled={isRequesting}
          >
            {isRequesting ? "正在请求权限..." : "请求辅助功能权限"}
          </button>
          <button className="refresh-button" onClick={checkPermissions}>
            重新检查
          </button>
        </div>

        <div className="permission-note">
          <strong>提示:</strong> 点击上方按钮后,系统会弹出权限请求对话框。
          如果没有弹出,请手动前往:
          <br />
          <code>系统设置 → 隐私与安全 → 辅助功能</code>
          <br />
          然后添加 TypeTrans 应用。
        </div>
      </div>
    </div>
  );
}

export default PermissionCheck;
