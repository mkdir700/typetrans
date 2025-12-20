import { useState, useEffect, useRef, useCallback } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Pin, Check } from "lucide-react";
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
  <div className="flex space-x-1 items-center px-0.5">
    <div className="flex space-x-0.5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`w-1 h-1 ${color} rounded-full animate-bounce`}
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
    {label && (
      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest ml-1">
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
  isPinned: boolean;
  onTogglePin: () => void;
}> = ({
  sourceLang,
  targetLang,
  onSetSource,
  onSetTarget,
  onSwitchLanguages,
  currentTone,
  onSetTone,
  isPinned,
  onTogglePin,
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
      className="flex items-center justify-between px-3 py-2 gap-2 border-b border-white/20 dark:border-slate-700/30 bg-white/40 dark:bg-slate-800/40 rounded-t-xl relative cursor-grab active:cursor-grabbing"
      onMouseDown={(e) => {
        const target = e.target as HTMLElement | null;
        if (e.buttons === 1 && !target?.closest("button")) {
          getCurrentWindow().startDragging();
        }
      }}
    >
      {/* 语言切换胶囊 */}
      <div className="flex items-center p-0.5 bg-slate-200/40 dark:bg-slate-700/40 backdrop-blur-md rounded-lg border border-white/50 dark:border-slate-600/30 shadow-inner">
        <div className="relative">
          <button
            onClick={() => setShowSourceMenu(!showSourceMenu)}
            className="px-1.5 py-0.5 rounded hover:bg-white/10 transition-all text-[10px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest"
          >
            {sourceLang.name}
          </button>
          {showSourceMenu && (
            <div className="absolute left-0 top-7 grid grid-cols-2 gap-0.5 p-1 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-600/50 rounded-lg shadow-2xl z-60 animate-fade-in-up">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    onSetSource(lang);
                    setShowSourceMenu(false);
                  }}
                  className={`px-2 py-1 rounded text-[9px] font-bold transition-all ${
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
          className={`mx-0.5 p-0.5 rounded-full hover:bg-white/10 transition-all duration-300 transform ${
            isRotating ? "rotate-180 scale-110" : "rotate-0"
          }`}
        >
          <svg
            width="8"
            height="8"
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
            className="px-1.5 py-0.5 rounded hover:bg-white/10 transition-all text-[10px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-widest"
          >
            {targetLang.name}
          </button>
          {showTargetMenu && (
            <div className="absolute right-0 top-7 grid grid-cols-2 gap-0.5 p-1 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-600/50 rounded-lg shadow-2xl z-60 animate-fade-in-up">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    onSetTarget(lang);
                    setShowTargetMenu(false);
                  }}
                  className={`px-2 py-1 rounded text-[9px] font-bold transition-all ${
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
      <div className="flex items-center space-x-1.5">
        <div className="relative group/tone">
          <button
            className={`flex items-center space-x-1 px-1.5 py-1 rounded-lg border border-white/20 dark:border-slate-700/50 bg-white/10 dark:bg-slate-800/20 backdrop-blur-md transition-all hover:bg-white/20 dark:hover:bg-slate-700/40 active:scale-95`}
          >
            <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              {t(`tones.${currentTone}.label`)}
            </span>
            <svg
              width="6"
              height="6"
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
          <div className="absolute top-full right-0 mt-1.5 p-0.5 bg-white/95 dark:bg-slate-800/95 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-700/50 rounded-lg shadow-2xl z-70 opacity-0 invisible group-hover/tone:opacity-100 group-hover/tone:visible transition-all duration-200 transform origin-top-right scale-95 group-hover/tone:scale-100 min-w-[80px]">
            <div className="flex flex-col space-y-0.5">
              {TONES.map((tone) => (
                <button
                  key={tone.id}
                  title={t(`tones.${tone.id}.description`)}
                  onClick={() => onSetTone(tone.id)}
                  className={`flex items-center px-1.5 py-1 rounded transition-all ${
                    currentTone === tone.id
                      ? "bg-slate-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400"
                      : "hover:bg-slate-50 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-400"
                  }`}
                >
                  <span
                    className={`text-[8px] font-bold uppercase tracking-wider ${
                      currentTone === tone.id
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    {t(`tones.${tone.id}.label`)}
                  </span>
                  {currentTone === tone.id && (
                    <div className="ml-auto pl-1.5">
                      <Check size={6} strokeWidth={4} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Pin 按钮 */}
        <button
          onClick={onTogglePin}
          className={`transition-colors p-1 rounded-lg hover:bg-slate-500/10 dark:hover:bg-slate-400/10 ${
            isPinned
              ? "text-blue-600 dark:text-blue-400"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
          aria-label="Toggle Pin"
        >
          <Pin
            size={12}
            strokeWidth={1.8}
            className={isPinned ? "fill-current" : ""}
          />
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
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  console.log(
    `[Translator] Rendering with state: inputTextLen=${
      inputText.length
    }, translatedTextLen=${
      translatedText.length
    }, isTranslating=${isTranslating}, translatedText="${translatedText.substring(
      0,
      50
    )}"`
  );

  // 引用与防抖
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 用于取消过期的翻译请求
  const translateRequestId = useRef(0);

  // 自动调整 textarea 高度
  const adjustTextareaHeight = useCallback(() => {
    const textarea = inputRef.current;
    if (!textarea) return;

    // 行高 24px (text-base + leading-6)
    const lineHeight = 24;
    const hasTranslation = isTranslating || translatedText;
    const maxLines = hasTranslation ? 2 : 4; // 有翻译时最多2行，否则4行
    const maxHeight = lineHeight * maxLines;

    // 重置为最小高度来获取真实的 scrollHeight
    textarea.style.height = `${lineHeight}px`;

    // 计算需要的高度（scrollHeight 会包含实际内容高度）
    const scrollHeight = textarea.scrollHeight;
    const newHeight = Math.min(scrollHeight, maxHeight);

    textarea.style.height = `${newHeight}px`;
    // 超出最大高度时显示滚动条
    textarea.style.overflowY = scrollHeight > maxHeight ? "auto" : "hidden";
  }, [isTranslating, translatedText]);

  // 翻译处理函数
  const handleTranslate = useCallback(
    async (text: string) => {
      // 生成新的请求 ID，用于判断是否过期
      const requestId = ++translateRequestId.current;
      console.log(
        "[handleTranslate] Called with text:",
        text.substring(0, 50) + "...",
        "requestId:",
        requestId
      );

      if (!text.trim()) {
        console.log("[handleTranslate] Empty text, clearing translation");
        setTranslatedText("");
        setIsTranslating(false);
        return;
      }

      console.log("[handleTranslate] Setting isTranslating to true");
      setIsTranslating(true);

      try {
        console.log("[handleTranslate] Invoking get_translation with:", {
          textLength: text.length,
          targetLang: targetLang.code.toUpperCase(),
          tone: currentTone,
          requestId,
        });

        const translation = await invoke<string>("get_translation", {
          text: text,
          targetLang: targetLang.code.toUpperCase(),
          tone: currentTone,
        });

        // 检查这个请求是否仍然有效（没有被新请求取代）
        if (requestId !== translateRequestId.current) {
          console.log(
            "[handleTranslate] Request outdated, ignoring result. requestId:",
            requestId,
            "current:",
            translateRequestId.current
          );
          return;
        }

        console.log(
          "[handleTranslate] Translation received:",
          translation?.substring(0, 100) || "(empty)",
          "requestId:",
          requestId
        );
        setTranslatedText(translation);
        console.log("[handleTranslate] State updated with translation");
      } catch (error) {
        console.error(
          "[handleTranslate] Translation error:",
          error,
          "requestId:",
          requestId
        );
        // 只有当请求仍然有效时才显示错误
        if (requestId === translateRequestId.current) {
          setTranslatedText(`Error: ${error}`);
        }
      } finally {
        // 只有当请求仍然有效时才更新 isTranslating 状态
        if (requestId === translateRequestId.current) {
          console.log(
            "[handleTranslate] Setting isTranslating to false, requestId:",
            requestId
          );
          setIsTranslating(false);
        }
      }
    },
    [targetLang, currentTone]
  );

  // 1. 实时翻译逻辑（防抖）
  useEffect(() => {
    console.log(
      "[useEffect:inputText] Input text changed, length:",
      inputText.length
    );

    if (!inputText.trim()) {
      console.log("[useEffect:inputText] Empty input, clearing translation");
      setTranslatedText("");
      setIsTranslating(false);
      // 取消任何正在进行的请求
      translateRequestId.current++;
      return;
    }

    if (debounceTimer.current) {
      console.log("[useEffect:inputText] Clearing existing debounce timer");
      clearTimeout(debounceTimer.current);
    }

    console.log("[useEffect:inputText] Setting new debounce timer (500ms)");
    debounceTimer.current = setTimeout(() => {
      console.log(
        "[useEffect:inputText] Debounce timer fired, calling handleTranslate"
      );
      handleTranslate(inputText);
    }, 500);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [inputText, handleTranslate]);

  // 监听内容变化，自动调整 textarea 高度
  useEffect(() => {
    adjustTextareaHeight();
  }, [inputText, isTranslating, translatedText, adjustTextareaHeight]);

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
        setTimeout(() => inputRef.current?.focus(), 100);
      } catch (error) {
        console.error("Error showing window:", error);
      }
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  // Toggle pin (always-on-top)
  const handleTogglePin = async () => {
    const newPinState = !isPinned;
    setIsPinned(newPinState);
    try {
      await invoke("toggle_translator_pin", { pinned: newPinState });
    } catch (error) {
      console.error("Error toggling pin:", error);
      // Revert state on error
      setIsPinned(!newPinState);
    }
  };

  // ESC key to close window
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        invoke("hide_translator_window").catch((err: unknown) =>
          console.error("Error hiding window:", err)
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    // 圆角窗口容器 - 使用原生 vibrancy 模糊效果
    <div
      className="h-screen w-screen overflow-hidden flex flex-col font-['Inter','Noto_Sans_SC',sans-serif] select-none rounded-xl"
      style={{
        background: "transparent",
      }}
    >
      {/* ========== 玻璃态主容器 ========== */}
      <div
        className={`flex-1 flex flex-col glass-container rounded-xl shadow-[0_12px_40px_-10px_rgba(0,0,0,0.1)] transition-all duration-500 overflow-hidden ${
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
          isPinned={isPinned}
          onTogglePin={handleTogglePin}
        />

        {/* ========== 内容区域 ========== */}
        <div className="flex-1 flex flex-col p-3 min-h-0 overflow-hidden">
          {/* 输入区域 - 自动调整高度 */}
          <div className="relative shrink-0">
            <textarea
              ref={inputRef}
              value={inputText}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t("translator.placeholder")}
              className="w-full bg-transparent resize-none border-none outline-none focus:outline-none focus:ring-0 text-slate-800 dark:text-slate-100 font-semibold text-base placeholder:text-slate-300 dark:placeholder:text-slate-500 caret-blue-500 leading-6 p-0 m-0 custom-scrollbar"
              style={{
                height: "24px", // 初始单行高度
                transition: "height 0.1s ease-out",
              }}
              spellCheck={false}
              autoFocus
            />
          </div>

          {/* ========== AI 翻译输出流 ========== */}
          {(isTranslating || translatedText) && (
            <div className="flex animate-fade-in-up mt-2 pt-2 border-t border-slate-200/30 dark:border-slate-600/30">
              {/* 视觉流动线指示器 */}
              <div className="mr-2.5 flex flex-col items-stretch shrink-0">
                <div
                  className={`w-0.5 rounded-full transition-all duration-700 ${
                    isTranslating
                      ? "bg-linear-to-b from-blue-400 via-blue-200 to-blue-400 bg-size-[100%_200%] animate-[gradient_2s_linear_infinite]"
                      : "bg-slate-200/50 dark:bg-slate-600/50"
                  }`}
                  style={{ minHeight: "20px" }}
                />
              </div>

              <div className="flex-1">
                {/* 翻译结果层 - 最大5行，超出滚动 */}
                <div
                  className="overflow-y-auto custom-scrollbar pr-2 text-blue-600 dark:text-blue-400 font-medium text-sm leading-5"
                  style={{ maxHeight: "100px" }} // 5行 x 20px行高
                >
                  {isTranslating && !translatedText ? (
                    <ThinkingIndicator label={t("translator.translating")} />
                  ) : (
                    <span className="whitespace-pre-wrap">
                      {translatedText}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Translator;
