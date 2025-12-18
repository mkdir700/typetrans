import { useState, useEffect, useRef, useCallback } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Settings, Copy, Check } from "lucide-react";
import { useTranslation } from "react-i18next";

// ============ 类型定义 ============
type Tone = "Formal" | "Casual" | "Academic" | "Creative";

interface Language {
  code: string;
  name: string;
}

// ============ 常量 ============
const LANGUAGES: Language[] = [
  { code: "zh", name: "中" },
  { code: "en", name: "EN" },
  { code: "ja", name: "JA" },
  { code: "ko", name: "KO" },
];

const TONES: { id: Tone; color: string }[] = [
  { id: "Formal", color: "from-blue-500 to-indigo-600" },
  { id: "Casual", color: "from-orange-400 to-red-500" },
  { id: "Academic", color: "from-emerald-500 to-teal-600" },
  { id: "Creative", color: "from-purple-500 to-pink-600" },
];

// ============ 子组件 ============

// Thinking 加载指示器
const ThinkingIndicator: React.FC<{ label?: string; color?: string }> = ({
  label,
  color = "bg-blue-400",
}) => (
  <div className="flex space-x-1.5 items-center px-1">
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`w-1.5 h-1.5 ${color} rounded-full animate-bounce`}
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
    {label && (
      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">
        {label}
      </span>
    )}
  </div>
);

