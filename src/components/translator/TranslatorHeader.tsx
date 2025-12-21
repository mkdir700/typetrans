import { useTranslation } from "react-i18next";
import { 
  Check, 
  ArrowRightLeft, 
  Sparkles, 
  Pin, 
  Settings 
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "../ui/dropdown-menu";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "../ui/tooltip";
import { Language, Tone, LANGUAGES, TONES } from "../../hooks/useTranslatorState";

interface TranslatorHeaderProps {
  sourceLang: Language;
  setSourceLang: (lang: Language) => void;
  targetLang: Language;
  setTargetLang: (lang: Language) => void;
  toggleLanguages: () => void;
  currentTone: Tone;
  setCurrentTone: (tone: Tone) => void;
  activeEngine: string;
  isPinned: boolean;
  handleTogglePin: () => void;
  openSettings: () => void;
  handleDrag: (e: React.MouseEvent) => void;
}

export const TranslatorHeader: React.FC<TranslatorHeaderProps> = ({
  sourceLang,
  setSourceLang,
  targetLang,
  setTargetLang,
  toggleLanguages,
  currentTone,
  setCurrentTone,
  activeEngine,
  isPinned,
  handleTogglePin,
  openSettings,
  handleDrag
}) => {
  const { t } = useTranslation();

  return (
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
          onClick={openSettings}
        >
          <Settings size={13} />
        </Button>
      </div>
    </div>
  );
};
