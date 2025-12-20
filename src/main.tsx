import React from "react";
import ReactDOM from "react-dom/client";
import { warn, debug, trace, info, error } from "@tauri-apps/plugin-log";
import App from "./App";
import "./i18n";

// Forward console logs to Tauri log plugin
function forwardConsole(
  fnName: "log" | "debug" | "info" | "warn" | "error",
  logger: (message: string) => Promise<void>
) {
  const original = console[fnName];
  console[fnName] = (...args: unknown[]) => {
    original(...args);
    // 将所有参数转换为字符串并拼接
    const message = args
      .map((arg) =>
        typeof arg === "object" ? JSON.stringify(arg) : String(arg)
      )
      .join(" ");
    logger(message);
  };
}

forwardConsole("log", trace);
forwardConsole("debug", debug);
forwardConsole("info", info);
forwardConsole("warn", warn);
forwardConsole("error", error);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