// 工具栏组件
const Toolbar: React.FC<{
  sourceLang: Language;
  targetLang: Language;
  onSetSource: (lang: Language) => void;
  onSetTarget: (lang: Language) => void;
  onSwitchLanguages: () => void;
  currentTone: Tone;
  onSetTone: (tone: Tone) => void;
  onSettingsClick: () => void;
}> = ({
  sourceLang,
  targetLang,
  onSetSource,
  onSetTarget,
  onSwitchLanguages,
  currentTone,
  onSetTone,
  onSettingsClick,
}) => {
  const [showSourceMenu, setShowSourceMenu] = useState(false);
  const [showTargetMenu, setShowTargetMenu] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  const handleSwitch = () => {
    setIsRotating(true);
    onSwitchLanguages();
    setTimeout(() => setIsRotating(false), 400);
  };

  const { t } = useTranslation();

  return (
    <div
      className="flex items-center justify-between px-4 py-3 gap-3 border-b border-white/20 dark:border-slate-700/30 bg-white/40 dark:bg-slate-800/40 rounded-t-[1.5rem] relative cursor-grab active:cursor-grabbing"
      onMouseDown={(e) => {
        const target = e.target as HTMLElement | null;
        if (e.buttons === 1 && !target?.closest("button")) {
          getCurrentWindow().startDragging();
        }
      }}
    >
      {/* 语言切换胶囊 */}
      <div className="flex items-center p-1 bg-slate-200/40 dark:bg-slate-700/40 backdrop-blur-md rounded-xl border border-white/50 dark:border-slate-600/30 shadow-inner">
        <div className="relative">
          <button
            onClick={() => setShowSourceMenu(!showSourceMenu)}
            className="px-2 py-1 rounded hover:bg-white/10 transition-all text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest"
          >
            {sourceLang.name}
          </button>
          {showSourceMenu && (
            <div className="absolute left-0 top-9 grid grid-cols-2 gap-1 p-1.5 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-600/50 rounded-xl shadow-2xl z-[60] animate-fade-in-up">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    onSetSource(lang);
                    setShowSourceMenu(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                    sourceLang.code === lang.code
                      ? "bg-blue-500 text-white"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleSwitch}
          className={`mx-1 p-1 rounded-full hover:bg-white/10 transition-all duration-300 transform ${
            isRotating ? "rotate-180 scale-110" : "rotate-0"
          }`}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-slate-500 opacity-60"
          >
            <path d="m18 8 4 4-4 4M2 12h20M6 8l-4 4 4 4" />
          </svg>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowTargetMenu(!showTargetMenu)}
            className="px-2 py-1 rounded hover:bg-white/10 transition-all text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest"
          >
            {targetLang.name}
          </button>
          {showTargetMenu && (
            <div className="absolute right-0 top-9 grid grid-cols-2 gap-1 p-1.5 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-600/50 rounded-xl shadow-2xl z-[60] animate-fade-in-up">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    onSetTarget(lang);
                    setShowTargetMenu(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                    targetLang.code === lang.code
                      ? "bg-blue-500 text-white"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 语气选择胶囊 */}
      <div className="flex items-center space-x-2">
        <div className="relative group/tone">
          <button
            className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-lg border border-white/20 dark:border-slate-700/50 bg-white/10 dark:bg-slate-800/20 backdrop-blur-md transition-all hover:bg-white/20 dark:hover:bg-slate-700/40 active:scale-95`}
          >
            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              {t(`tones.${currentTone}.label`)}
            </span>
            <svg
              width="8"
              height="8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-slate-400 group-hover/tone:translate-y-0.5 transition-transform"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {/* 悬浮菜单 */}
          <div className="absolute top-full right-0 mt-2 p-1 bg-white/95 dark:bg-slate-800/95 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-700/50 rounded-xl shadow-2xl z-[70] opacity-0 invisible group-hover/tone:opacity-100 group-hover/tone:visible transition-all duration-200 transform origin-top-right scale-95 group-hover/tone:scale-100 min-w-[100px]">
            <div className="flex flex-col space-y-0.5">
              {TONES.map((tone) => (
                <button
                  key={tone.id}
                  title={t(`tones.${tone.id}.description`)}
                  onClick={() => onSetTone(tone.id)}
                  className={`flex items-center px-2 py-1.5 rounded-lg transition-all ${
                    currentTone === tone.id
                      ? "bg-slate-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400"
                      : "hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <span
                    className={`text-[9.5px] font-bold uppercase tracking-wider ${
                      currentTone === tone.id ? "text-blue-600 dark:text-blue-400" : "text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    {t(`tones.${tone.id}.label`)}
                  </span>
                  {currentTone === tone.id && (
                    <div className="ml-auto pl-2">
                      <Check size={8} strokeWidth={4} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 设置按钮 */}
        <button
          onClick={onSettingsClick}
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors p-1.5 rounded-lg hover:bg-slate-500/10 dark:hover:bg-slate-400/10"
          aria-label="Settings"
        >
          <Settings size={15} strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
};

// ============ 主组件 ============
function Translator() {
  const { t } = useTranslation();
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [sourceLang, setSourceLang] = useState<Language>(LANGUAGES[0]);
  const [targetLang, setTargetLang] = useState<Language>(LANGUAGES[1]);
  const [currentTone, setCurrentTone] = useState<Tone>("Casual");
  const [copied, setCopied] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // 引用与防抖
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 翻译处理函数
  const handleTranslate = useCallback(
    async (text: string) => {
      if (!text.trim()) {
        setTranslatedText("");
        setIsTranslating(false);
        return;
      }

      setIsTranslating(true);

      try {
        const translation = await invoke<string>("get_translation", {
          text: text,
          targetLang: targetLang.code.toUpperCase(),
          tone: currentTone,
        });
        setTranslatedText(translation);
      } catch (error) {
        console.error("Translation error:", error);
        setTranslatedText(`Error: ${error}`);
      } finally {
        setIsTranslating(false);
      }
    },
    [targetLang, currentTone]
  );

  // 1. 实时翻译逻辑（防抖）
  useEffect(() => {
    if (!inputText.trim()) {
      setTranslatedText("");
      setIsTranslating(false);
      return;
    }

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      handleTranslate(inputText);
    }, 500);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [inputText, handleTranslate]);

  // 语言切换
  const toggleLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    if (translatedText) {
      setInputText(translatedText);
      setTranslatedText("");
    }
  };

  // 2. 监听全局快捷键
  useEffect(() => {
    const unlisten = listen("global-shortcut-triggered", async () => {
      try {
        await invoke("show_translator_window");
        try {
          const selectedText = await invoke<string>("get_selected_text");
          if (selectedText?.trim()) setInputText(selectedText);
        } catch (error) {
          console.warn("Failed to get selected text:", error);
        }
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

  // 打开设置窗口
  const handleSettingsClick = async () => {
    try {
      await invoke("show_settings_window");
    } catch (error) {
      console.error("Error showing settings window:", error);
    }
  };

  return (
    // 圆角窗口容器 - 使用原生 vibrancy 模糊效果
    <div
      className="h-screen w-screen overflow-hidden flex flex-col font-['Inter','Noto_Sans_SC',sans-serif] select-none rounded-2xl"
      style={{
        background: "transparent",
      }}
    >
      {/* ========== 玻璃态主容器 ========== */}
      <div
        className={`flex-1 flex flex-col glass-container rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] transition-all duration-500 overflow-hidden ${
          isInputFocused ? "ring-2 ring-blue-500/20 dark:ring-blue-400/30" : ""
        }`}
      >
        {/* ========== 工具栏 ========== */}
        <Toolbar
          sourceLang={sourceLang}
          targetLang={targetLang}
          onSetSource={setSourceLang}
          onSetTarget={setTargetLang}
          onSwitchLanguages={toggleLanguages}
          currentTone={currentTone}
          onSetTone={setCurrentTone}
          onSettingsClick={handleSettingsClick}
        />

        {/* ========== 内容区域 ========== */}
        <div className="flex-1 flex flex-col p-5 min-h-0 overflow-hidden">
          {/* 输入区域 */}
          <div className="relative mb-4">
            <textarea
              ref={inputRef}
              value={inputText}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t("translator.placeholder")}
              className="w-full bg-transparent resize-none border-none outline-none focus:outline-none focus:ring-0 text-slate-800 dark:text-slate-100 font-semibold text-xl min-h-[80px] placeholder:text-slate-300 dark:placeholder:text-slate-500 transition-all caret-blue-500 no-scrollbar leading-relaxed"
              spellCheck={false}
              autoFocus
            />
          </div>

          {/* ========== AI 翻译输出流 ========== */}
          {(isTranslating || translatedText) && (
            <div className="flex animate-fade-in-up flex-1 min-h-0 overflow-hidden">
              {/* 视觉流动线指示器 */}
              <div className="mr-4 flex flex-col items-center shrink-0">
                <div
                  className={`w-[3px] flex-1 rounded-full transition-all duration-700 ${
                    isTranslating
                      ? "bg-gradient-to-b from-blue-400 via-blue-200 to-blue-400 bg-[length:100%_200%] animate-[gradient_2s_linear_infinite]"
                      : "bg-slate-200/50 dark:bg-slate-600/50"
                  }`}
                />
              </div>

              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {/* 翻译结果层 */}
                <div className="relative flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-8">
                  <div className="text-blue-600 dark:text-blue-400 font-medium text-lg leading-relaxed min-h-[1.75rem]">
                    {isTranslating && !translatedText ? (
                      <ThinkingIndicator label={t("translator.translating")} />
                    ) : (
                      <span className="whitespace-pre-wrap">
                        {translatedText}
                      </span>
                    )}
                  </div>
                </div>

                {/* 复制按钮 */}
                {translatedText && !isTranslating && (
                  <div className="flex justify-end pt-3 shrink-0">
                    <button
                      onClick={handleCopy}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all transform hover:scale-105 active:scale-95 ${
                        copied
                          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30"
                          : "bg-slate-900 dark:bg-slate-700 hover:bg-black dark:hover:bg-slate-600 text-white shadow-xl shadow-slate-200 dark:shadow-slate-900/50"
                      }`}
                    >
                      {copied ? (
                        <>
                          <Check size={14} />
                          <span className="text-[11px] font-black uppercase tracking-widest">
                            {t("common.copied")}
                          </span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span className="text-[11px] font-black uppercase tracking-widest">
                            {t("common.copy")}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ========== 底部状态栏 ========== */}
        <div className="px-5 py-3 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center border-t border-slate-100/50 dark:border-slate-700/30 shrink-0">
          <div className="flex items-center space-x-4">
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-black tracking-widest uppercase">
                {t("common.characters")}
              </span>
              <span className="text-[11px] text-slate-600 dark:text-slate-300 font-bold uppercase">
                {inputText.length}
              </span>
            </div>
            <div className="w-px h-5 bg-slate-200 dark:bg-slate-600"></div>
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-black tracking-widest uppercase">
                {t("common.tone")}
              </span>
              <span className="text-[11px] text-slate-600 dark:text-slate-300 font-bold uppercase">
                {t(`tones.${currentTone}.label`)}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-slate-400/60 dark:text-slate-500/60">
            <kbd className="px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[10px] font-black shadow-sm">
              ⌘
            </kbd>
            <kbd className="px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[10px] font-black shadow-sm">
              ⌥
            </kbd>
            <kbd className="px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[10px] font-black shadow-sm">
              T
            </kbd>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Translator;
