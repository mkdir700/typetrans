import { useEffect, useState } from "react";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import Translator from "./Translator";
import "./App.css";

function App() {
  const [windowLabel, setWindowLabel] = useState<string>("");

  useEffect(() => {
    // Get current window label to determine which component to render
    const currentWindow = getCurrentWebviewWindow();
    setWindowLabel(currentWindow.label);
  }, []);

  // Render different components based on window label
  if (windowLabel === "translator") {
    return <Translator />;
  }

  // Main window - can be used for settings or hidden
  return (
    <div className="main-container">
      <h1>TypeTrans - 边写边译</h1>
      <div className="info-section">
        <h2>使用说明</h2>
        <ul>
          <li>选中任意文本</li>
          <li>
            按下 <kbd>Alt + T</kbd> 快捷键
          </li>
          <li>在弹出的窗口中查看翻译结果</li>
          <li>点击 "Copy Translation" 复制译文</li>
        </ul>

        <h2>支持的语言</h2>
        <ul>
          <li>中文 (ZH)</li>
          <li>英文 (EN)</li>
          <li>日文 (JA)</li>
        </ul>

        <div className="note">
          <strong>注意:</strong> 请在环境变量中设置 <code>DEEPL_API_KEY</code>{" "}
          以使用翻译功能。
        </div>
      </div>
    </div>
  );
}

export default App;
