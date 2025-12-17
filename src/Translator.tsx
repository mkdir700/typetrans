import { useState, useEffect, useRef } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  Languages,
  Settings,
  Copy,
  Check,
  Mic,
  Image as ImageIcon,
} from "lucide-react";

// ============ Main Component ============
function Translator() {
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [targetLang] = useState("ZH");
  const [copied, setCopied] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // 引用与防抖
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. 实时翻译逻辑
  useEffect(() => {
    if (!inputText.trim()) {
      setTranslatedText("");
      return;
    }

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(async () => {
      try {
        const translation = await invoke<string>("get_translation", {
          text: inputText,
          targetLang: targetLang,
        });
        setTranslatedText(translation);
      } catch (error) {
        console.error("Translation error:", error);
        setTranslatedText(`Error: ${error}`);
      }
    }, 300);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [inputText, targetLang]);

  // 2. 监听全局快捷键
  useEffect(() => {
    const unlisten = listen("global-shortcut-triggered", async () => {
      try {
        await invoke("show_translator_window");
        setTimeout(() => inputRef.current?.focus(), 100);
      } catch (error) {
        console.error("Error showing window:", error);
      }
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  // 3. 复制功能
  const handleCopy = async () => {
    if (translatedText) {
      await navigator.clipboard.writeText(translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 4. 手动翻译提交
  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    try {
      const translation = await invoke<string>("get_translation", {
        text: inputText,
        targetLang: targetLang,
      });
      setTranslatedText(translation);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    // 圆角窗口容器 - 使用原生 vibrancy 模糊效果
    <div
      className="h-screen w-screen overflow-hidden flex flex-col font-sans select-none rounded-2xl"
      style={{
        background: "transparent", // 完全透明，让原生 vibrancy 显示
      }}
    >
      {/* ========== Header (可拖动区域) ========== */}
      <header
        onMouseDown={(e) => {
          // 仅左键拖动，且不是点击按钮时
          if (
            e.buttons === 1 &&
            (e.target as HTMLElement).tagName !== "BUTTON"
          ) {
            getCurrentWindow().startDragging();
          }
        }}
        className="flex items-center justify-between px-3 py-1.5 shrink-0 cursor-grab active:cursor-grabbing"
      >
        {/* 拖拽条指示器 */}
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-1 rounded-full bg-slate-400/50 dark:bg-slate-500/50" />
        </div>
        {/* 顶部按钮 */}
        <div className="flex items-center gap-1">
          <button className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors p-1.5 rounded-md hover:bg-slate-500/10 dark:hover:bg-slate-400/10">
            <Languages size={16} strokeWidth={1.8} />
          </button>
          <button className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors p-1.5 rounded-md hover:bg-slate-500/10 dark:hover:bg-slate-400/10">
            <Settings size={16} strokeWidth={1.8} />
          </button>
        </div>
      </header>

      {/* ========== Content ========== */}
      <div className="flex-1 flex flex-col gap-3 px-3 pb-3 min-h-0">
        {/* Output Card (上卡片) */}
        <div className="flex-1 min-h-0 relative flex flex-col rounded-2xl bg-white/80 dark:bg-slate-800/80 shadow-sm">
          <div className="flex-1 p-5 pr-12 overflow-y-auto custom-scrollbar">
            {translatedText ? (
              <p className="m-0 text-[15px] leading-7 text-slate-800 dark:text-slate-100 whitespace-pre-wrap">
                {translatedText}
              </p>
            ) : (
              <p className="m-0 text-[15px] text-slate-400 dark:text-slate-500 font-medium">
                翻译结果...
              </p>
            )}
          </div>

          {/* 复制按钮 */}
          <div className="absolute right-2 top-2">
            <button
              onClick={handleCopy}
              className={`p-2 rounded-lg transition-all ${
                copied
                  ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-700/50"
              }`}
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>
        </div>

        {/* Input Card (下卡片) */}
        <div
          className={`relative flex-1 min-h-0 flex flex-col rounded-2xl bg-white dark:bg-slate-800/80 shadow-sm transition-all duration-200 ${
            isInputFocused
              ? "ring-2 ring-blue-500/10 dark:ring-blue-400/20"
              : ""
          }`}
        >
          <div className="flex-1 p-5 pb-0">
            <textarea
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              placeholder="输入要翻译的内容..."
              className="w-full h-full bg-transparent resize-none outline-none text-[15px] leading-7 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
              spellCheck={false}
              autoFocus
            />
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        /* 深色模式滚动条 */
        @media (prefers-color-scheme: dark) {
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #475569;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #64748b;
          }
        }
      `}</style>
    </div>
  );
}

export default Translator;
