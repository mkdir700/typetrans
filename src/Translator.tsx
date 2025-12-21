import { useState, useEffect, useRef, useCallback } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { 
  Pin, 
  Settings, 
  ArrowRightLeft, 
  Sparkles, 
  Check, 
  Languages 
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "./lib/utils";

import { Button } from "./components/ui/button";
import { Textarea } from "./components/ui/textarea";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "./components/ui/dropdown-menu";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "./components/ui/tooltip";
import { ScrollArea } from "./components/ui/scroll-area";
import { Separator } from "./components/ui/separator";

// ============ Type Definitions ============
type Tone = "Formal" | "Casual" | "Academic" | "Creative";

interface Language {
  code: string;
  name: string;
}

type AppSettings = {
  active_engine?: string;
};

// ============ Constants ============
const LANGUAGES: Language[] = [
  { code: "zh", name: "Chinese" },
  { code: "en", name: "English" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
];

const TONES: Tone[] = ["Formal", "Casual", "Academic", "Creative"];

// ============ Sub-components ============

const ThinkingIndicator: React.FC = () => (
  <div className="flex items-center space-x-1 py-1">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"
        style={{ animationDelay: `${i * 0.15}s` }}
      />
    ))}
  </div>
);

// ============ Main Component ============
function Translator() {
  const { t } = useTranslation();
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [sourceLang, setSourceLang] = useState<Language>(LANGUAGES[0]);
  const [targetLang, setTargetLang] = useState<Language>(LANGUAGES[1]);
  const [currentTone, setCurrentTone] = useState<Tone>("Casual");
  const [isPinned, setIsPinned] = useState(false);
  const [activeEngine, setActiveEngine] = useState("zhipu");

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const translateRequestId = useRef(0);

  const updateSettings = useCallback(async () => {
    try {
      const settings = await invoke<AppSettings>("get_app_settings");
      setActiveEngine(settings.active_engine ?? "zhipu");
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    }
  }, []);

  useEffect(() => {
    updateSettings();
  }, [updateSettings]);

  // Adjust textarea height
  const adjustTextareaHeight = useCallback(() => {
    const textarea = inputRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    const newHeight = Math.min(textarea.scrollHeight, 120); // Max height limit
    textarea.style.height = `${Math.max(40, newHeight)}px`; // Min height 40px
  }, [inputText]);

  // Translation Logic
  const handleTranslate = useCallback(
    async (text: string) => {
      const requestId = ++translateRequestId.current;
      
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

        if (requestId === translateRequestId.current) {
          setTranslatedText(translation);
        }
      } catch (error) {
        if (requestId === translateRequestId.current) {
          setTranslatedText(`Error: ${error}`);
        }
      } finally {
        if (requestId === translateRequestId.current) {
          setIsTranslating(false);
        }
      }
    },
    [targetLang, currentTone]
  );

  // Debounced translation
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

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputText, adjustTextareaHeight]);

  const toggleLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setInputText(translatedText);
    setTranslatedText("");
  };

  // Global Shortcut Listener
  useEffect(() => {
    const unlisten = listen("global-shortcut-triggered", async () => {
      try {
        await updateSettings();
        await invoke("show_translator_window");
        setTimeout(() => inputRef.current?.focus(), 100);
      } catch (error) {
        console.error("Error showing window:", error);
      }
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, [updateSettings]);

  // Pin Toggle
  const handleTogglePin = async () => {
    const newPinState = !isPinned;
    setIsPinned(newPinState);
    try {
      await invoke("toggle_translator_pin", { pinned: newPinState });
    } catch {
      setIsPinned(!newPinState);
    }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === "Enter") {
        e.preventDefault();
        const text = translatedText || inputText;
        if (text) invoke("paste_translation", { text });
        return;
      }

      if (e.key === "Escape") {
        invoke("hide_translator_window");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [translatedText, inputText]);

  // Drag Handler
  const handleDrag = (e: React.MouseEvent) => {
     const target = e.target as HTMLElement;
     // Allow dragging only if not clicking interactive elements
     if (e.buttons === 1 && !target.closest("button") && !target.closest("[role='menuitem']")) {
       getCurrentWindow().startDragging();
     }
  };

  return (
    <div 
      className="h-screen w-screen flex flex-col p-1 bg-transparent"
    >
      <div 
        className={cn(
          "flex flex-col w-full h-full rounded-xl overflow-hidden shadow-2xl transition-all duration-300",
          "bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20 dark:border-slate-700/50"
        )}
      >
        {/* Header / Toolbar */}
        <div 
          className="flex items-center justify-between px-3 py-2 bg-white/50 dark:bg-slate-800/50 border-b border-black/5 dark:border-white/5 select-none cursor-grab active:cursor-grabbing"
          onMouseDown={handleDrag}
        >
          {/* Language Selector */}
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs font-semibold gap-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10">
                  <span className="uppercase">{sourceLang.code}</span>
                  <Languages size={12} className="opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[120px]">
                {LANGUAGES.map((lang) => (
                  <DropdownMenuItem 
                    key={lang.code} 
                    onClick={() => setSourceLang(lang)}
                    className="gap-2 text-xs"
                  >
                    <span className="w-4">{lang.code === sourceLang.code && <Check size={12} />}</span>
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
              onClick={toggleLanguages}
            >
              <ArrowRightLeft size={12} className="opacity-60" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2 text-xs font-semibold gap-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10">
                  <span className="uppercase">{targetLang.code}</span>
                  <Languages size={12} className="opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[120px]">
                {LANGUAGES.map((lang) => (
                  <DropdownMenuItem 
                    key={lang.code} 
                    onClick={() => setTargetLang(lang)}
                     className="gap-2 text-xs"
                  >
                    <span className="w-4">{lang.code === targetLang.code && <Check size={12} />}</span>
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1">
            {activeEngine !== "tencent" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 px-2 gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground hover:text-primary">
                    <Sparkles size={11} />
                    {currentTone}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {TONES.map((tone) => (
                    <DropdownMenuItem 
                      key={tone} 
                      onClick={() => setCurrentTone(tone)}
                      className="gap-2 text-xs"
                    >
                      <span className="w-4">{tone === currentTone && <Check size={12} />}</span>
                      {t(`tones.${tone}.label`, tone)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn(
                      "h-7 w-7 transition-all duration-300", 
                      isPinned ? "text-primary bg-primary/10 hover:bg-primary/20" : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10"
                    )}
                    onClick={handleTogglePin}
                  >
                    <Pin size={13} className={cn(isPinned && "fill-current")} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom"><p className="text-xs">Always on Top</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 text-muted-foreground hover:bg-black/5 dark:hover:bg-white/10"
              onClick={() => invoke("show_main_window")}
            >
              <Settings size={13} />
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col p-3 gap-2 overflow-hidden">
            <Textarea 
              ref={inputRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={t("translator.placeholder", "Type to translate...")}
              spellCheck={false}
              className={cn(
                "min-h-[40px] w-full resize-none border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 p-1 bg-transparent",
                "text-lg font-medium leading-relaxed placeholder:text-muted-foreground/40",
                "custom-scrollbar"
              )}

              autoFocus
            />

            {(isTranslating || translatedText) && (
              <div 
                className="animate-in fade-in slide-in-from-top-2 duration-300"
              >
                 <Separator className="my-2 bg-gradient-to-r from-transparent via-border to-transparent opacity-50" />
                 
                 <div className="relative">
                    {/* Visual bar */}
                    <div className={cn(
                        "absolute left-0 top-1 bottom-1 w-0.5 rounded-full transition-all",
                        isTranslating ? "bg-primary animate-pulse" : "bg-primary/50"
                    )} />

                    <ScrollArea className="h-full w-full pl-3 pr-1 max-h-[200px]">
                      <div className="text-sm font-medium leading-relaxed text-primary/90 dark:text-blue-100 whitespace-pre-wrap py-1">
                        {isTranslating && !translatedText ? (
                          <ThinkingIndicator />
                        ) : (
                          translatedText
                        )}
                      </div>
                    </ScrollArea>
                 </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default Translator;
